import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cors from 'cors';
import connectToDatabase from '../db.js'; 
import teacherRoutes from '../routes/teacherRoutes.js'; 
import studentRoutes from '../routes/studentRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
  res.json({
    app: "Pathshala+",
    tagline: "Where teachers guide, students grow.",
    status: "Server is Live!" 
  });
});

// For Vercel
export default app;

// Local Development
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
    console.log(`Pathshala+ Backend running on http://localhost:${PORT}`);
    
    try {
      await connectToDatabase();
      console.log("Database connected successfully!");
    } catch (err) {
      console.error("Database connection failed:", err.message);
    }
  });
}