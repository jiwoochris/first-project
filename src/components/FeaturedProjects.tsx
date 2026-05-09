import { projects } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

export default function FeaturedProjects() {
  return (
    <section
      id="projects"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24"
    >
      <header className="mb-12 flex flex-col items-start gap-2">
        <span className="text-xs uppercase tracking-widest text-indigo-300">
          Featured
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          프로젝트
        </h2>
        <p className="text-neutral-400">
          최근 작업을 카드로 모았습니다. 곧 데모/코드 링크가 추가됩니다.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
