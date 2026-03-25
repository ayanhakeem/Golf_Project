import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscribe from './pages/Subscribe';
import CharityDirectory from './pages/CharityDirectory';
import CharityProfile from './pages/CharityProfile';
import Dashboard from './pages/Dashboard';
import WinnerProof from './pages/WinnerProof';
import AdminLayout from './pages/admin/AdminLayout';
import ManageCharities from './pages/admin/ManageCharities';
import ManageDraws from './pages/admin/ManageDraws';
import VerifyWinners from './pages/admin/VerifyWinners';

function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/charities" element={<CharityDirectory />} />
          <Route path="/charities/:id" element={<CharityProfile />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/winner" element={<WinnerProof />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div className="p-8"><h1 className="text-3xl font-bold">Admin Overview</h1><p className="mt-4">Select an option from the sidebar to manage the platform.</p></div>} />
            <Route path="charities" element={<ManageCharities />} />
            <Route path="draws" element={<ManageDraws />} />
            <Route path="winners" element={<VerifyWinners />} />
          </Route>
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
