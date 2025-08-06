# 🎖️ NCC Attendance Management System

A comprehensive web application for managing NCC (National Cadet Corps) student attendance, built with modern technologies and enhanced security features.

## ✨ Features

### 🏢 Branch Management
- **8 Engineering Branches Support**:
  - Computer Science & Engineering (CSE)
  - CSE – Artificial Intelligence & Machine Learning (AIML)
  - CSE – Data Science (CS DS)
  - Electronics & Communication Engineering (ECE)
  - Information Technology (IT)
  - Electrical & Electronics Engineering (EEE)
  - Mechanical Engineering (ME)
  - Civil Engineering (CE)

### 🔒 Secure Admin Management
- **Environment-based Credentials**: Admin credentials stored in environment variables
- **Database-only Access**: No hardcoded credentials in source code
- **Three Admin Levels**: Super Admin, Admin, and Read-only access
- **GitHub-safe**: Secure for public repository deployment

### 📧 Automated Email Reports
- **Weekly Attendance Reports**: Automatically generated every Monday at 9:00 AM
- **Branch-wise Distribution**: Reports sent to respective department emails
- **Professional HTML Templates**: Beautiful, responsive email designs
- **Detailed Analytics**: Include attendance statistics and performance metrics
- **JSON Attachments**: Raw data included for further analysis

### 📊 Advanced Filtering & Search
- **Multi-level Filtering**: By category, branch, and search terms
- **Real-time Search**: Instant search across student names, regimental numbers, and ranks
- **Branch-specific Reports**: Generate reports filtered by engineering branches
- **Export Functionality**: Excel export with filtering support

### 👥 Student Management
- **Complete Student Profiles**: Name, regimental number, category, branch, rank, contact details
- **Bulk Upload**: Excel file import for mass student registration
- **Attendance Tracking**: Real-time attendance rate calculation
- **Branch Association**: Students linked to their engineering departments

### 📈 Dashboard & Analytics
- **Branch-wise Statistics**: Visual breakdown of student distribution
- **Attendance Metrics**: Average attendance rates per branch
- **Recent Activity**: Latest parades and attendance records
- **Performance Insights**: Identify high and low-performing branches

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcryptjs** for password hashing
- **nodemailer** for email functionality
- **node-cron** for scheduled tasks
- **multer** for file uploads
- **XLSX** for Excel processing

### Frontend
- **React.js 19.1.0** with modern hooks
- **Vite** development server
- **Tailwind CSS** for responsive design
- **React Router DOM** for navigation
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Gmail account for email functionality (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NCC_Attendance
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables in .env
   npm run seed  # Seed the database
   npm start     # Start backend server
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev   # Start development server
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_secure_jwt_secret

# Admin Credentials (Keep Secure)
ADMIN_1_USERNAME=admin1
ADMIN_1_PASSWORD=secure_password
ADMIN_1_EMAIL=admin1@example.com
ADMIN_1_FULLNAME=Chief Administrator

ADMIN_2_USERNAME=admin2
ADMIN_2_PASSWORD=secure_password
ADMIN_2_EMAIL=admin2@example.com
ADMIN_2_FULLNAME=Senior Officer

ADMIN_3_USERNAME=admin3
ADMIN_3_PASSWORD=secure_password
ADMIN_3_EMAIL=admin3@example.com
ADMIN_3_FULLNAME=Junior Officer

# Email Configuration (Optional - for weekly reports)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@example.com

# Department Emails
CSE_DEPT_EMAIL=cse@college.edu
AIML_DEPT_EMAIL=aiml@college.edu
CSDS_DEPT_EMAIL=csds@college.edu
ECE_DEPT_EMAIL=ece@college.edu
IT_DEPT_EMAIL=it@college.edu
EEE_DEPT_EMAIL=eee@college.edu
ME_DEPT_EMAIL=me@college.edu
CE_DEPT_EMAIL=ce@college.edu

# Scheduler (Enable for automatic weekly reports)
ENABLE_SCHEDULER=true
```

### Email Setup (Optional)

For weekly attendance reports:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**: Google Account > Security > 2-Step Verification > App passwords
3. **Configure Environment Variables**: Set `EMAIL_USER` and `EMAIL_PASSWORD`
4. **Set Department Emails**: Configure recipient emails for each branch

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Students
- `GET /api/students` - Get all students (with filtering)
- `GET /api/students/filters/branches` - Get available branches
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/upload` - Upload Excel file

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/attendance` - Attendance reports (with branch filtering)
- `GET /api/reports/student-stats` - Student statistics (with branch filtering)

### Email Reports (Super Admin Only)
- `POST /api/email/weekly/:branch` - Send weekly report for specific branch
- `POST /api/email/weekly/all` - Send weekly reports for all branches
- `POST /api/email/test` - Test email configuration
- `GET /api/email/branches` - Get available branches

## 🔐 Security Features

### Admin Credential Security
- **Environment Variables**: All sensitive data in `.env` files
- **Database Storage**: Admin credentials stored securely in MongoDB
- **No Hardcoded Secrets**: Source code free of sensitive information
- **GitHub Safe**: Repository can be safely made public

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-based Access**: Different permission levels
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Server-side validation for all inputs

### Data Protection
- **CORS Configuration**: Restricted cross-origin requests
- **Environment Isolation**: Separate configs for development/production
- **Secure Headers**: Protection against common vulnerabilities

## 📧 Email Reports

### Automatic Weekly Reports
- **Schedule**: Every Monday at 9:00 AM
- **Content**: Detailed attendance statistics per branch
- **Recipients**: Department-specific email addresses
- **Format**: Professional HTML templates with JSON attachments

### Manual Reports
- **Super Admin Access**: Manual trigger for individual branches
- **Test Functionality**: Email configuration testing
- **Custom Recipients**: Flexible email distribution

### Report Contents
- **Student Roster**: Complete list with attendance stats
- **Performance Metrics**: Attendance rates and trends
- **Summary Statistics**: Total students, parades, averages
- **Data Export**: JSON attachment for further analysis

## 🎨 User Interface

### Responsive Design
- **Mobile-first**: Optimized for all device sizes
- **Modern UI**: Clean, professional interface
- **Interactive Elements**: Smooth animations and transitions
- **Accessibility**: WCAG compliant design

### Branch Management UI
- **Filter Dropdowns**: Easy branch selection
- **Visual Indicators**: Branch-wise color coding
- **Search Integration**: Multi-field search functionality
- **Export Options**: Branch-filtered exports

## 📊 Database Schema

### Student Model
```javascript
{
  name: String (required),
  regimentalNumber: String (required, unique),
  category: Enum ['C', 'B2', 'B1'] (required),
  branch: Enum [8 engineering branches] (required),
  rank: String (required),
  email: String,
  phone: String,
  address: String,
  dateOfBirth: Date,
  enrollmentDate: Date,
  attendanceRate: Number,
  isActive: Boolean
}
```

### User Model (Admin)
```javascript
{
  username: String (required, unique),
  password: String (required, hashed),
  fullName: String (required),
  email: String (required),
  role: String (default: 'admin'),
  accessLevel: Enum ['super_admin', 'admin', 'read_only'],
  isAuthorized: Boolean
}
```

## 🚀 Deployment

### Production Checklist
1. **Environment Variables**: Configure all required variables
2. **Database**: Set up MongoDB Atlas or production database
3. **Email Service**: Configure SMTP credentials
4. **Security**: Enable HTTPS and secure headers
5. **Monitoring**: Set up logging and error tracking

### Default Admin Credentials (Change in Production)
- **Username**: Use environment variables for security
- **Access**: Configure admin credentials through `.env` file
- **Security**: Never commit actual credentials to repository

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

### Recent Changes (Latest Version)
- ✅ **Branch Management**: Added 8 engineering branches support
- ✅ **Secure Credentials**: Environment-based admin authentication
- ✅ **Email Reports**: Automated weekly attendance reports
- ✅ **Advanced Filtering**: Multi-level search and filter options
- ✅ **UI Enhancements**: Responsive design with branch integration
- ✅ **Security Improvements**: GitHub-safe credential handling

---

**Built with ❤️ for NCC Management**
