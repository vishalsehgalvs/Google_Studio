import React, { useState } from 'react';

const VoiceAssistantTab: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stub: Replace with real STT integration
  const handleStartListening = () => {
    setListening(true);
    setTranscript('');
    setTimeout(() => {
      setTranscript('What is the price of wheat in Nagpur?');
      setListening(false);
    }, 2000);
  };

  // Stub: Replace with real backend AI integration
  const handleSendQuery = async () => {
    setLoading(true);
    setError(null);
    setResponse('');
    try {
      // Simulate backend call
      setTimeout(() => {
        setResponse('The price of wheat in Nagpur is ₹2200 per quintal.');
        setLoading(false);
      }, 2000);
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Voice Assistant</h2>
      <button onClick={handleStartListening} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={listening}>
        {listening ? 'Listening...' : 'Start Voice Query'}
      </button>
      {transcript && (
        <div className="mt-4">
          <div className="mb-2">Transcript: <span className="font-semibold">{transcript}</span></div>
          <button onClick={handleSendQuery} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
            {loading ? 'Processing...' : 'Send Query'}
          </button>
        </div>
      )}
      {response && <div className="mt-4 p-4 bg-green-100 rounded">Response: {response}</div>}
      {error && <div className="mt-4 p-4 bg-red-100 rounded">Error: {error}</div>}
    </div>
  );
};

export default VoiceAssistantTab;
