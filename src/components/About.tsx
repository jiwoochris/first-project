export default function About() {
  return (
    <section
      id="about"
      className="mx-auto w-full max-w-4xl scroll-mt-20 px-6 py-24"
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 sm:p-14">
        <span className="text-xs uppercase tracking-widest text-indigo-300">
          About
        </span>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          이 갤러리에 대하여
        </h2>
        <p className="mt-4 leading-relaxed text-neutral-300">
          이 사이트는 제가 학습하면서 만든 다양한 웹 프로젝트들을 모아두는
          개인 전시관입니다. 각 프로젝트는 짧은 설명과 함께 데모/소스 코드
          링크로 연결되어, 결과물뿐 아니라 과정도 함께 살펴볼 수 있도록
          기획되었습니다. 작은 실험부터 완성된 사이드 프로젝트까지 차근차근
          쌓아갑니다.
        </p>
      </div>
    </section>
  );
}
