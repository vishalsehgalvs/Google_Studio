module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/market-trend',
        destination: 'http://localhost:5001/api/market-trend',
      },
      {
        source: '/api/scheme-recommendation',
        destination: 'http://localhost:5001/api/scheme-recommendation',
      },
      {
        source: '/api/diagnose',
        destination: 'http://localhost:5001/diagnose',
      },
      {
        source: '/api/drone-analysis',
        destination: 'http://localhost:5001/api/drone-analysis',
      },
      {
        source: '/api/soil-analysis',
        destination: 'http://localhost:5001/api/soil-analysis',
      },
      {
        source: '/api/order-supplies',
        destination: 'http://localhost:5001/api/order-supplies',
      },
      {
        source: '/api/diagnosis-followup',
        destination: 'http://localhost:5001/api/diagnosis-followup',
      },
      {
        source: '/api/voice-query-to-text',
        destination: 'http://localhost:5001/api/voice-query-to-text',
      },
      // Add more endpoints as needed
    ];
  },
};
