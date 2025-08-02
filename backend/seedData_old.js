import mongoose from 'mongoose';
import User from './models/User.js';
import Student from './models/Student.js';
import Parade from './models/Parade.js';
import Attendance from './models/Attendance.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ncc_management');
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Parade.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const admin = new User({
      username: 'admin',
      password: 'ncc2024',
      fullName: 'NCC Administrator',
      role: 'admin',
      email: 'admin@ncc.gov.in'
    });
    await admin.save();
    console.log('👤 Created admin user');

    // Create sample students
    const students = [
      {
        name: 'Arjun Kumar',
        regimentalNumber: 'NCC001',
        category: 'B2',
        rank: 'Cadet',
        email: 'arjun.kumar@college.edu',
        phone: '+91-9876543210',
        address: '123 Main Street, Delhi, India',
        enrollmentDate: new Date('2023-07-01')
      },
      {
        name: 'Priya Singh',
        regimentalNumber: 'NCC002',
        category: 'C',
        rank: 'Senior Cadet',
        email: 'priya.singh@college.edu',
        phone: '+91-9876543211',
        address: '456 Park Avenue, Mumbai, India',
        enrollmentDate: new Date('2024-07-01')
      },
      {
        name: 'Vikram Sharma',
        rollNumber: 'NCC003',
        company: 'Alpha',
        year: '3',
        email: 'vikram.sharma@college.edu',
        phone: '+91-9876543212',
        enrollmentDate: new Date('2022-07-01')
      },
      {
        name: 'Anita Patel',
        rollNumber: 'NCC004',
        company: 'Charlie',
        year: '2',
        email: 'anita.patel@college.edu',
        phone: '+91-9876543213',
        enrollmentDate: new Date('2023-07-01')
      },
      {
        name: 'Raj Gupta',
        rollNumber: 'NCC005',
        company: 'Delta',
        year: '4',
        email: 'raj.gupta@college.edu',
        phone: '+91-9876543214',
        enrollmentDate: new Date('2021-07-01')
      },
      {
        name: 'Kavita Rao',
        rollNumber: 'NCC006',
        company: 'Beta',
        year: '1',
        email: 'kavita.rao@college.edu',
        phone: '+91-9876543215',
        enrollmentDate: new Date('2024-07-01')
      },
      {
        name: 'Suresh Reddy',
        rollNumber: 'NCC007',
        company: 'Charlie',
        year: '3',
        email: 'suresh.reddy@college.edu',
        phone: '+91-9876543216',
        enrollmentDate: new Date('2022-07-01')
      },
      {
        name: 'Meera Joshi',
        rollNumber: 'NCC008',
        company: 'Alpha',
        year: '2',
        email: 'meera.joshi@college.edu',
        phone: '+91-9876543217',
        enrollmentDate: new Date('2023-07-01')
      },
      {
        name: 'Amit Verma',
        rollNumber: 'NCC009',
        company: 'Beta',
        year: '4',
        email: 'amit.verma@college.edu',
        phone: '+91-9876543218',
        enrollmentDate: new Date('2021-07-01')
      },
      {
        name: 'Deepika Nair',
        rollNumber: 'NCC010',
        company: 'Delta',
        year: '1',
        email: 'deepika.nair@college.edu',
        phone: '+91-9876543219',
        enrollmentDate: new Date('2024-07-01')
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log('👥 Created sample students');

    // Create sample parades
    const parades = [
      {
        name: 'Weekly Morning Parade',
        type: 'Morning Parade',
        date: new Date('2024-01-15'),
        time: '06:00',
        description: 'Regular morning parade and physical training',
        status: 'Completed',
        location: 'Main Ground',
        instructor: 'Capt. Rajesh Kumar',
        createdBy: admin._id
      },
      {
        name: 'Republic Day Practice',
        type: 'Ceremonial Parade',
        date: new Date('2024-01-20'),
        time: '07:00',
        description: 'Practice for Republic Day ceremony',
        status: 'Completed',
        location: 'Parade Ground',
        instructor: 'Major Sunita Devi',
        createdBy: admin._id
      },
      {
        name: 'Weapon Training Session',
        type: 'Weapon Training',
        date: new Date('2024-01-25'),
        time: '08:00',
        description: 'Basic weapon handling and safety training',
        status: 'Upcoming',
        location: 'Training Ground',
        instructor: 'Lt. Col. Prakash Singh',
        createdBy: admin._id
      },
      {
        name: 'Physical Training',
        type: 'Physical Training',
        date: new Date('2024-01-30'),
        time: '06:30',
        description: 'Morning physical training and fitness test',
        status: 'Upcoming',
        location: 'Sports Ground',
        instructor: 'Capt. Anil Sharma',
        createdBy: admin._id
      },
      {
        name: 'Drill Competition Prep',
        type: 'Special Drill',
        date: new Date('2024-02-05'),
        time: '16:00',
        description: 'Preparation for inter-college drill competition',
        status: 'Upcoming',
        location: 'Main Ground',
        instructor: 'Major Ravi Chandra',
        createdBy: admin._id
      }
    ];

    const createdParades = await Parade.insertMany(parades);
    console.log('🎯 Created sample parades');

    // Create sample attendance data
    const attendanceData = [];
    
    // For completed parades, create attendance records
    const completedParades = createdParades.filter(parade => parade.status === 'Completed');
    
    for (const parade of completedParades) {
      for (const student of createdStudents) {
        // Randomly assign attendance with higher probability of being present
        const statuses = ['Present', 'Present', 'Present', 'Present', 'Absent', 'Late'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        attendanceData.push({
          parade: parade._id,
          student: student._id,
          status: randomStatus,
          markedBy: admin._id,
          markedAt: new Date(parade.date.getTime() + Math.random() * 3600000), // Random time within hour
          remarks: randomStatus === 'Absent' ? 'Sick leave' : randomStatus === 'Late' ? 'Traffic delay' : ''
        });
      }
    }

    await Attendance.insertMany(attendanceData);
    console.log('✅ Created sample attendance data');

    // Update attendance rates for students
    for (const student of createdStudents) {
      const totalAttendance = await Attendance.countDocuments({ student: student._id });
      const presentAttendance = await Attendance.countDocuments({ 
        student: student._id, 
        status: 'Present' 
      });
      
      const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;
      
      await Student.findByIdAndUpdate(student._id, { attendanceRate });
    }
    console.log('📊 Updated attendance rates');

    console.log('\n🎉 Sample data seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Username: admin');
    console.log('Password: ncc2024');
    console.log('\n📊 Sample Data Created:');
    console.log(`Students: ${createdStudents.length}`);
    console.log(`Parades: ${createdParades.length}`);
    console.log(`Attendance Records: ${attendanceData.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedData();
