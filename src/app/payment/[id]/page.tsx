'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Building2,
  Calendar,
  Car,
  MapPin,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookingsAPI, paymentsAPI, settingsAPI } from '@/lib/api';
import api from '@/lib/api';
import { Booking, Payment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import {
  formatCurrency,
  formatDate,
  getBookingStatusColor,
  getBookingStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getImageUrl,
  copyToClipboard,
} from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  // Removed useAuth(true) - payment page accessible without login via guest flow
  const { user } = useAuth(false);

  const params = useParams();
  const router = useRouter();
  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'e_wallet' | 'cash'>('bank_transfer');
  const [selectedBank, setSelectedBank] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Bank accounts loaded from API
  const [bankAccounts, setBankAccounts] = useState<{bank: string; account: string; holder: string}[]>([]);

  useEffect(() => {
    fetchData();
    // Load bank accounts from dedicated API endpoint
    api.get('/bank-accounts').then(res => {
      const accounts = (res.data.data || []).map((a: any) => ({
        bank: a.bank_name,
        account: a.account_number,
        holder: a.account_holder,
      }));
      if (accounts.length) setBankAccounts(accounts);
    }).catch(() => {
      // Fallback: try old settings approach
      settingsAPI.getPublic().then(res => {
        const data = res.data.data || {};
        const b1 = data['bank_name_1']?.value, a1 = data['bank_account_number_1']?.value, h1 = data['bank_account_holder_1']?.value;
        const b2 = data['bank_name_2']?.value, a2 = data['bank_account_number_2']?.value, h2 = data['bank_account_holder_2']?.value;
        const fallback: any[] = [];
        if (b1 && a1) fallback.push({ bank: b1, account: a1, holder: h1 || '-' });
        if (b2 && a2) fallback.push({ bank: b2, account: a2, holder: h2 || '-' });
        if (fallback.length) setBankAccounts(fallback);
      }).catch(() => {});
    });
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingRes = await bookingsAPI.getById(bookingId);
      setBooking(bookingRes.data.data);

      // Check if payment already exists
      try {
        const paymentRes = await paymentsAPI.getByBooking(bookingId);
        setPayment(paymentRes.data.data);
        setPaymentMethod(paymentRes.data.data.payment_method);
        setSelectedBank(paymentRes.data.data.bank_name || '');
      } catch (error) {
        // Payment doesn't exist yet, that's okay
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data booking');
      router.push('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setProofFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proofFile) {
      toast.error('Silakan upload bukti pembayaran');
      return;
    }

    if (paymentMethod === 'bank_transfer' && !selectedBank) {
      toast.error('Silakan pilih bank tujuan');
      return;
    }

    try {
      setUploading(true);

      // Create payment if doesn't exist
      let paymentId = payment?.id;
      if (!payment) {
        const paymentData = {
          booking_id: bookingId,
          payment_method: paymentMethod,
          amount: booking!.total_amount,
          bank_name: selectedBank,
        };
        const createRes = await paymentsAPI.create(paymentData);
        paymentId = createRes.data.data.id;
      }

      // Upload proof
      const formData = new FormData();
      formData.append('payment_proof', proofFile);
      if (paymentMethod === 'bank_transfer') {
        formData.append('bank_name', selectedBank);
      }

      await paymentsAPI.uploadProof(paymentId!, formData);

      toast.success('Bukti pembayaran berhasil diupload!');
      router.push('/my-bookings');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengupload bukti pembayaran';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyAccount = (account: string) => {
    copyToClipboard(account);
    setCopiedAccount(true);
    toast.success('Nomor rekening berhasil disalin');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-24 pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card p-8 shimmer h-96" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  // Check if payment is already verified
  const isPaymentVerified = payment?.status === 'verified';
  const isPaymentPending = payment?.status === 'pending';
  const isPaymentRejected = payment?.status === 'rejected';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
              Pembayaran
            </h1>
            <p className="text-neutral-600">
              Selesaikan pembayaran untuk booking #{booking.booking_number}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Status */}
              {payment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card p-6 ${
                    isPaymentVerified
                      ? 'bg-green-50 border-green-200'
                      : isPaymentRejected
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {isPaymentVerified ? (
                      <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    ) : isPaymentRejected ? (
                      <XCircle className="text-red-600 flex-shrink-0" size={24} />
                    ) : (
                      <Clock className="text-yellow-600 flex-shrink-0" size={24} />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {isPaymentVerified
                          ? 'Pembayaran Terverifikasi'
                          : isPaymentRejected
                          ? 'Pembayaran Ditolak'
                          : 'Menunggu Verifikasi'}
                      </h3>
                      <p className="text-sm text-neutral-700">
                        {isPaymentVerified
                          ? 'Pembayaran Anda telah dikonfirmasi. Booking Anda sedang diproses.'
                          : isPaymentRejected
                          ? payment.rejection_reason || 'Bukti pembayaran ditolak. Silakan upload ulang.'
                          : 'Bukti pembayaran Anda sedang diverifikasi oleh admin. Harap tunggu.'}
                      </p>
                      {payment.verified_at && (
                        <p className="text-xs text-neutral-600 mt-2">
                          Diverifikasi pada {formatDate(payment.verified_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bank Transfer Instructions */}
              {!isPaymentVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card p-6"
                >
                  <h2 className="text-xl font-display font-semibold text-neutral-900 mb-4">
                    Pilih Metode Pembayaran
                  </h2>

                  <div className="space-y-3 mb-6">
                    <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                      <input
                        type="radio"
                        name="payment_method"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-5 h-5"
                      />
                      <Building2 className="text-primary-600" size={24} />
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">Transfer Bank</p>
                        <p className="text-sm text-neutral-600">BCA, Mandiri, BNI</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors opacity-50 cursor-not-allowed">
                      <input
                        type="radio"
                        name="payment_method"
                        value="e_wallet"
                        disabled
                        className="w-5 h-5"
                      />
                      <CreditCard className="text-neutral-400" size={24} />
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-600">E-Wallet</p>
                        <p className="text-sm text-neutral-500">Segera hadir</p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'bank_transfer' && (
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Pilih Bank Tujuan</h3>
                      <div className="space-y-3 mb-6">
                        {bankAccounts.map((bank) => (
                          <label
                            key={bank.bank}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              selectedBank === bank.bank
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <input
                                type="radio"
                                name="bank"
                                value={bank.bank}
                                checked={selectedBank === bank.bank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-5 h-5"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-neutral-900">{bank.bank}</p>
                                <p className="text-sm text-neutral-600">{bank.holder}</p>
                                <p className="text-sm font-mono text-neutral-900 mt-1">
                                  {bank.account}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCopyAccount(bank.account);
                              }}
                              className="ml-3 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                              {copiedAccount ? (
                                <Check className="text-green-600" size={20} />
                              ) : (
                                <Copy className="text-neutral-600" size={20} />
                              )}
                            </button>
                          </label>
                        ))}
                      </div>

                      {selectedBank && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                            <div className="text-sm text-blue-900">
                              <p className="font-semibold mb-1">Instruksi Transfer:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                <li>Transfer tepat sejumlah {formatCurrency(booking.total_amount)}</li>
                                <li>Gunakan nomor booking sebagai berita transfer</li>
                                <li>Simpan bukti transfer</li>
                                <li>Upload bukti transfer di bawah ini</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Upload Proof */}
              {!isPaymentVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card p-6"
                >
                  <h2 className="text-xl font-display font-semibold text-neutral-900 mb-4">
                    Upload Bukti Pembayaran
                  </h2>

                  {payment?.payment_proof && !proofPreview ? (
                    <div className="mb-6">
                      <p className="text-sm text-neutral-600 mb-3">Bukti pembayaran saat ini:</p>
                      <img
                        src={getImageUrl(payment.payment_proof)}
                        alt="Payment proof"
                        className="w-full max-w-md rounded-lg border border-neutral-200"
                      />
                      {isPaymentRejected && (
                        <p className="text-sm text-red-600 mt-2">
                          Bukti ditolak. Silakan upload ulang.
                        </p>
                      )}
                    </div>
                  ) : null}

                  <div className="mb-6">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label
                        htmlFor="proof-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
                      >
                        {proofPreview ? (
                          <div className="relative w-full h-full p-4">
                            <img
                              src={proofPreview}
                              alt="Preview"
                              className="w-full h-full object-contain rounded-lg"
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setProofFile(null);
                                setProofPreview('');
                              }}
                              className="absolute top-6 right-6 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto mb-4 text-neutral-400" size={48} />
                            <p className="text-neutral-700 font-medium mb-1">
                              Klik untuk upload bukti transfer
                            </p>
                            <p className="text-sm text-neutral-500">
                              PNG, JPG, JPEG (Max. 5MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!proofFile || uploading}
                    className="btn-primary w-full inline-flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengupload...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>Upload Bukti Pembayaran</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6 sticky top-24"
              >
                <h3 className="font-display font-semibold text-neutral-900 mb-4">
                  Ringkasan Booking
                </h3>

                {/* Car Info */}
                <div className="mb-4 pb-4 border-b border-neutral-200">
                  {booking.car?.primary_image && (
                    <img
                      src={getImageUrl(booking.car.primary_image)}
                      alt={booking.car.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="font-semibold text-neutral-900 mb-1">{booking.car?.name}</p>
                  <p className="text-sm text-neutral-600">{booking.car?.brand}</p>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200">
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="text-neutral-500" size={18} />
                    <div>
                      <p className="text-neutral-600">Tanggal</p>
                      <p className="font-medium text-neutral-900">
                        {formatDate(booking.pickup_date)} - {formatDate(booking.return_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="text-neutral-500" size={18} />
                    <div>
                      <p className="text-neutral-600">Lokasi Pickup</p>
                      <p className="font-medium text-neutral-900">
                        {booking.pickup_location?.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Sewa ({booking.rental_days} hari)</span>
                    <span className="font-medium">
                      {formatCurrency(booking.car_price_per_day * booking.rental_days)}
                    </span>
                  </div>
                  {booking.facilities_total > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Fasilitas</span>
                      <span className="font-medium">{formatCurrency(booking.facilities_total)}</span>
                    </div>
                  )}
                  {booking.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Antar Jemput</span>
                      <span className="font-medium">{formatCurrency(booking.delivery_fee)}</span>
                    </div>
                  )}
                  {booking.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>-{formatCurrency(booking.discount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t-2 border-neutral-900">
                  <div className="flex justify-between items-center">
                    <span className="font-display font-semibold text-neutral-900">Total</span>
                    <span className="text-2xl font-display font-bold text-primary-600">
                      {formatCurrency(booking.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Booking Number */}
                <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-600 mb-1">Nomor Booking</p>
                  <p className="font-mono font-semibold text-neutral-900">
                    {booking.booking_number}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
