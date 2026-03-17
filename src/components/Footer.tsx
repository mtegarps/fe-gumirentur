'use client';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="https://res.cloudinary.com/doegzxqfa/image/upload/v1771328492/239A7A17-3C6B-46DD-8A99-2AD3008992D6.JPG-removebg-preview_r7vwij.png"
                alt="Gumilar Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <span className="block text-lg font-display font-bold text-white">Gumilar</span>
                <span className="block text-xs text-primary-400 -mt-1">Rent & City Tour</span>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-6">Premium car rental and city tour services in Bandung, West Java.</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"><Twitter size={18} /></a>
            </div>
          </div>
          <div><h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">{['Fleet', 'City Tours', 'About Us', 'Contact', 'FAQ'].map(link => (
              <li key={link}><Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="hover:text-primary-400 transition-colors">{link}</Link></li>
            ))}</ul>
          </div>
          <div><h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">{['Car Rental', 'City Tours', 'Airport Transfer', 'Corporate Service', 'Event Transportation'].map(service => (
              <li key={service}><span className="hover:text-primary-400 transition-colors cursor-pointer">{service}</span></li>
            ))}</ul>
          </div>
          <div><h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin size={18} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>Jl. Dili No.19, Antapani Kidul, Kec. Antapani, Kota Bandung, Jawa Barat 40291</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="text-primary-400 flex-shrink-0" />
                <a href="tel:+6283857274487" className="hover:text-primary-400 transition-colors">0838-5727-4487</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="text-primary-400 flex-shrink-0" />
                <span>info@gumilar.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
          <p>&copy; 2026 Gumilar Rent & City Tour. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">{['Privacy Policy', 'Terms of Service', 'Sitemap'].map(link => (
            <Link key={link} href="#" className="hover:text-primary-400 transition-colors">{link}</Link>
          ))}</div>
        </div>
      </div>
    </footer>
  );
}