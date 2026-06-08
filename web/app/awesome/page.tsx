// app/projects/page.tsx

'use client';

export const dynamic = "force-static";

import Image from "next/image";
import Link from "next/link";

const projects = [
  {
    title: "Pixel Adventure",
    description:
      "A retro styled platformer built completely with samengine. Fast loading, tiny bundle size and smooth gameplay.",
    image: "/projects/pixel-adventure.png",
    href: "/",
  },
  {
    title: "Space Arena",
    description:
      "A multiplayer browser shooter with particle effects and custom physics powered by samengine.",
    image: "/projects/space-arena.png",
    href: "#",
  },
  {
    title: "Dungeon Escape",
    description:
      "A dark dungeon crawler with procedural levels and dynamic lighting.",
    image: "/projects/dungeon-escape.png",
    href: "#",
  },
  {
    title: "Cube Racer",
    description:
      "A minimalist 3D racing prototype showing the future potential of samengine.",
    image: "/projects/cube-racer.png",
    href: "#",
  },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32 px-6 text-center border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 mb-4">
            Showcase
          </p>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Projects made with samengine
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
            Discover games and experiments created with samengine —
            lightweight, fast and fully exportable into a single HTML file.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 xl:grid-cols-3">

          {projects.map((project, index) => (
            <Link
              key={index}
              href={project.href}
              className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 hover:border-white transition-all duration-300 hover:-translate-y-1"
            >

              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-3 group-hover:text-white">
                  {project.title}
                </h2>

                <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                  {project.description}
                </p>

                <div className="mt-6 flex items-center text-sm text-zinc-500 group-hover:text-white transition">
                  View Project
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <div className="absolute -inset-px rounded-3xl border border-white/20" />
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-zinc-900 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Build your own next.
        </h2>

        <p className="text-zinc-400 max-w-2xl mx-auto mb-10">
          Create lightweight webgames with modern tooling and an insanely small output size.
        </p>

        <Link href="/start">
          <button className="bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:bg-zinc-200 transition">
            Start Building
          </button>
        </Link>
      </section>

    </main>
  );
}
