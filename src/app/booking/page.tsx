'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { carsAPI, locationsAPI, facilitiesAPI, promotionsAPI, bookingsAPI } from '@/lib/api';
import { Car, Location, CarFacility } from '@/types';
import { useBookingStore, useAuthStore } from '@/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Plus, Minus, Tag, Truck, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get('car');
  const { user } = useAuthStore();
  const bookingStore = useBookingStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [car, setCar] = useState<Car | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [facilities, setFacilities] = useState<CarFacility[]>([]);

  // Form state
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupLocationId, setPickupLocationId] = useState('');
  const [returnLocationId, setReturnLocationId] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<{[key: number]: number}>({});
  const [needDelivery, setNeedDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsRes, locationsRes, facilitiesRes] = await Promise.all([
        carId ? carsAPI.getById(Number(carId)) : Promise.resolve(null),
        locationsAPI.getAll(),
        facilitiesAPI.getAll(),
      ]);
      if (carsRes) setCar(carsRes.data.data);
      setLocations(locationsRes.data.data);
      setFacilities(facilitiesRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validatePromo = async () => {
    if (!promoCode) return;
    try {
      const subtotal = calculateSubtotal();
      const res = await promotionsAPI.validate(promoCode, subtotal);
      setDiscount(res.data.data.discount_amount);
      toast.success('Promo code applied!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid promo code');
      setDiscount(0);
    }
  };

  const calculateRentalDays = () => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateSubtotal = () => {
    if (!car) return 0;
    const days = calculateRentalDays();
    const hasDriver = car.driver_price_per_day && Number(car.driver_price_per_day) > 0;
    const carTotal = (hasDriver ? Number(car.driver_price_per_day) : Number(car.price_per_day)) * days;
    const facilitiesTotal = Object.entries(selectedFacilities).reduce((sum, [id, qty]) => {
      const facility = facilities.find(f => f.id === Number(id));
      return sum + (facility ? facility.price * qty * days : 0);
    }, 0);
    const deliveryFee = needDelivery ? 50000 : 0;
    return carTotal + facilitiesTotal + deliveryFee;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const facilitiesArray = Object.entries(selectedFacilities).map(([id, quantity]) => ({
        id: Number(id),
        quantity,
      }));

      const bookingData = {
        car_id: car!.id,
        pickup_location_id: Number(pickupLocationId),
        return_location_id: Number(returnLocationId),
        pickup_date: pickupDate,
        return_date: returnDate,
        facilities: facilitiesArray,
        promo_code: promoCode || undefined,
        need_delivery: needDelivery,
        delivery_address: needDelivery ? deliveryAddress : undefined,
        notes: notes || undefined,
      };

      let response;
      if (user) {
        response = await bookingsAPI.create(bookingData);
      } else {
        response = await bookingsAPI.createGuest({
          ...bookingData,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          guest_address: guestAddress,
        });
      }

      toast.success('Booking berhasil dibuat!');
      const bookingId = response.data.data.id;
      const bookingNum = response.data.data.booking_number;
      if (user) {
        router.push(`/payment/${bookingId}`);
      } else {
        // Guest: redirect ke guest payment page dengan number + email
        router.push(`/payment/guest?number=${bookingNum}&email=${encodeURIComponent(guestEmail)}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedToStep = (targetStep: number) => {
    if (targetStep === 2) {
      return car && pickupDate && returnDate && pickupLocationId && returnLocationId;
    }
    if (targetStep === 3) {
      return true;
    }
    if (targetStep === 4) {
      if (!user) {
        return guestName && guestEmail && guestPhone;
      }
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-32 pb-24">
          <div className="max-w-4xl mx-auto px-4">
            <div className="card p-12 text-center shimmer h-96"></div>
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
          <div className="max-w-4xl mx-auto px-4">
            <div className="card p-12 text-center">
              <h2 className="text-2xl font-display font-bold mb-4">No Car Selected</h2>
              <p className="text-neutral-600 mb-6">Please select a car first</p>
              <a href="/fleet" className="btn-primary inline-block">Browse Fleet</a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4].map((s, idx) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= s ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                    {s}
                  </div>
                  {idx < 3 && <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-neutral-200'}`}></div>}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 max-w-md mx-auto">
              <span className="text-xs text-neutral-600">Details</span>
              <span className="text-xs text-neutral-600">Extras</span>
              <span className="text-xs text-neutral-600">Review</span>
              <span className="text-xs text-neutral-600">Confirm</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Booking Details */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card p-8"
                  >
                    <h2 className="text-2xl font-display font-bold mb-6">Booking Details</h2>
                    
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Pickup Date</label>
                          <input
                            type="date"
                            className="input-field"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="label">Return Date</label>
                          <input
                            type="date"
                            className="input-field"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            min={pickupDate || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="label">Pickup Location</label>
                        <select
                          className="input-field"
                          value={pickupLocationId}
                          onChange={(e) => setPickupLocationId(e.target.value)}
                        >
                          <option value="">Select location</option>
                          {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name} - {loc.city}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">Return Location</label>
                        <select
                          className="input-field"
                          value={returnLocationId}
                          onChange={(e) => setReturnLocationId(e.target.value)}
                        >
                          <option value="">Select location</option>
                          {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name} - {loc.city}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={needDelivery}
                            onChange={(e) => setNeedDelivery(e.target.checked)}
                            className="w-5 h-5 text-primary-600"
                          />
                          <span className="font-medium">Need car delivery? (+Rp 50,000)</span>
                        </label>
                      </div>

                      {needDelivery && (
                        <div>
                          <label className="label">Delivery Address</label>
                          <textarea
                            className="input-field"
                            rows={3}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Enter your delivery address"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end mt-8">
                      <button
                        onClick={() => canProceedToStep(2) && setStep(2)}
                        disabled={!canProceedToStep(2)}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Next</span>
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Facilities */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card p-8"
                  >
                    <h2 className="text-2xl font-display font-bold mb-6">Add-on Facilities</h2>
                    
                    <div className="space-y-4">
                      {facilities.map(facility => (
                        <div key={facility.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900">{facility.name}</h3>
                            <p className="text-sm text-neutral-600">{facility.description}</p>
                            <p className="text-primary-600 font-semibold mt-1">Rp {(facility.price / 1000).toFixed(0)}K / day</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                const newQty = Math.max(0, (selectedFacilities[facility.id] || 0) - 1);
                                if (newQty === 0) {
                                  const { [facility.id]: _, ...rest } = selectedFacilities;
                                  setSelectedFacilities(rest);
                                } else {
                                  setSelectedFacilities({ ...selectedFacilities, [facility.id]: newQty });
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-semibold">{selectedFacilities[facility.id] || 0}</span>
                            <button
                              onClick={() => setSelectedFacilities({ ...selectedFacilities, [facility.id]: (selectedFacilities[facility.id] || 0) + 1 })}
                              className="w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(1)} className="btn-ghost flex items-center space-x-2">
                        <ChevronLeft size={20} />
                        <span>Back</span>
                      </button>
                      <button onClick={() => setStep(3)} className="btn-primary flex items-center space-x-2">
                        <span>Next</span>
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review & Promo */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card p-8"
                  >
                    <h2 className="text-2xl font-display font-bold mb-6">Review Your Booking</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between py-3 border-b border-neutral-200">
                        <span className="text-neutral-600">Rental Days</span>
                        <span className="font-semibold">{calculateRentalDays()} days</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-neutral-200">
                        <span className="text-neutral-600">Pickup Date</span>
                        <span className="font-semibold">{new Date(pickupDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-neutral-200">
                        <span className="text-neutral-600">Return Date</span>
                        <span className="font-semibold">{new Date(returnDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="label">Have a promo code?</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          className="input-field flex-1"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter promo code"
                        />
                        <button onClick={validatePromo} className="btn-secondary">Apply</button>
                      </div>
                    </div>

                    <div>
                      <label className="label">Additional Notes (Optional)</label>
                      <textarea
                        className="input-field"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requests?"
                      />
                    </div>

                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(2)} className="btn-ghost flex items-center space-x-2">
                        <ChevronLeft size={20} />
                        <span>Back</span>
                      </button>
                      <button onClick={() => setStep(4)} className="btn-primary flex items-center space-x-2">
                        <span>Next</span>
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Contact Info */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card p-8"
                  >
                    <h2 className="text-2xl font-display font-bold mb-6">
                      {user ? 'Confirm Booking' : 'Your Information'}
                    </h2>
                    
                    {!user && (
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="label">Full Name *</label>
                          <input
                            type="text"
                            className="input-field"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="label">Email *</label>
                          <input
                            type="email"
                            className="input-field"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="label">Phone Number *</label>
                          <input
                            type="tel"
                            className="input-field"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="081234567890"
                          />
                        </div>
                        <div>
                          <label className="label">Address (Optional)</label>
                          <textarea
                            className="input-field"
                            rows={2}
                            value={guestAddress}
                            onChange={(e) => setGuestAddress(e.target.value)}
                            placeholder="Your address"
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-primary-900 mb-4">Important Notes:</h3>
                      <ul className="space-y-2 text-sm text-primary-800">
                        <li>• You will receive a booking confirmation via email</li>
                        <li>• Payment must be completed within 24 hours</li>
                        <li>• Upload payment proof after transfer</li>
                        <li>• Valid ID required during pickup</li>
                      </ul>
                    </div>

                    <div className="flex justify-between">
                      <button onClick={() => setStep(3)} className="btn-ghost flex items-center space-x-2">
                        <ChevronLeft size={20} />
                        <span>Back</span>
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || (!user && (!guestName || !guestEmail || !guestPhone))}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                      >
                        <CheckCircle size={20} />
                        <span>{submitting ? 'Processing...' : 'Confirm Booking'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="text-xl font-display font-bold mb-4">Booking Summary</h3>
                
                <div className="mb-4 pb-4 border-b border-neutral-200">
                  <img
                    src={car.primary_image ? getImageUrl(car.primary_image) : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop'}
                    alt={car.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                    onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop'}
                  />
                  <h4 className="font-semibold text-neutral-900">{car.name}</h4>
                  <p className="text-sm text-neutral-600">{car.brand} • {car.year}</p>
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      {car.driver_price_per_day && Number(car.driver_price_per_day) > 0
                        ? `Sewa + Supir (${calculateRentalDays()} hari)`
                        : `Sewa Mobil (${calculateRentalDays()} hari)`}
                    </span>
                    <span className="font-semibold">
                      Rp {(((car.driver_price_per_day && Number(car.driver_price_per_day) > 0 ? Number(car.driver_price_per_day) : Number(car.price_per_day)) * calculateRentalDays()) / 1000).toFixed(0)}K
                    </span>
                  </div>
                  {Object.entries(selectedFacilities).map(([id, qty]) => {
                    const facility = facilities.find(f => f.id === Number(id));
                    if (!facility) return null;
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-neutral-600">{facility.name} x{qty}</span>
                        <span className="font-semibold">Rp {((facility.price * qty * calculateRentalDays()) / 1000).toFixed(0)}K</span>
                      </div>
                    );
                  })}
                  {needDelivery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Delivery Fee</span>
                      <span className="font-semibold">Rp 50K</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-semibold">Rp {(subtotal / 1000).toFixed(0)}K</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-accent-600">
                      <span>Discount ({promoCode})</span>
                      <span className="font-semibold">-Rp {(discount / 1000).toFixed(0)}K</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline pt-4 border-t-2 border-neutral-900">
                  <span className="font-display font-bold text-lg">Total</span>
                  <span className="font-display font-bold text-2xl text-primary-600">Rp {(total / 1000).toFixed(0)}K</span>
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

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
