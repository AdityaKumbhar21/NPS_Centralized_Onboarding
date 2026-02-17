import React, { useState } from 'react';
import { npsService } from '../api/npsService';

const StepPayment = ({ userData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [generatedPran, setGeneratedPran] = useState("");
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setError('');
    setIsProcessing(true);
    
    try {
      // Simulate payment processing (in real scenario, this would be payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate PRAN via backend
      const response = await npsService.generatePran(userData);
      
      if (response && (response.pran || response.data?.pran)) {
        setGeneratedPran(response.pran || response.data.pran);
        setIsProcessing(false);
        setIsPaid(true);
      } else {
        throw new Error(response.message || 'Failed to generate PRAN');
      }
    } catch (err) {
      console.error("Final registration failed:", error);
      setError(err.message || "Payment verified, but account activation failed. Please contact support.");
      setIsProcessing(false);
    }
  };

  if (isPaid) {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
        <h2 className="text-2xl font-black text-slate-900">PRAN Generated!</h2>
        <p className="text-slate-500 mt-2 mb-8">Your account has been successfully activated. Welcome to the NPS ecosystem.</p>
        
        <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Permanent Retirement Account Number</p>
            <p className="text-xl font-mono font-black text-primary">{generatedPran}</p>
        </div>

        {/* Action Buttons for Post-Onboarding */}
        <div className="space-y-3">
          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">download</span> Download E-PRAN Card
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-white text-slate-600 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Go to Subscriber Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto border border-slate-100 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">payments</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Initial Contribution</h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50/50 border-l-4 border-red-500 p-4 rounded-r-2xl animate-in slide-in-from-top-2">
          <p className="text-[11px] text-red-600 leading-relaxed font-semibold">{error}</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Tier I Contribution</span>
          <span className="font-bold text-slate-800">₹500.00</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">CRA Account Opening Fee</span>
          <span className="font-bold text-slate-800">₹0.00</span>
        </div>
        <hr className="border-slate-100" />
        <div className="flex justify-between text-lg font-black text-primary">
          <span>Total Payable</span>
          <span>₹500.00</span>
        </div>
      </div>

      <button 
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-3 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verifying Transaction...
          </>
        ) : "Pay via UPI / NetBanking"}
      </button>
      
      <div className="mt-6 flex items-center justify-center gap-4 opacity-40 grayscale">
        <span className="text-[10px] font-bold">NPCI</span>
        <span className="text-[10px] font-bold">PCI-DSS</span>
        <span className="text-[10px] font-bold">SSL</span>
      </div>
    </div>
  );
};

export default StepPayment;