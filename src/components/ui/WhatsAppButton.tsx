'use client';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  const phoneNumber = '6282120649499'; 
  const message = 'Halo Gumilar Rent, saya tertarik untuk menyewa mobil';
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center group"
    >
      <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
      
      {/* Ping Animation */}
      <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></span>
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-full mr-4 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg whitespace-nowrap pointer-events-none"
      >
        Chat via WhatsApp
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-8 border-transparent border-l-neutral-900"></div>
      </motion.div>
    </motion.a>
  );
}
