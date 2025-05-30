import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { CheckCircle, Edit } from 'lucide-react';
import { fetchHospitalAPI, fetchTenants } from '../../Utils';
import CustomButton from '../../components/CustomButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import api from '../../api/request';
import {
  checkEmailAvailability,
  checkPhoneAvailability,
} from '../Utils/validationUtils';
import { useNavigate } from 'react-router-dom';
interface RowData {
  hospitalID: number;
  hospitalName: string;
  hospitalCode: string;
  hospitalType: string;
  isActive: string;
}

const Hospital: React.FC = () => {
  const [name, setName] = useState(''); // Name filter for UI
  const [isActive, setIsActive] = useState(true); // Active filter for UI
  const [rowData, setRowData] = useState([]);
  const [tenants, setTenants] = useState([]); // State for tenant data
  const [selectedTenant, setSelectedTenant] = useState(''); // State for selected tenan
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(''); // For global search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [showConfirmation, setShowConfirmation] = useState(false); // Show confirmation for deletion
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null); // ID of row to delete
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [showCityInput, setShowCityInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const navigate = useNavigate();
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [formData, setFormData] = useState<RowData>({
    hospitalID: '',
    hospitalName: '',
    hospitalCode: '',
    hospitalType: '',
    isActive: true,
    email: '',
    mobile: '',
    landline: '',
    gst: '',
  });
  const phoneRegex = /^[6-9]\d{9}$/;
  const [states, setStates] = useState<State[]>([]);
  // const [formErrors, setFormErrors] = useState({});
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

  const [addressTypes, setAddressTypes] = useState([]);
  const [formMode, setFormMode] = useState('');
  const [isTenantPrefilled, setIsTenantPrefilled] = useState(false);
  const [isHospitalPrefilled, setIsHospitalPrefilled] = useState(false);
  const [mobileValid, setMobileValid] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  const editFormRef = useRef<HTMLDivElement | null>(null);
  // Fetch data from the API
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/Hospital/List');
        console.log('API Data:', response.data); // Debug log

        setRowData(response.data?.data || response.data); // Adjust based on actual API structure
      } catch (error: any) {
        console.error('Error fetching data:', error);
      }
    };

    fetchHospitals();
  }, []);
  // Fetch tenant data from utils
  useEffect(() => {
    fetchTenants().then(setTenants);
  }, []);

  // Handle tenant selection
  const handleTenantChange = (e) => {
    setSelectedTenant(e.target.value);
    console.log(`Selected Tenant: ${e.target.value}`);
  };

  // hospital type from appLOV

  useEffect(() => {
    const getHospitalTypes = async () => {
      const types = await fetchHospitalAPI();
      setHospitalTypes(types);
    };

    getHospitalTypes();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const address = addresses[0]; // ✅ Fix: define address from state
    const addressErrors = validateAddress(address, 0);
    if (Object.keys(addressErrors).length > 0) {
      toast.error('Please fill all required address fields.');
      return;
    }

    if (!address) {
      toast.error('Primary address is required.');
      return;
    }

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      createdBy: userID,
      createdOn: now,
      updatedBy: userID,
      updatedOn: now,
      isActive: formData.isActive,
      tenantID: selectedTenant,
      hospitalName: formData.hospitalName.trim(),
      hospitalCode: formData.hospitalCode.trim() || '',
      hospitalType: formData.hospitalType.trim(),
      email: formData.email?.trim() || '',
      mobile: formData.mobile?.trim() || '',
      landline: formData.landline?.trim() || '',
      gst: formData.gst?.trim() || '',

      address: {
        createdBy: userID,
        createdOn: now,
        updatedBy: userID,
        updatedOn: now,
        isActive: true,
        id: sessionStorage.getItem('unitID') || '',
        type: 'Hospital',
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

   try {
  const response = await api.post('/Hospital', payload);
  if (response.status === 201 || response.status === 200) {
    toast.success('Hospital and address saved successfully!');

    // ⏳ Wait 2 seconds before navigating
    setTimeout(() => {
      navigate('/hospital');
    }, 2000);
  } else {
    toast.error('Failed to save hospital. Please try again.');
  }
} catch (error) {
  console.error('API call failed:', error);
  toast.error('Failed to save hospital. Please try again.');
}

  };

  const resetForm = () => {
    setShowForm(false); // Hide the form after reset
    setFormMode(''); // Reset form mode (e.g., "Edit" or "Create")
    setFormData({
      hospitalID: '',
      hospitalName: '',
      hospitalCode: '',
      hospitalType: '',
      isActive: true, // Default to true for new entries
    });
  };
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

    if (!address.addressType) errors.addressType = 'Address type is required';
    if (!address.address1) errors.address1 = 'Address line 1 is required';
    if (!address.address2) errors.address2 = 'Address line 2 is required';
    if (!address.city) errors.city = 'City is required';
    if (!address.district) errors.district = 'District is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zipCode) errors.zipCode = 'Zip code is required';

    // Set form errors at index
    setFormErrors((prev) => ({ ...prev, [index]: errors }));

    return errors; // ✅ Return the errors
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex =
      /^[a-zA-Z][a-zA-Z0-9_.]*@[a-zA-Z]+\.(com|in|org|net|edu|gov)$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const hospitalNameRegex = /^[A-Za-z_]{1,50}$/;
    const landlineRegex = /^(?:\+91\s\d{2}\s\d{8}|0\d{2,4}-\d{6,8})$/;

    const gstRegex = /^[0-9A-Z]{15}$/;

    if (!selectedTenant) errors.selectedTenant = 'Tenant is required.';
    if (!formData.hospitalType)
      errors.hospitalType = 'Hospital Type is required.';
    if (!formData.hospitalName) {
      errors.hospitalName = 'Hospital Name is required.';
    } else if (!hospitalNameRegex.test(formData.hospitalName)) {
      errors.hospitalName =
        'Only letters or underscores allowed (max 50 chars).';
    } else if (/^(.)\1{5,}$/.test(formData.hospitalName)) {
      errors.hospitalName = 'Avoid repetitive characters (e.g., aaaaaa).';
    }

    if (!formData.email) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.mobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (!phoneRegex.test(formData.mobile)) {
      errors.mobile =
        'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }
    if (!formData.landline) {
      errors.landline = 'Landline is required.';
    } else if (!landlineRegex.test(formData.landline)) {
      errors.landline =
        'Enter a valid landline (e.g., 044-1234567 or +91 22 12345688).';
    }

    if (!formData.gst) {
      errors.gst = 'GST Number is required.';
    } else if (!gstRegex.test(formData.gst)) {
      errors.gst =
        'GST must be 15 alphanumeric characters (e.g., 29ABCDE1234F2Z5).';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
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
    if (!formData.email) {
      setFormErrors((prev) => ({ ...prev, email: '' }));
      setEmailStatus(null);
      return;
    }

    // Start checking email availability with debounce
    const timer = setTimeout(() => {
      setEmailStatus('checking');
      checkEmailAvailability(formData.email)
        .then((res) => {
          if (res.success) {
            // email NOT exists, available
            setEmailStatus('available');
            setFormErrors((prev) => ({ ...prev, email: '' }));
          } else {
            // email exists or error
            setEmailStatus('exists');
            setFormErrors((prev) => ({ ...prev, email: res.message }));
          }
        })
        .catch(() => {
          setEmailStatus('error');
          setFormErrors((prev) => ({ ...prev, email: 'Error checking email' }));
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [formData.email]);

 const handleMobileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;

  // Remove non-digit characters
  value = value.replace(/\D/g, '');

  // Update the state with digits-only value
  setFormData((prev) => ({ ...prev, mobile: value }));

  const phoneRegex = /^[6-9]\d{9}$/;

  if (!value) {
    setFormErrors((prev) => ({
      ...prev,
      mobile: 'Mobile number is required.',
    }));
    setMobileValid(false);
    return;
  } else if (!phoneRegex.test(value)) {
    setFormErrors((prev) => ({
      ...prev,
      mobile:
        'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
    }));
    setMobileValid(false);
    return;
  }

  try {
    const result = await checkPhoneAvailability(value);

    if (!result.success) {
      setFormErrors((prev) => ({
        ...prev,
        mobile: result.message,
      }));
      setMobileValid(false);
    } else {
      setFormErrors((prev) => ({ ...prev, mobile: '' }));
      setMobileValid(true);
    }
  } catch (error) {
    console.error('Phone availability check failed:', error);
    setFormErrors((prev) => ({
      ...prev,
      mobile: 'Something went wrong. Please try again.',
    }));
    setMobileValid(false);
  }
};


  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      {/* Back Button */}
        <button
          className="text-blue-600 font-medium hover:underline mb-4"
          onClick={() => navigate('/hospital')}
        >
          &lt; Back
        </button>
      <h1 className="text-3xl font-semibold text-black text-center mb-6">
        Hospital Registration
      </h1>

      <form
        // onSubmit={handleFormSubmit}
        className="flex flex-wrap gap-4 items-start justify-between"
      >
        {/* Left Column: Hospital Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-left mb-8">Basic Details</h2>
            <div className="grid grid-cols-2 gap-4 w-full mb-4">
              {/* Tenant Dropdown */}
              <div>
                <select
                  value={selectedTenant || ''}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>
                    Select Tenant
                  </option>
                  {tenants.map((tenant) => (
                    <option key={tenant.tenantID} value={tenant.tenantID}>
                      {tenant.tenantName}
                    </option>
                  ))}
                </select>
                {formErrors.selectedTenant && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.selectedTenant}
                  </p>
                )}
              </div>

              {/* Hospital Type Dropdown */}
              <div>
                <select
                  id="hospitalType"
                  name="hospitalType"
                  value={formData.hospitalType}
                  onChange={(e) =>
                    setFormData({ ...formData, hospitalType: e.target.value })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="">Hospital Type</option>
                  {hospitalTypes.length > 0 ? (
                    hospitalTypes.map((type) => (
                      <option key={type.appLOVID} value={type.name}>
                        {type.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No Hospital Types Available</option>
                  )}
                </select>
                {formErrors.hospitalType && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.hospitalType}
                  </p>
                )}
              </div>

              {/* Hospital Name */}
              <div>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) =>
                    setFormData({ ...formData, hospitalName: e.target.value })
                  }
                  placeholder="Hospital Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formErrors.hospitalName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.hospitalName}
                  </p>
                )}
              </div>

              {/* Hospital Code - Hidden */}
              <input
                type="hidden"
                id="hospitalCode"
                name="hospitalCode"
                placeholder="Hospital Code"
                maxLength={5}
                value={formData.hospitalCode}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalCode: e.target.value })
                }
                required
              />

              {/* Email */}
              <div className="flex flex-col relative">
                {/* Input with icon */}
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setFormErrors((prev) => ({ ...prev, email: '' }));
                      setEmailStatus(null);
                    }}
                    placeholder="Email"
                    className={`w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black outline-none
        focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />

                  {/* Green tick icon - centered absolutely */}
                  {emailStatus === 'available' && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle className="w-5 h-5" />
                    </span>
                  )}
                </div>

                {/* Error message - does NOT affect icon layout */}
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="relative flex flex-col gap-1">
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleMobileChange}
                    placeholder="Mobile"
                    className={`w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black outline-none
        focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {mobileValid && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 transform text-green-500">
                      <CheckCircle className="w-5 h-5" />
                    </span>
                  )}
                </div>
                {formErrors.mobile && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.mobile}
                  </p>
                )}
              </div>

              {/* Landline */}
              <div>
                <input
                  type="text"
                  value={formData.landline}
                  onChange={(e) =>
                    setFormData({ ...formData, landline: e.target.value })
                  }
                  placeholder="Landline"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formErrors.landline && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.landline}
                  </p>
                )}
              </div>

              {/* GST */}
              <div>
                <input
                  type="text"
                  value={formData.gst}
                  onChange={(e) =>
                    setFormData({ ...formData, gst: e.target.value })
                  }
                  placeholder="GST Number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formErrors.gst && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.gst}</p>
                )}
              </div>

              {/* CreatedBy Hidden */}
              <input
                type="hidden"
                id="createdBy"
                name="createdBy"
                value={formData.createdBy || ''}
                onChange={(e) =>
                  setFormData({ ...formData, createdBy: e.target.value })
                }
                required
              />

              {/*       
              <div className="col-span-3 flex justify-start gap-4 mt-4">
                <CustomButton type="submit">
                  {formData.hospitalID ? 'Update' : 'Save'}
                </CustomButton>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-[#d4d4d4] text-white py-2 px-4 rounded shadow-none hover:bg-[#808080] border border-[#d4d4d4]"
                >
                  Cancel
                </button>
              </div> */}
            </div>
          </div>

          {/* Right Column: Address (Empty for now, structure only) */}
          <div className="space-y-4">
            {/* Placeholder for Address Fields */}
            <div className="grid grid-cols-1 gap-4 mb-4">
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
                          className="w-[200px] rounded-lg border border-stroke p-2 pl-4 mt-2 text-black outline-none bg-transparent dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                                      const { city, ...rest } =
                                        prev[index] || {};
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
                                      const { city, ...rest } =
                                        prev[index] || {};
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
          <div className="flex justify-end">
            <CustomButton onClick={handleFormSubmit}>Save Details</CustomButton>
          </div>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={5000} />

      <style jsx>{`
        .center-header .ag-header-cell-label {
          text-align: center;
          display: flex;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Hospital;
