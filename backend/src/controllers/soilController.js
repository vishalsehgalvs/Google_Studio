export const getSoilRecommendations = (req, res) => {
  res.json([
    { soilType: 'Loamy', recommendedCrops: ['Wheat', 'Sugarcane', 'Cotton'] },
    { soilType: 'Sandy', recommendedCrops: ['Groundnut', 'Watermelon'] }
  ]);
};
