import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard, Spinner, SubjectBadge, EmptyState } from '../components/ui';
import { CalendarCheck, IndianRupee, BookOpen, Megaphone } from 'lucide-react';
import api from '../utils/api';
import { fmtDate, fmtCurrency, MONTHS } from '../utils/helpers';

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = user?.studentId?._id || user?.studentId;

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    const now = new Date();
    Promise.all([
      api.get(`/attendance/student/${studentId}`, { params: { month: now.getMonth()+1, year: now.getFullYear() } }),
      api.get('/fees', { params: { studentId } }),
      api.get('/announcements'),
    ]).then(([att, fees, ann]) => {
      setData({ att: att.data, fees: fees.data, announcements: ann.data });
    }).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner />;
  const stats = data?.att?.stats || {};
  const total = (stats.present||0)+(stats.absent||0);
  const pct = total ? Math.round((stats.present/total)*100) : 0;
  const s = user?.studentId;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
        {s && <p className="text-sm text-gray-500 mt-0.5">Class {s.class} · Roll: {s.rollNumber}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Attendance" value={`${pct}%`} icon={CalendarCheck} color="green" sub={`${stats.present||0}/${total} days`} />
        <StatCard label="Fee Status" value={s?.feeStatus||'—'} icon={IndianRupee} color={s?.feeStatus==='paid'?'green':'red'} sub={`₹${s?.monthlyFee||0}/month`} />
      </div>
      <div className="card">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Recent Announcements</h3>
        {data?.announcements?.slice(0,4).map((a,i)=>(
          <div key={i} className="py-3 border-b border-gray-50 last:border-0">
            <p className="text-sm font-medium text-gray-900">{a.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(a.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentAttendance() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const studentId = user?.studentId?._id || user?.studentId;

  useEffect(() => {
    if (!studentId) return;
    api.get(`/attendance/student/${studentId}`, { params: { month: now.getMonth()+1, year: now.getFullYear() }})
      .then(r => setStats(r.data.stats||{}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  const total = (stats.present||0)+(stats.absent||0);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">My Attendance</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center"><p className="text-3xl font-bold text-green-600">{stats.present||0}</p><p className="text-xs text-gray-500 mt-1">Present</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-red-500">{stats.absent||0}</p><p className="text-xs text-gray-500 mt-1">Absent</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-brand-600">{total?Math.round((stats.present/total)*100):0}%</p><p className="text-xs text-gray-500 mt-1">Rate</p></div>
      </div>
      <div className="card"><p className="text-sm text-gray-500 text-center py-4">Detailed monthly calendar coming soon</p></div>
    </div>
  );
}

export function StudentFees() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = user?.studentId?._id || user?.studentId;

  useEffect(() => {
    if (!studentId) return;
    api.get('/fees', { params: { studentId } }).then(r=>setFees(r.data)).finally(()=>setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">My Fees</h1>
      {fees.length===0 ? <EmptyState icon={IndianRupee} title="No fee records" /> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Month</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Due</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Paid</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {fees.map(f=>(
                <tr key={f._id} className="border-b border-gray-50">
                  <td className="px-4 py-3">{MONTHS[f.month-1]} {f.year}</td>
                  <td className="px-4 py-3">{fmtCurrency(f.amount)}</td>
                  <td className="px-4 py-3 font-semibold">{fmtCurrency(f.paidAmount)}</td>
                  <td className="px-4 py-3"><span className={f.status==='paid'?'badge-green':f.status==='partial'?'badge-amber':'badge-red'}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/materials').then(r=>setMaterials(r.data)).finally(()=>setLoading(false)); }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Study Materials</h1>
      {materials.length===0 ? <EmptyState icon={BookOpen} title="No materials yet" /> : (
        <div className="card p-0 divide-y divide-gray-50">
          {materials.map(m=>(
            <div key={m._id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{m.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <SubjectBadge subject={m.subject} />
                  <span className="text-xs text-gray-400">Class {m.class}</span>
                </div>
              </div>
              <button className="btn-secondary text-xs py-1.5 px-3">Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const cls = user?.studentId?.class;

  useEffect(() => {
    api.get('/announcements', { params: cls ? { targetClass: cls } : {} })
      .then(r=>setAnnouncements(r.data)).finally(()=>setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Announcements</h1>
      {announcements.length===0 ? <EmptyState icon={Megaphone} title="No announcements" /> : (
        <div className="space-y-3">
          {announcements.map(a=>(
            <div key={a._id} className="card">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.priority==='high'?'bg-red-500':a.priority==='medium'?'bg-amber-500':'bg-green-500'}`} />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{a.body}</p>
                  <p className="text-xs text-gray-400 mt-2">{fmtDate(a.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
