// Materials.js
import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Download } from 'lucide-react';
import { Modal, EmptyState, Spinner, PageHeader, SubjectBadge } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { SUBJECTS, CLASSES, fmtDate } from '../utils/helpers';

export function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:'', subject:'Physics', class:'9', description:'' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/materials', { params: filter ? { subject:filter } : {} });
    setMaterials(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleSave = async () => {
    if (!form.title) return toast.error('Enter title');
    setSaving(true);
    try {
      await api.post('/materials', form);
      toast.success('Material added');
      setModal(false);
      load();
    } catch { toast.error('Error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/materials/${id}`);
    toast.success('Removed');
    load();
  };

  const FILE_SIZE_MAP = {0:'—'};
  const fmtSize = n => n > 1e6 ? `${(n/1e6).toFixed(1)} MB` : n > 1e3 ? `${(n/1e3).toFixed(0)} KB` : `${n} B`;

  return (
    <div>
      <PageHeader title="Study Materials" subtitle="Upload and manage notes for students"
        actions={<button className="btn-primary" onClick={()=>setModal(true)}><Plus size={15}/>Upload Material</button>} />
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={()=>setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!filter?'bg-brand-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'}`}>All</button>
        {SUBJECTS.map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter===s?'bg-brand-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'}`}>{s}</button>
        ))}
      </div>
      <div className="card p-0">
        {loading ? <Spinner /> : materials.length===0 ? (
          <EmptyState icon={BookOpen} title="No materials" description="Upload study materials for students" />
        ) : (
          <div className="divide-y divide-gray-50">
            {materials.map(m=>(
              <div key={m._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <SubjectBadge subject={m.subject} />
                    <span className="text-xs text-gray-400">Class {m.class}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{fmtSize(m.fileSize)}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{fmtDate(m.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-brand-50 text-gray-400 hover:text-brand-600 rounded-lg transition"><Download size={15}/></button>
                  <button onClick={()=>handleDelete(m._id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"><Trash2 size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title="Upload Study Material">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <input className="input" placeholder="e.g. Newton's Laws – Chapter 5" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <select className="input" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
                {SUBJECTS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
              <select className="input" value={form.class} onChange={e=>setForm(f=>({...f,class:e.target.value}))}>
                {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <input className="input" placeholder="Brief description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <BookOpen size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">PDF upload requires file server setup</p>
            <p className="text-xs text-gray-300 mt-1">Connect multer upload endpoint in production</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={saving}>{saving?'Saving...':'Add Material'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Announcements.js
export function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:'', body:'', targetClass:'All', subject:'General', priority:'medium' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/announcements');
    setAnnouncements(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.body) return toast.error('Enter title and message');
    setSaving(true);
    try {
      await api.post('/announcements', form);
      toast.success('Announcement posted!');
      setModal(false);
      setForm({ title:'', body:'', targetClass:'All', subject:'General', priority:'medium' });
      load();
    } catch { toast.error('Error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/announcements/${id}`);
    toast.success('Removed');
    load();
  };

  const priorityColors = { high:'text-red-600 bg-red-100', medium:'text-amber-600 bg-amber-100', low:'text-green-600 bg-green-100' };

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Post updates for students and parents"
        actions={<button className="btn-primary" onClick={()=>setModal(true)}><Plus size={15}/>New Announcement</button>} />
      {loading ? <Spinner /> : announcements.length===0 ? (
        <EmptyState icon={()=>null} title="No announcements" description="Post your first announcement" />
      ) : (
        <div className="space-y-3">
          {announcements.map(a=>(
            <div key={a._id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[a.priority]}`}>{a.priority}</span>
                    <span className="badge-blue">{a.targetClass==='All'?'All classes':`Class ${a.targetClass}`}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
                  <p className="text-xs text-gray-400 mt-2">{fmtDate(a.createdAt)} · {a.subject}</p>
                </div>
                <button onClick={()=>handleDelete(a._id)} className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition flex-shrink-0"><Trash2 size={15}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="New Announcement">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <input className="input" placeholder="Announcement title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">For class</label>
              <select className="input" value={form.targetClass} onChange={e=>setForm(f=>({...f,targetClass:e.target.value}))}>
                <option value="All">All classes</option>
                {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <select className="input" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
                <option>General</option>{SUBJECTS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select className="input" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
            <textarea className="input" rows={4} placeholder="Type your announcement..." value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={saving}>{saving?'Posting...':'Post Announcement'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Schedule.js
export function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('');
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = DAYS[new Date().getDay()-1] || 'Monday';

  useEffect(() => {
    setLoading(true);
    api.get('/schedule', { params: filterClass ? { class:filterClass } : {} })
      .then(r => { setSchedules(r.data); setLoading(false); });
  }, [filterClass]);

  const byDay = {};
  DAYS.forEach(d => { byDay[d] = schedules.filter(s=>s.day===d); });

  const subjectColors = { Physics:'bg-blue-50 text-blue-700 border-blue-200', Chemistry:'bg-green-50 text-green-700 border-green-200', Mathematics:'bg-amber-50 text-amber-700 border-amber-200', Computer:'bg-purple-50 text-purple-700 border-purple-200' };

  return (
    <div>
      <PageHeader title="Weekly Schedule" subtitle="Class timetable for all subjects"
        actions={
          <select className="input w-36" value={filterClass} onChange={e=>setFilterClass(e.target.value)}>
            <option value="">All classes</option>
            {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
          </select>
        } />
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day=>(
            <div key={day} className={`card ${day===today?'ring-2 ring-brand-500 ring-offset-1':''}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold text-sm ${day===today?'text-brand-700':'text-gray-900'}`}>{day}</h3>
                {day===today && <span className="badge-blue text-xs">Today</span>}
              </div>
              {byDay[day].length===0 ? (
                <p className="text-xs text-gray-400 py-2">No classes</p>
              ) : (
                <div className="space-y-2">
                  {byDay[day].map((s,i)=>(
                    <div key={i} className={`px-3 py-2 rounded-lg border text-xs font-medium ${subjectColors[s.subject]||subjectColors.Physics}`}>
                      <div className="flex justify-between items-center">
                        <span>{s.subject}</span>
                        <span className="font-normal opacity-70">Class {s.class}</span>
                      </div>
                      <div className="mt-0.5 font-normal opacity-70">{s.startTime} – {s.endTime}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
