import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarCheck, IndianRupee, AlertCircle, Plus, Clock } from 'lucide-react';
import { StatCard, Spinner, SubjectBadge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { fmtCurrency, fmtDate, SUBJECT_COLORS } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const pct = data?.totalStudents ? Math.round((data.todayAttendance / data.totalStudents) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">{now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students"     value={data?.totalStudents || 0}                      icon={Users}         color="blue"  sub="enrolled & active" />
        <StatCard label="Today's Attendance" value={`${data?.todayAttendance || 0}/${data?.totalStudents || 0}`} icon={CalendarCheck} color="green" sub={`${pct}% present`} />
        <StatCard label="Fees Collected"     value={fmtCurrency(data?.feesCollected || 0)}         icon={IndianRupee}   color="amber" sub="this month" />
        <StatCard label="Pending Fees"       value={data?.pendingFees || 0}                        icon={AlertCircle}   color="red"   sub="students due" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => navigate('/students')} className="btn-primary"><Plus size={15} /> Add Student</button>
        <button onClick={() => navigate('/attendance')} className="btn-secondary"><CalendarCheck size={15} /> Mark Attendance</button>
        <button onClick={() => navigate('/announcements')} className="btn-secondary"><Plus size={15} /> Announcement</button>
        <button onClick={() => navigate('/fees')} className="btn-secondary"><IndianRupee size={15} /> Record Fee</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's schedule */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={17} className="text-brand-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Today's Schedule</h3>
          </div>
          {data?.todaySchedule?.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No classes scheduled today</p>
          ) : (
            <div className="space-y-3">
              {data?.todaySchedule?.map((s, i) => {
                const col = SUBJECT_COLORS[s.subject] || SUBJECT_COLORS.Physics;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${col.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{s.subject} – Class {s.class}</p>
                      <p className="text-xs text-gray-500">{s.teacher}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{s.startTime} – {s.endTime}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Announcements</h3>
            <button onClick={() => navigate('/announcements')} className="text-xs text-brand-600 hover:underline">View all</button>
          </div>
          {data?.announcements?.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No announcements</p>
          ) : (
            <div className="space-y-3">
              {data?.announcements?.slice(0,4).map((a, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-2 flex-shrink-0 mt-1 rounded-full self-start h-2 ${a.priority==='high'?'bg-red-500':a.priority==='medium'?'bg-amber-500':'bg-green-500'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(a.createdAt)} · {a.targetClass === 'All' ? 'All classes' : `Class ${a.targetClass}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
