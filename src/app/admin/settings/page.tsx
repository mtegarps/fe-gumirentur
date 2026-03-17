'use client';
import { useEffect, useState } from 'react';
import { Save, ChevronDown, ChevronUp, Settings as SettingsIcon, Phone, Info, MapPin } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

type SettingGroup = Record<string, { key: string; value: string; type: string; group: string }>;
type Settings = Record<string, SettingGroup>;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<Record<string, boolean>>({
    general: true, contact_info: true, about: false, contact_page: false
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.settings.getAll();
      setSettings(res.data.data || {});
    } catch { toast.error('Gagal memuat pengaturan'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const getVal = (group: string, key: string) => settings[group]?.[key]?.value || '';
  const setVal = (group: string, key: string, val: string) => {
    setSettings(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: { ...(prev[group]?.[key] || { key, type: 'string', group }), value: val } }
    }));
  };

  const saveGroup = async (group: string, handler?: () => Promise<void>) => {
    setSaving(group);
    try {
      if (handler) { await handler(); }
      else {
        const items = Object.values(settings[group] || {}).map(s => ({ key: s.key, value: s.value }));
        await adminAPI.settings.update({ settings: items });
      }
      toast.success('Pengaturan disimpan!');
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(null); }
  };

  const saveGeneral = () => saveGroup('general');
  const saveContact = () => saveGroup('contact_info', async () => {
    await adminAPI.settings.updateContact({
      contact_email: getVal('contact', 'contact_email'),
      contact_phone: getVal('contact', 'contact_phone'),
      contact_whatsapp: getVal('contact', 'contact_whatsapp'),
      contact_address: getVal('contact', 'contact_address'),
    });
  });
  const saveContactPage = () => saveGroup('contact_page', async () => {
    await adminAPI.settings.updateContactPage({
      contact_office_address: getVal('contact', 'contact_office_address'),
      contact_maps_embed: getVal('contact', 'contact_maps_embed'),
      contact_hours_weekday: getVal('contact', 'contact_hours_weekday'),
      contact_hours_weekend: getVal('contact', 'contact_hours_weekend'),
      contact_emergency: getVal('contact', 'contact_emergency'),
    });
  });
  const saveAbout = () => saveGroup('about', async () => {
    await adminAPI.settings.updateAbout({
      about_tagline: getVal('about', 'about_tagline'),
      about_description: getVal('about', 'about_description'),
      about_mission: getVal('about', 'about_mission'),
      about_vision: getVal('about', 'about_vision'),
      about_goals: getVal('about', 'about_goals'),
      about_works: getVal('about', 'about_works'),
      about_stat_years: getVal('about', 'about_stat_years'),
      about_stat_clients: getVal('about', 'about_stat_clients'),
      about_stat_fleet: getVal('about', 'about_stat_fleet'),
      about_stat_satisfaction: getVal('about', 'about_stat_satisfaction'),
      about_services: getVal('about', 'about_services'),
      about_city: getVal('about', 'about_city'),
      about_city_description: getVal('about', 'about_city_description'),
    });
  });

  const toggleTab = (tab: string) => setOpenTabs(p => ({ ...p, [tab]: !p[tab] }));

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const SectionHeader = ({ title, icon: Icon, tab, onSave, saveKey }: any) => (
    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleTab(tab)}>
      <h2 className="text-lg font-display font-bold flex items-center gap-2">
        <Icon size={18} className="text-primary-500" /> {title}
      </h2>
      <div className="flex items-center space-x-2">
        {openTabs[tab] && (
          <button type="button"
            onClick={e => { e.stopPropagation(); onSave(); }}
            disabled={saving === saveKey}
            className="px-4 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60 flex items-center space-x-1.5 transition-colors">
            {saving === saveKey
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={13} />}
            <span>Simpan</span>
          </button>
        )}
        {openTabs[tab] ? <ChevronUp size={18} className="text-neutral-400" /> : <ChevronDown size={18} className="text-neutral-400" />}
      </div>
    </div>
  );

  const Field = ({ label, group, k: fk, type = 'text', textarea = false, rows = 3, placeholder = '' }: any) => (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{label}</label>
      {textarea ? (
        <textarea rows={rows} value={getVal(group, fk)}
          onChange={e => setVal(group, fk, e.target.value)} placeholder={placeholder}
          className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-y transition-all" />
      ) : (
        <input type={type} value={getVal(group, fk)}
          onChange={e => setVal(group, fk, e.target.value)} placeholder={placeholder}
          className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" />
      )}
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-neutral-600 to-neutral-800 rounded-xl flex items-center justify-center">
            <SettingsIcon size={20} className="text-white" />
          </div>
          Pengaturan Sistem
        </h1>
        <p className="text-neutral-600 mt-1">Kelola konfigurasi umum website</p>
      </div>

      {/* General */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-6">
        <SectionHeader title="Pengaturan Umum" icon={SettingsIcon} tab="general" onSave={saveGeneral} saveKey="general" />
        {openTabs.general && (
          <div className="mt-5 grid md:grid-cols-2 gap-4">
            <Field label="Nama Aplikasi" group="general" k="app_name" />
            <Field label="Min. Hari Sewa" group="general" k="min_rental_days" type="number" />
            <Field label="Max. Hari Sewa" group="general" k="max_rental_days" type="number" />
            <Field label="Biaya Delivery (Rp)" group="general" k="delivery_fee" type="number" />
            <Field label="Pajak (%)" group="general" k="tax_percentage" type="number" />
            <div className="md:col-span-2"><Field label="Deskripsi Aplikasi" group="general" k="app_description" textarea /></div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-6">
        <SectionHeader title="Informasi Kontak" icon={Phone} tab="contact_info" onSave={saveContact} saveKey="contact_info" />
        {openTabs.contact_info && (
          <div className="mt-5 grid md:grid-cols-2 gap-4">
            <Field label="Email" group="contact" k="contact_email" type="email" />
            <Field label="Telepon" group="contact" k="contact_phone" />
            <Field label="WhatsApp (format: 628xxx)" group="contact" k="contact_whatsapp" />
            <div className="md:col-span-2"><Field label="Alamat" group="contact" k="contact_address" textarea /></div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-6">
        <SectionHeader title="Halaman About" icon={Info} tab="about" onSave={saveAbout} saveKey="about" />
        {openTabs.about && (
          <div className="mt-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Tagline" group="about" k="about_tagline" />
              <Field label="Nama Kota" group="about" k="about_city" />
            </div>
            <Field label="Deskripsi Perusahaan" group="about" k="about_description" textarea />
            <Field label="Misi Perusahaan" group="about" k="about_mission" textarea />
            <Field label="Visi Perusahaan" group="about" k="about_vision" textarea />
            <Field label="Tujuan" group="about" k="about_goals" textarea />
            <Field label="Cerita Karya Kami" group="about" k="about_works" textarea />
            <Field label="Deskripsi Lokasi Kota" group="about" k="about_city_description" textarea />
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Layanan (satu per baris)</label>
              <textarea rows={5} value={getVal('about', 'about_services')}
                onChange={e => setVal('about', 'about_services', e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-y" />
              <p className="text-xs text-neutral-400 mt-1">Satu baris per layanan</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-700 mb-3">Statistik</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Tahun Pengalaman" group="about" k="about_stat_years" />
                <Field label="Happy Clients" group="about" k="about_stat_clients" />
                <Field label="Armada" group="about" k="about_stat_fleet" />
                <Field label="Satisfaction" group="about" k="about_stat_satisfaction" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Page */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-6">
        <SectionHeader title="Halaman Contact" icon={MapPin} tab="contact_page" onSave={saveContactPage} saveKey="contact_page" />
        {openTabs.contact_page && (
          <div className="mt-5 space-y-4">
            <Field label="Alamat Kantor" group="contact" k="contact_office_address" textarea />
            <Field label="URL Google Maps Embed" group="contact" k="contact_maps_embed" textarea />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Jam Buka Senin-Jumat" group="contact" k="contact_hours_weekday" />
              <Field label="Jam Buka Sabtu-Minggu" group="contact" k="contact_hours_weekend" />
            </div>
            <Field label="Info Darurat" group="contact" k="contact_emergency" />
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Info:</strong> Pengaturan City Tours, Rekening Bank, dan Add-on Fasilitas sudah dipindahkan ke menu terpisah di sidebar untuk kemudahan pengelolaan.
        </p>
      </div>
    </div>
  );
}
