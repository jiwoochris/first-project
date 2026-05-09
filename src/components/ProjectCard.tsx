import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  const { title, description, tags, demoUrl, repoUrl, accent } = project;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/20 hover:bg-white/[0.04]">
      <div
        className={`relative aspect-[16/10] w-full bg-gradient-to-br ${
          accent ?? "from-neutral-700/50 to-neutral-900/50"
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium tracking-wide text-white/70">
          Preview
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-400">
          {description}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-neutral-300"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center gap-3 text-sm">
          <a
            href={demoUrl ?? "#"}
            aria-disabled={!demoUrl}
            className="font-medium text-white transition hover:text-indigo-300"
          >
            데모 →
          </a>
          <span className="h-3 w-px bg-white/10" />
          <a
            href={repoUrl ?? "#"}
            aria-disabled={!repoUrl}
            className="font-medium text-neutral-400 transition hover:text-white"
          >
            코드
          </a>
        </div>
      </div>
    </article>
  );
}
