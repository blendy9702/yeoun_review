"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import StarBorder from "../components/StarBorder";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/* ── 상수 ────────────────────────────────────────────────── */
const MBTI_ALL = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISTP",
  "ESTJ",
  "ESTP",
  "ISFJ",
  "ISFP",
  "ESFJ",
  "ESFP",
] as const;

const CONC_LIST = [
  { key: "EDC", label: "EDC", sub: "오 드 코롱 · 2~4%" },
  { key: "EDT", label: "EDT", sub: "오 드 뚜알렛 · 5~15%" },
  { key: "EDP", label: "EDP", sub: "오 드 퍼퓸 · 15~20%" },
  { key: "PERFUME", label: "PARFUM", sub: "퍼퓸 · 20~30%" },
] as const;

/* ── Zod 스키마 ──────────────────────────────────────────── */
const schema = z.object({
  name: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .max(20, "이름은 20자 이내로 입력해주세요."),
  age: z
    .string()
    .min(1, "나이를 입력해주세요.")
    .regex(/^\d{1,2}$/, "1~99 사이의 숫자를 입력해주세요.")
    .refine((v) => +v >= 1 && +v <= 99, "1~99 사이의 나이를 입력해주세요."),
  mbti: z.string().min(1, "MBTI 유형을 선택해주세요."),
  concentration: z.string().min(1, "부향률을 선택해주세요."),
  review: z
    .string()
    .min(10, "리뷰는 최소 10자 이상 작성해주세요.")
    .max(500, "리뷰는 500자 이내로 작성해주세요."),
});

type FormValues = z.infer<typeof schema>;

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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-2xl border border-[#3d5a38]/20 bg-[#faf7f2]/98 p-6 sm:p-8 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm tracking-[0.3em] text-[#3d5a38] uppercase">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-[#8a8276] hover:text-[#1e1a14] transition-colors text-xl leading-none"
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
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-xs tracking-[0.2em] border border-[#3d5a38]/50 text-[#3d5a38] rounded-full hover:bg-[#3d5a38]/10 transition-all"
    >
      {label}
      <span className="text-[#8a8276] text-[10px]">▾</span>
    </button>
  );
}

/* ── 메인 페이지 ─────────────────────────────────────────── */
export default function ReviewPage() {
  const [mbtiOpen, setMbtiOpen] = useState(false);
  const [concOpen, setConcOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      age: "",
      mbti: "",
      concentration: "",
      review: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("reviews").insert({
        name: data.name.trim(),
        age: Number.parseInt(data.age, 10),
        mbti: data.mbti,
        concentration: data.concentration,
        review: data.review.trim(),
      });
      if (error) {
        setSubmitError(error.message);
        return;
      }
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-transparent border-b border-[#c4bbb0] py-3 text-sm text-[#1e1a14] placeholder-[#8a8276] focus:outline-none focus:border-[#3d5a38] aria-invalid:border-red-400 transition-colors duration-300";

  const selectedMbti = useWatch({ control: form.control, name: "mbti" });
  const selectedConc = useWatch({
    control: form.control,
    name: "concentration",
  });

  return (
    <div className="relative min-h-screen bg-[#f5f0e8] text-[#1e1a14] flex flex-col">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#3d5a38]/8 blur-[100px]" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1e1a14]/10">
        <Link
          href="/"
          className="text-xs tracking-[0.35em] text-[#3d5a38] uppercase hover:text-[#4e7048] transition-colors"
        >
          ← Yeoun
        </Link>
        <span className="text-[10px] tracking-[0.4em] text-[#8a8276] uppercase">
          Review
        </span>
      </header>

      {/* 폼 영역 */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* 타이틀 */}
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-px bg-[#3d5a38]/40" />
              <span className="text-[12px] tracking-[0.45em] text-[#6b6459] uppercase">
                Niche Perfume Review
              </span>
              <div className="w-8 h-px bg-[#3d5a38]/40" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extralight tracking-[0.15em] text-[#1e1a14]">
              리뷰 작성
            </h1>
            <p className="mt-2 text-xs text-[#8a8276] tracking-widest">
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
                <div className="w-14 h-14 rounded-full border border-[#3d5a38]/60 flex items-center justify-center text-[#3d5a38] text-2xl">
                  ✓
                </div>
                <p className="text-[#6b6459] tracking-widest text-sm">
                  리뷰가 등록되었습니다
                </p>
                <Link
                  href="/"
                  className="text-xs tracking-[0.3em] uppercase text-[#3d5a38] border border-[#3d5a38]/40 px-6 py-2 hover:bg-[#3d5a38]/10 transition-colors"
                >
                  메인으로
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-7"
                  >
                    {/* 이름 */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이름</FormLabel>
                          <FormControl>
                            <input
                              placeholder="이름을 입력해주세요"
                              className={inputCls}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 나이 */}
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>나이</FormLabel>
                          <FormControl>
                            <input
                              inputMode="numeric"
                              placeholder="ex) 28"
                              maxLength={2}
                              className={inputCls}
                              {...field}
                              onChange={(e) => {
                                const v = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 2);
                                field.onChange(v);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* MBTI */}
                    <FormField
                      control={form.control}
                      name="mbti"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MBTI</FormLabel>
                          <FormControl>
                            <input type="hidden" {...field} />
                          </FormControl>
                          {selectedMbti ? (
                            <Chip
                              label={selectedMbti}
                              onClick={() => setMbtiOpen(true)}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setMbtiOpen(true);
                                field.onBlur();
                              }}
                              className="text-xs tracking-[0.2em] text-[#8a8276] border-b border-[#c4bbb0] pb-3 w-full text-left hover:text-[#6b6459] transition-colors"
                            >
                              MBTI 유형을 선택해주세요
                            </button>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 부향률 */}
                    <FormField
                      control={form.control}
                      name="concentration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>부향률</FormLabel>
                          <FormControl>
                            <input type="hidden" {...field} />
                          </FormControl>
                          {selectedConc ? (
                            <Chip
                              label={
                                CONC_LIST.find((c) => c.key === selectedConc)
                                  ?.label ?? selectedConc
                              }
                              onClick={() => setConcOpen(true)}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setConcOpen(true);
                                field.onBlur();
                              }}
                              className="text-xs tracking-[0.2em] text-[#8a8276] border-b border-[#c4bbb0] pb-3 w-full text-left hover:text-[#6b6459] transition-colors"
                            >
                              부향률을 선택해주세요
                            </button>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 리뷰 */}
                    <FormField
                      control={form.control}
                      name="review"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>리뷰</FormLabel>
                          <FormControl>
                            <textarea
                              placeholder="향기에 대한 솔직한 경험을 적어주세요 (최소 10자)"
                              rows={4}
                              className="w-full bg-transparent border-b border-[#c4bbb0] py-3 text-sm text-[#1e1a14] placeholder-[#8a8276] focus:outline-none focus:border-[#3d5a38] aria-invalid:border-red-400 transition-colors duration-300 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <div className="flex items-center justify-between">
                            <FormMessage />
                            <span className="text-[11px] text-[#8a8276] ml-auto">
                              {field.value.length} / 500
                            </span>
                          </div>
                        </FormItem>
                      )}
                    />

                    {submitError && (
                      <p
                        className="text-sm text-red-400/90 text-center"
                        role="alert"
                      >
                        {submitError}
                      </p>
                    )}

                    {/* 제출 */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-2 w-full py-4 text-xs tracking-[0.4em] uppercase bg-[#3d5a38] text-[#f5f0e8] font-medium hover:bg-[#4e7048] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? "등록 중…" : "리뷰 등록"}
                    </button>
                  </form>
                </Form>
              </motion.div>
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
              color={selectedMbti === type ? "#3d5a38" : "#c4bbb0"}
              speed={selectedMbti === type ? "2.5s" : "6s"}
              className="w-full"
              onClick={() => {
                form.setValue("mbti", type, { shouldValidate: true });
                setMbtiOpen(false);
              }}
            >
              <span
                className={`py-2 px-1 text-xs tracking-widest font-light transition-colors ${
                  selectedMbti === type
                    ? "text-[#3d5a38] font-normal"
                    : "text-[#4a4540] hover:text-[#1e1a14]"
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
              color={selectedConc === item.key ? "#3d5a38" : "#c4bbb0"}
              speed={selectedConc === item.key ? "2.5s" : "5s"}
              className="w-full"
              onClick={() => {
                form.setValue("concentration", item.key, {
                  shouldValidate: true,
                });
                setConcOpen(false);
              }}
            >
              <span className="flex flex-col items-center py-4 px-2 gap-1">
                <span
                  className={`text-[14px] tracking-[0.2em] font-light transition-colors ${
                    selectedConc === item.key
                      ? "text-[#3d5a38] font-normal"
                      : "text-[#4a4540]"
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[12px] text-[#6b6459] tracking-wide text-center leading-4">
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
