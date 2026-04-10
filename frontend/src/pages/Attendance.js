import React, { useState, useEffect } from 'react';
import { Check, X, CalendarCheck } from 'lucide-react';
import { PageHeader, Spinner, EmptyState } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CLASSES, SUBJECTS } from '../utils/helpers';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState('9');
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calDate] = useState(new Date());

  useEffect(() => { loadStudents(); }, [selectedClass]);
  useEffect(() => { loadAttendance(); }, [selectedClass, selectedSubject, date]);

  const loadStudents = async () => {
    const res = await api.get('/students', { params: { class: selectedClass } });
    setStudents(res.data);
    const init = {};
    res.data.forEach(s => { init[s._id] = 'present'; });
    setRecords(init);
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance', { params: { date, class: selectedClass, subject: selectedSubject } });
      if (res.data?.[0]?.records?.length) {
        const r = {};
        res.data[0].records.forEach(x => { r[x.student._id || x.student] = x.status; });
        setRecords(r);
      }
    } catch {} finally { setLoading(false); }
  };

  const toggleAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setRecords(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/attendance', {
        date, class: selectedClass, subject: selectedSubject,
        records: students.map(s => ({ student: s._id, status: records[s._id] || 'absent' })),
      });
      toast.success('Attendance saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const present = Object.values(records).filter(v=>v==='present').length;
  const absent  = Object.values(records).filter(v=>v==='absent').length;

  // Calendar
  const monthDays = eachDayOfInterval({ start: startOfMonth(calDate), end: endOfMonth(calDate) });
  const firstDay = (getDay(startOfMonth(calDate)) + 6) % 7;

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark and track daily attendance" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Mark attendance */}
        <div className="lg:col-span-2 card">
          {/* Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
            <select className="input" value={selectedClass} onChange={e=>setSelectedClass(e.target.value)}>
              {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
            </select>
            <select className="input" value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)}>
              {SUBJECTS.map(s=><option key={s}>{s}</option>)}
            </select>
            <button onClick={handleSave} disabled={saving} className="btn-primary justify-center">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Summary */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{present}</p>
              <p className="text-xs text-green-600 font-medium">Present</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{absent}</p>
              <p className="text-xs text-red-500 font-medium">Absent</p>
            </div>
            <div className="flex-1 bg-brand-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-brand-700">{students.length ? Math.round((present/students.length)*100) : 0}%</p>
              <p className="text-xs text-brand-600 font-medium">Rate</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-4">
            <button onClick={()=>toggleAll('present')} className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium transition">All Present</button>
            <button onClick={()=>toggleAll('absent')} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition">All Absent</button>
          </div>

          {loading ? <Spinner /> : students.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No students" description="No students in this class" />
          ) : (
            <div className="space-y-2">
              {students.map(s => {
                const status = records[s._id] || 'absent';
                return (
                  <div key={s._id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${status==='present'?'bg-green-50 border-green-200':'bg-red-50 border-red-200'}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.rollNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setRecords(r=>({...r,[s._id]:'present'}))}
                        className={`p-2 rounded-lg transition ${status==='present'?'bg-green-600 text-white':'bg-white text-gray-400 hover:text-green-600 border border-gray-200'}`}>
                        <Check size={15} />
                      </button>
                      <button onClick={()=>setRecords(r=>({...r,[s._id]:'absent'}))}
                        className={`p-2 rounded-lg transition ${status==='absent'?'bg-red-500 text-white':'bg-white text-gray-400 hover:text-red-500 border border-gray-200'}`}>
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">{format(calDate,'MMMM yyyy')}</h3>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['M','T','W','T','F','S','S'].map((d,i)=>(
              <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
            {monthDays.map(day=>{
              const isT = isToday(day);
              const isSun = getDay(day)===0;
              return (
                <button key={day.toString()}
                  onClick={()=>setDate(format(day,'yyyy-MM-dd'))}
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg transition font-medium
                    ${isT?'bg-brand-600 text-white':isSun?'text-gray-300':date===format(day,'yyyy-MM-dd')?'bg-brand-100 text-brand-700':'text-gray-600 hover:bg-gray-100'}`}>
                  {format(day,'d')}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-brand-600" /> Today
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-brand-100" /> Selected date
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
