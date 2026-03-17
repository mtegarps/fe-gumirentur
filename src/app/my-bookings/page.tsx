'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Car, 
  CreditCard, 
  Clock,
  Eye,
  X,
  ChevronRight,
  Filter,
  Search,
  Download,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookingsAPI } from '@/lib/api';
import { Booking } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  formatCurrency, 
  formatDate, 
  getBookingStatusColor, 
  getBookingStatusLabel,
  getImageUrl
} from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  useAuth(true);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, searchQuery]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat data booking');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.car?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetail(true);
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;
    
    try {
      await bookingsAPI.cancel(bookingId);
      toast.success('Booking berhasil dibatalkan');
      fetchBookings();
      setShowDetail(false);
    } catch (error) {
      toast.error('Gagal membatalkan booking');
    }
  };

  const statuses = [
    { value: 'all', label: 'Semua' },
    { value: 'pending_payment', label: 'Menunggu Pembayaran' },
    { value: 'waiting_verification', label: 'Menunggu Verifikasi' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
            Booking Saya
          </h1>
          <p className="text-neutral-600">
            Kelola dan pantau semua booking Anda di sini
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Cari nomor booking atau mobil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6 shimmer h-48" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="card p-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-neutral-400" size={48} />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Tidak ada booking
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Tidak ada booking yang sesuai dengan filter' 
                : 'Anda belum memiliki booking. Yuk mulai perjalanan Anda!'}
            </p>
            <Link href="/booking" className="btn-primary inline-flex items-center space-x-2">
              <span>Booking Sekarang</span>
              <ChevronRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Car Image */}
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getImageUrl(booking.car?.primary_image)}
                      alt={booking.car?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-display font-semibold text-neutral-900 mb-1">
                          {booking.car?.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {booking.booking_number}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBookingStatusColor(booking.status)}`}>
                        {getBookingStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-neutral-600">
                        <Calendar size={18} />
                        <span className="text-sm">
                          {formatDate(booking.pickup_date)} - {formatDate(booking.return_date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-neutral-600">
                        <Clock size={18} />
                        <span className="text-sm">{booking.rental_days} Hari</span>
                      </div>
                      <div className="flex items-center space-x-2 text-neutral-600">
                        <MapPin size={18} />
                        <span className="text-sm">{booking.pickup_location?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-neutral-600">
                        <CreditCard size={18} />
                        <span className="text-sm font-semibold text-primary-600">
                          {formatCurrency(booking.total_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleViewDetail(booking)}
                        className="btn-secondary btn-sm inline-flex items-center space-x-2"
                      >
                        <Eye size={16} />
                        <span>Detail</span>
                      </button>
                      
                      {booking.status === 'pending_payment' && (
                        <Link
                          href={`/payment/${booking.id}`}
                          className="btn-primary btn-sm inline-flex items-center space-x-2"
                        >
                          <CreditCard size={16} />
                          <span>Bayar Sekarang</span>
                        </Link>
                      )}

                      {(booking.status === 'completed' && !booking.car?.rating) && (
                        <Link
                          href={`/reviews/create?booking=${booking.id}`}
                          className="btn-accent btn-sm inline-flex items-center space-x-2"
                        >
                          <span>Beri Review</span>
                        </Link>
                      )}

                      {['pending_payment', 'waiting_verification'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowDetail(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-neutral-900">
                  Detail Booking
                </h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Car Info */}
                <div className="mb-8">
                  <img
                    src={getImageUrl(selectedBooking.car?.primary_image)}
                    alt={selectedBooking.car?.name}
                    className="w-full h-64 object-cover rounded-xl mb-4"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=400&fit=crop';
                    }}
                  />
                  <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                    {selectedBooking.car?.name}
                  </h3>
                  <p className="text-neutral-600">
                    {selectedBooking.car?.brand} • {selectedBooking.car?.transmission}
                  </p>
                </div>

                {/* Booking Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">Informasi Booking</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-neutral-600">Nomor Booking</p>
                        <p className="font-semibold">{selectedBooking.booking_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBookingStatusColor(selectedBooking.status)}`}>
                          {getBookingStatusLabel(selectedBooking.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Tanggal Booking</p>
                        <p className="font-semibold">{formatDate(selectedBooking.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">Detail Rental</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-neutral-600">Periode Rental</p>
                        <p className="font-semibold">
                          {formatDate(selectedBooking.pickup_date)} - {formatDate(selectedBooking.return_date)}
                        </p>
                        <p className="text-sm text-neutral-600">({selectedBooking.rental_days} hari)</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Lokasi Pickup</p>
                        <p className="font-semibold">{selectedBooking.pickup_location?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Lokasi Return</p>
                        <p className="font-semibold">{selectedBooking.return_location?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t border-neutral-200 pt-6">
                  <h4 className="font-semibold text-neutral-900 mb-4">Rincian Biaya</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-neutral-600">
                      <span>Sewa Mobil ({selectedBooking.rental_days} hari)</span>
                      <span>{formatCurrency(selectedBooking.car_price_per_day * selectedBooking.rental_days)}</span>
                    </div>
                    {selectedBooking.facilities_total > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Fasilitas Tambahan</span>
                        <span>{formatCurrency(selectedBooking.facilities_total)}</span>
                      </div>
                    )}
                    {selectedBooking.delivery_fee > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Biaya Antar</span>
                        <span>{formatCurrency(selectedBooking.delivery_fee)}</span>
                      </div>
                    )}
                    {selectedBooking.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon</span>
                        <span>-{formatCurrency(selectedBooking.discount)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold text-neutral-900 border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(selectedBooking.total_amount)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedBooking.payment && (
                  <div className="border-t border-neutral-200 pt-6 mt-6">
                    <h4 className="font-semibold text-neutral-900 mb-4">Informasi Pembayaran</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Nomor Pembayaran</span>
                        <span className="font-semibold">{selectedBooking.payment.payment_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Metode</span>
                        <span className="font-semibold capitalize">{selectedBooking.payment.payment_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBookingStatusColor(selectedBooking.payment.status)}`}>
                          {selectedBooking.payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
