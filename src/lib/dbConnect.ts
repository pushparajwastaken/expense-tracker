import mongoose from "mongoose";

//override dns resolution (the error you get without these two lines might hurt your brain)
//we're forcing dns to use GoogleDNS instead of system DNS
import dns from "node:dns/promises";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

//in dev mode,next js reloads files frequently without this we can create multiple db connections
//leading to :- memory leaks and too many connection errors, so we store connection in globa;
declare global {
  var mongoose: {
    conn: mongoose.Connection | null; // stores actual DB Connection
    promise: Promise<typeof import("mongoose")> | null; // stores ongoing connection attempt
  };
}
let cached = global.mongoose || { conn: null, promise: null }; //if connection already exists reuse it otherwise initialize a new cache
//only one connection per server instance
//avoids reconnecting on every api call
global.mongoose = cached;

//returns a typed connection
async function dbConnect(): Promise<mongoose.Connection> {
  if (!process.env.MONGODB_URI) {
    throw new Error("Mongodb Uri is not defined");
  }
  const MONGODB_URI = process.env.MONGODB_URI;

  //if already connected don't reconnect
  if (cached.conn) {
    console.log("Already connected to the database");
    return cached.conn;
  }

  //create connection promise to prevent simultaneous connection attempts
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false, //queries fail fast if not connected
      maxPoolSize: 10, //avoids db overload
    });
  }
  try {
    const db = await cached.promise; //mongoose.connect returns mongoose instance
    cached.conn = db.connections[0]; //actual connections is inside this
    console.log("DB Connected Successfully");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("Database connection error:", error);
    throw error;
  }
}

export default dbConnect;
