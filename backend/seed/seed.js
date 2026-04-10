const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Announcement = require('../models/Announcement');
const Schedule = require('../models/Schedule');
const Material = require('../models/Material');

const SUBJECTS = ['Physics','Chemistry','Mathematics','Computer'];

const studentData = [
  { name:'Rahul Sharma',    class:'9', subjects:['Physics','Chemistry'],      parentPhone:'9810012301', monthlyFee:1800, feeStatus:'paid' },
  { name:'Priya Singh',     class:'10',subjects:['Chemistry','Mathematics'],  parentPhone:'9810012302', monthlyFee:2000, feeStatus:'paid' },
  { name:'Amit Kumar',      class:'8', subjects:['Mathematics','Computer'],   parentPhone:'9810012303', monthlyFee:1500, feeStatus:'pending' },
  { name:'Sneha Gupta',     class:'9', subjects:['Physics','Mathematics'],    parentPhone:'9810012304', monthlyFee:1800, feeStatus:'paid' },
  { name:'Rohan Das',       class:'6', subjects:['Computer'],                 parentPhone:'9810012305', monthlyFee:1200, feeStatus:'pending' },
  { name:'Ananya Mishra',   class:'7', subjects:['Mathematics','Computer'],   parentPhone:'9810012306', monthlyFee:1400, feeStatus:'paid' },
  { name:'Vikram Patel',    class:'10',subjects:['Physics','Chemistry','Mathematics'], parentPhone:'9810012307', monthlyFee:2200, feeStatus:'paid' },
  { name:'Divya Rao',       class:'8', subjects:['Mathematics'],              parentPhone:'9810012308', monthlyFee:1300, feeStatus:'paid' },
  { name:'Karan Joshi',     class:'9', subjects:['Physics','Chemistry','Mathematics'], parentPhone:'9810012309', monthlyFee:2000, feeStatus:'partial' },
  { name:'Meera Nair',      class:'10',subjects:['Physics','Mathematics'],    parentPhone:'9810012310', monthlyFee:1900, feeStatus:'paid' },
  { name:'Arjun Verma',     class:'6', subjects:['Mathematics','Computer'],   parentPhone:'9810012311', monthlyFee:1200, feeStatus:'paid' },
  { name:'Pooja Yadav',     class:'7', subjects:['Computer'],                 parentPhone:'9810012312', monthlyFee:1200, feeStatus:'pending' },
  { name:'Sahil Khan',      class:'8', subjects:['Mathematics','Physics'],    parentPhone:'9810012313', monthlyFee:1600, feeStatus:'paid' },
  { name:'Ritika Bose',     class:'10',subjects:['Chemistry','Mathematics'],  parentPhone:'9810012314', monthlyFee:1900, feeStatus:'paid' },
  { name:'Nikhil Tiwari',   class:'9', subjects:['Physics'],                  parentPhone:'9810012315', monthlyFee:1400, feeStatus:'paid' },
];

const scheduleData = [
  { class:'9',  day:'Monday',    subject:'Physics',     startTime:'09:00', endTime:'10:30' },
  { class:'10', day:'Monday',    subject:'Chemistry',   startTime:'11:00', endTime:'12:30' },
  { class:'8',  day:'Monday',    subject:'Mathematics', startTime:'14:00', endTime:'15:30' },
  { class:'7',  day:'Monday',    subject:'Computer',    startTime:'16:00', endTime:'17:00' },
  { class:'10', day:'Tuesday',   subject:'Mathematics', startTime:'09:00', endTime:'10:30' },
  { class:'9',  day:'Tuesday',   subject:'Chemistry',   startTime:'11:00', endTime:'12:30' },
  { class:'6',  day:'Tuesday',   subject:'Computer',    startTime:'14:00', endTime:'15:00' },
  { class:'8',  day:'Wednesday', subject:'Physics',     startTime:'09:00', endTime:'10:30' },
  { class:'10', day:'Wednesday', subject:'Physics',     startTime:'11:00', endTime:'12:30' },
  { class:'9',  day:'Wednesday', subject:'Mathematics', startTime:'14:00', endTime:'15:30' },
  { class:'9',  day:'Thursday',  subject:'Physics',     startTime:'09:00', endTime:'10:30' },
  { class:'10', day:'Thursday',  subject:'Chemistry',   startTime:'11:00', endTime:'12:30' },
  { class:'8',  day:'Thursday',  subject:'Mathematics', startTime:'14:00', endTime:'15:30' },
  { class:'7',  day:'Thursday',  subject:'Computer',    startTime:'16:00', endTime:'17:00' },
  { class:'10', day:'Friday',    subject:'Mathematics', startTime:'09:00', endTime:'10:30' },
  { class:'9',  day:'Friday',    subject:'Chemistry',   startTime:'11:00', endTime:'12:30' },
  { class:'6',  day:'Friday',    subject:'Mathematics', startTime:'14:00', endTime:'15:30' },
  { class:'8',  day:'Saturday',  subject:'Mathematics', startTime:'09:00', endTime:'10:30' },
  { class:'9',  day:'Saturday',  subject:'Physics',     startTime:'11:00', endTime:'12:30' },
  { class:'7',  day:'Saturday',  subject:'Computer',    startTime:'14:00', endTime:'15:00' },
];

const announcementData = [
  { title:'Unit Test – Physics & Chemistry on 14 April', body:'Please revise chapters 3–5 for Physics and chapters 2–4 for Chemistry. Bring your own stationery.', targetClass:'All', subject:'General', priority:'high' },
  { title:'Holiday on 14 April – Ambedkar Jayanti', body:'Classes will remain closed on 14 April. Extra classes will be conducted on 13 April at 4 PM.', targetClass:'All', subject:'General', priority:'medium' },
  { title:'Fee Submission Reminder', body:'Last date to submit April fees is 15th April. Please avoid delays to prevent late fee charges.', targetClass:'All', subject:'General', priority:'high' },
  { title:'New Study Material Uploaded – Newton\'s Laws', body:'Notes for Newton\'s Laws of Motion (Chapter 5) have been uploaded for Class 9 Physics students.', targetClass:'9', subject:'Physics', priority:'low' },
  { title:'Parent-Teacher Meeting – 20 April', body:'A parent-teacher meeting is scheduled on 20 April from 10 AM to 1 PM. Attendance is mandatory.', targetClass:'All', subject:'General', priority:'medium' },
];

const materialData = [
  { title:"Newton's Laws of Motion – Notes", subject:'Physics', class:'9', description:'Complete chapter notes with solved examples', fileName:'newtons_laws.pdf', fileSize:1258000 },
  { title:'Periodic Table Worksheet', subject:'Chemistry', class:'10', description:'Practice worksheet covering period 3 elements', fileName:'periodic_table_ws.pdf', fileSize:819200 },
  { title:'Algebra Practice Set – Chapter 4', subject:'Mathematics', class:'8', description:'50 practice problems with solutions', fileName:'algebra_ch4.pdf', fileSize:1536000 },
  { title:'MS Word Basics – Chapter 2', subject:'Computer', class:'7', description:'Introduction to word processing with screenshots', fileName:'ms_word_ch2.pdf', fileSize:614400 },
  { title:'Optics – Revision Notes', subject:'Physics', class:'9', description:'Quick revision notes for unit exam preparation', fileName:'optics_revision.pdf', fileSize:921600 },
  { title:'Chemical Bonding – Slides', subject:'Chemistry', class:'10', description:'Presentation slides for chemical bonding chapter', fileName:'chemical_bonding.pdf', fileSize:2150000 },
  { title:'Quadratic Equations – Formula Sheet', subject:'Mathematics', class:'10', description:'All formulas and shortcuts in one page', fileName:'quadratic_formulas.pdf', fileSize:307200 },
  { title:'HTML & Internet Basics', subject:'Computer', class:'6', description:'Introduction to internet and basic HTML tags', fileName:'html_basics.pdf', fileSize:512000 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Student.deleteMany({}), Attendance.deleteMany({}),
      Fee.deleteMany({}), Announcement.deleteMany({}), Schedule.deleteMany({}), Material.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({ name:'Aman Sir', email:'admin@amanclasses.com', password:'admin123', role:'admin' });
    console.log('👤 Admin created: admin@amanclasses.com / admin123');

    // Create students
    const students = await Student.insertMany(studentData.map((s,i) => ({ ...s, admissionDate: new Date(2024, 3, i+1) })));
    console.log(`👨‍🎓 ${students.length} students created`);

    // Create student user accounts
    for (let i = 0; i < Math.min(students.length, 5); i++) {
      const s = students[i];
      await User.create({
        name: s.name,
        email: `student${i+1}@amanclasses.com`,
        password: 'student123',
        role: 'student',
        studentId: s._id,
      });
    }
    console.log('🔑 Student accounts: student1@amanclasses.com to student5@amanclasses.com / student123');

    // Create schedules
    await Schedule.insertMany(scheduleData.map(s => ({ ...s, teacher:'Aman Sir' })));
    console.log('📅 Schedule created');

    // Create announcements
    await Announcement.insertMany(announcementData.map(a => ({ ...a, postedBy: admin._id })));
    console.log('📢 Announcements created');

    // Create materials
    await Material.insertMany(materialData.map(m => ({ ...m, uploadedBy: admin._id })));
    console.log('📚 Study materials created');

    // Generate attendance for past 10 days
    const now = new Date();
    for (let d = 9; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(now.getDate() - d);
      date.setHours(0,0,0,0);
      const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
      if (dayName === 'Sunday') continue;

      const classGroups = { '9': students.filter(s=>s.class==='9'), '10': students.filter(s=>s.class==='10') };
      for (const [cls, clsStudents] of Object.entries(classGroups)) {
        if (!clsStudents.length) continue;
        await Attendance.create({
          date, class: cls, subject: 'Physics',
          records: clsStudents.map(s => ({
            student: s._id,
            status: Math.random() > 0.15 ? 'present' : 'absent',
          })),
          markedBy: admin._id,
        });
      }
    }
    console.log('✅ Attendance records created');

    // Generate fee records for this month
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    for (const student of students) {
      const paid = student.feeStatus === 'paid';
      const partial = student.feeStatus === 'partial';
      await Fee.create({
        student: student._id,
        month, year,
        amount: student.monthlyFee,
        paidAmount: paid ? student.monthlyFee : partial ? Math.floor(student.monthlyFee * 0.5) : 0,
        paidDate: paid ? new Date(year, month-1, Math.floor(Math.random()*10)+1) : undefined,
      });
    }
    console.log('💰 Fee records created');

    console.log('\n🎉 Seed complete! Run the backend and frontend to get started.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
