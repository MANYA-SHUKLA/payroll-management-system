import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import salarySlipRoutes from './routes/salarySlip.js';
import expenseRoutes from './routes/expense.js';
import notificationRoutes from './routes/notification.js';
import pdfRoutes from './routes/pdf.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll_db')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/salary-slip', pdfRoutes); // PDF route must come before general routes
app.use('/api/salary-slip', salarySlipRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/notification', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root route - API information page
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payroll Management System API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #333;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 800px;
            width: 100%;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        .logo svg {
            width: 50px;
            height: 50px;
            color: white;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .description {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 40px;
            line-height: 1.6;
        }
        .api-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: left;
        }
        .api-section h2 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #333;
            text-align: center;
        }
        .endpoint {
            background: white;
            padding: 15px 20px;
            margin: 10px 0;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .endpoint strong {
            color: #667eea;
            font-size: 1.1rem;
        }
        .endpoint code {
            background: #f1f3f5;
            padding: 5px 10px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
        }
        .footer {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e9ecef;
            text-align: center;
        }
        .footer-text {
            font-size: 1rem;
            color: #666;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        .heart {
            color: #e83e8c;
            animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .version {
            color: #999;
            font-size: 0.9rem;
            margin-top: 10px;
        }
        .status {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.05.245 2.5.6.45.355.5.8.5 1.4 0 1.105-1.343 2-3 2s-3-.895-3-2c0-.6.05-1.045.5-1.4C9.95 4.245 10.89 4 12 4zm-8 8c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2zm14 0c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2z" />
            </svg>
        </div>
        <h1>Payroll Management System</h1>
        <p class="description">
            Full Stack Payroll Management System API<br>
            Backend server for managing employee payroll, expenses, and salary slips
        </p>
        <div class="status">🟢 API Running</div>
        
        <div class="api-section">
            <h2>API Endpoints</h2>
            <div class="endpoint">
                <strong>Health Check</strong><br>
                <code>GET /api/health</code> - Check server status
            </div>
            <div class="endpoint">
                <strong>Authentication</strong><br>
                <code>POST /api/auth/signup</code> - Register new user<br>
                <code>POST /api/auth/login</code> - User login<br>
                <code>GET /api/auth/me</code> - Get current user
            </div>
            <div class="endpoint">
                <strong>Salary Slips</strong><br>
                <code>GET /api/salary-slip</code> - Get all salary slips<br>
                <code>GET /api/salary-slip/:id</code> - Get single salary slip<br>
                <code>POST /api/salary-slip</code> - Create salary slip (Admin)<br>
                <code>PUT /api/salary-slip/:id</code> - Update salary slip (Admin)<br>
                <code>GET /api/salary-slip/:id/pdf</code> - Export as PDF
            </div>
            <div class="endpoint">
                <strong>Expenses</strong><br>
                <code>GET /api/expense</code> - Get all expenses<br>
                <code>POST /api/expense</code> - Submit expense (Employee)<br>
                <code>PUT /api/expense/:id/approve</code> - Approve expense (Admin)<br>
                <code>PUT /api/expense/:id/reject</code> - Reject expense (Admin)
            </div>
            <div class="endpoint">
                <strong>Notifications</strong><br>
                <code>GET /api/notification</code> - Get all notifications<br>
                <code>PUT /api/notification/:id/read</code> - Mark as read<br>
                <code>PUT /api/notification/read-all</code> - Mark all as read<br>
                <code>GET /api/notification/unread-count</code> - Get unread count
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                <span>Made with</span>
                <span class="heart">❤️</span>
                <span>by</span>
                <strong>Manya Shukla</strong>
                <span>2025</span>
            </div>
            <div class="version">API Version 1.0.0</div>
        </div>
    </div>
</body>
</html>
  `;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

