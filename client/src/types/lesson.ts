export interface DBLesson {
  id: string;
  title: string;
  description: string;
  phase: string;
  unit: number;
  lesson_number: number;
  difficulty: number;
  order_index: number;
  content_json: {
    targetText: string;
    instructions: string;
    focusKeys: string[];
    reviewKeys?: string[];
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  phase: "foundation" | "syllables" | "words" | "sentences" | "advanced";
  unit: number;
  lessonNumber: number;

  targetText: string;
  instructions: string;

  focusKeys: string[];
  reviewKeys?: string[];

  difficulty: 1 | 2 | 3 | 4 | 5;
}
