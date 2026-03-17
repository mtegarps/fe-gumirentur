'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { Clock, Users, Star, MapPin, CheckCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import { settingsAPI } from '@/lib/api';

const FALLBACK_TOURS = [
  { id: 1, title: 'Jakarta Heritage Tour', duration: '8 hours', price: 850000, capacity: '1-6 people', rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1555217851-85f51db3f3aa?w=800&h=600&fit=crop', description: "Explore Jakarta's rich history and culture.", highlights: ['National Monument (Monas)', 'Kota Tua', 'Istiqlal Mosque'], includes: ['Professional Tour Guide', 'Air-conditioned Vehicle', 'Entrance Tickets'] },
  { id: 2, title: 'Bali Island Adventure', duration: '12 hours', price: 1200000, capacity: '1-6 people', rating: 4.9, reviews: 256, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop', description: "Discover Bali's most iconic destinations.", highlights: ['Tanah Lot Temple', 'Tegalalang Rice Terrace', 'Ubud Monkey Forest'], includes: ['English-speaking Guide', 'Private AC Car', 'All Entrance Fees'] },
];

export default function CityToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [pageTitle, setPageTitle] = useState('Curated City Tours');
  const [pageDesc, setPageDesc] = useState("Explore Indonesia's most beautiful destinations with our professional tour guides");
  const [selectedTour, setSelectedTour] = useState<any>(null);

  useEffect(() => {
    settingsAPI.getPublic().then(res => {
      const data = res.data.data || {};
      const g = (key: string) => data[key]?.value || '';
      if (g('tours_page_title')) setPageTitle(g('tours_page_title'));
      if (g('tours_page_description')) setPageDesc(g('tours_page_description'));
      const toursRaw = g('tours_data');
      if (toursRaw) {
        try { const parsed = JSON.parse(toursRaw); const active = Array.isArray(parsed) ? parsed.filter((t: any) => t.isActive !== false) : []; if (active.length > 0) setTours(active); else setTours(FALLBACK_TOURS); }
        catch { setTours(FALLBACK_TOURS); }
      } else { setTours(FALLBACK_TOURS); }
    }).catch(() => { setTours(FALLBACK_TOURS); });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <WhatsAppButton />

      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-neutral-900 mb-6">
              {pageTitle.split(' ').map((w, i, arr) => i === arr.length - 1 ? <span key={i} className="text-primary-600"> {w}</span> : <span key={i}>{i > 0 ? ' ' : ''}{w}</span>)}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">{pageDesc}</p>
          </motion.div>

          {tours.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mb-16">
              <Swiper modules={[Autoplay, Pagination, Navigation, EffectCoverflow]} effect="coverflow" grabCursor centeredSlides slidesPerView="auto"
                coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }} pagination={{ clickable: true }} navigation className="tour-swiper">
                {tours.map(tour => (
                  <SwiperSlide key={tour.id} className="max-w-lg">
                    <div className="card overflow-hidden group cursor-pointer" onClick={() => setSelectedTour(tour)}>
                      <div className="relative h-64 overflow-hidden">
                        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-2xl font-display font-bold text-white mb-2">{tour.title}</h3>
                          <div className="flex items-center justify-between text-white/90 text-sm">
                            <span className="flex items-center space-x-1"><Star size={16} className="fill-yellow-400 text-yellow-400" /><span className="font-semibold">{tour.rating}</span></span>
                            <span className="text-2xl font-bold">Rp {((tour.price || 0) / 1000).toFixed(0)}K</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">All Tours</h2>
            <p className="text-lg text-neutral-600">Choose your perfect adventure</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, index) => (
              <motion.div key={tour.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -8 }}
                className="card group overflow-hidden cursor-pointer" onClick={() => setSelectedTour(tour)}>
                <div className="relative h-56 overflow-hidden">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-lg">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="text-sm font-semibold">{tour.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">{tour.title}</h3>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{tour.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-neutral-600">
                    <div className="flex items-center space-x-1"><Clock size={16} className="text-primary-600" /><span>{tour.duration}</span></div>
                    <div className="flex items-center space-x-1"><Users size={16} className="text-primary-600" /><span>{tour.capacity}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <div><span className="text-2xl font-display font-bold text-primary-600">Rp {((tour.price || 0) / 1000).toFixed(0)}K</span><span className="text-sm text-neutral-500 ml-1">/tour</span></div>
                    <button className="btn-primary py-2 px-4 flex items-center space-x-1"><span>Details</span><ChevronRight size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedTour && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedTour(null)}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl max-w-4xl w-full my-8" onClick={e => e.stopPropagation()}>
            <div className="relative h-80 rounded-t-2xl overflow-hidden">
              <img src={selectedTour.image} alt={selectedTour.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h2 className="text-4xl font-display font-bold mb-2">{selectedTour.title}</h2>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1"><Star className="fill-yellow-400 text-yellow-400" size={20} /><span className="font-bold">{selectedTour.rating}</span><span className="text-white/80">({selectedTour.reviews} reviews)</span></span>
                  <span>•</span>
                  <span className="flex items-center space-x-1"><Clock size={18} /><span>{selectedTour.duration}</span></span>
                </div>
              </div>
              <button onClick={() => setSelectedTour(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">×</button>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold mb-4">Highlights</h3>
                  <ul className="space-y-2">{(selectedTour.highlights || []).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2"><MapPin size={18} className="text-primary-600 flex-shrink-0 mt-0.5" /><span className="text-neutral-700">{item}</span></li>
                  ))}</ul>
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold mb-4">Includes</h3>
                  <ul className="space-y-2">{(selectedTour.includes || []).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2"><CheckCircle size={18} className="text-accent-600 flex-shrink-0 mt-0.5" /><span className="text-neutral-700">{item}</span></li>
                  ))}</ul>
                </div>
              </div>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Starting from</p>
                    <p className="text-4xl font-display font-bold text-primary-600">Rp {((selectedTour.price || 0) / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-neutral-600 mt-1">per tour (up to {selectedTour.capacity})</p>
                  </div>
                  <a href="/contact" className="btn-primary">Book Now</a>
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed">{selectedTour.description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
      <style jsx global>{`.tour-swiper { padding: 50px 0; }.tour-swiper .swiper-slide { width: 500px; height: auto; }.tour-swiper .swiper-button-next,.tour-swiper .swiper-button-prev { color: #bf7a3f; }.tour-swiper .swiper-pagination-bullet-active { background: #bf7a3f; }`}</style>
    </div>
  );
}
