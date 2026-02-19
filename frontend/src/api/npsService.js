// src/api/npsService.js
const BASE_URL = '/api'; // Uses vite proxy to http://localhost:3000/api

// Helper: Get stored JWT token
const getToken = () => localStorage.getItem('authToken');

// Helper: Store JWT token
const setToken = (token) => localStorage.setItem('authToken', token);

// Helper: Clear token
const clearToken = () => localStorage.removeItem('authToken');

// Helper: Standard fetch with auth header
const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to parse JSON body for an error message, fall back to text
    let parsed = null;
    try {
      parsed = await response.json();
    } catch (e) {
      try {
        const txt = await response.text();
        parsed = { message: txt };
      } catch (e2) {
        parsed = { message: `HTTP ${response.status}` };
      }
    }

    // Provide friendly messages for common statuses when backend doesn't supply one
    if ((!parsed || !parsed.message) && response.status === 429) {
      parsed = { message: 'Too many requests. Please wait a minute and try again.' };
    } else if ((!parsed || !parsed.message) && response.status >= 500) {
      parsed = { message: 'Server error. Please try again later.' };
    }

    const err = new Error(parsed && parsed.message ? parsed.message : `HTTP ${response.status}`);
    err.status = response.status;
    err.body = parsed;
    // Emit a global toast event so UI can display server messages centrally
    try {
      window.dispatchEvent(new CustomEvent('nps:toast', { detail: { message: err.message, type: response.status === 429 ? 'error' : 'error' } }));
    } catch (e) {
      // ignore if window not available
    }
    throw err;
  }

  // Successful response: attempt to parse JSON, otherwise return text
  try {
    return await response.json();
  } catch (e) {
    return await response.text();
  }
};

export const npsService = {
  // ==================== AUTH ENDPOINTS ====================
  // Step 1: Send OTP to mobile
  sendOtp: async (mobile) => {
    const response = await apiCall(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
    return response;
  },

  // Step 1: Verify OTP and get JWT token
  verifyOtp: async (mobile, otp) => {
    const response = await apiCall(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
    // Store token after successful verification
    if (response.token || response.accessToken) {
      setToken(response.token || response.accessToken);
    }
    return response;
  },

  // ─── Aadhaar eKYC flow (public, no token needed) ─────────────────────────
  // Step 2a: Initiate Aadhaar OTP – returns { message, maskedMobile, otp? }
  initiateAadhaarOtp: async (aadhaar) => {
    return await apiCall(`${BASE_URL}/kyc/aadhaar/initiate`, {
      method: 'POST',
      body: JSON.stringify({ aadhaar }),
    });
  },

  // Step 2b: Verify Aadhaar OTP – returns { token, refreshToken, onboardingStep, kycStatus }
  verifyAadhaarOtp: async (aadhaar, otp) => {
    const response = await apiCall(`${BASE_URL}/kyc/aadhaar/verify`, {
      method: 'POST',
      body: JSON.stringify({ aadhaar, otp }),
    });
    // Store JWT issued after Aadhaar verification
    if (response.token || response.accessToken) {
      setToken(response.token || response.accessToken);
    }
    return response;
  },

  // Refresh JWT token
  refreshToken: async () => {
    const response = await apiCall(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
    });
    if (response.token || response.accessToken) {
      setToken(response.token || response.accessToken);
    }
    return response;
  },

  // Logout
  logout: async () => {
    await apiCall(`${BASE_URL}/auth/logout`, {
      method: 'POST',
    });
    clearToken();
  },

  // ==================== KYC ENDPOINTS ====================
  // Step 2: Initiate Aadhaar verification
  initiateAadhaar: async (aadhaarNumber) => {
    // Backend expects { aadhaar }
    return await apiCall(`${BASE_URL}/kyc/aadhaar`, {
      method: 'POST',
      body: JSON.stringify({ aadhaar: aadhaarNumber }),
    });
  },

  // Step 2: Verify PAN
  verifyPan: async (panNumber) => {
    // Backend expects { pan: 'ABCDE1234F' }
    return await apiCall(`${BASE_URL}/kyc/pan`, {
      method: 'POST',
      body: JSON.stringify({ pan: panNumber }),
    });
  },

  // Step 2: Start video KYC
  startVideoKyc: async () => {
    return await apiCall(`${BASE_URL}/kyc/video/start`, {
      method: 'POST',
    });
  },

  // Complete Video KYC session
  completeVideoKyc: async (videoData) => {
    return await apiCall(`${BASE_URL}/kyc/video/complete`, {
      method: 'POST',
      body: JSON.stringify({
        sessionId: videoData.sessionId,
        s3Key: videoData.s3Key || 'demo',
      }),
    });
  },

  // Get KYC status
  getKycStatus: async () => {
    return await apiCall(`${BASE_URL}/kyc/status`, {
      method: 'GET',
    });
  },

  // Get KYC details
  getKycDetails: async () => {
    return await apiCall(`${BASE_URL}/kyc/details`, {
      method: 'GET',
    });
  },

  // ==================== USER PROFILE ENDPOINTS ====================
  // Step 3: Save personal details
  savePersonalDetails: async (personalData) => {
    return await apiCall(`${BASE_URL}/user/profile/personal`, {
      method: 'POST',
      body: JSON.stringify(personalData),
    });
  },

  // Step 3: Save address details
  saveAddress: async (addressData) => {
    return await apiCall(`${BASE_URL}/user/profile/address`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  // Step 4: Save nominee details
  saveNominee: async (nomineeData) => {
    return await apiCall(`${BASE_URL}/user/profile/nominee`, {
      method: 'POST',
      body: JSON.stringify(nomineeData),
    });
  },

  // Get draft profile data
  getDraft: async () => {
    return await apiCall(`${BASE_URL}/user/profile/draft`, {
      method: 'GET',
    });
  },

  // ==================== DOCUMENT ENDPOINTS ====================
  // Generate presigned URL for document upload
  generateUploadUrl: async (documentType) => {
    return await apiCall(`${BASE_URL}/document/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ documentType }),
    });
  },

  // Verify uploaded document
  verifyDocument: async (documentData) => {
    return await apiCall(`${BASE_URL}/document/verify`, {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  },

  // Get document status
  getDocumentStatus: async () => {
    return await apiCall(`${BASE_URL}/document/status`, {
      method: 'GET',
    });
  },

  // ==================== PFM ENDPOINTS ====================
  // Step 5: Get list of available PFMs
  listPfms: async () => {
    return await apiCall(`${BASE_URL}/pfm/list`, {
      method: 'GET',
    });
  },

  // Step 5: Compare PFMs
  comparePfms: async (pfmIds = []) => {
    return await apiCall(`${BASE_URL}/pfm/compare`, {
      method: 'GET',
      body: pfmIds.length > 0 ? JSON.stringify({ pfmIds }) : undefined,
    });
  },

  // Step 5: Select a PFM
  selectPfm: async (pfmId) => {
    return await apiCall(`${BASE_URL}/pfm/select`, {
      method: 'POST',
      body: JSON.stringify({ pfmId }),
    });
  },

  // ==================== CONSENT ENDPOINTS ====================
  // Step 6/7: Accept consent
  acceptConsent: async (consentData) => {
    return await apiCall(`${BASE_URL}/consent/accept`, {
      method: 'POST',
      body: JSON.stringify(consentData),
    });
  },

  // Get consent history
  getConsentHistory: async () => {
    return await apiCall(`${BASE_URL}/consent/history`, {
      method: 'GET',
    });
  },

  // ==================== PAYMENT ENDPOINTS ====================
  // Step 8: Initiate payment
  initiatePayment: async (paymentData) => {
    return await apiCall(`${BASE_URL}/payment/initiate`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Step 9: Generate PRAN (final submission)
  generatePran: async (finalData) => {
    return await apiCall(`${BASE_URL}/payment/generate-pran`, {
      method: 'POST',
      body: JSON.stringify(finalData),
    });
  },

  // ==================== ADMIN ENDPOINTS ====================
  // Get analytics
  getAnalytics: async () => {
    return await apiCall(`${BASE_URL}/admin/analytics`, {
      method: 'GET',
    });
  },

  // Get KYC report
  getKycReport: async () => {
    return await apiCall(`${BASE_URL}/admin/kyc-report`, {
      method: 'GET',
    });
  },

  // Get dropoff data
  getDropoffData: async () => {
    return await apiCall(`${BASE_URL}/admin/dropoffs`, {
      method: 'GET',
    });
  },

  // ==================== HELPER FUNCTIONS ====================
  // Check if user is authenticated
  isAuthenticated: () => !!getToken(),

  // Get current auth token
  getAuthToken: () => getToken(),

  // Set auth token (for manual setting)
  setAuthToken: (token) => setToken(token),

  // Save step data (generic for all steps)
  saveStepData: async (stepNumber, data) => {
    try {
      // Only steps 8 (FATCA) and 9 (AssetAllocation) reach here.
      // Steps 2-7 and 11 are SELF_HANDLING_STEPS and call their own APIs.
      // Step 10 (Review) is read-only. Step 1 and 11 are excluded upstream.
      const stepRoutes = {
        8: () => npsService.acceptConsent({ fatcaCompliant: data.fatcaCompliant, consentType: 'FATCA' }),
        9: () => npsService.acceptConsent({ assetChoice: data.assetChoice, consentType: 'ASSET_ALLOCATION' }),
      };

      if (stepRoutes[stepNumber]) {
        return await stepRoutes[stepNumber]();
      }
      // No-op for any other step that falls through
      return { success: true };
    } catch (error) {
      console.error(`Failed to save Step ${stepNumber}:`, error);
      throw error;
    }
  },

  // Complete registration and generate PRAN
  completeRegistration: async (finalData) => {
    return await npsService.generatePran(finalData);
  },
};