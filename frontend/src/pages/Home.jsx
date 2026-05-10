import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">tolabco</h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            The smart platform connecting students with part‑time jobs, internships, and exclusive discount vouchers.
            Create a video CV, get AI‑powered summaries, and land the right opportunity – all in one place.
          </p>
        </div>

        {/* Two main paths */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">For Students</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">Find flexible jobs, upload a video CV, get AI‑written CVs, and enjoy exclusive discount vouchers – all for free.</p>
              <Link to="/students" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Learn More</Link>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">💼</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">For Recruiters & Employers</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">Post jobs, search candidates with AI, watch video CVs, and find the perfect student talent – fast.</p>
              <Link to="/recruiters" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Learn More</Link>
            </div>
          </div>
        </div>

        {/* What Students Get Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">What Students Get When They Join</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎥</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Video CV</h3>
              <p className="text-gray-700 dark:text-gray-300">Create a professional video introduction that showcases your personality and communication skills.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI‑Generated CV</h3>
              <p className="text-gray-700 dark:text-gray-300">Our AI writes a tailored CV summary based on your skills, education, and experience – ready to download.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Part‑time & Internship Jobs</h3>
              <p className="text-gray-700 dark:text-gray-300">Find flexible work, summer jobs, and training opportunities from top employers across Egypt.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Exclusive Discount Vouchers</h3>
              <p className="text-gray-700 dark:text-gray-300">Get special offers from local cafes, bookstores, and services – save money while you study.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Track Applications</h3>
              <p className="text-gray-700 dark:text-gray-300">See the status of your job applications and manage your job search in one dashboard.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Job Alerts</h3>
              <p className="text-gray-700 dark:text-gray-300">Get notified when new jobs match your skills and preferences – never miss an opportunity.</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link to="/register" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">Join for Free →</Link>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Home;
