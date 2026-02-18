import React, { useEffect, useRef, useState } from 'react';
import { npsService } from '../api/npsService';

const VideoKyc = ({ onComplete, onCancel }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [uploadUrl, setUploadUrl] = useState(null);
  const [s3Key, setS3Key] = useState(null);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const recordingIntervalRef = useRef(null);

  // Initialize camera and start session on mount
  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        // Request camera access
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) return;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }

        // Initialize video KYC session
        setLoading(true);
        const res = await npsService.startVideoKyc();
        if (!mounted) return;
        setSessionId(res.sessionId || res.session_id || res.session);
        setUploadUrl(res.uploadUrl || res.upload_url || res.url);
        setS3Key(res.key || res.s3Key || res.key);
        setLoading(false);

        // Auto-start recording after a brief delay
        setTimeout(() => {
          if (mounted && s) {
            startAutoRecording(s);
          }
        }, 500);
      } catch (err) {
        console.error('Failed to initialize video KYC', err && err.message ? err.message : err);
        setLoading(false);
      }
    };
    start();

    return () => {
      mounted = false;
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Auto-start 5-second recording
  const startAutoRecording = (videoStream) => {
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp8,opus' };
    const mr = new MediaRecorder(videoStream, options);
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    mr.onstop = handleRecordingComplete;
    mr.start();
    setRecording(true);

    // Update progress bar
    let elapsed = 0;
    recordingIntervalRef.current = setInterval(() => {
      elapsed += 100;
      setRecordingProgress(Math.min(elapsed / 5000, 1)); // 5 seconds = 5000ms
    }, 100);

    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (mr.state === 'recording') {
        mr.stop();
        setRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      }
    }, 5000);
  };

  // Handle recording completion
  const handleRecordingComplete = async () => {
    setRecording(false);
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

    try {
      setLoading(true);

      if (!uploadUrl || !s3Key) {
        throw new Error('Upload URL not available');
      }

      // Upload the blob directly to S3 using the presigned PUT URL
      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': blob.type
        },
        body: blob
      });

      if (!putResp.ok) {
        throw new Error('Failed to upload to S3');
      }

      // Inform backend that upload is complete
      const resp = await npsService.completeVideoKyc({ sessionId, s3Key });

      // Show verification success state
      setVerified(true);
      setLoading(false);

      // Auto-complete after showing success
      setTimeout(() => {
        onComplete && onComplete(resp);
      }, 2000);
    } catch (err) {
      console.error('Failed to upload video', err && err.message ? err.message : err);
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Video KYC Verification</h2>
        <p className="text-slate-600">A quick 5-second video recording to complete your identity verification</p>
      </div>

      {!verified ? (
        <>
          {/* Video Feed Container */}
          <div className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl bg-slate-900">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-96 object-cover"
            />

            {/* Recording Indicator */}
            {recording && (
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-red-600/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-bold">Recording...</span>
              </div>
            )}

            {/* Progress Bar Overlay */}
            {recording && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/30">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-100"
                  style={{ width: `${recordingProgress * 100}%` }}
                ></div>
              </div>
            )}

            {/* Loading State */}
            {loading && !recording && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white font-semibold">Processing your video...</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">What to do:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Face the camera clearly</li>
                  <li>✓ The video will auto-start and record for 5 seconds</li>
                  <li>✓ Keep your face visible and centered</li>
                  <li>✓ Speak clearly to verify your identity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {!recording && !loading && (
            <div className="text-center space-y-4">
              <p className="text-slate-700 font-semibold">
                {sessionId ? 'Recording is in progress...' : 'Initializing camera and session...'}
              </p>
              {/* Fallback cancel button */}
              <button 
                onClick={onCancel}
                className="mt-6 px-6 py-3 border border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      ) : (
        /* Verification Success State */
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          {/* Large Green Checkmark Circle */}
          <div className="relative w-32 h-32 animate-in zoom-in duration-500">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-in fade-in"></div>
            <div className="absolute inset-2 bg-green-500 rounded-full flex items-center justify-center">
              <svg 
                className="w-20 h-20 text-white animate-in fade-in slide-in-from-bottom-4 duration-700"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black text-slate-900">Verified!</h3>
            <p className="text-lg text-slate-600">Your identity has been successfully verified through video KYC</p>
          </div>

          {/* Redirecting Message */}
          <div className="flex items-center gap-2 text-slate-600 mt-6">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">Proceeding to next step...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoKyc;
