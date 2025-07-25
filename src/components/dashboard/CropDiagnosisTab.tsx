import React, { useState } from 'react';

const CropDiagnosisTab: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append('image', image);
    try {
      const res = await fetch('/api/crop-diagnosis', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.diagnosis);
      } else {
        setError(data.error || 'Diagnosis failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Crop Diagnosis</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && <img src={preview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded" />}
        <button type="submit" className="mt-2 px-4 py-2 bg-green-600 text-white rounded" disabled={loading || !image}>
          {loading ? 'Diagnosing...' : 'Diagnose Crop'}
        </button>
      </form>
      {result && <div className="mt-4 p-4 bg-green-100 rounded">Diagnosis: {result}</div>}
      {error && <div className="mt-4 p-4 bg-red-100 rounded">Error: {error}</div>}
    </div>
  );
};

export default CropDiagnosisTab;
