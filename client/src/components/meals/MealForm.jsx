import { useState, useEffect } from "react";
import { TextField, Button, Typography } from "@mui/material";

export default function MealForm({ selected = null, onSave }) {
  const [meal, setMeal] = useState(
    selected || {
      mealName: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    }
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setMeal((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(meal),
    });

    if (res.ok) {
      onSave(); // let Meal.jsx handle refresh/snackbar
      setMeal({
        mealName: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Meal Name"
        name="mealName"
        value={meal.mealName}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Calories"
        name="calories"
        type="number"
        value={meal.calories}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Protein (g)"
        name="protein"
        type="number"
        value={meal.protein}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Carbs (g)"
        name="carbs"
        type="number"
        value={meal.carbs}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Fats (g)"
        name="fats"
        type="number"
        value={meal.fats}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        sx={{ bgcolor: "#18b5a7", mt: 2 }}
      >
        Save Meal
      </Button>
      <Button
  variant="outlined"
  sx={{ mt: 2, ml: 2 }}
  onClick={() => onSave(false)} // tell parent to close form without saving
>
  Cancel
</Button>

    </form>
  );
}

