import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const PublicCv = () => {
  const { shortCode } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCv = async () => {
      try {
        const res = await fetch(`/api/cv/${shortCode}`);
        if (!res.ok) throw new Error('CV not found');
        const data = await res.json();
        setStudent(data.student);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCv();
  }, [shortCode]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-600">Error: {error}</div>;
  if (!student) return <div className="flex justify-center items-center min-h-screen">No CV found</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">{student.full_name}</h1>
          <p className="text-lg opacity-90 mt-1">{student.profession_category || 'Student'}</p>
          {student.city && <p className="mt-2"><i className="fas fa-map-marker-alt mr-2"></i>{student.city}</p>}
        </div>

        <div className="p-6 space-y-6">
          {student.skills && student.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold border-b pb-2 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill, idx) => (
                  <span key={idx} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {student.cv_text && (
            <div>
              <h2 className="text-xl font-semibold border-b pb-2 mb-3">About Me</h2>
              <p className="whitespace-pre-wrap">{student.cv_text}</p>
            </div>
          )}

          {student.video_cv_url && (
            <div>
              <h2 className="text-xl font-semibold border-b pb-2 mb-3">Video CV</h2>
              <video src={student.video_cv_url} controls className="w-full rounded-lg shadow" />
            </div>
          )}

          <div className="text-center text-sm text-gray-500 pt-4">
            <Link to="/" className="text-blue-600 hover:underline">tolabco</Link> – connecting students with opportunities
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCv;
