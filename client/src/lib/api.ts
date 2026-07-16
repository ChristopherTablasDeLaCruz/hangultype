import { DBLesson, Lesson } from "@/types/lesson";
import { createClient } from "@/utils/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    throw error;
  }
}

function mapLesson(row: DBLesson): Lesson {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    phase: row.phase as Lesson["phase"],
    unit: row.unit,
    lessonNumber: row.lesson_number,
    difficulty: row.difficulty as Lesson["difficulty"],
    ...row.content_json,
  };
}

export const api = {
  async getLessons(): Promise<Lesson[]> {
    const rows = await fetchJSON<DBLesson[]>("/lessons");
    return rows.map(mapLesson);
  },

  async getProgress(userId: string) {
    return fetchJSON<{
      completed_lessons: string[];
      average_wpm: number;
      average_accuracy: number;
    }>(`/user/progress/${userId}`, { headers: await authHeaders() });
  },

  async submitAttempt(data: {
    lesson_id: string;
    start_time: number;
    end_time: number;
    total_keystrokes: number;
    error_count: number;
  }) {
    return fetchJSON<{ status: string; data: Record<string, unknown> }>(
      "/attempts",
      {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(data),
      },
    );
  },
};
