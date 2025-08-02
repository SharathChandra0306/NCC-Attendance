import React, { useState, useEffect } from 'react';
import { Users, Target, BarChart3, TrendingUp, Calendar, Activity } from 'lucide-react';
import { reportsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportsAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="flex items-center justify-center h-80 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Students',
      value: dashboardData?.totalStudents || 0,
      icon: Users,
      color: 'blue',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Total Parades',
      value: dashboardData?.totalParades || 0,
      icon: Target,
      color: 'green',
      change: '+3',
      changeType: 'increase'
    },
    {
      name: 'Active Students',
      value: dashboardData?.activeStudents || 0,
      icon: Activity,
      color: 'yellow',
      change: '+1',
      changeType: 'increase'
    },
    {
      name: 'Average Attendance',
      value: `${dashboardData?.averageAttendance || 0}%`,
      icon: BarChart3,
      color: 'purple',
      change: '+2.1%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm sm:text-base font-medium">Welcome to the NCC Management System</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{stat.name}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-3">{stat.value}</p>
                  <div className="flex items-center mt-3">
                    <TrendingUp className="h-4 w-4 text-emerald-500 mr-2" />
                    <span className="text-sm text-emerald-600 font-semibold">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-2 font-medium">vs last month</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl shadow-lg ${
                  stat.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                  stat.color === 'green' ? 'bg-gradient-to-r from-green-400 to-emerald-600' :
                  stat.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-orange-600' :
                  'bg-gradient-to-r from-purple-400 to-purple-600'
                }`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Parades */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Recent Parades</h3>
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData?.recentParades?.slice(0, 5).map((parade) => (
                <div key={parade._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div>
                    <p className="font-bold text-gray-900 text-base">{parade.name}</p>
                    <p className="text-sm text-gray-600 font-medium">{parade.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-semibold">
                      {format(new Date(parade.date), 'MMM dd, yyyy')}
                    </p>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                      parade.status === 'Completed' 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                        : parade.status === 'Upcoming'
                        ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    }`}>
                      {parade.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!dashboardData?.recentParades || dashboardData.recentParades.length === 0) && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No recent parades</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Recent Attendance</h3>
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData?.recentAttendance?.slice(0, 5).map((attendance) => (
                <div key={attendance._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div>
                    <p className="font-bold text-gray-900 text-base">{attendance.student.name}</p>
                    <p className="text-sm text-gray-600 font-medium">{attendance.student.rollNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                      attendance.status === 'Present'
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                        : attendance.status === 'Absent'
                        ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                        : attendance.status === 'Late'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                        : 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                    }`}>
                      {attendance.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {format(new Date(attendance.markedAt), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.recentAttendance || dashboardData.recentAttendance.length === 0) && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No recent attendance records</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => window.location.href = '/students'}
              className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <span className="font-bold text-blue-700 text-lg">Manage Students</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/parades'}
              className="flex items-center justify-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Target className="h-8 w-8 text-green-600 mr-3" />
              <span className="font-bold text-green-700 text-lg">Create Parade</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/attendance'}
              className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <span className="font-bold text-purple-700 text-lg">Mark Attendance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
