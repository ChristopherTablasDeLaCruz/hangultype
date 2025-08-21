// src/app/lessons/page.tsx
// Organized overview of all Korean typing lessons
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ALL_LESSONS } from "@/data/lessons";
import { Lesson } from "@/types/lesson";

export default function LessonsPage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("korean-typing-completed");
      setCompletedLessons(saved ? JSON.parse(saved) : []);
    }
  }, []);

  const isLessonCompleted = (lesson: Lesson) => {
    return completedLessons.includes(lesson.id);
  };

  const getStatusIcon = (lesson: Lesson) => {
    return isLessonCompleted(lesson) ? "✓" : "▶";
  };

  const progressPercentage =
    (completedLessons.length / ALL_LESSONS.length) * 100;

  const getLessonCardStyle = (lesson: Lesson) => {
    return isLessonCompleted(lesson)
      ? "border-green-500 bg-green-50 text-green-900"
      : "border-blue-500 bg-blue-50 text-blue-900";
  };

  const getDifficultyBadge = (difficulty: number) => {
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-blue-100 text-blue-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800",
    };

    const labels = {
      1: "Beginner",
      2: "Easy",
      3: "Medium",
      4: "Hard",
      5: "Expert",
    };

    return {
      color:
        colors[difficulty as keyof typeof colors] ||
        "bg-gray-100 text-gray-800",
      label: labels[difficulty as keyof typeof labels] || "Unknown",
    };
  };

  if (!mounted) return <div>Loading...</div>;

  // Group lessons by learning phase
  const phaseGroups = {
    foundation: ALL_LESSONS.filter((lesson) => lesson.phase === "foundation"),
    syllables: ALL_LESSONS.filter((lesson) => lesson.phase === "syllables"),
    words: ALL_LESSONS.filter((lesson) => lesson.phase === "words"),
    sentences: ALL_LESSONS.filter((lesson) => lesson.phase === "sentences"),
    advanced: ALL_LESSONS.filter((lesson) => lesson.phase === "advanced"),
  };

  const phaseConfig = [
    {
      key: "foundation",
      title: "Foundation",
      description: "Learn individual jamo and key positions",
      color: "bg-blue-500",
      number: 1,
    },
    {
      key: "syllables",
      title: "Syllables",
      description: "Combine jamo into Korean syllables",
      color: "bg-green-500",
      number: 2,
    },
    {
      key: "words",
      title: "Words",
      description: "Form complete Korean words and vocabulary",
      color: "bg-purple-500",
      number: 3,
    },
    {
      key: "sentences",
      title: "Sentences",
      description: "Type complete Korean sentences and conversations",
      color: "bg-orange-500",
      number: 4,
    },
    {
      key: "advanced",
      title: "Advanced Practice",
      description:
        "Master all Korean typing skills with paragraphs and complex content",
      color: "bg-red-500",
      number: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Korean Typing Lessons
              </h1>
              <p className="text-gray-600">
                Master Korean typing step by step, from basic jamo to full
                sentences
              </p>
            </div>
            <Link
              href="/practice"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Practice →
            </Link>
          </div>
        </div>
      </div>

      {/* Progress section */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Your Progress
              </h2>
              <p className="text-gray-600">
                {completedLessons.length} of {ALL_LESSONS.length} lessons
                completed
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-black">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Available</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Learning phases */}
        <div className="space-y-8">
          {phaseConfig.map((phase) => {
            const lessons = phaseGroups[phase.key as keyof typeof phaseGroups];

            if (lessons.length === 0) return null;

            return (
              <div key={phase.key}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-8 h-8 ${phase.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}
                  >
                    {phase.number}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {phase.title}
                    </h2>
                    <p className="text-gray-600 text-sm">{phase.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {lessons.map((lesson) => {
                    const difficultyBadge = getDifficultyBadge(
                      lesson.difficulty
                    );

                    return (
                      <Link
                        key={lesson.id}
                        href={`/practice?lesson=${lesson.id}`}
                        className={`block p-4 rounded-lg border transition-all ${getLessonCardStyle(
                          lesson
                        )} hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-xs font-medium">
                            {lesson.id}
                          </span>
                          <span className="text-lg">
                            {getStatusIcon(lesson)}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm mb-2">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {lesson.description}
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          {/* Only show focus keys for foundation lessons where they're helpful */}
                          {lesson.phase === "foundation" ? (
                            <span className="font-mono">
                              {lesson.focusKeys.slice(0, 3).join(" ")}
                              {lesson.focusKeys.length > 3 && "..."}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {lesson.phase} practice
                            </span>
                          )}

                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyBadge.color}`}
                          >
                            {difficultyBadge.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
