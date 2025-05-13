import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import DoctorIcon from '../../images/icon/Surgeon medicine doctor physician.svg';
import {
  FaStethoscope,
  FaUserMd,
  FaMapMarkerAlt,
  FaDirections,
  FaPhoneAlt,
  FaHospital,
} from 'react-icons/fa';
import { fetchSpecializations } from '../../Utils';
import CustomButton from '../../components/CustomButton';
import HospitalIcon from '../../images/icon/Hospital solid (1).svg';
import SpecializationIcon from '../../images/icon/Health doctor medical medicine box box.svg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
interface Doctor {
  doctorID: string;
  doctorName: string;
  doctorPhoneNumber: string;
  qualificationID: string;
  specializationID: string;
  hospitalID: string;
}

interface Hospital {
  hospitalID: string;
  hospitalName: string;
}

const SearchDoctors: React.FC = () => {
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<AppLOVOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
   const [patientData, setPatientData] = useState({ name: '', phoneNumber: '' });
  const [selectedHospital, setSelectedHospital] = useState('');

  const [specializations, setSpecializations] = useState<{
    [key: string]: string;
  }>({});
  const [selectedHospitalID, setSelectedHospitalID] = useState('');
  const [selectedDoctorID, setSelectedDoctorID] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [slotDuration, setSlotDuration] = useState(10); // Default slot duration, adjust as necessary
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlotID, setSelectedTimeSlotID] = useState<string>('');
  // States for popup
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);
  const [isSelf, setIsSelf] = useState(false);
  const [appointmentType, setAppointmentType] = useState(''); // Initialize it with a default value or fetch it if necessary.

  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

  const [showPopup, setShowPopup] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [hospitalID, setHospitalID] = useState('');
  const [relationships, setRelationships] = useState([]);
  const [isOthers, setIsOthers] = useState(false);
  const [doctorID, setDoctorID] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');

  const [DoctorName, setDoctorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedSpecializationID, setSelectedSpecializationID] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',

    phoneNumber: '',
    hospital: '',
    doctor: '',
    reason: '',
    date: null as Date | null,
    time: null as Date | null,
  });

  const [errors, setErrors] = useState({
    name: '',
    relationship: '',

    hospital: '',
    phoneNumber: '',
    doctor: '',
    reason: '',
    date: '',
    time: '',
  });

  const [roleName, setRoleName] = useState('');

useEffect(() => {
  const role = sessionStorage.getItem('roleName');
  if (role) {
    setRoleName(role);
  }
}, []);


  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital/List')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const activeHospitals = data.filter((hospital) => hospital.isActive); // ✅ filter active only

          const hospitalMap = activeHospitals.reduce(
            (acc, hospital) => {
              acc[hospital.hospitalID] = hospital.hospitalName;
              return acc;
            },
            {} as { [key: string]: string },
          );

          setHospitals(hospitalMap);
        }
      })
      .catch((error) => console.error('Error fetching hospitals:', error));
  }, []);

  const fetchAllDoctors = async () => {
    try {
      const roleName = sessionStorage.getItem('roleName');
      const unitID = sessionStorage.getItem('unitID');
  
      let url = 'https://predart003-001-site1.anytempurl.com/api/Doctor';
  
      // Append hospitalId query if the role is HospitalAdmin
      if (roleName === 'HostitalAdmin' && unitID) {
        url += `?hospitalId=${unitID}`;
      }
  
      const response = await fetch(url);
      const result = await response.json();
  
      if (result?.data) {
        setDoctorData(result.data);
        setFilteredDoctors(result.data);
      } else {
        setDoctorData([]);
        setFilteredDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAllDoctors();
  }, []);

  const fetchRelationships = async () => {
    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Relationship',
      );
      const result = await response.json();

      console.log('API Response:', result); // Check the response structure

      if (Array.isArray(result.data)) {
        setRelationships(result.data); // Set the fetched relationships
      } else {
        console.error('Invalid relationship data format:', result.data);
        setRelationships([]);
      }
    } catch (error) {
      console.error('Error fetching relationships:', error);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchRelationships();
  }, []);

  useEffect(() => {
    const getSpecializations = async () => {
      const specMap = await fetchSpecializations();
      setSpecializations(specMap);
    };

    getSpecializations();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      setFilteredDoctors(
        doctorData.filter((doc) => doc.hospitalID === selectedHospital),
      );
    } else {
      setFilteredDoctors(doctorData);
    }
  }, [selectedHospital, doctorData]);

  const convertTo24HourFormat = (time: Date | string): string => {
    if (!time) return '00:00:00';

    const date =
      typeof time === 'string' ? new Date(`1970-01-01T${time}`) : time;

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=toWhom',
        );
        console.log('API Response:', response.data);
        setOptions(response.data?.data ?? []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  // Open popup and set doctor details
  const handleBookNow = (doctor: Doctor) => {
    console.log('Booking doctor:', doctor); // Debugging
    setSelectedDoctor(doctor);
    setSelectedDoctorID(doctor.doctorID); // Set the doctor ID for the dropdown
    setHospitalID(doctor.hospitalID);
    setDoctorID(doctor.doctorID);
    setShowPopup(true);
  };

  useEffect(() => {
    if (selectedDoctorID) {
      // Instead of simulating an event, you could call the fetch logic directly:
      const fetchTimeSlots = async () => {
        try {
          const response = await fetch(
            'https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot',
          );
          const responseData = await response.json();
          const data = Array.isArray(responseData.data)
            ? responseData.data
            : [];

          console.log('Fetched Time Slots Data:', data);

          const matchedTimeSlots = data.filter(
            (slot) => String(slot.doctorID) === selectedDoctorID,
          );

          if (matchedTimeSlots.length) {
            console.log('Matched Time Slots:', matchedTimeSlots);

            const formattedSlots = matchedTimeSlots.map((slot) => ({
              timeSlotID: slot.timeSlotID,
              fromTime: slot.fromTime,
              toTime: slot.toTime,
              slotDuration: slot.slotDuration,
              day: slot.dayofWeek, // Ensure this matches the API field
            }));

            setAvailableTimeSlots(formattedSlots);
            console.log('Formatted Slots:', formattedSlots);

            // Optionally, if a date is selected, update slots for that date:
            if (selectedDate) {
              handleDateChange(selectedDate, formattedSlots);
            }
          } else {
            console.warn('No matching time slots found for this doctor.');
            setAvailableTimeSlots([]);
            setGeneratedTimeSlots([]);
          }
        } catch (error) {
          console.error('Error fetching time slots:', error);
        }
      };
      fetchTimeSlots();
    }
  }, [selectedDoctorID]); // Run whenever selectedDoctorID changes

  const handleDateChange = (date: Date | null, slots?: TimeSlotType[]) => {
    if (!date) return;

    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, date }));

    const timeSlots = Array.isArray(slots) ? slots : availableTimeSlots;
    if (!Array.isArray(timeSlots)) {
      console.error('Invalid timeSlots:', timeSlots); // Ensure no event is passed
      return;
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const matchedDaySlots = timeSlots.filter(
      (slot) =>
        slot.day?.toLowerCase().trim() === dayOfWeek.toLowerCase().trim(),
    );

    if (matchedDaySlots.length) {
      matchedDaySlots.forEach(
        ({ fromTime, toTime, slotDuration, timeSlotID }) => {
          generateTimeSlots(fromTime, toTime, slotDuration, timeSlotID);
        },
      );
      setFormData((prev) => ({
        ...prev,
        timeSlotID: matchedDaySlots[0].timeSlotID,
      }));
    } else {
      console.warn(`No time slots found for ${dayOfWeek}`);
      setGeneratedTimeSlots([]);
    }
  };

  const generateTimeSlots = (
    fromTime: string,
    toTime: string,
    slotDuration: number,
    timeSlotID: number,
    bookedSlots: { appointmentDate: string; appointmentTime: string }[],
    selectedDate: Date,
  ) => {
    const fromTime24 = convertTo24HourFormat(fromTime);
    const toTime24 = convertTo24HourFormat(toTime);

    const [fromHours, fromMinutes] = fromTime24.split(':').map(Number);
    const [toHours, toMinutes] = toTime24.split(':').map(Number);

    const currentSlot = new Date(selectedDate);
    currentSlot.setHours(fromHours, fromMinutes, 0, 0);

    const endSlot = new Date(selectedDate);
    endSlot.setHours(toHours, toMinutes, 0, 0);

    const availableSlots: { time: Date; timeSlotID: number }[] = [];

    while (currentSlot < endSlot) {
      const slotTime = new Date(currentSlot); // Clone to avoid mutation

      const isBooked = bookedSlots.some((b) => {
        const combinedBookedTime = new Date(
          `${b.appointmentDate.split('T')[0]}T${b.appointmentTime}`,
        );
        return combinedBookedTime.getTime() === slotTime.getTime();
      });

      if (!isBooked) {
        console.log(
          `✅ Available Slot: ${slotTime.toTimeString().slice(0, 5)}`,
        );
        availableSlots.push({ time: new Date(slotTime), timeSlotID });
      } else {
        console.log(
          `⛔ Skipping Booked Slot: ${slotTime.toTimeString().slice(0, 5)}`,
        );
      }

      currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
    }

    return availableSlots;
  };

  const filterHospitals = (text: string) => {
    setSearchText(text);
    setFilteredHospitals(
      hospitalList.filter((hospital) =>
        hospital.toLowerCase().includes(text.toLowerCase()),
      ),
    );
    setShowHospitalDropdown(true);
  };

  // Function to filter doctors based on user input
  const filterDoctors = (text: string) => {
    setDoctorSearchText(text);
    setFilteredDoctors(
      doctorList.filter((doctor) =>
        doctor.toLowerCase().includes(text.toLowerCase()),
      ),
    );
    setShowDoctorDropdown(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'relationship' && value.length > 0) {
      setShowSuggestions(true);
      setFilteredRelationships(
        relationships.filter((relation) =>
          relation.toLowerCase().includes(value.toLowerCase()),
        ),
      );
    } else {
      setShowSuggestions(false);
    }

    if (name === 'hospital') {
      filterHospitals(value);
    }
    if (name === 'doctor') {
      filterDoctors(value);
    }

    // Validate the field
    setErrors({ ...errors, [name]: validateField(name, value) });
  };
 useEffect(() => {
    const userID = sessionStorage.getItem('userID');
    const roleName = sessionStorage.getItem('roleName');

    if (userID && roleName !== 'Reception') {
      fetch(
        `https://predart003-001-site1.anytempurl.com/api/Patient/GetPatientByUserID?userId=${userID}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const name = data.data.patientName || '';
            const phoneNumber = data.data.patientPhoneNumber || '';

            // Save it separately
            setPatientData({ name, phoneNumber });

            // Initialize formData if needed
            setFormData((prev) => ({
              ...prev,
              name,
              phoneNumber,
            }));
          } else {
            console.warn('⚠️ Failed to fetch patient data');
          }
        })
        .catch((err) => {
          console.error('❌ Error fetching patient data:', err);
        });
    }
  }, []);
  const [selectedRelationship, setSelectedRelationship] = useState('');

  useEffect(() => {
    const roleName = sessionStorage.getItem('roleName');
    const unitID = sessionStorage.getItem('unitID');

    if (roleName === 'HostitalAdmin' && unitID) {
      setSelectedHospital(unitID);
    }
  }, []);

  useEffect(() => {
    const selectedOption = options.find(
      (opt) => opt.appLOVID === appointmentType,
    );

    if (selectedOption?.name === 'Self') {
      setIsSelf(true);
      setIsOthers(false);

      setFormData((prev) => ({
        ...prev,
        name: patientData.name, // ✅ refill from stored patient data
        phoneNumber: patientData.phoneNumber,
        relationship: selectedOption.appLOVID,
      }));
      setSelectedRelationship(selectedOption.appLOVID);
    } else if (selectedOption?.name === 'Others') {
      setIsSelf(false);
      setIsOthers(true);

      setFormData((prev) => ({
        ...prev,
        name: '',
        phoneNumber: '',
        relationship: '',
      }));
      setSelectedRelationship('');
    } else {
      setIsSelf(false);
      setIsOthers(false);
    }
  }, [appointmentType, options, patientData]);

  const handleTimeSlotSelect = (time: Date, timeSlotID: string) => {
    setSelectedTime(time);
    setSelectedTimeSlotID(timeSlotID);

    setFormData((prev) => ({
      ...prev,
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeSlotID: timeSlotID, // ✅ Correctly pass timeSlotID
    }));
  };

  const validateField = (name: string, value: string | Date | null): string => {
    let error = '';

    // Conditional validation for 'Others' appointment type
    if (appointmentType === 'Others' && name === 'relationship' && !value) {
      return 'Relationship is required.'; // ✅ Shows error if not selected
    }

    if (name === 'name' && !value) error = 'Name is required.';
    if (name === 'hospital' && !value) error = 'Hospital is required.';
    // if (name === 'doctor' && !value) error = 'Doctor is required.';
    if (name === 'doctor' && !selectedDoctorID) error = 'Doctor is required.';

    if (name === 'reason' && !value) error = 'Reason is required.';

    if (name === 'phoneNumber') {
      if (!value) {
        error = 'Phone number is required.';
      } else if (typeof value === 'string' && !/^\d{10}$/.test(value)) {
        error = 'Phone number must be exactly 10 digits.';
      }
    }

    // Date validation
    if (name === 'date') {
      const dateValue = formData.date; // Use formData.date for consistency
      if (!dateValue) {
        error = 'Date is required.';
      } else if (dateValue instanceof Date && isNaN(dateValue.getTime())) {
        error = 'Invalid date.';
      } else {
        error = ''; // Clear error when valid
      }
    }

    // Time validation
    if (name === 'time') {
      if (!value) {
        error = 'Time is required.';
      } else if (value instanceof Date && isNaN(value.getTime())) {
        error = 'Invalid time.';
      }
    }

    return error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const newErrors = {
      name: validateField('name', formData.name),
      relationship: validateField('relationship', selectedRelationship),
      hospital: validateField('hospital', selectedHospitalID),
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      doctor: validateField('doctor', formData.doctor),
      reason: validateField('reason', formData.reason),
      date: validateField('date', formData.date),
      time: validateField('time', formData.time),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === '')) {
      try {
        const patientRes = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Patient/GetPatientByUserID?userId=${userID}`,
        );

        if (!patientRes.ok) {
          throw new Error('Failed to fetch patient ID');
        }

        const patientData = await patientRes.json();
        const patientID = patientData?.data?.patientID;

        if (!patientID) {
          toast.error('Patient ID not found for the logged-in user.');
          return;
        }

        const appointmentTimeFormatted = formData.time
          ? convertTo24HourFormat(formData.time)
          : '00:00:00';

        const formatDateYYYYMMDD = (dateString: string) => {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = `0${date.getMonth() + 1}`.slice(-2);
          const day = `0${date.getDate()}`.slice(-2);
          return `${year}-${month}-${day}`;
        };
        console.log('Form Data:', formData);
        const payload = {
          createdBy: userID,
          isActive: true,
          doctorID: formData.doctor,
          patientID: patientID,
          timeSlotID: formData.timeSlotID, // Pass this correctly
          appointmentDate: formData.date
            ? formatDateYYYYMMDD(formData.date)
            : null,
          appointmentTime: appointmentTimeFormatted,
          statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
          notes: formData.reason?.trim() || 'No additional notes',
          toWhom: appointmentType,
          relationShip: selectedRelationship,
          phoneNumber: formData.phoneNumber || '',
        };

        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Appointment',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        const responseData = await response.json();

        if (response.ok) {
          const message =
            responseData?.message || 'Appointment booked successfully!';
          toast.success(message);
          console.log('Form Submitted:', payload);
          resetForm();
        } else {
          const message =
            responseData?.message || 'Submission failed. Please try again.';
          toast.error(message);
        }
      } catch (error) {
        console.error('Error during submission:', error);
        toast.error('An error occurred. Please try again later.');
      }
    } else {
      toast.warning('Please fix the highlighted errors before submitting.');
    }
  };

  const handleOptionChange = (selectedOption: AppLOVOption) => {
    setAppointmentType(selectedOption.appLOVID); // ✅ Store the ID
    console.log(
      `Selected: ${selectedOption.name}, appLOVID: ${selectedOption.appLOVID}`,
    );
  };
  useEffect(() => {
    if (!appointmentType && options.length > 0) {
      const defaultOption = options.find((opt) => opt.name === 'Self');
      if (defaultOption) {
        setAppointmentType(defaultOption.appLOVID);
        handleOptionChange(defaultOption); // optional
      }
    }
  }, [options]);

  const handleSearch = async () => {
    const roleName = sessionStorage.getItem('roleName');
    const unitID = sessionStorage.getItem('unitID');

    // At least one filter should be provided
    const hasAnyFilter =
      DoctorName || mobile || selectedSpecializationID || selectedHospital;

    if (!hasAnyFilter) {
      toast.warning('Please enter at least one filter.');
      return;
    }

    let apiUrl = 'https://predart003-001-site1.anytempurl.com/api/Doctor?';
    const queryParams: string[] = [];

    // Hospital ID logic (optional)
    if (roleName === 'Patient' && selectedHospital) {
      queryParams.push(`hospitalId=${selectedHospital}`);
    } else if (roleName === 'HostitalAdmin' && unitID) {
      queryParams.push(`hospitalId=${unitID}`);
    }

    if (selectedSpecializationID) {
      queryParams.push(`SpecializationId=${selectedSpecializationID}`);
    }

    if (DoctorName.trim()) {
      queryParams.push(`DoctorName=${encodeURIComponent(DoctorName.trim())}`);
    }

    if (mobile.trim()) {
      queryParams.push(`MobileNo=${encodeURIComponent(mobile.trim())}`);
    }

    const finalUrl = apiUrl + queryParams.join('&');
    console.log('Doctor Search API:', finalUrl);

    try {
      const response = await fetch(finalUrl);
      const result = await response.json();

      if (result?.data && Array.isArray(result.data)) {
        setDoctorData(result.data); // <-- this updates what UI uses
      } else {
        console.error('Unexpected response format:', result);
        setDoctorData([]); // empty result still updates the screen
      }
    } catch (error) {
      console.error('API fetch error:', error);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();

    const roleName = sessionStorage.getItem('roleName');
    const unitID = sessionStorage.getItem('unitID');

    setDoctorName('');
    setMobile('');
    setSelectedSpecializationID('');

    if (roleName === 'Patient') {
      setSelectedHospital('');
    } else if (roleName === 'HospitalAdmin') {
      setSelectedHospital(unitID || '');
    }

    await fetchAllDoctors();
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <div className="p-2 bg-white rounded-md">
        <h1 className="text-3xl font-semibold text-black mb-6">
          Search Doctor
        </h1>

        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
  <div>
    <select
      id="hospital"
      value={selectedHospital}
      disabled={sessionStorage.getItem('roleName') === 'HostitalAdmin'}
      className={`w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary
        ${sessionStorage.getItem('roleName') === 'HostitalAdmin' ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}`}
      onChange={(e) => setSelectedHospital(e.target.value)}
    >
      {sessionStorage.getItem('roleName') === 'HostitalAdmin' ? (
        <option value={selectedHospital}>
          {hospitals[selectedHospital] || 'Selected Hospital'}
        </option>
      ) : (
        <>
          <option value="">-- Select Hospital --</option>
          {Object.entries(hospitals).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </>
      )}
    </select>
  </div>

  <div>
    <input
      type="text"
      value={DoctorName}
      onChange={(e) => setDoctorName(e.target.value)}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      placeholder="Enter Doctor Name"
    />
  </div>

  <div>
    <input
      type="tel"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={10}
      value={mobile}
      onChange={(e) => setMobile(e.target.value)}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      placeholder="Enter Mobile Number"
    />
  </div>

  <div>
    <select
      value={selectedSpecializationID}
      onChange={(e) => setSelectedSpecializationID(e.target.value)}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      <option value="">-- Select Specialization --</option>
      {Object.entries(specializations).map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  </div>

  {/* Button group aligned to the left of next grid column */}
  <div className="flex items-center gap-4 mt-2 lg:col-span-3">
    <CustomButton onClick={handleSearch} className="h-10 px-6">
      Search
    </CustomButton>

    <CustomButton
      onClick={handleReset}
      className="h-10 px-6 border border-gray-300 opacity-80 hover:opacity-100 flex items-center gap-2"
    >
      Reset
    </CustomButton>

    <ToastContainer position="top-right" autoClose={3000} />
  </div>
</form>


      </div>
      <h1 className="text-2xl p-2 font-semibold text-black mb-6 mt-4">
        List of Doctor's
      </h1>
      <DoctorCard
        doctorData={searchResults.length ? searchResults : doctorData}
        loading={loading}
        hospitals={hospitals}
        specializations={specializations}
        onBookNow={handleBookNow}
      />

      {showPopup && selectedDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
            <form onSubmit={handleSubmit}>
              {/* Appointment Type */}
              <div className="flex justify-center mt-4 mb-6">
                <div className="flex rounded-full border-2 border-blue-300 overflow-hidden">
                  {options.map((option) => (
                    <label
                      key={option.appLOVID}
                      className={`px-6 py-2 cursor-pointer font-semibold text-center transition-all duration-300
        ${appointmentType === option.appLOVID ? 'bg-blue-500 text-white' : 'bg-gray-500 text-black'}`}
                    >
                      <input
                        type="radio"
                        name="appointmentType"
                        value={option.appLOVID}
                        checked={appointmentType === option.appLOVID}
                        onChange={() => {
                          setAppointmentType(option.appLOVID);
                          handleOptionChange(option);
                        }}
                        className="hidden"
                      />
                      {option.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4 flex gap-4">
                <div className="relative w-1/2">
                <input
                    type="text"
                    name="name"
                    maxLength={30}
                    placeholder={isOthers ? 'Enter your Name' : 'Name'}
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSelf && roleName !== 'Reception'}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                  text-black outline-none focus:border-primary dark:border-form-strokedark
                   dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="relative w-1/2">
                <input
                    type="text"
                    name="phoneNumber"
                    maxLength={10}
                    placeholder={
                      isOthers ? 'Enter your number' : 'Phone Number'
                    }
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={isSelf && roleName !== 'Reception'}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Relationship (for Others) */}
              {appointmentType ===
                options.find((opt) => opt.name === 'Others')?.appLOVID && (
                <div className="mb-4">
                  <div className="relative">
                    {/* Relationship Dropdown */}
                    <select
                      name="relationship"
                      value={selectedRelationship || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedRelationship(value); // Updates selectedRelationship
                        setFormData((prev) => ({
                          ...prev,
                          relationship: value, // Updates formData.relationship
                        }));
                      }}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Relationship</option>
                      {relationships.length > 0 ? (
                        relationships.map((relation) => (
                          <option
                            key={relation.appLOVID}
                            value={relation.appLOVID}
                          >
                            {relation.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No relationships available</option>
                      )}
                    </select>
                  </div>

                  {/* Error Message */}
                  {errors.relationship && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.relationship}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-4 flex gap-4">
                <div className="relative w-1/2">
                  <select
                    value={hospitalID}
                    disabled
                    onChange={(e) => setHospitalID(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 
                  pl-6 pr-10 text-black outline-none focus:border-primary
                   dark:border-form-strokedark dark:bg-form-input dark:text-white
                    dark:focus:border-primary"
                  >
                    {Object.entries(hospitals).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-1/2">
                  <select
                    name="doctor"
                    value={selectedDoctorID}
                    disabled
                    // Make sure this updates selectedDoctorID accordingly if the user changes the selection manually
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select Doctor</option>
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => (
                        <option key={doctor.doctorID} value={doctor.doctorID}>
                          {doctor.doctorName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No doctors available</option>
                    )}
                  </select>
                  {errors.doctor && (
                    <p className="text-red-500 text-sm">{errors.doctor}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 flex gap-4">
                {/* Date Picker */}
                <div className="relative w-1/2">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => handleDateChange(date)}
                    placeholderText="Select Date"
                    minDate={new Date()} // Disable past dates
                    className={`w-full rounded-lg border border-stroke py-4 pl-4 pr-12 text-black outline-none focus:border-primary ${errors.date ? 'border-red-500' : ''}`}
                  />

                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                  {/* Calendar Icon */}
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#c2c3c4' }}
                  >
                    <i className="fas fa-calendar-alt fa-xs"></i>
                  </span>
                </div>

                {/* Time Picker */}
                <div className="relative w-1/2">
                  <DatePicker
                    selected={selectedTime}
                    onChange={(time) => {
                      if (time) {
                        const matchedSlot = generatedTimeSlots.find(
                          (slot) =>
                            slot.time.getHours() === time.getHours() &&
                            slot.time.getMinutes() === time.getMinutes(),
                        );

                        if (matchedSlot) {
                          handleTimeSlotSelect(time, matchedSlot.timeSlotID); // ✅ Pass ID on selection
                        }
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={slotDuration}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    placeholderText="Select a time"
                    className="w-full rounded-lg border border-stroke py-4 pl-4 pr-12
               text-black outline-none focus:border-primary"
                    includeTimes={generatedTimeSlots.map((slot) => slot.time)}
                  />

                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                  {/* Timer Icon */}
                  <span
                    className="absolute left-50 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#c2c3c4' }}
                  >
                    <i className="fas fa-clock fa-xs"></i>
                  </span>
                </div>
              </div>

              <textarea
                value={notes}
                placeholder="Enter description"
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 
    pl-6 pr-10 text-black outline-none focus:border-primary
    dark:border-form-strokedark dark:bg-form-input dark:text-white
    dark:focus:border-primary"
                rows={3}
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
              )}

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-[#d4d4d4] text-white py-2 px-4 rounded shadow-none hover:bg-[#808080] border border-[#d4d4d4]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DoctorCard = ({
  doctorData,
  loading,
  specializations,
  hospitals,
  onBookNow,
}) => {
  const [showMore, setShowMore] = useState(false);
const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {loading ? (
        <div className="col-span-full text-center py-10">
          <p className="text-lg font-medium text-blue-500">Loading...</p>
        </div>
      ) : doctorData.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p className="text-lg font-medium text-blue-500">
            No doctor data found.
          </p>
        </div>
      ) : (
        doctorData.map((doctor) => {
          const specializationName =
            doctor.specializationID &&
            specializations[String(doctor.specializationID).trim()]
              ? specializations[String(doctor.specializationID).trim()]
              : 'Unknown';

          const hospitalName = hospitals[doctor.hospitalID] || 'Unknown';

          return (
            <div
              key={doctor.doctorID}
              className="relative border-2 border-blue-300 rounded-xl shadow bg-white transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              {/* Profile Icon Badge */}
              <div className="absolute top-0 left-0 bg-blue-100 w-10 h-10 rounded-br-md rounded-tl-lg flex items-center justify-center">
                <FaUserMd className="text-gray-500 text-md" />
              </div>

              {/* Content Padding */}
              <div className="p-4 space-y-3">
                {/* Book Button */}
                <div className="flex justify-end">
                  <button
                    className="bg-blue-300 text-white px-4 py-1 rounded-md hover:bg-blue-400 transition"
                    onClick={() => onBookNow(doctor)}
                  >
                    <span>Book Now</span>
                  </button>
                </div>

                {/* Name & Specialization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mt-2 mb-2">
                  <div className="flex items-center gap-2 max-w-full">
                    <img src={DoctorIcon} alt="doctor" className="w-4 h-5" />
                    <span
                      className="text-black truncate"
                      title={`Name: ${doctor.doctorName}`}
                    >
                      <span className="text-black">Name:</span>
                      {doctor.doctorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 max-w-full">
                    <img
                      src={SpecializationIcon}
                      alt="specialization"
                      className="w-5 h-5"
                    />
                    <span
                      className="text-black truncate"
                      title={`Specialization: ${specializationName}`}
                    >
                      <span className="text-black">Specialization:</span>
                      {specializationName}
                    </span>
                  </div>
                </div>

                {/* Hospital */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mt-2 mb-2">
                  <div className="flex items-center gap-2 max-w-full">
                    <img
                      src={HospitalIcon}
                      alt="hospital"
                      className="w-5 h-5 "
                    />
                    <span className="text-black">
                      <span className="text-black">Hospital:</span>{' '}
                      {hospitalName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 max-w-full">
                    <img src={HospitalIcon} alt="mobile" className="w-5 h-5" />
                    <span className="text-black">
                      <span className="text-black">Mobile:</span>{' '}
                      {doctor.doctorPhoneNumber || 'N/A'}
                    </span>
                  </div>
                </div>
                

 <div className="flex justify-end mb-2 mr-2">
 <button
  onClick={() =>
    navigate("/ProfileDoctor", {
      state: {
        doctorID: doctor.doctorID,
        doctorName: doctor.doctorName,
      },
    })
  }
  className="text-blue-600 hover:underline text-sm font-semibold"
>
  View More Profile Info
</button>
</div>

              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SearchDoctors;
