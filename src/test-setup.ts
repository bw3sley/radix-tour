import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";

import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom does not implement these browser APIs, but Radix Popper and the spotlight rely on them.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

Element.prototype.scrollIntoView ??= () => {};

// jsdom has no matchMedia. Tests flip `matches` by replacing window.matchMedia.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;
