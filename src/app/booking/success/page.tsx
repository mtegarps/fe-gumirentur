'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, CreditCard, Phone, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { settingsAPI } from '@/lib/api';

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get('number');
  const [bankAccounts, setBankAccounts] = useState([
    { bank: 'BCA', account: '1234567890', holder: 'PT Gumilar Rent' },
    { bank: 'Mandiri', account: '0987654321', holder: 'PT Gumilar Rent' },
  ]);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    settingsAPI.getPublic().then(res => {
      const data = res.data.data || {};
      const b1 = data['bank_name_1']?.value, a1 = data['bank_account_number_1']?.value, h1 = data['bank_account_holder_1']?.value;
      const b2 = data['bank_name_2']?.value, a2 = data['bank_account_number_2']?.value, h2 = data['bank_account_holder_2']?.value;
      const accounts: any[] = [];
      if (b1 && a1) accounts.push({ bank: b1, account: a1, holder: h1 || 'PT Gumilar Rent' });
      if (b2 && a2) accounts.push({ bank: b2, account: a2, holder: h2 || 'PT Gumilar Rent' });
      if (accounts.length) setBankAccounts(accounts);
    }).catch(() => {});
  }, []);

  const handleCopy = (account: string) => {
    navigator.clipboard.writeText(account);
    setCopied(account);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
            <div className="w-24 h-24 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-accent-600" size={48} />
            </div>
            <h1 className="text-4xl font-display font-bold text-neutral-900 mb-3">Booking Berhasil!</h1>
            <p className="text-lg text-neutral-600">Pesanan Anda telah berhasil dibuat</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-8 mb-6">
            <div className="text-center mb-6 pb-6 border-b">
              <p className="text-sm text-neutral-600 mb-2">Nomor Booking</p>
              <p className="text-3xl font-display font-bold text-primary-600">{bookingNumber}</p>
              <p className="text-sm text-neutral-500 mt-2">Simpan nomor ini untuk melacak pesanan Anda</p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-primary-900 mb-4">Langkah Selanjutnya:</h3>
              <ol className="space-y-3">
                {[
                  'Cek email Anda untuk konfirmasi booking',
                  'Lakukan pembayaran ke rekening di bawah dalam 24 jam',
                  'Upload bukti transfer melalui link di email atau halaman pembayaran',
                  'Tunggu konfirmasi admin (maks 2 jam)',
                ].map((step, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">{i + 1}</span>
                    <span className="text-primary-800 text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <a href="tel:+6221555123" className="btn-secondary text-center flex items-center justify-center space-x-2">
                <Phone size={18} />
                <span>Hubungi Support</span>
              </a>
              <Link href={`/track`} className="btn-primary text-center flex items-center justify-center space-x-2">
                <CreditCard size={18} />
                <span>Lacak Booking</span>
              </Link>
            </div>
          </motion.div>

          {/* Bank accounts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 bg-neutral-800 text-white">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <CreditCard size={20} />
              <span>Rekening Tujuan Pembayaran</span>
            </h3>
            <div className="space-y-3">
              {bankAccounts.map((acc) => (
                <div key={acc.bank} className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                  <div>
                    <p className="font-semibold">{acc.bank}</p>
                    <p className="text-neutral-300 text-sm">{acc.holder}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-lg font-bold">{acc.account}</span>
                    <button onClick={() => handleCopy(acc.account)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      {copied === acc.account
                        ? <Check size={16} className="text-green-400" />
                        : <Copy size={16} className="text-neutral-300" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-center mt-8">
            <Link href="/" className="text-neutral-600 hover:text-primary-600 text-sm">← Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
