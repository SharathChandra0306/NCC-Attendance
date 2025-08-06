# 🚀 NCC Attendance System - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

✅ All code committed and pushed to GitHub  
✅ Backend Vercel configuration created  
✅ Frontend environment variables setup  
✅ Production CORS configuration enabled  
✅ Database seeded with current data  

## 🔧 Backend Deployment (Vercel)

### 1. Deploy Backend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

### 2. Set Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```bash
# Database
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
NODE_ENV=production

# Frontend URL (will be your frontend Vercel URL)
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Admin Credentials
ADMIN_1_USERNAME=admin1
ADMIN_1_PASSWORD=secure_password_1
ADMIN_1_EMAIL=admin1@example.com
ADMIN_1_FULLNAME=Chief Administrator

ADMIN_2_USERNAME=admin2  
ADMIN_2_PASSWORD=secure_password_2
ADMIN_2_EMAIL=admin2@example.com
ADMIN_2_FULLNAME=Senior Officer

ADMIN_3_USERNAME=admin3
ADMIN_3_PASSWORD=secure_password_3
ADMIN_3_EMAIL=admin3@example.com
ADMIN_3_FULLNAME=Junior Officer

# Email Configuration (Optional - for weekly reports)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@example.com

# Department Emails (Optional)
CSE_DEPT_EMAIL=cse@college.edu
AIML_DEPT_EMAIL=aiml@college.edu
# ... add other department emails as needed

# Scheduler (Optional)
ENABLE_SCHEDULER=false
```

### 3. Deploy Backend
- Click "Deploy" in Vercel
- Wait for deployment to complete
- Note your backend URL: `https://your-backend-name.vercel.app`

## 🌐 Frontend Deployment (Vercel)

### 1. Create Frontend Environment File
Create `.env` in the frontend directory:

```bash
VITE_API_BASE_URL=https://your-backend-name.vercel.app/api
```

### 2. Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository (or add as a second project)
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Set Frontend Environment Variables
In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```bash
VITE_API_BASE_URL=https://your-backend-name.vercel.app/api
```

### 4. Deploy Frontend
- Click "Deploy"
- Wait for deployment to complete
- Your frontend will be available at: `https://your-frontend-name.vercel.app`

## 🔄 Update Backend with Frontend URL

1. Go to Backend Vercel Project → Settings → Environment Variables
2. Update `FRONTEND_URL` with your actual frontend URL:
   ```bash
   FRONTEND_URL=https://your-frontend-name.vercel.app
   ```
3. Redeploy the backend (Dashboard → Deployments → click "..." → Redeploy)

## 🧪 Testing the Deployment

### 1. Test Backend Health
Visit: `https://your-backend-name.vercel.app/api/health`
Should return: `{"message": "NCC Management System API is running!"}`

### 2. Test Frontend Connection
1. Visit your frontend URL
2. Try logging in with admin credentials
3. Test all features:
   - ✅ Student management
   - ✅ Parade creation
   - ✅ Attendance marking
   - ✅ Reports and analytics
   - ✅ CSV export

## 🔒 Security Notes

### Production Security Checklist:
- ✅ Strong JWT secret (32+ characters)
- ✅ Secure admin passwords
- ✅ MongoDB Atlas with IP whitelist
- ✅ CORS properly configured
- ✅ Environment variables secured in Vercel

### Default Admin Login:
- **Username**: `admin2`
- **Password**: `ncc2024` (Change this in production!)

## 📊 Features Available

### ✨ Enhanced Features:
- **Responsive Design**: Works on all devices
- **Branch Filtering**: Filter by engineering branch
- **Auto-save**: Attendance saves automatically
- **CSV Export**: Download filtered reports
- **Email Reports**: Weekly automated reports (optional)
- **Real-time Analytics**: Live dashboard updates

### 🔧 Admin Features:
- Complete student management
- Parade scheduling and management
- Attendance tracking with filters
- Advanced reporting and analytics
- Data export capabilities

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure FRONTEND_URL matches your actual frontend domain
   - Check that both URLs are correctly set in environment variables

2. **Database Connection**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist includes `0.0.0.0/0` for Vercel

3. **Environment Variables**:
   - Ensure all required variables are set in both projects
   - Check for typos in variable names

4. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are properly installed

## 📱 Usage Instructions

### For Students:
- View attendance records
- Check parade schedules
- Monitor attendance percentage

### For Administrators:
1. **Login** with provided credentials
2. **Manage Students**: Add, edit, filter by branch/category
3. **Create Parades**: Schedule weekly/special parades
4. **Mark Attendance**: Use filters, bulk actions, auto-save
5. **Generate Reports**: View analytics, export CSV files

## 🔮 Future Enhancements

- [ ] Mobile app integration
- [ ] QR code attendance marking
- [ ] Advanced analytics dashboard
- [ ] Multi-role permission system
- [ ] Automated SMS notifications

---

## 🎉 Deployment Complete!

Your NCC Attendance Management System is now live and ready for use!

**Frontend**: `https://your-frontend-name.vercel.app`  
**Backend**: `https://your-backend-name.vercel.app`

Remember to:
1. Change default passwords
2. Configure email settings if needed
3. Set up department email addresses
4. Train users on the new system

For support or issues, check the troubleshooting section above.
