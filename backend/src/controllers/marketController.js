export const getMarketPrices = (req, res) => {
  res.json([
    { crop: 'Wheat', price: 2200 },
    { crop: 'Rice', price: 1800 },
    { crop: 'Maize', price: 1500 }
  ]);
};
