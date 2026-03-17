'use client';
import { useState } from 'react';
import { bookingsAPI, paymentsAPI } from '@/lib/api';
import { Booking, Payment } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { Search, Calendar, MapPin, CreditCard, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';export default function TrackBookingPage() {
  const [loading, setLoading] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await bookingsAPI.track(bookingNumber, email);
      setBooking(res.data.data);
      
      // Fetch payment if exists
      if (res.data.data.payment) {
        const paymentRes = await paymentsAPI.getByBooking(res.data.data.id);
        setPayment(paymentRes.data.data);
      }
      
      toast.success('Booking found!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking not found');
      setBooking(null);
      setPayment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async () => {
    if (!uploadFile || !payment) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('payment_proof', uploadFile);
      formData.append('payment_date', new Date().toISOString().split('T')[0]);

      await paymentsAPI.uploadProof(payment.id, formData);
      toast.success('Payment proof uploaded successfully!');
      setShowUpload(false);
      setUploadFile(null);
      
      // Refresh booking data
      handleTrack(new Event('submit') as any);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_payment: 'bg-yellow-100 text-yellow-700',
      waiting_verification: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      ongoing: 'bg-purple-100 text-purple-700',
      completed: 'bg-accent-100 text-accent-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-700';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">
              Track Your Booking
            </h1>
            <p className="text-lg text-neutral-600">
              Enter your booking number and email to check your booking status
            </p>
          </div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 mb-8"
          >
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="label">Booking Number</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value.toUpperCase())}
                  placeholder="BK20240210ABC123"
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Search size={20} />
                <span>{loading ? 'Searching...' : 'Track Booking'}</span>
              </button>
            </form>
          </motion.div>

          {/* Booking Details */}
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-neutral-900 mb-1">
                      Booking #{booking.booking_number}
                    </h2>
                    <p className="text-neutral-600">
                      Created on {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Calendar className="text-primary-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-neutral-600">Rental Period</p>
                      <p className="font-semibold">
                        {new Date(booking.pickup_date).toLocaleDateString()} - {new Date(booking.return_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-neutral-500">{booking.rental_days} days</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="text-primary-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-neutral-600">Locations</p>
                      <p className="font-semibold">{booking.pickup_location?.name}</p>
                      <p className="text-sm text-neutral-500">to {booking.return_location?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Car Details */}
              {booking.car && (
                <div className="card p-6">
                  <h3 className="text-xl font-display font-bold mb-4">Vehicle Details</h3>
                  <div className="flex items-center space-x-6">
                    <img
                      src={booking.car.primary_image ? getImageUrl(booking.car.primary_image) : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=150&fit=crop'}
                      alt={booking.car.name}
                      className="w-32 h-24 object-cover rounded-lg"
                      onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=150&fit=crop'}
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900">{booking.car.name}</h4>
                      <p className="text-neutral-600">{booking.car.brand} • {booking.car.year}</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {booking.car.type} • {booking.car.transmission} • {booking.car.passenger_capacity} seats
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-display font-bold">Payment Details</h3>
                  {payment && (
                    <span className={`badge ${getPaymentStatusColor(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-semibold">Rp {(booking.subtotal / 1000).toFixed(0)}K</span>
                  </div>
                  {booking.discount > 0 && (
                    <div className="flex justify-between text-accent-600">
                      <span>Discount ({booking.promo_code})</span>
                      <span className="font-semibold">-Rp {(booking.discount / 1000).toFixed(0)}K</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-display font-bold text-lg">Total Amount</span>
                  <span className="font-display font-bold text-2xl text-primary-600">
                    Rp {(booking.total_amount / 1000).toFixed(0)}K
                  </span>
                </div>

                {/* Upload Payment Proof */}
                {booking.status === 'pending_payment' && (
                  <>
                    {!showUpload ? (
                      <button
                        onClick={() => setShowUpload(true)}
                        className="btn-primary w-full flex items-center justify-center space-x-2"
                      >
                        <Upload size={20} />
                        <span>Upload Payment Proof</span>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="label">Upload Payment Proof (JPG, PNG)</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="input-field"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleUploadProof}
                            disabled={!uploadFile || uploading}
                            className="btn-primary flex-1 disabled:opacity-50"
                          >
                            {uploading ? 'Uploading...' : 'Submit'}
                          </button>
                          <button
                            onClick={() => {
                              setShowUpload(false);
                              setUploadFile(null);
                            }}
                            className="btn-ghost"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {payment?.payment_proof && (
                  <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600 mb-2">Payment proof submitted</p>
                    <img
                      src={`http://localhost:8000/storage/payments/${payment.payment_proof}`}
                      alt="Payment proof"
                      className="max-h-64 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Contact Support */}
              <div className="card p-6 bg-primary-50 border border-primary-200">
                <h3 className="font-semibold text-primary-900 mb-2">Need Help?</h3>
                <p className="text-sm text-primary-800 mb-4">
                  Contact our customer support for assistance with your booking
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="tel:+622155512 34" className="btn-secondary text-center">
                    Call Us
                  </a>
                  <a href="mailto:info@gumilar.com" className="btn-secondary text-center">
                    Email Us
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
