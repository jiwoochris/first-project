import Image from "next/image";

import About from "@/components/About";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import UserProjects from "@/components/UserProjects";

export default function Home() {
  return (
    <>
      <Hero />
      <UserProjects />
      <About />
      <Footer />
      <section className="flex justify-center px-6 py-16">
        <a
          href="https://www.threads.com/@yoonkwon_ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition hover:opacity-90"
        >
          <Image
            src="/윤권사진.png"
            alt="윤권 — Threads 프로필 열기"
            width={720}
            height={720}
            className="h-auto w-full max-w-xs rounded-2xl border border-white/10 shadow-lg"
          />
        </a>
      </section>
    </>
  );
}
