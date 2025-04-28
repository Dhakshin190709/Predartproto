import React, { useState, useEffect, useRef } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import CalendarIcon from '../../images/icon/calendar.svg';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

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

  const [genderOptions, setGenderOptions] = useState<string[]>([]); // State to store gender options
  const dateInputRef = useRef(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isFormReady, setIsFormReady] = useState(true);

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
  const [addresses, setAddresses] = useState([
    {
      addressType: '',
      address1: '',
      address2: '',
      city: '',
      district: '',
      state: '',
      zipCode: '',
      type: 'patient', // Default type, can be updated dynamically
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
    fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data); // Check the structure
        const filteredBloodGroups = data.data.filter(
          (item) => item.type === 'Bloodgroup',
        );
        setBloodGroups(filteredBloodGroups);
      })
      .catch((error) => console.error('Error fetching blood groups:', error));
  }, []);

  const [addressTypes, setAddressTypes] = useState([]);

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV')
      .then((response) => response.json())
      .then((data) => {
        const filteredAddressTypes = data.data.filter(
          (item) => item.type === 'Address',
        );
        setAddressTypes(filteredAddressTypes);
      })
      .catch((error) => console.error('Error fetching address types:', error));
  }, []);

  useEffect(() => {
    const fetchFamilyData = async () => {
      const patientID = sessionStorage.getItem('patientID');
      try {
        const response = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Patient/GetFamily?PatientID=${patientID}`,
        );
        const result = await response.json();

        if (result.success && result.data) {
          const item = result.data;
          const mappedBox = {
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
          };
          setBoxes([mappedBox]); // wrap in array since your state expects an array
        }
      } catch (error) {
        console.error('Error fetching family data:', error);
      }
    };

    fetchFamilyData();
  }, []);

  useEffect(() => {
    const patientID = sessionStorage.getItem('patientID');
    if (!patientID) return;

    axios
      .get(
        `https://predart003-001-site1.anytempurl.com/api/Patient/GetPreferences?PatientID=${patientID}`,
      )
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
    setAddresses([
      ...addresses,
      {
        addressType: '',
        address1: '',
        address2: '',
        city: '',
        district: '',
        state: '',
        zipCode: '',
        type: 'Patient', // Default type for new address
      },
    ]);
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
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV',
          {
            params: {
              type: 'gender',
            },
          },
        );

        if (response.data && response.data.data) {
          setGenderOptions(response.data.data); // Update the gender options
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

  // Handle checkbox state change
  // const handleCheckboxChange = (e) => {
  //   const { name, checked } = e.target;

  //   setPreferences((prevState) => ({
  //     ...prevState,
  //     [name]: checked,
  //   }));
  // };

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
            : /^\d{10}$/.test(value)
              ? ''
              : 'Phone number must be exactly 10 digits.';

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
        const response = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Patient/GetPatientByUserID`,
          { params: { userId: userID } },
        );

        const data = response.data.data;

        const matchedGender = genderOptions.find(
          (gender) =>
            gender.code.toUpperCase() === data.patientGender?.toUpperCase(),
        );

        // ✅ Store patientID into sessionStorage
        if (data.patientID) {
          sessionStorage.setItem('patientID', data.patientID);
        }

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
      console.log(patientID);
      try {
        const response = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Patient/GetMedicalInformation?PatientID=${patientID}`,
        );
        const data = await response.json();

        if (data.success && data.data) {
          const info = data.data;

          const bloodGroupName =
            bloodGroups.find((group) => group.appLOVID === info.bloodGroupID)
              ?.name || '';

          setSections([
            {
              height: info.height?.toString() || '',
              weight: info.weight?.toString() || '',
              bloodGroup: bloodGroupName,
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching medical info:', error);
      }
    };

    fetchMedicalInfo();
  }, [patientID, bloodGroups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userID = sessionStorage.getItem('userID');
      const patientID = sessionStorage.getItem('patientID');

      console.log('🧠 userID from session:', userID);
      console.log('🧠 patientID from session:', patientID);

      const updatedFormData = {
        ...formData,
        patientID: formData.patientID || patientID,
        patientDateOfBirth: new Date(formData.patientDateOfBirth).toISOString(),
        userID, // Include userID for reference
        createdBy: 'eb50fd87-2ef9-4d12-fb2e-08dd175f4646',
        isActive: true,
        patientGender: formData.patientGender || '',
        updatedBy: userID,
      };

      console.log('📝 Submitting form with:', updatedFormData);

      const response = await axios.put(
        `https://predart003-001-site1.anytempurl.com/api/Patient/${patientID}`,
        updatedFormData,
      );

      console.log('✅ SaveBasicDetails Response:', response.data);

      if (response.data?.success && response.data?.data) {
        const returnedPatientId = response.data.data;

        return {
          isValid: true,
          errors: {},
        };
      } else {
        return {
          isValid: false,
          errors: {
            general: response.data?.message || 'Failed to save basic details',
          },
        };
      }
    } catch (error) {
      console.error('🚨 Error saving basic details:', error);
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

    if (!address.type) errors.type = 'Address type is required';
    if (!address.address1) errors.address1 = 'Address line 1 is required';
    if (!address.address2) errors.address2 = 'Address line 2 is required';
    if (!address.city) errors.city = 'City is required';
    if (!address.district) errors.district = 'District is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zipCode) errors.zipCode = 'Zip code is required';
    else if (!/^\d{6}$/.test(address.zipCode))
      errors.zipCode = 'Enter a valid 6-digit zip code';

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

    if (!patientID) {
      alert('Patient ID is missing. Please save patient details first.');
      return {
        isValid: false,
        errors: { general: 'Patient ID is required.' },
      };
    }

    let hasError = false;

    // Regex patterns
    // Regex patterns
    const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
    const noOnlySpaces = /\S/;
    const notRepeatedChar = /^(?!([a-zA-Z0-9])\1{5,})/;
    const onlyAlphaNumericAndSpaces = /^[a-zA-Z0-9\s/]+$/; // <-- Updated line

    for (let index = 0; index < addresses.length; index++) {
      const address = addresses[index];
      const errors: { [key: string]: string } = {};

      const validateField = (field: string, fieldName: string) => {
        if (!field || !noOnlySpaces.test(field)) {
          errors[fieldName] = 'This field is required.';
        } else if (!noEmojis.test(field)) {
          errors[fieldName] = 'No emojis allowed.';
        } else if (!notRepeatedChar.test(field)) {
          errors[fieldName] =
            'No repetitive characters (e.g., "aaaaaa", "111111").';
        } else if (!onlyAlphaNumericAndSpaces.test(field)) {
          errors[fieldName] =
            'Only alphanumeric characters and spaces allowed.';
        }
      };

      validateField(address.addressType, 'addressType');
      validateField(address.address1, 'address1');
      validateField(address.address2, 'address2');
      validateField(address.city, 'city');
      validateField(address.district, 'district');
      validateField(address.state, 'state');

      // ZIP code validation
      if (!address.zipCode || !/^\d{5,6}$/.test(address.zipCode)) {
        errors.zipCode = 'ZIP Code must be 5 or 6 digits.';
      } else if (/^0+$/.test(address.zipCode)) {
        errors.zipCode = 'ZIP Code cannot be all zeros.';
      }

      if (Object.keys(errors).length > 0) {
        allErrors[index] = errors;
        hasError = true;
        continue;
      }

      const addressPayload = {
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
      };

      try {
        await axios.post(
          'https://predart003-001-site1.anytempurl.com/api/Address',
          addressPayload,
        );
      } catch (error) {
        console.error(`Failed to save address at index ${index}:`, error);
        allErrors[index] = { general: 'Failed to save this address.' };
        hasError = true;
      }
    }

    setFormErrors(allErrors);

    if (hasError) {
      return {
        isValid: false,
        errors: allErrors,
      };
    }

    alert('All addresses saved successfully!');
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
  
      await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Patient/SaveMedicalInformation',
        medicalInfo,
      );
  
      alert('Medical Information saved successfully!');
      return {
        isValid: true,
        errors: {},
      };
    } catch (error: any) {
      alert(
        error?.response?.data?.message
          ? `Failed: ${error.response.data.message}`
          : 'Failed to save Medical Information.',
      );
      return {
        isValid: false,
        errors: { general: 'Error saving Medical Information' },
      };
    }
  };
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const patientID = sessionStorage.getItem('patientID');

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
      alert('Please fix the validation errors before submitting.');
      return;
    }

    const payload = {
      createdBy: 'dd606a34-6e0a-4b0f-8cfd-8e9138267627',
      patientsID: patientID,
      isActive: true,
      name: boxes[0].name,
      height: parseFloat(boxes[0].height) || 0,
      weight: parseFloat(boxes[0].weight) || 0,
      dateOfBirth: boxes[0].patientDateOfBirth || new Date().toISOString(),
      bloodGroupID: boxes[0].bloodGroup, // already the ID now
      email: boxes[0].email || '',
      phoneNumber: boxes[0].phoneNumber || '',
    };

    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Patient/SaveFamily',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (result.success) {
        alert('Family information saved successfully!');
      } else {
        alert('Failed to save family information.');
      }
    } catch (error) {
      console.error('Error saving family information:', error);
      alert('An error occurred while saving.');
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
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Patient/SavePreferences',
        preferencesData,
      );

      console.log('Preferences saved successfully:', response.data);
      alert('Preferences saved successfully!');

      return {
        isValid: true,
        errors: {},
      };
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences.');

      return {
        isValid: false,
        errors: { general: 'Failed to save preferences.' },
      };
    }
  };

  const [currentStep, setCurrentStep] = useState(1); // Track the active step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const isFormValid =
    Object.values(formErrors).every((error) => error === '') &&
    Object.values(formData).every((value) => value !== '');

  const handleStepSubmit = async (
    e: React.FormEvent,
    handleNext: () => void,
  ) => {
    e.preventDefault();

    if (!isFormReady) {
      console.warn('Form is still loading. Try again in a moment.');
      return;
    }

    console.log('✅ FormData at submit:', formData);

    let validationResult: { isValid: boolean; errors: Record<string, string> } =
      {
        isValid: false,
        errors: {},
      };

    try {
      if (currentStep === 1) {
        const submitResult = await handleSubmit(e);
        validationResult = {
          isValid: submitResult.isValid,
          errors: submitResult.errors,
        };
      } else if (currentStep === 2) {
        const addressResult = await handleAddressSubmit();
        validationResult = {
          isValid: addressResult.isValid,
          errors: addressResult.errors,
        };
      } else if (currentStep === 3) {
        const medicalResult = await handleMedicalSubmit(e);
        validationResult = {
          isValid: medicalResult.isValid,
          errors: medicalResult.errors,
        };
      } else if (currentStep === 4) {
        const preferencesResult = await handlePreferencesSubmit(e);
        validationResult = {
          isValid: preferencesResult.isValid,
          errors: preferencesResult.errors,
        };
      } else if (currentStep === 5) {
        const formResult = await handleFormSubmit(e);
        validationResult = {
          isValid: formResult.isValid,
          errors: formResult.errors,
        };
      }

      if (validationResult.isValid) {
        console.log('✅ Validation passed');
        handleNext(); // Go to next UI step
        setCompletedSteps((prev) => [...prev, currentStep]);
        setCurrentStep((prev) => prev + 1);
      } else {
        console.warn('⚠️ Missing or invalid fields:', validationResult.errors);
        setFormErrors(validationResult.errors);

        // Optional: Scroll to first error field
        const firstErrorField = Object.keys(validationResult.errors)[0];
        const el = document.querySelector(`[name="${firstErrorField}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error('🚨 Error during form submission:', error);
    }
  };

  // ✅ Next button template

  const nextButtonTemplate = (handleNext: () => void) => (
    <div>
      <button
        type="button"
        className="base-button"
        onClick={(e) => handleStepSubmit(e, handleNext)}
      >
        Next
      </button>
    </div>
  );

  // ✅ Finish button template
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

  const fetchPatientAddress = async () => {
    const patientID = sessionStorage.getItem('patientID');
    if (!patientID) return;

    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Address/getaddress?id=${patientID}&Type=Patient`,
      );

      if (response.data?.success && response.data.data) {
        const addressData = response.data.data;

        // Wrap the object in an array for your form
        const formatted = [
          {
            addressID: addressData.addressID || '',
            addressType: addressData.addressType || '',
            address1: addressData.address1 || '',
            address2: addressData.address2 || '',
            city: addressData.city || '',
            district: addressData.district || '',
            state: addressData.state || '',
            zipCode: addressData.zipCode || '',
            type: addressData.type || '',
          },
        ];

        setAddresses(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    }
  };

  useEffect(() => {
    fetchPatientAddress();
  }, []);

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

  const backTemplate = (handlePrevious: () => void) => {
    return (
      <button className="base-button" onClick={handlePrevious}>
        back
      </button>
    );
  };
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
              <form className="space-y-4">
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
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-4 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={formData.patientGender}
                        onChange={(e) =>
                          handleFormInputChange('patientGender', e.target.value)
                        }
                      >
                        <option value="">Select Gender</option>
                        {genderOptions.map((gender, index) => (
                          <option key={index} value={gender.code}>
                            {' '}
                            {/* Use the 'code' or 'name' based on your API response */}
                            {gender.name} {/* Display the gender name */}
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
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <h2 className="text-lg font-bold text-black-700 text-left mt-8">
                  Address
                </h2>

                {addresses.map((address, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectAddress(index)}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    {/* Address Type */}
                    <div className="flex justify-between items-center mb-4">
                      <select
                        className="w-[200px] rounded-lg border border-stroke bg-transparent p-2 pl-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.addressType} // Fix here: ensure it's using address.addressType
                        onChange={
                          (e) =>
                            updateAddress(index, 'addressType', e.target.value) // Update addressType
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
                        <p className="text-red-500 text-sm">
                          {formErrors[index].addressType}
                        </p>
                      )}
                    </div>

                    {/* Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <input
                          type="text"
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                      <div>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.city}
                          onChange={(e) =>
                            updateAddress(index, 'city', e.target.value)
                          }
                          placeholder="Enter city"
                        />
                        {formErrors[index]?.city && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].city}
                          </p>
                        )}
                      </div>

                      <div>
                        {/* District Input Field */}
                        <input
                          type="text"
                          placeholder="Enter District"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.district}
                          onChange={(e) =>
                            updateAddress(index, 'district', e.target.value)
                          }
                        />
                        {formErrors[index]?.district && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].district}
                          </p>
                        )}
                      </div>

                      <div>
                        {/* State Input Field */}
                        <input
                          type="text"
                          placeholder="Enter State"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.state}
                          onChange={(e) =>
                            updateAddress(index, 'state', e.target.value)
                          }
                        />
                        {formErrors[index]?.state && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].state}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.zipCode}
                          onChange={(e) =>
                            updateAddress(index, 'zipCode', e.target.value)
                          }
                          placeholder="Enter zip code"
                        />
                        {formErrors[index]?.zipCode && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].zipCode}
                          </p>
                        )}
                      </div>
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
              <form className="space-y-6">
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
              <form className="space-y-4">
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
                        {/* Age */}

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
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                          {/* Up/Down controls */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col justify-center items-center space-y-1">
                            <button
                              type="button"
                              className="text-xs text-gray-200 hover:text-black dark:hover:text-white"
                              onClick={() => {
                                const newVal = Math.min(
                                  Number(box.weight || 0) + 1,
                                  999,
                                ); // max 3 digits
                                handleInputChange(
                                  index,
                                  'weight',
                                  newVal.toString(),
                                );
                              }}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="text-xs text-gray-200 hover:text-black dark:hover:text-white"
                              onClick={() => {
                                const newVal = Math.max(
                                  Number(box.weight || 0) - 1,
                                  0,
                                ); // prevent going below 0
                                handleInputChange(
                                  index,
                                  'weight',
                                  newVal.toString(),
                                );
                              }}
                            >
                              ▼
                            </button>
                          </div>
                          {box.errors.height && (
                            <p className="text-red-500 text-sm mt-1">
                              {box.errors.height}
                            </p>
                          )}
                        </div>

                        {/* Weight */}
                        <div className="col-span-1 relative">
                          <input
                            type="text" // change to "text" to fully control decimal input
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

                          {/* Up/Down controls */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col justify-center items-center space-y-1">
                            <button
                              type="button"
                              className="text-xs text-gray-200 hover:text-black dark:hover:text-white"
                              onClick={() => {
                                const newVal = Math.min(
                                  Number(box.weight || 0) + 1,
                                  999,
                                ); // max 3 digits
                                handleInputChange(
                                  index,
                                  'weight',
                                  newVal.toString(),
                                );
                              }}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="text-xs text-gray-200 hover:text-black dark:hover:text-white"
                              onClick={() => {
                                const newVal = Math.max(
                                  Number(box.weight || 0) - 1,
                                  0,
                                ); // prevent going below 0
                                handleInputChange(
                                  index,
                                  'weight',
                                  newVal.toString(),
                                );
                              }}
                            >
                              ▼
                            </button>
                          </div>

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
