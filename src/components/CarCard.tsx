'use client';
import Link from 'next/link';
import { Users, Fuel, Gauge, Star, UserCheck } from 'lucide-react';
import { Car } from '@/types';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';

export default function CarCard({ car }: { car: Car }) {
  const imageUrl = car.primary_image
    ? getImageUrl(car.primary_image)
    : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop';

  const rating = Number(car.rating) || 0;
  const hasDriverPrice = car.driver_price_per_day && Number(car.driver_price_per_day) > 0;
  const displayPrice = hasDriverPrice ? Number(car.driver_price_per_day) : Number(car.price_per_day);

  return (
    <motion.div whileHover={{ y: -8 }} className="card group">
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) =>
            (e.currentTarget.src =
              'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop')
          }
        />

        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          <span className="badge-primary">{car.type}</span>
          {hasDriverPrice && (
            <span className="inline-flex items-center gap-1 bg-accent-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
              <UserCheck size={12} />
              +Supir
            </span>
          )}
        </div>

        {rating > 0 && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-display font-semibold text-neutral-900 mb-2">
          {car.name}
        </h3>

        <p className="text-sm text-neutral-500 mb-4">
          {car.brand} • {car.year}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6 text-sm text-neutral-600">
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{car.passenger_capacity}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Gauge size={16} />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel size={16} />
            <span>{car.fuel_type || 'Petrol'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div>
            {hasDriverPrice ? (
              <>
                <span className="text-2xl font-display font-bold text-accent-600">
                  Rp {(displayPrice / 1000).toFixed(0)}K
                </span>
                <span className="text-sm text-neutral-500 ml-1">/hari</span>
                <p className="text-xs text-accent-600 font-medium mt-0.5 flex items-center gap-1">
                  <UserCheck size={11} /> Termasuk supir
                </p>
              </>
            ) : (
              <>
                <span className="text-2xl font-display font-bold text-primary-600">
                  Rp {(displayPrice / 1000).toFixed(0)}K
                </span>
                <span className="text-sm text-neutral-500 ml-1">/hari</span>
              </>
            )}
          </div>

          <Link href={`/booking?car=${car.id}`} className="btn-primary py-2 px-4">
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
