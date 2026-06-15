import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <p className="text-zinc-500 text-sm tracking-[0.3em] uppercase mb-4">
          Error 404
        </p>

        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          Page not found
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl mb-10 leading-relaxed">
          The page you are looking for does not exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:bg-zinc-200 transition"
          >
            Back Home
          </Link>

          <Link
            href="/docs"
            className="border border-zinc-700 px-8 py-4 rounded-2xl hover:bg-white hover:text-black transition"
          >
            Documentation
          </Link>
        </div>
      </div>
    </main>
  );
}