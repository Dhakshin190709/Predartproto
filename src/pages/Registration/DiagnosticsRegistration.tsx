import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api/request';
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
const EPharmacyPage: React.FC = () => {
  const [formData, setFormData] = useState({
    tenant: '',
    hospital: '',
    labName: '',
    email: '',
    mobile: '',
    landline: '', // ✅ newly added
    workHours: '',
    labCode: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [pharmacyTypes, setPharmacyTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isTenantPrefilled, setIsTenantPrefilled] = useState(false);
  const [isHospitalPrefilled, setIsHospitalPrefilled] = useState(false);

  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [showCityInput, setShowCityInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [labFacilities, setLabFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [labTypes, setLabTypes] = useState([]);
  const [selectedLabType, setSelectedLabType] = useState('');

  const navigate = useNavigate();

  const validate = () => {
    const newErrors: any = {};

    const namePattern = /^(?!.*([A-Za-z])\1{2,})[A-Za-z\s]{1,30}$/;
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|org|in|co|net|edu|gov)$/i;
    const phoneRegex = /^(?!.*(\d)\1{4,})[6-9]\d{9}$/;
   const landlineRegex = /^(\+91[\s-]?)?[0]?[1-9][0-9]{1,3}[\s-]?[0-9]{6,8}$/;

    // ✅ Dropdown validations
    if (!formData.tenant) newErrors.tenant = 'Tenant is required';
    if (!formData.hospital) newErrors.hospital = 'Hospital is required';
    if (!selectedLabType) newErrors.labType = 'Lab Type is required';
    //if (!selectedFacility) newErrors.workHours = 'Lab Facility is required';

    // ✅ Lab Name
    if (!formData.labName.trim()) {
      newErrors.labName = 'Lab Name is required';
    } else if (!namePattern.test(formData.labName.trim())) {
      newErrors.labName =
        'Only letters and spaces allowed, max 30 characters, no repeating characters';
    }

    // ✅ Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // ✅ Mobile
    if (!formData.mobile) {
      newErrors.mobile = 'Phone number is required';
    } else if (!phoneRegex.test(formData.mobile)) {
      newErrors.mobile =
        'Must be 10 digits, start with 6–9, no repeated digits';
    }

    // ✅ Landline
    if (!formData.landline) {
      newErrors.landline = 'Landline is required';
    } else if (!landlineRegex.test(formData.landline)) {
      newErrors.landline =
        'Enter a valid landline (e.g., 044-1234567 or +91 22 12345688)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [states, setStates] = useState<State[]>([]);
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
    },
  ]);
  const [addressTypes, setAddressTypes] = useState([]);

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this specific field
    setErrors((prev: any) => ({ ...prev, [field]: '' }));
  };

  useEffect(() => {
    const sessionTenantID = sessionStorage.getItem('tenantID');
    const sessionHospitalID = sessionStorage.getItem('unitID');

    setFormData((prev) => ({
      ...prev,
      tenant: sessionTenantID || '',
      hospital: sessionHospitalID || '',
    }));

    if (sessionTenantID) setIsTenantPrefilled(true);
    if (sessionHospitalID) setIsHospitalPrefilled(true);
  }, []);

  useEffect(() => {
    const fetchLabTypes = async () => {
      try {
        const res = await api.get('/AppLOV?type=LabType');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const activeTypes = res.data.data.filter((item) => item.isActive);
          setLabTypes(activeTypes);
        }
      } catch (err) {
        console.error('Failed to fetch LabType:', err);
      }
    };

    fetchLabTypes();
  }, []);

  useEffect(() => {
    const fetchLabFacilities = async () => {
      try {
        const res = await api.get('/AppLOV?type=LabFacilities');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const activeFacilities = res.data.data.filter((f) => f.isActive);
          setLabFacilities(activeFacilities);
        }
      } catch (error) {
        console.error('Error fetching lab facilities:', error);
      }
    };

    fetchLabFacilities();
  }, []);

  useEffect(() => {
    const fetchAddressTypes = async () => {
      try {
        const response = await api.get('/AppLOV');
        const result = response.data;

        // If the API returns a success flag
        if (result.success && Array.isArray(result.data)) {
          const filteredAddressTypes = result.data.filter(
            (item) => item.type === 'Address',
          );
          setAddressTypes(filteredAddressTypes);
        } else {
          console.warn('Unexpected API response format');
        }
      } catch (error) {
        console.error('Error fetching address types:', error);
        toast.error('Failed to load address types');
      }
    };

    fetchAddressTypes();
  }, []);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/Tenant');

        if (response.data.success && Array.isArray(response.data.data)) {
          const activeTenants = response.data.data.filter((t) => t.isActive);
          setTenants(activeTenants);

          const roleName = sessionStorage.getItem('roleName');
          const tenantID = sessionStorage.getItem('tenantID');

          // Prefill only if NOT SuperAdmin
          if (roleName !== 'SuperAdmin' && tenantID) {
            setFormData((prev) => ({
              ...prev,
              tenant: tenantID,
            }));
            setIsTenantPrefilled(true); // disable dropdown
          } else {
            setIsTenantPrefilled(false); // allow SuperAdmin to select
          }
        } else {
          console.warn('Unexpected tenant response format');
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
        toast.error('Failed to load tenants');
      }
    };

    fetchTenants();
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      if (!formData.tenant) {
        setHospitals([]); // Clear hospitals if no tenant selected
        return;
      }

      try {
        const response = await api.get(
          `/Hospital/List?tenantId=${formData.tenant}`,
        );

        if (Array.isArray(response.data)) {
          const activeHospitals = response.data.filter((h) => h.isActive);
          setHospitals(activeHospitals);

          // Auto-select if only one hospital and hospital not prefilled
          if (activeHospitals.length === 1 && !isHospitalPrefilled) {
            setFormData((prev) => ({
              ...prev,
              hospital: activeHospitals[0].hospitalID,
            }));
          }
        } else {
          console.warn('Unexpected response format for hospitals');
          setHospitals([]);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        toast.error('Failed to load hospitals');
        setHospitals([]);
      }
    };

    fetchHospitals();
  }, [formData.tenant]); // 👈 Depend on selected tenant

  const handleSelectAddress = (index: number) => {
    const newTouched = { ...touchedFields };
    Object.keys(addresses[index]).forEach((field) => {
      newTouched[`${index}-${field}`] = true;
    });
    setTouchedFields(newTouched);
    validateAddress(addresses[index], index);
  };

  const validateAddress = (address: Address, index: number) => {
    const errors: { [key: string]: string } = {};

    if (!address.addressType) errors.addressType = 'Address type is required'; // ✅ Match this to your form field
    const onlyAllowedChars = /^[a-zA-Z0-9\s,\/]+$/;
    const hasText = /[a-zA-Z]/;
    const noOnlySpaces = /\S/;
    const notRepeatedChar = /^(?!.*(.)\1{4,}).*$/;
    const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
    const maxTwoDigits = (value: string) =>
      (value.match(/\d/g) || []).length <= 2;

    if (!address.address1 || !noOnlySpaces.test(address.address1)) {
      errors.address1 = 'Address line 1 is required';
    } else if (!hasText.test(address.address1)) {
      errors.address1 = 'Address must include some text';
    } else if (!notRepeatedChar.test(address.address1)) {
      errors.address1 = 'Repeated characters are not allowed';
    } else if (!noEmojis.test(address.address1)) {
      errors.address1 = 'Emojis are not allowed';
    } else if (!onlyAllowedChars.test(address.address1)) {
      errors.address1 =
        'Only letters, numbers, spaces, comma, and slash are allowed';
    } else if (!maxTwoDigits(address.address1)) {
      errors.address1 = 'Only up to 2 digits are allowed';
    } else if (address.address1.length < 5) {
      errors.address1 = 'Address is too short or not meaningful';
    }

    if (!address.address2 || !noOnlySpaces.test(address.address2)) {
      errors.address2 = 'Address line 2 is required';
    } else if (!hasText.test(address.address2)) {
      errors.address2 = 'Address must include some text';
    } else if (!notRepeatedChar.test(address.address2)) {
      errors.address2 = 'Repeated characters are not allowed';
    } else if (!noEmojis.test(address.address2)) {
      errors.address2 = 'Emojis are not allowed';
    } else if (!onlyAllowedChars.test(address.address2)) {
      errors.address2 =
        'Only letters, numbers, spaces, comma, and slash are allowed';
    } else if (!maxTwoDigits(address.address2)) {
      errors.address2 = 'Only up to 2 digits are allowed';
    } else if (address.address2.length < 5) {
      errors.address2 = 'Address is too short or not meaningful';
    }

    if (!address.city) errors.city = 'City is required';
    if (!address.district) errors.district = 'District is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zipCode) errors.zipCode = 'Zip code is required';

    setFormErrors((prev) => ({ ...prev, [index]: errors }));
  };

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get('/Address/states');

        if (response.data?.data && Array.isArray(response.data.data)) {
          setStates(response.data.data);
        } else {
          console.warn('Unexpected format in states response');
        }
      } catch (error) {
        console.error('Error fetching states:', error);
        toast.error('Failed to load states');
      }
    };

    fetchStates();
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

  const handleStateChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const stateCode = e.target.value;

    // Reset dependent fields
    setSelectedState(stateCode);
    setSelectedDistrict('');
    setCities([]);
    setShowCityInput(false);

    // Clear corresponding address fields
    updateAddress(index, 'state', stateCode);
    updateAddress(index, 'district', '');
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    try {
      const response = await api.get(
        `/Address/districts?StateCode=${stateCode}`,
      );

      if (response.data?.data && Array.isArray(response.data.data)) {
        const districts = response.data.data;
        setDistricts(districts);

        // Extract and deduplicate pin codes
        const uniquePincodes = Array.from(
          new Set(districts.map((d: District) => d.pinCode)),
        );
        setPincodes(uniquePincodes);
      } else {
        console.warn('Unexpected district data format:', response.data);
        setDistricts([]);
        setPincodes([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to load districts for the selected state.');
      setDistricts([]);
      setPincodes([]);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    setShowCityInput(false);

    // Reset related fields in address
    updateAddress(index, 'district', districtName);
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    // Update pin codes related to the selected district
    const filteredPins = districts
      .filter((item) => item.districtName === districtName)
      .map((item) => item.pinCode);

    setPincodes(filteredPins);

    try {
      const response = await api.get(
        `/Address/cities?districtName=${districtName}`,
      );
      const cityData = response.data?.data;

      if (Array.isArray(cityData) && cityData.length > 0) {
        setCities(cityData);
        setShowCityInput(false);
      } else {
        setCities([]);
        setShowCityInput(true); // No cities returned; show manual input
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to load cities for the selected district.');
      setCities([]);
      setShowCityInput(true); // Assume fallback to manual entry
    }
  };

  const validateCity = (city: string) => {
    const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u; // No emojis
    const noSpecialChars = /^[a-zA-Z\s]+$/; // Only letters and spaces allowed
    const maxLength = city.length <= 20; // Maximum length of 20 characters

    // Check if the city is valid: no emojis, no special characters, and max length of 20
    return (
      city && noEmojis.test(city) && noSpecialChars.test(city) && maxLength
    );
  };

  const handleLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked');
    const userID = sessionStorage.getItem('userID');
    const currentDateTime = new Date().toISOString();
    const allErrors: { [field: string]: string } = {};

    // 1. Validate base form
    const isFormValid = validate();
    if (!isFormValid) return;

    // 2. Construct payload as per new format
  const payload = {
  createdBy: userID,
  updatedBy: userID,
  isActive: true,
  tenantID: formData.tenant,
  hospitalID: formData.hospital,
  labName: formData.labName?.trim() || '',
  labCode: formData.labCode?.trim() || '',
  labType: selectedLabType,
  email: formData.email?.trim() || '',
  mobile: formData.mobile?.trim() || '',
  landline: formData.landline?.trim() || '',
  labFacilities: selectedFacilities.join(','), // ✅ CORRECT format for API
};


    try {
      const response = await api.post('/Laboratory', payload);

      if (response.status === 200 || response.status === 201) {
        toast.success('Laboratory saved successfully!');
        console.log('Lab created successfully:', response.data);

        // Reset fields
        setFormData({
          tenant: '',
          hospital: '',
          labName: '',
          email: '',
          mobile: '',
          landline: '',
          workHours: '',
          labCode: '',
        });

        setSelectedLabType('');
        setSelectedFacility('');

        setTimeout(() => {
          navigate('/Diagnostics'); // Navigate to listing
        }, 2000);
      } else {
        toast.error('Failed to save Laboratory. Try again.');
      }
    } catch (err: any) {
      console.error('API error:', err);
      toast.error(
        err.response?.data?.message || 'Network error while saving Laboratory.',
      );
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors: { [index: number]: { [field: string]: string } } = {};
    const userID = sessionStorage.getItem('userID');

    const hasPrimary = addresses.some((addr) => addr.isPrimary);

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

        type: 'Diagnostics',
        addressType: address.addressType || '',
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        district: address.district || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        isPrimary: true,
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

  const [facilityInput, setFacilityInput] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFacilityInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && facilityInput.trim() !== '') {
      e.preventDefault();

      if (!selectedFacilities.includes(facilityInput.trim())) {
        setSelectedFacilities([...selectedFacilities, facilityInput.trim()]);
      }
      setFacilityInput('');
    }
  };

  const handleRemove = (index: number) => {
    const updated = [...selectedFacilities];
    updated.splice(index, 1);
    setSelectedFacilities(updated);
  };

  // 🔁 Convert to comma-separated string before sending to API
  const facilitiesString = selectedFacilities.join(',');
  return (
    <div>
      {/* Back Button */}
      <button
        className="mb-4 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg shadow-sm hover:bg-blue-100 transition duration-200"
        onClick={() => navigate('/Diagnostics')}
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-semibold text-black text-center mb-6">
        Diagnostics Register
      </h1>
      {/* Left Column: Basic Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form className="space-y-4" onSubmit={handleLabSubmit}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-left mb-4">Basic Details</h2>

            {/* Tenant & Hospital */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                      text-black outline-none focus:border-primary dark:border-form-strokedark 
                      dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.tenant}
                  onChange={(e) => handleChange('tenant', e.target.value)}
                  disabled={isTenantPrefilled} // ✅ disable if prefilled
                >
                  <option value="">Select Tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.tenantID} value={tenant.tenantID}>
                      {tenant.tenantName}
                    </option>
                  ))}
                </select>
                {errors.tenant && (
                  <p className="text-red-500 text-sm">{errors.tenant}</p>
                )}
              </div>
              <div className="w-1/2">
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                      text-black outline-none focus:border-primary dark:border-form-strokedark 
                      dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.hospital}
                  onChange={(e) => handleChange('hospital', e.target.value)}
                  disabled={isHospitalPrefilled} // ✅ disable if prefilled
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((hospital) => (
                    <option
                      key={hospital.hospitalID}
                      value={hospital.hospitalID}
                    >
                      {hospital.hospitalName}
                    </option>
                  ))}
                </select>
                {errors.hospital && (
                  <p className="text-red-500 text-sm">{errors.hospital}</p>
                )}
              </div>
            </div>

            {/* Pharmacy Name */}
            <div>
              <input
                type="text"
                maxLength={30}
                placeholder="Lab Name"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                      text-black outline-none focus:border-primary dark:border-form-strokedark 
                      dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.labName}
                onChange={(e) => handleChange('labName', e.target.value)}
              />
              {errors.labName && (
                <p className="text-red-500 text-sm">{errors.labName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Lab Email"
                maxLength={50}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                      text-black outline-none focus:border-primary dark:border-form-strokedark 
                      dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Phone Number & Type */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Phone Number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                      text-black outline-none focus:border-primary dark:border-form-strokedark 
                      dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  value={selectedLabType}
                  onChange={(e) => setSelectedLabType(e.target.value)}
                  placeholder="Enter Lab Type"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                />

                {errors.labType && (
                  <p className="text-red-500 text-sm">{errors.labType}</p>
                )}
              </div>
            </div>

            {/* Pharmacy Code & Work Hours */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <div className="w-full flex flex-wrap gap-2 border border-stroke rounded-lg p-4">
                  {selectedFacilities.map((facility, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full py-4 pl-6 pr-10  flex items-center"
                    >
                      <span>{facility}</span>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="ml-2 text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={facilityInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder=" lab facilties(Type and press Enter)"
                    className="flex-grow border-none outline-none bg-transparent text-black dark:text-white"
                  />
                </div>

                {errors?.workHours && (
                  <p className="text-red-500 text-sm">{errors.workHours}</p>
                )}

                {/* Hidden input to pass to API */}
                <input
                  type="hidden"
                  name="facilitiesString"
                  value={facilitiesString}
                />
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Landline Number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.landline}
                  onChange={(e) => handleChange('landline', e.target.value)}
                />
                {errors.landline && (
                  <p className="text-red-500 text-sm">{errors.landline}</p>
                )}
              </div>
            </div>

            {/* Submit Button if needed */}
          </div>
          <div className="flex justify-center items-center text-center space-x-4">
            <CustomButton type="submit">Save Details</CustomButton>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </form>

        <form className="space-y-4" onSubmit={handleAddressSubmit}>
          {/* Right Column: Address Section */}
          <div className="space-y-4">
            {/*  address form  */}

            <h2 className="text-xl font-bold text-left mb-4">Address</h2>
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
                          updateAddress(index, 'addressType', e.target.value)
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
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.address1}
                        onChange={(e) =>
                          updateAddress(index, 'address1', e.target.value)
                        }
                        placeholder="Enter address line 1"
                        maxLength={50}
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
                        maxLength={50}
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
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                    </div>

                    {/* Section 2: Pincode & City */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-5">
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
                      <div>
                        {showCityInput ? (
                          <>
                            <input
                              type="text"
                              value={address.city || ''}
                              maxLength={20}
                              onChange={(e) => {
                                const value = e.target.value;
                                setManualCity(value); // store the value in the state
                                updateAddress(index, 'city', value);

                                if (!validateCity(value)) {
                                  setFormErrors((prev) => ({
                                    ...prev,
                                    [index]: {
                                      ...prev[index],
                                      city: 'Invalid city name',
                                    },
                                  }));
                                } else {
                                  setFormErrors((prev) => {
                                    const { city, ...rest } = prev[index] || {};
                                    return {
                                      ...prev,
                                      [index]: rest,
                                    };
                                  });
                                }
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
                              onChange={(e) => {
                                const value = e.target.value;
                                updateAddress(index, 'city', value);

                                if (!value) {
                                  setFormErrors((prev) => ({
                                    ...prev,
                                    [index]: {
                                      ...prev[index],
                                      city: 'City is required',
                                    },
                                  }));
                                } else {
                                  setFormErrors((prev) => {
                                    const { city, ...rest } = prev[index] || {};
                                    return {
                                      ...prev,
                                      [index]: rest,
                                    };
                                  });
                                }
                              }}
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
                  {/* Add this at the bottom of the address block */}
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      checked={true}
                      className="mr-2 accent-blue-500"
                    />
                    <label className="text-black dark:text-white">
                      isPrimary
                    </label>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex justify-center items-center text-center space-x-4">
            <CustomButton type="submit">Save Address Details</CustomButton>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EPharmacyPage;
