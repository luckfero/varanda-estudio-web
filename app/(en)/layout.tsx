import type { Viewport } from "next";
import Raiz from "../raiz";

/** Root layout for English. See the note in `(pt)/layout.tsx`. */
export const viewport: Viewport = {
  themeColor: "#f4efe6",
  colorScheme: "light",
};

export default function EnLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Raiz locale="en">{children}</Raiz>;
}
