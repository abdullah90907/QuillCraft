import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bot,
  LoaderCircle,
  SendHorizontal,
  Sparkles,
  User,
  Plus,
  Home,
  Trash2,
  Eraser,
  GitCompare,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ArrowRightLeft,
  Info,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormattedMessage } from "@/components/FormattedMessage";
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
import {
  backendAnswerStyleToFrontend,
  sendChatMessage,
  compareChatModels,
  factCheckMessage,
  getAllBots,
  getMessagesForBot,
  clearMessagesForBot,
  deleteBot,
} from "@/lib/api";
import { useQuillCraftStore } from "@/lib/quillcraft-store";
import type { ChatMessage, FactCheckResponse } from "@/lib/quillcraft-types";
import { toast } from "sonner";
import { detectConfidenceImprovement } from "@/lib/session-improvement";

export const AVAILABLE_COMPARE_MODELS = [
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", provider: "OpenAI" },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "Meta" },
  { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B", provider: "Alibaba" },
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", provider: "OpenAI" },
  { id: "groq/compound-mini", name: "Compound Mini", provider: "Groq" },
];

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

interface FactCheckState {
  loading: boolean;
  result?: FactCheckResponse;
  error?: string;
  open: boolean;
}

function FactCheckSection({
  targetKey,
  messageText,
  factChecks,
  onFactCheck,
}: {
  targetKey: string;
  messageText: string;
  factChecks: Record<string, FactCheckState>;
  onFactCheck: (key: string, text: string) => void;
}) {
  const current = factChecks[targetKey];
  const isLoading = current?.loading;
  const isOpen = current?.open;
  const result = current?.result;
  const error = current?.error;

  const getVerdictStyle = (verdict: string) => {
    const v = (verdict || "").toLowerCase();
    if (v.includes("holds up")) {
      return {
        bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
        label: "Holds up",
      };
    }
    if (v.includes("partially")) {
      return {
        bg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
        icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
        label: "Partially accurate",
      };
    }
    return {
      bg: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
      icon: <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />,
      label: verdict || "Inaccurate",
    };
  };

  const verdictStyle = result ? getVerdictStyle(result.verdict) : null;

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isLoading || !messageText.trim()}
          onClick={() => onFactCheck(targetKey, messageText)}
          className={`h-7 rounded-full text-xs font-medium px-3 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            isOpen
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
              : "bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {isLoading ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          )}
          <span>Fact Check This</span>
          {result && (
            <ChevronDown
              className={`h-3.5 w-3.5 ml-0.5 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-background dark:from-amber-950/25 dark:via-background dark:to-background p-4 shadow-sm text-xs sm:text-sm space-y-2.5 backdrop-blur-sm">
              {isLoading ? (
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground py-1">
                  <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                  <span>Verifying factual accuracy against domain references...</span>
                </div>
              ) : error ? (
                <div className="text-destructive text-xs space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Fact check failed
                  </p>
                  <p className="opacity-90 leading-relaxed">{error}</p>
                </div>
              ) : result && verdictStyle ? (
                <>
                  <div className="flex items-center justify-between gap-2 border-b border-amber-200/50 dark:border-amber-900/30 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Fact Check Verdict:
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${verdictStyle.bg}`}
                      >
                        {verdictStyle.icon}
                        {verdictStyle.label}
                      </span>
                    </div>
                  </div>
                  <FormattedMessage
                    content={result.explanation}
                    size="sm"
                    className="text-foreground/90 font-normal leading-relaxed"
                  />
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfidenceBadge({
  confidence,
  confidenceSource,
  targetKey,
  messageText,
  onFactCheck,
  variant = "primary",
  align = "left",
}: {
  confidence: number;
  confidenceSource?: string;
  targetKey: string;
  messageText?: string | null;
  onFactCheck: (key: string, text: string) => void;
  variant?: "primary" | "accent";
  align?: "left" | "right";
}) {
  const isBelow60 = confidence < 60;
  const badgeClass =
    variant === "accent"
      ? "bg-accent/15 text-accent border border-accent/30"
      : "bg-primary/12 text-primary border border-primary/30";

  return (
    <div className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs ${badgeClass}`}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Confidence {confidence}%
        </Badge>
        {confidenceSource && (
          <Badge
            variant="secondary"
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
              confidenceSource === "ai"
                ? "bg-accent/18 text-accent border border-accent/30"
                : "bg-muted/60 text-muted-foreground border border-muted"
            }`}
          >
            {confidenceSource === "ai" ? "AI Evaluated" : "Random Fallback"}
          </Badge>
        )}
      </div>
      {isBelow60 && messageText && (
        <button
          type="button"
          onClick={() => onFactCheck(targetKey, messageText)}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-medium mt-1 inline-flex items-center gap-1 transition-colors"
        >
          <AlertTriangle className="h-3 w-3" />
          <span>This seems uncertain. Want to investigate why?</span>
        </button>
      )}
    </div>
  );
}

function ChatPage() {
  const navigate = useNavigate({ from: "/chat" });
  const {
    botConfig,
    botId,
    messages,
    setMessages,
    setBotConfig,
    setBotId,
    resetBot,
    configVersion,
    sessionAttempts,
    recordSessionAttempt,
  } = useQuillCraftStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingBots, setLoadingBots] = useState(true);
  const [savedBots, setSavedBots] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [modelA, setModelA] = useState("openai/gpt-oss-120b");
  const [modelB, setModelB] = useState("qwen/qwen3.8-27b");
  const [factChecks, setFactChecks] = useState<Record<string, FactCheckState>>({});

  const handleFactCheck = async (key: string, text: string, forceOpen = false) => {
    if (!text.trim()) return;

    const current = factChecks[key];
    if (current?.result || current?.error) {
      setFactChecks((prev) => ({
        ...prev,
        [key]: { ...prev[key], open: forceOpen ? true : !prev[key].open },
      }));
      return;
    }

    setFactChecks((prev) => ({
      ...prev,
      [key]: { loading: true, open: true },
    }));

    try {
      const res = await factCheckMessage(text);
      setFactChecks((prev) => ({
        ...prev,
        [key]: { loading: false, result: res, open: true },
      }));
    } catch (err) {
      setFactChecks((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          error: err instanceof Error ? err.message : "Fact check failed",
          open: true,
        },
      }));
    }
  };
  
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

    if (compareMode) {
      try {
        const compareResult = await compareChatModels(botId, userMessage.content, modelA, modelB);
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          isComparison: true,
          comparison: compareResult,
          createdAt: Date.now(),
        };
        setMessages([...nextMessages, assistantMessage]);

        // Evaluate confidence for session improvement detection
        const primaryConfidence =
          typeof compareResult.model_a?.confidence === "number" && !compareResult.model_a?.error
            ? compareResult.model_a.confidence
            : typeof compareResult.model_b?.confidence === "number" && !compareResult.model_b?.error
            ? compareResult.model_b.confidence
            : null;

        if (primaryConfidence !== null) {
          const check = detectConfidenceImprovement(
            userMessage.content,
            primaryConfidence,
            configVersion,
            sessionAttempts,
            botId
          );
          if (check.improved) {
            toast("Nice work refining that, tricky problems like this take iteration.");
          }
          recordSessionAttempt({
            botId,
            question: userMessage.content,
            confidence: primaryConfidence,
            configVersion,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        console.error("Error comparing models:", err);
        setSendError(err instanceof Error ? err.message : "Model comparison failed. Please try again.");
        setMessages(nextMessages);
      } finally {
        setIsSending(false);
      }
      return;
    }

    try {
      const response = await sendChatMessage(botId, userMessage.content, messages);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        confidence: response.confidence,
        confidenceSource: response.confidenceSource,
        confidenceReason: response.confidenceReason,
        createdAt: Date.now(),
      };
      setMessages([...nextMessages, assistantMessage]);

      if (typeof response.confidence === "number") {
        const check = detectConfidenceImprovement(
          userMessage.content,
          response.confidence,
          configVersion,
          sessionAttempts,
          botId
        );
        if (check.improved) {
          toast("Nice work refining that, tricky problems like this take iteration.");
        }
        recordSessionAttempt({
          botId,
          question: userMessage.content,
          confidence: response.confidence,
          configVersion,
          timestamp: Date.now(),
        });
      }
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

      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-background/60 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed inset-y-0 left-0 z-40 w-72 md:relative md:z-10 border-r border-border bg-card/95 md:bg-muted/20 backdrop-blur-md flex flex-col shadow-xl md:shadow-none"
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
                      <div
                        onClick={() => selectBot(bot.id, bot)}
                        className="w-full p-3 text-left cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectBot(bot.id, bot);
                          }
                        }}
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
                      </div>
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
              <Link to="/build" search={{ mode: "edit" }} className="flex items-center gap-2 cursor-pointer">
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
                  {message.role === "assistant" && message.isComparison && message.comparison ? (
                    <div className="w-full space-y-4 pl-0 sm:pl-14">
                      {/* Side-by-side cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Model A Card */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
                          <div>
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 mb-3.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-7 w-7 rounded-lg bg-primary/12 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                                  A
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                                    Model A
                                  </span>
                                  <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate font-mono">
                                    {message.comparison.model_a.name}
                                  </h4>
                                </div>
                              </div>
                              {message.comparison.model_a.error ? (
                                <Badge variant="destructive" className="text-[11px] px-2.5 py-0.5 font-semibold">
                                  Error
                                </Badge>
                              ) : typeof message.comparison.model_a.confidence === "number" ? (
                                <ConfidenceBadge
                                  confidence={message.comparison.model_a.confidence}
                                  targetKey={`${message.id}_a`}
                                  messageText={message.comparison.model_a.reply}
                                  onFactCheck={(key, text) => handleFactCheck(key, text, true)}
                                  variant="primary"
                                  align="right"
                                />
                              ) : null}
                            </div>

                            {message.comparison.model_a.error ? (
                              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
                                <p className="font-semibold mb-1">Generation failed</p>
                                <p className="opacity-90">{message.comparison.model_a.reason || "Model request could not be completed."}</p>
                              </div>
                            ) : (
                              <FormattedMessage
                                content={message.comparison.model_a.reply || ""}
                                size="sm"
                              />
                            )}
                          </div>

                          {!message.comparison.model_a.error && message.comparison.model_a.reason && (
                            <div className="mt-3.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 font-semibold text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Evaluation Insight</span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {message.comparison.model_a.reason}
                              </p>
                            </div>
                          )}

                          {!message.comparison.model_a.error && message.comparison.model_a.reply && (
                            <FactCheckSection
                              targetKey={`${message.id}_a`}
                              messageText={message.comparison.model_a.reply}
                              factChecks={factChecks}
                              onFactCheck={handleFactCheck}
                            />
                          )}
                        </div>

                        {/* Model B Card */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
                          <div>
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 mb-3.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-7 w-7 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-xs flex-shrink-0">
                                  B
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                                    Model B
                                  </span>
                                  <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate font-mono">
                                    {message.comparison.model_b.name}
                                  </h4>
                                </div>
                              </div>
                              {message.comparison.model_b.error ? (
                                <Badge variant="destructive" className="text-[11px] px-2.5 py-0.5 font-semibold">
                                  Error
                                </Badge>
                              ) : typeof message.comparison.model_b.confidence === "number" ? (
                                <ConfidenceBadge
                                  confidence={message.comparison.model_b.confidence}
                                  targetKey={`${message.id}_b`}
                                  messageText={message.comparison.model_b.reply}
                                  onFactCheck={(key, text) => handleFactCheck(key, text, true)}
                                  variant="accent"
                                  align="right"
                                />
                              ) : null}
                            </div>

                            {message.comparison.model_b.error ? (
                              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
                                <p className="font-semibold mb-1">Generation failed</p>
                                <p className="opacity-90">{message.comparison.model_b.reason || "Model request could not be completed."}</p>
                              </div>
                            ) : (
                              <FormattedMessage
                                content={message.comparison.model_b.reply || ""}
                                size="sm"
                              />
                            )}
                          </div>

                          {!message.comparison.model_b.error && message.comparison.model_b.reason && (
                            <div className="mt-3.5 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 font-semibold text-accent">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Evaluation Insight</span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {message.comparison.model_b.reason}
                              </p>
                            </div>
                          )}

                          {!message.comparison.model_b.error && message.comparison.model_b.reply && (
                            <FactCheckSection
                              targetKey={`${message.id}_b`}
                              messageText={message.comparison.model_b.reply}
                              factChecks={factChecks}
                              onFactCheck={handleFactCheck}
                            />
                          )}
                        </div>
                      </div>

                      {/* Fixed prompt text below both cards */}
                      <div className="rounded-2xl border border-primary/25 bg-primary/5 dark:bg-primary/10 p-4 shadow-sm flex items-center gap-3.5">
                        <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                          <Scale className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-wider font-bold text-primary mb-0.5">Critical Evaluation</p>
                          <p className="text-sm sm:text-base font-semibold text-foreground">
                            Do these agree? If not, which one do you trust more, and why?
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
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
                              <FormattedMessage content={message.content} />
                            ) : (
                              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
                      {message.role === "assistant" && (
                        <div className="pl-14 space-y-2">
                          {typeof message.confidence === "number" ? (
                            <ConfidenceBadge
                              confidence={message.confidence}
                              confidenceSource={message.confidenceSource}
                              targetKey={message.id}
                              messageText={message.content}
                              onFactCheck={(key, text) => handleFactCheck(key, text, true)}
                              variant="primary"
                              align="left"
                            />
                          ) : null}

                          {message.confidenceReason && (
                            <div className="max-w-[90%] lg:max-w-[80%] rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 font-semibold text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Evaluation Insight</span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {message.confidenceReason}
                              </p>
                            </div>
                          )}

                          {message.content && (
                            <div className="max-w-[90%] lg:max-w-[80%]">
                              <FactCheckSection
                                targetKey={message.id}
                                messageText={message.content}
                                factChecks={factChecks}
                                onFactCheck={handleFactCheck}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

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
                  <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                  {compareMode ? (
                    <span>
                      Comparing <strong className="text-foreground font-mono text-xs">{modelA}</strong> &{" "}
                      <strong className="text-foreground font-mono text-xs">{modelB}</strong> in parallel...
                    </span>
                  ) : (
                    "Thinking..."
                  )}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 py-4 relative z-20">
          {/* Compare Models controls */}
          <div className="max-w-4xl mx-auto mb-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
                className={`h-8 rounded-full text-xs font-semibold transition-all duration-200 gap-1.5 px-3.5 shadow-sm cursor-pointer ${
                  compareMode
                    ? "bg-primary text-primary-foreground shadow-primary/20 ring-2 ring-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare Models
                <span
                  className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    compareMode
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {compareMode ? "ON" : "OFF"}
                </span>
              </Button>

              {compareMode && (
                <span className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Evaluate both side-by-side with independent confidence & fact check
                </span>
              )}
            </div>

            {/* Model Selectors Bar when compareMode is active */}
            <AnimatePresence>
              {compareMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-border/80 bg-muted/30 p-2.5 sm:p-3 flex flex-wrap items-center gap-2 sm:gap-3 backdrop-blur-sm shadow-xs">
                    {/* Model A Selector */}
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <span className="h-6 w-6 rounded-md bg-primary/15 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                        A
                      </span>
                      <div className="flex-1 min-w-0">
                        <select
                          value={modelA}
                          onChange={(e) => setModelA(e.target.value)}
                          className="w-full h-8 text-xs font-medium rounded-lg border border-border bg-background px-2.5 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow cursor-pointer truncate"
                        >
                          {AVAILABLE_COMPARE_MODELS.map((m) => (
                            <option key={`a-${m.id}`} value={m.id} disabled={m.id === modelB}>
                              {m.name} ({m.provider}) {m.id === modelB ? "• Selected for B" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const temp = modelA;
                        setModelA(modelB);
                        setModelB(temp);
                      }}
                      title="Swap Model A and Model B"
                      className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    </Button>

                    {/* Model B Selector */}
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <span className="h-6 w-6 rounded-md bg-accent/20 text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                        B
                      </span>
                      <div className="flex-1 min-w-0">
                        <select
                          value={modelB}
                          onChange={(e) => setModelB(e.target.value)}
                          className="w-full h-8 text-xs font-medium rounded-lg border border-border bg-background px-2.5 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow cursor-pointer truncate"
                        >
                          {AVAILABLE_COMPARE_MODELS.map((m) => (
                            <option key={`b-${m.id}`} value={m.id} disabled={m.id === modelA}>
                              {m.name} ({m.provider}) {m.id === modelA ? "• Selected for A" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                compareMode
                  ? "Compare models: Ask a question..."
                  : "Type your message here..."
              }
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
