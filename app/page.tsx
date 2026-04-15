import Link from "next/link";
import Plasma from "./components/Plasma";
import RotatingText from "./components/RotatingText";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#1c1710] text-[#fff8ee] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Plasma
          color="#e8c070"
          speed={0.4}
          direction="forward"
          scale={0.8}
          opacity={1}
          quality="auto"
        />
      </div>

      {/* 상단 네비게이션 */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6">
        <span className="text-xs tracking-[0.35em] text-[#e8c070] uppercase font-light">
          Yeoun
        </span>
        <nav className="hidden md:flex items-center gap-10">
          {["Reviews", "Story", "Creative"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs tracking-[0.2em] uppercase text-[#d4c4aa] hover:text-[#fff8ee] transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </nav>
        <a
          href="https://yeoun-five.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-[0.2em] uppercase text-[#e8c070] border border-[#e8c070]/50 px-4 py-2 hover:bg-[#e8c070]/15 transition-colors duration-300"
        >
          공식 사이트
        </a>
      </header>

      {/* 히어로 섹션 */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 gap-8">
        {/* 장식 라인 */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-px bg-[#e8c070]/60" />
          <span className="text-[10px] tracking-[0.45em] text-[#e8c070]/80 uppercase">
            Niche Perfume
          </span>
          <div className="w-12 h-px bg-[#e8c070]/60" />
        </div>

        {/* 메인 타이틀 */}
        <h1 className="flex flex-col items-center gap-1 leading-none">
          <span className="text-[clamp(3.5rem,12vw,9rem)] font-extralight tracking-[0.2em] text-[#fff8ee]">
            YEOUN
          </span>
          <span className="w-full h-px bg-linear-to-r from-transparent via-[#e8c070]/70 to-transparent my-1" />
          <span className="text-[clamp(2rem,7vw,5.5rem)] font-extralight tracking-[0.35em] text-[#e8c070] overflow-hidden h-[1.2em] flex items-center">
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
        <p className="max-w-md text-sm md:text-base leading-7 text-[#b8a888] tracking-wide font-light mt-2">
          향기는 기억이 된다.
          <br />
          여운 향수의 섬세한 이야기를 담아냅니다.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <a
            href="#"
            rel="noopener noreferrer"
            className="px-8 py-3 text-xs tracking-[0.3em] uppercase bg-[#e8c070] text-[#1c1710] font-medium hover:bg-[#f5d480] transition-colors duration-300"
          >
            REVIEWS
          </a>
          <Link
            href="/review"
            className="px-8 py-3 text-xs tracking-[0.3em] uppercase border border-[#fff8ee]/30 text-[#d4c4aa] hover:text-[#fff8ee] hover:border-[#fff8ee]/60 transition-colors duration-300"
          >
            리뷰 작성
          </Link>
        </div>
      </main>

      {/* 하단 */}
      <footer className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6">
        <span className="text-[10px] tracking-[0.25em] text-[#887060] uppercase">
          © 2025 Yeoun
        </span>
        <span className="text-[10px] tracking-[0.25em] text-[#887060] uppercase">
          Crafted with care
        </span>
      </footer>
    </div>
  );
}
