import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Check, Copy } from "lucide-react";

/**
 * Preprocesses common LLM mathematical representations into standard LaTeX delimiters
 * recognized by remark-math ($ for inline, $$ for block).
 */
export function preprocessLaTeX(text: string): string {
  if (!text) return "";

  return text
    // Replace block delimiters \[ ... \] with $$ ... $$
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `\n$$\n${math.trim()}\n$$\n`)
    // Replace inline delimiters \( ... \) with $ ... $
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math.trim()}$`)
    // Replace parentheses wrapping LaTeX expressions like (\vec v = \Delta\vec r / \Delta t)
    .replace(/\(([\\a-zA-Z0-9_\s\+\-\*\/\=\^\,\.\(\)]*?\\[a-zA-Z]+[\s\S]*?)\)/g, (match, math) => {
      if (/\\(vec|Delta|frac|times|alpha|beta|theta|pi|partial|int|sum|sqrt|cdot|approx|ne|le|ge)\b/.test(math)) {
        return `$${math.trim()}$`;
      }
      return match;
    });
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative group my-3 rounded-xl border border-border/70 bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-muted/70 border-b border-border/50 text-[11px] font-mono text-muted-foreground">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-background/60"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed bg-card/40 text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface FormattedMessageProps {
  content: string;
  size?: "sm" | "md";
  className?: string;
}

export function FormattedMessage({
  content,
  size = "md",
  className = "",
}: FormattedMessageProps) {
  const processed = preprocessLaTeX(content);
  const isSm = size === "sm";

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none text-foreground ${
        isSm ? "text-xs sm:text-sm leading-relaxed" : "text-sm sm:text-base leading-relaxed"
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-4 mb-2 pb-1 border-b border-border/40">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground mt-3.5 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold text-foreground mt-2.5 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed break-words">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2.5 space-y-1 marker:text-primary/70">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-2.5 space-y-1 marker:text-primary/70">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-primary/50 bg-primary/5 dark:bg-primary/10 rounded-r-lg px-3.5 py-1.5 my-2.5 text-muted-foreground not-italic text-xs sm:text-sm">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-border/60" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border/70 shadow-xs">
              <table className="min-w-full divide-y divide-border/60 text-xs sm:text-sm text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 font-semibold text-foreground tracking-wider">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-border/40 text-foreground/90">{children}</td>
          ),
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isMultiline = String(children).includes("\n");

            if (match || isMultiline) {
              return <CodeBlock code={codeString} language={match ? match[1] : undefined} />;
            }
            return (
              <code className="rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-primary border border-border/50">
                {children}
              </code>
            );
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
