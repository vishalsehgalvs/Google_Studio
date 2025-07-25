export const getSchemes = (req, res) => {
  res.json([
    { name: 'PM-KISAN', description: 'Income support to farmers.' },
    { name: 'Soil Health Card', description: 'Soil health monitoring.' }
  ]);
};
