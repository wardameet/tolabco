import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OutletDashboard = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percent: '',
    start_date: '',
    end_date: '',
    max_redemptions: ''
  });

  const fetchVouchers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await fetch('/api/my-vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 404) {
          setVouchers([]);
          return;
        }
        throw new Error('Failed to fetch vouchers');
      }
      const data = await res.json();
      setVouchers(data.vouchers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          discount_percent: parseInt(formData.discount_percent),
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          max_redemptions: formData.max_redemptions ? parseInt(formData.max_redemptions) : null
        })
      });
      if (!res.ok) throw new Error('Failed to create voucher');
      setShowForm(false);
      setFormData({ title: '', description: '', discount_percent: '', start_date: '', end_date: '', max_redemptions: '' });
      fetchVouchers();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Outlet Dashboard</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="mb-4">
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded">
          {showForm ? 'Cancel' : 'Create New Voucher'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create Voucher</h3>
          <form onSubmit={handleCreateVoucher}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Discount Percent *</label>
              <input type="number" required value={formData.discount_percent} onChange={e => setFormData({...formData, discount_percent: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Start Date (YYYY-MM-DD)</label>
              <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">End Date (YYYY-MM-DD)</label>
              <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Max Redemptions (optional)</label>
              <input type="number" value={formData.max_redemptions} onChange={e => setFormData({...formData, max_redemptions: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create Voucher</button>
          </form>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">Your Vouchers</h3>
      {vouchers.length === 0 ? (
        <p>No vouchers created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map(v => (
            <div key={v.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h4 className="text-lg font-bold">{v.title}</h4>
              <p className="text-2xl font-semibold text-green-600">{v.discount_percent}% OFF</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{v.description}</p>
              <p className="text-xs text-gray-500">Redeemed: {v.redemption_count || 0} / {v.max_redemptions || '∞'}</p>
              <p className="text-xs text-gray-500">Expires: {v.end_date || 'No expiry'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutletDashboard;
