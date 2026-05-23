import Link from "next/link";

import { deleteProject, listUserProjects } from "@/app/projects/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SubmitProjectModal from "@/components/SubmitProjectModal";

function formatHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function UserProjects() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const projects = await listUserProjects();

  return (
    <section
      id="user-projects"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24"
    >
      <header className="mb-10 flex flex-col items-start gap-2">
        <span className="text-xs uppercase tracking-widest text-indigo-600">
          Community
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          참여자가 올린 프로젝트
        </h2>
        <p className="text-neutral-500">
          로그인한 사용자가 직접 등록한 프로젝트입니다.
        </p>
      </header>

      {user ? (
        <div className="mb-10">
          <SubmitProjectModal />
        </div>
      ) : (
        <div className="mb-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
          프로젝트를 등록하려면{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
            로그인
          </Link>
          {" "}또는{" "}
          <Link href="/signup" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
            회원가입
          </Link>
          이 필요합니다.
        </div>
      )}

      {projects.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center text-sm text-neutral-500">
          아직 등록된 프로젝트가 없습니다. 첫 번째 프로젝트를 올려보세요!
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isMine = user?.id === project.user_id;
            return (
              <li
                key={project.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                {project.image_url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video w-full overflow-hidden bg-neutral-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image_url}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  </a>
                )}
                <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-neutral-900">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-indigo-600"
                  >
                    {project.title}
                  </a>
                </h3>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 truncate text-sm text-neutral-500 transition hover:text-neutral-700"
                >
                  {formatHost(project.url)}
                </a>
                {project.description && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                    {project.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                  <span className="truncate">
                    {project.author_email ?? "익명"}
                  </span>
                  <span>{formatDate(project.created_at)}</span>
                </div>
                {isMine && (
                  <form action={deleteProject} className="mt-4">
                    <input type="hidden" name="id" value={project.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-rose-600 transition hover:text-rose-700"
                    >
                      삭제
                    </button>
                  </form>
                )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
