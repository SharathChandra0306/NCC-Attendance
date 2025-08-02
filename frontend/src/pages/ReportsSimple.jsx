import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award, 
  Clock, 
  UserCheck, 
  UserX,
  AlertTriangle,
  Download,
  Filter,
  PieChart
} from 'lucide-react';
import { reportsAPI, paradesAPI, studentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ReportsSimple = () => {
  const [parades, setParades] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching all data...');
        
        // Fetch parades, students, and attendance data
        const [paradesResponse, studentsResponse] = await Promise.all([
          paradesAPI.getAll(),
          studentsAPI.getAll()
        ]);

        console.log('Parades response:', paradesResponse.data);
        console.log('Students response:', studentsResponse.data);
        
        setParades(paradesResponse.data);
        setStudents(studentsResponse.data);
        
        // Try to fetch attendance data from reports API
        try {
          const reportsResponse = await reportsAPI.getAttendanceReport();
          setAttendanceData(reportsResponse.data);
        } catch (reportError) {
          console.log('Reports API not available, using basic data:', reportError);
          setAttendanceData([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
        toast.error('Failed to fetch data: ' + error.message);
      }
    };

    fetchData();
  }, []);

  // Calculate analytics
  const calculateAnalytics = () => {
    const filteredStudents = selectedCategory === 'All' 
      ? students 
      : students.filter(student => student.category === selectedCategory);

    const categoryStats = students.reduce((acc, student) => {
      acc[student.category] = (acc[student.category] || 0) + 1;
      return acc;
    }, {});

    const rankStats = students.reduce((acc, student) => {
      acc[student.rank] = (acc[student.rank] || 0) + 1;
      return acc;
    }, {});

    const recentParades = parades
      .filter(parade => {
        const daysAgo = parseInt(selectedTimeRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        return new Date(parade.date) >= cutoffDate;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      totalStudents: students.length,
      totalParades: parades.length,
      recentParades: recentParades.length,
      filteredStudents: filteredStudents.length,
      categoryStats,
      rankStats,
      activeStudents: students.filter(s => s.isActive).length,
      inactiveStudents: students.filter(s => !s.isActive).length,
      averageAttendanceRate: students.length > 0 
        ? (students.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / students.length).toFixed(1)
        : 0
    };
  };

  const analytics = calculateAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-80 bg-white rounded-2xl shadow-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-600">Loading Advanced Analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">Error Loading Reports</div>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Reports & Analytics
                </h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium">Comprehensive NCC Management Dashboard</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Categories</option>
                  <option value="C">Category C</option>
                  <option value="B2">Category B2</option>
                  <option value="B1">Category B1</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              
              <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalStudents}</p>
                <p className="text-sm text-green-600 mt-1">
                  <span className="inline-flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Active: {analytics.activeStudents}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Parades */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Parades</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalParades}</p>
                <p className="text-sm text-blue-600 mt-1">
                  <span className="inline-flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Recent: {analytics.recentParades}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Average Attendance */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Avg. Attendance</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.averageAttendanceRate}%</p>
                <p className="text-sm text-purple-600 mt-1">
                  <span className="inline-flex items-center">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Overall rate
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Inactive Students */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Inactive Students</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.inactiveStudents}</p>
                <p className="text-sm text-red-600 mt-1">
                  <span className="inline-flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Needs attention
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Category Distribution</h3>
              <PieChart className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {Object.entries(analytics.categoryStats).map(([category, count]) => {
                const percentage = ((count / analytics.totalStudents) * 100).toFixed(1);
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        category === 'C' ? 'bg-blue-500' :
                        category === 'B2' ? 'bg-green-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="font-medium text-gray-700">Category {category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rank Distribution */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Rank Distribution</h3>
              <Award className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(analytics.rankStats)
                .sort(([,a], [,b]) => b - a)
                .map(([rank, count]) => {
                  const percentage = ((count / analytics.totalStudents) * 100).toFixed(1);
                  return (
                    <div key={rank} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                        <span className="font-medium text-gray-700">{rank}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Recent Parades */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Parades</h3>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parades.slice(0, 10).map((parade) => (
                  <tr key={parade._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{parade.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(parade.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {parade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parade.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        new Date(parade.date) > new Date() 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {new Date(parade.date) > new Date() ? 'Upcoming' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parades.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No parades found</p>
            </div>
          )}
        </div>

        {/* Student Status Summary */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Student Status Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{analytics.activeStudents}</p>
              <p className="text-sm text-green-600">Active Students</p>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{analytics.inactiveStudents}</p>
              <p className="text-sm text-red-600">Inactive Students</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{analytics.totalStudents}</p>
              <p className="text-sm text-blue-600">Total Registered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSimple;
