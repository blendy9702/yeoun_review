"use client";

export default function FragranceBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full overflow-hidden"
    >
      {/* 메인 블롭들 */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />
      <div className="blob blob-5" />

      {/* 미세한 노이즈 텍스처 오버레이 */}
      <div className="absolute inset-0 noise-overlay" />

      <style>{`
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          mix-blend-mode: multiply;
          will-change: transform;
        }

        /* 따뜻한 복숭아 */
        .blob-1 {
          width: 55vw;
          height: 55vw;
          max-width: 700px;
          max-height: 700px;
          background: radial-gradient(circle at center, #e8c9a8 0%, #d4a87a00 70%);
          top: -10%;
          left: -5%;
          opacity: 0.55;
          animation: drift1 22s ease-in-out infinite alternate;
        }

        /* 세이지 그린 */
        .blob-2 {
          width: 45vw;
          height: 45vw;
          max-width: 580px;
          max-height: 580px;
          background: radial-gradient(circle at center, #b8c9a8 0%, #8aaa7800 70%);
          top: 30%;
          right: -8%;
          opacity: 0.4;
          animation: drift2 28s ease-in-out infinite alternate;
        }

        /* 라벤더 핑크 */
        .blob-3 {
          width: 38vw;
          height: 38vw;
          max-width: 500px;
          max-height: 500px;
          background: radial-gradient(circle at center, #d6c0b4 0%, #c4a89600 70%);
          bottom: -5%;
          left: 15%;
          opacity: 0.45;
          animation: drift3 34s ease-in-out infinite alternate;
        }

        /* 연한 앰버 */
        .blob-4 {
          width: 30vw;
          height: 30vw;
          max-width: 420px;
          max-height: 420px;
          background: radial-gradient(circle at center, #c9a96e 0%, #b8903e00 70%);
          top: 55%;
          left: 40%;
          opacity: 0.22;
          animation: drift4 40s ease-in-out infinite alternate;
        }

        /* 은은한 모스 그린 */
        .blob-5 {
          width: 28vw;
          height: 28vw;
          max-width: 360px;
          max-height: 360px;
          background: radial-gradient(circle at center, #8fa888 0%, #6b856200 70%);
          top: 8%;
          right: 20%;
          opacity: 0.25;
          animation: drift5 30s ease-in-out infinite alternate;
        }

        @keyframes drift1 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(4vw, 6vh) scale(1.05); }
          66%  { transform: translate(-2vw, 10vh) scale(0.97); }
          100% { transform: translate(5vw, 3vh) scale(1.03); }
        }

        @keyframes drift2 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-5vw, -4vh) scale(1.06); }
          66%  { transform: translate(-2vw, -9vh) scale(0.95); }
          100% { transform: translate(-6vw, -2vh) scale(1.04); }
        }

        @keyframes drift3 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(3vw, -5vh) scale(1.08); }
          66%  { transform: translate(6vw, -2vh) scale(0.94); }
          100% { transform: translate(2vw, -7vh) scale(1.02); }
        }

        @keyframes drift4 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-4vw, 5vh) scale(1.1); }
          100% { transform: translate(3vw, -3vh) scale(0.93); }
        }

        @keyframes drift5 {
          0%   { transform: translate(0, 0) scale(1); }
          40%  { transform: translate(4vw, 8vh) scale(1.07); }
          100% { transform: translate(-3vw, 4vh) scale(0.96); }
        }

        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
          opacity: 0.028;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
