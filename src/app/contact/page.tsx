'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { settingsAPI } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Pesan terkirim! Kami akan menghubungi Anda segera.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setSending(false);
    }, 1500);
  };

  const phone = g('contact_phone', '0838-5727-4487');
  const whatsapp = g('contact_whatsapp', '6283857274487');
  const email = g('contact_email', 'info@gumilar.com');
  const officeAddress = g('contact_office_address', "Jl. Dili No.19, Antapani Kidul,\nKec. Antapani, Kota Bandung,\nJawa Barat 40291");
  const mapsEmbed = g('contact_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5!2d107.6634!3d-6.9172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6395c8e9d3b%3A0x1!2sJl.+Dili+No.19!5e0!3m2!1sen!2sid!4v1234567890');
  const hoursWeekday = g('contact_hours_weekday', '8:00 AM - 8:00 PM');
  const hoursWeekend = g('contact_hours_weekend', '9:00 AM - 6:00 PM');
  const emergency = g('contact_emergency', 'Buka 24 Jam untuk Layanan Darurat');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <WhatsAppButton />

      <section className="relative pt-32 pb-16 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl sm:text-6xl font-display font-bold text-neutral-900 mb-6">Get In <span className="text-primary-600">Touch</span></h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-8">
              <h2 className="text-3xl font-display font-bold mb-2">Send Us A Message</h2>
              <p className="text-neutral-600 mb-8">Fill out the form and our team will get back to you within 24 hours</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div><label className="label">Name *</label><input type="text" required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" /></div>
                  <div><label className="label">Email *</label><input type="email" required className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div><label className="label">Phone *</label><input type="tel" required className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={phone} /></div>
                  <div>
                    <label className="label">Subject *</label>
                    <select required className="input-field" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                      <option value="">Select subject</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="city-tour">City Tour Info</option>
                      <option value="pricing">Pricing & Packages</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div><label className="label">Message *</label><textarea required className="input-field" rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help you..." /></div>
                <motion.button type="submit" disabled={sending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full flex items-center justify-center space-x-2">
                  {sending ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Sending...</span></> : <><Send size={20} /><span>Send Message</span></>}
                </motion.button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="card p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0"><MapPin className="text-primary-600" size={22} /></div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Our Office</p>
                    <p className="font-semibold text-neutral-900 leading-relaxed whitespace-pre-line">{officeAddress}</p>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-xl font-display font-bold mb-6">Quick Contact</h3>
                <div className="space-y-4">
                  <motion.a href={`tel:+${whatsapp}`} whileHover={{ x: 5 }} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors group">
                    <div className="w-12 h-12 bg-primary-100 group-hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"><Phone className="text-primary-600 group-hover:text-white" size={20} /></div>
                    <div><p className="text-sm text-neutral-600">Call Us</p><p className="font-semibold text-neutral-900">{phone}</p></div>
                  </motion.a>
                  <motion.a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" whileHover={{ x: 5 }} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg hover:bg-green-50 transition-colors group">
                    <div className="w-12 h-12 bg-green-100 group-hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"><MessageSquare className="text-green-600 group-hover:text-white" size={20} /></div>
                    <div><p className="text-sm text-neutral-600">WhatsApp</p><p className="font-semibold text-neutral-900">{phone}</p></div>
                  </motion.a>
                  <motion.a href={`mailto:${email}`} whileHover={{ x: 5 }} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg hover:bg-accent-50 transition-colors group">
                    <div className="w-12 h-12 bg-accent-100 group-hover:bg-accent-600 rounded-full flex items-center justify-center transition-colors"><Mail className="text-accent-600 group-hover:text-white" size={20} /></div>
                    <div><p className="text-sm text-neutral-600">Email</p><p className="font-semibold text-neutral-900">{email}</p></div>
                  </motion.a>
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center space-x-3 mb-4"><Clock className="text-primary-600" size={24} /><h3 className="text-xl font-display font-bold">Business Hours</h3></div>
                <div className="space-y-2 text-neutral-700">
                  <p className="flex justify-between"><span>Senin - Jumat:</span><span className="font-semibold">{hoursWeekday}</span></p>
                  <p className="flex justify-between"><span>Sabtu - Minggu:</span><span className="font-semibold">{hoursWeekend}</span></p>
                  {emergency && <p className="text-sm text-green-600 font-medium mt-4">✓ {emergency}</p>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Our Location</h2>
            <p className="text-lg text-neutral-600 flex items-center justify-center gap-2">
              <MapPin size={18} className="text-primary-600" />{officeAddress.replace(/\n/g, ', ')}
            </p>
          </motion.div>
          {mapsEmbed && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="card overflow-hidden rounded-2xl shadow-xl">
              <iframe src={mapsEmbed} width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full" />
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
