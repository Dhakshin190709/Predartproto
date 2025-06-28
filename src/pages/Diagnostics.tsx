import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { CheckCircle, Edit } from 'lucide-react';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import api from '../api/request';

import { useNavigate } from 'react-router-dom';
import {
  checkEmailAvailability,
  checkPhoneAvailability,
} from './Utils/validationUtils';
import CustomButton from '../components/CustomButton';
import { useMemo } from 'react';



interface RowData {
  pharmacyID: string;
  pharmacyName: string;
  pharmacyCode: string;
  pharmacyType: string;
  pharmacyEmail: string;
  pharmacyPhoneNumber: string;

}

const Diagnostics: React.FC = () => {
  const [name, setName] = useState(''); // Name filter for UI
  const [isActive, setIsActive] = useState(true); // Active filter for UI
  const [rowData, setRowData] = useState([]);
  const [tenants, setTenants] = useState([]); // State for tenant data
  const [selectedTenant, setSelectedTenant] = useState(''); // State for selected tenan
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(''); // For global search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [pharmacyTypes, setPharmacyTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [isTenantPrefilled, setIsTenantPrefilled] = useState(false);
  const [isHospitalPrefilled, setIsHospitalPrefilled] = useState(false);
   const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
const facilitiesString = useMemo(() => selectedFacilities.join(','), [selectedFacilities]);

  
  const [formData, setFormData] = useState({
    laboratoryID: '',
    labName: '',
    labCode: '',
    email: '',
    mobile: '',
    landline: '',
   
    isActive: true,
    tenantID: '',
    hospitalID: '',
  });

  const [selectedLabType, setSelectedLabType] = useState('');
  const [facilityInput, setFacilityInput] = useState('');
 
  const [hospitals, setHospitals] = useState([]);
  const roleName = sessionStorage.getItem('roleName');
  const phoneRegex = /^[6-9]\d{9}$/;
  const [formMode, setFormMode] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [pharmacyPhoneNumberValid, setpharmacyPhoneNumberValid] =
    useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const gridRef = useRef(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [showCityInput, setShowCityInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [addressTypes, setAddressTypes] = useState([]);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      addressType: '',
      address1: '',
      address2: '',
      state: '',
      district: '',
      zipCode: '',
      city: '',
      type: 'Diagnostics',
    },
  ]);

  const emptyAddress = {
    addressID: '',
    id: '',
    type: 'Diagnostics',
    addressType: '',
    address1: '',
    address2: '',
    city: '',
    district: '',
    state: '',
    zipCode: '',
    isPrimary: false,
  };
  const [states, setStates] = useState<State[]>([]);
  // Calculate height based on pageSize, rowHeight, and headerHeight
  const rowHeight = 40;
  const headerHeight = 40;
  const gridHeight = headerHeight + rowHeight * pageSize;

  const onPaginationChanged = () => {
    if (!gridRef.current) return;
    const newPageSize = gridRef.current.api.paginationGetPageSize();
    setPageSize(newPageSize);
  };
  // Fetch data from the API
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        const roleName = sessionStorage.getItem('roleName');
        const tenantID = sessionStorage.getItem('tenantID');
        const unitID = sessionStorage.getItem('unitID');

        let response;

        if (roleName === 'SuperAdmin') {
          // ✅ SuperAdmin: fetch all labs
          response = await api.get('/Laboratory');
        } else if (roleName === 'TenantAdmin') {
          // ✅ TenantAdmin: fetch labs by tenant only
          if (!tenantID) {
            console.error('Missing tenantID for TenantAdmin.');
            return;
          }
          response = await api.get('/Laboratory', {
            params: { tenantId: tenantID },
          });
        } else {
          // ✅ Other roles: fetch labs by tenant and hospital
          if (!tenantID || !unitID) {
            console.error('Missing tenantID or unitID for role:', roleName);
            return;
          }
          response = await api.get('/Laboratory', {
            params: {
              tenantId: tenantID,
              hospitalId: unitID,
            },
          });
        }

        console.log('Laboratory API Data:', response.data);
        const labData = response.data?.data ?? response.data;

        if (Array.isArray(labData)) {
          setRowData([...labData]);
        } else {
          console.error('Unexpected API response format:', response.data);
        }
      } catch (error: any) {
        console.error('Error fetching laboratory data:', error);
      }
    };

    fetchLaboratories();
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

 

  // Handle tenant selection
  const handleTenantChange = (e) => {
    setSelectedTenant(e.target.value);
    console.log(`Selected Tenant: ${e.target.value}`);
  };

  // hospital type from appLOV

 

  const columnDefs = [
    { headerName: 'S.No', valueGetter: 'node.rowIndex + 1', width: 80 },
    {
      headerName: 'Lab Name',
      field: 'labName',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: 'Lab Code',
      field: 'labCode',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Lab Type',
      field: 'labType',
      sortable: true,
      filter: true,
      width: 180,
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      width: 250,
    },
    {
      headerName: 'Mobile',
      field: 'mobile',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Landline',
      field: 'landline',
      sortable: true,
      filter: true,
      width: 160,
    },
    {
      headerName: 'Facilities',
      field: 'labFacilities',
      width: 250,
      cellRenderer: (params: any) => {
        const facilities = params.value?.split(',') || [];
        return (
          <div className="flex flex-wrap gap-1">
            {facilities.map((f: string, index: number) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 mt-3 px-2 py-0.5 rounded text-xs"
              >
                {f}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      headerName: 'Status',
      field: 'isActive',
      width: 120,
      cellClass: 'text-center',
      cellRenderer: (params: any) => {
        const isActive = params.value === true;
        return (
          <span
            className={`cursor-pointer font-semibold ${
              isActive ? 'text-green-500' : 'text-red-500'
            }`}
            onClick={() => toggleStatus(params)}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      headerName: 'Edit',
      width: 100,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEdit(params.data)}
          className="cursor-pointer flex justify-center mt-3 items-center"
        >
          <Edit
            size={18}
            className="text-blue-500 hover:scale-110 transition-transform"
          />
        </span>
      ),
    },
  ];

  useEffect(() => {
    console.log('✅ Updated Addresses State:', addresses);
  }, [addresses]);

  const handleAddressEdit = async (rowData: any) => {
    const pharmacyID = rowData.pharmacyID;

    setShowAddressForm(true);

    try {
      const response = await api.get('/Address/getaddress', {
        params: { id: pharmacyID, Type: 'Pharmacy' },
      });

      if (response.data && response.data.data?.length > 0) {
        setAddresses(response.data.data);

        // For each loaded address, load dependent data
        response.data.data.forEach((address, index) => {
          loadDependentAddressData(address, index);
        });
      } else {
        setAddresses([emptyAddress]);
      }
    } catch (err) {
      console.error('Failed to fetch address:', err);
      setAddresses([emptyAddress]);
    }
  };

  const loadDependentAddressData = async (address, index) => {
    // 1. Load districts and pincodes for the state
    try {
      const state = address.state;
      const responseDistricts = await api.get(
        `/Address/districts?StateCode=${state}`,
      );

      if (
        responseDistricts.data?.data &&
        Array.isArray(responseDistricts.data.data)
      ) {
        const fetchedDistricts = responseDistricts.data.data;
        setDistricts(fetchedDistricts);

        // Set pincodes from districts for this address
        const uniquePincodes = Array.from(
          new Set(fetchedDistricts.map((d) => d.pinCode)),
        );
        setPincodes(uniquePincodes);

        // Set selected state (if you keep state for selected district globally)
        setSelectedState(state);

        // 2. Load cities for the district
        const district = address.district;
        const responseCities = await api.get(
          `/Address/cities?districtName=${district}`,
        );

        if (
          responseCities.data?.data &&
          Array.isArray(responseCities.data.data) &&
          responseCities.data.data.length > 0
        ) {
          setCities(responseCities.data.data);
          setShowCityInput(false);
        } else {
          setCities([]);
          setShowCityInput(true);
        }
        setSelectedDistrict(district);
      }
    } catch (error) {
      console.error('Error loading dependent address data:', error);
      setDistricts([]);
      setPincodes([]);
      setCities([]);
      setShowCityInput(true);
    }
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

  const handleSelectAddress = (index: number) => {
    const newTouched = { ...touchedFields };
    Object.keys(addresses[index]).forEach((field) => {
      newTouched[`${index}-${field}`] = true;
    });
    setTouchedFields(newTouched);
    validateAddress(addresses[index], index);
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

  const toggleStatus = async (params: any) => {
    const { pharmacyID, isActive } = params.data;
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      console.error('User ID not found in session storage.');
      alert('User not logged in. Please log in again.');
      return;
    }

    const updatedStatus = !isActive; // Toggle status

    const payload = {
      guidID: pharmacyID, // API expects this field name
      updatedBy: userID,
      isActive: updatedStatus,
    };

    try {
      const response = await api.patch('/Pharmacy', payload); // ✅ Use base URL from api instance

      if (response.status === 200) {
        const updatedData = rowData.map((item: any) =>
          item.pharmacyID === pharmacyID
            ? { ...item, isActive: updatedStatus }
            : item,
        );

        setRowData(updatedData);
        setFilteredData(updatedData);

        console.log('Updated isActive:', updatedStatus);
        toast.success('Hospital status updated successfully!'); // Show success message here
      } else {
        // If status is not 200, show an error message
        toast.error('Failed to update hospital status.');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMsg =
        error.response?.data?.message || 'Failed to update hospital status.';
      toast.error(errorMsg); // Optional: show toast if available
    }
  };

  const handlepharmacyPhoneNumberChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let value = e.target.value;

    // Remove non-digit characters
    value = value.replace(/\D/g, '');

    // Update the state with digits-only value
    setFormData((prev) => ({ ...prev, pharmacyPhoneNumber: value }));

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!value) {
      setFormErrors((prev) => ({
        ...prev,
        pharmacyPhoneNumber: 'pharmacyPhoneNumber number is required.',
      }));
      setpharmacyPhoneNumberValid(false);
      return;
    } else if (!phoneRegex.test(value)) {
      setFormErrors((prev) => ({
        ...prev,
        pharmacyPhoneNumber:
          'Enter a valid 10-digit pharmacyPhoneNumber number starting with 6, 7, 8, or 9.',
      }));
      setpharmacyPhoneNumberValid(false);
      return;
    }

    try {
      const result = await checkPhoneAvailability(value);

      if (!result.success) {
        setFormErrors((prev) => ({
          ...prev,
          pharmacyPhoneNumber: result.message,
        }));
        setpharmacyPhoneNumberValid(false);
      } else {
        setFormErrors((prev) => ({ ...prev, pharmacyPhoneNumber: '' }));
        setpharmacyPhoneNumberValid(true);
      }
    } catch (error) {
      console.error('Phone availability check failed:', error);
      setFormErrors((prev) => ({
        ...prev,
        pharmacyPhoneNumber: 'Something went wrong. Please try again.',
      }));
      setpharmacyPhoneNumberValid(false);
    }
  };

 const validateForm = () => {
  const errors: Record<string, string> = {};
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9_.]*@[a-zA-Z]+\.(com|in|org|net|edu|gov)$/;
  const phoneRegex = /^[6-9]\d{9}$/;
  const landlineRegex = /^[0-9-]{6,15}$/;
  const labNameRegex = /^[A-Za-z\s._-]{2,50}$/;

  // Tenant
if (!formData.tenantID?.trim()) {
  console.error('❌ Tenant is required');
  errors.tenantID = 'Tenant is required.';
} else {
  console.log('✅ Tenant is valid');
}

// Hospital
if (!formData.hospitalID?.trim()) {
  console.error('❌ Hospital is required');
  errors.hospitalID = 'Hospital is required.';
} else {
  console.log('✅ Hospital is valid');
}


  // Lab Name
  if (!formData.labName?.trim()) {
    console.error('❌ Lab Name is required');
    errors.labName = 'Lab Name is required.';
  } else if (!labNameRegex.test(formData.labName.trim())) {
    console.error('❌ Invalid Lab Name format');
    errors.labName =
      'Lab Name can include letters, spaces, dot, underscore, hyphen (2–50 chars).';
  } else {
    console.log('✅ Lab Name is valid');
  }

  // Email
  if (formData.email?.trim()) {
    if (!emailRegex.test(formData.email.trim())) {
      console.error('❌ Invalid Email format');
      errors.email = 'Enter a valid email address.';
    } else {
      console.log('✅ Email is valid');
    }
  } else {
    console.log('✅ Email is empty or optional');
  }

  // Mobile
  if (!formData.mobile?.trim()) {
    console.error('❌ Mobile number is required');
    errors.mobile = 'Mobile number is required.';
  } else if (!phoneRegex.test(formData.mobile.trim())) {
    console.error('❌ Invalid Mobile number format');
    errors.mobile = 'Enter a valid 10-digit mobile number starting with 6-9.';
  } else {
    console.log('✅ Mobile number is valid');
  }

  // Lab Type
  if (!selectedLabType?.trim()) {
    console.error('❌ Lab Type is required');
    errors.labType = 'Lab Type is required.';
  } else {
    console.log('✅ Lab Type is valid');
  }

  // Facilities
  if (!facilitiesString?.trim()) {
    console.error('❌ At least one facility is required');
    errors.facilities = 'At least one facility is required.';
  } else {
    console.log('✅ Facilities are valid');
  }

  // Landline
  if (!formData.landline?.trim()) {
    console.error('❌ Landline is required');
    errors.landline = 'Landline number is required.';
  } else if (!landlineRegex.test(formData.landline.trim())) {
    console.error('❌ Invalid Landline format');
    errors.landline = 'Enter a valid landline number.';
  } else {
    console.log('✅ Landline number is valid');
  }

  setErrors(errors);
  const isValid = Object.keys(errors).length === 0;
  console.log('✅ Final validation result:', isValid);
  return isValid;
};




const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Form submitted!', formData, formMode);

  const isValid = validateForm();
  if (!isValid) return;

  const userID = sessionStorage.getItem('userID');
  if (!userID) {
    console.error('User ID not found in session storage.');
    alert('User not logged in. Please log in again.');
    return;
  }

  const isEditMode = formMode === 'Edit';
  const isAddMode = formMode === 'Add';

  if (isEditMode && !formData.laboratoryID) {
    toast.error('Laboratory ID is missing. Cannot update.');
    return;
  }

  const payload = {
    laboratoryID: formData.laboratoryID || 0,
    tenantID: formData.tenant || selectedTenant,
    hospitalID: formData.hospitalID || selectedHospital,
    labName: formData.labName?.trim(),
    labCode: formData.labCode?.trim() || '',
    labType: selectedLabType?.trim() || '',
    email: formData.email?.trim(),
    mobile: formData.mobile?.trim(),
    landline: formData.landline?.trim(),
    labFacilities: facilitiesString, // ✅ Include facilities in the main payload
    createdBy: userID,
    updatedBy: userID,
    isActive: true,
  };

  try {
    let response;

    if (isAddMode) {
      // POST for Add mode
      console.log('Sending POST /Laboratory:', payload);
      response = await api.post('/Laboratory', payload);
    } else {
      // PUT for Edit mode - Step 1
      console.log('Sending PUT /Laboratory:', payload);
      response = await api.put('/Laboratory', payload);

      // PUT for Facilities - Step 2
      console.log('Sending PUT /Laboratory/Facilities:', payload);
      await api.put('/Laboratory/Facilities', payload);
    }

    if (response.status === 200 || response.status === 201) {
      toast.success(`Laboratory ${isAddMode ? 'created' : 'updated'} successfully!`);
      await refreshTableData();
      resetForm();
    } else {
      toast.error('Unexpected response from server.');
    }
  } catch (error: any) {
    console.error('Error saving laboratory:', error.response?.data || error.message);
    toast.error('Failed to save laboratory. Please try again.');
  }
};



  const refreshTableData = async () => {
    try {
      const roleName = sessionStorage.getItem('roleName');
      const tenantID = sessionStorage.getItem('tenantID');
      const unitID = sessionStorage.getItem('unitID');

      let response;

      // 🔁 API call based on role
      if (roleName === 'SuperAdmin') {
        response = await api.get('/Laboratory');
      } else if (roleName === 'TenantAdmin') {
        if (!tenantID) {
          console.error('Missing tenantID for TenantAdmin.');
          return;
        }
        response = await api.get('/Laboratory', {
          params: { tenantId: tenantID },
        });
      } else {
        if (!tenantID || !unitID) {
          console.error('Missing tenantID or unitID for role:', roleName);
          return;
        }
        response = await api.get('/Laboratory', {
          params: {
            tenantId: tenantID,
            hospitalId: unitID,
          },
        });
      }

      // ✅ Extract and validate data
      const labData = response.data?.data;

      if (response.data?.success && Array.isArray(labData)) {
        setRowData([...labData]);
        setFilteredData([...labData]);
      } else {
        console.error('Invalid response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching laboratory data:', error);
    }
  };

  const resetFormData = () => {
    setFormData({
      hospitalID: '', // Set to empty if it's a new hospital
      hospitalName: '',
      hospitalCode: '',
      hospitalType: '',
      isActive: 'true', // Ensure default is active
    });
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

  const handleEdit = (data: RowData) => {
    console.log('Editing lab with tenantID:', data.tenantID);

    setFormData({
      laboratoryID: data.laboratoryID,
      labName: data.labName || '',
      labCode: data.labCode || '',
      email: data.email || '',
      mobile: data.mobile || '',
      landline: data.landline || '',
   
      isActive: !!(
        data.isActive === 'true' ||
        data.isActive === true ||
        data.isActive === 1
      ),
      tenantID: data.tenantID,
      hospitalID: data.hospitalID,
    });

    setSelectedLabType(data.labType || '');
    setSelectedTenant(data.tenantID || '');

    // Split and set facilities as array
  if (data.labFacilities) {
  setSelectedFacilities(data.labFacilities.split(',').map(item => item.trim()));
}



    setShowForm(true);
    setFormMode('Edit');

    setTimeout(() => {
      editFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this specific field
    setErrors((prev: any) => ({ ...prev, [field]: '' }));
  };

  const handleFilterSearch = () => {
    const filtered = initialData.filter(
      (item) =>
        (name
          ? item.hospitalName.toLowerCase().includes(name.toLowerCase())
          : true) && (isActive ? item.isActive === 'Active' : true),
    );
    setRowData(filtered);
    setFilteredData(filtered);
  };

  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.hospitalName.toLowerCase().includes(quickSearchText.toLowerCase()),
    );
  };

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  const handleUpdateAddresses = async () => {
    try {
      for (const address of addresses) {
        const response = await api.put('/Address', address);
        console.log('Updated Address:', response.data);
        toast.success(`Address updated successfully!`);
      }

      setShowAddressForm(false);
    } catch (error) {
      console.error('Error updating address:', error.response ?? error.message);
      toast.error('Failed to update address. Please try again.');
    }
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Diagnostics
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formData.laboratoryID === ''
              ? 'Add New Laboratory'
              : 'Edit Laboratory Details'}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-wrap gap-4 items-center justify-between"
          >
            <div className="grid grid-cols-3 gap-4">
              {/* Tenant Dropdown (hidden in Edit mode) */}
              {formMode !== 'Edit' && (
                <div className="col-span-1">
                  <select
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                    value={formData.tenant}
                    onChange={(e) => handleChange('tenant', e.target.value)}
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
              )}

              {/* Hospital Dropdown (hidden in Edit mode) */}
              {formMode !== 'Edit' && (
                <div className="col-span-1">
                  <select
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                    value={formData.hospital}
                    onChange={(e) => handleChange('hospital', e.target.value)}
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
              )}

              {/* Lab Name */}
              <div className="col-span-1">
                <input
                  type="text"
                  maxLength={30}
                  placeholder="Lab Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                  value={formData.labName}
                  onChange={(e) => handleChange('labName', e.target.value)}
                />
                {errors.labName && (
                  <p className="text-red-500 text-sm">{errors.labName}</p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-1">
                <input
                  type="email"
                  placeholder="Lab Email"
                  maxLength={50}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="col-span-1">
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Phone Number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
              </div>

              {/* Lab Type */}
              <div className="col-span-1">
                <input
                  type="text"
                  value={selectedLabType}
                  onChange={(e) => setSelectedLabType(e.target.value)}
                  placeholder="Enter Lab Type"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                />
                {errors.labType && (
                  <p className="text-red-500 text-sm">{errors.labType}</p>
                )}
              </div>

              {/* Facilities */}
              <div className="col-span-1">
                <div className="w-full flex flex-wrap gap-2 border border-stroke rounded-lg p-4">
                  {selectedFacilities.map((facility, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
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
                    placeholder="Lab Facilities (Enter to add)"
                    className="flex-grow border-none outline-none bg-transparent text-black"
                  />
                </div>
                <input
                  type="hidden"
                  name="facilitiesString"
                  value={facilitiesString}
                />
              </div>

              {/* Landline */}
              <div className="col-span-1">
                <input
                  type="text"
                  maxLength={12}
                  placeholder="Landline Number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                  value={formData.landline}
                  onChange={(e) => handleChange('landline', e.target.value)}
                />
                {errors.landline && (
                  <p className="text-red-500 text-sm">{errors.landline}</p>
                )}
              </div>
              {/* Submit / Cancel Buttons */}
              <div className="col-span-3 flex justify-start gap-4 mt-4">
                <CustomButton type="submit">
                  {formData.laboratoryID ? 'Update' : 'Save'}
                </CustomButton>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-[#d4d4d4] text-white py-2 px-4 rounded shadow-none hover:bg-[#808080] border border-[#d4d4d4]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showAddressForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <div className="space-y-4">
            {/* Placeholder for Address Fields */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <h2 className="text-xl font-bold text-left mb-4">Edit Address</h2>
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
            {/* Buttons */}
            <div className="flex space-x-4">
              <CustomButton onClick={handleUpdateAddresses}>
                Update
              </CustomButton>
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="bg-[#d4d4d4] text-white py-2 px-4 rounded shadow-none hover:bg-[#808080] border border-[#d4d4d4]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />
      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={quickSearchText}
            onChange={handleFilterSearch}
            className="sm:w-60 w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <span className="absolute right-4 top-4">
            <svg
              className="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.5">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                  fill=""
                ></path>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                  fill=""
                ></path>
              </g>
            </svg>
          </span>
        </div>

        {roleName !== 'TenantAdmin' && roleName !== 'Reception' && (
          <button
            onClick={() => navigate('/Registration/DiagnosticsRegistration')}
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
          >
            Add New
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto">
  <div className="ag-theme-alpine min-w-[600px]" style={{ height: 'auto' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          domLayout="autoHeight" // <-- This auto adjusts height to fit rows
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          onGridReady={() => {
            if (gridRef.current) {
              setPageSize(gridRef.current.api.paginationGetPageSize());
            }
          }}
          onPaginationChanged={onPaginationChanged}
        />
      </div>
      </div>

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

export default Diagnostics;
