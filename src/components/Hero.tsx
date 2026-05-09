export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.25),_transparent_60%)]"
      />
      <div className="relative mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
        <span className="mb-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-neutral-300">
          Web Projects Gallery
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          클로드코드 부트캠프
          <br />
          <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent">
            한곳에서 몰아보기
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-base text-neutral-400 sm:text-lg">
          실습부터 사이드 프로젝트까지, 직접 만든 작은 웹들을 모아둔
          전시관입니다. 각 프로젝트는 데모와 소스 코드로 이어집니다.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#projects"
            className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
          >
            프로젝트 보러가기
          </a>
          <a
            href="#about"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-neutral-200 transition hover:border-white/40 hover:text-white"
          >
            갤러리 소개
          </a>
        </div>
      </div>
    </section>
  );
}
