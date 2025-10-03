export function categoryFromType(type) {
  const t = (type || "").toLowerCase();
  if (t === "cardio") return "Cardio";
  if (["strength","powerlifting","olympic_weightlifting","strongman"].includes(t)) return "Strength Training";
  if (["stretch","plyometrics"].includes(t)) return "Flexibility";
  return "Strength Training"; // sensible default
}
