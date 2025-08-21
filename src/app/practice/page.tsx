// src/app/practice/page.tsx
// Main Korean typing practice interface
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
import { splitTextIntoLines } from "@/utils/typing/textSplitting";
import { useKoreanTyping } from "@/hooks/useKoreanTyping";
import { usePerformanceTracking } from "@/hooks/usePerformanceTracking";
import { useLessonProgress } from "@/hooks/useLessonProgress";

function PracticePageContent() {
  const inputRef = useRef<HTMLInputElement>(null);

  // Use lesson progress hook to manage current lesson state
  const lessonProgress = useLessonProgress();

  // Break lesson text into manageable chunks
  const textLines = useMemo(
    () => splitTextIntoLines(lessonProgress.currentLesson.targetText),
    [lessonProgress.currentLesson.targetText]
  );

  // Current line data
  const currentLine = textLines[lessonProgress.currentLineIndex] || "";
  const isComplexLine = currentLine.length > 50; // Adjust UI for long content

  // Convert to individual Korean characters for precise tracking
  const currentLineJamo = useMemo(
    () => textToJamoSequence(currentLine),
    [currentLine]
  );

  // Use typing and performance hooks
  const typing = useKoreanTyping(currentLine, currentLineJamo);
  const performance = usePerformanceTracking(
    typing.currentLineTyped,
    currentLine,
    lessonProgress.currentLineIndex,
    textLines
  );

  // State to track all typed text for WPM calculation
  const [allTypedText, setAllTypedText] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Hide virtual keyboard on mobile devices where it's not helpful
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

  // Mark lesson as complete when user finishes all lines
  useEffect(() => {
    const isLessonComplete =
      lessonProgress.currentLineIndex >= textLines.length - 1 &&
      typing.currentLineTyped === currentLine;

    if (
      isLessonComplete &&
      !lessonProgress.completedLessons.includes(lessonProgress.currentLessonId)
    ) {
      // Small delay to allow user to see completion
      const timer = setTimeout(() => {
        lessonProgress.markLessonComplete(lessonProgress.currentLessonId);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    lessonProgress.currentLineIndex,
    typing.currentLineTyped,
    currentLine,
    textLines.length,
    lessonProgress.currentLessonId,
    lessonProgress.completedLessons,
    lessonProgress,
  ]);

  // Move to next line when current line is finished
  useEffect(() => {
    if (
      typing.currentLineTyped === currentLine &&
      lessonProgress.currentLineIndex < textLines.length - 1
    ) {
      const timer = setTimeout(() => {
        lessonProgress.advanceToNextLine();
        typing.resetTyping(); // Clean slate for new line
      }, 500); // pause for user to see completion
      return () => clearTimeout(timer);
    }
  }, [
    typing.currentLineTyped,
    currentLine,
    lessonProgress.currentLineIndex,
    textLines.length,
    typing,
    lessonProgress,
  ]);

  // Handle input changes and track performance
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Start timing on first keystroke
    performance.startTiming();

    const newText = typing.handleInputChange(e);

    // Update overall progress text for WPM calculation
    setAllTypedText((prev) => {
      const completedLines = textLines
        .slice(0, lessonProgress.currentLineIndex)
        .join(" ");
      return completedLines + (completedLines ? " " : "") + newText;
    });
  };

  // Reset everything for new lesson attempt
  const handleTryAgain = () => {
    lessonProgress.resetLessonState();
    typing.resetTyping();
    performance.resetTiming();
    setAllTypedText("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Start typing when user clicks "Start Lesson"
  const startTyping = () => {
    lessonProgress.startTyping();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Check if lesson is complete
  const isLessonComplete =
    lessonProgress.currentLineIndex >= textLines.length - 1 &&
    typing.currentLineTyped === currentLine;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header with stats */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Korean Typing Practice
            </h1>

            <Link
              href="/lessons"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <span>←</span>
              <span>Lessons</span>
            </Link>
          </div>

          {/* Performance stats */}
          <PerformanceStats
            wpm={performance.wpm}
            accuracy={performance.accuracy}
            progress={performance.overallProgress}
          />
        </div>
      </div>

      {/* Main practice area */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 min-h-0">
        {/* Lesson intro modal */}
        <LessonIntro
          lesson={lessonProgress.currentLesson}
          currentLineIndex={lessonProgress.currentLineIndex}
          totalLines={textLines.length}
          onStart={startTyping}
          isVisible={lessonProgress.showLessonIntro}
        />

        {/* Practice interface */}
        {!lessonProgress.showLessonIntro && (
          <>
            {/* lesson header with guidance message */}
            <div className="flex-shrink-0 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {lessonProgress.currentLesson.title}
                  </h2>

                  {/* Guidance message next to title - disabled on mobile to prevent layout shifts */}
                  <GuidanceMessage
                    message={isMobile ? undefined : typing.guidanceMessage}
                  />
                </div>

                <div className="text-sm text-gray-500">
                  Line {lessonProgress.currentLineIndex + 1} of{" "}
                  {textLines.length}
                </div>
              </div>
            </div>

            {/* Current text to type */}
            <div className="flex-shrink-0 mb-3">
              <CharacterDisplay
                targetText={currentLine}
                typedText={typing.currentLineTyped}
                jamoIndex={typing.jamoIndex}
                isCompact={isComplexLine}
              />
            </div>

            {/* Input field */}
            <div className="flex-shrink-0 mb-3">
              <input
                ref={inputRef}
                type="text"
                className={`
                  w-full ${
                    isComplexLine ? "p-2 text-lg" : "p-4 text-xl"
                  } border-2 border-gray-300
                  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  bg-white text-black shadow-sm [font-size:16px]
                `}
                value={typing.currentLineTyped}
                onChange={handleInputChange}
                onKeyDown={typing.handleKeyDown}
                onKeyUp={typing.handleKeyUp}
                placeholder="Start typing the Korean text above..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                name="korean-practice"
              />
            </div>

            {/* Korean keyboard - hide on mobile devices */}
            {!isMobile && (
              <div className="flex-1 flex items-end pb-6">
                <div className="w-full">
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

            {/* Mobile spacing when keyboard is hidden */}
            {isMobile && <div className="pb-6" />}
          </>
        )}
      </div>

      {/* Lesson completion celebration */}
      <CompletionModal
        isVisible={isLessonComplete}
        wpm={performance.wpm}
        accuracy={performance.accuracy}
        onTryAgain={handleTryAgain}
        onNextLesson={lessonProgress.handleNextLesson}
        hasNextLesson={lessonProgress.hasNextLesson}
      />
    </div>
  );
}
export default function PracticePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PracticePageContent />
    </Suspense>
  );
}
