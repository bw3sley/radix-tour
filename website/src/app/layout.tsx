import type { ReactNode } from "react";

export const metadata = {
  title: "radix-tour",
  description: "An unstyled product tour library for React, built on Radix primitives.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
