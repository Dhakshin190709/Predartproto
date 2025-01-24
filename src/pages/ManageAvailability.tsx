import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker'; // Assuming you're using react-datepicker for time selection
import "react-datepicker/dist/react-datepicker.css";

// Type for each time slot entry
interface TimeSlot {
  day: string;
  hospital: string;
  hospitalType:string;
  fromTime: Date | null;
  toTime: Date | null;
}

// Type for the component's props (if any)
interface FormProps {}

const ManageAvailability: React.FC<FormProps> = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
const [hospitalTypes, setHospitalTypes] = useState([]);
const [formData, setFormData] = useState<RowData>({
 
  hospital: '',
  hospitalType:'',
  fromTime: null,
  toTime: null,
  });


useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV")
      .then((response) => response.json())
      .then((data) => {
        // Filter for "Hospital" type
        const filteredTypes = data.data.filter((item) => item.type === "Hospital");
        setHospitalTypes(filteredTypes); // Set filtered options
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Initialize time slots with 7 days on component mount
  useEffect(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const initialTimeSlots = days.map((day) => ({
      day,
      hospital: '',
      hospitalType:'',
      fromTime: null,
      toTime: null,
    }));
    setTimeSlots(initialTimeSlots);
  }, []);

  const handleTimeChange = (index: number, field: string, value: string | Date | null) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setTimeSlots(updatedSlots);
  };

  const addNewRowBelow = (index: number, day: string) => {
    const newSlot: TimeSlot = { day, hospital: '', fromTime: null, toTime: null };
    const updatedSlots = [...timeSlots];
    updatedSlots.splice(index + 1, 0, newSlot); // Insert new row below
    setTimeSlots(updatedSlots);
  };

  return (
    <div className="h-full bg-white p-6 rounded-lg shadow-lg">
      <div className="space-y-6">
        {/* Days and Time Slots Section */}
        {timeSlots.map((slot, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 items-center">
            {/* Day Label */}
            <div>
              <label className="block font-medium text-blue-500">{slot.day}</label>
            </div>

            {/* Hospital Dropdown */}
            <div className="col-span-2">
               <select
    id="hospitalType"
    name="hospitalType"
    value={formData.hospitalType}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    onChange={(e) =>
      setFormData({ ...formData, hospitalType: e.target.value })
    }
    required
  >
    <option value="">Hospital Type</option>
    {hospitalTypes.length > 0 ? (
      hospitalTypes.map((type) => (
        <option key={type.appLOVID} value={type.name}>
          {type.name} {/* Displaying the name of the hospital */}
        </option>
      ))
    ) : (
      <option value="">No Hospital Types Available</option>
    )}
  </select>
            </div>

            {/* From Time */}
            <div>
              <DatePicker
                selected={slot.fromTime}
                onChange={(time) => handleTimeChange(index, "fromTime", time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                placeholderText="From Time"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* To Time */}
            <div>
              <DatePicker
                selected={slot.toTime}
                onChange={(time) => handleTimeChange(index, "toTime", time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                placeholderText="To Time"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Add Button Below To Time (Aligned to the End) */}
            <div className="col-span-5 flex justify-end mt-2">
              <button
                type="button"
                className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                onClick={() => addNewRowBelow(index, slot.day)}
              >
                +
              </button>
            </div>
          </div>
        ))}

        {/* Additional Information Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Checkbox 1 */}
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span>I'm ready to work on government holidays</span>
            </label>

            {/* Checkbox 2 */}
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span>I'm ready to work on government holidays</span>
            </label>

            {/* Checkbox 3 */}
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span>I'm ready to work on government holidays</span>
            </label>

            {/* Checkbox 4 */}
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span>I'm ready to work on government holidays</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAvailability;
