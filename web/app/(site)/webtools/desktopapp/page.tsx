export default function Home() {
  return (
    <main className=" bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-md">
          <h1 className="mb-4 text-5xl font-bold">
            Meine App
          </h1>

          <p className="mb-8 text-lg text-slate-300">
            Lade die neueste Version unserer Anwendung herunter.
            Schnell, sicher und kostenlos.
          </p>

          <a
            href="/downloads/meine-app.zip"
            download
            className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold transition hover:bg-blue-500"
          >
            Download starten
          </a>

          <div className="mt-8 text-sm text-slate-400">
            Version 1.0.0 • Windows, macOS & Linux
          </div>
        </div>
      </div>
    </main>
  );
}