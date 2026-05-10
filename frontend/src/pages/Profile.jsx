import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    city: '',
    profession_category: '',
    skills: ''
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) navigate('/login');
        throw new Error('Failed to fetch profile');
      }
      const data = await res.json();
      setUser(data.user);
      setProfile(data.profile);
      if (data.user.role === 'student') {
        setFormData({
          full_name: data.profile.full_name || '',
          city: data.profile.city || '',
          profession_category: data.profile.profession_category || '',
          skills: Array.isArray(data.profile.skills) ? data.profile.skills.join(', ') : ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    const token = localStorage.getItem('token');
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          city: formData.city,
          profession_category: formData.profession_category,
          skills: skillsArray
        })
      });
      if (!res.ok) throw new Error('Update failed');
      setMessage('Profile updated successfully');
      fetchProfile(); // refresh
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleVideoUpload = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      setMessage('');
      try {
        // Get pre-signed URL
        const urlRes = await fetch(`/api/get-upload-url?extension=mp4`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const { uploadUrl, key } = await urlRes.json();
        // Upload to S3
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': 'video/mp4' }
        });
        if (!uploadRes.ok) throw new Error('Upload failed');
        // Save reference
        const saveRes = await fetch('/api/set-video-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ key })
        });
        if (!saveRes.ok) throw new Error('Failed to save video reference');
        setMessage('Video CV uploaded successfully!');
        fetchProfile();
      } catch (err) {
        setMessage(err.message);
      } finally {
        setUploading(false);
      }
    };
    fileInput.click();
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center">Please log in.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Profile</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {user.role === 'student' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
            {message && (
              <div className="mb-4 p-2 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                {message}
              </div>
            )}
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Profession Category</label>
                <input
                  type="text"
                  value={formData.profession_category}
                  onChange={(e) => setFormData({ ...formData, profession_category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Video CV</h3>
            {profile?.video_cv_url && (
              <div className="mb-4">
                <video src={profile.video_cv_url} controls className="w-full max-w-md rounded" />
              </div>
            )}
            <button
              onClick={handleVideoUpload}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Video CV'}
            </button>
          </div>
        </>
      )}

      {user.role === 'employer' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Employer Information</h3>
          <p><strong>Company Name:</strong> {profile?.company_name || 'Not set'}</p>
          <p><strong>Company City:</strong> {profile?.company_city || 'Not set'}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
