import React, { useState } from 'react';
import CustomButton from '../../components/CustomButton';

const MedicalCampRegistration = () => {
  const [formData, setFormData] = useState({
    selectedEvent: '',
    name: '',
    mobile: '',
    email: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const events = [
    {
      id: '1',
      eventTitle: 'Pediatric Health Camp',
      description: 'A free health check-up camp for children focusing on nutrition and vaccinations.',
      date: '2024-11-30',
      lastDateForRegistration: '2024-11-28',
      location: 'Children’s Hospital Auditorium, Chicago',
      address: '789 Pediatric Lane, Chicago, IL',
      eventFromDate: '2024-11-30',
      eventToDate: '2024-12-01',
      hostName: 'Children’s Health Foundation',
      hostContact: '+1 312-456-7890',
      fee: 'Free',
    },
    {
      id: '2',
      eventTitle: 'Mental Health Awareness Workshop',
      description: 'A series of sessions to promote mental well-being and stress management.',
      date: '2024-12-10',
      lastDateForRegistration: '2024-12-05',
      location: 'Wellness Center, Los Angeles',
      address: '123 Wellness Blvd, Los Angeles, CA',
      eventFromDate: '2024-12-10',
      eventToDate: '2024-12-12',
      hostName: 'Mental Health Alliance',
      hostContact: '+1 213-678-4321',
      fee: '$50',
    },
  ];

  const selectedEventDetails = events.find((event) => event.id === formData.selectedEvent);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.email) {
      setStatusMessage('Please fill out all fields.');
      setStatusType('error');
      return;
    }
    console.log(formData);
    setStatusMessage('Registration submitted!');
    setStatusType('success');
};

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Camp Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdown to Select Event */}
        <div>
          <select
            name="selectedEvent"
            value={formData.selectedEvent}
            onChange={handleChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">-- Select an camp --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.eventTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Event Details in Labels */}
        {selectedEventDetails && (
          <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
           dark:bg-form-input dark:text-white dark:focus:border-primary">
            <h2 className="text-xl font-semibold mb-4">Camp Details:</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Event Title:</strong> {selectedEventDetails.eventTitle}</p>
              <p><strong>Description:</strong> {selectedEventDetails.description}</p>
              <p><strong>Date:</strong> {selectedEventDetails.date}</p>
              <p><strong>Last Date:</strong> {selectedEventDetails.lastDateForRegistration}</p>
              <p><strong>Location:</strong> {selectedEventDetails.location}</p>
              <p><strong>Address:</strong> {selectedEventDetails.address}</p>
              <p><strong>Event From:</strong> {selectedEventDetails.eventFromDate}</p>
              <p><strong>Event To:</strong> {selectedEventDetails.eventToDate}</p>
              <p><strong>Host Name:</strong> {selectedEventDetails.hostName}</p>
              <p><strong>Host Contact:</strong> {selectedEventDetails.hostContact}</p>
              <p><strong>Fee:</strong> {selectedEventDetails.fee}</p>
            </div>
          </div>
        )}

        {/* User Registration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
             text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          
          <CustomButton >
          Submit Registration
    </CustomButton>
          {/* Status Message */}
{statusMessage && (
  <div
    className={`p-4 rounded-md text-center ${
      statusType === 'error' ? ' text-red-600' : ' text-green-600'
    }`}
  >
    {statusMessage}
  </div>
)}

        </div>
      </form>
    </div>
  );
};

export default MedicalCampRegistration;
