"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import KoreanKeyboard from "@/components/KoreanKeyboard";
import { textToJamoSequence } from "@/utils/korean/decomposition";
import { CharacterDisplay } from "@/components/practice/CharacterDisplay";
import { LessonIntro } from "@/components/practice/LessonIntro";
import { CompletionModal } from "@/components/practice/CompletionModal";
import { PerformanceStats } from "@/components/practice/PerformanceStats";
import { GuidanceMessage } from "@/components/practice/GuidanceMessage";
import { KeyboardWarning } from "@/components/practice/KeyboardWarning";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { splitTextIntoLines } from "@/utils/typing/textSplitting";
import { useKoreanTyping } from "@/hooks/useKoreanTyping";
import { usePerformanceTracking } from "@/hooks/usePerformanceTracking";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useAuth } from "@/context/AuthContext";

function PracticePageContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSubmittedAttempt = useRef(false);
  const { user } = useAuth();

  const lessonProgress = useLessonProgress();
  const targetText = lessonProgress.currentLesson?.targetText || "";

  const textLines = useMemo(() => splitTextIntoLines(targetText, 35), [targetText]);
  const currentLine = textLines[lessonProgress.currentLineIndex] || "";
  const isComplexLine = currentLine.length > 30;

  const currentLineJamo = useMemo(
    () => textToJamoSequence(currentLine),
    [currentLine],
  );

  const typing = useKoreanTyping(currentLine, currentLineJamo);

  const {
    startTracking,
    endTracking,
    resetTracking,
    incrementKeystrokes,
    incrementErrors,
    submitAttempt,
    getStats,
  } = usePerformanceTracking();

  const [allTypedText, setAllTypedText] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const currentStats = getStats(allTypedText + typing.currentLineTyped);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [typing.currentLineTyped, lessonProgress.showLessonIntro]);

  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    window.addEventListener("click", focusInput);
    return () => window.removeEventListener("click", focusInput);
  }, []);

  useEffect(() => {
    typing.resetTyping();
    resetTracking();
    setAllTypedText("");
    hasSubmittedAttempt.current = false;
    setShowWarning(false);
  }, [lessonProgress.currentLessonId]);

  useEffect(() => {
    const checkIfMobile = () => {
      const width = window.innerWidth;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(width < 768 && isTouch);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isLessonComplete =
    lessonProgress.currentLineIndex >= textLines.length - 1 &&
    typing.currentLineTyped === currentLine &&
    currentLine !== "";

  useEffect(() => {
    if (
      isLessonComplete &&
      !hasSubmittedAttempt.current &&
      !lessonProgress.isLoading
    ) {
      console.log("Lesson Complete! Submitting...");
      hasSubmittedAttempt.current = true;
      endTracking();
      submitAttempt(lessonProgress.currentLessonId);

      if (
        !lessonProgress.completedLessons.includes(
          lessonProgress.currentLessonId,
        )
      ) {
        const timer = setTimeout(() => {
          lessonProgress.markLessonComplete(lessonProgress.currentLessonId);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLessonComplete, lessonProgress, submitAttempt, endTracking]);

  useEffect(() => {
    if (
      typing.currentLineTyped === currentLine &&
      lessonProgress.currentLineIndex < textLines.length - 1 &&
      currentLine !== ""
    ) {
      const timer = setTimeout(() => {
        lessonProgress.advanceToNextLine();
        typing.resetTyping();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [typing.currentLineTyped, currentLine, lessonProgress, typing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTracking();
    const newText = typing.handleInputChange(e);
    setAllTypedText((prev) => {
      const completedLines = textLines
        .slice(0, lessonProgress.currentLineIndex)
        .join(" ");
      return completedLines + (completedLines ? " " : "") + newText;
    });
  };

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isPhysicalLetterKey = /^Key[A-Z]$/.test(e.code);
    const isIMEComposing = e.nativeEvent.isComposing || (e.nativeEvent as any).keyCode === 229;
    const isModifierPressed = e.ctrlKey || e.metaKey || e.altKey;

    if (isPhysicalLetterKey && !isIMEComposing && !isModifierPressed) {
      setShowWarning(true);
    } else {
      if (showWarning && (!isPhysicalLetterKey || isIMEComposing)) {
        setShowWarning(false);
      }
    }

    startTracking();
    if (e.key !== "Shift" && e.key !== "Tab") incrementKeystrokes();
    if (e.key === "Backspace") incrementErrors();

    typing.handleKeyDown(e);
  };

  const handleTryAgain = () => {
    lessonProgress.resetLessonState();
    typing.resetTyping();
    resetTracking();
    setAllTypedText("");
    hasSubmittedAttempt.current = false;
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const startTyping = () => {
    lessonProgress.startTyping();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (lessonProgress.error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="p-8 rounded-xl border border-red-500/30 text-red-400 bg-red-950/10 backdrop-blur-md max-w-md text-center">
          <h2 className="text-lg font-bold mb-4 font-mono tracking-wide">
            SYSTEM_ERROR
          </h2>
          <p className="text-sm mb-6 text-red-300">{lessonProgress.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-sm font-bold uppercase tracking-wider hover:bg-red-500/30 hover:border-red-500/50 transition-all"
          >
            Retry_Connection
          </button>
        </div>
      </div>
    );
  }

  if (lessonProgress.isLoading || !lessonProgress.currentLesson) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-xl font-mono font-bold text-cyan-400 animate-pulse tracking-widest">
          INITIALIZING...
        </div>
      </div>
    );
  }

  const totalChars = targetText.length || 1;
  const completedChars = allTypedText.length + typing.currentLineTyped.length;
  const granularProgress = Math.min(
    100,
    Math.round((completedChars / totalChars) * 100),
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_#020617_80%)]" />

      <div className="relative z-10 flex-shrink-0 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/lessons"
              className="group flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <span className="font-mono text-lg opacity-50 group-hover:opacity-100">
                ←
              </span>
              <span className="font-bold tracking-tight text-sm">
                EXIT_LESSON
              </span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-mono text-slate-500 hidden sm:block">
              {lessonProgress.currentLesson.title}
            </h1>
          </div>

          <PerformanceStats
            wpm={currentStats.wpm}
            accuracy={currentStats.accuracy}
            progress={granularProgress}
          />
        </div>
      </div>

      <div className="relative z-0 flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 min-h-0">
        <LessonIntro
          lesson={lessonProgress.currentLesson}
          currentLineIndex={lessonProgress.currentLineIndex}
          totalLines={textLines.length}
          onStart={startTyping}
          isVisible={lessonProgress.showLessonIntro}
        />

        {!lessonProgress.showLessonIntro && (
          <>
            <div className="flex-shrink-0 mb-12 mt-8 flex justify-between items-end px-2">
              <GuidanceMessage
                message={isMobile ? undefined : typing.guidanceMessage}
              />
              <div className="font-mono text-xs text-slate-600 tracking-widest">
                LINE {lessonProgress.currentLineIndex + 1}/{textLines.length}
              </div>
            </div>

            <div
              className="flex-shrink-0 mb-8 cursor-text space-y-4"
              onClick={() => inputRef.current?.focus()}
            >
              {textLines.map((line, lineIndex) => {
                const isCurrentLine = lineIndex === lessonProgress.currentLineIndex;
                const isPastLine = lineIndex < lessonProgress.currentLineIndex;
                const isFutureLine = lineIndex > lessonProgress.currentLineIndex;

                return (
                  <div
                    key={lineIndex}
                    className={`
                      transition-all duration-300
                      ${isCurrentLine ? "opacity-100 scale-100" : ""}
                      ${isPastLine ? "opacity-40 scale-95" : ""}
                      ${isFutureLine ? "opacity-30 scale-95" : ""}
                    `}
                  >
                    <CharacterDisplay
                      targetText={line}
                      typedText={isCurrentLine ? typing.currentLineTyped : isPastLine ? line : ""}
                      jamoIndex={isCurrentLine ? typing.jamoIndex : 0}
                      isCompact={line.length > 30}
                      showCursor={isCurrentLine}
                    />
                  </div>
                );
              })}
            </div>

            <input
              ref={inputRef}
              type="text"
              className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none"
              value={typing.currentLineTyped}
              onChange={handleInputChange}
              onKeyDown={handleKeyDownWrapper}
              onKeyUp={typing.handleKeyUp}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              autoFocus
            />

            {!isMobile && (
              <div className="flex-1 flex items-end justify-center pb-8 opacity-90 hover:opacity-100 transition-opacity">
                <div className="w-full max-w-3xl transform scale-90 sm:scale-100 origin-bottom">
                  <KoreanKeyboard
                    activeKeys={typing.activeKeys}
                    guideKeys={typing.nextExpectedKey}
                    focusKeys={lessonProgress.currentLesson.focusKeys}
                    shiftActive={typing.shiftPressed}
                    isCompact={false}
                  />
                </div>
              </div>
            )}

            {isMobile && <div className="pb-6" />}
          </>
        )}
      </div>

      <KeyboardWarning
        isVisible={showWarning}
        onClose={() => setShowWarning(false)}
      />

      <CompletionModal
        isVisible={isLessonComplete}
        wpm={currentStats.wpm}
        accuracy={currentStats.accuracy}
        onTryAgain={handleTryAgain}
        onNextLesson={lessonProgress.handleNextLesson}
        hasNextLesson={lessonProgress.hasNextLesson}
        isGuest={!user}
      />
    </div>
  );
}

export default function PracticePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="bg-slate-950 h-screen w-full" />}>
        <PracticePageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
