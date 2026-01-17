import mongoose from 'mongoose';
import { serverEnv } from '@/config/env.server';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log('already connected');
    return;
  }
  try {
    const db = await mongoose.connect(serverEnv.MONGODB_URI, {});
    connection.isConnected = db.connections[0].readyState;
    console.log('DB Connected');
  } catch (error) {
    console.log('database connection failed', error);
    throw error;
  }
}

export default dbConnect;
