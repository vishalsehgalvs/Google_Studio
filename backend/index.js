import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { body, validationResult } from 'express-validator';

dotenv.config();


import machineryRoutes from './src/routes/machinery.js';
import cropDiagnosisRoutes from './src/routes/cropDiagnosis.js';
import marketRoutes from './src/routes/market.js';
import marketTrendRoutes from './src/routes/marketTrend.js';
import schemesRoutes from './src/routes/schemes.js';
import authRoutes from './src/routes/auth.js';
import insuranceRoutes from './src/routes/insurance.js';
import soilRoutes from './src/routes/soil.js';


const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Swagger API docs setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kisan Express Backend API',
      version: '1.0.0',
      description: 'API documentation for Kisan Express Backend',
    },
  },
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Kisan Express Backend is running!');
});

// Async error handler wrapper for routes
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Example: Enhanced validation and async handler for adding machinery
app.post('/api/machinery',
  body('name').isString().notEmpty(),
  body('type').isString().notEmpty(),
  body('rentPrice').isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  asyncHandler(async (req, res) => {
    // Example: Add machinery to DB (replace with actual DB logic)
    // const machinery = await prisma.machinery.create({ data: req.body });
    res.json({ success: true, data: req.body });
  })
);



app.use('/api/machinery', machineryRoutes);
app.use('/api/crop-diagnosis', cropDiagnosisRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/market-trend', marketTrendRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/soil', soilRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Kisan Express Backend running on port ${port}`);
  console.log(`API docs available at http://localhost:${port}/api-docs`);
});
