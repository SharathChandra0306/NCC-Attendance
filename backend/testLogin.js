import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Test finding the user
    const user = await User.findOne({ username: 'admin2' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      username: user.username,
      fullName: user.fullName,
      isAuthorized: user.isAuthorized,
      accessLevel: user.accessLevel
    });

    // Test password comparison
    const testPassword = 'ncc2024';
    const isPasswordValid = await user.comparePassword(testPassword);
    console.log('🔐 Password test result:', isPasswordValid);

    // Test another user
    const user2 = await User.findOne({ username: 'sharathchandra' });
    if (user2) {
      console.log('✅ User sharathchandra found');
      const isPasswordValid2 = await user2.comparePassword('Sharath$123');
      console.log('🔐 Sharath password test result:', isPasswordValid2);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📕 Disconnected from MongoDB');
  }
};

testLogin();
