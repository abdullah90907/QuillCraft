import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  CheckCircle2,
  Compass,
  MoveRight,
  MessageCircleCode,
  Sparkles,
  PenTool,
  ChevronRight,
  Star,
  Users,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Palette,
  Code,
} from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuillCraft Home | Design Learning Bots" },
      {
        name: "description",
        content: "Build educational bot personas, shape answer style, and move from design to testing inside one polished QuillCraft workflow.",
      },
      { property: "og:title", content: "QuillCraft Home | Design Learning Bots" },
      {
        property: "og:description",
        content: "A modern workspace for educators to create, tune, and validate tutoring bots with confidence.",
      },
    ],
  }),
  component: Index,
});

const heroTransition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const };

const AnimatedHeroBackground = () => {
  const nodeCount = 30;
  
  const iconNodes = useMemo(() => [
    { icon: Brain, x: 15, y: 25, size: 40, color: "text-primary", glowColor: "primary" },
    { icon: Lightbulb, x: 75, y: 20, size: 36, color: "text-accent", glowColor: "accent" },
    { icon: GraduationCap, x: 85, y: 70, size: 38, color: "text-primary", glowColor: "primary" },
    { icon: BookOpen, x: 20, y: 75, size: 34, color: "text-accent", glowColor: "accent" },
    { icon: Sparkles, x: 50, y: 35, size: 32, color: "text-primary", glowColor: "primary" },
    { icon: Code, x: 45, y: 80, size: 36, color: "text-accent", glowColor: "accent" },
  ], []);

  const plainNodes = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 4,
        speed: 0.3 + Math.random() * 0.7,
      });
    }
    return nodes;
  }, []);

  const allNodes = useMemo(() => [
    ...iconNodes.map((n, i) => ({ ...n, id: `icon-${i}`, isIcon: true })),
    ...plainNodes.map((n, i) => ({ ...n, id: `plain-${i}`, isIcon: false })),
  ], [iconNodes, plainNodes]);

  const connections = useMemo(() => {
    const edges = [];
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const n1 = allNodes[i];
        const n2 = allNodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 35) {
          edges.push({ from: i, to: j, dist });
        }
      }
    }
    return edges;
  }, [allNodes]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Floating animated shapes */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
        {/* Connections */}
        {connections.map((edge, i) => {
          const n1 = allNodes[edge.from];
          const n2 = allNodes[edge.to];
          return (
            <motion.line
              key={i}
              x1={`${n1.x}%`}
              y1={`${n1.y}%`}
              x2={`${n2.x}%`}
              y2={`${n2.y}%`}
              stroke="color-mix(in oklab, var(--color-primary) 60%, var(--color-accent))"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}

        {/* Plain nodes */}
        {plainNodes.map((node) => {
          const driftX = 2 - Math.random() * 4; // -2 to +2
          const driftY = 2 - Math.random() * 4; // -2 to +2
          return (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill="color-mix(in oklab, var(--color-primary) 50%, var(--color-accent))"
            animate={{
              cx: [`${node.x}%`, `${node.x + driftX}%`, `${node.x}%`],
              cy: [`${node.y}%`, `${node.y + driftY}%`, `${node.y}%`],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 10 + node.speed * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );})}

        {/* Icon nodes with glow */}
        {iconNodes.map((node, i) => {
          const Icon = node.icon;
          return (
            <g key={i}>
              <motion.circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={24}
                fill={`color-mix(in oklab, var(--color-${node.glowColor}) 15%, transparent)`}
                animate={{
                  r: [24, 30, 24],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <foreignObject
                x={`${node.x}%`}
                y={`${node.y}%`}
                width={node.size}
                height={node.size}
                transform={`translate(-${node.size / 2}, -${node.size / 2})`}
                style={{ overflow: "visible" }}
              >
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 4 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Icon className={`${node.color}`} style={{ width: node.size, height: node.size }} />
                </motion.div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const steps = [
  { icon: Compass, number: "01", title: "Define the teaching role", description: "Set subject focus, personality, and learning constraints aligned to your curriculum." },
  { icon: PenTool, number: "02", title: "Tune response behavior", description: "Choose hint-driven or direct answer style and refine bot behavior with custom rules." },
  { icon: CheckCircle2, number: "03", title: "Validate in test chat", description: "Run realistic prompts, inspect confidence, and iterate until outcomes match your teaching standard." },
];

const features = [
  { icon: Brain, title: "Pedagogy-aware persona design", description: "Craft tutors that balance guidance, rigor, and encouragement for different learner types." },
  { icon: MessageCircleCode, title: "Backend-ready chat contract", description: "Mock today, connect tomorrow. Chat flow is structured for smooth FastAPI `/chat` integration." },
  { icon: Sparkles, title: "Premium learning workspace", description: "Thoughtful UI, calm visual rhythm, and motion that supports clarity rather than distraction." },
  { icon: Code, title: "Developer-friendly API", description: "Easy to integrate with your existing systems and tools." },
  { icon: BookOpen, title: "Curriculum alignment", description: "Ensure your tutor adheres to your educational standards and objectives." },
  { icon: Palette, title: "Customizable design", description: "Match your brand identity with custom themes and colors." }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "High School Math Teacher",
    quote: "QuillCraft transformed how I create personalized learning experiences. My students love the interactive tutors!",
    avatar: "S"
  },
  {
    name: "Dr. Michael Torres",
    role: "University Professor",
    quote: "The level of control over the AI's behavior is exactly what educators need. Highly recommend!",
    avatar: "M"
  },
  {
    name: "Emily Rodriguez",
    role: "Curriculum Designer",
    quote: "Beautiful interface and powerful features. This is the future of educational technology.",
    avatar: "E"
  }
];

const screenshots = [
  {
    title: "Home",
    description: "Landing page with the core product story and call to action.",
    src: "/home.png",
  },
  {
    title: "Bot Builder",
    description: "The builder used to configure the tutor's role, tone, and rules.",
    src: "/bot.png",
  },
  {
    title: "Chat",
    description: "Conversation view for testing and refining bot responses.",
    src: "/chat.png",
  },
];

const stats = [
  { number: "2,500+", label: "Educators" },
  { number: "10,000+", label: "Tutors Created" },
  { number: "50+", label: "Subjects" },
  { number: "98%", label: "Satisfaction Rate" }
];

function Index() {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const smoothPointerX = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.4 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.4 });

  const glowX = useTransform(smoothPointerX, [0, 1], [120, 920]);
  const glowY = useTransform(smoothPointerY, [0, 1], [90, 560]);

  const cursorGlow = useMotionTemplate`radial-gradient(550px circle at ${glowX}px ${glowY}px, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 72%)`;

  const handleHeroPointerMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    pointerX.set(Math.min(Math.max(x, 0), 1));
    pointerY.set(Math.min(Math.max(y, 0), 1));
  };

  const handleHeroPointerLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <div className="bg-background overflow-x-hidden">
      <section
        className="group relative overflow-hidden border-b border-border/70"
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={handleHeroPointerLeave}
      >
        <div className="absolute inset-0 bg-hero-gradient opacity-95" aria-hidden />
        
        {/* Animated background */}
        <AnimatedHeroBackground />

        <motion.div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: cursorGlow }} aria-hidden />

        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-40"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 28%, transparent), transparent)",
          }}
        />

        {/* Main hero content - adjusted padding for laptop screens */}
        <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-20 lg:pb-24 pt-10 sm:pt-14 md:pt-16 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={heroTransition}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/15 px-5 py-2.5 shadow-md backdrop-blur-md"
            >
              <motion.span
                className="h-3 w-3 rounded-full bg-primary"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                Next-Gen Educational AI
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.15 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-foreground"
            >
              Design AI tutors
              <span className="block pt-3 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                tailored to your classroom.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.25 }}
              className="mt-6 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-muted-foreground"
            >
              QuillCraft gives educators complete control to build, refine, and validate AI tutoring bots with precise personality, tone, and pedagogical style settings.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.35 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  size="lg"
                  className="h-13 rounded-full px-7 text-base font-semibold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                >
                  <Link to="/build" className="group cursor-pointer flex items-center gap-2">
                    Start Building
                    <MoveRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.985 }}>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full px-6 text-base font-semibold border-border/80 bg-background/80 hover:bg-background hover:border-border shadow-md"
                >
                  <Link to="/chat" className="group inline-flex cursor-pointer items-center gap-2">
                    <span>Try Demo</span>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...heroTransition, delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-8"
            >
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-3 border-background bg-primary/20 flex items-center justify-center"
                  >
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  Trusted by 2,500+ educators worldwide
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border/70 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="text-center"
              >
                <motion.h3
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: index * 0.1 }}
                  className="font-display text-3xl sm:text-4xl text-primary"
                >
                  {stat.number}
                </motion.h3>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-3xl leading-none tracking-tight sm:text-3.5xl md:text-4xl">How it works</h2>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground sm:text-base">
            Move from idea to validated tutor behavior in three focused steps.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24, rotate: index % 2 === 0 ? -2 : 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, rotate: 0, scale: 1.02 }}
            >
              <Card className="h-full border-border/70 bg-card/80 shadow-soft transition-all duration-300 hover:shadow-elevated rounded-3xl">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12 text-primary">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="font-display text-3xl text-muted-foreground/40">{step.number}</span>
                  </div>
                  <CardTitle className="font-display text-[1.6rem] leading-none">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key features section */}
      <section className="border-t border-border/70 bg-muted/25">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="font-display text-3xl leading-none tracking-tight sm:text-3.5xl md:text-4xl">Key features</h2>
            <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground sm:text-base">
              Built for educators who want elegance, control, and future-ready architecture.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -10, scale: 1.03 }}
              >
                <Card className="h-full border-border/70 bg-card shadow-soft transition-all duration-300 hover:shadow-elevated rounded-3xl">
                  <CardHeader className="space-y-4">
                    <motion.div 
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent"
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <CardTitle className="font-display text-[1.6rem] leading-none">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="font-display text-3xl leading-none tracking-tight sm:text-3.5xl md:text-4xl">What educators say</h2>
            <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground sm:text-base">
              Join thousands of satisfied educators using QuillCraft.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.15, type: "spring" }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="h-full border-border/70 bg-card/80 shadow-soft transition-all duration-300 hover:shadow-elevated rounded-3xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1.5 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed text-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots section */}
      <section className="border-t border-border/70 bg-muted/25">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="font-display text-3xl leading-none tracking-tight sm:text-3.5xl md:text-4xl">Screenshots</h2>
            <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground sm:text-base">
              A quick look at the home page, bot builder, and chat interface included in the public assets.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {screenshots.map((shot, index) => (
              <motion.div
                key={shot.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full overflow-hidden border-border/70 bg-card/80 shadow-soft transition-all duration-300 hover:shadow-elevated rounded-3xl">
                  <div className="border-b border-border/70 bg-background/80 p-3">
                    <AspectRatio ratio={16 / 10}>
                      <img src={shot.src} alt={`${shot.title} screenshot`} className="h-full w-full rounded-2xl object-cover" />
                    </AspectRatio>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl leading-none text-foreground">{shot.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{shot.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/70 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <h2 className="font-display text-3xl sm:text-4xl leading-tight text-foreground mb-4">
              Ready to transform your classroom?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start building your custom AI tutor today and see the difference in your students' learning.
            </p>
            <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full px-8 text-base font-semibold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              >
                <Link to="/build" className="group cursor-pointer flex items-center gap-2 mx-auto">
                  Get Started for Free
                  <MoveRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
