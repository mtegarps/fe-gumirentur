'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { Target, Eye, Briefcase, Users, Award, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { settingsAPI } from '@/lib/api';

const teamMembers = [
  { image: 'https://res.cloudinary.com/doegzxqfa/image/upload/v1771327697/WhatsApp_Image_2026-02-15_at_15.12.04_1_hxzimr.jpg' },
  { image: 'https://res.cloudinary.com/doegzxqfa/image/upload/v1771327696/WhatsApp_Image_2026-02-15_at_15.12.05_1_uljovz.jpg' },
  { image: 'https://res.cloudinary.com/doegzxqfa/image/upload/v1771327696/WhatsApp_Image_2026-02-15_at_15.12.05_sgmxp4.jpg' },
  { image: 'https://res.cloudinary.com/doegzxqfa/image/upload/v1771327696/WhatsApp_Image_2026-02-15_at_15.12.04_y8st6y.jpg' },
];

export default function AboutPage() {
  const [s, setS] = useState<Record<string, string>>({});

  useEffect(() => {
    settingsAPI.getPublic().then(res => {
      const data = res.data.data || {};
      const mapped: Record<string, string> = {};
      Object.entries(data).forEach(([key, val]: any) => { mapped[key] = val.value || ''; });
      setS(mapped);
    }).catch(() => {});
  }, []);

  const g = (key: string, fallback = '') => s[key] || fallback;

  const services = g('about_services', "RENT (City Car, Hi Ace, Elf, Medium & Big Bus)\nCity Tour / Tourism\nBusiness / Official Travel\nWedding (Premium & Luxury Car)").split('\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <WhatsAppButton />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl sm:text-6xl font-display font-bold mb-6">
              About <span className="text-secondary-400">Gumilar</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {g('about_description', 'We are a company engaged in transportation, offering products and services for your travel needs. Running for 5 years with professional work ethic and honesty as our foundation.')}
            </p>
            {g('about_tagline') && (
              <div className="mt-8 inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <p className="text-secondary-300 font-semibold text-lg">"{g('about_tagline')}"</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Our <span className="text-primary-600">Services</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {services.map((service, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, x: 10 }} className="flex items-center space-x-4 bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-xl border-l-4 border-primary-500 shadow-lg hover:shadow-xl transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xl">{idx + 1}</div>
                <p className="text-lg font-semibold text-neutral-800">{service}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Goals */}
      <section className="py-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Company', highlight: 'Mission', icon: Target, gradient: 'from-primary-500 to-primary-700', border: 'border-primary-500', text: g('about_mission', 'Travel comfort is the most important thing for us.') },
              { title: 'Company', highlight: 'Vision', icon: Eye, gradient: 'from-secondary-500 to-secondary-600', border: 'border-secondary-500', text: g('about_vision', 'A desire to make our company the first choice in transportation travel.') },
              { title: 'Our', highlight: 'Goals', icon: Award, gradient: 'from-accent-400 to-accent-600', border: 'border-accent-500', text: g('about_goals', 'To become a transportation company that has high integrity & professionalism.') },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`card p-8 hover:shadow-2xl transition-all border-t-4 ${card.border}`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                  <card.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold text-center mb-4">{card.title} <span className="text-secondary-600">{card.highlight}</span></h3>
                <p className="text-neutral-700 leading-relaxed text-center">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-display font-bold mb-6">Our <span className="text-secondary-600">Works</span></h2>
              <p className="text-neutral-700 leading-relaxed text-lg">
                {g('about_works', 'In the first year of our establishment and until now, we have made quite a bit of progress.')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: g('about_stat_years', '5+'), label: 'Years Experience' },
              { icon: CheckCircle, value: g('about_stat_clients', '1000+'), label: 'Happy Clients' },
              { icon: Briefcase, value: g('about_stat_fleet', '50+'), label: 'Fleet Vehicles' },
              { icon: Award, value: g('about_stat_satisfaction', '100%'), label: 'Satisfaction' },
            ].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ scale: 1.1 }} className="text-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"><stat.icon size={40} /></div>
                <div className="text-5xl font-display font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Meet Our <span className="text-primary-600">Team</span></h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">The dedicated professionals behind Gumilar — committed to making every trip safe, comfortable, and memorable.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center mb-16">
            <div className="relative group max-w-xs w-full">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 via-secondary-400 to-primary-600 rounded-3xl opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative h-80 overflow-hidden">
                  <img src="https://res.cloudinary.com/doegzxqfa/image/upload/v1771327695/WhatsApp_Image_2026-02-15_at_15.14.10_kzxmd7.jpg" alt="Founder" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2"><span className="bg-gradient-to-r from-secondary-400 to-secondary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wider uppercase">★ Founder</span></div>
                </div>
                <div className="p-6 text-center bg-gradient-to-b from-white to-primary-50">
                  <h3 className="text-xl font-display font-bold text-neutral-800 mb-1">Gumilar</h3>
                  <p className="text-primary-600 font-semibold text-sm">Founder & Director</p>
                  <p className="text-neutral-400 text-xs mt-2">{g('about_stat_years', '5+')} Leading Gumilar Transport</p>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100">
                <div className="relative h-64 overflow-hidden bg-neutral-100">
                  <img src={member.image} alt={`Team Member ${idx + 1}`} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5 text-center">
                  <div className="flex justify-center mb-2">{[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-secondary-400 fill-secondary-400" />)}</div>
                  <p className="text-primary-600 font-semibold text-sm">Professional Crew</p>
                  <p className="text-neutral-400 text-xs mt-1">Gumilar Transport</p>
                </div>
                <div className="h-1 bg-gradient-to-r from-primary-400 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-14">
            <p className="text-neutral-500 text-base">Want to join our growing team?{' '}<a href="/contact" className="text-primary-600 font-semibold hover:underline">Contact us →</a></p>
          </motion.div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-3xl font-display font-bold mb-6">Located in <span className="text-primary-600">{g('about_city', 'Bandung City')}</span></h3>
            <p className="text-xl text-neutral-700 mb-8">{g('about_city_description', 'We are located in Bandung City and can be easily accessed.')}</p>
            <a href="/contact" className="btn-primary inline-block">Visit Our Office</a>
          </motion.div>
        </div>
      </section>

      <Footer />
      <style jsx>{`.btn-primary { @apply bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white px-8 py-4 rounded-lg font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-600/40 transition-all duration-300 active:scale-95; }`}</style>
    </div>
  );
}
