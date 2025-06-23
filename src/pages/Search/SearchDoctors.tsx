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
import axios from 'axios';
import api from '../../api/request';
import { useNavigate } from 'react-router-dom';
interface Doctor {
  doctorID: string;
  doctorName: string;
  hospitalName: string;
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
  const [selectedHospital, setSelectedHospital] = useState(); // ✅ Correct
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
  const [doctors, setDoctors] = useState([]); // Ensure default state is an array
  const [selectedHospitalName, setSelectedHospitalName] = useState('');
  const [isHospitalDisabled, setIsHospitalDisabled] = useState(false);
  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [isEditable, setIsEditable] = useState(false); // controls edit toggle
  const [successMessage, setSuccessMessage] = useState('');
  // const [generatedTimeSlots, setGeneratedTimeSlots] = useState<
  //   { time: Date; timeSlotID: number }[]
  // >([]);

  const [showPopup, setShowPopup] = useState(false);
  const closePopup = () => setShowPopup(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [hospitalID, setHospitalID] = useState('');
  const [relationships, setRelationships] = useState([]);
  const [isOthers, setIsOthers] = useState(false);
  const [doctorID, setDoctorID] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  // const [notes, setNotes] = useState('');
  const [selectedHospitals, setSelectedHospitals] = useState(
    () => sessionStorage.getItem('unitID') || '',
  );

  const [DoctorName, setDoctorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedSpecializationID, setSelectedSpecializationID] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bookedSlots, setBookedSlots] = useState<
    { appointmentDate: string; appointmentTime: string }[]
  >([]);
  const [filteredRelationships, setFilteredRelationships] = useState<string[]>(
    [],
  );
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phoneNumber: '',
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
  const [doctorNameError, setDoctorNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  useEffect(() => {
    const role = sessionStorage.getItem('roleName');
    if (role) {
      setRoleName(role);
    }
  }, []);

  const handleDoctorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow letters, digits, spaces, underscores, and dots
    const sanitizedValue = value.replace(/[^\p{L}\d_. ]/gu, '');
    setDoctorName(sanitizedValue);

    // Validation rules
    if (
      !/^[\p{L}\d_. ]+$/u.test(sanitizedValue) || // Invalid characters
      /^[_.]/.test(sanitizedValue) || // Starts with . or _
      /[_.]$/.test(sanitizedValue) // Ends with . or _
    ) {
      setDoctorNameError(
        'Only letters, numbers, spaces, underscores, and dots are allowed. Cannot start or end with a dot or underscore.',
      );
    } else {
      setDoctorNameError('');
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setMobile(numericValue);

    // Regex to block repeated digits (like 8888888888)
    const isFakeMobile = /^(.)\1{9}$/;

    // Validation
    if (!/^[6-9][0-9]{0,9}$/.test(numericValue)) {
      setMobileError('Enter valid 10-digit number starting with 6-9');
    } else if (numericValue.length !== 10) {
      setMobileError('Mobile number must be 10 digits');
    } else if (isFakeMobile.test(numericValue)) {
      setMobileError('Please enter a valid, non-repetitive mobile number');
    } else {
      setMobileError('');
    }
  };

  // 🔄 Fetch hospitals and handle role logic
 useEffect(() => {
  const fetchHospitals = async () => {
    try {
      const roleName = sessionStorage.getItem('roleName');
      const tenantID = sessionStorage.getItem('tenantID');

      // Build the URL with tenantId param only for TenantAdmin
      let url = '/Hospital/List';
      if (roleName === 'TenantAdmin' && tenantID) {
        url += `?tenantId=${tenantID}`;
      }

      const response = await api.get(url);
      const data = response.data;

      if (Array.isArray(data)) {
        const activeHospitals = data.filter((h) => h.isActive);

        const hospitalMap = activeHospitals.reduce(
          (acc, h) => {
            acc[String(h.hospitalID)] = h.hospitalName;
            return acc;
          },
          {} as { [key: string]: string },
        );

        setHospitals(hospitalMap);

        const unitID = sessionStorage.getItem('unitID');

        if (roleName === 'HospitalAdmin' && unitID && hospitalMap[unitID]) {
          setSelectedHospital(unitID);
          setIsHospitalDisabled(true);
        } else {
          setSelectedHospital('');
          setIsHospitalDisabled(false);
        }
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to load hospitals');
    }
  };

  fetchHospitals();
}, []);



  // ✅ 2. Fetch Doctor Data — filter by hospital if HospitalAdmin
 const fetchAllDoctors = async () => {
  try {
    const roleName = sessionStorage.getItem('roleName');
    const unitID = sessionStorage.getItem('unitID');
    const tenantID = sessionStorage.getItem('tenantID');

    let url = '/Doctor';

    // ✅ Only include tenantID if role is NOT Patient
    if (roleName !== 'Patient' && tenantID) {
      url += `?tenantId=${tenantID}`;
    }

    // ✅ For HospitalAdmin, add hospitalId appropriately
    if (roleName === 'HospitalAdmin' && unitID) {
      url += `${url.includes('?') ? '&' : '?'}hospitalId=${unitID}`;
    }

    const response = await api.get(url);
    const result = response.data;

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
      const response = await api.get('/AppLOV', {
        params: { type: 'Relationship' },
      });

      console.log('API Response:', response.data); // Axios response data

      if (Array.isArray(response.data.data)) {
        setRelationships(response.data.data);
      } else {
        console.error('Invalid relationship data format:', response.data.data);
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

  const handleSuggestionClick = (suggestion: string) => {
    setFormData((prevData) => ({
      ...prevData,
      relationship: suggestion,
    }));
    setShowSuggestions(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      relationship: '',
    }));
  };

  const handleBlur = (name: string, value: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };

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

  const handleHospitalChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const hospitalId = event.target.value;
    setSelectedHospitalID(hospitalId);
    setSelectedDoctorID(''); // clear doctor selection

    if (hospitalId) {
      await fetchDoctors(hospitalId);
    } else {
      setDoctors([]);
    }
  };

  useEffect(() => {
    const storedRole = sessionStorage.getItem('roleName');
    setRoleName(storedRole);
    console.log('Retrieved role:', storedRole);
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get('/AppLOV', {
          params: { type: 'toWhom' },
        });
        console.log('API Response:', response.data);
        setOptions(response.data?.data ?? []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  // Open popup and set doctor details
  const handleBookNow = async (doctor: Doctor) => {
    console.log('Booking doctor:', doctor);

    // ✅ Log hospital name & ID
    console.log('Hospital Name:', doctor.hospitalName);
    console.log('Hospital ID:', doctor.hospitalID);

    // ✅ Set doctor and hospital data
    setSelectedDoctor(doctor);
    setSelectedDoctorID(doctor.doctorID);
    setHospitalID(doctor.hospitalID); // used in payload
    setDoctorID(doctor.doctorID);
    setShowPopup(true);

    // ✅ Set selected hospital info for form dropdown
    setSelectedHospitalID(doctor.hospitalID); // dropdown value
    setSelectedHospitalName(doctor.hospitalName); // optional if used for display

    // ✅ Update form data with correct hospital ID
    setFormData((prev) => ({
      ...prev,
      doctor: doctor.doctorID,
      hospital: doctor.hospitalID, // 💥 THIS FIXES THE FLOW_HOSPITAL ISSUE
    }));

    try {
      const response = await api.get('/Doctor/GetDoctorTimeSlot', {
        params: { doctorId: doctor.doctorID },
      });

      const timeSlotData = response.data;
      console.log('Fetched Time Slot Data:', timeSlotData);

      const data = Array.isArray(timeSlotData.data) ? timeSlotData.data : [];

      if (data.length === 0) {
        console.warn('No time slots configured for this doctor.');
        toast.warn('This doctor has no time slots available.');
        setAvailableTimeSlots([]);
        setGeneratedTimeSlots([]);
        return;
      }

      const matchedTimeSlots = data.filter(
        (slot) => String(slot.doctorID) === String(doctor.doctorID),
      );

      console.log('All TimeSlots:', data);
      console.log(
        'Selected Day of Week:',
        selectedDate?.toLocaleString('en-US', { weekday: 'long' }),
      );
      console.log('Matched Slots for this day:', matchedTimeSlots);

      if (matchedTimeSlots.length > 0) {
        const formattedSlots = matchedTimeSlots.map((slot) => ({
          timeSlotID: slot.timeSlotID,
          fromTime: slot.fromTime,
          toTime: slot.toTime,
          slotDuration: slot.slotDuration,
          day: slot.dayofWeek,
        }));
        setAvailableTimeSlots(formattedSlots);

        if (selectedDate) {
          handleDateChange(selectedDate, formattedSlots, doctor.doctorID);
        }
      } else {
        console.warn(
          'Doctor is NOT available on',
          selectedDate?.toLocaleDateString(),
        );
        setAvailableTimeSlots([]);
        setGeneratedTimeSlots([]);
        toast.warn('Doctor is not available on the selected date');
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const handleDoctorChange = (e) => {
    const value = e.target.value;
    setSelectedDoctorID(value);
    setFormData((prev) => ({ ...prev, doctor: value }));
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = async (
    date: Date | null,
    slots?: TimeSlotType[],
  ) => {
    if (!date) return;

    const localDate = formatLocalDate(date);
    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, date }));

    const timeSlots = Array.isArray(slots) ? slots : availableTimeSlots;
    if (!Array.isArray(timeSlots)) {
      console.error('Invalid timeSlots:', timeSlots);
      return;
    }

    const dayOfWeek = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .trim()
      .toLowerCase();

    const matchedDaySlots = timeSlots.filter(
      (slot) => slot.day?.toLowerCase().trim() === dayOfWeek,
    );

    console.log('All TimeSlots: ', timeSlots);
    console.log('Selected Day of Week:', dayOfWeek);
    console.log('Matched Slots for this day:', matchedDaySlots);

    if (matchedDaySlots.length === 0) {
      console.warn(`Doctor is NOT available on ${dayOfWeek}`);
      setGeneratedTimeSlots([]);
      return;
    }

    try {
      const response = await api.get('/Appointment/GetAppointment', {
        params: {
          DoctorID: selectedDoctorID,
          StartDate: localDate,
          EndDate: localDate,
        },
      });
      const data = response.data;

      const appointmentList = Array.isArray(data) ? data : [];
      const bookedSlots = appointmentList.map((appointment: any) => ({
        appointmentDate: appointment?.appointmentDate,
        appointmentTime: appointment?.appointmentTime,
      }));

      let generated: { time: Date; timeSlotID: number }[] = [];

      matchedDaySlots.forEach(
        ({ fromTime, toTime, slotDuration, timeSlotID }) => {
          const slots = generateTimeSlots(
            fromTime,
            toTime,
            slotDuration,
            timeSlotID,
            bookedSlots,
            date,
          );
          generated = [...generated, ...slots];
        },
      );

      if (Array.isArray(generated)) {
        setGeneratedTimeSlots(generated);
      } else {
        console.error('❌ Generated slots is not a valid array:', generated);
        setGeneratedTimeSlots([]);
      }

      console.log(
        '✅ Final Available Slots:',
        generated.map((s) => s.time.toTimeString().slice(0, 5)),
      );

      setFormData((prev) => ({
        ...prev,
        date,
        timeSlotID: matchedDaySlots[0].timeSlotID,
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
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

  const selectHospital = (hospital: string) => {
    setFormData((prevData) => ({
      ...prevData,
      hospital,
    }));
    setShowHospitalDropdown(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      hospital: '', // Clear error on valid selection
    }));
  };

  // Select a doctor from the dropdown
  const selectDoctor = (doctor: string) => {
    setFormData((prevData) => ({
      ...prevData,
      doctor,
    }));
    setShowDoctorDropdown(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      doctor: '', // Clear error on valid selection
    }));
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

//  const fetchDoctors = async (hospitalId: string) => {
//   try {
//     const roleName = sessionStorage.getItem('roleName');
//     const tenantID = sessionStorage.getItem('tenantID');

//     // Build params object based on role
//     const params: any = {
//       HospitalID: hospitalId,
//     };

//     // If TenantAdmin, also add tenantID param
//     if (roleName === 'TenantAdmin' && tenantID) {
//       params.tenantID = tenantID;
//     }

//     const response = await api.get('/Doctor', { params });
//     const result = response.data;

//     if (result.success && Array.isArray(result.data)) {
//       setDoctors(result.data);
//     } else {
//       console.error('Invalid doctor data format:', result.data);
//       setDoctors([]);
//     }
//   } catch (error) {
//     console.error('Error fetching doctors:', error);
//   }
// };


  useEffect(() => {
    const fetchPatientData = async () => {
      const userID = sessionStorage.getItem('userID');
      const roleName = sessionStorage.getItem('roleName');

      // Only fetch if role is not Reception and not HospitalAdmin
      if (
        userID &&
        roleName !== 'Reception' &&
        roleName !== 'HospitalAdmin' &&
        roleName !== 'TenantAdmin'
      ) {
        try {
          const response = await api.get('/Patient/GetPatientByUserID', {
            params: { userId: userID },
          });

          const data = response.data;

          if (data.success && data.data) {
            const name = data.data.patientName || '';
            const phoneNumber = data.data.patientPhoneNumber || '';

            setPatientData({ name, phoneNumber });

            setFormData((prev) => ({
              ...prev,
              name,
              phoneNumber,
            }));
          } else {
            console.warn('⚠️ Failed to fetch patient data');
          }
        } catch (err) {
          console.error('❌ Error fetching patient data:', err);
        }
      }
    };

    fetchPatientData();
  }, []);

  // ✅ Helper function to reset the form completely
  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      hospital: '',
      phoneNumber: '',
      doctor: '',
      reason: '',
      date: '',
      time: '',
      timeSlotID: '',
    });
    setSelectedRelationship('');
    setAppointmentType('');
    setSelectedHospitalID('');
    setSelectedDoctorID('');
    setSelectedDate(null);
    setSelectedTime(null);
    setErrors({});
  };

  const [selectedRelationship, setSelectedRelationship] = useState('');

  useEffect(() => {
    const roleName = sessionStorage.getItem('roleName');
    const unitID = sessionStorage.getItem('unitID');

    if (roleName === 'HospitalAdmin' && unitID) {
      setSelectedHospitalID(unitID);
      setFormData((prev) => ({
        ...prev,
        hospital: unitID,
      }));
    }
  }, []);

  const formattedTime =
    formData.time instanceof Date
      ? formData.time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : formData.time;

  useEffect(() => {
    console.log('Form Data Updated:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('Selected Time Slot ID:', selectedTimeSlotID);
  }, [selectedTimeSlotID]);

  useEffect(() => {
    const selectedOption = options.find(
      (opt) => opt.appLOVID === appointmentType,
    );

    if (selectedOption?.name === 'Self') {
      setIsSelf(true);
      setIsOthers(false);
      setFormData((prev) => ({
        ...prev,
        name: patientData.name,
        phoneNumber: patientData.phoneNumber,
        relationship: selectedOption.appLOVID,
      }));
      setSelectedRelationship(selectedOption.appLOVID);
      setIsEditable(false); // Disable editing for name and phone number
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
      setIsEditable(true); // Enable editing for name and phone number
    } else {
      setIsSelf(false);
      setIsOthers(false);
      setIsEditable(true); // Default to editable
    }
  }, [appointmentType, options, patientData]);

  const handleTimeSlotSelect = (time: Date, timeSlotID: string) => {
    console.log('Time Selected:', time);
    console.log('Time Slot ID Selected:', timeSlotID);

    setFormData((prev) => ({
      ...prev,
      time,
      timeSlotID, // Ensure this is set correctly
    }));

    setSelectedTime(time);
    setSelectedTimeSlotID(timeSlotID);

    const timeError = validateField('time', time);
    setErrors((prev) => ({ ...prev, time: timeError }));
  };

  const validateField = (name: string, value: string | Date | null): string => {
    let error = '';

    // Conditional validation for 'Others' appointment type
    if (appointmentType === 'Others' && name === 'relationship' && !value) {
      return 'Relationship is required.'; // ✅ Shows error if not selected
    }

    if (name === 'name' && !value) error = 'Name is required.';
    if (name === 'hospital') {
      if (!value) {
        return 'Hospital is required.';
      }
    }

    // if (name === 'doctor' && !value) error = 'Doctor is required.';
    if (name === 'doctor' && !selectedDoctorID) error = 'Doctor is required.';

    if (name === 'reason') {
      return typeof value === 'string' && value.trim().length > 0
        ? ''
        : 'Reason is required';
    }

    if (name === 'phoneNumber') {
      if (!value) {
        error = 'Phone number is required.';
      } else if (typeof value === 'string' && !/^\d{10}$/.test(value)) {
        error = 'Phone number must be exactly 10 digits.';
      }
    }

    // Date validation
    if (name === 'date') {
      const dateValue = formData.date;
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Clear time for accurate comparison

      if (!formData.date) {
        error = 'Date is required.';
      } else if (dateValue instanceof Date && isNaN(dateValue.getTime())) {
        error = 'Invalid date.';
      } else if (dateValue < today) {
        error = 'Past dates are not allowed.';
      } else {
        error = ''; // Clear error when valid
      }
    }

    // Time validation
    if (name === 'time') {
      console.log('Validating Time:', value, typeof value);

      if (!value || !(value instanceof Date)) {
        error = 'Time is required.';
      } else if (isNaN(value.getTime())) {
        error = 'Invalid time.';
      } else if (formData.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(formData.date);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate.getTime() === today.getTime() && value < new Date()) {
          error = 'Past time is not allowed for today.';
        }
      }
    }

    return error;
  };

  const [notes, setNotes] = useState(formData.reason || '');

  useEffect(() => {
    setFormData((prev) => ({ ...prev, reason: notes }));
  }, [notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Hospital in formData at submit:', formData.hospital);
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }
    // Prevent submission for HospitalAdmin
    if (roleName === 'HospitalAdmin') {
      toast.warning('Hospital Admin is not allowed to submit this form.');
      return;
    }
    // Validate all fields and collect errors
    const newErrors = {
      name: validateField('name', formData.name),
      relationship: validateField('relationship', selectedRelationship),
      hospitalID:
        appointmentType === 'create'
          ? validateField('hospitalID', formData.hospitalID)
          : '',
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      doctor: validateField('doctor', formData.doctor),
      reason: validateField('reason', formData.reason),
      date: validateField('date', formData.date),
      time: validateField('time', formData.time),
    };

    // Log errors for debugging
    console.log('Validation Errors:', newErrors);

    setErrors(newErrors);

    // Check if all errors are falsy (no error)
    const isValid = Object.values(newErrors).every((error) => !error);

    if (!isValid) {
      console.log('❌ Validation failed. Not submitting.');
      toast.warning('Please fix the highlighted errors before submitting.');
      return; // stop submission if validation failed
    }

    console.log('✅ All validations passed. Submitting form...');

    try {
      // Fetch patient data using axios api
      const patientRes = await api.get('/Patient/GetPatientByUserID', {
        params: { userId: userID },
      });

      const patientData = patientRes.data;
      const patientID = patientData?.data?.patientID;

      if (!patientID) {
        toast.error('Patient ID not found for the logged-in user.');
        return;
      }

      // Convert time to 24-hour format or default to '00:00:00'
      const appointmentTimeFormatted = formData.time
        ? convertTo24HourFormat(formData.time)
        : '00:00:00';

      // Use your existing date formatter here
      const formatDateYYYYMMDD = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const payload = {
        createdBy: userID,
        isActive: true,
        doctorID: formData.doctor,
        hospitalID: hospitalID,
        hospitalName: selectedHospitalName,
        patientID: patientID,
        timeSlotID: formData.timeSlotID,
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

      // Submit the appointment via axios api post
      const response = await api.post('/Appointment', payload);

      if (response.status >= 200 && response.status < 300) {
        const message =
          response.data?.message || 'Appointment booked successfully!';
        toast.success(message);
        console.log('Form Confirmed:', payload);
        resetForm();
        closePopup();
      } else {
        const message =
          response.data?.message || 'Submission failed. Please try again.';
        toast.error(message);
      }
    } catch (error: any) {
      console.error('Error during submission:', error);
      toast.error('An error occurred. Please try again later.');
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
    const tenantID = sessionStorage.getItem('tenantID');
    // At least one filter should be provided
    const hasAnyFilter =
      DoctorName || mobile || selectedSpecializationID || selectedHospital;

    if (!hasAnyFilter) {
      toast.warning('Please enter at least one filter.');
      return;
    }

    const queryParams: Record<string, string> = {};

    // Role-based filtering
    if (roleName === 'Patient' && selectedHospital) {
      queryParams.hospitalId = selectedHospital;
    } else if (roleName === 'HospitalAdmin' && unitID) {
      queryParams.hospitalId = unitID;
    } else if (roleName === 'TenantAdmin' && tenantID) {
      queryParams.tenantId = tenantID;
      if (selectedHospital) {
        queryParams.hospitalId = selectedHospital;
      }
    }

    if (selectedSpecializationID) {
      queryParams.SpecializationId = selectedSpecializationID;
    }

    if (DoctorName.trim()) {
      queryParams.DoctorName = DoctorName.trim();
    }

    if (mobile.trim()) {
      queryParams.MobileNo = mobile.trim();
    }

    try {
      const response = await api.get('/Doctor', { params: queryParams });
      const result = response.data;

      if (result?.data && Array.isArray(result.data)) {
        setDoctorData(result.data);
      } else {
        console.error('Unexpected response format:', result);
        setDoctorData([]);
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

  // Reset hospital based on role
  if (roleName === 'HospitalAdmin') {
    setSelectedHospital(unitID || '');
  } else {
    // For Patient, TenantAdmin, and others
    setSelectedHospital('');
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
            {isHospitalDisabled ? (
              // ✅ HospitalAdmin sees readonly box with prefilled hospital name
              <div className="w-full rounded-lg border border-stroke bg-gray-100 dark:bg-gray-700 py-4 pl-6 pr-10 text-black dark:text-white">
                {selectedHospital && hospitals[selectedHospital]
                  ? hospitals[selectedHospital]
                  : 'Selected Hospital'}
              </div>
            ) : (
              // ✅ Other roles (e.g., Patient) see dropdown
              <select
                id="hospital"
                value={selectedHospital || ''}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
      text-black outline-none focus:border-primary dark:border-form-strokedark
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                onChange={(e) => setSelectedHospital(e.target.value)}
              >
                <option value="">-- Select Hospital --</option>
                {Object.entries(hospitals).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <input
              type="text"
              value={DoctorName}
              maxLength={30}
              onChange={handleDoctorNameChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter Doctor Name"
            />
            {doctorNameError && (
              <p className="text-red-500 text-sm">{doctorNameError}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={mobile}
              onChange={handleMobileChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter Mobile Number"
            />
            {mobileError && (
              <p className="text-red-500 text-sm">{mobileError}</p>
            )}
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
         roleName={roleName}
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
                    name="hospital"
                    disabled
                    value={selectedHospitalID}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedHospitalID(value);
                      setFormData((prev) => ({
                        ...prev,
                        hospital: value, // ✅ use selected hospital ID from dropdown
                      }));
                    }}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                    disabled
                    value={selectedDoctorID}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedDoctorID(value);
                      setFormData((prev) => ({ ...prev, doctor: value }));
                    }}
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
                    onChange={(date) =>
                      handleDateChange(date, availableTimeSlots)
                    }
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
                  onClick={handleSubmit}
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
  roleName,
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

                 {roleName !== 'HospitalAdmin' && (
  <div className="flex justify-end">
    <button
      className="bg-blue-300 text-white px-4 py-1 rounded-md hover:bg-blue-400 transition"
      onClick={() =>
        onBookNow({
          ...doctor,
          hospitalName: hospitals[doctor.hospitalID] || 'Unknown',
        })
      }
    >
      <span>Book Now</span>
    </button>
  </div>
)}

              

                {/* Name & Specialization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 mt-6 gap-y-2 gap-x-6 mt-2 mb-2">
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
  <img src={HospitalIcon} alt="hospital" className="w-5 h-5" />
  <span className="text-black whitespace-nowrap">
    <span className="text-black">Hospital:</span>{' '}
    <span
      className="inline-block max-w-[200px] truncate align-middle"
      title={hospitalName}
    >
      {hospitalName}
    </span>
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
                      navigate('/ProfileDoctor', {
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
