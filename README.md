# NCC Attendance Management System

A comprehensive attendance management system for National Cadet Corps (NCC) built with React.js frontend and Node.js backend.

## Features

- **Admin Dashboard**: Complete overview of attendance statistics
- **Cadet Management**: Add, edit, and manage cadet information
- **Attendance Tracking**: Mark and track daily attendance
- **Bulk Operations**: Import cadets via Excel and export attendance reports
- **Real-time Updates**: Live attendance statistics and notifications
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React.js 19.1.0
- React Router DOM for navigation
- Tailwind CSS for styling
- Lucide React for icons
- React Hook Form for form handling
- React Hot Toast for notifications
- Axios for API calls
- XLSX for Excel operations

### Backend
- Node.js with Express.js
- JWT for authentication
- CORS for cross-origin requests
- Body-parser for request parsing

## Project Structure

```
NCC_Attendance/
├── frontend/           # React.js frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   ├── services/   # API services
│   │   └── App.jsx     # Main app component
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies
├── backend/            # Node.js backend API
│   ├── routes/         # API route handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Data models
│   └── server.js       # Main server file
└── README.md          # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ncc-attendance.git
cd ncc-attendance
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Create environment files:
```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000/api

# Backend (.env)
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
```

5. Start the development servers:

Frontend (in frontend directory):
```bash
npm run dev
```

Backend (in backend directory):
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Deployment

### Vercel Deployment

1. Deploy backend:
```bash
cd backend
vercel
```

2. Deploy frontend:
```bash
cd frontend
vercel
```

3. Update environment variables in Vercel dashboard with production URLs.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries or support, please contact:
- Email: your-email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

## Acknowledgments

- National Cadet Corps for the inspiration
- React.js and Node.js communities for excellent documentation
- All contributors who helped in developing this system
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
- **Data Validation** - Comprehensive input validation and error handling

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing
- **TailwindCSS 4** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Toast notifications
- **Lucide React** - Modern icon library
- **XLSX** - Excel file processing
- **Date-fns** - Date manipulation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📦 Project Structure

```
ncc/
├── backend/
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Parade.js
│   │   └── Attendance.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── parades.js
│   │   ├── attendance.js
│   │   └── reports.js
│   ├── seedData.js       # Sample data generator
│   ├── server.js         # Main server file
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── contexts/     # React contexts
    │   ├── pages/        # Main application pages
    │   ├── services/     # API service layer
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ncc
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory with your database and authentication configuration.

5. **Database Setup**
   
   Make sure MongoDB is running, then seed the database with sample data:
   ```bash
   cd backend
   npm run seed
   ```

6. **Start the Application**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

##  API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students` - Get all students (with filters)
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/upload` - Bulk upload via Excel

### Parades
- `GET /api/parades` - Get all parades
- `POST /api/parades` - Create new parade
- `PUT /api/parades/:id` - Update parade
- `DELETE /api/parades/:id` - Delete parade

### Attendance
- `GET /api/attendance/parade/:paradeId` - Get attendance for parade
- `POST /api/attendance` - Mark individual attendance
- `POST /api/attendance/mark` - Mark multiple attendance

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/export/attendance` - Export attendance CSV

## 🎨 Features Overview

### Dashboard
- Real-time statistics (total students, parades, attendance rates)
- Recent activities and parade information
- Quick action buttons for common tasks

### Student Management
- Add students manually or via Excel upload
- Search and filter by company, year, name, or roll number
- Individual attendance rate tracking
- Edit and delete student records

### Parade Management
- Create different types of parades (Morning, Evening, Special Drill, etc.)
- Schedule parades with date, time, and location
- Track parade status (Upcoming, Ongoing, Completed)
- View detailed parade information

### Attendance System
- Select parade and mark attendance for all students
- Individual status options (Present, Absent, Late, Excused)
- Bulk attendance marking (Mark All Present/Absent)
- Real-time attendance statistics
- Optional remarks for each student

### Reports & Analytics
- Comprehensive attendance reports with filters
- Parade-wise attendance statistics
- Student performance rankings
- Export functionality for data analysis
- Visual progress indicators and charts

## 🔧 Excel Upload Format

For bulk student import, use an Excel file with these columns:
- **Name** - Student full name
- **Roll Number** - Unique student identifier
- **Company** - Alpha/Beta/Charlie/Delta
- **Year** - 1/2/3/4
- **Email** - Student email (optional)
- **Phone** - Contact number (optional)

## 🎯 NCC Companies

The system supports four standard NCC companies:
- **Alpha Company**
- **Beta Company** 
- **Charlie Company**
- **Delta Company**

## 📊 Parade Types

Available parade types:
- Morning Parade
- Evening Parade
- Special Drill
- Physical Training
- Weapon Training
- Ceremonial Parade
- Camp Activity
- Other

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🎨 Design System

The application uses a professional color scheme inspired by NCC branding:
- **Primary:** Navy Blue (#1e3a8a)
- **Secondary:** Blue (#3b82f6)
- **Accent:** Gold (#fbbf24)
- **Success:** Green (#10b981)
- **Warning:** Yellow (#f59e0b)
- **Error:** Red (#ef4444)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

### Backend Deployment (Heroku/Railway)
1. Set up MongoDB Atlas for production database
2. Configure environment variables
3. Deploy using Git or Docker

### Environment Variables for Production
Configure your production environment variables as needed for your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- National Cadet Corps (NCC) for inspiration
- React and Express.js communities
- TailwindCSS for the excellent utility framework
- MongoDB for the flexible database solution

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for the National Cadet Corps community**
# NCC-Attendance
