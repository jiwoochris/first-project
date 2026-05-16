"use server";

import { revalidatePath } from "next/cache";

import { fetchPageInfo, summarizeWithGemini } from "@/lib/ai/summarize";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserProject = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
  author_email: string | null;
  description: string | null;
  image_url: string | null;
};

export type SubmitProjectState = {
  error?: string;
  message?: string;
} | undefined;

const URL_PATTERN = /^https?:\/\/.+/i;

export async function submitProject(
  _prev: SubmitProjectState,
  formData: FormData,
): Promise<SubmitProjectState> {
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!title || !url) {
    return { error: "제목과 URL을 모두 입력해 주세요." };
  }
  if (title.length > 80) {
    return { error: "제목은 80자 이내로 입력해 주세요." };
  }
  if (!URL_PATTERN.test(url)) {
    return { error: "URL은 http:// 또는 https:// 로 시작해야 합니다." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인 후 프로젝트를 등록할 수 있습니다." };
  }

  const submittedImageUrl = (() => {
    const raw = String(formData.get("image_url") ?? "").trim();
    if (!raw) return null;
    try {
      const u = new URL(raw);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      return u.toString();
    } catch {
      return null;
    }
  })();

  const pageInfo = await fetchPageInfo(url);
  const description = pageInfo.text
    ? await summarizeWithGemini({ title, url, pageText: pageInfo.text })
    : null;
  const imageUrl = submittedImageUrl ?? pageInfo.imageUrl;

  const { error } = await supabase.from("user_projects").insert({
    user_id: user.id,
    title,
    url,
    author_email: user.email ?? null,
    description,
    image_url: imageUrl,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { message: "프로젝트가 등록되었습니다." };
}

export async function deleteProject(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_projects").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/");
}

export async function listUserProjects(): Promise<UserProject[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_projects")
    .select("id, user_id, title, url, created_at, author_email, description, image_url")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as UserProject[];
}

export async function previewProjectImage(url: string): Promise<string | null> {
  const trimmed = url.trim();
  if (!URL_PATTERN.test(trimmed)) return null;
  const info = await fetchPageInfo(trimmed);
  return info.imageUrl;
}
