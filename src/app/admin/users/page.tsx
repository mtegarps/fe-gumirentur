'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash, Search, X, Save, Ban, CheckCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID') : '-';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number|null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'user', password: '', password_confirmation: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminAPI.users.getAll(params);
      setUsers(res.data.data.data || []);
    } catch { toast.error('Gagal memuat user'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const openAdd = () => { setForm({ name: '', email: '', phone: '', role: 'user', password: '', password_confirmation: '' }); setEditMode(false); setCurrentId(null); setShowModal(true); };
  const openEdit = (u: any) => { setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '', password_confirmation: '' }); setEditMode(true); setCurrentId(u.id); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email, phone: form.phone, role: form.role };
      if (form.password) { payload.password = form.password; payload.password_confirmation = form.password_confirmation; }
      if (editMode && currentId) {
        await adminAPI.users.update(currentId, payload);
        toast.success('User diupdate!');
      } else {
        await adminAPI.users.create({ ...payload, password: form.password, password_confirmation: form.password_confirmation });
        toast.success('User dibuat!');
      }
      setShowModal(false); fetchUsers();
    } catch (e: any) {
      const errs = e?.response?.data?.errors;
      if (errs) Object.values(errs).flat().forEach((m: any) => toast.error(m));
      else toast.error('Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    try { await adminAPI.users.delete(id); toast.success('Dihapus!'); fetchUsers(); }
    catch { toast.error('Gagal menghapus'); }
  };

  const handleBlock = async (u: any) => {
    try {
      if (u.status === 'blocked') { await adminAPI.users.unblock(u.id); toast.success('User dibuka!'); }
      else { await adminAPI.users.block(u.id); toast.success('User diblokir!'); }
      fetchUsers();
    } catch { toast.error('Gagal'); }
  };

  const roleBadge = (r: string) => ({ admin: 'bg-red-100 text-red-700', user: 'bg-blue-100 text-blue-700' }[r] || 'bg-gray-100 text-gray-700');
  const statusBadge = (s: string) => ({ active: 'bg-green-100 text-green-700', blocked: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-display font-bold">Manajemen Users</h1><p className="text-neutral-600">Kelola akun pengguna</p></div>
        <button onClick={openAdd} className="bg-primary-500 text-white px-5 py-2.5 rounded-lg hover:bg-primary-600 flex items-center space-x-2 transition-colors">
          <Plus size={18} /><span>Tambah User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-3">
        {['all','user','admin'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            {r === 'all' ? 'Semua' : r}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
          <input className="pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="Cari nama/email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>{['Nama', 'Email', 'Telepon', 'Role', 'Status', 'Bergabung', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">Tidak ada user</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                  <td className="px-4 py-3 text-neutral-600">{u.phone || '-'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-1">
                      <button onClick={() => openEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={15} /></button>
                      <button onClick={() => handleBlock(u)} className={`p-2 rounded-lg transition-colors ${u.status === 'blocked' ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}>
                        {u.status === 'blocked' ? <CheckCircle size={15} /> : <Ban size={15} />}
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-display font-bold">{editMode ? 'Edit User' : 'Tambah User Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[{label:'Nama *', key:'name', required:true}, {label:'Email *', key:'email', type:'email', required:true}, {label:'Telepon', key:'phone'}].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{f.label}</label>
                  <input type={f.type||'text'} required={f.required} value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <option value="user">User</option><option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Password {editMode ? '(kosongkan jika tidak diubah)' : '*'}</label>
                <input type="password" required={!editMode} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              {form.password && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Konfirmasi Password *</label>
                  <input type="password" required value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
              )}
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60 flex items-center justify-center space-x-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                  <span>{saving ? 'Menyimpan...' : editMode ? 'Update' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
