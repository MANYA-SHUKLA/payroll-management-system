# Payroll Management System

A full-stack payroll management system built with Next.js, Node.js, Express, and MongoDB. This system provides role-based access control for Admin and Employee users, with features for managing salary slips, expenses, and notifications.

## 🚀 Features

### Authentication
- User signup and login with role-based access (Admin/Employee)
- JWT-based authentication
- Protected routes

### Admin Features
- Create and update salary slips for employees
- Approve/reject employee expense submissions
- View all salary slips and expenses
- Export salary slips as PDF

### Employee Features
- View own salary slips
- Submit monthly expenses
- View expense history and status
- Export salary slips as PDF

### Dashboard
- Interactive charts for salary and expense history
- Tables displaying salary slips and expenses
- Real-time notifications
- Responsive design

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS 4** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **PDFKit** - PDF generation
- **express-validator** - Request validation

### Why This Tech Stack?

1. **Next.js**: 
   - Server-side rendering for better performance
   - Built-in routing and API routes
   - Excellent developer experience
   - Optimized for production

2. **TailwindCSS**: 
   - Rapid UI development
   - Responsive design utilities
   - Consistent design system
   - Small bundle size with purging

3. **MongoDB**: 
   - Flexible schema for evolving requirements
   - Easy to scale
   - Good for document-based data (salary slips, expenses)
   - Fast development iteration

4. **Express.js**: 
   - Minimal and flexible
   - Large ecosystem
   - Easy middleware integration
   - RESTful API design

5. **JWT**: 
   - Stateless authentication
   - Scalable across multiple servers
   - Secure token-based auth

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher) - Make sure MongoDB is running locally or use MongoDB Atlas
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd payroll-management-system
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure environment variables

#### Server Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/payroll_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

#### Client Configuration

Create a `.env.local` file in the `client` directory:

```bash
cd client
cp .env.local.example .env.local
```

Edit `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 4. Seed the database

```bash
cd server
npm run seed
```

This will create:
- Admin user: `hire-me@anshumat.org` / `HireMe@2025!`
- Employee user: `john.doe@example.com` / `password123`
- Sample salary slips and expenses

### 5. Start the development servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 6. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Salary Slips
- `GET /api/salary-slip` - Get salary slips (all for admin, own for employee)
- `GET /api/salary-slip/:id` - Get single salary slip
- `POST /api/salary-slip` - Create salary slip (Admin only)
- `PUT /api/salary-slip/:id` - Update salary slip (Admin only)
- `GET /api/salary-slip/:id/pdf` - Export salary slip as PDF

### Expenses
- `GET /api/expense` - Get expenses (all for admin, own for employee)
- `POST /api/expense` - Submit expense (Employee only)
- `PUT /api/expense/:id/approve` - Approve expense (Admin only)
- `PUT /api/expense/:id/reject` - Reject expense (Admin only)

### Notifications
- `GET /api/notification` - Get all notifications
- `PUT /api/notification/:id/read` - Mark notification as read
- `PUT /api/notification/read-all` - Mark all as read
- `GET /api/notification/unread-count` - Get unread count

## 🎯 Demo Credentials

### Admin
- **Email**: `hire-me@anshumat.org`
- **Password**: `HireMe@2025!`

### Employee
- **Email**: `john.doe@example.com`
- **Password**: `password123`

## 📁 Project Structure

```
payroll-management-system/
├── server/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── scripts/         # Seed script
│   ├── index.js         # Server entry point
│   └── package.json
├── client/
│   ├── app/              # Next.js app directory
│   │   ├── dashboard/    # Dashboard page
│   │   ├── admin/        # Admin panel
│   │   ├── expenses/     # Expense submission
│   │   ├── login/        # Login page
│   │   └── signup/       # Signup page
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities and API
│   └── package.json
└── README.md
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation with express-validator
- Protected API routes

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Clean and modern interface
- Interactive charts and visualizations
- Real-time notifications
- Loading states and error handling
- Intuitive navigation

## 🚀 Production Deployment

### Environment Variables

Make sure to set proper environment variables in production:

- Use a strong `JWT_SECRET`
- Set `NODE_ENV=production`
- Use a production MongoDB URI (MongoDB Atlas recommended)
- Configure proper CORS settings

### Build Commands

```bash
# Build frontend
cd client
npm run build

# Start production server
cd server
npm start
```

## 📊 Database Schema

### User
- name, email, password, role (admin/employee)

### SalarySlip
- employeeId, month, basicSalary, allowances, deductions, netSalary

### Expense
- employeeId, month, category, description, amount, status, reviewedBy

### Notification
- userId, type, title, message, read, link

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is created as a developer internship assignment.

## 👤 Author

Created as part of a full-stack developer internship assignment. by MANYA SHUKLA

---

**Note**: This is a complete MVP implementation with all required features. The system is ready for demonstration and further development.

