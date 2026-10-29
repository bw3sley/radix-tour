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
      <header className="hero">
        <div className="pill">Built on Radix · unstyled</div>

        <h1>radix-tour</h1>
        <p className="tagline">Composable product tours for React.</p>

        <HeroDemo />
      </header>

      <main className="content">
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
