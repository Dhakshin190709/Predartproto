import React, { useState } from 'react';
import CustomButton from '../../components/CustomButton';

const EventCreation = () => {
  const [formData, setFormData] = useState({
    eventTitle: '',
    description: '',
    date: '',
    lastDateForRegistration: '',
    location: '',
    address: '',
    eventFromDate: '',
    eventToDate: '',
    hostName: '',
    hostContact: '',
    fee: '',
    picture: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, picture: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Event Creation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Event Title and Description */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="eventTitle"
            value={formData.eventTitle}
            onChange={handleChange}
            placeholder="Event Title"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary col-span-2"
          />
        </div>

        {/* Row 2: Date, Last Date for Registration, Location */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="date"
            value={formData.date}
            onChange={handleChange}
            placeholder="Date"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            name="lastDateForRegistration"
            value={formData.lastDateForRegistration}
            onChange={handleChange}
            placeholder="Last Date for Registration"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Row 3: Address, Event From Date, Event To Date */}
        <div className="grid grid-cols-3 gap-4">
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            name="eventFromDate"
            value={formData.eventFromDate}
            onChange={handleChange}
            placeholder="Event From Date"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            name="eventToDate"
            value={formData.eventToDate}
            onChange={handleChange}
            placeholder="Event To Date"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Row 4: Host Name, Host Contact, Fee */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="hostName"
            value={formData.hostName}
            onChange={handleChange}
            placeholder="Host Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="tel"
            name="hostContact"
            value={formData.hostContact}
            onChange={handleChange}
            placeholder="Host Contact Number"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="number"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            placeholder="Fee of the Program"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
             text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Row 5: Picture Upload */}
        <div className="grid grid-cols-6 gap-4 items-center">
          <input
            type="file"
            name="picture"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary col-span-2"
          />
          <CustomButton >
     save
    </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default EventCreation;
