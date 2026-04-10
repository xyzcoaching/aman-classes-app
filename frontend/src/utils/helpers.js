export const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Computer'];
export const CLASSES  = ['6', '7', '8', '9', '10'];
export const DAYS     = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const SUBJECT_COLORS = {
  Physics:     { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  Chemistry:   { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  Mathematics: { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  Computer:    { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function fmtCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

export function getInitials(name='') {
  return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
}

export function avatarColor(name='') {
  const colors = ['bg-blue-500','bg-green-500','bg-amber-500','bg-purple-500','bg-rose-500','bg-teal-500','bg-indigo-500'];
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash<<5)-hash);
  return colors[Math.abs(hash) % colors.length];
}

export function printReceipt(fee, student) {
  const w = window.open('','_blank');
  w.document.write(`
    <html><head><title>Fee Receipt</title>
    <style>body{font-family:sans-serif;max-width:500px;margin:40px auto;padding:20px;border:1px solid #ddd}
    h2{color:#1d4ed8;margin-bottom:4px}.logo{font-size:22px;font-weight:700;color:#1d4ed8}
    .sub{color:#666;font-size:13px;margin-bottom:20px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
    .label{color:#666;font-size:13px}.val{font-weight:600}.status{display:inline-block;background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-size:13px;margin-top:16px}
    </style></head><body>
    <div class="logo">Aman Classes</div>
    <div class="sub">Class 6–10 Coaching · Fee Receipt</div>
    <div class="row"><span class="label">Receipt No.</span><span class="val">${fee.receiptNumber || '—'}</span></div>
    <div class="row"><span class="label">Student</span><span class="val">${student?.name}</span></div>
    <div class="row"><span class="label">Class</span><span class="val">Class ${student?.class}</span></div>
    <div class="row"><span class="label">Roll No.</span><span class="val">${student?.rollNumber}</span></div>
    <div class="row"><span class="label">Month</span><span class="val">${MONTHS[(fee.month||1)-1]} ${fee.year}</span></div>
    <div class="row"><span class="label">Amount Paid</span><span class="val">₹${fee.paidAmount?.toLocaleString('en-IN')}</span></div>
    <div class="row"><span class="label">Payment Date</span><span class="val">${fmtDate(fee.paidDate)}</span></div>
    <div class="status">✓ PAID</div>
    <p style="color:#999;font-size:12px;margin-top:24px">Generated on ${new Date().toLocaleString('en-IN')}</p>
    </body></html>`);
  w.document.close();
  w.print();
}
