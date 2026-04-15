"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function ReviewsComingSoonButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <div className="relative">
      <button
        onClick={() => setShow(true)}
        className="px-8 py-3 text-xs tracking-[0.3em] uppercase bg-[#e8c070] text-[#1c1710] font-medium hover:bg-[#f5d480] transition-colors duration-300"
      >
        REVIEWS
      </button>

      <div
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-3
          flex items-center gap-2.5 whitespace-nowrap
          px-6 py-3.5 rounded-sm
          bg-[#1c1710] border border-[#e8c070]/40
          text-[#e8c070] text-[12px] tracking-[0.2em] uppercase
          shadow-lg shadow-black/40
          pointer-events-none
          transition-all duration-300
          ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
        `}
      >
        <Clock className="w-4 h-4 shrink-0" />
        <span>준비 중입니다</span>
        <span className="text-[#e8c070]/50">·</span>
        <span className="text-[#b8a888]">Coming Soon</span>
        {/* 말풍선 꼬리 */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#e8c070]/40" />
      </div>
    </div>
  );
}
