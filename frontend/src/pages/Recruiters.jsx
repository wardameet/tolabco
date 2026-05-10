import { Link } from 'react-router-dom';

const Recruiters = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">For Recruiters & Employers</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300">Find the best student talent – fast and efficiently</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">🔍 AI Natural Language Search</h2>
          <p className="text-gray-700 dark:text-gray-300">Type "female electrical engineer under 30 in Cairo" – our AI finds matching candidates instantly.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">🎬 Video CVs</h2>
          <p className="text-gray-700 dark:text-gray-300">See and hear candidates talk about their skills – save time on initial screenings.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">📢 Post Jobs</h2>
          <p className="text-gray-700 dark:text-gray-300">Reach thousands of students across Egypt. Post part‑time, internship, and summer jobs easily.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">👥 Manage Applicants</h2>
          <p className="text-gray-700 dark:text-gray-300">View applications, contact candidates, and track hiring – all in one dashboard.</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Start hiring today</h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300">Post your first job for free and discover top student talent.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Register as Employer</Link>
          <Link to="/login" className="px-6 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Recruiters;
