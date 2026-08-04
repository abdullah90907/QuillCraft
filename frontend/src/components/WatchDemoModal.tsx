import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  MessageSquare,
  Sliders,
  CheckCircle2,
  MoveRight,
  ExternalLink,
  Youtube,
  MonitorPlay,
  Play,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WatchDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const YOUTUBE_VIDEO_ID = "YNPSiRsidNw";
const YOUTUBE_URL = `https://youtu.be/${YOUTUBE_VIDEO_ID}`;
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

const DEMO_STAGES = [
  {
    id: "persona",
    title: "1. Define Persona",
    icon: Brain,
    description: "Set up tutor identity, domain topic, target audience, and subject expertise.",
    snippet: `Tutor Name: Socratic Physics Mentor
Role: High School Physics Tutor
Tone: Encouraging, Inquiry-based, Rigorous
Goal: Guide students through first-principles thinking without handing out direct answers.`,
    chatPreview: [
      { sender: "student", text: "Why does an object in motion stay in motion?" },
      { sender: "bot", text: "Great question! Think about sliding a book across a smooth ice rink versus a carpet. What causes the book on carpet to stop?" },
    ],
  },
  {
    id: "rules",
    title: "2. Tune Pedagogy",
    icon: Sliders,
    description: "Configure hint depth, answer pacing, error corrections, and step-by-step guidance.",
    snippet: `Rule 1: Never reveal final numerical calculation on first attempt.
Rule 2: Provide a supportive hint focused on free-body diagrams.
Rule 3: Ask a clarifying follow-up question after every hint.`,
    chatPreview: [
      { sender: "student", text: "Is F = ma the answer for Q3?" },
      { sender: "bot", text: "You are on the right track with Newton's Second Law! Before calculating, let's identify all vertical forces acting on the elevator." },
    ],
  },
  {
    id: "chat",
    title: "3. Live Validation",
    icon: MessageSquare,
    description: "Test responses in real-time, inspect bot internal confidence, and refine prompts.",
    snippet: `Validation Metric: 98% Alignment Score
Hint Precision: High
Tone Compliance: Warm & Pedagogical
Response Time: ~450ms`,
    chatPreview: [
      { sender: "student", text: "Can you summarize the 3 laws of motion simply?" },
      { sender: "bot", text: "1️⃣ Inertia: Things keep doing what they are doing unless pushed.\n2️⃣ F=ma: Harder pushes make things accelerate faster.\n3️⃣ Reaction: Every push has an equal opposite push back!" },
    ],
  },
];

export function WatchDemoModal({ open, onOpenChange }: WatchDemoModalProps) {
  const [viewMode, setViewMode] = useState<"video" | "interactive">("video");
  const [activeStage, setActiveStage] = useState(0);

  const stage = DEMO_STAGES[activeStage];

  const handleNextStage = () => {
    setActiveStage((prev) => (prev + 1) % DEMO_STAGES.length);
  };

  const handlePrevStage = () => {
    setActiveStage((prev) => (prev - 1 + DEMO_STAGES.length) % DEMO_STAGES.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-border/80 bg-background/95 backdrop-blur-2xl rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary animate-pulse shrink-0" />
              <span>QuillCraft Product Demo</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              Watch how educators craft, tune, and validate AI tutoring bots.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600/10 text-red-600 hover:bg-red-600/20 border border-red-500/20 transition-colors shadow-xs"
            >
              <Youtube className="h-4 w-4" />
              <span>Watch on YouTube</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between gap-2 p-1 bg-muted/60 rounded-xl border border-border/60">
            <button
              onClick={() => setViewMode("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                viewMode === "video"
                  ? "bg-background text-primary shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Youtube className="h-4 w-4 text-red-500 shrink-0" />
              <span>YouTube Video</span>
            </button>
            <button
              onClick={() => setViewMode("interactive")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                viewMode === "interactive"
                  ? "bg-background text-primary shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MonitorPlay className="h-4 w-4 text-primary shrink-0" />
              <span>Interactive Guide</span>
            </button>
          </div>

          {/* Player Screen Area */}
          {viewMode === "video" ? (
            <div className="relative w-full aspect-[16/9] min-h-[220px] sm:min-h-[360px] md:min-h-[420px] rounded-xl border border-border/80 bg-black overflow-hidden shadow-xl flex items-center justify-center">
              {open && (
                <iframe
                  src={EMBED_URL}
                  title="QuillCraft Product Demo"
                  className="w-full h-full rounded-xl border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stage Navigation */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/60">
                {DEMO_STAGES.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = idx === activeStage;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveStage(idx)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-background text-primary shadow-sm border border-border/70"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate hidden sm:inline">{item.title}</span>
                      <span className="truncate sm:hidden">{item.title.split(".")[1]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Showcase Cards */}
              <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 grid md:grid-cols-2 gap-4 sm:gap-5 shadow-sm">
                <div className="space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{stage.description}</span>
                    </div>
                    <div className="mt-3 p-3.5 rounded-lg bg-muted/40 border border-border/60 font-mono text-[11px] text-foreground space-y-1 leading-relaxed">
                      <div className="text-primary font-semibold">// Config Spec</div>
                      {stage.snippet.split("\n").map((line, i) => (
                        <div key={i} className="text-muted-foreground truncate">{line}</div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrevStage}
                      className="text-xs h-8 rounded-lg cursor-pointer"
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNextStage}
                      className="text-xs h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-1 cursor-pointer"
                    >
                      Next Step
                      <MoveRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl bg-background border border-border/70 p-3.5 flex flex-col justify-between shadow-inner">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pb-1.5 border-b border-border/50 flex items-center justify-between">
                    <span>Output Simulation</span>
                    <Badge variant="secondary" className="text-[9px] py-0 px-1.5">Live</Badge>
                  </div>

                  <div className="space-y-2.5 my-3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStage}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        {stage.chatPreview.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${
                              msg.sender === "student" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                                msg.sender === "student"
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-muted text-foreground rounded-bl-none border border-border/60"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground self-start sm:self-auto">
              <Brain className="h-4 w-4 text-primary shrink-0" />
              <span>Ready to create your custom AI tutor?</span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="outline"
                asChild
                className="flex-1 sm:flex-initial rounded-full px-5 text-xs font-semibold cursor-pointer h-9"
                onClick={() => onOpenChange(false)}
              >
                <Link to="/chat">Try Interactive Chat</Link>
              </Button>
              <Button
                asChild
                className="flex-1 sm:flex-initial rounded-full px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer h-9"
                onClick={() => onOpenChange(false)}
              >
                <Link to="/build" className="flex items-center gap-1.5 justify-center">
                  Start Building Now
                  <MoveRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
