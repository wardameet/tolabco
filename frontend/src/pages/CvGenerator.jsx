import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CvGenerator = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedCv, setGeneratedCv] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    skills: '',
    profession_category: '',
    city: '',
    education: '',
    experience: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        if (data.user.role !== 'student') {
          setError('Only students can generate CV');
          return;
        }
        setProfile(data.profile);
        setFormData({
          full_name: data.profile.full_name || '',
          skills: Array.isArray(data.profile.skills) ? data.profile.skills.join(', ') : '',
          profession_category: data.profile.profession_category || '',
          city: data.profile.city || '',
          education: '',
          experience: ''
        });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleGenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          skills: skillsArray,
          profession_category: formData.profession_category,
          city: formData.city,
          education: formData.education,
          experience: formData.experience
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGeneratedCv(data.cv_text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">AI CV Generator</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
          <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Profession Category</label>
          <input type="text" value={formData.profession_category} onChange={e => setFormData({...formData, profession_category: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">City</label>
          <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Education (optional)</label>
          <textarea rows="2" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Experience (optional)</label>
          <textarea rows="2" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
        </div>
        <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate CV Text'}
        </button>
      </div>
      {generatedCv && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Generated CV</h3>
          <p className="whitespace-pre-wrap">{generatedCv}</p>
        </div>
      )}
    </div>
  );
};

export default CvGenerator;
