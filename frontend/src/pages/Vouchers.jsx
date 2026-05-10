import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Vouchers = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState(null);

  const fetchVouchers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await fetch('/api/vouchers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch vouchers');
      const data = await res.json();
      setVouchers(data.vouchers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (voucherId) => {
    const token = localStorage.getItem('token');
    setRedeeming(voucherId);
    try {
      const res = await fetch(`/api/redeem/${voucherId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Redemption failed');
      alert('Voucher redeemed successfully!');
      fetchVouchers(); // refresh list
    } catch (err) {
      alert(err.message);
    } finally {
      setRedeeming(null);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading vouchers...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Discount Vouchers</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {vouchers.length === 0 ? (
        <p>No vouchers available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map(v => (
            <div key={v.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-bold">{v.title}</h3>
              <p className="text-2xl font-semibold text-green-600">{v.discount_percent}% OFF</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{v.description}</p>
              <p className="text-xs text-gray-500 mt-2">Expires: {v.end_date || 'No expiry'}</p>
              <button
                onClick={() => handleRedeem(v.id)}
                disabled={redeeming === v.id}
                className="mt-3 w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {redeeming === v.id ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vouchers;
