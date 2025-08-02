import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ncc_management');
    console.log('🔗 Connected to MongoDB');

    // Create admin users - only these will be authorized
    const adminUsers = [
      {
        username: 'sharathchandra',
        password: 'Sharath$123',
        fullName: 'Sharath Chandra - Chief Administrator',
        role: 'admin',
        email: 'sharathchandra0306@gmail.com',
        accessLevel: 'super_admin',
        isAuthorized: true
      },
      {
        username: 'admin2',
        password: 'ncc2024',
        fullName: 'Training Officer',
        role: 'admin',
        email: 'admin2@ncc.gov.in',
        accessLevel: 'admin',
        isAuthorized: true
      },
      {
        username: 'admin3',
        password: 'ncc2024',
        fullName: 'Attendance Manager',
        role: 'admin',
        email: 'admin3@ncc.gov.in',
        accessLevel: 'admin',
        isAuthorized: true
      },
      {
        username: 'admin4',
        password: 'ncc2024',
        fullName: 'Parade Coordinator',
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
    for (const adminData of adminUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ username: adminData.username });
        if (existingUser) {
          console.log(`👤 User ${adminData.username} already exists, updating...`);
          await User.findOneAndUpdate(
            { username: adminData.username },
            { 
              accessLevel: adminData.accessLevel,
              isAuthorized: adminData.isAuthorized,
              fullName: adminData.fullName,
              email: adminData.email
            }
          );
        } else {
          const admin = new User(adminData);
          await admin.save();
          console.log(`👤 Created new user: ${adminData.username}`);
        }
      } catch (error) {
        console.error(`Error creating user ${adminData.username}:`, error.message);
      }
    }

    console.log('✅ Successfully processed all admin users');

    // Create a sample unauthorized user for testing
    try {
      const existingTestUser = await User.findOne({ username: 'user1' });
      if (!existingTestUser) {
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
      } else {
        console.log('👤 Test user already exists');
      }
    } catch (error) {
      console.error('Error creating test user:', error.message);
    }

  } catch (error) {
    console.error('❌ Error creating admin users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createAdmins();
