import React, { useState, useEffect } from 'react';
import { CheckSquare, Users, Calendar, Save, Check, X, Clock, Filter } from 'lucide-react';
import { attendanceAPI, paradesAPI, studentsAPI } from '../services/api';
import toast from 'react-hot-toast';
// import { format } from 'date-fns';

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
        remarks
      }
    }));

    // Auto-save to backend
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

  const markAllAttendance = async (status) => {
    const studentsToUpdate = filteredStudents;
    const newAttendanceData = {};
    
    studentsToUpdate.forEach(student => {
      newAttendanceData[student._id] = {
        ...attendanceData[student._id],
        status
      };
    });
    
    setAttendanceData(prev => ({ ...prev, ...newAttendanceData }));

    // Auto-save all changes
    if (!selectedParade) return;

    try {
      const attendanceDataArray = studentsToUpdate.map(student => ({
        studentId: student._id,
        status,
        remarks: attendanceData[student._id]?.remarks || ''
      }));

      await attendanceAPI.markMultiple({
        paradeId: selectedParade,
        attendanceData: attendanceDataArray
      });

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
              {['All', 'C', 'B2', 'B1'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'All' ? 'All Categories' : `Category ${category}`}
                  {category !== 'All' && (
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

          {/* Quick Actions */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => markAllAttendance('Present')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAllAttendance('Absent')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Mark All Absent
              </button>
              <button
                onClick={() => markAllAttendance('Late')}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Mark All Late
              </button>
              <button
                onClick={() => markAllAttendance('Excused')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Mark All Excused
              </button>
            </div>
          </div>

          {/* Attendance Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Student Attendance
                  {selectedCategory !== 'All' && (
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      (Category {selectedCategory})
                    </span>
                  )}
                </h3>
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {selectedCategory === 'All' 
                        ? 'No students found' 
                        : `No students found in Category ${selectedCategory}`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map(student => (
                      <AttendanceCard
                        key={student._id}
                        student={student}
                        attendance={attendanceData[student._id]}
                        onStatusChange={(status) => handleAttendanceChange(student._id, status)}
                        onRemarksChange={(remarks) => handleRemarksChange(student._id, remarks)}
                        autoSaving={autoSaving[student._id]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const AttendanceCard = ({ student, attendance, onStatusChange, onRemarksChange, autoSaving }) => {
  const status = attendance?.status || 'Absent';
  const remarks = attendance?.remarks || '';

  const getCardBorderColor = () => {
    switch (status) {
      case 'Present': return 'border-green-400 bg-green-50';
      case 'Absent': return 'border-red-400 bg-red-50';
      case 'Late': return 'border-yellow-400 bg-yellow-50';
      case 'Excused': return 'border-blue-400 bg-blue-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-colors duration-200 ${getCardBorderColor()}`}>
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-900">{student.name}</h4>
            <p className="text-sm text-gray-600">{student.rollNumber}</p>
            <p className="text-sm text-gray-600">{student.company} Company</p>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              Category {student.category}
            </span>
          </div>
          {autoSaving && (
            <div className="flex items-center text-xs text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
              Saving...
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {['Present', 'Absent', 'Late', 'Excused'].map(statusOption => (
              <button
                key={statusOption}
                onClick={() => onStatusChange(statusOption)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                  status === statusOption
                    ? statusOption === 'Present' ? 'bg-green-600 text-white' :
                      statusOption === 'Absent' ? 'bg-red-600 text-white' :
                      statusOption === 'Late' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statusOption}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            placeholder="Optional remarks..."
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default Attendance;
