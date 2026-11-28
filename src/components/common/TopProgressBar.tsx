"use client";

import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressTracker({ onFinish }: { onFinish: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onFinish();
  }, [pathname, searchParams, onFinish]);

  return null;
}

export default function TopProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trickleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);

    setVisible(true);
    setProgress(25);

    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + Math.floor(Math.random() * 12 + 6);
        if (prev < 80) return prev + Math.floor(Math.random() * 6 + 3);
        if (prev < 92) return prev + 1;
        return prev;
      });
    }, 180);
  }, []);

  const finishProgress = useCallback(() => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    setProgress(100);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  }, []);

  // Intercept click on internal links to start progress immediately
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find nearest anchor tag
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, hashes, new tabs
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's the exact same page
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      startProgress();
    };

    const handleCustomStart = () => startProgress();
    const handleCustomFinish = () => finishProgress();

    window.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("start-page-progress", handleCustomStart);
    window.addEventListener("finish-page-progress", handleCustomFinish);

    return () => {
      window.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("start-page-progress", handleCustomStart);
      window.removeEventListener("finish-page-progress", handleCustomFinish);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    };
  }, [startProgress, finishProgress]);

  if (!visible && progress === 0) {
    return (
      <Suspense fallback={null}>
        <ProgressTracker onFinish={finishProgress} />
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <ProgressTracker onFinish={finishProgress} />
      </Suspense>
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[999999] h-[3px] pointer-events-none transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-500 shadow-[0_0_12px_rgba(99,102,241,0.9),0_0_5px_rgba(139,92,246,0.7)] transition-all duration-200 ease-out"
          style={{
            width: `${progress}%`,
          }}
        >
          {/* Leading glow bead */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/70 blur-[1px]" />
        </div>
      </div>
    </>
  );
}
