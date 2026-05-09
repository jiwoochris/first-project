export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  demoUrl?: string;
  repoUrl?: string;
  accent?: string;
};

export const projects: Project[] = [
  {
    slug: "todo-app",
    title: "할 일 관리 앱",
    description: "드래그 앤 드롭 정렬과 로컬 저장을 지원하는 To-do 앱.",
    tags: ["React", "TypeScript", "LocalStorage"],
    accent: "from-rose-500/40 to-orange-500/40",
  },
  {
    slug: "weather-dashboard",
    title: "날씨 대시보드",
    description: "도시 검색과 시간대별 예보를 보여주는 대시보드.",
    tags: ["Next.js", "API", "Charts"],
    accent: "from-sky-500/40 to-cyan-500/40",
  },
  {
    slug: "markdown-editor",
    title: "마크다운 에디터",
    description: "실시간 미리보기와 단축키를 갖춘 마크다운 편집기.",
    tags: ["React", "Tailwind"],
    accent: "from-violet-500/40 to-fuchsia-500/40",
  },
  {
    slug: "pomodoro-timer",
    title: "뽀모도로 타이머",
    description: "집중/휴식 사이클을 자동으로 순환시키는 학습 타이머.",
    tags: ["Vanilla JS", "PWA"],
    accent: "from-emerald-500/40 to-teal-500/40",
  },
  {
    slug: "expense-tracker",
    title: "가계부",
    description: "카테고리별 지출을 시각화하는 미니 가계부.",
    tags: ["Next.js", "Recharts"],
    accent: "from-amber-500/40 to-yellow-500/40",
  },
  {
    slug: "chatroom",
    title: "실시간 채팅방",
    description: "WebSocket 기반의 가벼운 멀티룸 채팅 데모.",
    tags: ["Node.js", "Socket.IO"],
    accent: "from-indigo-500/40 to-blue-500/40",
  },
];
