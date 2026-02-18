import React, { useState } from 'react';

const DocUpload = ({ onComplete }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    setUploading(true);
    // Simulate OCR / Virus Scan as per backend specs
    setTimeout(() => {
      setUploading(false);
      onComplete({ status: 'Uploaded' });
    }, 2000);
  };

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
      <div className="text-3xl mb-2">📄</div>
      <p className="text-sm font-bold text-slate-700">Upload Signature / PAN Copy</p>
      <p className="text-[10px] text-slate-400 mb-4">PNG, JPG or PDF up to 5MB</p>
      <input type="file" onChange={handleUpload} className="hidden" id="fileInput" />
      <label htmlFor="fileInput" className="bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-200">
        {uploading ? 'Scanning for Viruses...' : 'Choose File'}
      </label>
    </div>
  );
};

export default DocUpload;