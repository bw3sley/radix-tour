"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";
import { codeToHtml } from "shiki";

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

    codeToHtml(code, { lang, theme: "github-light" }).then((result) => {
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
    <div className="code" data-small={small ? "" : undefined}>
      {html ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki escapes the static snippets passed in.
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>{code}</pre>
      )}

      <button type="button" className="copy" aria-label="Copy" onClick={copy}>
        {copied ? <Check size={14} strokeWidth={1.75} /> : <Copy size={14} strokeWidth={1.75} />}
      </button>
    </div>
  );
}
