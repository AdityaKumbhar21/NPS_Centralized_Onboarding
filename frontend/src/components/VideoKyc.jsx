import React, { useEffect, useRef, useState } from 'react';
import { npsService } from '../api/npsService';

const VideoKyc = ({ onComplete, onCancel }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // request camera + mic
    let mounted = true;
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) return;
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error('Camera access denied or not available', err && err.message ? err.message : err);
      }
    };
    start();
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const [uploadUrl, setUploadUrl] = useState(null);
  const [s3Key, setS3Key] = useState(null);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const res = await npsService.startVideoKyc();
      setSessionId(res.sessionId || res.session_id || res.session);
      setUploadUrl(res.uploadUrl || res.upload_url || res.url);
      setS3Key(res.key || res.s3Key || res.key);
    } catch (err) {
      console.error('Failed to start video session', err && err.message ? err.message : err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp8,opus' };
    const mr = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mr.onstop = handleStop;
    mr.start();
    setRecording(true);
    // auto-stop after 8 seconds for POC
    setTimeout(() => {
      if (mr.state === 'recording') mr.stop();
    }, 8000);
  };

  const handleStop = async () => {
    setRecording(false);
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    // convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
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

        // Inform backend that upload is complete, sending the s3 key
        const resp = await npsService.completeVideoKyc({ sessionId, s3Key });
        onComplete && onComplete(resp);
      } catch (err) {
        console.error('Failed to upload video', err && err.message ? err.message : err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 w-full">
      <div className="mb-3 font-bold">Video KYC (POC)</div>
      <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md bg-black" />

      <div className="flex gap-2 mt-3">
        {!sessionId ? (
          <button onClick={handleStartSession} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            {loading ? 'Starting...' : 'Start Session'}
          </button>
        ) : (
          <>
            <button onClick={recording ? undefined : handleStartRecording} disabled={recording || loading} className="px-4 py-2 bg-emerald-600 text-white rounded-md">
              {recording ? 'Recording...' : 'Start Recording'}
            </button>
            <button onClick={() => { mediaRecorderRef.current && mediaRecorderRef.current.stop(); }} disabled={!recording} className="px-4 py-2 bg-rose-600 text-white rounded-md">
              Stop
            </button>
            <button onClick={onCancel} className="px-4 py-2 border rounded-md">Cancel</button>
          </>
        )}
      </div>

      {loading && <div className="text-sm text-slate-500 mt-2">Uploading...</div>}
    </div>
  );
};

export default VideoKyc;
