import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Timeslot = () => {
  const [doctorID,setDoctorID]=useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [existingTimeSlots, setExistingTimeSlots] = useState([]); // Existing slots (editable, not submitted)
  const [newTimeSlots, setNewTimeSlots] = useState([
    { day: "", hospital: "", duration: "", fromTime: null, toTime: null },
  ]); // New slots (only these are submitted)

  useEffect(() => {
    fetchWeekdays();
    fetchHospitals();
    fetchDoctorTimeSlots();
  }, []);

  const fetchWeekdays = async () => {
    try {
      const response = await fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Weekday");
      const result = await response.json();
      if (result.success) setWeekdays(result.data);
    } catch (error) {
      console.error("Error fetching weekdays:", error);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch("https://predart003-001-site1.anytempurl.com/api/Hospital");
      const data = await response.json();
      setHospitals(Array.isArray(data) ? data : data.data ?? []);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const fetchDoctorTimeSlots = async () => {
    try {
      const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`);
      const data = await response.json();
      if (data?.success) {
        const formattedSlots = data.data.map(slot => ({
          day: slot.dayofWeek ?? "",
          hospital: slot.hospitalID ?? "",
          duration: slot.slotDuration?.toString() ?? "",
          fromTime: slot.fromTime ? new Date(`1970-01-01T${slot.fromTime}`) : null,
          toTime: slot.toTime ? new Date(`1970-01-01T${slot.toTime}`) : null,
        }));
        setExistingTimeSlots(formattedSlots);
      }
    } catch (error) {
      console.error("Error fetching doctor time slots:", error);
    }
  };

  const handleChange = (slots, setSlots, index, field, value) => {
    const updatedSlots = [...slots];
    updatedSlots[index][field] = value;
    setSlots(updatedSlots);
  };

  const addNewRow = () => {
    setNewTimeSlots([...newTimeSlots, { day: "", hospital: "", duration: "", fromTime: null, toTime: null }]);
  };

  const handleSubmit = async () => {
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      alert("User not logged in.");
      return;
    }
  
    if (newTimeSlots.every(slot => !slot.day && !slot.hospital && !slot.duration && !slot.fromTime && !slot.toTime)) {
      alert("No new time slots to submit.");
      return;
    }
  
    // 🛡️ Filter out duplicates based on existing slots
    const uniqueNewSlots = newTimeSlots.filter(newSlot => {
      return !existingTimeSlots.some(existingSlot =>
        existingSlot.day === newSlot.day &&
        existingSlot.hospital === newSlot.hospital &&
        existingSlot.fromTime?.toLocaleTimeString("en-US", { hour12: false }) === newSlot.fromTime?.toLocaleTimeString("en-US", { hour12: false }) &&
        existingSlot.toTime?.toLocaleTimeString("en-US", { hour12: false }) === newSlot.toTime?.toLocaleTimeString("en-US", { hour12: false })
      );
    });
  
    if (uniqueNewSlots.length === 0) {
      alert("No unique new time slots to submit. Duplicates detected.");
      return;
    }
  
    const timestamp = new Date().toISOString();
    const payload = uniqueNewSlots.map(slot => ({
      createdBy: userID,
      createdOn: timestamp,
      updatedBy: userID,
      updatedOn: timestamp,
      doctorID,
      hospitalID: slot.hospital,
      dayofWeek: slot.day,
      fromTime: slot.fromTime?.toLocaleTimeString("en-US", { hour12: false }) ?? "00:00:00",
      toTime: slot.toTime?.toLocaleTimeString("en-US", { hour12: false }) ?? "00:00:00",
      slotDuration: slot.duration.toString(),
      isActive: true,
    }));
  
    try {
      const response = await fetch("https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorTimeSlot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
      if (response.ok) {
        alert("Unique new time slots saved successfully!");
        setNewTimeSlots([{ day: "", hospital: "", duration: "", fromTime: null, toTime: null }]);
        fetchDoctorTimeSlots(); // Refresh existing slots
      } else {
        console.error("Failed to save:", result);
      }
    } catch (error) {
      console.error("Error submitting time slots:", error);
    }
  };
  

  const renderTimeSlotRow = (slot, index, slots, setSlots, editable = true) => (
    <div key={index} 
   
      className="flex gap-4 items-center mt-2 rounded-lg border border-stroke bg-transparent 
      p-4 text-black outline-none focus:border-primary
             dark:border-form-strokedark dark:bg-form-input
              dark:text-white dark:focus:border-primary">
      {/* Day */}
      <select value={slot.day} disabled={!editable} 
      onChange={e => handleChange(slots, setSlots, index, "day", e.target.value)} 
      className="w-[20%] rounded-lg border border-stroke bg-transparent 
            py-4 pl-6 pr-10 text-black outline-none focus:border-primary
             dark:border-form-strokedark dark:bg-form-input
              dark:text-white dark:focus:border-primary"
      >
        <option value="">Select Day</option>
        {weekdays.map(day => (
          <option key={day.id} value={day.name}>{day.name}</option>
        ))}
      </select>

      {/* Hospital */}
      <select value={slot.hospital} disabled={!editable}
       onChange={e => handleChange(slots, setSlots, index, "hospital", e.target.value)} 
       className="w-[20%] rounded-lg border border-stroke bg-transparent 
            py-4 pl-6 pr-10 text-black outline-none focus:border-primary
             dark:border-form-strokedark dark:bg-form-input
              dark:text-white dark:focus:border-primary"
       >
        <option value="">Select Hospital</option>
        {hospitals.map(hospital => (
          <option key={hospital.hospitalID} value={hospital.hospitalID}>{hospital.hospitalName}</option>
        ))}
      </select>

      {/* Duration */}
      <input type="text" placeholder="Duration (mins)" value={slot.duration} 
      disabled={!editable} onChange={e => handleChange(slots, setSlots, index, 
      "duration", e.target.value)} 
      className="w-[20%] rounded-lg border border-stroke bg-transparent 
            py-4 pl-6 pr-10 text-black outline-none focus:border-primary
             dark:border-form-strokedark dark:bg-form-input
              dark:text-white dark:focus:border-primary"
      
      />

      {/* From Time */}
      <DatePicker selected={slot.fromTime} 
      onChange={time => handleChange(slots, setSlots, index, "fromTime", time)} 
      showTimeSelect showTimeSelectOnly timeIntervals={15} dateFormat="h:mm aa" 
      placeholderText="From Time" 
      className="w-full rounded-lg border border-stroke bg-transparent 
      py-4 pl-6 pr-10 text-black outline-none focus:border-primary
       dark:border-form-strokedark dark:bg-form-input
        dark:text-white dark:focus:border-primary"
      disabled={!editable} />

      {/* To Time */}
      <DatePicker selected={slot.toTime} 
      onChange={time => handleChange(slots, setSlots, index, "toTime", time)} 
      showTimeSelect showTimeSelectOnly timeIntervals={15} dateFormat="h:mm aa" 
      placeholderText="To Time"
      className="w-full rounded-lg border border-stroke bg-transparent 
      py-4 pl-6 pr-10 text-black outline-none focus:border-primary
       dark:border-form-strokedark dark:bg-form-input
        dark:text-white dark:focus:border-primary"
       disabled={!editable} />
    </div>
  );

  return (
    <div className="col-span-2">
      <h3 className="text-lg font-semibold mb-2">Existing Time Slots</h3>
      {existingTimeSlots.length > 0 ? (
        existingTimeSlots.map((slot, index) => renderTimeSlotRow(slot, index, existingTimeSlots, setExistingTimeSlots, false))
      ) : (
        <p>No existing time slots available.</p>
      )}

      <h3 className="text-lg font-semibold my-4">Add New Time Slots</h3>
      {newTimeSlots.map((slot, index) => renderTimeSlotRow(slot, index, newTimeSlots, setNewTimeSlots))}
      <div className="flex items-center mt-2 justify-end gap-1">
        {/* Clickable Icon */}
        <div
          className="flex justify-center items-center h-10 w-10
                     text-white rounded-full cursor-pointer bg-gradient-to-b
                      from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
          onClick={addNewRow}
        >
          +
        </div>

        {/* Non-clickable Text */}
        <span className="text-sm font-medium text-black-600">Add</span>

      </div>
      <div className="flex justify-end gap-2 mt-4">
      
        <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save New Time Slots</button>
      </div>
    </div>
  );
};

export default Timeslot;
