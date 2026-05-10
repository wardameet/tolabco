import { Routes, Route } from 'react-router-dom';
import PublicCv from "./pages/PublicCv";
import Verification from "./pages/Verification";
import Layout from './components/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import MyApplications from './pages/MyApplications';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminPanel from './pages/AdminPanel';
import CvGenerator from './pages/CvGenerator';
import OutletDashboard from './pages/OutletDashboard';
import JobDetail from './pages/JobDetail';
import Students from './pages/Students';
import Recruiters from './pages/Recruiters';
import Vouchers from './pages/Vouchers';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/students" element={<Students />} />
      <Route path="/recruiters" element={<Recruiters />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/cv-generator" element={<CvGenerator />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/outlet-dashboard" element={<OutletDashboard />} />
        <Route path="/job/:jobId" element={<JobDetail />} />
        <Route path="/cv/:shortCode" element={<PublicCv />} />
        <Route path="/vouchers" element={<Vouchers />} />
      </Route>
    </Routes>
  );
}
export default App;
