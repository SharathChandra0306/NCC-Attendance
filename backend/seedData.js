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

    // Create admin users from environment variables - only these will be authorized
    const adminUsers = [
      {
        username: process.env.ADMIN_1_USERNAME,
        password: process.env.ADMIN_1_PASSWORD,
        fullName: process.env.ADMIN_1_FULLNAME,
        role: 'admin',
        email: process.env.ADMIN_1_EMAIL,
        accessLevel: 'super_admin',
        isAuthorized: true
      },
      {
        username: process.env.ADMIN_2_USERNAME,
        password: process.env.ADMIN_2_PASSWORD,
        fullName: process.env.ADMIN_2_FULLNAME,
        role: 'admin',
        email: process.env.ADMIN_2_EMAIL,
        accessLevel: 'admin',
        isAuthorized: true
      },
      {
        username: process.env.ADMIN_3_USERNAME,
        password: process.env.ADMIN_3_PASSWORD,
        fullName: process.env.ADMIN_3_FULLNAME,
        role: 'admin',
        email: process.env.ADMIN_3_EMAIL,
        accessLevel: 'admin',
        isAuthorized: true
      },
      {
        username: 'sania',
        password: 'Sania@NCC',
        fullName: 'Junior Under Officer',
        role: 'admin',
        email: 'admin4@ncc.gov.in',
        accessLevel: 'admin',
        isAuthorized: true
      },
      {
        username: 'admin5',
        password: 'ncc2024',
        fullName: 'Student Affairs Officer',
        role: 'admin',
        email: 'admin5@ncc.gov.in',
        accessLevel: 'admin',
        isAuthorized: true
      },
      {
        username: 'admin6',
        password: 'ncc2024',
        fullName: 'Reports Manager',
        role: 'admin',
        email: 'admin6@ncc.gov.in',
        accessLevel: 'admin',
        isAuthorized: true
      }
    ];

    // Create authorized admin users
    let firstAdmin = null;
    for (const adminData of adminUsers) {
      const admin = new User(adminData);
      await admin.save();
      if (!firstAdmin) firstAdmin = admin; // Keep reference to first admin for parades
    }
    console.log('👤 Created 6 authorized admin users (admin1-admin6)');

    // Create a sample unauthorized user for testing
    const unauthorizedUser = new User({
      username: 'user1',
      password: 'ncc2024',
      fullName: 'Test User',
      role: 'instructor',
      email: 'user1@ncc.gov.in',
      accessLevel: 'viewer',
      isAuthorized: false
    });
    await unauthorizedUser.save();
    console.log('👤 Created 1 unauthorized test user');

    // Create sample students with new field structure
    const students = [
      {
        name: 'Arjun Kumar',
        regimentalNumber: 'NCC001',
        category: 'B2',
        branch: 'Computer Science & Engineering (CSE)',
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
        branch: 'CSE – Artificial Intelligence & Machine Learning (AIML)',
        rank: 'Senior Cadet',
        email: 'priya.singh@college.edu',
        phone: '+91-9876543211',
        address: '456 Park Avenue, Mumbai, India',
        enrollmentDate: new Date('2024-07-01')
      },
      {
        name: 'Vikram Sharma',
        regimentalNumber: 'NCC003',
        category: 'B1',
        branch: 'Electronics & Communication Engineering (ECE)',
        rank: 'Cadet Corporal',
        email: 'vikram.sharma@college.edu',
        phone: '+91-9876543212',
        address: '789 Garden Road, Bangalore, India',
        enrollmentDate: new Date('2022-07-01')
      },
      {
        name: 'Anita Patel',
        regimentalNumber: 'NCC004',
        category: 'C',
        branch: 'Information Technology (IT)',
        rank: 'Cadet',
        email: 'anita.patel@college.edu',
        phone: '+91-9876543213',
        address: '321 Lake View, Pune, India',
        enrollmentDate: new Date('2023-07-01')
      },
      {
        name: 'Raj Gupta',
        regimentalNumber: 'NCC005',
        category: 'B2',
        branch: 'Mechanical Engineering (ME)',
        rank: 'Cadet Sergeant',
        email: 'raj.gupta@college.edu',
        phone: '+91-9876543214',
        address: '654 Hill Station, Chennai, India',
        enrollmentDate: new Date('2021-07-01')
      },
      {
        name: 'Kavita Rao',
        regimentalNumber: 'NCC006',
        category: 'C',
        branch: 'CSE – Data Science (CS DS)',
        rank: 'Senior Cadet',
        email: 'kavita.rao@college.edu',
        phone: '+91-9876543215',
        address: '987 Riverside, Kolkata, India',
        enrollmentDate: new Date('2024-07-01')
      },
      {
        name: 'Suresh Reddy',
        regimentalNumber: 'NCC007',
        category: 'B1',
        branch: 'Electrical & Electronics Engineering (EEE)',
        rank: 'Cadet',
        email: 'suresh.reddy@college.edu',
        phone: '+91-9876543216',
        address: '147 Market Street, Hyderabad, India',
        enrollmentDate: new Date('2022-07-01')
      },
      {
        name: 'Meera Joshi',
        regimentalNumber: 'NCC008',
        category: 'B2',
        branch: 'Civil Engineering (CE)',
        rank: 'Cadet Corporal',
        email: 'meera.joshi@college.edu',
        phone: '+91-9876543217',
        address: '258 Temple Road, Jaipur, India',
        enrollmentDate: new Date('2023-07-01')
      },
      {
        name: 'Amit Verma',
        regimentalNumber: 'NCC009',
        category: 'C',
        branch: 'Computer Science & Engineering (CSE)',
        rank: 'Cadet Sergeant',
        email: 'amit.verma@college.edu',
        phone: '+91-9876543218',
        address: '369 School Lane, Lucknow, India',
        enrollmentDate: new Date('2021-07-01')
      },
      {
        name: 'Deepika Nair',
        regimentalNumber: 'NCC010',
        category: 'B1',
        branch: 'Information Technology (IT)',
        rank: 'Senior Cadet',
        email: 'deepika.nair@college.edu',
        phone: '+91-9876543219',
        address: '741 University Square, Kochi, India',
        enrollmentDate: new Date('2023-07-01')
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log(`📚 Created ${createdStudents.length} students`);

    // Create sample parades
    const now = new Date();
    const parades = [
      {
        name: 'Independence Day Parade',
        type: 'Ceremonial Parade',
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        time: '07:00',
        location: 'College Grounds',
        description: 'Annual Independence Day celebration parade',
        status: 'Completed',
        createdBy: firstAdmin._id
      },
      {
        name: 'Republic Day Parade',
        type: 'Ceremonial Parade',
        date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        time: '08:00',
        location: 'Main Campus',
        description: 'Republic Day commemoration parade',
        status: 'Completed',
        createdBy: firstAdmin._id
      },
      {
        name: 'Monthly Drill Practice',
        type: 'Special Drill',
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        time: '06:30',
        location: 'Training Ground',
        description: 'Monthly drill and discipline practice session',
        status: 'Completed',
        createdBy: firstAdmin._id
      },
      {
        name: 'Annual Camp Preparation',
        type: 'Camp Activity',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        time: '09:00',
        location: 'Assembly Hall',
        description: 'Preparation session for annual NCC camp',
        status: 'Upcoming',
        createdBy: firstAdmin._id
      }
    ];

    const createdParades = await Parade.insertMany(parades);
    console.log(`🎪 Created ${createdParades.length} parades`);

    // Create sample attendance records
    const attendanceRecords = [];
    const statuses = ['Present', 'Absent', 'Late', 'Excused'];
    
    for (const parade of createdParades.slice(0, 3)) { // Only for completed parades
      for (const student of createdStudents) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const weight = status === 'Present' ? 0.8 : status === 'Late' ? 0.7 : status === 'Excused' ? 0.6 : 0.3;
        
        if (Math.random() < weight) { // Higher chance for Present
          attendanceRecords.push({
            student: student._id,
            parade: parade._id,
            status: status === 'Present' || Math.random() > 0.2 ? 'Present' : status,
            markedBy: firstAdmin._id,
            markedAt: new Date(parade.date.getTime() + Math.random() * 3600000),
            remarks: status === 'Late' ? 'Arrived 10 minutes late' :
                    status === 'Excused' ? 'Medical emergency' :
                    status === 'Absent' ? 'No prior intimation' : ''
          });
        }
      }
    }

    const createdAttendance = await Attendance.insertMany(attendanceRecords);
    console.log(`📊 Created ${createdAttendance.length} attendance records`);

    // Calculate and update attendance rates for each student
    for (const student of createdStudents) {
      const totalParades = createdParades.slice(0, 3).length; // Only completed parades
      const presentCount = await Attendance.countDocuments({
        student: student._id,
        status: 'Present'
      });
      
      const attendanceRate = totalParades > 0 ? (presentCount / totalParades) * 100 : 0;
      
      await Student.findByIdAndUpdate(student._id, {
        attendanceRate: Math.round(attendanceRate * 10) / 10
      });
    }

    console.log('✅ Updated attendance rates for all students');
    console.log('🎉 Database seeded successfully!');
    
    // Display some statistics
    console.log('\n📈 Database Statistics:');
    console.log(`👥 Total Students: ${createdStudents.length}`);
    console.log(`🎪 Total Parades: ${createdParades.length}`);
    console.log(`📊 Total Attendance Records: ${createdAttendance.length}`);
    
    console.log('\n🏷️ Student Categories:');
    const categoryStats = await Student.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} students`);
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedData();
