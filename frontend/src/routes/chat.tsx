import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bot, LoaderCircle, SendHorizontal, Sparkles, User, Plus, Home, Trash2, Eraser } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { backendAnswerStyleToFrontend, sendChatMessage, getAllBots, getMessagesForBot, clearMessagesForBot, deleteBot } from "@/lib/api";
import { useQuillCraftStore } from "@/lib/quillcraft-store";
import type { ChatMessage } from "@/lib/quillcraft-types";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Bot | QuillCraft" },
      {
        name: "description",
        content: "Chat with your QuillCraft bot and see confidence indicators and responses.",
      },
      { property: "og:title", content: "Chat with Bot | QuillCraft" },
      {
        property: "og:description",
        content: "Preview educational bot responses and confidence.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const navigate = useNavigate({ from: "/chat" });
  const { botConfig, botId, messages, setMessages, setBotConfig, setBotId, resetBot } = useQuillCraftStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingBots, setLoadingBots] = useState(true);
  const [savedBots, setSavedBots] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  
  // Select mode and selected bots
  const [selectMode, setSelectMode] = useState(false);
  const [selectedBotIds, setSelectedBotIds] = useState<Set<string>>(new Set());

  const handleCreateNewBot = () => {
    resetBot();
    navigate({ to: "/build" });
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load all bots
  useEffect(() => {
    const loadBots = async () => {
      try {
        const bots = await getAllBots();
        setSavedBots(bots);
        if (!botId && bots.length > 0) {
          selectBot(bots[0].id, bots[0]);
        }
      } catch (error) {
        console.error("Failed to load bots:", error);
      } finally {
        setLoadingBots(false);
      }
    };
    loadBots();
  }, []);

  // Select bot
  const selectBot = async (id: string, botData: any) => {
    setBotId(id);
    setBotConfig({
      botName: botData.name,
      roleSubject: botData.role,
      personality: botData.personality,
      answerStyle: backendAnswerStyleToFrontend(botData.answer_style),
      rules: botData.rules,
    });
    setSendError(null);
    
    try {
      const dbMessages = await getMessagesForBot(id);
      const chatMessages: ChatMessage[] = dbMessages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        confidence: msg.confidence,
        confidenceSource: msg.confidence_source,
        createdAt: Date.now(),
      }));
      setMessages(chatMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  // Clear bot history
  const handleClearHistory = async (id: string) => {
    try {
      await clearMessagesForBot(id);
      if (botId === id) {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  // Delete selected bots
  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedBotIds) {
        await deleteBot(id);
      }
      // Update saved bots list
      const remainingBots = savedBots.filter((bot) => !selectedBotIds.has(bot.id));
      setSavedBots(remainingBots);
      // If current bot was deleted, select first remaining or clear
      if (botId && selectedBotIds.has(botId)) {
        if (remainingBots.length > 0) {
          selectBot(remainingBots[0].id, remainingBots[0]);
        } else {
          resetBot();
        }
      }
      // Reset select mode
      setSelectMode(false);
      setSelectedBotIds(new Set());
    } catch (error) {
      console.error("Failed to delete bots:", error);
    }
  };

  // Toggle bot selection
  const toggleBotSelection = (id: string) => {
    const newSelected = new Set(selectedBotIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBotIds(newSelected);
  };

  // Load bots again (helper function for after actions)
  const refreshBots = async () => {
    try {
      const bots = await getAllBots();
      setSavedBots(bots);
    } catch (error) {
      console.error("Failed to load bots:", error);
    }
  };

  const configSummary = useMemo(() => {
    if (!botConfig) {
      return null;
    }
    return [
      `${botConfig.roleSubject}`,
      `${botConfig.personality}`,
      botConfig.answerStyle === "hints-first" ? "Hints First" : "Direct Answers",
    ].join(" • ");
  }, [botConfig]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!botConfig || !botId || !input.trim() || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setSendError(null);

    try {
      const response = await sendChatMessage(botId, userMessage.content, messages);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        confidence: response.confidence,
        confidenceSource: response.confidenceSource,
        createdAt: Date.now(),
      };
      setMessages([...nextMessages, assistantMessage]);
    } catch (err) {
      console.error("Error sending chat:", err);
      setSendError(err instanceof Error ? err.message : "Message failed to send. Please try again.");
      setMessages(nextMessages);
    } finally {
      setIsSending(false);
    }
  }

  if (!botConfig || !botId) {
    return (
      <div className="relative flex h-full items-center justify-center overflow-hidden bg-background p-4">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div
              style={{
                backgroundImage: "radial-gradient(var(--color-primary) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
              className="absolute inset-0"
            />
          </div>

          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="border-border/70 bg-card/80 backdrop-blur-xl shadow-elevated rounded-3xl p-8 max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-16 w-16 mx-auto mb-6 rounded-full bg-primary/12 flex items-center justify-center"
            >
              <img src="/favicon.svg" alt="QuillCraft" className="h-10 w-10" />
            </motion.div>
            <h2 className="font-display text-3xl leading-none mb-3 text-foreground">
              {loadingBots ? "Loading bots..." : "No bot selected"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {loadingBots ? "Please wait while we load your saved bots." : "Create a bot first or select one from your saved list."}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="h-12 rounded-full px-7 text-sm font-semibold"
                onClick={handleCreateNewBot}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Bot
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            style={{
              backgroundImage: "radial-gradient(var(--color-primary) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
            className="absolute inset-0"
          />
        </div>
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 top-0 h-80 w-80 rounded-full bg-primary/8 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-accent/8 blur-3xl"
        />
      </div>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-72 border-r border-border bg-muted/20 backdrop-blur-md flex flex-col relative z-10"
          >
            <div className="p-4 border-b border-border bg-card/60">
              <Link to="/" className="inline-flex items-center gap-3 mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 overflow-hidden">
                  <img src="/favicon.svg" alt="QuillCraft" className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-display text-lg leading-none text-foreground">QuillCraft</p>
                </div>
              </Link>
              <div className="flex flex-col gap-2">
                {!selectMode ? (
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        asChild
                        size="sm"
                        className="w-full h-10 rounded-full text-sm font-semibold"
                      >
                        <Link to="/build" onClick={handleCreateNewBot} className="flex items-center justify-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create New Bot
                        </Link>
                      </Button>
                    </motion.div>
                    {savedBots.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectMode(true)}
                        className="h-10 rounded-full"
                      >
                        Select
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectMode(false);
                        setSelectedBotIds(new Set());
                      }}
                      className="h-10 rounded-full flex-1"
                    >
                      Cancel
                    </Button>
                    {selectedBotIds.size > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-10 rounded-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete {selectedBotIds.size} selected bot{selectedBotIds.size > 1 ? 's' : ''} and all of their chat history. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loadingBots ? (
                <div className="flex items-center justify-center py-8">
                  <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : savedBots.length === 0 ? (
                <div className="text-center py-8 px-4 text-muted-foreground text-sm">
                  No saved bots yet. Create your first bot to get started!
                </div>
              ) : (
                savedBots.map((bot, idx) => (
                  <motion.div
                    key={bot.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left rounded-xl transition-all duration-200 ${
                      botId === bot.id
                        ? "bg-primary/15 border border-primary/30 shadow-md"
                        : "bg-card/50 border border-border/60 hover:bg-muted hover:border-border hover:shadow-sm"
                    }`}
                  >
                    {selectMode ? (
                      <div className="flex items-center gap-3 p-3">
                        <Checkbox
                          checked={selectedBotIds.has(bot.id)}
                          onCheckedChange={() => toggleBotSelection(bot.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="h-10 w-10 rounded-full bg-primary/12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img src="/favicon.svg" alt="Bot" className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{bot.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{bot.role}</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => selectBot(bot.id, bot)}
                        className="w-full p-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src="/favicon.svg" alt="Bot" className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground text-sm truncate">{bot.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{bot.role}</p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eraser className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all chat history for {bot.name}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleClearHistory(bot.id)}>
                                  Clear History
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar */}
        <header className="border-b border-border bg-card/70 backdrop-blur-md px-4 py-3 flex items-center gap-3 relative z-20">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-10 w-10 rounded-full flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <line x1="9" x2="9" y1="3" y2="21" />
            </svg>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 overflow-hidden">
                <img src="/favicon.svg" alt={botConfig.botName} className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl sm:text-2xl leading-none tracking-tight text-foreground truncate">
                  {botConfig.botName}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {configSummary}
                </p>
              </div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 rounded-full text-xs font-semibold"
            >
              <Link to="/build" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Edit Bot
              </Link>
            </Button>
          </motion.div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="h-24 w-24 mx-auto mb-6 rounded-full bg-primary/12 flex items-center justify-center"
                >
                  <img src="/favicon.svg" alt="QuillCraft" className="h-14 w-14" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="font-display text-2xl leading-none mb-2 text-foreground"
                >
                  Welcome to QuillCraft!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto"
                >
                  Ask your first question to start the conversation with your AI tutor!
                </motion.p>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                  className="space-y-2"
                >
                  <div
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div className="flex items-start gap-3 max-w-[90%] lg:max-w-[80%]">
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-11 w-11 rounded-full bg-primary/12 flex items-center justify-center overflow-hidden">
                            <img src="/favicon.svg" alt="Bot" className="h-7 w-7" />
                          </div>
                        </div>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-5 py-3.5 shadow-lg"
                            : "bg-card border border-border rounded-2xl rounded-tl-md px-5 py-3.5 shadow-sm"
                        }
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: (props) => <h1 className="text-xl font-bold text-foreground mb-3 mt-4" {...props} />,
                                h2: (props) => <h2 className="text-lg font-bold text-foreground mb-2 mt-3" {...props} />,
                                h3: (props) => <h3 className="text-base font-bold text-foreground mb-1 mt-2" {...props} />,
                                p: (props) => <p className="text-sm sm:text-base text-foreground mb-3 last:mb-0" {...props} />,
                                ul: (props) => <ul className="list-disc pl-6 mb-3 last:mb-0 space-y-1" {...props} />,
                                ol: (props) => <ol className="list-decimal pl-6 mb-3 last:mb-0 space-y-1" {...props} />,
                                li: (props) => <li className="text-sm sm:text-base text-foreground" {...props} />,
                                strong: (props) => <strong className="font-bold text-foreground" {...props} />,
                                code: (props) => <code className="bg-muted px-2 py-1 rounded text-xs font-mono" {...props} />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm sm:text-base">{message.content}</p>
                        )}
                      </motion.div>
                      {message.role === "user" && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-11 w-11 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                            <User className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {message.role === "assistant" &&
                  typeof message.confidence === "number" ? (
                    <div className="pl-14 flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center rounded-full bg-primary/12 text-primary border border-primary/30 px-3.5 py-1.5 text-xs font-semibold"
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        Confidence {message.confidence}%
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                          message.confidenceSource === "ai"
                            ? "bg-accent/18 text-accent border border-accent/30"
                            : "bg-muted/60 text-muted-foreground border border-muted"
                        }`}
                      >
                        {message.confidenceSource === "ai" ? "AI Evaluated" : "Random Fallback"}
                      </Badge>
                    </div>
                  ) : null}
                </motion.div>
              ))
            )}

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 pl-14"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="h-11 w-11 rounded-full bg-primary/12 flex items-center justify-center overflow-hidden">
                    <img src="/favicon.svg" alt="Bot" className="h-7 w-7 animate-pulse" />
                  </div>
                </div>
                <div className="inline-flex items-center gap-3 rounded-2xl rounded-tl-md border border-border bg-card px-5 py-3.5 text-sm text-muted-foreground shadow-sm">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Thinking...
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 py-4 relative z-20">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message here..."
              className="h-12 sm:h-14 border-border bg-background text-sm sm:text-base text-foreground placeholder-muted-foreground rounded-full shadow-sm"
              disabled={isSending}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                size="lg"
                className="h-12 sm:h-14 rounded-full px-4 sm:px-6 text-sm font-semibold"
                disabled={!input.trim() || isSending}
              >
                {isSending ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <SendHorizontal className="h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
          {sendError ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto mt-3"
            >
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
                {sendError}
              </p>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
