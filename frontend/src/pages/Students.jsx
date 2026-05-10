import { Link } from 'react-router-dom';

const Students = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">For Students</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300">Everything you need to launch your career</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">🎥 Video CVs</h2>
          <p className="text-gray-700 dark:text-gray-300">Create a professional video introduction – stand out from the crowd. Record directly in your browser or upload a pre‑recorded video.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">📄 AI‑Generated CV</h2>
          <p className="text-gray-700 dark:text-gray-300">Our AI writes a polished, tailored CV summary based on your skills, education, and experience – ready to download or share.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">💼 Part‑time & Internship Jobs</h2>
          <p className="text-gray-700 dark:text-gray-300">Find flexible work, summer jobs, and training opportunities from top employers across Egypt.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">💰 Exclusive Discount Vouchers</h2>
          <p className="text-gray-700 dark:text-gray-300">Get special offers from local cafes, bookstores, and services – save money while you study.</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to start?</h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300">Join thousands of students already using tolabco.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Free Account</Link>
          <Link to="/login" className="px-6 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Students;
