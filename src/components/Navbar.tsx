'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, LogOut, Settings, Calendar, ChevronDown, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/fleet', label: 'Armada' },
    { href: '/city-tours', label: 'City Tours' },
    { href: '/about', label: 'About' },
    { href: '/track', label: 'Lacak Booking' },
    { href: '/contact', label: 'Kontak' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-600 rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <img
                src="https://res.cloudinary.com/doegzxqfa/image/upload/v1771328492/239A7A17-3C6B-46DD-8A99-2AD3008992D6.JPG-removebg-preview_r7vwij.png"
                alt="Gumilar Logo"
                className="relative w-12 h-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="hidden sm:block">
              <span className="block text-xl font-display font-bold text-neutral-900">
                Gumilar
              </span>
              <span className="block text-xs font-medium text-primary-600 -mt-1">
                Rent & City Tour
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors duration-200 group ${
                  pathname === link.href
                    ? 'text-primary-600'
                    : scrolled ? 'text-neutral-700 hover:text-primary-600' : 'text-neutral-800 hover:text-primary-600'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary-600 transform origin-left transition-transform duration-200 ${
                    pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <NotificationBell />

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                      {isAdmin && (
                        <span className="text-xs text-primary-600 font-medium">Admin</span>
                      )}
                    </div>
                    <ChevronDown size={16} className={`text-neutral-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 py-2"
                      >
                        {isAdmin && (
                          <>
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Shield size={18} className="text-primary-600" />
                              <span className="text-sm font-medium text-neutral-900">Admin Dashboard</span>
                            </Link>
                            <div className="border-t border-neutral-100 my-2" />
                          </>
                        )}
                        
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User size={18} className="text-neutral-600" />
                          <span className="text-sm font-medium text-neutral-900">Profil Saya</span>
                        </Link>
                        
                        <Link
                          href="/my-bookings"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Calendar size={18} className="text-neutral-600" />
                          <span className="text-sm font-medium text-neutral-900">Booking Saya</span>
                        </Link>
                        
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={18} className="text-neutral-600" />
                          <span className="text-sm font-medium text-neutral-900">Pengaturan</span>
                        </Link>
                        
                        <div className="border-t border-neutral-100 my-2" />
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut size={18} className="text-red-600" />
                          <span className="text-sm font-medium text-red-600">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="btn-secondary"
                >
                  Daftar
                </Link>
                <Link
                  href="/booking"
                  className="btn-primary"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-neutral-200"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                {isAuthenticated && user ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 rounded-lg text-base font-medium text-primary-600 hover:bg-primary-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/my-bookings"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Booking Saya
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Daftar
                    </Link>
                    <Link
                      href="/booking"
                      onClick={() => setIsOpen(false)}
                      className="block btn-primary text-center"
                    >
                      Book Now
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}