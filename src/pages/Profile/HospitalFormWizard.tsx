import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { Edit } from 'lucide-react';
import { fetchHospitalAPI, fetchTenants } from '../../Utils';
import CustomButton from '../../components/CustomButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import api from '../../api/request';

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
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [formData, setFormData] = useState<RowData>({
    hospitalID: '',
    hospitalName: '',
    hospitalCode: '',
    hospitalType: '',
    isActive: true, // now matches your check in the submit handler
  });

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

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found in session storage.');
      alert('User not logged in. Please log in again.');
      return;
    }

    // Prepare payload
    const payload: Record<string, any> = {
      tenantID: selectedTenant,
      hospitalName: formData.hospitalName.trim(),
      hospitalCode: formData.hospitalCode.trim() || '', // passes "" if blank

      hospitalType: formData.hospitalType.trim(),
      createdBy: userID,
      updatedBy: userID,
      isActive: formData.isActive, // Ensure this is a boolean
    };

    if (formData.hospitalID) {
      payload.hospitalID = formData.hospitalID;
    }

    try {
      let response;
      let successMessage = ''; // Define a variable for success message

      if (formData.hospitalID) {
        console.log('Performing PUT request...');
        response = await api.put('/Hospital', payload); // Use `api` instance
        successMessage = 'Hospital information updated successfully!'; // Success message for update
      } else {
        console.log('Performing POST request...');
        response = await api.post('/Hospital', payload); // Use `api` instance
        successMessage = 'Hospital information saved successfully!'; // Success message for create
      }

      console.log('Response status:', response.status); // Log the status for debugging

      if (response.status === 200 || response.status === 201) {
        console.log('Success:', response.data);
        toast.success(successMessage); // Dynamic success message
        await refreshTableData(); // Refresh table data after success
        resetForm(); // Reset the form after submission
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error: any) {
      console.error(
        'Error saving hospital:',
        error.response?.data || error.message,
      );
      toast?.error?.('Failed to save hospital. Please try again.'); // Error toast
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

    if (!address.addressType) errors.addressType = 'Address type is required'; // ✅ Match this to your form field
    if (!address.address1) errors.address1 = 'Address line 1 is required';
    if (!address.address2) errors.address2 = 'Address line 2 is required';
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

  const handleEdit = (data: RowData) => {
    setFormData({
      hospitalID: data.hospitalID,
      hospitalName: data.hospitalName,
      hospitalCode: data.hospitalCode,
      hospitalType: data.hospitalType,
      isActive: !!(
        data.isActive === 'true' ||
        data.isActive === true ||
        data.isActive === 1
      ), // Convert to boolean
    });

    setShowForm(true);
    setFormMode('Edit');

    // Scroll to the edit form smoothly
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors: { [index: number]: { [field: string]: string } } = {};
    const userID = sessionStorage.getItem('userID');
    const unitID = sessionStorage.getItem('unitID');
    const hasPrimary = addresses.some((addr) => addr.isPrimary);

    if (!unitID) {
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
        id: unitID,
        type: 'Hospital',
        addressType: address.addressType || '',
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        district: address.district || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        isPrimary: address.isPrimary === true,
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

  useEffect(() => {
    const unitID = sessionStorage.getItem('unitID');

    if (unitID) {
      api
        .get(`/Hospital/${unitID}`)
        .then((response) => {
          if (response.data.success && response.data.data) {
            const data = response.data.data;
            setFormData({
              hospitalName: data.hospitalName || '',
              hospitalCode: data.hospitalCode || '',
              hospitalType: data.hospitalType || '',
              isActive: data.isActive,
            });
            setSelectedTenant(data.tenantID || '');
          }
        })
        .catch((error) => {
          console.error('Failed to fetch hospital data:', error);
        });
    }
  }, []);

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-3xl font-semibold text-black text-center mb-6">
        Hospital Details
      </h1>

      <form
        // onSubmit={handleFormSubmit}
        className="flex flex-wrap gap-4 items-start justify-between"
      >
        {/* Left Column: Hospital Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-left mb-8">Basic Details</h2>
            {/* First Row: Tenant + Hospital Type */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Tenant Dropdown */}
              {showTenantDropdown && (
  <select
    disabled
    value={selectedTenant || ''}
    onChange={(e) => setSelectedTenant(e.target.value)}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  >
    <option value="">Select Tenant</option>
    {tenants.map((tenant) => (
      <option key={tenant.tenantID} value={tenant.tenantID}>
        {tenant.tenantName}
      </option>
    ))}
  </select>
)}


             
            </div>

            {/* Second Row: Hospital Name, Code, Status */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Hospital Name */}
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
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
               {/* Hospital Type Dropdown */}
              <select
                id="hospitalType"
                name="hospitalType"
                value={formData.hospitalType}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalType: e.target.value })
                }
                required
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
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
              {/* Hospital Code */}
              <input
                type="text"
                id="hospitalCode"
                name="hospitalCode"
                placeholder="Hospital Code"
                maxLength={5}
                value={formData.hospitalCode}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalCode: e.target.value })
                }
                required
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
              />

              {/* Status Dropdown */}
              <select
                value={formData.isActive ? 'Active' : 'Inactive'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === 'Active',
                  }))
                }
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-4 pr-6 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
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
                          maxLength={20}
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
                          maxLength={20}
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

              <div className="flex justify-end">
                <CustomButton onClick={handleAddressSubmit}>
                  Save Address
                </CustomButton>
              </div>
            </div>
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
