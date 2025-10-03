// server/src/services/exercises.api.js
const EXERCISE_API = "https://api.api-ninjas.com/v1/exercises";

export async function fetchExercisesByMuscle(muscle) {
  if (!process.env.API_NINJAS_KEY) {
    throw new Error("Missing API_NINJAS_KEY");
  }
  const url = new URL(EXERCISE_API);
  if (muscle) url.searchParams.set("muscle", muscle);

  const res = await fetch(url, {
    headers: { "X-Api-Key": process.env.API_NINJAS_KEY },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Exercise API error ${res.status}: ${text || res.statusText}`);
  }

  /** API returns an array like:
   * [
   *  { name, type, muscle, equipment, difficulty, instructions, ... }
   * ]
   */
  return res.json();
}
