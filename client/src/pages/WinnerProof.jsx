import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';
import { Camera, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WinnerProof() {
  const [unclaimedWins, setUnclaimedWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWinnings = async () => {
      try {
        const res = await api.get('/winners/me');
        if (res.data.success) {
          // Filter out wins that haven't been uploaded yet or got rejected and need re-upload
          const wins = res.data.winners.filter(w => !w.proofImageUrl || w.verificationStatus === 'rejected');
          setUnclaimedWins(wins);
        }
      } catch (err) {
        toast.error('Could not load winnings data');
      } finally {
        setLoading(false);
      }
    };
    fetchWinnings();
  }, []);

  const handleUpload = async (drawId, winId) => {
    if (!selectedFile) return toast.error('Please select an image file first');
    
    const formData = new FormData();
    formData.append('proof', selectedFile);
    formData.append('drawId', drawId); // drawId required by backend

    setUploadingId(winId);
    try {
      const res = await api.post('/winners/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setUnclaimedWins(prev => prev.filter(w => w._id !== winId));
        setSelectedFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-forest-600 font-semibold mb-8 hover:text-forest-700 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-forest-700 tracking-tight mb-3">Claim Your Prize</h1>
            <p className="text-gray-600">Upload a screenshot of your official golf club scorecard proving the scores entered for the winning draw.</p>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-100 rounded-3xl" />
            </div>
          ) : unclaimedWins.length === 0 ? (
            <div className="text-center bg-forest-50 p-12 rounded-3xl border border-forest-100">
              <CheckCircle size={48} className="mx-auto text-forest-400 mb-4" />
              <h3 className="text-xl font-bold text-forest-700">All caught up!</h3>
              <p className="text-gray-600 mt-2">You have no pending claims to upload proof for.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {unclaimedWins.map(win => (
                <div key={win._id} className="bg-gray-50 border border-gray-200 rounded-3xl p-6 relative overflow-hidden">
                  {win.verificationStatus === 'rejected' && (
                    <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
                      <XCircle size={20} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>Your previous upload was rejected.</strong>
                        {win.reviewNote && <span className="block mt-1">Admin note: {win.reviewNote}</span>}
                        <span className="block mt-2">Please upload a clearer image.</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-forest-700 mb-1">{win.drawId?.month} Draw</h3>
                      <p className="text-gray-500 font-medium">Match: {win.matchType}</p>
                      <p className="text-2xl font-black text-gold-500 mt-2">£{(win.prizeAmount / 100).toFixed(2)}</p>
                    </div>

                    <div className="w-full md:w-auto flex-grow max-w-xs">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Camera size={16} /> Screenshot Proof
                      </label>
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100 mb-4 cursor-pointer"
                      />
                      <Button 
                        fullWidth 
                        onClick={() => handleUpload(win.drawId._id, win._id)} 
                        isLoading={uploadingId === win._id}
                        disabled={uploadingId !== null && uploadingId !== win._id}
                      >
                        Submit for Verification
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 bg-yellow-50 p-6 rounded-2xl border border-yellow-100 flex items-start gap-4">
            <Clock className="text-yellow-600 shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-yellow-800">Verification Timeline</h4>
              <p className="text-yellow-700 text-sm mt-1 leading-relaxed">
                Once submitted, our team will review the proof against your recorded scores. Approved claims are paid out to your original payment method within 3–5 business days. You will receive email notifications throughout the process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
