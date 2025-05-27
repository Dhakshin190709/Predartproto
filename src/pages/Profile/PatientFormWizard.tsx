import React, { useState, useEffect, useRef } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import CalendarIcon from '../../images/icon/calendar.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import api from '../../api/request';
type GenderOption = {
  code: string;
  name: string;
};
interface State {
  id: number;
  stateName: string;
  stateCode: string;
}

interface District {
  id: number;
  pinCode: string;
  districtName: string;
  stateCode: string;
}

interface City {
  id: number;
  cityName: string;
}

interface Address {
  addressID?: string | null;
  id?: string | null;
  addressType?: string;
  address1?: string;
  address2?: string;
  city?: string;
  district?: string;
  state?: string;
  zipCode?: string;
  type?: string; // Optional or required, based on your use case
}
const PatientFormWizard: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientDateOfBirth: '',
    patientGender: '',
    patientPhoneNumber: '',
    patientEmail: '',
    patientID: '',
    // height: "",
    // weight: "",
    // bloodGroupID: "",
    // email: "",
    // phoneNumber: "",
    // name: "",
  });

  const [formErrors, setFormErrors] = useState<{
    district: any;
    pincode: any;
    city: any;
    state: any;
    patientName: string;
    patientEmail: string;
    patientPhoneNumber: string;
    patientDateOfBirth: string;
    patientGender: string;
  }>({
    patientName: '',
    patientEmail: '',
    patientPhoneNumber: '',
    patientDateOfBirth: '',
    patientGender: '',
    state: '',
    district: '',
    pincode: '',
    city: '',
  });

  const [boxes, setBoxes] = useState([
    {
      name: '',
      email: '',
      phoneNumber: '',
      patientDateOfBirth: '',
      bloodGroup: '',
      height: '',
      weight: '',
      showDateInput: false,
      errors: {},
    },
  ]);

  const [genderOptions, setGenderOptions] = useState<GenderOption[]>([]);

  const dateInputRef = useRef(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isFormReady, setIsFormReady] = useState(true);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [showCityInput, setShowCityInput] = useState(false);
  // this persists between renders

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [manualCity, setManualCity] = useState('');

  const [forms, setForms] = useState([
    {
      id: Date.now(),
      language: '',
      abilities: { read: false, write: false, speak: false },
    },
  ]);

  interface Award {
    awardName: string;
    year: string;
    description: string;
  }

  const [addresses, setAddresses] = useState<Address[]>([
    {
      addressType: '',
      address1: '',
      address2: '',
      state: '',
      district: '',
      zipCode: '',
      city: '',
      type: 'patient',
      isPrimary: false,
    },
  ]);
  const [sections, setSections] = useState([
    { height: '', weight: '', bloodGroup: '' },
  ]);

  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [patientDetails, setPatientDetails] = useState<any>(null);

  const [patientID, setPatientID] = useState(null); // State to store patientID
  const [inputType, setInputType] = useState<'text' | 'date'>('text');

  const [showAddressFields, setShowAddressFields] = useState(false);

  const [bloodGroups, setBloodGroups] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get('/Address/states');
        setStates(response.data.data);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchStates();
  }, []);

  const handleStateChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedDistrict('');
    setCities([]);
    setShowCityInput(false);

    // Update state in address list
    updateAddress(index, 'state', stateCode);
    updateAddress(index, 'district', '');
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    api
      .get(`/Address/districts?StateCode=${stateCode}`)
      .then((res) => {
        setDistricts(res.data.data);
        const uniquePincodes = Array.from(
          new Set(res.data.data.map((d: District) => d.pinCode)),
        );
        setPincodes(uniquePincodes);
      })
      .catch((error) => {
        console.error('Failed to fetch districts:', error);
        // Optionally handle error UI here
      });
  };

  const handleDistrictChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    setShowCityInput(false);

    // Update district in address list
    updateAddress(index, 'district', districtName);
    updateAddress(index, 'zipCode', ''); // ✅ correct
    updateAddress(index, 'city', '');

    const filteredPins = districts
      .filter((item) => item.districtName === districtName)
      .map((item) => item.pinCode);

    setPincodes(filteredPins);

    api
      .get(`/Address/cities?districtName=${districtName}`)
      .then((res) => {
        const cityData = res.data.data;
        if (cityData.length === 0) {
          setShowCityInput(true);
          setCities([]);
        } else {
          setCities(cityData);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch cities:', error);
        // Optionally handle error display here
      });
  };

  useEffect(() => {
    api
      .get('/AppLOV')
      .then((response) => {
        console.log('Fetched data:', response.data);
        const filteredBloodGroups = response.data.data.filter(
          (item) => item.type === 'Bloodgroup',
        );
        setBloodGroups(filteredBloodGroups);
      })
      .catch((error) => {
        console.error('Error fetching blood groups:', error);
      });
  }, []);

  const [addressTypes, setAddressTypes] = useState([]);

  useEffect(() => {
    api
      .get('/AppLOV')
      .then((response) => {
        const filteredAddressTypes = response.data.data.filter(
          (item) => item.type === 'Address',
        );
        setAddressTypes(filteredAddressTypes);
      })
      .catch((error) => {
        console.error('Error fetching address types:', error);
      });
  }, []);

  useEffect(() => {
    const fetchFamilyData = async () => {
      const patientID = sessionStorage.getItem('patientID');
      try {
        const response = await api.get(
          `/Patient/GetFamily?PatientID=${patientID}`,
        );
        const result = response.data;

        if (
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const uniqueMap = new Map();

          result.data.forEach((item) => {
            const key = `${item.name}-${item.phoneNumber}`; // composite key
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, {
                name: item.name || '',
                email: item.email || '',
                phoneNumber: item.phoneNumber || '',
                patientDateOfBirth: item.dateOfBirth
                  ? item.dateOfBirth.split('T')[0]
                  : '',
                bloodGroup: item.bloodGroupID || '',
                height: item.height || '',
                weight: item.weight || '',
                showDateInput: false,
                errors: {},
              });
            }
          });

          const mappedBoxes = Array.from(uniqueMap.values());
          setBoxes(mappedBoxes); // ✅ Set fetched family data
        } else {
          // No data returned, show default single box
          setBoxes([
            {
              name: '',
              email: '',
              phoneNumber: '',
              patientDateOfBirth: '',
              bloodGroup: '',
              height: '',
              weight: '',
              showDateInput: false,
              errors: {},
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching family data:', error);
        // On error also show single default box
        setBoxes([
          {
            name: '',
            email: '',
            phoneNumber: '',
            patientDateOfBirth: '',
            bloodGroup: '',
            height: '',
            weight: '',
            showDateInput: false,
            errors: {},
          },
        ]);
      }
    };

    fetchFamilyData();
  }, []);

  useEffect(() => {
    const patientID = sessionStorage.getItem('patientID');
    if (!patientID) return;

    api
      .get(`/Patient/GetPreferences?PatientID=${patientID}`)
      .then((res) => {
        const data = res.data?.data;
        if (!data) return;

        const formattedPreferences: Record<string, boolean> = {};

        for (let key in data) {
          if (typeof data[key] === 'boolean') {
            // Convert field like "emailNotification" → "emailnotification"
            const formattedKey = key.toLowerCase().replace(/\s+/g, '');
            formattedPreferences[formattedKey] = data[key];
          }
        }

        setPreferences(formattedPreferences);
      })
      .catch((err) => {
        console.error('Error fetching preferences:', err);
      });
  }, []);

  const updateAddress = (
    index: number,
    field: keyof Address,
    value: string,
  ) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);

    if (touchedFields[`${index}-${field}`]) {
      validateAddress(updatedAddresses[index], index);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[index][field] = value;
    updatedBoxes[index].errors = {
      ...updatedBoxes[index].errors,
      [field]: '', // Clear error on change
    };
    setBoxes(updatedBoxes);
  };

  const handleAddBox = () => {
    setBoxes((prev) => [
      ...prev,
      {
        name: '',
        email: '',
        phoneNumber: '',
        patientDateOfBirth: '',
        height: '',
        weight: '',
        bloodGroup: '',
        errors: {},
      },
    ]);
  };
  // Add a new address row
  const addAddress = () => {
    setAddresses((prevAddresses) => [
      ...prevAddresses,
      {
        addressID: '',
        addressType: '',
        address1: '',
        address2: '',
        city: '',
        district: '',
        state: '',
        zipCode: '',
        type: '',
        isPrimary: false,
      },
    ]);
  };

  const handlePrimaryCheckbox = (selectedIndex: number) => {
    const updated = addresses.map((addr, idx) => ({
      ...addr,
      isPrimary: idx === selectedIndex, // Only one true
    }));
    setAddresses(updated);
  };

  // Remove an address row
  const removeAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };

  const [experiences, setExperiences] = useState([
    {
      type: 'Part-time',
      specialization: '',
      hospitalName: '',
      joinDate: null,
      leaveDate: null,
    },
  ]);

  const updateExperience = (index, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value, // Update only the specified field
    };
    setExperiences(updatedExperiences);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        type: 'Part-time',
        specialization: '',
        hospitalName: '',
        joinDate: null,
        leaveDate: null,
      },
    ]);
  };

  const removeExperience = (index) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
  };
  // Experience

  // Fetch the gender options on component mount
  useEffect(() => {
    const fetchGenderOptions = async () => {
      try {
        const response = await api.get('/AppLOV', {
          params: { type: 'gender' },
        });

        if (response.data && response.data.data) {
          console.log('Gender Options:', response.data.data); // 👈 Add this line
          setGenderOptions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching gender options:', error);
      }
    };

    fetchGenderOptions();
  }, []);

  // Handle input change for form data

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const removeForm = (id) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== id));
  };

  const handleMultipleFormsInputChange = (id, field, value) => {
    setForms((prevForms) =>
      prevForms.map((form) =>
        form.id === id
          ? {
              ...form,
              [field]: value,
            }
          : form,
      ),
    );
  };

  const handleDateChange = (date: Date | null): void => {
    setSelectedDate(date);
    setFormData((prevData) => ({ ...prevData, date }));
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleComplete = () => {
    console.log('Form completed!');
    setPopupVisible(true);
  };

  const [uploadBoxes, setUploadBoxes] = useState([
    {
      id: Date.now(),
      files: [],
      preview: null,
      previewType: '',
      selectedType: '',
    },
  ]);

  const checkboxes = [
    'Email Notification',
    'Phone Notification',
    'SMS Notification',
    'App Notification',
    'Browser Notification',
    'Marketing Updates',
    'Security Alerts',
    'Account Updates',
    'Survey Requests',
    'Newsletter Subscription',
  ];

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    padding: '1rem',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  // Initialize all preferences as false
  const [preferences, setPreferences] = useState({
    emailNotification: false,
    phoneNotification: false,
    smsNotification: false,
    appNotification: false,
    browserNotification: false,
    marketingUpdates: false,
    securityAlerts: false,
    accountUpdates: false,
    surveyRequests: false,
    newsletterSubscription: false,
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateField = (name: string, value: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

    switch (name) {
      case 'patientName':
      case 'name':
        return !value
          ? 'Name is required.'
          : emojiRegex.test(value)
            ? 'Emojis are not allowed.'
            : /^[A-Za-z0-9 _]+$/.test(value)
              ? ''
              : 'Only letters, numbers, spaces, and underscores are allowed.';

      case 'patientEmail':
      case 'email':
        return !value
          ? 'Email is required.'
          : emojiRegex.test(value)
            ? 'Emojis are not allowed in email.'
            : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ? ''
              : 'Invalid email format.';

      case 'patientPhoneNumber':
      case 'phoneNumber':
        return !value
          ? 'Phone number is required.'
          : emojiRegex.test(value)
            ? 'Emojis are not allowed in phone number.'
            : /^[6-9]\d{9}$/.test(value)
              ? ''
              : 'Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits.';

      case 'patientDateOfBirth':
        if (!value) return 'Date of Birth is required.';
        const dob = new Date(value);
        dob.setHours(0, 0, 0, 0);
        return dob >= today
          ? 'Date of Birth cannot be today or in the future.'
          : '';

      case 'patientGender':
        return !value ? 'Gender is required.' : '';

      case 'height':
        return value &&
          /^\d{1,3}$/.test(value) &&
          parseFloat(value) >= 30 &&
          parseFloat(value) <= 300
          ? ''
          : 'Enter a valid height (30–300 cm).';

      case 'weight':
        return value &&
          /^\d{1,3}(\.\d{1,2})?$/.test(value) &&
          parseFloat(value) >= 10 &&
          parseFloat(value) <= 200
          ? ''
          : 'Enter a valid weight (10.0–200.0 kg).';

      default:
        return '';
    }
  };

  const handleFormInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value), // Ensure validateField is properly defined
    }));
  };

  const handleboxInputChange = (index, field, value) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[index][field] = value;
    setBoxes(updatedBoxes);
  };

  const validateForm = () => {
    const newErrors = Object.keys(formData).reduce(
      (acc, key) => {
        acc[key as keyof typeof formData] = validateField(
          key,
          formData[key as keyof typeof formData],
        );
        return acc;
      },
      {} as typeof formErrors,
    );

    setFormErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);
    if (hasErrors) {
      const filtered = Object.fromEntries(
        Object.entries(newErrors).filter(([_, v]) => v),
      );
      console.warn('⚠️ Missing or invalid fields:', filtered); // Only show actual errors
    }

    return !hasErrors;
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      const patientID = sessionStorage.getItem('patientID');
      try {
        const userID = sessionStorage.getItem('userID');
        const response = await api.get('/Patient/GetPatientByUserID', {
          params: { userId: userID },
        });

        const data = response.data.data;

        // Ensure patientGender matches one of the gender options
        const matchedGender = genderOptions.find(
          (gender) =>
            gender.name.toLowerCase() === data.patientGender?.toLowerCase() ||
            gender.code.toLowerCase() === data.patientGender?.toLowerCase(),
        );

        if (data.patientID) {
          sessionStorage.setItem('patientID', data.patientID);
        }

        // Ensure that you're correctly updating formData with the matched gender code
        setFormData((prev) => ({
          ...prev,
          patientID: data.patientID || '',
          patientName: data.patientName || '',
          patientEmail: data.patientEmail || '',
          patientPhoneNumber: data.patientPhoneNumber || '',
          patientDateOfBirth: data.patientDateOfBirth?.split('T')[0] || '',
          patientGender: matchedGender?.code || '',
        }));

        setIsFormReady(true);
      } catch (err) {
        console.error('Error fetching patient details:', err);
      }
    };

    if (genderOptions.length > 0) {
      fetchPatientDetails();
    }
  }, [genderOptions]);

  useEffect(() => {
    const fetchMedicalInfo = async () => {
      const patientID = sessionStorage.getItem('patientID');
      if (!patientID) return;

      try {
        const res = await api.get(
          `/Patient/GetMedicalInformation?PatientID=${patientID}`,
        );
        const data = res.data;

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const info = data.data[0];

          const bloodGroupName =
            bloodGroups.find((group) => group.appLOVID === info.bloodGroupID)
              ?.name || '';

          // Format the fetched data to match the section structure
          const formatted = {
            height: info.height?.toString() || '',
            weight: info.weight?.toString() || '',
            bloodGroup: bloodGroupName,
          };

          setSections([formatted]); // Set the sections state to include the fetched data
        } else {
          // ✅ If no data found, ensure that at least one empty section is present
          setSections([{ height: '', weight: '', bloodGroup: '' }]);
        }
      } catch (error) {
        console.error('Error fetching medical info:', error);
        // ✅ Fallback to one empty section if the API call fails
        setSections([{ height: '', weight: '', bloodGroup: '' }]);
      }
    };

    // Fetch data when bloodGroups are available
    if (bloodGroups.length > 0) {
      fetchMedicalInfo();
    }
  }, [bloodGroups]);

  // ✅ No patientID here, use sessionStorage directly

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userID = sessionStorage.getItem('userID');
    const patientID = sessionStorage.getItem('patientID');

    if (!userID || !patientID) {
      toast.error('User ID or Patient ID is missing.');
      return;
    }

    console.log('🧠 userID from session:', userID);
    console.log('🧠 patientID from session:', patientID);

    const matchedGender = genderOptions.find(
      (g) => g.name.toLowerCase() === formData.patientGender?.toLowerCase(),
    );

    // Prepare the form data with updated values
    const updatedFormData = {
      ...formData,
      patientID: formData.patientID || patientID,
      patientDateOfBirth: new Date(formData.patientDateOfBirth).toISOString(),
      userID,
      createdBy: 'eb50fd87-2ef9-4d12-fb2e-08dd175f4646',
      isActive: true,
      patientGender: formData.patientGender
        ? formData.patientGender
        : matchedGender?.code || '',
      updatedBy: userID,
    };

    console.log('📝 Submitting form with:', updatedFormData);

    // Check if any actual changes have been made
    const hasChanges =
      formData.patientGender !== updatedFormData.patientGender ||
      formData.patientDateOfBirth !== updatedFormData.patientDateOfBirth;

    if (!hasChanges) {
      toast.info('No changes detected. No need to save.');
      return; // Prevent submission if no changes
    }

    try {
      const response = await api.put(`/Patient/${patientID}`, updatedFormData);

      console.log('✅ SaveBasicDetails Response:', response.data);

      if (response.data?.success && response.data?.data) {
        toast.success('Basic details updated successfully!');
        return {
          isValid: true,
          errors: {},
        };
      } else {
        toast.error(response.data?.message || 'Failed to save basic details');
        return {
          isValid: false,
          errors: {
            general: response.data?.message || 'Failed to save basic details',
          },
        };
      }
    } catch (error) {
      console.error('🚨 Error saving basic details:', error);
      toast.error('Network or server error while saving basic details.');
      return {
        isValid: false,
        errors: {
          general: 'Network or server error while saving basic details.',
        },
      };
    }
  };

  const validateAddress = (address: Address, index: number) => {
    const errors: { [key: string]: string } = {};

    if (!address.addressType) errors.addressType = 'Address type is required'; // ✅ Match this to your form field
    if (!address.address1) errors.address1 = 'Address line 1 is required';
    if (!address.address2) errors.address2 = 'Address line 2 is required';
    if (!address.city) errors.city = 'City is required';
    if (!address.district) errors.district = 'District is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zipCode) errors.zipCode = 'Zip code is required';

    setFormErrors((prev) => ({ ...prev, [index]: errors }));
  };

  const handleSelectAddress = (index: number) => {
    const newTouched = { ...touchedFields };
    Object.keys(addresses[index]).forEach((field) => {
      newTouched[`${index}-${field}`] = true;
    });
    setTouchedFields(newTouched);
    validateAddress(addresses[index], index);
  };

  const handleAddressSubmit = async () => {
    const allErrors: { [index: number]: { [field: string]: string } } = {};
    const userID = sessionStorage.getItem('userID');
    const patientID = sessionStorage.getItem('patientID');
    const hasPrimary = addresses.some((addr) => addr.isPrimary);

    if (!hasPrimary) {
      toast.error('Please select a primary address before submitting.');
      return;
    }

    if (!patientID) {
      toast.error('Patient ID is missing. Please save patient details first.');
      return {
        isValid: false,
        errors: { general: 'Patient ID is required.' },
      };
    }

    let hasError = false;
    const addressPayloads: any[] = [];

    // Regex patterns
    const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
    const noOnlySpaces = /\S/;
    const notRepeatedChar = /^(?!([a-zA-Z0-9])\1{5,})/;
    const onlyAlphaNumericAndSpaces = /^[a-zA-Z0-9\s/]+$/;
    const onlyAlphabets = /^[a-zA-Z\s]+$/;

    const hasAddressChanged = (current: any, original: any) => {
      const fields = [
        'address1',
        'address2',
        'city',
        'district',
        'state',
        'zipCode',
        'addressType',
      ];
      return fields.some((field) => current[field] !== original[field]);
    };

    for (let index = 0; index < addresses.length; index++) {
      const address = addresses[index];
      const errors: { [key: string]: string } = {};

      // Skip if already saved and no changes
      if (
        address.isSaved &&
        !hasAddressChanged(address, address.original || {})
      ) {
        console.log(
          `Skipping address at index ${index} - already saved and unchanged.`,
        );
        continue;
      }

      const validateField = (
        field: string,
        fieldName: string,
        pattern: RegExp,
        minLength: number = 1,
        message = 'Invalid format.',
      ) => {
        if (!field || !noOnlySpaces.test(field)) {
          errors[fieldName] = 'This field is required.';
        } else if (!noEmojis.test(field)) {
          errors[fieldName] = 'No emojis allowed.';
        } else if (!notRepeatedChar.test(field)) {
          errors[fieldName] = 'No repetitive characters.';
        } else if (!pattern.test(field) || field.length < minLength) {
          errors[fieldName] = message;
        }
      };

      const validateAddressLine = (field: string, fieldName: string) => {
        const alphaNumericSlash = /^[a-zA-Z0-9\s/]+$/;
        const noTripleRepeat = /^(?!.*([a-zA-Z])\1{2,}).+$/;
        const atLeastOneLetter = /[a-zA-Z]/;
        const containsNumber = /\d/;

        if (!field || !noOnlySpaces.test(field)) {
          errors[fieldName] = 'This field is required.';
        } else if (!noEmojis.test(field)) {
          errors[fieldName] = 'No emojis allowed.';
        } else if (!alphaNumericSlash.test(field)) {
          errors[fieldName] =
            'Only alphanumeric characters, spaces, and slashes allowed.';
        } else if (field.length < 3) {
          errors[fieldName] = 'Minimum 3 characters required.';
        } else if (!atLeastOneLetter.test(field)) {
          errors[fieldName] = 'Must contain at least one alphabet letter.';
        } else if (!containsNumber.test(field)) {
          errors[fieldName] = 'Must contain at least one number.';
        } else if (!noTripleRepeat.test(field)) {
          errors[fieldName] =
            'No character should repeat more than twice consecutively.';
        }
      };

      // Address 1 & 2
      validateAddressLine(address.address1, 'address1');
      validateAddressLine(address.address2, 'address2');

      if (!address.city || address.city.trim() === '') {
        errors.city = 'City is required.';
      } else if (showCityInput) {
        if (!noEmojis.test(address.city)) {
          errors.city = 'No emojis allowed.';
        } else if (!onlyAlphabets.test(address.city)) {
          errors.city = 'Only alphabets and spaces allowed.';
        } else if (address.city.trim().length < 2) {
          errors.city = 'City must be at least 2 characters.';
        }
      }

      if (!address.state) errors.state = 'Please select a state.';
      if (!address.district) errors.district = 'Please select a district.';
      if (!address.zipCode) errors.zipCode = 'Please select a pincode.';

      validateField(
        address.addressType,
        'addressType',
        onlyAlphaNumericAndSpaces,
        1,
        'Only alphanumeric characters and spaces allowed.',
      );

      if (Object.keys(errors).length > 0) {
        allErrors[index] = errors;
        hasError = true;
        continue;
      }

      addressPayloads.push({
        createdBy: userID,
        updatedBy: userID,
        isActive: true,
        id: patientID,
        type: 'Patient',
        addressType: address.addressType || '',
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        district: address.district || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        isPrimary: !!address.isPrimary,
      });
    }

    // API call moved **outside the loop**, send entire array once:
    if (addressPayloads.length > 0) {
      try {
        await api.post('/Address', addressPayloads);
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isSaved: true,
            original: { ...addr },
          })),
        );
      } catch (error) {
        console.error('Failed to save address array:', error);
        toast.error('Failed to save addresses. Please try again.');
        setFormErrors(allErrors);
        return {
          isValid: false,
          errors: allErrors,
        };
      }
    }

    setFormErrors(allErrors);

    if (hasError) {
      return {
        isValid: false,
        errors: allErrors,
      };
    }

    toast.success('All addresses saved successfully!');
    return {
      isValid: true,
      errors: {},
    };
  };

  const handleMedicalSubmit = async () => {
    const updatedErrors: { [index: number]: { [field: string]: string } } = {};
    const patientID = sessionStorage.getItem('patientID');

    // Regex to disallow emojis, special characters, and whitespace
    const onlyDigits = /^\d+(\.\d+)?$/; // allows numbers and optional decimal
    const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
    const noOnlySpaces = /\S/;

    sections.forEach((section, index) => {
      const fieldErrors: { [field: string]: string } = {};

      // Height validation
      if (!section.height || !noOnlySpaces.test(section.height)) {
        fieldErrors.height = 'Height is required.';
      } else if (!onlyDigits.test(section.height)) {
        fieldErrors.height = 'Height must contain digits only.';
      } else if (!noEmojis.test(section.height)) {
        fieldErrors.height = 'Emojis are not allowed.';
      } else {
        const heightValue = parseFloat(section.height);
        if (isNaN(heightValue) || heightValue < 50 || heightValue > 250) {
          fieldErrors.height = 'Height must be between 50 cm and 250 cm.';
        }
      }

      // Weight validation
      if (!section.weight || !noOnlySpaces.test(section.weight)) {
        fieldErrors.weight = 'Weight is required.';
      } else if (!onlyDigits.test(section.weight)) {
        fieldErrors.weight = 'Weight must contain digits only.';
      } else if (!noEmojis.test(section.weight)) {
        fieldErrors.weight = 'Emojis are not allowed.';
      } else {
        const weightValue = parseFloat(section.weight);
        if (isNaN(weightValue) || weightValue < 10 || weightValue > 200) {
          fieldErrors.weight = 'Weight must be between 10 kg and 200 kg.';
        }
      }

      // Blood Group validation
      if (!section.bloodGroup) {
        fieldErrors.bloodGroup = 'Blood Group is required.';
      }

      if (Object.keys(fieldErrors).length > 0) {
        updatedErrors[index] = fieldErrors;
      }
    });

    setFormErrors(updatedErrors);

    // Stop if any errors
    if (Object.keys(updatedErrors).length > 0) {
      toast.error('Please correct the errors before submitting.'); // Toast error for validation issues
      return {
        isValid: false,
        errors: updatedErrors,
      };
    }

    // If valid, save data
    try {
      const medicalInfo = {
        patientsID: patientID,
        height: parseFloat(sections[0].height),
        weight: parseFloat(sections[0].weight),
        bloodGroupID: bloodGroups.find(
          (group) => group.name === sections[0].bloodGroup,
        )?.appLOVID,
        createdBy: 'dd606a34-6e0a-4b0f-8cfd-8e9138267627',
      };

      await api.post('/Patient/SaveMedicalInformation', medicalInfo);

      toast.success('Medical Information saved successfully!'); // Toast success for successful submission
      return {
        isValid: true,
        errors: {},
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message
        ? `Failed: ${error.response.data.message}`
        : 'Failed to save Medical Information.';

      toast.error(errorMessage); // Toast error for failure
      return {
        isValid: false,
        errors: { general: 'Error saving Medical Information' },
      };
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const patientID = sessionStorage.getItem('patientID');

    if (!patientID) {
      toast.error('Patient ID is missing.');
      return;
    }

    const updatedBoxes = boxes.map((box) => {
      const updatedErrors = {};
      Object.keys(box).forEach((field) => {
        if (field !== 'errors') {
          updatedErrors[field] = validateField(field, box[field]);
        }
      });
      return { ...box, errors: updatedErrors };
    });

    setBoxes(updatedBoxes);

    const hasErrors = updatedBoxes.some((box) =>
      Object.values(box.errors).some((err) => err),
    );

    if (hasErrors) {
      toast.warn('Please fix the validation errors before submitting.');
      return;
    }

    const payload = updatedBoxes.map((box) => ({
      createdBy: 'dd606a34-6e0a-4b0f-8cfd-8e9138267627',
      patientsID: patientID,
      isActive: true,
      name: box.name,
      height: parseFloat(box.height) || 0,
      weight: parseFloat(box.weight) || 0,
      dateOfBirth: box.patientDateOfBirth || new Date().toISOString(),
      bloodGroupID: box.bloodGroup,
      email: box.email || '',
      phoneNumber: box.phoneNumber || '',
    }));

    try {
      const { data: result } = await api.post('/Patient/SaveFamily', payload);

      if (result.success) {
        toast.success('Family information saved successfully!');
      } else {
        toast.error('Failed to save family information.');
      }
    } catch (error) {
      console.error('Error saving family information:', error);
      toast.error('An error occurred while saving.');
    }
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);

    const updatedErrors = { ...formErrors };
    const fieldError = { ...updatedErrors[index] } || {};

    if (
      field === 'height' &&
      /^\d+$/.test(value) &&
      +value >= 50 &&
      +value <= 250
    ) {
      delete fieldError.height;
    }

    if (
      field === 'weight' &&
      /^\d+$/.test(value) &&
      +value >= 10 &&
      +value <= 200
    ) {
      delete fieldError.weight;
    }

    if (field === 'bloodGroup' && value.trim() !== '') {
      delete fieldError.bloodGroup;
    }

    updatedErrors[index] = fieldError;
    setFormErrors(updatedErrors);
  };

  // Submit the preferences to the API

  const handlePreferencesSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const userID = sessionStorage.getItem('userID');
    const patientID = sessionStorage.getItem('patientID');

    const isAnySelected = Object.values(preferences).some((value) => value);

    if (!isAnySelected) {
      setError('Please select at least one preference.');
      toast.error('Please select at least one preference.'); // Toast error for validation
      return {
        isValid: false,
        errors: { preferences: 'Please select at least one preference.' },
      };
    } else {
      setError('');
    }

    const preferencesData = {
      patientsID: patientID,
      updatedBy: userID,
      isActive: true,
      ...preferences,
      createdBy: 'dd606a34-6e0a-4b0f-8cfd-8e9138267627',
    };

    try {
      const response = await api.post(
        '/Patient/SavePreferences',
        preferencesData,
      );
      console.log('Preferences saved successfully:', response.data);
      toast.success('Preferences saved successfully!'); // Toast success for successful submission

      return {
        isValid: true,
        errors: {},
      };
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences.'); // Toast error for failure

      return {
        isValid: false,
        errors: { general: 'Failed to save preferences.' },
      };
    }
  };

  const [currentStep, setCurrentStep] = useState(1); // Track the active step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepSavedStatus, setStepSavedStatus] = useState<{
    [step: number]: boolean;
  }>({});

  const isFormValid =
    Object.values(formErrors).every((error) => error === '') &&
    Object.values(formData).every((value) => value !== '');

  const finishButtonTemplate = (handleComplete: () => void) => (
    <button className="finish-button" onClick={handleComplete}>
      Finish
    </button>
  );

  const [steps, setSteps] = useState<{ label: string }[]>([]);

  useEffect(() => {
    const formSections = ['Basic Details', 'Education', 'Experience', 'Awards'];

    const generatedSteps = formSections.map((section) => ({
      label: section,
    }));

    setSteps(generatedSteps);
  }, []);

  const isAddressFetched = useRef(false);

  useEffect(() => {
    fetchPatientAddress();
  }, []); // run only once on component mount

  const fetchPatientAddress = async () => {
    const patientID = sessionStorage.getItem('patientID');
    if (!patientID) return;

    if (isAddressFetched.current) {
      return; // Already fetched, skip
    }

    try {
      const response = await api.get(
        `/Address/getaddress?id=${patientID}&Type=Patient`,
      );

      if (response.data?.success && Array.isArray(response.data.data)) {
        const addressData = response.data.data;

        if (addressData.length === 0) {
          // Show initial empty address box
          setAddresses([
            {
              addressID: '',
              addressType: '',
              address1: '',
              address2: '',
              city: '',
              district: '',
              state: '',
              zipCode: '',
              type: '',
            },
          ]);

          // Do NOT set isAddressFetched to true, allow user retry/input
          return;
        }

        const formatted = addressData.map((addr: any) => ({
          addressID: addr.addressID || '',
          addressType: addr.addressType || '',
          address1: addr.address1 || '',
          address2: addr.address2 || '',
          city: addr.city || '',
          district: addr.district || '',
          state: addr.state || '',
          zipCode: addr.zipCode || '',
          type: addr.type || '',
          isPrimary: addr.isPrimary || false, // Add this line
        }));

        setAddresses((prevAddresses) => {
          const isSameLength = prevAddresses.length === formatted.length;
          const isExactMatch =
            isSameLength &&
            prevAddresses.every((prevAddr, idx) => {
              const newAddr = formatted[idx];
              return (
                prevAddr.addressID === newAddr.addressID &&
                prevAddr.address1 === newAddr.address1 &&
                prevAddr.address2 === newAddr.address2 &&
                prevAddr.city === newAddr.city &&
                prevAddr.district === newAddr.district &&
                prevAddr.state === newAddr.state &&
                prevAddr.zipCode === newAddr.zipCode &&
                prevAddr.addressType === newAddr.addressType
              );
            });

          return isExactMatch ? prevAddresses : formatted;
        });

        isAddressFetched.current = true;

        // Pre-fill state/district/city if data is available
        const address = formatted[0];

        if (address.state) {
          const districtRes = await api.get(
            `/Address/districts?StateCode=${address.state}`,
          );

          const districtData = districtRes.data.data || [];
          setDistricts(districtData);

          const uniquePincodes = Array.from(
            new Set(districtData.map((d: any) => d.pinCode)),
          );
          setPincodes(uniquePincodes);
        }

        if (address.district) {
          const cityRes = await api.get(
            `/Address/cities?districtName=${address.district}`,
          );

          const cityData = cityRes.data.data || [];
          setCities(cityData);

          setShowCityInput(cityData.length === 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
      // Optionally handle with user-friendly message or fallback UI
    }
  };

  <div className="step-navigation">
    {steps.map((step, index) => (
      <div
        key={index}
        className={`tab ${completedSteps.includes(index + 1) ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
        onClick={() => setCurrentStep(index + 1)} // Optional: allows clicking tabs to navigate
      >
        {step.label}
      </div>
    ))}
  </div>;

  const nextButtonTemplate = (handleNext: () => void) => (
    <div>
      <button type="button" className="base-button" onClick={handleNext}>
        Next
      </button>
    </div>
  );

  const backTemplate = (handlePrev: () => void) => (
    <button type="button" className="base-button" onClick={handlePrev}>
      Back
    </button>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="container">
        <>
          <FormWizard
            shape="circle"
            color="#2196f3"
            stepSize="sm"
            onComplete={handleComplete}
            backButtonTemplate={backTemplate}
            nextButtonTemplate={nextButtonTemplate}
            finishButtonTemplate={finishButtonTemplate}
          >
            {/* Step 1: patient details*/}
            <FormWizard.TabContent
              title="Basic Details"
              icon={
                <div
                  className="flex justify-center items-center h-10 w-10 text-white rounded-full 
          cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
                >
                  <i className="fa fa-id-card"></i>
                </div>
              }
            >
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* First Line: Name and Email */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.patientName}
                      onChange={(e) =>
                        handleFormInputChange('patientName', e.target.value)
                      }
                      placeholder="Enter your name"
                    />
                    {formErrors.patientName && (
                      <p className="text-red-500 text-sm">
                        {formErrors.patientName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.patientEmail}
                      onChange={(e) =>
                        handleFormInputChange('patientEmail', e.target.value)
                      }
                      placeholder="Enter your email"
                    />
                    {formErrors.patientEmail && (
                      <p className="text-red-500 text-sm">
                        {formErrors.patientEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Second Line: Phone, Date of Birth, and Gender */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.patientPhoneNumber}
                      onChange={(e) =>
                        handleFormInputChange(
                          'patientPhoneNumber',
                          e.target.value,
                        )
                      }
                      placeholder="Enter your phone number"
                    />
                    {formErrors.patientPhoneNumber && (
                      <p className="text-red-500 text-sm">
                        {formErrors.patientPhoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div className="relative">
                      <input
                        ref={dateInputRef}
                        type={inputType}
                        onFocus={() => setInputType('date')}
                        onBlur={() => {
                          if (!formData.patientDateOfBirth) {
                            setInputType('text');
                          }
                        }}
                        max={new Date().toISOString().split('T')[0]} // disables today and future dates
                        className="custom-date-input w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={formData.patientDateOfBirth}
                        onChange={(e) =>
                          handleFormInputChange(
                            'patientDateOfBirth',
                            e.target.value,
                          )
                        }
                        placeholder="Date of birth"
                      />

                      <img
                        src={CalendarIcon}
                        alt="calendar"
                        onClick={() => dateInputRef.current?.showPicker()}
                        className="w-6 h-6 absolute right-1 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        style={{
                          filter:
                            'invert(50%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(90%)',
                        }}
                      />

                      {formErrors.patientDateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.patientDateOfBirth}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <select
                        name="patientGender"
                        value={formData.patientGender}
                        className="custom-date-input w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
  text-black outline-none focus:border-primary dark:border-form-strokedark 
  dark:bg-form-input dark:text-white dark:focus:border-primary"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            patientGender: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Gender</option>
                        {genderOptions.map((gender) => (
                          <option key={gender.code} value={gender.code}>
                            {gender.name}
                          </option>
                        ))}
                      </select>

                      {formErrors.patientGender && (
                        <p className="text-red-500 text-sm">
                          {formErrors.patientGender}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <CustomButton type="submit">Save Basic Details</CustomButton>
                </div>
              </form>
            </FormWizard.TabContent>

            {/* Step 2: patient address */}

            <FormWizard.TabContent
              title="Address"
              icon={
                <div
                  className="flex justify-center items-center h-10 w-10 text-white rounded-full 
      cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
                >
                  <i className="fa fa-map-marker-alt text-lg"></i>
                </div>
              }
            >
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  // handleSubmit will only handle the current form state
                  handleAddressSubmit();
                }}
              >
                <h2 className="text-lg font-bold text-black-700 text-left mt-8">
                  Address
                </h2>
                {addresses &&
                  addresses.length > 0 &&
                  addresses.map((address, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectAddress(index)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      {/* Address Type */}
                      <div className="mb-4">
                        <div className="flex flex-col">
                          <select
                            className="w-[200px] rounded-lg border border-stroke p-2 pl-4 text-black outline-none bg-transparent dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={address.addressType}
                            onChange={(e) =>
                              updateAddress(
                                index,
                                'addressType',
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Select Address Type</option>
                            {addressTypes.map((type) => (
                              <option key={type.appLOVID} value={type.name}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                          {formErrors[index]?.addressType && (
                            <p className="text-red-500 text-sm mt-1 text-left">
                              {formErrors[index].addressType}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <input
                            type="text"
                            maxLength={20}
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={address.address1}
                            onChange={(e) =>
                              updateAddress(index, 'address1', e.target.value)
                            }
                            placeholder="Enter address line 1"
                          />
                          {formErrors[index]?.address1 && (
                            <p className="text-red-500 text-sm">
                              {formErrors[index].address1}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            maxLength={20}
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={address.address2}
                            onChange={(e) =>
                              updateAddress(index, 'address2', e.target.value)
                            }
                            placeholder="Enter address line 2"
                          />
                          {formErrors[index]?.address2 && (
                            <p className="text-red-500 text-sm">
                              {formErrors[index].address2}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* City, District, State, Zip Code */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Section 1: State & District */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <select
                              value={address.state || ''}
                              onChange={(e) => handleStateChange(e, index)}
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              <option value="">Select State</option>
                              {states.map((state) => (
                                <option key={state.id} value={state.stateName}>
                                  {state.stateName}
                                </option>
                              ))}
                            </select>
                            {formErrors[index]?.state && (
                              <p className="text-red-500 text-sm">
                                {formErrors[index].state}
                              </p>
                            )}
                          </div>

                          <div>
                            <select
                              value={address.district || ''}
                              onChange={(e) => handleDistrictChange(e, index)}
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              <option value="">Select District</option>
                              {[
                                ...new Map(
                                  districts.map((d) => [d.districtName, d]),
                                ).values(),
                              ].map((dist) => (
                                <option key={dist.id} value={dist.districtName}>
                                  {dist.districtName}
                                </option>
                              ))}
                            </select>
                            {formErrors[index]?.district && (
                              <p className="text-red-500 text-sm">
                                {formErrors[index].district}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Section 2: Pincode & City */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <select
                              value={address.zipCode || ''}
                              onChange={(e) =>
                                updateAddress(index, 'zipCode', e.target.value)
                              }
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              <option value="">Select Pincode</option>
                              {pincodes.map((pin, index) => (
                                <option key={index} value={pin}>
                                  {pin}
                                </option>
                              ))}
                            </select>

                            {formErrors[index]?.zipCode && (
                              <p className="text-red-500 text-sm">
                                {formErrors[index].zipCode}
                              </p>
                            )}
                          </div>

                          <div>
                            {showCityInput ? (
                              <>
                                <input
                                  type="text"
                                  value={address.city || ''}
                                  maxLength={20}
                                  onChange={(e) => {
                                    updateAddress(
                                      index,
                                      'city',
                                      e.target.value,
                                    );
                                    setManualCity(e.target.value);
                                  }}
                                  placeholder="Enter City"
                                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                />

                                {formErrors[index]?.city && (
                                  <p className="text-red-500 text-sm">
                                    {formErrors[index].city}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <select
                                  value={address.city || ''}
                                  onChange={(e) =>
                                    updateAddress(index, 'city', e.target.value)
                                  }
                                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                >
                                  <option value="">Select City</option>
                                  {cities.map((city) => (
                                    <option key={city.id} value={city.cityName}>
                                      {city.cityName}
                                    </option>
                                  ))}
                                </select>

                                {formErrors[index]?.city && (
                                  <p className="text-red-500 text-sm">
                                    {formErrors[index].city}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end items-end space-x-2 mt-4">
                        <input
                          type="checkbox"
                          checked={address.isPrimary}
                          onChange={() => handlePrimaryCheckbox(index)}
                          id={`primary-checkbox-${index}`}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <label
                          htmlFor={`primary-checkbox-${index}`}
                          className="text-sm text-black"
                        >
                          Set as Primary
                        </label>
                      </div>
                    </div>
                  ))}
                {/* Add New Address */}
                <div className="flex items-center justify-end gap-1">
                  <div
                    className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                    onClick={addAddress}
                  >
                    +
                  </div>
                  <span className="text-sm font-medium text-black-600">
                    Add
                  </span>
                </div>

                <div className="flex justify-end">
                  <CustomButton type="submit">Save Address</CustomButton>
                </div>
              </form>
            </FormWizard.TabContent>

            {/* Step 3: patient medical info */}

            <FormWizard.TabContent
              title="Medical Information"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="fa fa-medkit text-lg"></i>
                </div>
              }
            >
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  // handleSubmit will only handle the current form state
                  handleMedicalSubmit();
                }}
              >
                <h2 className="text-lg font-bold text-black-700 text-left">
                  Medical Information
                </h2>

                <div>
                  {sections.map((section, index) => (
                    <div
                      key={index}
                      className="border border-stroke p-4 mt-4 rounded-lg"
                    >
                      {/* Fields: Height, Weight, Blood Group */}
                      <div className="flex items-center gap-4">
                        {/* Height */}
                        <div className="w-full flex flex-col">
                          <input
                            type="text"
                            placeholder="Height (cm)"
                            value={section.height}
                            onChange={(e) =>
                              handleChange(index, 'height', e.target.value)
                            }
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                            min={50}
                            max={250}
                          />
                          {formErrors[index]?.height && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors[index].height}
                            </p>
                          )}
                        </div>

                        {/* Weight */}
                        <div className="w-full flex flex-col">
                          <input
                            type="text"
                            placeholder="Weight (kg)"
                            value={section.weight}
                            onChange={(e) =>
                              handleChange(index, 'weight', e.target.value)
                            }
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                            min={10}
                            max={200}
                          />
                          {formErrors[index]?.weight && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors[index].weight}
                            </p>
                          )}
                        </div>

                        {/* Blood Group */}
                        <div className="w-full flex flex-col">
                          <select
                            value={section.bloodGroup}
                            onChange={(e) =>
                              handleChange(index, 'bloodGroup', e.target.value)
                            }
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                          >
                            <option value="">Select Blood Group</option>
                            {bloodGroups.map((group) => (
                              <option key={group.appLOVID} value={group.name}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                          {formErrors[index]?.bloodGroup && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors[index].bloodGroup}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end mt-4 ">
                    <CustomButton type="submit">
                      Save medical information
                    </CustomButton>
                  </div>
                </div>
              </form>
            </FormWizard.TabContent>

            {/* Step 4: patient prefrences */}

            <FormWizard.TabContent
              title="Preferences"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="fa fa-cogs text-lg"></i>
                </div>
              }
            >
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePreferencesSubmit(e); // Pass the event to the handler
                }}
              >
                <h2 className="text-lg font-bold text-black-700 text-left">
                  Preferences
                </h2>

                <div style={gridStyle}>
                  {checkboxes.map((label, index) => {
                    const checkboxName = label
                      .toLowerCase()
                      .replace(/\s+/g, '');
                    return (
                      <label key={index} style={itemStyle}>
                        <input
                          type="checkbox"
                          name={checkboxName}
                          checked={preferences[checkboxName] || false}
                          onChange={handleCheckboxChange}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-4 ">
                  <CustomButton type="submit">Save prefrences</CustomButton>
                </div>
                {error && (
                  <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>
                )}
              </form>
            </FormWizard.TabContent>

            {/* Step 5: Patient Family members */}
            <FormWizard.TabContent
              title="Family"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="fa fa-users text-lg"></i>
                </div>
              }
            >
              <form className="space-y-6" onSubmit={handleFormSubmit}>
                <h2 className="text-lg font-bold text-black-700 text-left">
                  Family Members Information
                </h2>

                <div>
                  {boxes.map((box, index) => (
                    <div
                      key={index}
                      className="border border-stroke p-4 mt-4 rounded-lg"
                    >
                      {/* Name, Email, and Phone in one row */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Name */}
                        <div>
                          <input
                            type="text"
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={box.name}
                            onChange={(e) =>
                              handleInputChange(index, 'name', e.target.value)
                            }
                            placeholder="Enter the name"
                          />
                          {box.errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {box.errors.name}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <input
                            type="email"
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={box.email}
                            onChange={(e) =>
                              handleInputChange(index, 'email', e.target.value)
                            }
                            placeholder="Enter the email"
                          />
                          {box.errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {box.errors.email}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <input
                            type="tel"
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={box.phoneNumber}
                            maxLength={10}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                'phoneNumber',
                                e.target.value,
                              )
                            }
                            placeholder="Enter the number"
                          />
                          {box.errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">
                              {box.errors.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Age, Blood Group, Height, Weight, Gender, and PAN in the second row (6 columns) */}
                      <div className="grid grid-cols-6 gap-4 mt-4">
                        {/* Date of Birth */}
                        <div className="col-span-2">
                          <input
                            type={box.showDateInput ? 'date' : 'text'}
                            onFocus={(e) =>
                              handleInputChange(index, 'showDateInput', true)
                            }
                            onBlur={(e) => {
                              if (!box.patientDateOfBirth) {
                                handleInputChange(
                                  index,
                                  'showDateInput',
                                  false,
                                );
                              }
                            }}
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={box.patientDateOfBirth}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                'patientDateOfBirth',
                                e.target.value,
                              )
                            }
                            placeholder="Date of birth"
                            max={new Date().toISOString().split('T')[0]} // Disallows future dates and today
                          />
                          {box.errors.patientDateOfBirth && (
                            <p className="text-red-500 text-sm mt-1">
                              {box.errors.patientDateOfBirth}
                            </p>
                          )}
                        </div>

                        {/* Blood Group */}
                        <div className="col-span-2">
                          <select
                            value={box.bloodGroup}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                'bloodGroup',
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                          >
                            <option value="">Select Blood Group</option>
                            {bloodGroups.map((group) => (
                              <option
                                key={group.appLOVID}
                                value={group.appLOVID}
                              >
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Height */}
                        <div className="col-span-1 relative">
                          <input
                            type="number"
                            className="w-full hide-number-arrows rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={box.height ?? ''}
                            onChange={(e) => {
                              const val = e.target.value.slice(0, 3); // Limit to 3 digits
                              handleInputChange(index, 'height', val);
                            }}
                            placeholder="Height"
                          />
                          {box.errors.height && (
                            <p className="text-red-500 text-sm mt-1">
                              {box.errors.height}
                            </p>
                          )}
                        </div>

                        {/* Weight */}
                        <div className="col-span-1 relative">
                          <input
                            type="text"
                            className="w-full hide-number-arrows rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={box.weight ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;

                              // Allow numbers like 10, 10.5, 123.45 and prevent characters
                              const decimalRegex = /^\d{0,3}(\.\d{0,2})?$/;

                              if (val === '' || decimalRegex.test(val)) {
                                handleInputChange(index, 'weight', val);
                              }
                            }}
                            placeholder="Weight"
                          />
                          {box.errors.weight && (
                            <p className="text-red-500 text-sm mt-1">
                              {box.errors.weight}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Button */}
                  <div className="flex items-center justify-end gap-1 mt-4">
                    <div
                      className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                      onClick={handleAddBox}
                    >
                      +
                    </div>
                    <span className="text-sm font-medium text-black-600">
                      Add
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
                >
                  Submit
                </button>
              </form>
            </FormWizard.TabContent>
          </FormWizard>

          {/* Popup */}
          {isPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] text-center">
                <h3 className="text-xl font-bold">
                  Profile Completed Successfully
                </h3>
                <button
                  onClick={handleClosePopup}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />

          {/* Inline styles */}
          <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");

        .main-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
         .validation-summary {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.validation-summary h4 {
  color: #856404;
  margin-bottom: 8px;
}
.tab {
  padding: 10px 20px;
  border: 1px solid #ccc;
  cursor: pointer;
}
.tab.active {
  background-color: #007bff;
  color: white;
}
.tab.completed {
  background-color: #28a745; /* ✅ Green for completed steps */
  color: white;
}

.validation-summary ul {
  padding-left: 20px;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}
.error-text {
  color: red;
  font-size: 0.9rem;
  margin-top: 4px;
}

.form-group {
  margin-bottom: 16px;
}


        .title {
          margin-top: 40px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
        }
           /* Responsive styles */
  @media (max-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .w-[500px] {
      width: 100%;
    }

    .text-lg {
      font-size: 1rem;
    }

    .space-y-4 > *:not(:last-child) {
      margin-bottom: 1rem;
    }

    .h-10 {
      height: 2.5rem;
    }
  }

   .base-button {
  background: linear-gradient(to bottom, #004A99, #007BFF);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  transition: background 0.15s ease-out;
  cursor: pointer;
}

.base-button:hover {
  background: linear-gradient(to bottom, #007BFF, #004A99);
  transition: background 0.15s ease-in;
}


.wizard .nav-tabs > li.completed > a {
  background-color: green !important;
  color: white !important;
}

  @media (min-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
    
      
        .wizard-card-footer{
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
        .base-button {
          background-color: blue;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
          }
          
          .base-button:hover {
          background-color: navy;
          }
          
          .base-button:focus {
          outline: none;
          }
          
          .base-button:active {
          transform: translateY(2px);
          }

        .finish-button{
          background-color: green;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
        }
        .finish-button:hover {
          background-color: darkgreen;
          }
        
        .finish-button:focus {
          outline: none;
         }
          
        .finish-button:active {
          transform: translateY(2px);
         }
      


      `}</style>
        </>
      </div>
    </div>
  );
};

export default PatientFormWizard;
