import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection for NextAuth adapter
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Mongoose connection for models
export const connectMongo = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log('MongoDB connected via mongoose');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Initialize connection
connectMongo();

export default clientPromise;
