import Link from "next/link";
import FragranceBackground from "./components/FragranceBackground";
import ReviewsComingSoonButton from "./components/ReviewsComingSoonButton";
import RotatingText from "./components/RotatingText";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#f8efe2] text-[#1e1a14] overflow-hidden">
      {/* fixed: 뒤로가기 시 flex 레이아웃 전에 absolute 자식 높이가 0이 되는 문제 방지 */}
      <div className="fixed inset-0 z-0 h-[100dvh] w-full pointer-events-none">
        <FragranceBackground />
      </div>

      {/* 상단 네비게이션 */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6">
        <span className="text-xs tracking-[0.35em] text-[#1e1a14] uppercase font-light">
          Yeoun
        </span>
        <a
          href="https://yeoun-five.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-[0.2em] uppercase text-[#1e1a14] border border-[#1e1a14]/50 px-4 py-2 hover:bg-[#1e1a14]/8 transition-colors duration-300"
        >
          공식 사이트
        </a>
      </header>

      {/* 히어로 섹션 */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 gap-8">
        {/* 장식 라인 */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-px bg-[#3d5a38]/50" />
          <span className="text-[12px] tracking-[0.45em] text-[#6b6459] uppercase">
            Niche Perfume
          </span>
          <div className="w-12 h-px bg-[#3d5a38]/50" />
        </div>

        {/* 메인 타이틀 */}
        <h1 className="flex flex-col items-center gap-1 leading-none">
          <span className="text-[clamp(3.5rem,12vw,9rem)] font-extralight tracking-[0.2em] text-[#1e1a14]">
            YEOUN
          </span>
          <span className="w-full h-px bg-linear-to-r from-transparent via-[#3d5a38]/50 to-transparent my-1" />
          <span className="text-[clamp(2rem,7vw,5.5rem)] font-extralight tracking-[0.35em] text-[#3d5a38] overflow-hidden h-[1.2em] flex items-center">
            <RotatingText
              texts={["REVIEW", "STORY", "CREATIVE"]}
              mainClassName="inline-flex"
              staggerFrom="first"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              exit={{ y: "-110%" }}
              staggerDuration={0.04}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
              rotationInterval={2800}
              splitBy="characters"
              auto
              loop
            />
          </span>
        </h1>

        {/* 서브 카피 */}
        <p className="max-w-md text-sm md:text-base leading-7 text-[#6b6459] tracking-wide font-light mt-2">
          향기는 기억이 된다.
          <br />
          여운 향수의 섬세한 이야기를 담아냅니다.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <ReviewsComingSoonButton />
          <Link
            href="/review"
            className="px-8 py-3 text-xs tracking-[0.3em] uppercase border border-[#1e1a14]/30 text-[#6b6459] hover:text-[#1e1a14] hover:border-[#1e1a14]/60 transition-colors duration-300"
          >
            리뷰 작성
          </Link>
        </div>
      </main>

      {/* 하단 */}
      <footer className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6">
        <span className="text-[10px] tracking-[0.25em] text-[#8a8276] uppercase">
          © 2025 Yeoun
        </span>
        <span className="text-[10px] tracking-[0.25em] text-[#8a8276] uppercase">
          Crafted with care
        </span>
      </footer>
    </div>
  );
}
