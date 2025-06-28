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
    pharmacyName: '',
    pharmacyEmail: '',
    pharmacyPhoneNumber: '',
    workHours: '',
    pharmacyCode: '',
    pharmacyTypes: '',
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
  const navigate = useNavigate();
  const validate = () => {
    const newErrors: any = {};

    const namePattern = /^(?!.*([A-Za-z])\1{2,})[A-Za-z\s]{1,30}$/;

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|org|in|co|net|edu|gov)$/i;
    const phoneRegex = /^(?!.*(\d)\1{4,})[6-9]\d{9}$/;

    const workHourPattern = /^[0-9]+$/;
    const pharmacyCodePattern = /^[A-Z0-9]{3,10}$/; // Example: 3–10 uppercase letters/digits

    // Tenant
    if (!formData.tenant) newErrors.tenant = 'Tenant is required';

    // Hospital
    if (!formData.hospital) newErrors.hospital = 'Hospital is required';
    if (!formData.pharmacyTypes)
      newErrors.pharmacyTypes = 'Pharmacy Types is required';

    // Pharmacy Name
    if (!formData.pharmacyName.trim()) {
      newErrors.pharmacyName = 'Pharmacy Name is required';
    } else if (!namePattern.test(formData.pharmacyName.trim())) {
      newErrors.pharmacyName =
        'Only alphabets and spaces allowed, no repeating characters, max 30 characters';
    } else {
      delete newErrors.pharmacyName;
    }

    // Pharmacy Email
    if (!formData.pharmacyEmail) {
      newErrors.pharmacyEmail = 'Email is required';
    } else if (!emailPattern.test(formData.pharmacyEmail)) {
      newErrors.pharmacyEmail = 'Invalid email format';
    }

    // Pharmacy Phone Number
    if (!formData.pharmacyPhoneNumber) {
      newErrors.pharmacyPhoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.pharmacyPhoneNumber)) {
      newErrors.pharmacyPhoneNumber =
        'Must be 10 digits, start with 6–9, no repeated digits.';
    } else {
      delete newErrors.pharmacyPhoneNumber;
    }

    // Work Hours
    if (!formData.workHours.trim()) {
      newErrors.workHours = 'Work hours are required';
    } else if (!workHourPattern.test(formData.workHours)) {
      newErrors.workHours = 'Only numbers allowed';
    }

    // Pharmacy Code
    // if (!formData.pharmacyCode.trim()) {
    //   newErrors.pharmacyCode = 'Pharmacy Code is required';
    // } else if (!pharmacyCodePattern.test(formData.pharmacyCode)) {
    //   newErrors.pharmacyCode = 'Invalid code (3–10 uppercase letters/numbers)';
    // }

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
    const fetchPharmacyTypes = async () => {
      try {
        const response = await api.get('/AppLOV?type=PharmacyType');
        if (response.data.success) {
          setPharmacyTypes(response.data.data);
        } else {
          console.warn('API returned success = false');
        }
      } catch (error) {
        console.error('Error fetching pharmacy types:', error);
        toast.error('Failed to load pharmacy types'); // Optional: user-facing feedback
      }
    };

    fetchPharmacyTypes();
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
    const selectedTenantId = formData.tenant || sessionStorage.getItem('tenantID');

    if (!selectedTenantId) {
      setHospitals([]);
      return;
    }

    try {
      const response = await api.get(`/Hospital/HospitalsList?tenantId=${selectedTenantId}`);
      if (Array.isArray(response.data)) {
        const activeHospitals = response.data.filter((h) => h.isActive);
        setHospitals(activeHospitals);

        // Auto-select if only one hospital
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
}, [formData.tenant]); // 🔁 Refetch hospitals whenever tenant changes

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
const maxTwoDigits = (value: string) => (value.match(/\d/g) || []).length <= 2;

if (!address.address1 || !noOnlySpaces.test(address.address1)) {
  errors.address1 = 'Address line 1 is required';
} else if (!hasText.test(address.address1)) {
  errors.address1 = 'Address must include some text';
} else if (!notRepeatedChar.test(address.address1)) {
  errors.address1 = 'Repeated characters are not allowed';
} else if (!noEmojis.test(address.address1)) {
  errors.address1 = 'Emojis are not allowed';
} else if (!onlyAllowedChars.test(address.address1)) {
  errors.address1 = 'Only letters, numbers, spaces, comma, and slash are allowed';
} else if (!maxTwoDigits(address.address1)) {
  errors.address1 = 'Only up to 2 digits are allowed';
}else if (address.address1.length < 5) {
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
  errors.address2 = 'Only letters, numbers, spaces, comma, and slash are allowed';
} else if (!maxTwoDigits(address.address2)) {
  errors.address2 = 'Only up to 2 digits are allowed';
}else if (address.address2.length < 5) {
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

  const handlePharmacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked');
    const userID = sessionStorage.getItem('userID');
    const currentDateTime = new Date().toISOString();
    const allErrors: { [field: string]: string } = {};

    // Step 1: Validate formData fields
    const isFormValid = validate();
    if (!isFormValid) return;

    // Step 2: Find the primary address (assuming 1 address is mandatory)
    const address =
      addresses.find((addr) => addr.isPrimary || !addr.isSaved) || addresses[0];

    if (!address) {
      toast.error('At least one address is required.');
      return;
    }

    // Step 3: Validate address
    const validateAddressLine = (field: string) => {
  const onlyAllowedChars = /^[a-zA-Z0-9\s,\/]+$/;
const hasText = /[a-zA-Z]/;
const noOnlySpaces = /\S/;
const notRepeatedChar = /^(?!.*(.)\1{4,}).*$/;
const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
const containsNumber = /\d/;
const atLeastOneLetter = /[a-zA-Z]/;
const noTripleRepeat = /^(?!.*(.)\1{2,}).*$/;

      return (
  field &&
  noOnlySpaces.test(field) &&
  noEmojis.test(field) &&
  onlyAllowedChars.test(field) &&
  field.length >= 3 &&
  atLeastOneLetter.test(field) &&
  containsNumber.test(field) &&
  noTripleRepeat.test(field)
);

    };

    if (!validateAddressLine(address.address1)) {
      toast.error('Invalid Address Line 1');
      return;
    }
    if (!validateAddressLine(address.address2)) {
      toast.error('Invalid Address Line 2');
      return;
    }

    // Validate city
    if (showCityInput) {
      if (!validateCity(address.city)) {
        toast.error('Invalid city name.');
        return;
      }
    }

    if (!address.city || address.city.length < 2) {
      toast.error('City is required and should be at least 2 characters');
      return;
    }

    if (!address.state || !address.district || !address.zipCode) {
      toast.error('State, District, and Zip Code are required');
      return;
    }

    // Step 4: Construct combined payload
    const payload = {
      createdBy: userID,
      createdOn: currentDateTime,
      updatedBy: userID,
      updatedOn: currentDateTime,
      isActive: true,
      tenantID: formData.tenant,
      hospitalID: formData.hospital,
      pharmacyCode: formData.pharmacyCode?.trim() || '',
      pharmacyName: formData.pharmacyName,
      pharmacyEmail: formData.pharmacyEmail,
      pharmacyPhoneNumber: formData.pharmacyPhoneNumber,
      workHours: formData.workHours,
      type: selectedType,
      address: {
        createdBy: userID,
        createdOn: currentDateTime,
        updatedBy: userID,
        updatedOn: currentDateTime,
        isActive: true,
        // id: null, // or pharmacyID
        type: 'Pharmacy', // or 'Patient'
        addressType: address.addressType || '',
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        district: address.district || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        isPrimary: true,
      },
    };

    // Step 5: Send API request
    try {
      const response = await api.post('/Pharmacy', payload);

      if (response.status === 200 || response.status === 201) {
        toast.success('Pharmacy and address saved successfully!');
        console.log('Pharmacy created successfully:', response.data);

        // Reset the form after success
        setFormData((prev) => ({
          ...prev,
          pharmacyCode: '',
          pharmacyName: '',
          pharmacyEmail: '',
          pharmacyPhoneNumber: '',
          workHours: '',
          pharmacyTypes: '',
        }));

        setAddresses([
          {
            addressType: '',
            address1: '',
            address2: '',
            city: '',
            district: '',
            state: '',
            zipCode: '',
            isPrimary: true,
            isSaved: false,
          },
        ]);

        setSelectedType('');
        setTimeout(() => {
          navigate('/Pharmacy');
        }, 2000);
      } else {
        toast.error('Pharmacy creation failed. Please try again.');
      }
    } catch (err: any) {
      console.error('API error:', err);
      toast.error(
        err.response?.data?.message || 'Network error while saving pharmacy.',
      );
    }
  };

  return (
    <div>
      {/* Back Button */}
      <button
       className="mb-4 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg shadow-sm hover:bg-blue-100 transition duration-200"
      
        onClick={() => navigate('/Pharmacy')}
      >
          &larr; Back
      </button>
      <h1 className="text-3xl font-semibold text-black text-center mb-6">
        Pharmacy Register
      </h1>
      {/* Left Column: Basic Details */}
      <form className="space-y-4" onSubmit={handlePharmacySubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                placeholder="Pharmacy Name"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                      text-black outline-none focus:border-primary dark:border-form-strokedark 
                      dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.pharmacyName}
                onChange={(e) => handleChange('pharmacyName', e.target.value)}
              />
              {errors.pharmacyName && (
                <p className="text-red-500 text-sm">{errors.pharmacyName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Pharmacy Email"
                maxLength={50}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                      text-black outline-none focus:border-primary dark:border-form-strokedark 
                      dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.pharmacyEmail}
                onChange={(e) => handleChange('pharmacyEmail', e.target.value)}
              />
              {errors.pharmacyEmail && (
                <p className="text-red-500 text-sm">{errors.pharmacyEmail}</p>
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
                  value={formData.pharmacyPhoneNumber}
                  onChange={(e) =>
                    handleChange('pharmacyPhoneNumber', e.target.value)
                  }
                />
                {errors.pharmacyPhoneNumber && (
                  <p className="text-red-500 text-sm">
                    {errors.pharmacyPhoneNumber}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={selectedType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedType(value); // still set selectedType if needed
                    handleChange('pharmacyTypes', value); // also call handleChange to clear error
                  }}
                >
                  <option value="">Select Pharmacy Type</option>
                  {pharmacyTypes.map((type: any) => (
                    <option key={type.appLOVID} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.pharmacyTypes && (
                  <p className="text-red-500 text-sm">{errors.pharmacyTypes}</p>
                )}
              </div>
            </div>

            {/* Pharmacy Code & Work Hours */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <input
                  type="text"
                  maxLength={2}
                  placeholder="Work Hours"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.workHours}
                  onChange={(e) => handleChange('workHours', e.target.value)}
                />
                {errors.workHours && (
                  <p className="text-red-500 text-sm">{errors.workHours}</p>
                )}
              </div>
              <div className="w-1/2">
                <input
                  type="hidden"
                  placeholder="Pharmacy Code"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.pharmacyCode}
                  onChange={(e) => handleChange('pharmacyCode', e.target.value)}
                />
                {errors.pharmacyCode && (
                  <p className="text-red-500 text-sm">{errors.pharmacyCode}</p>
                )}
              </div>
            </div>

            {/* Submit Button if needed */}
          </div>

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
        </div>
        <div className="flex justify-center items-center text-center space-x-4">
          <CustomButton type="submit">Save Details</CustomButton>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </form>
    </div>
  );
};

export default EPharmacyPage;
