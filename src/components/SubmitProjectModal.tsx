"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  previewProjectImage,
  submitProject,
  type SubmitProjectState,
} from "@/app/projects/actions";

export default function SubmitProjectModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<SubmitProjectState, FormData>(
    submitProject,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewReqIdRef = useRef(0);
  const lastFetchedUrlRef = useRef<string>("");

  async function fetchPreview(rawUrl: string) {
    const url = rawUrl.trim();
    if (!url) {
      setPreviewUrl(null);
      setPreviewError(null);
      lastFetchedUrlRef.current = "";
      return;
    }
    if (!/^https?:\/\/.+/i.test(url)) {
      setPreviewUrl(null);
      setPreviewError(null);
      lastFetchedUrlRef.current = "";
      return;
    }
    if (lastFetchedUrlRef.current === url) return;
    lastFetchedUrlRef.current = url;
    const reqId = ++previewReqIdRef.current;
    setPreviewing(true);
    setPreviewError(null);
    try {
      const img = await previewProjectImage(url);
      if (reqId !== previewReqIdRef.current) return;
      setPreviewUrl(img);
      if (!img) setPreviewError("이미지를 찾지 못했습니다.");
    } catch {
      if (reqId !== previewReqIdRef.current) return;
      setPreviewError("미리보기를 불러오지 못했습니다.");
      setPreviewUrl(null);
    } finally {
      if (reqId === previewReqIdRef.current) setPreviewing(false);
    }
  }

  useEffect(() => {
    if (state?.message) {
      formRef.current?.reset();
      const t = setTimeout(() => {
        setPreviewUrl(null);
        setPreviewError(null);
        lastFetchedUrlRef.current = "";
        setOpen(false);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleInputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, pending]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
      >
        내 프로젝트 등록하기
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => !pending && setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="submit-project-title"
                  className="text-lg font-semibold text-white"
                >
                  내 프로젝트 등록하기
                </h3>
                <p className="mt-1 text-sm text-neutral-400">
                  제목과 URL을 입력하면 AI가 사이트를 읽고 3줄 설명을 자동
                  생성합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !pending && setOpen(false)}
                disabled={pending}
                aria-label="닫기"
                className="-mr-1 -mt-1 rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-5">
              <div className="grid gap-4">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-neutral-300"
                  >
                    제목
                  </label>
                  <input
                    id="title"
                    ref={titleInputRef}
                    name="title"
                    type="text"
                    required
                    maxLength={80}
                    placeholder="예: 할 일 관리 앱"
                    className="w-full rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="url"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-neutral-300"
                  >
                    URL
                  </label>
                  <input
                    id="url"
                    name="url"
                    type="url"
                    required
                    placeholder="https://..."
                    onBlur={(e) => fetchPreview(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchPreview(e.currentTarget.value);
                      }
                    }}
                    className="w-full rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-neutral-300">
                    썸네일 미리보기
                  </p>
                  <input type="hidden" name="image_url" value={previewUrl ?? ""} />
                  <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-neutral-900/60">
                    {previewing ? (
                      <span className="text-xs text-neutral-400">불러오는 중…</span>
                    ) : previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="썸네일 미리보기"
                        className="h-full w-full object-cover"
                        onError={() => {
                          setPreviewUrl(null);
                          setPreviewError("이미지를 표시할 수 없습니다.");
                        }}
                      />
                    ) : (
                      <span className="px-3 text-center text-xs text-neutral-500">
                        {previewError ?? "URL을 입력하면 자동으로 썸네일을 찾습니다."}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {state?.error && (
                <p className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {state.error}
                </p>
              )}
              {state?.message && (
                <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {state.message}
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "AI 분석 중…" : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
