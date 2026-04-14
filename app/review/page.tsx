"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import StarBorder from "../components/StarBorder";

/* ── 상수 ────────────────────────────────────────────────── */
const MBTI_GRID = [
  ["INTJ", "INTP", "ENTJ", "ENTP"],
  ["INFJ", "INFP", "ENFJ", "ENFP"],
  ["ISTJ", "ISTP", "ESTJ", "ESTP"],
  ["ISFJ", "ISFP", "ESFJ", "ESFP"],
];
const MBTI_ALL = MBTI_GRID.flat();

const CONC_LIST = [
  { key: "EDC", label: "EDC", sub: "오 드 코롱 · 2~4%" },
  { key: "EDT", label: "EDT", sub: "오 드 뚜알렛 · 5~15%" },
  { key: "EDP", label: "EDP", sub: "오 드 퍼퓸 · 15~20%" },
  { key: "PERFUME", label: "PARFUM", sub: "퍼퓸 · 20~30%" },
];

/* ── 모달 래퍼 ───────────────────────────────────────────── */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 딤 배경 */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* 모달 카드 */}
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-2xl border border-[#e8c070]/30 bg-[#1e1e1e]/60 p-6 sm:p-8 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm tracking-[0.3em] text-[#e8c070] uppercase">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-[#b8a888] hover:text-[#fff8ee] transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── 선택 칩 ─────────────────────────────────────────────── */
function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-xs tracking-[0.2em] border border-[#e8c070]/60 text-[#e8c070] rounded-full hover:bg-[#e8c070]/15 transition-all"
    >
      {label}
      <span className="text-[#b8a888] text-[10px]">▾</span>
    </button>
  );
}

/* ── 메인 페이지 ─────────────────────────────────────────── */
export default function ReviewPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [mbti, setMbti] = useState("");
  const [conc, setConc] = useState("");
  const [review, setReview] = useState("");
  const [mbtiOpen, setMbtiOpen] = useState(false);
  const [concOpen, setConcOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAgeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setAge(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, age, mbti, conc, review });
    setSubmitted(true);
  };

  const inputCls =
    "w-full bg-transparent border-b border-[#584840] py-3 text-sm text-[#fff8ee] placeholder-[#887060] focus:outline-none focus:border-[#e8c070] transition-colors duration-300";

  return (
    <div className="relative min-h-screen bg-[#1c1710] text-[#fff8ee] flex flex-col">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#e8c070]/12 blur-[100px]" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/10">
        <Link
          href="/"
          className="text-xs tracking-[0.35em] text-[#e8c070] uppercase hover:text-[#f5d480] transition-colors"
        >
          ← Yeoun
        </Link>
        <span className="text-[10px] tracking-[0.4em] text-[#887060] uppercase">
          Review
        </span>
      </header>

      {/* 폼 영역 */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* 타이틀 */}
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-px bg-[#e8c070]/50" />
              <span className="text-[10px] tracking-[0.45em] text-[#e8c070]/75 uppercase">
                Niche Perfume Review
              </span>
              <div className="w-8 h-px bg-[#e8c070]/50" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extralight tracking-[0.15em] text-[#fff8ee]">
              리뷰 작성
            </h1>
            <p className="mt-2 text-xs text-[#887060] tracking-widest">
              당신의 향기 경험을 남겨주세요
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              /* 제출 완료 화면 */
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 flex flex-col items-center gap-6"
              >
                <div className="w-14 h-14 rounded-full border border-[#e8c070]/60 flex items-center justify-center text-[#e8c070] text-2xl">
                  ✓
                </div>
                <p className="text-[#b8a888] tracking-widest text-sm">
                  리뷰가 등록되었습니다
                </p>
                <Link
                  href="/"
                  className="text-xs tracking-[0.3em] uppercase text-[#e8c070] border border-[#e8c070]/40 px-6 py-2 hover:bg-[#e8c070]/15 transition-colors"
                >
                  메인으로
                </Link>
              </motion.div>
            ) : (
              /* 리뷰 폼 */
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* 이름 */}
                <div>
                  <label className="block text-[12px] tracking-[0.35em] text-[#b8a888] uppercase mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    placeholder="이름을 입력해주세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>

                {/* 나이 */}
                <div>
                  <label className="block text-[12px] tracking-[0.35em] text-[#b8a888] uppercase mb-1">
                    나이
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="ex) 28"
                    value={age}
                    onChange={handleAgeInput}
                    maxLength={2}
                    required
                    className={inputCls}
                  />
                </div>

                {/* MBTI */}
                <div>
                  <label className="block text-[12px] tracking-[0.35em] text-[#b8a888] uppercase mb-2">
                    MBTI
                  </label>
                  {mbti ? (
                    <Chip label={mbti} onClick={() => setMbtiOpen(true)} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMbtiOpen(true)}
                      className="text-xs tracking-[0.2em] text-[#887060] border-b border-[#584840] pb-3 w-full text-left hover:text-[#b8a888] transition-colors"
                    >
                      MBTI 유형을 선택해주세요
                    </button>
                  )}
                </div>

                {/* 부향률 */}
                <div>
                  <label className="block text-[12px] tracking-[0.35em] text-[#b8a888] uppercase mb-2">
                    부향률
                  </label>
                  {conc ? (
                    <Chip
                      label={
                        CONC_LIST.find((c) => c.key === conc)?.label ?? conc
                      }
                      onClick={() => setConcOpen(true)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConcOpen(true)}
                      className="text-xs tracking-[0.2em] text-[#887060] border-b border-[#584840] pb-3 w-full text-left hover:text-[#b8a888] transition-colors"
                    >
                      부향률을 선택해주세요
                    </button>
                  )}
                </div>

                {/* 리뷰 */}
                <div>
                  <label className="block text-[12px] tracking-[0.35em] text-[#b8a888] uppercase mb-1">
                    리뷰
                  </label>
                  <textarea
                    placeholder="향기에 대한 솔직한 경험을 적어주세요"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-transparent border-b border-[#584840] py-3 text-sm text-[#fff8ee] placeholder-[#887060] focus:outline-none focus:border-[#e8c070] transition-colors duration-300 resize-none"
                  />
                </div>

                {/* 제출 */}
                <button
                  type="submit"
                  className="mt-2 w-full py-4 text-xs tracking-[0.4em] uppercase bg-[#e8c070] text-[#1c1710] font-medium hover:bg-[#f5d480] transition-colors duration-300 disabled:opacity-40"
                  disabled={!name || !age || !mbti || !conc || !review}
                >
                  리뷰 등록
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── MBTI 모달 ── */}
      <Modal
        open={mbtiOpen}
        onClose={() => setMbtiOpen(false)}
        title="MBTI 유형 선택"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {MBTI_ALL.map((type) => (
            <StarBorder
              key={type}
              as="button"
              type="button"
              color={mbti === type ? "#e8c070" : "#8a7560"}
              speed={mbti === type ? "2.5s" : "6s"}
              className="w-full"
              onClick={() => {
                setMbti(type);
                setMbtiOpen(false);
              }}
            >
              <span
                className={`py-2 px-1 text-xs tracking-widest font-light transition-colors ${
                  mbti === type
                    ? "text-[#e8c070]"
                    : "text-[#b8a888] hover:text-[#fff8ee]"
                }`}
              >
                {type}
              </span>
            </StarBorder>
          ))}
        </div>
      </Modal>

      {/* ── 부향률 모달 ── */}
      <Modal
        open={concOpen}
        onClose={() => setConcOpen(false)}
        title="부향률 선택"
      >
        <div className="grid grid-cols-2 gap-3">
          {CONC_LIST.map((item) => (
            <StarBorder
              key={item.key}
              as="button"
              type="button"
              color={conc === item.key ? "#e8c070" : "#8a7560"}
              speed={conc === item.key ? "2.5s" : "5s"}
              className="w-full"
              onClick={() => {
                setConc(item.key);
                setConcOpen(false);
              }}
            >
              <span className="flex flex-col items-center py-4 px-2 gap-1">
                <span
                  className={`text-sm tracking-[0.2em] font-light transition-colors ${
                    conc === item.key ? "text-[#e8c070]" : "text-[#d4c4aa]"
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[10px] text-[#8a7560] tracking-wide text-center leading-4">
                  {item.sub}
                </span>
              </span>
            </StarBorder>
          ))}
        </div>
      </Modal>
    </div>
  );
}
