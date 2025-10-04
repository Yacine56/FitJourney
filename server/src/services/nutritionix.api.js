const NUTRITIONIX_API = "https://trackapi.nutritionix.com/v2/natural/nutrients";

export async function fetchNutritionix(query) {
  if (!process.env.NUTRITIONIX_APP_ID || !process.env.NUTRITIONIX_APP_KEY) {
    throw new Error("Missing Nutritionix credentials");
  }

  const res = await fetch(NUTRITIONIX_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-id": process.env.NUTRITIONIX_APP_ID,
      "x-app-key": process.env.NUTRITIONIX_APP_KEY,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Nutritionix error ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  return data.foods.map((f) => ({
    mealName: f.food_name,
    calories: f.nf_calories,
    protein: f.nf_protein,
    carbs: f.nf_total_carbohydrate,
    fats: f.nf_total_fat,
  }));
}
