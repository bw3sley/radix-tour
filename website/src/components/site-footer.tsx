const LINK =
  "underline decoration-border underline-offset-4 hover:text-accent hover:decoration-current";

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap justify-between gap-3 border-t pt-5 text-sm text-muted-foreground">
      <span>
        MIT licensed. Built by{" "}
        <a className={`${LINK} text-foreground`} href="https://github.com/bw3sley">
          bw3sley
        </a>
        .
      </span>

      <div className="flex gap-4">
        <a
          className={LINK}
          href="https://github.com/bw3sley/radix-tour#api-reference"
          target="_blank"
          rel="noreferrer"
        >
          API reference
        </a>
        <a
          className={LINK}
          href="https://github.com/bw3sley/radix-tour"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a
          className={LINK}
          href="https://www.npmjs.com/package/radix-tour"
          target="_blank"
          rel="noreferrer"
        >
          npm
        </a>
      </div>
    </footer>
  );
}
