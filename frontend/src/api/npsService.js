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
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return await response.json();
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
    return await apiCall(`${BASE_URL}/kyc/aadhaar`, {
      method: 'POST',
      body: JSON.stringify({ aadhaarNumber }),
    });
  },

  // Step 2: Verify PAN
  verifyPan: async (panNumber) => {
    return await apiCall(`${BASE_URL}/kyc/pan`, {
      method: 'POST',
      body: JSON.stringify({ panNumber }),
    });
  },

  // Step 2: Start video KYC
  startVideoKyc: async () => {
    return await apiCall(`${BASE_URL}/kyc/video/start`, {
      method: 'POST',
    });
  },

  // Step 2: Complete video KYC
  completeVideoKyc: async (videoData) => {
    return await apiCall(`${BASE_URL}/kyc/video/complete`, {
      method: 'POST',
      body: JSON.stringify(videoData),
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
      // Route to appropriate endpoint based on step
      const stepRoutes = {
        1: () => npsService.verifyOtp(data.mobile || data.mobileNumber, data.otp),
        2: () => npsService.verifyPan(data.pan),
        3: () => npsService.savePersonalDetails(data),
        4: () => npsService.saveNominee(data),
        5: () => npsService.selectPfm(data.pfmId),
        6: () => npsService.acceptConsent(data),
        7: () => npsService.acceptConsent(data),
        8: () => npsService.initiatePayment(data),
      };

      if (stepRoutes[stepNumber]) {
        return await stepRoutes[stepNumber]();
      }
      console.warn(`No handler for step ${stepNumber}`);
      return { success: false };
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