"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";
import { codeToHtml } from "shiki";
import { shikiTheme } from "../lib/shiki-theme";

interface CodeBlockProps {
  code: string;
  lang?: "tsx" | "bash";
  small?: boolean;
}

export function CodeBlock({ code, lang = "tsx", small }: CodeBlockProps) {
  const [html, setHtml] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;

    codeToHtml(code, { lang, theme: shikiTheme }).then((result) => {
      if (!cancelled) {
        setHtml(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  function copy() {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div
      className={`relative rounded-lg border bg-card [&_pre]:overflow-x-auto [&_pre]:py-3.5 [&_pre]:pr-12 [&_pre]:pl-4 [&_pre]:font-mono [&_pre]:leading-relaxed ${small ? "[&_pre]:text-xs" : "[&_pre]:text-sm"}`}
    >
      {html ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki escapes the static snippets passed in.
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>{code}</pre>
      )}

      <button
        type="button"
        className="absolute top-2 right-2 grid size-7 cursor-pointer place-items-center rounded-md border bg-card text-muted-foreground hover:text-foreground"
        aria-label="Copy"
        onClick={copy}
      >
        {copied ? <Check size={14} strokeWidth={1.75} /> : <Copy size={14} strokeWidth={1.75} />}
      </button>
    </div>
  );
}
