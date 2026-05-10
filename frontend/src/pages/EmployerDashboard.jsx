import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    job_type: 'part_time',
    location_city: '',
    is_remote: false,
    salary_range: ''
  });
  const [applicants, setApplicants] = useState({});
  const [selectedJobApplicants, setSelectedJobApplicants] = useState(null);
  // AI search states
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    try {
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data.jobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/employer/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch applicants');
      const data = await res.json();
      const appsByJob = {};
      data.applications.forEach(app => {
        if (!appsByJob[app.job_id]) appsByJob[app.job_id] = [];
        appsByJob[app.job_id].push(app);
      });
      setApplicants(appsByJob);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplicants();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create job');
      setShowForm(false);
      setFormData({ title: '', description: '', job_type: 'part_time', location_city: '', is_remote: false, salary_range: '' });
      fetchJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete job');
      fetchJobs();
      fetchApplicants();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to update job');
      setEditingJob(null);
      setFormData({ title: '', description: '', job_type: 'part_time', location_city: '', is_remote: false, salary_range: '' });
      fetchJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    const token = localStorage.getItem('token');
    setAiLoading(true);
    setAiError('');
    setAiResults([]);
    try {
      const res = await fetch('/api/employer/search-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ query: aiQuery })
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setAiResults(data.results || []);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Employer Dashboard</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* AI Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">AI Student Search</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g., female electrical engineer under 30 in Cairo"
            className="flex-1 px-3 py-2 border rounded dark:bg-gray-700"
          />
          <button
            onClick={handleAISearch}
            disabled={aiLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {aiLoading ? 'Searching...' : 'AI Search'}
          </button>
        </div>
        {aiError && <div className="text-red-600 mt-2">{aiError}</div>}
        {aiResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Results ({aiResults.length})</h4>
            <div className="space-y-2">
              {aiResults.map(student => (
                <div key={student.user_id} className="border p-3 rounded dark:border-gray-700">
                  <p><strong>{student.full_name}</strong> - {student.age ? `Age: ${student.age}` : 'Age not specified'}</p>
                  <p>City: {student.city || 'Not specified'} | Category: {student.profession_category || 'N/A'}</p>
                  <p>Skills: {student.skills?.join(', ') || 'None'}</p>
                  {student.video_cv_url && (
                    <a href={student.video_cv_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">Watch Video CV</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Management Section */}
      <div className="mb-4">
        <button onClick={() => { setShowForm(!showForm); setEditingJob(null); setFormData({ title: '', description: '', job_type: 'part_time', location_city: '', is_remote: false, salary_range: '' }); }} className="px-4 py-2 bg-blue-600 text-white rounded">Post New Job</button>
      </div>

      {(showForm || editingJob) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">{editingJob ? 'Edit Job' : 'Create Job'}</h3>
          <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700"></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Job Type</label>
              <select value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700">
                <option value="part_time">Part-time</option>
                <option value="summer">Summer job</option>
                <option value="internship">Internship</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">City</label>
              <input type="text" value={formData.location_city} onChange={e => setFormData({...formData, location_city: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Salary Range</label>
              <input type="text" placeholder="e.g., EGP 2000-3000/month" value={formData.salary_range} onChange={e => setFormData({...formData, salary_range: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
            </div>
            <div className="mb-4 flex items-center">
              <input type="checkbox" checked={formData.is_remote} onChange={e => setFormData({...formData, is_remote: e.target.checked})} className="mr-2" />
              <label>Remote job</label>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editingJob ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingJob(null); }} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">Your Jobs</h3>
      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold">{job.title}</h4>
                  <p className="text-sm text-gray-500">{job.location_city || 'Remote'} · {job.job_type}</p>
                  <p className="text-sm">{job.description}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => { setEditingJob(job); setFormData({ title: job.title, description: job.description || '', job_type: job.job_type, location_city: job.location_city || '', is_remote: job.is_remote, salary_range: job.salary_range || '' }); setShowForm(false); }} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDeleteJob(job.id)} className="text-red-600">Delete</button>
                </div>
              </div>
              <div className="mt-2">
                <button onClick={() => setSelectedJobApplicants(selectedJobApplicants === job.id ? null : job.id)} className="text-sm text-gray-500">View Applicants ({applicants[job.id]?.length || 0})</button>
                {selectedJobApplicants === job.id && (
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    {applicants[job.id]?.length === 0 ? (
                      <p>No applicants yet.</p>
                    ) : (
                      applicants[job.id]?.map(app => (
                        <div key={app.id} className="border-b last:border-0 py-2">
                          <p className="font-medium">{app.full_name}</p>
                          <p className="text-sm">Status: {app.status}</p>
                          <p className="text-xs">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
