import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Validate connection string format
    if (MONGODB_URI.includes('cluster.mongodb.net') || MONGODB_URI.includes('<') || MONGODB_URI.includes('YOUR_')) {
      throw new Error(
        'Invalid MongoDB connection string. Please update MONGODB_URI in .env.local with your actual MongoDB Atlas connection string.\n' +
        'See MONGODB_SETUP.md for instructions on how to get your connection string.'
      );
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    
    // Provide helpful error messages
    if (e.message?.includes('ENOTFOUND') || e.message?.includes('querySrv')) {
      throw new Error(
        'MongoDB connection failed. Please check:\n' +
        '1. Your MONGODB_URI in .env.local is correct\n' +
        '2. Your MongoDB Atlas cluster is running\n' +
        '3. Your IP address is whitelisted in MongoDB Atlas\n' +
        '4. Your connection string includes the correct cluster name\n' +
        '\nSee MONGODB_SETUP.md for detailed setup instructions.'
      );
    }
    
    throw e;
  }

  return cached.conn;
}

export default connectDB;

