import React, { useState } from 'react';
import Header from './components/Header';
import StepAuth from './components/StepAuth';
import StepAadhaar from './components/StepAadhaar';
import StepKYC from './components/StepKYC';
import StepPersonalPlus from './components/StepPersonalPlus';
import StepNominee from './components/StepNominee';
import StepPFM from './components/StepPFM';
import StepFATCA from './components/StepFATCA';
import StepAssetAllocation from './components/StepAssetAllocation';
import StepReview from './components/StepReview';
import StepPayment from './components/StepPayment';
import StepVideoKyc from './components/StepVideoKyc';
import InfoBar from './components/InfoBar';
import Footer from './components/Footer';
import { npsService } from './api/npsService';
import { ToastProvider } from './contexts/ToastProvider';
import OnboardingShell from './components/OnboardingShell';

// Step map:
// 1  → Mobile OTP (Auth)     [outside shell]
// 2  → Aadhaar eKYC          [inside shell — self-handles API + JWT]
// 3  → PAN Verification      [self-handles verifyPan]
// 4  → Video KYC             [self-handles completeVideoKyc]
// 5  → Personal Details      [self-handles savePersonalDetails]
// 6  → Nominee               [self-handles saveNominee]
// 7  → PFM Selection         [self-handles selectPfm]
// 8  → FATCA                 [saveStepData → acceptConsent]
// 9  → Asset Allocation      [saveStepData → acceptConsent]
// 10 → Review                [read-only — no backend call]
// 11 → Payment               [self-handles; final step → completed]
const TOTAL_STEPS = 11;
// Steps that call their own backend directly — skip saveStepData for these
const SELF_HANDLING_STEPS = new Set([2, 3, 4, 5, 6, 7, 10]);

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({});
  const [completed, setCompleted] = useState(false);

  const nextStep = async (data) => {
    const updatedData = { ...userData, ...data };
    setUserData(updatedData);

    try {
      // Step 1: auth token stored automatically — skip
      // SELF_HANDLING_STEPS call their own backend inside the component — skip
      // TOTAL_STEPS (11 = Payment) → goes to completed, no saveStepData
      if (currentStep > 1 && currentStep < TOTAL_STEPS && !SELF_HANDLING_STEPS.has(currentStep)) {
        await npsService.saveStepData(currentStep, data);
      }
      if (currentStep === TOTAL_STEPS) {
        setCompleted(true);
        return;
      }
    } catch (err) {
      console.error('Backend sync failed:', err && err.message ? err.message : 'Unknown error');
    }

    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header />

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {completed ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border border-slate-100 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">🎉</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Onboarding Complete!</h2>
              <p className="text-slate-500 mb-2">Your NPS account has been successfully created and verified.</p>
              {userData.pran && (
                <div className="bg-slate-50 p-4 rounded-xl my-6 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your PRAN</p>
                  <p className="text-xl font-mono font-black text-primary">{userData.pran}</p>
                </div>
              )}
              <button
                onClick={() => { setCompleted(false); setCurrentStep(1); setUserData({}); npsService.logout?.(); }}
                className="w-full mt-4 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all"
              >
                Start New Onboarding
              </button>
            </div>
          </div>
        ) : currentStep === 1 ? (
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Left Section: Information & Trust */}
            <div className="md:w-1/2 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
                  Official Government Portal
                </span>
                <h2 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
                  Unified Digital <br/>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">Onboarding Platform</span>
                </h2>
                <p className="text-lg text-slate-600 max-w-md">
                  Secure access to your National Pension System account using Aadhaar-linked eKYC and Mobile OTP authentication.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-b border-slate-100 pb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-blue-600">🛡️</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">256-bit Encryption</h4>
                    <p className="text-xs text-slate-500">Bank-grade security for your data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-indigo-600">🆔</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Aadhaar eKYC</h4>
                    <p className="text-xs text-slate-500">Paperless verification powered by UIDAI.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Form Cards */}
            <div className="md:w-1/2 flex justify-center w-full">
                {currentStep === 1 && <StepAuth onNext={nextStep} />}
            </div>
          </div>
        ) : (
          <OnboardingShell currentStep={currentStep}>
            <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
               {currentStep === 2 && <StepAadhaar onNext={nextStep} />}
               {currentStep === 3 && <StepKYC onNext={nextStep} />}
               {currentStep === 4 && <StepVideoKyc onNext={nextStep} onBack={prevStep} />}
               {currentStep === 5 && <StepPersonalPlus onNext={nextStep} onBack={prevStep} />}
               {currentStep === 6 && <StepNominee onNext={nextStep} onBack={prevStep} />}
               {currentStep === 7 && <StepPFM userData={userData} onNext={nextStep} onBack={prevStep} />}
               {currentStep === 8 && <StepFATCA onNext={nextStep} onBack={prevStep} />}
               {currentStep === 9 && <StepAssetAllocation onNext={nextStep} onBack={prevStep} />}
               {currentStep === 10 && <StepReview userData={userData} onNext={nextStep} onBack={prevStep} />}
               {currentStep === 11 && <StepPayment userData={userData} onNext={nextStep} />}
            </div>
          </OnboardingShell>
        )}
        </main>

        {/* Keep Footer and InfoBar visible only during initial personal details steps */}
        {currentStep <= 3 && <InfoBar />}
        <Footer />
      </div>
    </ToastProvider>
  );
}

export default App;