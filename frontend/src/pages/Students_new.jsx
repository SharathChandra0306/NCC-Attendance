import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Upload, Trash2, Edit } from 'lucide-react';
import { studentsAPI } from '../services/api';
import toast from 'react-hot-toast';    
import * as XLSX from 'xlsx';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;

      const response = await studentsAPI.getAll(params);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (studentData) => {
    try {
      await studentsAPI.create(studentData);
      toast.success('Student added successfully');
      fetchStudents();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add student');
    }
  };

  const handleUpdateStudent = async (id, studentData) => {
    try {
      await studentsAPI.update(id, studentData);
      toast.success('Student updated successfully');
      fetchStudents();
      setEditingStudent(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await studentsAPI.delete(id);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('excel', file);

      const response = await studentsAPI.uploadExcel(formData);
      const { added, duplicates, errors } = response.data;
      
      let message = `Upload completed! Added: ${added} students`;
      if (duplicates > 0) message += `, Duplicates skipped: ${duplicates}`;
      if (errors.length > 0) message += `, Errors: ${errors.length}`;
      
      toast.success(message);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to upload Excel file');
    }
    
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-6 sm:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Students
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base font-medium">Manage NCC cadets and their information</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base font-medium">
                <Upload className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Upload Excel</span>
                <span className="sm:hidden">Excel</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Search & Filter</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors duration-200"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors duration-200"
            >
              <option value="">All Categories</option>
              <option value="C">C Category</option>
              <option value="B2">B2 Category</option>
              <option value="B1">B1 Category</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="p-4 space-y-4">
              {students.map((student, index) => (
                <div key={student._id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                          {student.regimentalNumber}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mt-2">{student.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">{student.rank}</p>
                      {student.email && <p className="text-sm text-gray-500">{student.email}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Category</span>
                      <p className="text-sm text-gray-900">{student.category}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Phone</span>
                      <p className="text-sm text-gray-900">{student.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">Address</span>
                    <p className="text-sm text-gray-900">{student.address}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">Attendance Rate</span>
                    <div className="flex items-center mt-1">
                      <div className="text-sm text-gray-900 w-12">{student.attendanceRate?.toFixed(1) || 0}%</div>
                      <div className="flex-1 ml-2 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (student.attendanceRate || 0) >= 80 ? 'bg-green-500' :
                            (student.attendanceRate || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${student.attendanceRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">S.No</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden md:table-cell">Regimental Number</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden lg:table-cell">Rank</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden xl:table-cell">Address</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Attendance</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500 md:hidden">{student.regimentalNumber}</div>
                      <div className="text-xs text-gray-500 lg:hidden">{student.rank}</div>
                      {student.email && <div className="text-xs text-gray-400 truncate max-w-32">{student.email}</div>}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">{student.regimentalNumber}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.category}</div>
                      <div className="text-xs text-gray-500 xl:hidden truncate max-w-24">{student.address}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                      {student.rank}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden xl:table-cell">
                      <div className="truncate max-w-48">{student.address}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">{(student.attendanceRate || 0).toFixed(1)}%</div>
                        <div className="ml-2 w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              (student.attendanceRate || 0) >= 80 ? 'bg-green-500' :
                              (student.attendanceRate || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendanceRate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {students.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>

        {/* Add/Edit Student Modal */}
        {(showAddModal || editingStudent) && (
          <StudentModal
            student={editingStudent}
            onClose={() => {
              setShowAddModal(false);
              setEditingStudent(null);
            }}
            onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
          />
        )}
      </div>
    </div>
  );
};

const StudentModal = ({ student, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    regimentalNumber: student?.regimentalNumber || '',
    category: student?.category || '',
    rank: student?.rank || '',
    email: student?.email || '',
    phone: student?.phone || '',
    address: student?.address || '',
    dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (student) {
      onSubmit(student._id, formData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regimental Number</label>
              <input
                type="text"
                required
                value={formData.regimentalNumber}
                onChange={(e) => setFormData({ ...formData, regimentalNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Category</option>
                  <option value="C">C</option>
                  <option value="B2">B2</option>
                  <option value="B1">B1</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
                <input
                  type="text"
                  required
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 order-1 sm:order-2"
              >
                {student ? 'Update' : 'Add'} Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Students;
