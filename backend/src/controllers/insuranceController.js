export const getInsuranceInfo = (req, res) => {
  res.json([
    { name: 'Crop Failure Insurance', description: 'Covers losses due to crop failure.' },
    { name: 'Drought Insurance', description: 'Covers losses due to drought.' }
  ]);
};
