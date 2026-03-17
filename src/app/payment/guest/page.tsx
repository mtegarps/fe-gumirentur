'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookingsAPI, paymentsAPI, settingsAPI } from '@/lib/api';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CheckCircle, Clock, Upload, Copy, Check, XCircle,
  CreditCard, Calendar, Car, MapPin, Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getImageUrl } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

function GuestPaymentContent() {
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get('number') || '';
  const email = searchParams.get('email') || '';

  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'e_wallet' | 'cash'>('bank_transfer');
  const [selectedBank, setSelectedBank] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [copied, setCopied] = useState('');

  const [bankAccounts, setBankAccounts] = useState<{bank: string; account: string; holder: string}[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!bookingNumber || !email) {
      toast.error('Link pembayaran tidak valid');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use track API for guest (no auth required)
      const res = await bookingsAPI.track(bookingNumber, email);
      setBooking(res.data.data);
      if (res.data.data.payment) {
        setPayment(res.data.data.payment);
        setSelectedBank(res.data.data.payment.bank_name || '');
      }

      // Load bank accounts from dedicated API
      try {
        const bankRes = await api.get('/bank-accounts');
        const accounts = (bankRes.data.data || []).map((a: any) => ({
          bank: a.bank_name, account: a.account_number, holder: a.account_holder,
        }));
        if (accounts.length) setBankAccounts(accounts);
      } catch {
        // Fallback to settings
        try {
          const sRes = await settingsAPI.getPublic();
          const data = sRes.data.data || {};
          const b1 = data['bank_name_1']?.value;
          const a1 = data['bank_account_number_1']?.value;
          const h1 = data['bank_account_holder_1']?.value;
          const b2 = data['bank_name_2']?.value;
          const a2 = data['bank_account_number_2']?.value;
          const h2 = data['bank_account_holder_2']?.value;
          const accounts: any[] = [];
          if (b1 && a1) accounts.push({ bank: b1, account: a1, holder: h1 || '-' });
          if (b2 && a2) accounts.push({ bank: b2, account: a2, holder: h2 || '-' });
          if (accounts.length) setBankAccounts(accounts);
        } catch {}
      }

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Maks 5MB'); return; }
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCopy = (account: string) => {
    navigator.clipboard.writeText(account);
    setCopied(account);
    toast.success('Disalin!');
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async () => {
    if (!proofFile) { toast.error('Silakan upload bukti pembayaran'); return; }
    if (paymentMethod === 'bank_transfer' && !selectedBank) { toast.error('Pilih bank tujuan'); return; }
    try {
      setUploading(true);

      // Create payment first using guest endpoint
      let paymentId = payment?.id;
      if (!payment) {
        const createRes = await paymentsAPI.createGuest({
          booking_id: booking.id,
          payment_method: paymentMethod,
          amount: booking.total_amount,
          bank_name: selectedBank,
        });
        paymentId = createRes.data.data.id;
      }

      // Upload proof using guest endpoint
      const form = new FormData();
      form.append('payment_proof', proofFile);
      if (selectedBank) form.append('bank_name', selectedBank);

      await paymentsAPI.uploadGuestProof(paymentId, form);
      toast.success('Bukti pembayaran berhasil diupload! Tunggu verifikasi admin.');
      await fetchData(); // Refresh
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal upload bukti');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-32 flex justify-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-32 pb-24">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="card p-10">
              <XCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold mb-2">Booking Tidak Ditemukan</h2>
              <p className="text-neutral-500 text-sm mb-6">Nomor booking atau email tidak sesuai.</p>
              <a href="/" className="btn-primary inline-block">Kembali ke Beranda</a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isVerified = payment?.status === 'verified';
  const isPending = payment?.status === 'pending';
  const isRejected = payment?.status === 'rejected';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-1">Pembayaran</h1>
            <p className="text-neutral-600">Booking #{booking.booking_number}</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">

              {/* Payment status */}
              {payment && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`card p-5 border-2 ${isVerified ? 'bg-green-50 border-green-300' : isRejected ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
                  <div className="flex items-center space-x-3">
                    {isVerified ? <CheckCircle className="text-green-600" size={24} />
                      : isRejected ? <XCircle className="text-red-600" size={24} />
                      : <Clock className="text-yellow-600" size={24} />}
                    <div>
                      <h3 className="font-semibold">
                        {isVerified ? 'Pembayaran Terverifikasi ✅'
                          : isRejected ? 'Pembayaran Ditolak'
                          : 'Menunggu Verifikasi...'}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-0.5">
                        {isVerified ? 'Booking Anda sudah dikonfirmasi. Terima kasih!'
                          : isRejected ? (payment.rejection_reason || 'Silakan upload ulang bukti pembayaran.')
                          : 'Admin akan memverifikasi dalam max 2 jam.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bank accounts */}
              {!isVerified && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                  <h2 className="text-xl font-display font-semibold mb-5">Transfer ke Rekening</h2>

                  <div className="space-y-3 mb-6">
                    {bankAccounts.map((acc) => (
                      <div key={acc.bank}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedBank === acc.bank ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                        onClick={() => setSelectedBank(acc.bank)}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${selectedBank === acc.bank ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                            {acc.bank.slice(0, 3)}
                          </div>
                          <div>
                            <p className="font-semibold">{acc.bank}</p>
                            <p className="text-sm text-neutral-500">{acc.holder}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-semibold text-lg">{acc.account}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleCopy(acc.account); }}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            {copied === acc.account ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-neutral-400" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-neutral-700 mb-2">Total yang harus dibayar:</p>
                    <p className="text-3xl font-display font-bold text-primary-600">{formatCurrency(booking.total_amount)}</p>
                    <p className="text-xs text-neutral-500 mt-1">Mohon transfer tepat sesuai nominal di atas</p>
                  </div>

                  {/* Upload proof */}
                  <div>
                    <h3 className="font-semibold mb-3">Upload Bukti Pembayaran</h3>
                    {proofPreview || (payment?.payment_proof && !proofFile) ? (
                      <div className="mb-4">
                        <img
                          src={proofPreview || `${BASE_URL}/storage/payments/${payment.payment_proof}`}
                          alt="Bukti Pembayaran"
                          className="max-h-64 rounded-xl border object-contain w-full"
                        />
                        {proofPreview && (
                          <p className="text-xs text-amber-600 mt-2">File baru dipilih, siap diupload.</p>
                        )}
                      </div>
                    ) : null}

                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

                    {!isVerified && !isPending && (
                      <>
                        <div
                          className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors mb-4"
                          onClick={() => fileRef.current?.click()}>
                          <Upload size={32} className="text-neutral-300 mx-auto mb-2" />
                          <p className="text-neutral-600 font-medium">Klik untuk pilih foto</p>
                          <p className="text-sm text-neutral-400 mt-1">JPG, PNG, max 5MB</p>
                        </div>

                        <button
                          onClick={handleSubmit}
                          disabled={uploading || !proofFile || !selectedBank}
                          className="w-full btn-primary py-3 text-base flex items-center justify-center space-x-2 disabled:opacity-50">
                          {uploading
                            ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Mengupload...</span></>
                            : <><CheckCircle size={20} /><span>Kirim Bukti Pembayaran</span></>}
                        </button>
                      </>
                    )}

                    {isPending && !isRejected && (
                      <div className="text-center py-4">
                        <p className="text-sm text-neutral-500">Bukti sudah dikirim. Menunggu verifikasi admin.</p>
                        <button onClick={() => fileRef.current?.click()} className="btn-ghost text-sm mt-2">
                          Ganti bukti pembayaran
                        </button>
                        {proofFile && (
                          <button onClick={handleSubmit} disabled={uploading}
                            className="btn-primary ml-2 text-sm mt-2">
                            {uploading ? 'Mengupload...' : 'Upload Ulang'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar: Booking summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="font-display font-bold text-lg mb-4">Ringkasan Booking</h3>

                {booking.car && (
                  <div className="mb-4 pb-4 border-b">
                    {booking.car.primary_image && (
                      <img
                        src={getImageUrl(booking.car.primary_image)}
                        alt={booking.car.name}
                        className="w-full h-28 object-cover rounded-lg mb-3"
                        onError={e => e.currentTarget.style.display = 'none'}
                      />
                    )}
                    <h4 className="font-semibold">{booking.car.name}</h4>
                    <p className="text-sm text-neutral-500">{booking.car.brand} • {booking.car.year}</p>
                  </div>
                )}

                <div className="space-y-3 text-sm mb-4 pb-4 border-b">
                  <div className="flex items-center space-x-2 text-neutral-600">
                    <Calendar size={14} />
                    <span>{formatDate(booking.pickup_date)} – {formatDate(booking.return_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-neutral-600">
                    <MapPin size={14} />
                    <span>{booking.pickup_location?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-neutral-600">
                    <Car size={14} />
                    <span>{booking.rental_days} hari</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(booking.subtotal)}</span>
                  </div>
                  {booking.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>-{formatCurrency(booking.discount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t-2 border-neutral-900">
                  <span className="font-display font-bold">Total</span>
                  <span className="font-display font-bold text-xl text-primary-600">{formatCurrency(booking.total_amount)}</span>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-neutral-500">
                  <p className="font-medium text-neutral-700 mb-1">Atas Nama:</p>
                  <p>{booking.guest_name}</p>
                  <p>{booking.guest_email}</p>
                  <p>{booking.guest_phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function GuestPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <GuestPaymentContent />
    </Suspense>
  );
}
