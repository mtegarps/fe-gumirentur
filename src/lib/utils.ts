import { format, parseISO, differenceInDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

// Format currency to IDR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date, formatStr: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: localeId });
};

// Format datetime
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
};

// Calculate rental days
export const calculateRentalDays = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start) || 1;
};

// Get booking status color
export const getBookingStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-800',
    waiting_verification: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    ongoing: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get booking status label
export const getBookingStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending_payment: 'Menunggu Pembayaran',
    waiting_verification: 'Menunggu Verifikasi',
    confirmed: 'Dikonfirmasi',
    ongoing: 'Sedang Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return labels[status] || status;
};

// Get payment status color
export const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get payment status label
export const getPaymentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
  };
  return labels[status] || status;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone (Indonesian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Get car type icon
export const getCarTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    SUV: '🚙',
    Sedan: '🚗',
    MPV: '🚐',
    Hatchback: '🚕',
    Van: '🚚',
    Pickup: '🛻',
  };
  return icons[type] || '🚗';
};

// Get transmission label
export const getTransmissionLabel = (transmission: string): string => {
  return transmission === 'Manual' ? 'Manual' : 'Otomatis';
};

// Truncate text
export const truncate = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Generate random color for avatar
export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Check if image URL is valid
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

// Get image URL (handle relative paths)
export const getImageUrl = (path: string | undefined): string => {
  if (!path) return '/placeholder-car.jpg';
  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
  // Already has /storage prefix
  if (path.startsWith('/storage/')) return `${baseUrl}${path}`;
  // Has directory prefix like cars/filename.jpg
  if (path.includes('/')) return `${baseUrl}/storage/${path}`;
  // Bare filename (legacy) — assume cars directory
  return `${baseUrl}/storage/cars/${path}`;
};

// Parse API error message
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstKey = Object.keys(errors)[0];
    return errors[firstKey][0];
  }
  if (error.message) {
    return error.message;
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
};

// Generate booking number (client-side preview)
export const generateBookingNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
};

// Check if date is in past
export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
};

// Get time ago
export const getTimeAgo = (date: string): string => {
  const now = new Date();
  const past = parseISO(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  
  return formatDate(date);
};

// Download file
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Calculate discount amount
export const calculateDiscount = (
  subtotal: number,
  type: 'percentage' | 'fixed',
  value: number,
  maxDiscount?: number
): number => {
  let discount = type === 'percentage' ? (subtotal * value) / 100 : value;
  if (maxDiscount && discount > maxDiscount) {
    discount = maxDiscount;
  }
  return Math.min(discount, subtotal);
};
