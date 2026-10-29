import { AgentSkillSection } from "../components/agent-skill-section";
import { BehaviorSection } from "../components/behavior-section";
import { ComposeSection } from "../components/compose-section";
import { HeroDemo } from "../components/hero-demo";
import { InstallationSection } from "../components/installation-section";
import { Placement } from "../components/placement";
import { SiteFooter } from "../components/site-footer";
import { SpotlightSection } from "../components/spotlight-section";
import { UsageSection } from "../components/usage-section";
import { PlaygroundProvider } from "../contexts/playground-context";

export default function Page() {
  return (
    <PlaygroundProvider>
      <header className="mx-auto flex max-w-4xl flex-col items-center gap-3.5 px-5 pt-24 text-center">
        <div className="rounded-full border bg-card px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground">
          Built on Radix · unstyled
        </div>

        <h1 className="text-5xl leading-none font-semibold tracking-tighter">radix-tour</h1>
        <p className="text-lg text-muted-foreground">Composable product tours for React.</p>

        <HeroDemo />
      </header>

      <main className="mx-auto flex max-w-160 flex-col gap-16 px-5 pt-13">
        <InstallationSection />
        <UsageSection />
        <Placement />
        <SpotlightSection />
        <ComposeSection />
        <BehaviorSection />
        <AgentSkillSection />
        <SiteFooter />
      </main>
    </PlaygroundProvider>
  );
}
