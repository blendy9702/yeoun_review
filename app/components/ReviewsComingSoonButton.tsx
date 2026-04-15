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
        className="px-8 py-3 text-xs tracking-[0.3em] uppercase bg-[#3d5a38] text-[#f5f0e8] font-medium hover:bg-[#4e7048] transition-colors duration-300"
      >
        REVIEWS
      </button>

      <div
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-3
          flex items-center gap-2.5 whitespace-nowrap
          px-6 py-3.5 rounded-sm
          bg-[#f5f0e8] border border-[#3d5a38]/40
          text-[#3d5a38] text-[12px] tracking-[0.2em] uppercase
          shadow-lg shadow-black/10
          pointer-events-none
          transition-all duration-300
          ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
        `}
      >
        <Clock className="w-4 h-4 shrink-0" />
        <span>준비 중입니다</span>
        <span className="text-[#3d5a38]/40">·</span>
        <span className="text-[#6b6459]">Coming Soon</span>
        {/* 말풍선 꼬리 */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#3d5a38]/40" />
      </div>
    </div>
  );
}
