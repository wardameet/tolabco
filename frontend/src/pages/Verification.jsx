import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Verification = () => {
  const navigate = useNavigate();
  const [idPhotoUrl, setIdPhotoUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/student/verify-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id_photo_url: idPhotoUrl, selfie_url: selfieUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessage('Verification request submitted. Please wait for admin approval.');
      setIdPhotoUrl('');
      setSelfieUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Request Verification</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Upload a photo of your national ID and a selfie holding it to get verified.</p>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
        {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ID Photo URL</label>
          <input type="url" required value={idPhotoUrl} onChange={e => setIdPhotoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
          <p className="text-xs text-gray-500 mt-1">For testing, you can use any image URL. In production, integrate with a file uploader.</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Selfie with ID URL</label>
          <input type="url" required value={selfieUrl} onChange={e => setSelfieUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default Verification;
