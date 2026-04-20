import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          samengine
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8">
          a Webgameframework written in Typescript for Webgames which export in a single HTML File. <i>(and 3D Games in the Future)</i>
        </p>
        <div className="flex gap-4">
          <a href="https://npmjs.com/samengine" target="_blank">
            <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
              Download Package
            </button>
          </a>
          <Link href="/docs">
            <button className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition">
              Documentation (in Progress)
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-zinc-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Features
        </h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "Ultra Performance",
              desc: "samengine has no Runtime, this means, every unused Feature will NOT be in the export!"
            },
            // {
            //   title: "Modular aufgebaut",
            //   desc: "Erweitere samengine genau so, wie du es brauchst."
            // },
            // {
            //   title: "Developer Friendly",
            //   desc: "An easy API and clear Structure with every Tool and Function for making Games"
            // },
            {
              title: "Build",
              desc: "samengine has its own buildtool to make the build workflow a lot easier!"
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-black border border-zinc-800 hover:border-white transition"
            >
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Are you Ready?
        </h2>
        <p className="text-gray-400 mb-8">
          Start new with samengine and create a new high efficient webgame!
        </p>
        <a href="https://npmjs.com/samengine" target="_blank">
          <button className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition">
            Start now
          </button>
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} samengine. All rights reserved.
      </footer>
    </main>
  );
}