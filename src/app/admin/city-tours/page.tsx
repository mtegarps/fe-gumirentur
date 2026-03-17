'use client';
import { useEffect, useState, useRef, KeyboardEvent } from 'react';
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp, Upload, ImageIcon, X,
  Eye, EyeOff, MapPin, Clock, Users, Star, DollarSign, FileText,
  Sparkles, CheckCircle, Link2, Search, ArrowUp, ArrowDown,
  AlertCircle, Globe, Layers
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

interface TourPackage {
  id: number;
  title: string;
  duration: string;
  price: number;
  capacity: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  pendingFiles?: File[];
  pendingPreviews?: string[];
  description: string;
  highlights: string[];
  includes: string[];
  isActive?: boolean;
}

// ─── Tag Input Component ────────────────────────────────────────────
function TagInput({
  tags, onChange, placeholder, color = 'amber'
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  color?: 'amber' | 'emerald';
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const colorMap = {
    amber: {
      tag: 'bg-amber-100 text-amber-800 border-amber-200',
      remove: 'hover:bg-amber-200 text-amber-600',
      ring: 'focus-within:ring-amber-300',
      dot: 'bg-amber-400',
    },
    emerald: {
      tag: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      remove: 'hover:bg-emerald-200 text-emerald-600',
      ring: 'focus-within:ring-emerald-300',
      dot: 'bg-emerald-400',
    },
  };
  const c = colorMap[color];

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      className={`min-h-[44px] w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 flex flex-wrap items-center gap-1.5 cursor-text transition-all focus-within:ring-2 ${c.ring} focus-within:border-transparent`}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, idx) => (
        <span key={idx} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${c.tag}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
            className={`ml-0.5 p-0.5 rounded-full transition-colors ${c.remove}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? placeholder : 'Ketik lalu Enter...'}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder:text-neutral-400"
      />
    </div>
  );
}

// ─── Image URL Input Component ──────────────────────────────────────
function ImageUrlInput({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (url.trim()) {
      onAdd(url.trim());
      setUrl('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-colors"
      >
        <Link2 size={12} /><span>Pakai URL</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="https://example.com/image.jpg"
          className="w-full pl-9 pr-3 py-1.5 border border-blue-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50/50"
          autoFocus
        />
      </div>
      <button onClick={handleAdd} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
        Tambah
      </button>
      <button onClick={() => { setIsOpen(false); setUrl(''); }} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Stats Card ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string | number; color: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200/50',
    blue: 'from-blue-500 to-blue-600 shadow-blue-200/50',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200/50',
    violet: 'from-violet-500 to-violet-600 shadow-violet-200/50',
  };
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-md flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-800">{value}</p>
        <p className="text-xs text-neutral-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Tour Card Component ────────────────────────────────────────────
function TourCard({
  tour, idx, expanded, onToggle, onRemove, onUpdate, onUpdateList,
  onAddFiles, onAddImageUrl, onRemoveExistingImage, onRemovePendingImage,
  onMoveUp, onMoveDown, isFirst, isLast, totalImages
}: {
  tour: TourPackage; idx: number; expanded: boolean;
  onToggle: () => void; onRemove: () => void;
  onUpdate: (field: string, val: any) => void;
  onUpdateList: (field: string, items: string[]) => void;
  onAddFiles: (files: FileList) => void;
  onAddImageUrl: (url: string) => void;
  onRemoveExistingImage: (imgIdx: number) => void;
  onRemovePendingImage: (fileIdx: number) => void;
  onMoveUp: () => void; onMoveDown: () => void;
  isFirst: boolean; isLast: boolean;
  totalImages: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isActive = tour.isActive !== false;

  const allImages = [
    ...(tour.images || []).map((url, i) => ({
      type: 'existing' as const,
      url: url.startsWith('http') ? url : BASE_URL + url,
      idx: i,
    })),
    ...(tour.pendingPreviews || []).map((url, i) => ({
      type: 'pending' as const, url, idx: i,
    })),
  ];
  const primaryImage = allImages[0]?.url || null;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
      isActive ? 'border-neutral-200/80' : 'border-red-200/80 opacity-75'
    }`}>
      {/* Collapsed Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Reorder Buttons */}
          <div className="flex flex-col gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-0.5 rounded text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="p-0.5 rounded text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDown size={12} />
            </button>
          </div>

          {/* Status Dot */}
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-neutral-300'}`} />

          {/* Thumbnail */}
          {primaryImage ? (
            <img src={primaryImage} alt={tour.title} className="w-12 h-12 rounded-xl object-cover ring-2 ring-neutral-100 flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center flex-shrink-0">
              <ImageIcon size={18} className="text-neutral-400" />
            </div>
          )}

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-neutral-800 truncate text-sm">
                {tour.title || <span className="text-neutral-400 italic font-normal">Belum ada judul...</span>}
              </p>
              {!isActive && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-md flex-shrink-0">
                  NONAKTIF
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1"><Clock size={11} />{tour.duration || '-'}</span>
              <span className="flex items-center gap-1"><Users size={11} />{tour.capacity || '-'}</span>
              <span className="font-semibold text-primary-600">
                Rp {((tour.price || 0) / 1000).toFixed(0)}K
              </span>
              <span className="flex items-center gap-1"><ImageIcon size={11} />{totalImages} foto</span>
              {(tour.highlights?.length || 0) > 0 && (
                <span className="flex items-center gap-1"><MapPin size={11} />{tour.highlights.length} highlights</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onUpdate('isActive', !isActive)}
            className={`p-2 rounded-lg transition-colors ${
              isActive
                ? 'text-emerald-500 hover:bg-emerald-50'
                : 'text-neutral-400 hover:bg-neutral-100'
            }`}
            title={isActive ? 'Nonaktifkan tour' : 'Aktifkan tour'}
          >
            {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <div onClick={onToggle} className="p-2 cursor-pointer">
            {expanded
              ? <ChevronUp size={18} className="text-neutral-400" />
              : <ChevronDown size={18} className="text-neutral-400" />
            }
          </div>
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div className="border-t border-neutral-100 p-6 space-y-6 bg-neutral-50/30">
          {/* Active Toggle Banner */}
          {!isActive && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700">Tour ini sedang <strong>nonaktif</strong> dan tidak tampil di website.</p>
              <button
                onClick={() => onUpdate('isActive', true)}
                className="ml-auto px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Aktifkan
              </button>
            </div>
          )}

          {/* Photo Gallery Section */}
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <ImageIcon size={14} className="text-primary-500" />
                Foto Tour
                <span className="text-xs font-normal text-neutral-400">({totalImages} foto)</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <ImageUrlInput onAdd={onAddImageUrl} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Upload size={12} /><span>Upload Foto</span>
                </button>
                <input
                  ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" multiple
                  className="hidden"
                  onChange={e => { if (e.target.files?.length) onAddFiles(e.target.files); e.target.value = ''; }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {allImages.map((img, i) => (
                <div
                  key={`${img.type}-${img.idx}`}
                  className="relative group aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-neutral-200 bg-neutral-100"
                >
                  <img
                    src={img.url} alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      if (el.parentElement) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center text-neutral-400 text-xs';
                        placeholder.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                        el.parentElement.appendChild(placeholder);
                      }
                    }}
                  />
                  {i === 0 && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-md">
                      UTAMA
                    </div>
                  )}
                  {img.type === 'pending' && (
                    <div className="absolute top-1.5 right-8 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-md">
                      BARU
                    </div>
                  )}
                  <button
                    onClick={() =>
                      img.type === 'existing'
                        ? onRemoveExistingImage(img.idx)
                        : onRemovePendingImage(img.idx)
                    }
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {/* Add placeholder */}
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-[4/3] border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all"
              >
                <Upload size={18} className="text-neutral-400 mb-1" />
                <span className="text-[10px] text-neutral-400 font-medium">Tambah</span>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <FileText size={13} className="text-primary-500" /> Judul Paket *
              </label>
              <input
                value={tour.title}
                onChange={e => onUpdate('title', e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all bg-white"
                placeholder="Jakarta Heritage Tour"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <Clock size={13} className="text-blue-500" /> Durasi *
              </label>
              <input
                value={tour.duration}
                onChange={e => onUpdate('duration', e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all bg-white"
                placeholder="8 hours"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign size={13} className="text-emerald-500" /> Harga (Rp) *
              </label>
              <input
                type="number"
                value={tour.price || ''}
                onChange={e => onUpdate('price', parseInt(e.target.value) || 0)}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all bg-white"
                placeholder="850000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <Users size={13} className="text-violet-500" /> Kapasitas *
              </label>
              <input
                value={tour.capacity}
                onChange={e => onUpdate('capacity', e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all bg-white"
                placeholder="1-6 people"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <Star size={13} className="text-amber-500" /> Rating & Review
              </label>
              <div className="flex gap-3">
                <input
                  type="number" step="0.1" min="1" max="5"
                  value={tour.rating || ''}
                  onChange={e => onUpdate('rating', parseFloat(e.target.value))}
                  className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                  placeholder="4.8"
                />
                <input
                  type="number"
                  value={tour.reviews || ''}
                  onChange={e => onUpdate('reviews', parseInt(e.target.value) || 0)}
                  className="w-24 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                  placeholder="124"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Deskripsi</label>
            <textarea
              rows={3}
              value={tour.description}
              onChange={e => onUpdate('description', e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-y transition-all bg-white"
              placeholder="Ceritakan keunikan dan keunggulan paket tour ini..."
            />
          </div>

          {/* Highlights & Includes - TAG INPUT */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
              <label className="block text-sm font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <MapPin size={13} /> Highlights
                <span className="font-normal text-xs text-amber-600">(ketik lalu Enter)</span>
              </label>
              <TagInput
                tags={tour.highlights || []}
                onChange={(tags) => onUpdateList('highlights', tags)}
                placeholder="Monas, Kota Tua, Istiqlal Mosque..."
                color="amber"
              />
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
              <label className="block text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <CheckCircle size={13} /> Termasuk
                <span className="font-normal text-xs text-emerald-600">(ketik lalu Enter)</span>
              </label>
              <TagInput
                tags={tour.includes || []}
                onChange={(tags) => onUpdateList('includes', tags)}
                placeholder="Pemandu wisata, Mobil AC..."
                color="emerald"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function CityToursAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toursList, setToursList] = useState<TourPackage[]>([]);
  const [expandedTours, setExpandedTours] = useState<Record<number, boolean>>({});
  const [toursEnabled, setToursEnabled] = useState(true);
  const [pageTitle, setPageTitle] = useState('');
  const [pageDesc, setPageDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.settings.getAll();
      const data = res.data.data || {};
      const g = (key: string) => {
        for (const group of Object.values(data) as any[]) {
          if (Array.isArray(group)) {
            const found = group.find((s: any) => s.key === key);
            if (found) return found.value || '';
          }
        }
        return '';
      };
      setToursEnabled(g('tours_enabled') !== 'false');
      setPageTitle(g('tours_page_title'));
      setPageDesc(g('tours_page_description'));
      const toursRaw = g('tours_data');
      if (toursRaw) {
        try {
          const parsed = JSON.parse(toursRaw);
          // Ensure isActive defaults to true for legacy data
          const withActive = parsed.map((t: any) => ({
            ...t,
            isActive: t.isActive !== false,
          }));
          setToursList(withActive);
        } catch {}
      }
    } catch {
      toast.error('Gagal memuat data tours');
    } finally {
      setLoading(false);
    }
  };

  const saveTours = async () => {
    setSaving(true);
    try {
      const updatedTours = await Promise.all(
        toursList.map(async (tour) => {
          let uploadedImages = tour.images || [];
          if (tour.image && !uploadedImages.includes(tour.image)) {
            uploadedImages = [tour.image, ...uploadedImages];
          }

          if (tour.pendingFiles && tour.pendingFiles.length > 0) {
            for (const file of tour.pendingFiles) {
              const res = await adminAPI.settings.uploadTourImage(file);
              const url = BASE_URL + res.data.data.url;
              uploadedImages.push(url);
            }
          }

          const { pendingFiles, pendingPreviews, ...clean } = tour;
          return {
            ...clean,
            image: uploadedImages[0] || '',
            images: uploadedImages,
          };
        })
      );

      setToursList(updatedTours);

      await adminAPI.settings.updateTours({
        tours_enabled: toursEnabled ? 'true' : 'false',
        tours_page_title: pageTitle,
        tours_page_description: pageDesc,
        tours_data: JSON.stringify(updatedTours),
      });
      toast.success('City Tours berhasil disimpan!');
    } catch {
      toast.error('Gagal menyimpan tours');
    } finally {
      setSaving(false);
    }
  };

  const addTour = () => {
    const newTour: TourPackage = {
      id: Date.now(),
      title: '',
      duration: '8 hours',
      price: 500000,
      capacity: '1-6 people',
      rating: 5.0,
      reviews: 0,
      image: '',
      images: [],
      description: '',
      highlights: [],
      includes: [],
      isActive: true,
    };
    setToursList(prev => [...prev, newTour]);
    setExpandedTours(prev => ({ ...prev, [toursList.length]: true }));
  };

  const removeTour = (idx: number) => {
    if (!confirm('Hapus paket tour ini?')) return;
    setToursList(prev => prev.filter((_, i) => i !== idx));
  };

  const updateTour = (idx: number, field: string, val: any) =>
    setToursList(prev => prev.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));

  const updateTourList = (idx: number, field: string, items: string[]) =>
    setToursList(prev => prev.map((t, i) => (i === idx ? { ...t, [field]: items } : t)));

  const addPendingFiles = (idx: number, files: FileList) => {
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setToursList(prev =>
      prev.map((t, i) => {
        if (i !== idx) return t;
        return {
          ...t,
          pendingFiles: [...(t.pendingFiles || []), ...newFiles],
          pendingPreviews: [...(t.pendingPreviews || []), ...newPreviews],
        };
      })
    );
  };

  const addImageUrl = (tourIdx: number, url: string) => {
    setToursList(prev =>
      prev.map((t, i) => {
        if (i !== tourIdx) return t;
        const newImages = [...(t.images || []), url];
        return { ...t, images: newImages, image: newImages[0] || '' };
      })
    );
  };

  const removeExistingImage = (tourIdx: number, imgIdx: number) => {
    setToursList(prev =>
      prev.map((t, i) => {
        if (i !== tourIdx) return t;
        const newImages = [...(t.images || [])];
        newImages.splice(imgIdx, 1);
        return { ...t, images: newImages, image: newImages[0] || '' };
      })
    );
  };

  const removePendingImage = (tourIdx: number, fileIdx: number) => {
    setToursList(prev =>
      prev.map((t, i) => {
        if (i !== tourIdx) return t;
        const newFiles = [...(t.pendingFiles || [])];
        const newPreviews = [...(t.pendingPreviews || [])];
        newFiles.splice(fileIdx, 1);
        newPreviews.splice(fileIdx, 1);
        return { ...t, pendingFiles: newFiles, pendingPreviews: newPreviews };
      })
    );
  };

  const moveTour = (fromIdx: number, toIdx: number) => {
    setToursList(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
  };

  // Stats
  const activeTours = toursList.filter(t => t.isActive !== false).length;
  const inactiveTours = toursList.length - activeTours;
  const avgRating = toursList.length > 0
    ? (toursList.reduce((acc, t) => acc + (t.rating || 0), 0) / toursList.length).toFixed(1)
    : '0.0';

  // Filter & Search
  const filteredTours = toursList
    .map((tour, idx) => ({ tour, idx }))
    .filter(({ tour }) => {
      if (filterStatus === 'active' && tour.isActive === false) return false;
      if (filterStatus === 'inactive' && tour.isActive !== false) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          tour.title.toLowerCase().includes(q) ||
          tour.description.toLowerCase().includes(q) ||
          tour.highlights.some(h => h.toLowerCase().includes(q))
        );
      }
      return true;
    });

  const tourImageCount = (t: TourPackage) =>
    (t.images?.length || 0) + (t.pendingFiles?.length || 0);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
              <MapPin size={20} className="text-white" />
            </div>
            City Tours
          </h1>
          <p className="text-neutral-600 mt-1">Kelola paket tour dan destinasi wisata</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addTour}
            className="px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Tambah Tour</span>
          </button>
          <button
            onClick={saveTours}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 flex items-center gap-2 font-medium transition-colors disabled:opacity-60 shadow-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan Semua'}</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Layers} label="Total Tour" value={toursList.length} color="blue" />
        <StatCard icon={Eye} label="Tour Aktif" value={activeTours} color="emerald" />
        <StatCard icon={EyeOff} label="Tour Nonaktif" value={inactiveTours} color="amber" />
        <StatCard icon={Star} label="Avg. Rating" value={avgRating} color="violet" />
      </div>

      {/* Page Settings Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-100">
          <h2 className="font-display font-bold text-neutral-800 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Pengaturan Halaman Tours
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/60">
            <div>
              <p className="font-semibold text-neutral-800">Status Halaman Tours</p>
              <p className="text-sm text-neutral-500">
                Tampilkan/sembunyikan halaman City Tours di website
              </p>
            </div>
            <button
              onClick={() => setToursEnabled(!toursEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                toursEnabled ? 'bg-emerald-500' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  toursEnabled ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Judul Halaman
              </label>
              <input
                value={pageTitle}
                onChange={e => setPageTitle(e.target.value)}
                placeholder="Curated City Tours"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Deskripsi Halaman
              </label>
              <input
                value={pageDesc}
                onChange={e => setPageDesc(e.target.value)}
                placeholder="Explore Indonesia's most beautiful destinations..."
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari tour berdasarkan nama, deskripsi, atau highlight..."
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-neutral-100 rounded-xl p-1 gap-0.5">
            {(['all', 'active', 'inactive'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-white text-neutral-800 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {status === 'all' ? `Semua (${toursList.length})`
                  : status === 'active' ? `Aktif (${activeTours})`
                  : `Nonaktif (${inactiveTours})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tours List */}
      <div className="space-y-4">
        {filteredTours.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-neutral-400" />
            </div>
            {toursList.length === 0 ? (
              <>
                <h3 className="text-lg font-display font-bold text-neutral-700 mb-2">
                  Belum Ada Paket Tour
                </h3>
                <p className="text-neutral-500 text-sm mb-6">
                  Mulai tambahkan paket tour destinasi wisata Anda
                </p>
                <button
                  onClick={addTour}
                  className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>Tambah Tour Pertama</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-display font-bold text-neutral-700 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-neutral-500 text-sm">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTours.map(({ tour, idx }) => (
              <TourCard
                key={tour.id || idx}
                tour={tour}
                idx={idx}
                expanded={!!expandedTours[idx]}
                onToggle={() => setExpandedTours(p => ({ ...p, [idx]: !p[idx] }))}
                onRemove={() => removeTour(idx)}
                onUpdate={(field, val) => updateTour(idx, field, val)}
                onUpdateList={(field, items) => updateTourList(idx, field, items)}
                onAddFiles={files => addPendingFiles(idx, files)}
                onAddImageUrl={url => addImageUrl(idx, url)}
                onRemoveExistingImage={imgIdx => removeExistingImage(idx, imgIdx)}
                onRemovePendingImage={fileIdx => removePendingImage(idx, fileIdx)}
                onMoveUp={() => moveTour(idx, idx - 1)}
                onMoveDown={() => moveTour(idx, idx + 1)}
                isFirst={idx === 0}
                isLast={idx === toursList.length - 1}
                totalImages={tourImageCount(tour)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
