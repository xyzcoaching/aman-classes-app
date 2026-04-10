import React, { useEffect, useState, useCallback } from 'react';
import { IndianRupee, Plus, Printer, RefreshCw } from 'lucide-react';
import { Modal, Spinner, EmptyState, PageHeader, StatCard } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MONTHS, fmtCurrency, fmtDate, printReceipt } from '../utils/helpers';

export default function Fees() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()+1);
  const [year, setYear] = useState(now.getFullYear());
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId:'', paidAmount:'', remarks:'' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = { month, year };
    if (filterStatus) params.status = filterStatus;
    const [feesRes, sumRes] = await Promise.all([
      api.get('/fees', { params }),
      api.get('/fees/summary', { params: { month, year } }),
    ]);
    setFees(feesRes.data);
    setSummary(sumRes.data);
    setLoading(false);
  }, [month, year, filterStatus]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/students').then(r => setStudents(r.data));
  }, []);

  const handleSave = async () => {
    if (!form.studentId || !form.paidAmount) return toast.error('Select student and enter amount');
    setSaving(true);
    try {
      await api.post('/fees', { ...form, month, year });
      toast.success('Fee recorded!');
      setModal(false);
      setForm({ studentId:'', paidAmount:'', remarks:'' });
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const statusBadge = { paid:'badge-green', pending:'badge-red', partial:'badge-amber' };
  const years = [now.getFullYear(), now.getFullYear()-1];

  return (
    <div>
      <PageHeader title="Fee Management" subtitle="Track and record student fee payments"
        actions={<button className="btn-primary" onClick={()=>setModal(true)}><Plus size={15}/>Record Payment</button>} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Collected" value={fmtCurrency(summary.collected||0)} icon={IndianRupee} color="green" sub={`${MONTHS[month-1]} ${year}`} />
        <StatCard label="Partial Paid" value={fmtCurrency(summary.partial||0)} icon={IndianRupee} color="amber" />
        <StatCard label="Pending students" value={summary.pending||0} icon={IndianRupee} color="red" />
        <StatCard label="Total Students" value={summary.totalStudents||0} icon={IndianRupee} color="blue" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="input w-36" value={month} onChange={e=>setMonth(parseInt(e.target.value))}>
          {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
        </select>
        <select className="input w-28" value={year} onChange={e=>setYear(parseInt(e.target.value))}>
          {years.map(y=><option key={y}>{y}</option>)}
        </select>
        <select className="input w-36" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
        </select>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14}/> Refresh</button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <Spinner /> : fees.length===0 ? (
          <EmptyState icon={IndianRupee} title="No fee records" description="Record a payment to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Student','Class','Due Amount','Paid Amount','Status','Paid On','Receipt'].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.map(f=>(
                  <tr key={f._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{f.student?.name}</td>
                    <td className="px-4 py-3"><span className="badge-blue">Class {f.student?.class}</span></td>
                    <td className="px-4 py-3 text-gray-600">{fmtCurrency(f.amount)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{fmtCurrency(f.paidAmount)}</td>
                    <td className="px-4 py-3"><span className={statusBadge[f.status]}>{f.status}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(f.paidDate)}</td>
                    <td className="px-4 py-3">
                      {f.status==='paid' && (
                        <button onClick={()=>printReceipt(f, f.student)}
                          className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
                          <Printer size={13}/> Print
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record payment modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Record Fee Payment">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Student *</label>
            <select className="input" value={form.studentId} onChange={e=>setForm(f=>({...f,studentId:e.target.value}))}>
              <option value="">Select student</option>
              {students.map(s=><option key={s._id} value={s._id}>{s.name} – Class {s.class} (₹{s.monthlyFee})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
              <select className="input" value={month} onChange={e=>setMonth(parseInt(e.target.value))}>
                {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
              <select className="input" value={year} onChange={e=>setYear(parseInt(e.target.value))}>
                {years.map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid (₹) *</label>
            <input className="input" type="number" placeholder="Enter amount" value={form.paidAmount}
              onChange={e=>setForm(f=>({...f,paidAmount:e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
            <input className="input" placeholder="Optional note" value={form.remarks}
              onChange={e=>setForm(f=>({...f,remarks:e.target.value}))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button className="btn-secondary flex-1" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={saving}>
              {saving?'Saving...':'Record Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
