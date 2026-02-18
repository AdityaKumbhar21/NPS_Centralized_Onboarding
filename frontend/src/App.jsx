import React, { useState } from 'react';
import Header from './components/Header';
import StepAuth from './components/StepAuth';
import StepKYC from './components/StepKYC';
import StepPersonalPlus from './components/StepPersonalPlus';
import StepNominee from './components/StepNominee';
import StepPFM from './components/StepPFM';
import StepFATCA from './components/StepFATCA';
import StepAssetAllocation from './components/StepAssetAllocation';
import StepReview from './components/StepReview'; // New Import
import StepPayment from './components/StepPayment';
import InfoBar from './components/InfoBar';
import Footer from './components/Footer';
import { npsService } from './api/npsService'; // Import added to fix nextStep logic

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({});

  const nextStep = async (data) => {
    // 1. Update local state
    const updatedData = { ...userData, ...data };
    setUserData(updatedData);

    // 2. Persist to Backend
    try {
      await npsService.saveStepData(currentStep, data);
    } catch (err) {
      console.error("Backend sync failed", err);
    }

    // 3. Move UI to next page
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* LAYOUT LOGIC:
            Steps 1, 2, 3: Split screen (Information on left)
            Steps 4 - 9: Full width (For complex data visualization)
        */}
        {currentStep <= 3 ? (
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
              {currentStep === 2 && <StepKYC onNext={nextStep} />}
              {currentStep === 3 && <StepPersonalPlus onNext={nextStep} onBack={prevStep} />}
            </div>
          </div>
        ) : (
          /* Full Width Layout for Complex Steps */
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
             {currentStep === 4 && <StepNominee onNext={nextStep} onBack={prevStep} />}
             {currentStep === 5 && <StepPFM userData={userData} onNext={nextStep} onBack={prevStep} />}
             {currentStep === 6 && <StepFATCA onNext={nextStep} onBack={prevStep} />}
             {currentStep === 7 && <StepAssetAllocation onNext={nextStep} onBack={prevStep} />}
             
             {/* New Review Step: Mandatory for PFRDA Compliance */}
             {currentStep === 8 && <StepReview userData={userData} onNext={nextStep} onBack={prevStep} />}
             
             {/* Final Payment & Success Notification */}
             {currentStep === 9 && <StepPayment userData={userData} />}
          </div>
        )}
      </main>

      {/* Keep Footer and InfoBar visible only during initial personal details steps */}
      {currentStep <= 3 && <InfoBar />}
      <Footer />
    </div>
  );
}

export default App;