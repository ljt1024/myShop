import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { adminRouter } from './routes/admin.js';
import { mallRouter } from './routes/mall.js';
import { errorHandler, notFound } from './middlewares/error.js';
import { ok } from './utils/response.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json(ok({ uptime: process.uptime(), service: 'myshop-api' }));
});

app.use('/api/mall', mallRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`MyShop API running at http://localhost:${env.port}`);
});
