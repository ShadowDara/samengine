import SamengineGame from "./SamengineGame";

export const dynamic = "force-static";

export default function GamePage() {
  return (
    <main className="gamePage">
      <header className="gameHeader">
        <p>Next.js static route</p>
        <h1>Samengine Game</h1>
      </header>
      <SamengineGame />
    </main>
  );
}
