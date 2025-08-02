import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, User, Eye, Trash2, Edit } from 'lucide-react';
import { paradesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Parades = () => {
  const [parades, setParades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParade, setEditingParade] = useState(null);
  const [viewingParade, setViewingParade] = useState(null);

  useEffect(() => {
    fetchParades();
  }, []);

  const fetchParades = async () => {
    try {
      const response = await paradesAPI.getAll();
      setParades(response.data);
    } catch (error) {
      console.error('Error fetching parades:', error);
      toast.error('Failed to fetch parades');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParade = async (paradeData) => {
    try {
      await paradesAPI.create(paradeData);
      toast.success('Parade created successfully');
      fetchParades();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create parade');
    }
  };

  const handleUpdateParade = async (id, paradeData) => {
    try {
      await paradesAPI.update(id, paradeData);
      toast.success('Parade updated successfully');
      fetchParades();
      setEditingParade(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update parade');
    }
  };

  const handleDeleteParade = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parade?')) return;
    
    try {
      await paradesAPI.delete(id);
      toast.success('Parade deleted successfully');
      fetchParades();
    } catch (error) {
      console.error('Error deleting parade:', error);
      toast.error('Failed to delete parade');
    }
  };

  const paradeTypes = [
    'Morning Parade',
    'Evening Parade',
    'Special Drill',
    'Physical Training',
    'Weapon Training',
    'Ceremonial Parade',
    'Camp Activity',
    'Other'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Parades</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage NCC parades and activities</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Parade
        </button>
      </div>

      {/* Parades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parades.map((parade) => (
          <div key={parade._id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{parade.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  parade.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  parade.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                  parade.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {parade.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(parade.date), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(parade.time)}
                </div>
                {parade.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {parade.location}
                  </div>
                )}
                {parade.instructor && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {parade.instructor}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{parade.type}</p>
              
              {parade.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{parade.description}</p>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewingParade(parade)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingParade(parade)}
                    className="text-green-600 hover:text-green-900"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteParade(parade._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Created by {parade.createdBy?.fullName || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {parades.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No parades found</p>
        </div>
      )}

      {/* Add/Edit Parade Modal */}
      {(showAddModal || editingParade) && (
        <ParadeModal
          parade={editingParade}
          paradeTypes={paradeTypes}
          onClose={() => {
            setShowAddModal(false);
            setEditingParade(null);
          }}
          onSubmit={editingParade ? handleUpdateParade : handleAddParade}
        />
      )}

      {/* View Parade Modal */}
      {viewingParade && (
        <ViewParadeModal
          parade={viewingParade}
          onClose={() => setViewingParade(null)}
        />
      )}
    </div>
  );
};

const ParadeModal = ({ parade, paradeTypes, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: parade?.name || '',
    type: parade?.type || '',
    date: parade?.date ? new Date(parade.date).toISOString().split('T')[0] : '',
    time: parade?.time || '',
    description: parade?.description || '',
    location: parade?.location || '',
    instructor: parade?.instructor || '',
    maxParticipants: parade?.maxParticipants || '',
    requirements: parade?.requirements?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      requirements: formData.requirements ? formData.requirements.split(',').map(r => r.trim()).filter(r => r) : []
    };
    
    if (parade) {
      onSubmit(parade._id, submitData);
    } else {
      onSubmit(submitData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {parade ? 'Edit Parade' : 'Create New Parade'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parade Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  {paradeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma-separated)</label>
              <input
                type="text"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="e.g., Uniform, Water bottle, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {parade ? 'Update' : 'Create'} Parade
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ViewParadeModal = ({ parade, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Parade Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Name:</label>
              <p className="text-gray-900">{parade.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <p className="text-gray-900">{parade.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date & Time:</label>
              <p className="text-gray-900">
                {format(new Date(parade.date), 'MMM dd, yyyy')} at {formatTime(parade.time)}
              </p>
            </div>
            {parade.location && (
              <div>
                <label className="text-sm font-medium text-gray-700">Location:</label>
                <p className="text-gray-900">{parade.location}</p>
              </div>
            )}
            {parade.instructor && (
              <div>
                <label className="text-sm font-medium text-gray-700">Instructor:</label>
                <p className="text-gray-900">{parade.instructor}</p>
              </div>
            )}
            {parade.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description:</label>
                <p className="text-gray-900">{parade.description}</p>
              </div>
            )}
            {parade.requirements && parade.requirements.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Requirements:</label>
                <ul className="list-disc list-inside text-gray-900">
                  {parade.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                parade.status === 'Completed' ? 'bg-green-100 text-green-800' :
                parade.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                parade.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {parade.status}
              </span>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
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

export default Parades;
