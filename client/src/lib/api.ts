import { DBLesson } from "@/types/lesson";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export const api = {
  async getLessons() {
    return fetchJSON<DBLesson[]>("/lessons");
  },

  async getProgress(userId: string) {
    return fetchJSON<{
      completed_lessons: string[];
      average_wpm: number;
      average_accuracy: number;
    }>(`/user/progress/${userId}`);
  },

  async submitAttempt(data: {
    lesson_id: string;
    user_id: string;
    start_time: number;
    end_time: number;
    total_keystrokes: number;
    error_count: number;
  }) {
    return fetchJSON<{ status: string; data: any }>("/attempts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
