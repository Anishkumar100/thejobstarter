import mongoose from 'mongoose';

/*
 * Connect to MongoDB using the URI from environment variables
 */
export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
    console.log('[DB] Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('[DB] MongoDB connected successfully');
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error.message);
    process.exit(1);
  }
}

export default connectDB;
