import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Timeslot = () => {
  const [hospitals, setHospitals] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([
    { day: "", hospital: "", duration: "", fromTime: null, toTime: null },
  ]);

  useEffect(() => {
    fetchHospitals();
    fetchWeekdays();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch(
        "https://predart003-001-site1.anytempurl.com/api/Hospital"
      );
      const data = await response.json();
      if (data && data.data) {
        setHospitals(data.data);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const fetchWeekdays = async () => {
    try {
      const response = await fetch(
        "https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Weekday"
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setWeekdays(result.data);
      }
    } catch (error) {
      console.error("Error fetching weekdays:", error);
    }
  };

  const addNewRow = () => {
    setTimeSlots([
      ...timeSlots,
      { day: "", hospital: "", duration: "", fromTime: null, toTime: null },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  

  

  
  const handleSubmit = async () => {
     // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }
    const doctorID = "1e745cbe-7f7f-4192-0616-08dd40f5dca2"; // Replace dynamically if needed
   
    const timestamp = new Date().toISOString(); // Generate current timestamp
  
    const payload = timeSlots.map((slot) => ({
      createdBy:userID,
      createdOn: timestamp,
      updatedBy: userID, // Assuming the same user updates
      updatedOn: timestamp,
      doctorID,
      hospitalID: slot.hospital, // Ensure this is the hospital ID
      dayofWeek: slot.day, // Ensure this is the weekday name
      fromTime: slot.fromTime ? slot.fromTime.toLocaleTimeString("en-US", { hour12: false }) : "00:00:00",
      toTime: slot.toTime ? slot.toTime.toLocaleTimeString("en-US", { hour12: false }) : "00:00:00",
      slotDuration: slot.duration.toString(), // Convert to string explicitly
      isActive: true, // Default to active
    }));
  
    console.log("Payload:", JSON.stringify(payload, null, 2)); // Debug payload
  
    try {
      const response = await fetch("https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorTimeSlot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log("Time slots saved successfully!", result);
      } else {
        console.error("Failed to save time slots:", result);
      }
    } catch (error) {
      console.error("Error submitting time slots:", error);
    }
  };
  
  return (
    <div className="col-span-2">
      {timeSlots.map((slot, index) => (
        <div
          key={index}
          className="flex gap-4 items-center border border-stroke rounded-lg p-4 bg-transparent dark:border-form-strokedark dark:bg-form-input"
        >
          {/* Day Selection */}
          <select
            value={slot.day}
            onChange={(e) => handleChange(index, "day", e.target.value)}
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">Select Day</option>
            {weekdays.map((day) => (
              <option key={day.id} value={day.id}>
                {day.name}
              </option>
            ))}
          </select>

          {/* Hospital Selection */}
          <select
            value={slot.hospital}
            onChange={(e) => handleChange(index, "hospital", e.target.value)}
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">Select Hospital</option>
            {hospitals.map((hospital) => (
              <option key={hospital.hospitalID} value={hospital.hospitalID}>
                {hospital.hospitalName}
              </option>
            ))}
          </select>

          {/* Duration Input */}
          <input
            type="text"
            placeholder="Duration (mins)"
            value={slot.duration}
            onChange={(e) => handleChange(index, "duration", e.target.value)}
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

          {/* From Time Picker */}
          <DatePicker
            selected={slot.fromTime}
            onChange={(time) => handleChange(index, "fromTime", time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="h:mm aa"
            placeholderText="From Time"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

          {/* To Time Picker */}
          <DatePicker
            selected={slot.toTime}
            onChange={(time) => handleChange(index, "toTime", time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="h:mm aa"
            placeholderText="To Time"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
      ))}

      {/* Add Row Button */}
      <div className="flex items-center justify-end gap-1 mt-4">
        <div
          className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
          onClick={addNewRow}
        >
          +
        </div>
        <span className="text-sm font-medium text-black-600">Add</span>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Time Slots
        </button>
      </div>
    </div>
  );
};

export default Timeslot;
