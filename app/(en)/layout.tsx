import type { Viewport } from "next";
import Raiz from "../raiz";

/** Root layout for English. See the note in `(pt)/layout.tsx`. */
/* The site's floor colour, not its ink. See the note in `(pt)/layout.tsx`. */
export const viewport: Viewport = {
  themeColor: "#14110e",
  colorScheme: "dark",
};

export default function EnLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Raiz locale="en">{children}</Raiz>;
}
