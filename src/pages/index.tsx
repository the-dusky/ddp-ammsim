import { Geist } from "next/font/google";
import AMMSimulator from "../components/AMMSimulator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">AMM Simulator</h1>
        <AMMSimulator />
      </main>
    </div>
  );
}

