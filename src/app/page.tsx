import Image from "next/image";

import About from "@/components/About";
import FeaturedProjects from "@/components/FeaturedProjects";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <About />
      <Footer />
      <section className="flex justify-center px-6 py-16">
        <Image
          src="/윤권사진.png"
          alt="윤권"
          width={720}
          height={720}
          className="h-auto w-full max-w-xs rounded-2xl border border-white/10 shadow-lg"
        />
      </section>
    </>
  );
}
