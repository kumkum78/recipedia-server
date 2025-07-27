const axios = require('axios');

exports.suggestDishes = async (req, res) => {
  const { cuisine } = req.body;
  try {
    // TheMealDB uses "Area" for cuisine (e.g., "Indian", "Italian", "Chinese", etc.)
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(cuisine)}`);
    const meals = response.data.meals;
    if (!meals) {
      return res.status(404).json({ message: `No dishes found for cuisine: ${cuisine}` });
    }
    
    // Randomly shuffle the meals array and take first 5
    const shuffledMeals = [...meals].sort(() => Math.random() - 0.5);
    const dishes = shuffledMeals.slice(0, 5).map(meal => meal.strMeal);
    
    res.json({ dishes });
  } catch (err) {
    res.status(500).json({ message: 'Recipe suggestion failed', error: err.message });
  }
};