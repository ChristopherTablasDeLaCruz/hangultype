import { ALL_LESSONS } from "../src/data/lessons";

console.log(`
-- Seed Data for Lessons
TRUNCATE TABLE public.lessons CASCADE; 
INSERT INTO public.lessons (id, title, description, phase, unit, lesson_number, difficulty, order_index, content_json)
VALUES
`);

const values = ALL_LESSONS.map((l, index) => {
  // Create the JSON content blob
  const content = JSON.stringify({
    targetText: l.targetText,
    instructions: l.instructions,
    focusKeys: l.focusKeys,
    reviewKeys: l.reviewKeys || [],
  }).replace(/'/g, "''"); // Escape single quotes for SQL

  // Escape single quotes in text fields
  const title = l.title.replace(/'/g, "''");
  const desc = l.description.replace(/'/g, "''");

  return `(
    '${l.id}', 
    '${title}', 
    '${desc}', 
    '${l.phase}', 
    ${l.unit}, 
    ${l.lessonNumber}, 
    ${l.difficulty}, 
    ${index}, 
    '${content}'::jsonb
  )`;
});

console.log(values.join(",\n") + ";");
