import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home">
      <h1>Samengine Next.js Test</h1>
      <p>This static Next.js test project runs a samengine game on /game.</p>
      <Link href="/game">Open game</Link>
    </main>
  );
}
