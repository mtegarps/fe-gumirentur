'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { carsAPI } from '@/lib/api';
import { Car } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CarCard from '@/components/CarCard';
import toast from 'react-hot-toast';

export default function FleetPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [minPassengers, setMinPassengers] = useState(0);
  const [sortBy, setSortBy] = useState('name');

  // Filter options
  const carTypes = ['all', 'SUV', 'Sedan', 'MPV', 'Hatchback', 'Van', 'Pickup'];
  const transmissions = ['all', 'Automatic', 'Manual'];
  const sortOptions = [
    { value: 'name', label: 'Nama A-Z' },
    { value: 'price_low', label: 'Harga Terendah' },
    { value: 'price_high', label: 'Harga Tertinggi' },
    { value: 'rating', label: 'Rating Tertinggi' },
    { value: 'newest', label: 'Terbaru' },
  ];

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    filterAndSortCars();
  }, [cars, searchQuery, selectedType, selectedTransmission, priceRange, minPassengers, sortBy]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await carsAPI.getAll();
      setCars(res.data.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data mobil');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCars = () => {
    let filtered = [...cars];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(car =>
        car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(car => car.type === selectedType);
    }

    // Transmission filter
    if (selectedTransmission !== 'all') {
      filtered = filtered.filter(car => car.transmission === selectedTransmission);
    }

    // Price range filter
    filtered = filtered.filter(
      car => car.price_per_day >= priceRange[0] && car.price_per_day <= priceRange[1]
    );

    // Passenger filter
    if (minPassengers > 0) {
      filtered = filtered.filter(car => car.passenger_capacity >= minPassengers);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price_per_day - b.price_per_day;
        case 'price_high':
          return b.price_per_day - a.price_per_day;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id - a.id;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredCars(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedTransmission('all');
    setPriceRange([0, 2000000]);
    setMinPassengers(0);
    setSortBy('name');
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-3">
          Cari Mobil
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Nama atau brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Car Type */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-3">
          Tipe Mobil
        </label>
        <div className="space-y-2">
          {carTypes.map(type => (
            <label key={type} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="type"
                value={type}
                checked={selectedType === type}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700 group-hover:text-neutral-900 capitalize">
                {type === 'all' ? 'Semua Tipe' : type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-3">
          Transmisi
        </label>
        <div className="space-y-2">
          {transmissions.map(trans => (
            <label key={trans} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="transmission"
                value={trans}
                checked={selectedTransmission === trans}
                onChange={(e) => setSelectedTransmission(e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                {trans === 'all' ? 'Semua' : trans === 'Automatic' ? 'Otomatis' : 'Manual'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-3">
          Harga Per Hari
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="2000000"
            step="50000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Rp 0</span>
            <span className="font-semibold text-primary-600">
              Rp {priceRange[1].toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Passenger Capacity */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-3">
          Min. Penumpang
        </label>
        <select
          value={minPassengers}
          onChange={(e) => setMinPassengers(Number(e.target.value))}
          className="input"
        >
          <option value="0">Semua</option>
          <option value="2">2+ Orang</option>
          <option value="4">4+ Orang</option>
          <option value="6">6+ Orang</option>
          <option value="8">8+ Orang</option>
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="btn-outline w-full inline-flex items-center justify-center space-x-2"
      >
        <X size={18} />
        <span>Reset Filter</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 pt-32 pb-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-display font-bold text-white mb-4"
          >
            Armada Premium Kami
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-100 max-w-2xl mx-auto"
          >
            Pilih dari koleksi mobil terbaik kami untuk perjalanan Anda
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <SlidersHorizontal className="text-primary-600" size={20} />
                <h3 className="font-display font-semibold text-neutral-900">Filter</h3>
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-neutral-600">
                  Menampilkan <span className="font-semibold text-neutral-900">{filteredCars.length}</span> mobil
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden btn-secondary flex-1 sm:flex-none inline-flex items-center justify-center space-x-2"
                >
                  <Filter size={18} />
                  <span>Filter</span>
                </button>

                {/* Sort */}
                <div className="relative flex-1 sm:flex-none sm:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input appearance-none pr-10"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            {/* Cars Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-96 shimmer" />
                ))}
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Tidak ada mobil ditemukan
                </h3>
                <p className="text-neutral-600 mb-6">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <button onClick={resetFilters} className="btn-primary">
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CarCard car={car} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilter(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-neutral-900">Filter</h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <FilterSidebar />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="btn-primary w-full"
              >
                Tampilkan {filteredCars.length} Mobil
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

