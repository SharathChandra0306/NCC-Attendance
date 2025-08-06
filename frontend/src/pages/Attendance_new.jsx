import React, { useState, useEffect } from 'react';
import { CheckSquare, Users, Calendar, Save, Check, X, Clock, Filter } from 'lucide-react';
import { attendanceAPI, paradesAPI, studentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [parades, setParades] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedParade, setSelectedParade] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState({});

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
    fetchParades();
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedParade) return;
      
      setLoading(true);
      try {
        const response = await attendanceAPI.getByParade(selectedParade);
        const attendanceMap = {};
        
        response.data.forEach(record => {
          attendanceMap[record.student._id] = {
            status: record.status,
            remarks: record.remarks || '',
            id: record._id
          };
        });
        
        setAttendanceData(attendanceMap);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        toast.error('Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    if (selectedParade) {
      fetchData();
    }
  }, [selectedParade]);

  useEffect(() => {
    // Filter students based on selected category and branch
    let filtered = students;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(student => student.category === selectedCategory);
    }
    
    if (selectedBranch !== 'All') {
      filtered = filtered.filter(student => student.branch === selectedBranch);
    }
    
    setFilteredStudents(filtered);
  }, [students, selectedCategory, selectedBranch]);

  const fetchParades = async () => {
    try {
      const response = await paradesAPI.getAll();
      setParades(response.data);
    } catch (error) {
      console.error('Error fetching parades:', error);
      toast.error('Failed to fetch parades');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleAttendanceChange = async (studentId, status, remarks = '') => {
    // Update local state immediately
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        remarks: remarks || attendanceData[studentId]?.remarks || ''
      }
    }));

    // Auto-save
    if (!selectedParade) return;
    
    setAutoSaving(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const attendanceRecord = {
        studentId,
        status,
        remarks: remarks || attendanceData[studentId]?.remarks || ''
      };

      await attendanceAPI.markMultiple({
        paradeId: selectedParade,
        attendanceData: [attendanceRecord]
      });

      toast.success(`${status} marked for student`, {
        duration: 2000,
        position: 'bottom-right'
      });
    } catch (error) {
      toast.error('Failed to save attendance');
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleRemarksChange = async (studentId, remarks) => {
    // Update local state immediately
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));

    // Auto-save remarks with a debounce-like effect
    if (!selectedParade) return;
    
    setAutoSaving(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const attendanceRecord = {
        studentId,
        status: attendanceData[studentId]?.status || 'Absent',
        remarks
      };

      await attendanceAPI.markMultiple({
        paradeId: selectedParade,
        attendanceData: [attendanceRecord]
      });
    } catch (error) {
      console.error('Auto-save remarks error:', error);
    } finally {
      setAutoSaving(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const handleBulkAction = async (status) => {
    if (!selectedParade || filteredStudents.length === 0) return;
    
    try {
      const attendanceRecords = filteredStudents.map(student => ({
        studentId: student._id,
        status,
        remarks: attendanceData[student._id]?.remarks || ''
      }));

      await attendanceAPI.markMultiple({
        paradeId: selectedParade,
        attendanceData: attendanceRecords
      });

      // Update local state
      const newAttendanceData = { ...attendanceData };
      filteredStudents.forEach(student => {
        newAttendanceData[student._id] = {
          ...newAttendanceData[student._id],
          status
        };
      });
      setAttendanceData(newAttendanceData);

      toast.success(`All students marked as ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save attendance');
      console.error('Bulk save error:', error);
    }
  };

  const selectedParadeInfo = parades.find(p => p._id === selectedParade);
  
  const getAttendanceStats = () => {
    if (!filteredStudents.length) return { present: 0, absent: 0, late: 0, excused: 0, notMarked: 0 };
    
    const stats = { present: 0, absent: 0, late: 0, excused: 0, notMarked: 0 };
    
    filteredStudents.forEach(student => {
      const status = attendanceData[student._id]?.status;
      if (status === 'Present') stats.present++;
      else if (status === 'Absent') stats.absent++;
      else if (status === 'Late') stats.late++;
      else if (status === 'Excused') stats.excused++;
      else stats.notMarked++;
    });
    
    return stats;
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm sm:text-base text-gray-600">Mark and manage student attendance for parades</p>
        </div>
      </div>

      {/* Parade Selection */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Parade</h3>
          <div className="text-xs sm:text-sm text-gray-500">
            ✅ Auto-save enabled - Changes saved automatically
          </div>
        </div>
        
        <select
          value={selectedParade}
          onChange={(e) => setSelectedParade(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a parade...</option>
          {parades.map(parade => (
            <option key={parade._id} value={parade._id}>
              {parade.name} - {new Date(parade.date).toLocaleDateString()} ({parade.type})
            </option>
          ))}
        </select>

        {selectedParadeInfo && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Parade Name</p>
                <p className="font-medium">{selectedParadeInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(selectedParadeInfo.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{formatTime(selectedParadeInfo.time)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{selectedParadeInfo.type}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedParade && (
        <>
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Students
              </h3>
              <div className="text-sm text-gray-500">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'C', 'B2', 'B1'].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'All' ? 'All Categories' : `Category ${category}`}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Branch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {branches.map(branch => (
                    <option key={branch} value={branch}>
                      {branch === 'All' ? 'All Branches' : branch.split(' (')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            <div className="bg-green-100 p-3 sm:p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-600">Present</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-900">{stats.present}</p>
                </div>
                <Check className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <div className="bg-red-100 p-3 sm:p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-red-600">Absent</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-900">{stats.absent}</p>
                </div>
                <X className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
            <div className="bg-yellow-100 p-3 sm:p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-yellow-600">Late</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-900">{stats.late}</p>
                </div>
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
            <div className="bg-blue-100 p-3 sm:p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-600">Excused</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-900">{stats.excused}</p>
                </div>
                <CheckSquare className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Not Marked</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.notMarked}</p>
                </div>
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBulkAction('Present')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Mark All Present</span>
              </button>
              <button
                onClick={() => handleBulkAction('Absent')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Mark All Absent</span>
              </button>
              <button
                onClick={() => handleBulkAction('Late')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>Mark All Late</span>
              </button>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Students ({filteredStudents.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading attendance data...</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredStudents.map(student => {
                  const attendance = attendanceData[student._id] || {};
                  const isAutoSaving = autoSaving[student._id];
                  
                  return (
                    <div key={student._id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Student Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-gray-900 truncate">
                                {student.name}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Reg No:</span> {student.regimentalNumber}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Category:</span> {student.category}
                                </p>
                                <p className="text-sm text-gray-600 truncate" title={student.branch}>
                                  <span className="font-medium">Branch:</span> {student.branch.split(' (')[0]}
                                </p>
                              </div>
                            </div>
                            {isAutoSaving && (
                              <div className="flex items-center text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-xs">Saving...</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Attendance Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
                          {/* Status Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {['Present', 'Absent', 'Late', 'Excused'].map(status => (
                              <button
                                key={status}
                                onClick={() => handleAttendanceChange(student._id, status)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  attendance.status === status
                                    ? status === 'Present' ? 'bg-green-600 text-white' :
                                      status === 'Absent' ? 'bg-red-600 text-white' :
                                      status === 'Late' ? 'bg-yellow-600 text-white' :
                                      'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                          
                          {/* Remarks */}
                          <div className="flex-1 min-w-0 sm:max-w-xs">
                            <input
                              type="text"
                              placeholder="Remarks (optional)"
                              value={attendance.remarks || ''}
                              onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                              className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredStudents.length === 0 && (
                  <div className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No students found matching the selected filters.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
