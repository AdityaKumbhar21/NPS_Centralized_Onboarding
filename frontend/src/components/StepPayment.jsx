import React, { useState } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const StepPayment = ({ userData, onNext }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [generatedPran, setGeneratedPran] = useState("");
  const { show } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Step 1: Register payment initiation on backend
      await npsService.initiatePayment({ amount: 500 });

      // Step 2: Simulate payment gateway processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Generate PRAN via backend
      const response = await npsService.generatePran(userData);
      
      if (response && (response.pran || response.data?.pran)) {
        const pran = response.pran || response.data.pran;
        setGeneratedPran(pran);
        setIsPaid(true);
        show('PRAN generated successfully!', 'success');
        // Advance to Video KYC after short delay so user sees the PRAN
        setTimeout(() => onNext && onNext({ pran, paymentDone: true }), 3000);
      } else {
        throw new Error(response.message || 'Failed to generate PRAN');
      }
    } catch (err) {
      console.error('Payment flow failed:', err);
      show(err.message || 'Payment failed. Please try again.', 'error');
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
        <p className="text-xs text-slate-400">Proceeding to Video KYC verification...</p>

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
      {/* Errors are shown as global toasts */}

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