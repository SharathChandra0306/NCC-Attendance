import React, { useState, useEffect, useCallback } from 'react';
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
  PieChart,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { reportsAPI, paradesAPI, studentsAPI, attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const ReportsSimple = () => {
  const [parades, setParades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedParade, setSelectedParade] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [expandedParade, setExpandedParade] = useState(null);

  const branches = [
    'All',
    'Computer Science & Engineering (CSE)',
    'CSE – Artificial Intelligence & Machine Learning (AIML)',
    'CSE – Data Science (CS DS)',
    'Electronics & Communication Engineering (ECE)',
    'Information Technology (IT)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering (ME)',
    'Civil Engineering (CE)'
  ];

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
          await reportsAPI.getAttendanceReport();
          // Reports API data could be used here if needed
        } catch (reportError) {
          console.log('Reports API not available, using basic data:', reportError);
          // Continue with basic data
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
    if (!students || !Array.isArray(students)) {
      return {
        totalStudents: 0,
        filteredStudents: 0,
        totalParades: parades ? parades.length : 0,
        recentParades: 0,
        categoryStats: {},
        rankStats: {},
        branchStats: {},
        activeStudents: 0,
        inactiveStudents: 0,
        averageAttendanceRate: 0
      };
    }

    let filteredStudents = students;
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filteredStudents = filteredStudents.filter(student => student.category === selectedCategory);
    }
    
    // Apply branch filter
    if (selectedBranch !== 'All') {
      filteredStudents = filteredStudents.filter(student => student.branch === selectedBranch);
    }

    const categoryStats = filteredStudents.reduce((acc, student) => {
      acc[student.category] = (acc[student.category] || 0) + 1;
      return acc;
    }, {});

    const rankStats = filteredStudents.reduce((acc, student) => {
      acc[student.rank] = (acc[student.rank] || 0) + 1;
      return acc;
    }, {});

    const branchStats = filteredStudents.reduce((acc, student) => {
      acc[student.branch] = (acc[student.branch] || 0) + 1;
      return acc;
    }, {});

    const recentParades = (parades || [])
      .filter(parade => {
        const daysAgo = parseInt(selectedTimeRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        return new Date(parade.date) >= cutoffDate;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      totalStudents: students.length,
      filteredStudents: filteredStudents.length,
      totalParades: parades ? parades.length : 0,
      recentParades: recentParades.length,
      categoryStats,
      rankStats,
      branchStats,
      activeStudents: filteredStudents.filter(s => s.isActive).length,
      inactiveStudents: filteredStudents.filter(s => !s.isActive).length,
      averageAttendanceRate: filteredStudents.length > 0 
        ? (filteredStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / filteredStudents.length).toFixed(1)
        : 0
    };
  };

  // Function to fetch attendance details for a parade
  const fetchAttendanceDetails = useCallback(async (paradeId) => {
    setLoadingAttendance(true);
    try {
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        branch: selectedBranch !== 'All' ? selectedBranch : undefined
      };
      
      const response = await attendanceAPI.getDetailedByParade(paradeId, params);
      setAttendanceDetails(response.data);
      setSelectedParade(paradeId);
    } catch (error) {
      console.error('Error fetching attendance details:', error);
      toast.error('Failed to fetch attendance details');
    } finally {
      setLoadingAttendance(false);
    }
  }, [selectedCategory, selectedBranch]);

  // Refresh attendance details when filters change
  useEffect(() => {
    if (selectedParade && expandedParade) {
      fetchAttendanceDetails(selectedParade);
    }
  }, [selectedCategory, selectedBranch, selectedParade, expandedParade, fetchAttendanceDetails]);

  // Function to handle export
  const handleExport = async () => {
    try {
      console.log('Starting export...');
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedBranch !== 'All') params.append('branch', selectedBranch);
      if (selectedParade) params.append('paradeId', selectedParade);
      params.append('format', 'csv');
      
      console.log('Export params:', params.toString());
      
      const response = await reportsAPI.exportAttendance(params);
      console.log('Export response:', response);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report: ' + (error.response?.data?.error || error.message));
    }
  };

  // Function to handle parade expansion
  const toggleParadeExpansion = (paradeId) => {
    if (expandedParade === paradeId) {
      setExpandedParade(null);
      setAttendanceDetails(null);
      setSelectedParade(null);
    } else {
      setExpandedParade(paradeId);
      fetchAttendanceDetails(paradeId);
    }
  };

  const analytics = calculateAnalytics();

  // Get filtered parades for display
  const getFilteredParades = () => {
    if (!parades || !Array.isArray(parades)) {
      return [];
    }
    return parades
      .filter(parade => {
        const daysAgo = parseInt(selectedTimeRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        return new Date(parade.date) >= cutoffDate;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredParades = getFilteredParades();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-60 sm:h-80 bg-white rounded-xl sm:rounded-2xl shadow-xl">
            <div className="text-center px-4">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Loading Advanced Analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
            <div className="text-center">
              <div className="text-red-500 text-lg sm:text-xl mb-4">Error Loading Reports</div>
              <p className="text-gray-600 text-sm sm:text-base break-words">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  Reports & Analytics
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium truncate">Comprehensive NCC Management Dashboard</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col space-y-3 w-full lg:w-auto">
              {/* Filter Row */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 sm:w-auto min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="All">All Categories</option>
                    <option value="C">Category C</option>
                    <option value="B2">Category B2</option>
                    <option value="B1">Category B1</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="flex-1 sm:w-auto min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch}>
                        {branch === 'All' ? 'All Branches' : branch.split(' (')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Time Range and Export Row */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:items-center">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <select 
                    value={selectedTimeRange} 
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="flex-1 sm:w-auto min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleExport}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium whitespace-nowrap"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Filtered Students */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {selectedCategory === 'All' && selectedBranch === 'All' ? 'Total Students' : 'Filtered Students'}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{analytics.filteredStudents}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">
                  <span className="inline-flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Active: {analytics.activeStudents}</span>
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Parades */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Parades</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{analytics.totalParades}</p>
                <p className="text-xs sm:text-sm text-blue-600 mt-1">
                  <span className="inline-flex items-center">
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Recent: {analytics.recentParades}</span>
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Average Attendance */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Avg. Attendance</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{analytics.averageAttendanceRate}%</p>
                <p className="text-xs sm:text-sm text-purple-600 mt-1">
                  <span className="inline-flex items-center">
                    <UserCheck className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Filtered data</span>
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Inactive Students */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Inactive Students</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{analytics.inactiveStudents}</p>
                <p className="text-xs sm:text-sm text-red-600 mt-1">
                  <span className="inline-flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Needs attention</span>
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Category Distribution</h3>
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(analytics.categoryStats).map(([category, count]) => {
                const percentage = analytics.filteredStudents > 0 ? ((count / analytics.filteredStudents) * 100).toFixed(1) : 0;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ${
                        category === 'C' ? 'bg-blue-500' :
                        category === 'B2' ? 'bg-green-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base truncate">Category {category}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{count}</span>
                      <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Branch Distribution */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Branch Distribution</h3>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto">
              {Object.entries(analytics.branchStats)
                .sort(([,a], [,b]) => b - a)
                .map(([branch, count]) => {
                  const percentage = analytics.filteredStudents > 0 ? ((count / analytics.filteredStudents) * 100).toFixed(1) : 0;
                  const shortBranch = branch.split(' (')[0]; // Get short name
                  return (
                    <div key={branch} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-indigo-400 to-cyan-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium text-gray-700 text-sm sm:text-base truncate" title={branch}>{shortBranch}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{count}</span>
                        <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Rank Distribution */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Rank Distribution</h3>
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto">
              {Object.entries(analytics.rankStats)
                .sort(([,a], [,b]) => b - a)
                .map(([rank, count]) => {
                  const percentage = analytics.filteredStudents > 0 ? ((count / analytics.filteredStudents) * 100).toFixed(1) : 0;
                  return (
                    <div key={rank} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium text-gray-700 text-sm sm:text-base truncate">{rank}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{count}</span>
                        <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Recent Parades with Attendance Details */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Recent Parades & Attendance</h3>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          </div>
          
          {/* Mobile Cards View */}
          <div className="block sm:hidden space-y-3">
            {filteredParades.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No parades found for the selected time range.</p>
              </div>
            ) : (
              filteredParades.slice(0, 10).map((parade) => (
              <div key={parade._id} className="border border-gray-200 rounded-lg bg-gray-50">
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{parade.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                      new Date(parade.date) > new Date() 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {new Date(parade.date) > new Date() ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <div className="font-medium">{new Date(parade.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {parade.type}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Location:</span>
                      <div className="font-medium truncate">{parade.location || 'N/A'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleParadeExpansion(parade._id)}
                    className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 text-xs"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View Attendance</span>
                    {expandedParade === parade._id ? 
                      <ChevronUp className="h-3 w-3" /> : 
                      <ChevronDown className="h-3 w-3" />
                    }
                  </button>
                </div>
                
                {/* Attendance Details for Mobile */}
                {expandedParade === parade._id && (
                  <div className="border-t border-gray-200 p-3 bg-white">
                    {loadingAttendance ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-2">Loading attendance...</p>
                      </div>
                    ) : attendanceDetails ? (
                      <div>
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-900">{attendanceDetails.summary.present}</div>
                            <div className="text-green-600">Present</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="font-bold text-red-900">{attendanceDetails.summary.absent}</div>
                            <div className="text-red-600">Absent</div>
                          </div>
                        </div>
                        <div className="text-center text-xs text-gray-600">
                          Attendance Rate: {attendanceDetails.summary.attendanceRate}%
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center">No attendance data available</p>
                    )}
                  </div>
                )}
              </div>
            ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParades.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No parades found for the selected time range.</p>
                    </td>
                  </tr>
                ) : (
                  filteredParades.slice(0, 10).map((parade) => (
                  <React.Fragment key={parade._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-32 lg:max-w-none">{parade.name}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(parade.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {parade.type}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-24 lg:max-w-none">
                        {parade.location || 'N/A'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          new Date(parade.date) > new Date() 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {new Date(parade.date) > new Date() ? 'Upcoming' : 'Completed'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleParadeExpansion(parade._id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                          {expandedParade === parade._id ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </button>
                      </td>
                    </tr>
                    
                    {/* Attendance Details Row for Desktop */}
                    {expandedParade === parade._id && (
                      <tr>
                        <td colSpan="6" className="px-4 lg:px-6 py-4 bg-gray-50">
                          {loadingAttendance ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
                              <p className="text-sm text-gray-500 mt-2">Loading attendance details...</p>
                            </div>
                          ) : attendanceDetails ? (
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center p-3 bg-green-100 rounded-lg">
                                  <div className="text-2xl font-bold text-green-900">{attendanceDetails.summary.present}</div>
                                  <div className="text-sm text-green-600">Present</div>
                                </div>
                                <div className="text-center p-3 bg-red-100 rounded-lg">
                                  <div className="text-2xl font-bold text-red-900">{attendanceDetails.summary.absent}</div>
                                  <div className="text-sm text-red-600">Absent</div>
                                </div>
                                <div className="text-center p-3 bg-yellow-100 rounded-lg">
                                  <div className="text-2xl font-bold text-yellow-900">{attendanceDetails.summary.late}</div>
                                  <div className="text-sm text-yellow-600">Late</div>
                                </div>
                                <div className="text-center p-3 bg-blue-100 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-900">{attendanceDetails.summary.attendanceRate}%</div>
                                  <div className="text-sm text-blue-600">Attendance Rate</div>
                                </div>
                              </div>
                              
                              {/* Present Students Section */}
                              {attendanceDetails.attendance.present.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold text-green-800 mb-3">Present Students ({attendanceDetails.attendance.present.length})</h4>
                                  <div className="max-h-60 overflow-y-auto bg-green-50 rounded-lg p-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {attendanceDetails.attendance.present.map((record) => (
                                        <div key={record._id} className="bg-white p-3 rounded-lg border border-green-200">
                                          <div className="font-medium text-gray-900">{record.student.name}</div>
                                          <div className="text-sm text-gray-600">{record.student.regimentalNumber}</div>
                                          <div className="text-xs text-gray-500">
                                            {record.student.category} • {record.student.branch.split(' (')[0]}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Detailed Table for All Attendance */}
                              {attendanceDetails.attendance.all.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Complete Attendance Details</h4>
                                  <div className="max-h-60 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-white">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reg No</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {attendanceDetails.attendance.all.map((record) => (
                                          <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-sm text-gray-900">{record.student.name}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900">{record.student.regimentalNumber}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900">{record.student.category}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-32" title={record.student.branch}>
                                              {record.student.branch.split(' (')[0]}
                                            </td>
                                            <td className="px-3 py-2">
                                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                                {record.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No attendance data available</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
                )}
              </tbody>
            </table>
          </div>
          
          {parades.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-sm sm:text-base">No parades found</p>
            </div>
          )}
        </div>

        {/* Student Status Summary */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Student Status Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-green-50 rounded-lg sm:rounded-xl">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-green-900">{analytics.activeStudents}</p>
              <p className="text-xs sm:text-sm text-green-600 mt-1">Active Students</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-red-50 rounded-lg sm:rounded-xl">
              <UserX className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-red-900">{analytics.inactiveStudents}</p>
              <p className="text-xs sm:text-sm text-red-600 mt-1">Inactive Students</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-lg sm:rounded-xl sm:col-span-1 col-span-1">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{analytics.totalStudents}</p>
              <p className="text-xs sm:text-sm text-blue-600 mt-1">Total Registered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSimple;
