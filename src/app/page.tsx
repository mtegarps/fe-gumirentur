'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Calendar, Star, ArrowRight, Shield, Clock, Award, Users, TrendingUp, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useEffect, useState, useRef } from 'react';
import { carsAPI, reviewsAPI } from '@/lib/api';
import { Car, Review } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, reviewsRes] = await Promise.all([
          carsAPI.getAll({ per_page: 8, sort: 'rating' }),
          reviewsAPI.getAll({ featured: true }),
        ]);
        setFeaturedCars(carsRes.data.data.data || []);
        setReviews(reviewsRes.data.data.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <WhatsAppButton />
      
      {/* Hero Section dengan Parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <motion.div style={{ y }} className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary-100 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent-100 rounded-full blur-3xl opacity-20"></div>
          </div>
        </motion.div>

        <motion.div style={{ opacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="text-center lg:text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-lg"
                >
                  <Award size={18} />
                  <span>Premium Car Rental Since 2010</span>
                </motion.span>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-neutral-900 leading-tight">
                  Journey Beyond
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mt-2"
                  >
                    Expectations
                  </motion.span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Experience Indonesia's finest car rental service with curated city tours. 
                Premium vehicles, professional service, unforgettable memories.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/fleet" className="btn-primary group inline-flex items-center justify-center space-x-2 shadow-2xl shadow-primary-600/30">
                  <span>Explore Fleet</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/city-tours" className="btn-secondary inline-flex items-center justify-center">
                  City Tours
                </Link>
              </motion.div>

              {/* Stats dengan Counter Animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-3 gap-8 pt-12 border-t border-neutral-200"
              >
                {[
                  { value: '15K+', label: 'Happy Clients', icon: Users },
                  { value: '50+', label: 'Premium Cars', icon: MapPin },
                  { value: '4.9', label: 'Rating', icon: Star }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="text-center lg:text-left"
                  >
                    <stat.icon className="text-primary-600 mb-2 mx-auto lg:mx-0" size={24} />
                    <div className="text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-neutral-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Hero Image dengan Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative z-10">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop"
                  alt="Premium Car"
                  className="w-full h-auto rounded-3xl shadow-2xl"
                />
                
                {/* Floating Card 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center">
                      <Shield className="text-accent-600" size={28} />
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 text-lg">Fully Insured</div>
                      <div className="text-sm text-neutral-600">100% Protected</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Card 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className="absolute -top-6 -right-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Clock className="text-white" size={28} />
                    </div>
                    <div>
                      <div className="font-bold text-lg">24/7 Support</div>
                      <div className="text-sm text-primary-100">Always Here</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Featured Cars dengan Swiper Carousel */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-neutral-900 mb-4">
              Our Premium Fleet
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover our carefully curated collection of luxury vehicles
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-96 shimmer"></div>
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation={true}
              className="cars-swiper pb-16"
            >
              {featuredCars.map((car) => (
                <SwiperSlide key={car.id}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="card group overflow-hidden h-full"
                  >
                    <Link href={`/car/${car.id}`}>
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={car.primary_image ? getImageUrl(car.primary_image) : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="badge-primary shadow-lg">{car.type}</span>
                        </div>
                        {Number(car.rating) > 0 && (
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-lg">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold">
                              {Number(car.rating).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-display font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {car.name}
                        </h3>
                        <p className="text-sm text-neutral-500 mb-4">{car.brand} • {car.year}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                          <div>
                            {car.driver_price_per_day && Number(car.driver_price_per_day) > 0 ? (
                              <>
                                <span className="text-2xl font-display font-bold text-accent-600">
                                  Rp {(Number(car.driver_price_per_day) / 1000).toFixed(0)}K
                                </span>
                                <span className="text-sm text-neutral-500 ml-1">/hari</span>
                                <p className="text-xs text-accent-600 font-medium mt-0.5">✓ Termasuk supir</p>
                              </>
                            ) : (
                              <>
                                <span className="text-2xl font-display font-bold text-primary-600">
                                  Rp {(car.price_per_day / 1000).toFixed(0)}K
                                </span>
                                <span className="text-sm text-neutral-500 ml-1">/hari</span>
                              </>
                            )}
                          </div>
                          <button className="btn-primary py-2 px-4">Book</button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/fleet" className="btn-primary inline-flex items-center space-x-2">
              <span>View All Vehicles</span>
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-4">Why Choose Gumilar?</h2>
            <p className="text-lg text-neutral-600">Experience the difference with our premium service</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Fully Insured', desc: 'Comprehensive coverage for peace of mind', color: 'from-blue-500 to-blue-600' },
              { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock assistance', color: 'from-green-500 to-green-600' },
              { icon: Star, title: 'Premium Quality', desc: 'Meticulously maintained vehicles', color: 'from-yellow-500 to-yellow-600' },
              { icon: CheckCircle, title: 'Easy Booking', desc: 'Simple and fast process', color: 'from-purple-500 to-purple-600' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card p-8 text-center hover:shadow-2xl transition-all group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                >
                  <feature.icon className="text-white" size={32} />
                </motion.div>
                <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .cars-swiper .swiper-button-next,
        .cars-swiper .swiper-button-prev {
          color: #bf7a3f;
          background: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .cars-swiper .swiper-button-next:after,
        .cars-swiper .swiper-button-prev:after {
          font-size: 20px;
        }
        .cars-swiper .swiper-pagination-bullet-active {
          background: #bf7a3f;
        }
      `}</style>
    </div>
  );
}
