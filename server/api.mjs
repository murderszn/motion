import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is required');
  process.exit(1);
}

const client = new MongoClient(MONGO_URI, {
  serverApi: ServerApiVersion.v1,
});

const app = express();
app.use(cors());
app.use(express.json());

async function connectDB() {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('Connected to MongoDB Atlas');
}

function generateKey() {
  return crypto.randomBytes(24).toString('hex');
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: 'motion' });
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, event } = req.body;

    if (!name || !email || !event) {
      return res.status(400).json({
        error: 'name, email, and event are required',
      });
    }

    const db = client.db('motion');
    const collection = db.collection('signups');

    const key = generateKey();

    await collection.insertOne({
      name,
      email,
      event,
      key,
      createdAt: new Date(),
    });

    res.json({ success: true, key });
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

const PORT = parseInt(process.env.API_PORT || '3001', 10);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n  motion api → http://localhost:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
