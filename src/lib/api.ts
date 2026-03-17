import axios from "axios";

/**
 * BASE_URL = domain backend (tanpa /api/v1)
 * API_URL  = endpoint API (dengan /api/v1)
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api/v1`;

/**
 * Helper function to get XSRF token from cookie
 */
function getXSRFToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const cookies = document.cookie.split("; ");
  const xsrfCookie = cookies.find((row) => row.startsWith("XSRF-TOKEN="));
  
  if (!xsrfCookie) return null;
  
  const token = xsrfCookie.split("=")[1];
  return decodeURIComponent(token);
}

/**
 * Root API (untuk endpoint di luar /api/v1 seperti /sanctum/csrf-cookie)
 */
export const rootApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, // ✅ wajib true supaya cookie csrf tersimpan
});

/**
 * Main API instance (untuk /api/v1)
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // ✅ wajib true kalau backend pakai sanctum/cookie
});

/**
 * Request interceptor untuk menambahkan Bearer token DAN X-XSRF-TOKEN
 */
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      // Add Bearer token if exists
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // ✅ TAMBAHAN INI - Add XSRF token for stateful requests
      const xsrfToken = getXSRFToken();
      if (xsrfToken) {
        config.headers["X-XSRF-TOKEN"] = xsrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor untuk handle unauthorized
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Only redirect to login if currently on an auth-required page (admin, dashboard, profile, etc.)
        const authRequiredPaths = ['/admin', '/dashboard', '/profile', '/my-bookings'];
        const currentPath = window.location.pathname;
        const isAuthRequired = authRequiredPaths.some(p => currentPath.startsWith(p));
        if (isAuthRequired) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==============================
// Auth API
// ==============================
export const authAPI = {
  csrf: () => rootApi.get("/sanctum/csrf-cookie"),

  login: async (email: string, password: string) => {
    await authAPI.csrf(); // ✅ penting sebelum login
    return api.post("/auth/login", { email, password });
  },

  register: async (data: any) => {
    await authAPI.csrf(); // ✅ penting sebelum register
    return api.post("/auth/register", data);
  },

  logout: async () => {
    await authAPI.csrf(); // optional tapi aman
    return api.post("/auth/logout");
  },

  getProfile: () => api.get("/auth/me"),

  updateProfile: (data: any) => api.put("/auth/profile", data),
};

// ==============================
// Cars API
// ==============================
export const carsAPI = {
  getAll: (params?: any) => api.get("/cars", { params }),
  getById: (id: number) => api.get(`/cars/${id}`),
  checkAvailability: (id: number, params: any) =>
    api.get(`/cars/${id}/availability`, { params }),
  getUnavailableDates: (id: number) =>
    api.get(`/cars/${id}/unavailable-dates`),
  getReviews: (carId: number) => api.get(`/cars/${carId}/reviews`),
};

// ==============================
// Bookings API
// ==============================
export const bookingsAPI = {
  createGuest: (data: any) => api.post("/bookings/guest", data),
  create: (data: any) => api.post("/bookings", data),
  getMyBookings: (params?: any) => api.get("/bookings/my-bookings", { params }),
  getById: (id: number) => api.get(`/bookings/${id}`),
  track: (bookingNumber: string, email: string) =>
    api.get(`/bookings/track/${bookingNumber}?email=${email}`),
  cancel: (id: number, reason?: string) =>
    api.post(`/bookings/${id}/cancel`, { reason }),
};

// ==============================
// Payments API
// ==============================
export const paymentsAPI = {
  create: (data: any) => api.post("/payments", data),
  uploadProof: (id: number, formData: FormData) =>
    api.post(`/payments/${id}/upload-proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getByBooking: (bookingId: number) =>
    api.get(`/payments/booking/${bookingId}`),
  // Guest payment (no auth required)
  createGuest: (data: any) => api.post("/payments/guest", data),
  uploadGuestProof: (id: number, formData: FormData) =>
    api.post(`/payments/guest/${id}/upload-proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ==============================
// Locations API
// ==============================
export const locationsAPI = {
  getAll: () => api.get("/locations"),
  getById: (id: number) => api.get(`/locations/${id}`),
};

// ==============================
// Facilities API
// ==============================
export const facilitiesAPI = {
  getAll: () => api.get("/facilities"),
};

// ==============================
// Promotions API
// ==============================
export const promotionsAPI = {
  validate: (code: string, subtotal: number) =>
    api.post("/promotions/validate", { code, subtotal }),
};

// ==============================
// Reviews API
// ==============================
export const reviewsAPI = {
  getAll: (params?: any) => api.get("/reviews", { params }),
  create: (data: any) => api.post("/reviews", data),
  update: (id: number, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};

// ==============================
// Settings API
// ==============================
export const settingsAPI = {
  getPublic: () => api.get("/settings/public"),
};

// ==============================
// Notifications API
// ==============================
export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post("/notifications/mark-all-read"),
};

// ==============================
// Admin APIs
// ==============================
export const adminAPI = {
  // Dashboard
  dashboard: {
    getStats: () => api.get("/admin/dashboard"),
    getStatistics: () => api.get("/admin/dashboard/statistics"),
    getRecentActivities: () => api.get("/admin/dashboard/recent-activities"),
  },

  // Cars
  cars: {
    getAll: (params?: any) => api.get("/admin/cars", { params }),
    getById: (id: number) => api.get(`/admin/cars/${id}`),
    create: (data: any) => api.post("/admin/cars", data),
    update: (id: number, data: any) => api.put(`/admin/cars/${id}`, data),
    delete: (id: number) => api.delete(`/admin/cars/${id}`),

    uploadImages: (id: number, formData: FormData) =>
      api.post(`/admin/cars/${id}/upload-images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

    addImageUrls: (id: number, urls: string[]) =>
      api.post(`/admin/cars/${id}/upload-images`, { image_urls: urls }),

    removeImage: (id: number, image: string) =>
      api.post(`/admin/cars/${id}/remove-image`, { image }),

    updateStatus: (id: number, status: string) =>
      api.post(`/admin/cars/${id}/update-status`, { status }),

    scheduleMaintenance: (id: number, data: any) =>
      api.post(`/admin/cars/${id}/schedule-maintenance`, data),

    getBookingHistory: (id: number) =>
      api.get(`/admin/cars/${id}/booking-history`),
  },

  // Bookings
  bookings: {
    getAll: (params?: any) => api.get("/admin/bookings", { params }),
    getById: (id: number) => api.get(`/admin/bookings/${id}`),
    update: (id: number, data: any) => api.put(`/admin/bookings/${id}`, data),
    confirm: (id: number) => api.post(`/admin/bookings/${id}/confirm`),
    cancel: (id: number, reason?: string) =>
      api.post(`/admin/bookings/${id}/cancel`, { reason }),
    complete: (id: number) => api.post(`/admin/bookings/${id}/complete`),
  },

  // Payments
  payments: {
    getAll: (params?: any) => api.get("/admin/payments", { params }),
    getPending: () => api.get("/admin/payments/pending"),
    getById: (id: number) => api.get(`/admin/payments/${id}`),
    verify: (id: number, data?: any) =>
      api.post(`/admin/payments/${id}/verify`, data),
    reject: (id: number, reason: string) =>
      api.post(`/admin/payments/${id}/reject`, { rejection_reason: reason }),
  },

  // Users
  users: {
    getAll: (params?: any) => api.get("/admin/users", { params }),
    getById: (id: number) => api.get(`/admin/users/${id}`),
    create: (data: any) => api.post("/admin/users", data),
    update: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
    delete: (id: number) => api.delete(`/admin/users/${id}`),
    block: (id: number) => api.post(`/admin/users/${id}/block`),
    unblock: (id: number) => api.post(`/admin/users/${id}/unblock`),
  },

  // Reviews
  reviews: {
    getAll: (params?: any) => api.get("/admin/reviews", { params }),
    getPending: () => api.get("/admin/reviews/pending"),
    approve: (id: number) => api.post(`/admin/reviews/${id}/approve`),
    reject: (id: number, reason?: string) =>
      api.post(`/admin/reviews/${id}/reject`, { reason }),
    toggleFeature: (id: number) => api.post(`/admin/reviews/${id}/feature`),
    delete: (id: number) => api.delete(`/admin/reviews/${id}`),
  },

  // Promotions
  promotions: {
    getAll: (params?: any) => api.get("/admin/promotions", { params }),
    getById: (id: number) => api.get(`/admin/promotions/${id}`),
    create: (data: any) => api.post("/admin/promotions", data),
    update: (id: number, data: any) =>
      api.put(`/admin/promotions/${id}`, data),
    delete: (id: number) => api.delete(`/admin/promotions/${id}`),
    toggleStatus: (id: number) =>
      api.post(`/admin/promotions/${id}/toggle-status`),
  },

  // Locations
  locations: {
    getAll: (params?: any) => api.get("/admin/locations", { params }),
    getById: (id: number) => api.get(`/admin/locations/${id}`),
    create: (data: any) => api.post("/admin/locations", data),
    update: (id: number, data: any) => api.put(`/admin/locations/${id}`, data),
    delete: (id: number) => api.delete(`/admin/locations/${id}`),
    toggleStatus: (id: number) =>
      api.post(`/admin/locations/${id}/toggle-status`),
  },

  // Settings
  settings: {
    getAll: () => api.get("/admin/settings"),
    getByGroup: (group: string) => api.get(`/admin/settings/group/${group}`),
    update: (data: any) => api.post("/admin/settings/update", data),
    updateContact: (data: any) => api.post("/admin/settings/update-contact", data),
    updatePayment: (data: any) => api.post("/admin/settings/update-payment", data),
    updateAbout: (data: any) => api.post("/admin/settings/update-about", data),
    updateTours: (data: any) => api.post("/admin/settings/update-tours", data),
    uploadTourImage: (file: File) => {
      const form = new FormData();
      form.append('image', file);
      return api.post("/admin/settings/upload-tour-image", form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    uploadTourImages: (files: File[]) => {
      const form = new FormData();
      files.forEach(f => form.append('images[]', f));
      return api.post("/admin/settings/upload-tour-image", form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    updateContactPage: (data: any) => api.post("/admin/settings/update-contact-page", data),
  },

  // Facilities
  facilities: {
    getAll: (params?: any) => api.get("/admin/facilities", { params }),
    getById: (id: number) => api.get(`/admin/facilities/${id}`),
    create: (data: any) => api.post("/admin/facilities", data),
    update: (id: number, data: any) => api.put(`/admin/facilities/${id}`, data),
    delete: (id: number) => api.delete(`/admin/facilities/${id}`),
    toggleStatus: (id: number) => api.post(`/admin/facilities/${id}/toggle-status`),
  },

  // Bank Accounts
  bankAccounts: {
    getAll: () => api.get("/admin/bank-accounts"),
    create: (data: any) => api.post("/admin/bank-accounts", data),
    update: (id: number, data: any) => api.put(`/admin/bank-accounts/${id}`, data),
    delete: (id: number) => api.delete(`/admin/bank-accounts/${id}`),
    toggleStatus: (id: number) => api.post(`/admin/bank-accounts/${id}/toggle-status`),
  },

  // Reports
  reports: {
    bookings: (params?: any) => api.get("/admin/reports/bookings", { params }),
    revenue: (params?: any) => api.get("/admin/reports/revenue", { params }),
    carsPerformance: (params?: any) =>
      api.get("/admin/reports/cars-performance", { params }),
    userStatistics: (params?: any) =>
      api.get("/admin/reports/user-statistics", { params }),
    export: (data: any) =>
      api.post("/admin/reports/export", data, { responseType: "blob" }),
  },
};

export default api;