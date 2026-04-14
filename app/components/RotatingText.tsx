"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Transition, type TargetAndTransition } from "motion/react";

interface RotatingTextProps {
  texts: string[];
  mainClassName?: string;
  staggerFrom?: "first" | "last" | "center";
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
  staggerDuration?: number;
  splitLevelClassName?: string;
  transition?: Transition;
  rotationInterval?: number;
  splitBy?: "characters" | "words";
  auto?: boolean;
  loop?: boolean;
}

export default function RotatingText({
  texts,
  mainClassName = "",
  staggerFrom = "first",
  initial = { y: "100%" } as TargetAndTransition,
  animate = { y: 0 } as TargetAndTransition,
  exit = { y: "-120%" } as TargetAndTransition,
  staggerDuration = 0.025,
  splitLevelClassName = "",
  transition = { type: "spring", damping: 30, stiffness: 400 } as Transition,
  rotationInterval = 2000,
  splitBy = "characters",
  auto = false,
  loop = false,
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === texts.length - 1) return loop ? 0 : prev;
        return prev + 1;
      });
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [auto, loop, texts.length, rotationInterval]);

  const currentText = texts[currentIndex];
  const chars =
    splitBy === "characters" ? currentText.split("") : currentText.split(" ");

  const getStaggerDelay = (index: number, total: number) => {
    if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
    if (staggerFrom === "center")
      return Math.abs(index - Math.floor(total / 2)) * staggerDuration;
    return index * staggerDuration;
  };

  return (
    <span className={mainClassName}>
      <AnimatePresence mode="wait">
        <motion.span key={currentIndex} style={{ display: "inline-flex" }}>
          {chars.map((char, i) => (
            <span
              key={i}
              className={splitLevelClassName}
              style={{ display: "inline-block" }}
            >
              <motion.span
                style={{ display: "inline-block" }}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={{
                  ...transition,
                  delay: getStaggerDelay(i, chars.length),
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
