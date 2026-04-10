import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Phone, Users } from 'lucide-react';
import { Modal, ConfirmDialog, EmptyState, Spinner, PageHeader, SubjectBadge } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { SUBJECTS, CLASSES, fmtDate, getInitials, avatarColor } from '../utils/helpers';

const defaultForm = { name:'', class:'6', subjects:[], parentPhone:'', monthlyFee:'', admissionDate:'', address:'', feeStatus:'pending' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (filterClass) params.class = filterClass;
    if (search) params.search = search;
    const res = await api.get('/students', { params });
    setStudents(res.data);
    setLoading(false);
  }, [filterClass, search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s, subjects: s.subjects || [] }); setModal(true); };

  const handleSubject = s => setForm(f => ({
    ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x=>x!==s) : [...f.subjects, s]
  }));

  const handleSave = async () => {
    if (!form.name || !form.parentPhone || !form.monthlyFee) return toast.error('Fill required fields');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, form);
        toast.success('Student updated');
      } else {
        await api.post('/students', form);
        toast.success('Student added');
      }
      setModal(false);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await api.delete(`/students/${deleteId}`);
    toast.success('Student removed');
    setDeleteId(null);
    load();
  };

  const feeClass = { paid:'badge-green', pending:'badge-red', partial:'badge-amber' };

  return (
    <div>
      <PageHeader title="Students" subtitle={`${students.length} enrolled students`}
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Student</button>} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-8" placeholder="Search by name..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-40" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All classes</option>
          {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <Spinner /> : students.length === 0 ? (
          <EmptyState icon={Users} title="No students found" description="Add your first student to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Student','Class','Subjects','Fee/month','Status','Phone','Joined','Actions'].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${avatarColor(s.name)}`}>
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="badge-blue">Class {s.class}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.subjects?.map(sub => <SubjectBadge key={sub} subject={sub} />)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">₹{s.monthlyFee?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={feeClass[s.feeStatus]}>{s.feeStatus}</span></td>
                    <td className="px-4 py-3 text-gray-500">
                      <a href={`tel:${s.parentPhone}`} className="flex items-center gap-1 hover:text-brand-600">
                        <Phone size={13} />{s.parentPhone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(s.admissionDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteId(s._id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Student' : 'Add New Student'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input className="input" placeholder="Student full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Class *</label>
              <select className="input" value={form.class} onChange={e=>setForm(f=>({...f,class:e.target.value}))}>
                {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Fee (₹) *</label>
              <input className="input" type="number" placeholder="1500" value={form.monthlyFee} onChange={e=>setForm(f=>({...f,monthlyFee:e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent Phone *</label>
              <input className="input" placeholder="10-digit mobile number" value={form.parentPhone} onChange={e=>setForm(f=>({...f,parentPhone:e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-2">Subjects</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s=>(
                  <button key={s} type="button" onClick={()=>handleSubject(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${form.subjects.includes(s)?'bg-brand-600 text-white border-brand-600':'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Admission Date</label>
              <input className="input" type="date" value={form.admissionDate?.slice?.(0,10)||''} onChange={e=>setForm(f=>({...f,admissionDate:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fee Status</label>
              <select className="input" value={form.feeStatus} onChange={e=>setForm(f=>({...f,feeStatus:e.target.value}))}>
                <option value="paid">Paid</option><option value="pending">Pending</option><option value="partial">Partial</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input className="input" placeholder="Home address (optional)" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn-secondary flex-1" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Student" message="This will archive the student. They won't appear in lists anymore." />
    </div>
  );
}
