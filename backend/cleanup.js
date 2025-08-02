import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ncc_management');
    console.log('🔗 Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the entire students collection to remove old indexes
    try {
      await db.collection('students').drop();
      console.log('🧹 Dropped students collection');
    } catch (error) {
      if (error.code === 26) {
        console.log('📝 Students collection does not exist');
      } else {
        throw error;
      }
    }

    // Drop other collections too to start fresh
    const collections = ['users', 'parades', 'attendances'];
    for (const collection of collections) {
      try {
        await db.collection(collection).drop();
        console.log(`🧹 Dropped ${collection} collection`);
      } catch (error) {
        if (error.code === 26) {
          console.log(`📝 ${collection} collection does not exist`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Database cleanup completed');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

cleanupDatabase();
