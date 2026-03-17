'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Fuel,
  Gauge,
  Star,
  Calendar,
  Check,
  MapPin,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Heart,
} from 'lucide-react';
import { carsAPI, reviewsAPI } from '@/lib/api';
import { Car, Review } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatCurrency, formatDate, getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [carRes, reviewsRes] = await Promise.all([
        carsAPI.getById(Number(params.id)),
        carsAPI.getReviews(Number(params.id)),
      ]);
      setCar(carRes.data.data);
      setReviews(reviewsRes.data.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data mobil');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: car?.name,
        text: `Check out this ${car?.name}!`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link berhasil disalin!');
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-24 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="card p-0 overflow-hidden shimmer h-96" />
              <div className="card p-8 shimmer h-96" />
            </div>
            <div className="card p-8 shimmer h-64" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-3xl font-display font-bold mb-4">Mobil Tidak Ditemukan</h2>
            <p className="text-neutral-600 mb-8">Mobil yang Anda cari tidak tersedia</p>
            <button onClick={() => router.push('/fleet')} className="btn-primary">
              Lihat Armada Lainnya
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = car.images && car.images.length > 0 
    ? car.images.map(img => getImageUrl(img))
    : [getImageUrl(car.primary_image)];

  const specifications = [
    { icon: Users, label: 'Kapasitas', value: `${car.passenger_capacity} Orang` },
    { icon: Gauge, label: 'Transmisi', value: car.transmission },
    { icon: Fuel, label: 'Bahan Bakar', value: car.fuel_type || 'Bensin' },
    { icon: MapPin, label: 'Plat', value: car.license_plate },
    { icon: Calendar, label: 'Tahun', value: car.year.toString() },
    { icon: Shield, label: 'Status', value: car.status === 'available' ? 'Tersedia' : 'Tidak Tersedia' },
  ];

  const features = [
    { icon: Check, label: 'AC', available: car.has_ac },
    { icon: Check, label: 'GPS', available: car.has_gps },
    { icon: Check, label: 'Asuransi', available: true },
    { icon: Check, label: 'Sopir Tersedia', available: true },
    { icon: Check, label: 'Bebas Bau Rokok', available: true },
    { icon: Check, label: 'Audio System', available: true },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 mb-6 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali</span>
          </motion.button>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Image Gallery */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                {/* Main Image */}
                <div
                  className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => setShowImageModal(true)}
                >
                  <img
                    src={images[selectedImageIndex]}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop';
                    }}
                  />
                  
                  {/* Share & Favorite Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite();
                      }}
                      className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                        isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white'
                      }`}
                    >
                      <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex
                            ? 'border-primary-600 ring-2 ring-primary-200'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <img src={img} alt={`${car.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {car.type}
                  </span>
                {Number(car.rating) > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-sm">
                      {Number(car.rating).toFixed(1)}
                    </span>
                    <span className="text-xs text-neutral-500">({car.total_reviews})</span>
                  </div>
                )}
                </div>

                <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">{car.name}</h1>
                <p className="text-neutral-600 mb-6">
                  {car.brand} {car.model} • {car.year}
                </p>

                <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 mb-6">
                  <p className="text-sm text-neutral-600 mb-2">Harga Per Hari</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-display font-bold text-primary-600">
                      {formatCurrency(car.price_per_day)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">*Harga belum termasuk fasilitas tambahan</p>
                </div>

                <button
                  onClick={() => router.push(`/booking?car=${car.id}`)}
                  disabled={car.status !== 'available'}
                  className="btn-primary w-full mb-3"
                >
                  {car.status === 'available' ? 'Booking Sekarang' : 'Tidak Tersedia'}
                </button>
                
                <button
                  onClick={() => router.push('/fleet')}
                  className="btn-secondary w-full"
                >
                  Lihat Mobil Lainnya
                </button>

                {/* Quick Contact */}
                <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm font-semibold text-neutral-900 mb-2">Butuh Bantuan?</p>
                  <p className="text-xs text-neutral-600 mb-3">Hubungi customer service kami</p>
                  <a
                    href="https://wa.me/628123456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent w-full text-sm"
                  >
                    Chat WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">Spesifikasi</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <spec.icon className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">{spec.label}</p>
                    <p className="font-semibold text-neutral-900">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Description & Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-4">Deskripsi</h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              {car.description || 
                `${car.name} adalah kendaraan premium dengan kondisi sangat baik dan perawatan rutin. Cocok untuk perjalanan bisnis maupun liburan keluarga. Dilengkapi dengan fitur-fitur modern untuk kenyamanan perjalanan Anda.`}
            </p>

            <h3 className="text-xl font-display font-semibold text-neutral-900 mb-4">Fitur & Fasilitas</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg ${
                    feature.available ? 'bg-green-50 text-green-700' : 'bg-neutral-50 text-neutral-400'
                  }`}
                >
                  <feature.icon size={18} />
                  <span className="font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Additional Facilities */}
            {car.facilities && car.facilities.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-display font-semibold text-neutral-900 mb-4">
                  Fasilitas Tambahan
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {car.facilities.map((facility) => (
                    <div key={facility.id} className="flex items-center justify-between p-4 bg-accent-50 rounded-lg">
                      <span className="font-medium text-neutral-900">{facility.name}</span>
                      <span className="text-sm font-semibold text-accent-600">
                        +{formatCurrency(facility.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-neutral-900 mb-1">Review Customer</h2>
                {car.total_reviews > 0 && (
                  <p className="text-neutral-600">
                    {car.total_reviews} review • Rating rata-rata {Number(car.rating || 0).toFixed(1)}/5.0
                  </p>
                )}
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="mx-auto mb-4 text-neutral-300" size={48} />
                <p className="text-neutral-600">Belum ada review untuk mobil ini</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-neutral-200 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {review.user?.name || review.guest_name}
                        </p>
                        <p className="text-sm text-neutral-500">{formatDate(review.created_at)}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-neutral-700">{review.comment}</p>}
                  </div>
                ))}
                
                {reviews.length > 5 && (
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    Lihat Semua Review ({reviews.length})
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="relative max-w-5xl w-full">
            <img
              src={images[selectedImageIndex]}
              alt={car.name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
