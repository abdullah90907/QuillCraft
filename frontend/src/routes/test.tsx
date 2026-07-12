import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bot, LoaderCircle, SendHorizontal, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sendChatMessage } from "@/lib/api";
import { useQuillCraftStore } from "@/lib/quillcraft-store";
import type { ChatMessage } from "@/lib/quillcraft-types";

export const Route = createFileRoute("/test")({
  head: () => ({
    meta: [
      { title: "Test Bot | QuillCraft" },
      {
        name: "description",
        content:
          "Test your QuillCraft bot conversation flow with confidence indicators and backend-ready chat architecture.",
      },
      { property: "og:title", content: "Test Bot | QuillCraft" },
      {
        property: "og:description",
        content: "Preview educational bot responses and confidence before connecting to production chat APIs.",
      },
    ],
  }),
  component: TestPage,
});

function TestPage() {
  const navigate = useNavigate({ from: "/test" });
  const { botConfig, botId, messages, setMessages } = useQuillCraftStore();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
      console.log("Sending chat message...");
      const response = await sendChatMessage(botId, userMessage.content);
      console.log("Received API response:", response);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        confidence: response.confidence,
        createdAt: Date.now(),
      };
      console.log("Assistant message:", assistantMessage);

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
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
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-10 bottom-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-elevated max-w-md w-full">
            <CardHeader>
              <CardTitle className="font-display text-3xl leading-none text-center text-foreground">
                No bot configured yet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-7 px-8 pb-8 pt-4 text-center">
              <p className="text-lg text-muted-foreground">
                Create a bot first to open a valid test conversation with confidence scoring.
              </p>
              <Button
                size="lg"
                className="h-14 rounded-full px-9 text-base font-semibold"
                onClick={() => navigate({ to: "/build" })}
              >
                <Sparkles className="mr-2 h-6 w-6" />
                Go to Build
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
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
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-10 bottom-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 border-b border-border bg-background/90 backdrop-blur-xl"
      >
        <div className="mx-auto w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full px-6"
            >
              <Link to="/build" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back to Edit
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="font-display text-3xl sm:text-4xl leading-none tracking-tight text-foreground">
                Test your bot
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                {configSummary}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div className="relative z-10 flex flex-1 flex-col items-center p-4 sm:p-6 lg:p-8 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-4xl flex-1 flex flex-col"
        >
          <Card className="flex-1 flex flex-col overflow-hidden border-border/70 bg-card/80 backdrop-blur-xl shadow-elevated max-h-[calc(100vh-140px)] min-h-[600px] rounded-3xl">
            {/* Card Header */}
            <CardHeader className="border-b border-border bg-card/60 px-7 py-5 shrink-0">
                <CardTitle className="flex items-center gap-3 font-display text-2xl leading-none text-foreground">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  {botConfig.botName}
                </CardTitle>
              </CardHeader>

            {/* Card Content */}
            <CardContent className="flex flex-1 flex-col p-0 overflow-hidden">
              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-7 py-7 space-y-5 scroll-smooth"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Bot className="h-20 w-20 text-primary/40 mb-3" />
                    </motion.div>
                    <p className="text-xl text-muted-foreground max-w-md">
                      Ask your first question to start evaluating this tutor's response quality.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
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
                        <div className="flex items-start gap-4 max-w-[85%]">
                          {message.role === "assistant" && (
                            <div className="flex-shrink-0 mt-1.5">
                              <div className="h-10 w-10 rounded-full bg-primary/12 text-primary flex items-center justify-center">
                                <Bot className="h-5 w-5" />
                              </div>
                            </div>
                          )}
                          <div
                            className={
                              message.role === "user"
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-6 py-4 shadow-md"
                                : "bg-background border border-border rounded-2xl rounded-tl-md px-6 py-4 shadow-sm"
                            }
                          >
                            {message.role === "assistant" ? (
                              <div className="prose prose-slate dark:prose-invert max-w-none prose-base">
                                <ReactMarkdown
                                  components={{
                                    h1: (props) => (
                                    <h1 className="text-xl font-bold text-foreground mb-3 mt-4" {...props} />
                                  ),
                                    h2: (props) => (
                                    <h2 className="text-lg font-bold text-foreground mb-2 mt-3" {...props} />
                                  ),
                                    h3: (props) => (
                                    <h3 className="text-base font-bold text-foreground mb-1 mt-2" {...props} />
                                  ),
                                    p: (props) => (
                                    <p className="text-base text-foreground mb-3 last:mb-0" {...props} />
                                  ),
                                    ul: (props) => (
                                    <ul className="list-disc pl-6 mb-3 last:mb-0 space-y-1" {...props} />
                                  ),
                                    ol: (props) => (
                                    <ol className="list-decimal pl-6 mb-3 last:mb-0 space-y-1" {...props} />
                                  ),
                                    li: (props) => (
                                    <li className="text-base text-foreground" {...props} />
                                  ),
                                    strong: (props) => (
                                    <strong className="font-bold text-foreground" {...props} />
                                  ),
                                    code: (props) => (
                                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono" {...props} />
                                  ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-base">{message.content}</p>
                            )}
                          </div>
                          {message.role === "user" && (
                            <div className="flex-shrink-0 mt-1.5">
                              <div className="h-10 w-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                                <User className="h-5 w-5" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {message.role === "assistant" &&
                      typeof message.confidence === "number" ? (
                        <div className="pl-14">
                          <Badge
                            variant="secondary"
                            className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-sm font-semibold"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Confidence {message.confidence}%
                          </Badge>
                        </div>
                      ) : null}
                    </motion.div>
                  ))
                )}

                {isSending ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 pl-1"
                  >
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="h-10 w-10 rounded-full bg-primary/12 text-primary flex items-center justify-center">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-3 rounded-2xl rounded-tl-md border border-border bg-background px-6 py-4 text-base text-muted-foreground shadow-sm">
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Thinking...
                    </div>
                  </motion.div>
                ) : null}
              </div>

              {/* Error Message */}
              {sendError ? (
                <div className="px-7 pb-4">
                  <p className="text-base text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-5 py-4">
                    {sendError}
                  </p>
                </div>
              ) : null}

              {/* Input Area */}
              <div className="border-t border-border bg-card/80 px-7 py-5 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-4">
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Try: Explain Newton's third law with an everyday example"
                    className="h-14 border-border bg-background text-base text-foreground placeholder-muted-foreground rounded-full"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 rounded-full px-7 text-base font-semibold"
                    disabled={!input.trim() || isSending}
                  >
                    {isSending ? (
                      <LoaderCircle className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <SendHorizontal className="h-6 w-6 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
