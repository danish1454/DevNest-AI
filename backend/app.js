import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/users.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

connect();

const app = express();

const allowedOrigin = process.env.FRONTEND_URL;
console.log('Allowed Origin:', allowedOrigin); 

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

export default app;
