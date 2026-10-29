import { TourDemo, type TourDemoProps } from "../components/tour-demo";

type SearchParams = Record<string, string | undefined>;

// Every scenario is a query parameter, so each spec opens exactly the page it needs.
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <TourDemo
      motion={params.motion !== "off"}
      opener={params.opener as TourDemoProps["opener"]}
      scenario={params.scenario as TourDemoProps["scenario"]}
      bare={params.bare === "1"}
      keyed={params.keyed === "1"}
      hideSecond={params.hideSecond === "1"}
      preventAutoFocus={params.autofocus === "prevent"}
      preventKeyDown={params.keydown === "prevent"}
    />
  );
}
