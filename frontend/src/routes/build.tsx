import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Rocket,
  Sparkles,
  Zap,
  Pencil,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useQuillCraftStore } from "@/lib/quillcraft-store";
import { createBot, updateBot } from "@/lib/api";
import type { AnswerStyle, BotConfig } from "@/lib/quillcraft-types";

export const Route = createFileRoute("/build")({
  head: () => ({
    meta: [
      { title: "Build Bot | QuillCraft" },
      {
        name: "description",
        content: "Configure your educational bot's role, personality, and answer style in the QuillCraft builder.",
      },
      { property: "og:title", content: "Build Bot | QuillCraft" },
      {
        property: "og:description",
        content: "Design a tutoring bot profile ready for chat testing and future backend integration.",
      },
    ],
  }),
  component: BuildPage,
});

function BuildPage() {
  const navigate = useNavigate({ from: "/build" });
  const { botConfig, setBotConfig, setBotId, clearMessages, botId } =
    useQuillCraftStore();

  // Determine if we're in edit mode (if we have a botId and botConfig already)
  const isEditMode = !!botId && !!botConfig;

  const [form, setForm] = useState<BotConfig>(
    botConfig ?? {
      botName: "",
      roleSubject: "",
      personality: "",
      answerStyle: "hints-first",
      rules: "",
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled =
    isSubmitting ||
    !form.botName.trim() ||
    !form.roleSubject.trim() ||
    !form.personality.trim() ||
    !form.rules.trim();

  async function handleCreateBot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isDisabled) {
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);
    setError(null);

    try {
      const trimmedConfig = {
        ...form,
        botName: form.botName.trim(),
        roleSubject: form.roleSubject.trim(),
        personality: form.personality.trim(),
        rules: form.rules.trim(),
      };

      if (isEditMode && botId) {
        // Edit mode
        await updateBot(botId, trimmedConfig);
      } else {
        // Create mode
        const response = await createBot(trimmedConfig);
        setBotId(response.bot_id);
      }

      setBotConfig(trimmedConfig);
      if (!isEditMode) {
        clearMessages();
      }
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save bot. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Animated Background */}
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

        {/* Floating Animated Circles */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-10 bottom-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-4xl py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="mb-4 inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                {isEditMode ? <Pencil className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl leading-none tracking-tight text-foreground">
                {isEditMode ? "Edit your learning bot" : "Build your learning bot"}
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground">
              {isEditMode 
                ? "Update your bot's configuration and refine its behavior." 
                : "Configure QuillCraft once, then test in conversation and iterate with confidence."}
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <Card className="overflow-hidden border-border/70 bg-card/80 backdrop-blur-xl shadow-elevated rounded-3xl">
              <CardHeader className="border-b border-border bg-card/60 px-6 py-4">
                <CardTitle className="flex items-center gap-2 font-display text-xl leading-none text-foreground">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  Bot configuration
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 px-6 py-6">
                <form onSubmit={handleCreateBot} className="space-y-6">
                  {/* Bot Name & Role/Subject */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="bot-name"
                        className="text-sm font-medium text-foreground"
                      >
                        Bot Name
                      </Label>
                      <Input
                        id="bot-name"
                        value={form.botName}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, botName: event.target.value }))
                        }
                        placeholder="Socratic Physics Mentor"
                        className="h-12 border-border bg-background text-sm text-foreground placeholder-muted-foreground rounded-full"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="role-subject"
                        className="text-sm font-medium text-foreground"
                      >
                        Role / Subject
                      </Label>
                      <Input
                        id="role-subject"
                        value={form.roleSubject}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, roleSubject: event.target.value }))
                        }
                        placeholder="High-school physics tutor"
                        className="h-12 border-border bg-background text-sm text-foreground placeholder-muted-foreground rounded-full"
                      />
                    </div>
                  </div>

                  {/* Personality */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="personality"
                      className="text-sm font-medium text-foreground"
                    >
                      Personality
                    </Label>
                    <Input
                      id="personality"
                      value={form.personality}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, personality: event.target.value }))
                      }
                      placeholder="Warm, structured, and encouraging"
                      className="h-12 border-border bg-background text-sm text-foreground placeholder-muted-foreground rounded-full"
                    />
                  </div>

                  {/* Answer Style */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Answer Style
                    </Label>
                    <ToggleGroup
                      type="single"
                      value={form.answerStyle}
                      onValueChange={(value: string) => {
                        if (!value) {
                          return;
                        }
                        setForm((prev) => ({
                          ...prev,
                          answerStyle: value as AnswerStyle,
                        }));
                      }}
                      className="inline-flex w-full gap-2 rounded-xl border border-border bg-muted/40 p-1.5"
                    >
                      <ToggleGroupItem
                        value="hints-first"
                        className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
                      >
                        Hints First
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="direct-answers"
                        className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
                      >
                        Direct Answers
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* Rules */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="rules"
                      className="text-sm font-medium text-foreground"
                    >
                      Rules
                    </Label>
                    <Textarea
                      id="rules"
                      value={form.rules}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, rules: event.target.value }))
                      }
                      placeholder="Always encourage reasoning before final answers. Use concise, student-friendly language."
                      className="min-h-[120px] border-border bg-background text-sm text-foreground placeholder-muted-foreground resize-y rounded-2xl"
                    />
                  </div>

                  {/* Error Message */}
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  ) : null}

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button
                      type="submit"
                      disabled={isDisabled}
                      size="lg"
                      className="h-12 rounded-full px-7 text-sm font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-1.5 h-5 w-5 animate-spin" />
                          {isEditMode ? "Updating Bot" : "Creating Bot"}
                        </>
                      ) : (
                        <>
                          {isEditMode ? <Pencil className="mr-1.5 h-5 w-5" /> : <Rocket className="mr-1.5 h-5 w-5" />}
                          {isEditMode ? "Update Bot" : "Create Bot"}
                        </>
                      )}
                    </Button>
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      className="h-12 rounded-full px-6 text-sm font-semibold"
                    >
                      <Link to="/chat">Go to Chat</Link>
                    </Button>
                  </div>
                </form>

                {/* Success Message */}
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mt-6 rounded-xl border border-accent/30 bg-accent/10 px-5 py-5 shadow-sm"
                  >
                    <p className="mb-1.5 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      {isEditMode ? "Bot updated successfully!" : "Bot created successfully!"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ready to validate responses in the test chat?
                    </p>
                    <Button
                      type="button"
                      size="lg"
                      className="h-10 rounded-full px-5 text-sm font-semibold"
                      onClick={() => navigate({ to: "/chat" })}
                    >
                      Continue to Chat
                    </Button>
                  </motion.div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
