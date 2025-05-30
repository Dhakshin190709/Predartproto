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
import { checkPhoneAvailability } from '../Utils/validationUtils';
import { checkEmailAvailability } from '../Utils/validationUtils';
import { useNavigate } from 'react-router-dom';

interface RowData {
  hospitalID: number;
  hospitalName: string;
  hospitalCode: string;
  hospitalType: string;
  isActive: string;
  email: string;
  mobile: string;
  landline: string;
  gst: string;
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
  const [formMode, setFormMode] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [mobileValid, setMobileValid] = useState(false);
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
      type: 'Hospital',
    },
  ]);

  const emptyAddress = {
  addressID: '',
  id: '',
  type: 'Hospital',
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
  const fetchHospitals = async () => {
    try {
      const tenantID = sessionStorage.getItem('tenantID');

      if (!tenantID) {
        console.error('Missing tenantID in session storage.');
        return;
      }

      const response = await api.get('/Hospital/List', {
        params: {
          tenantId: tenantID,
        },
      });

      console.log('API Data:', response.data);
      setRowData(response.data?.data || response.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
    }
  };

  fetchHospitals();
}, []);

  // Fetch tenant data from utils

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

  const columnDefs = [
    { headerName: 'S.No', valueGetter: 'node.rowIndex + 1', width: 80 },
    {
      headerName: 'Hospital ID',
      field: 'hospitalID',
      sortable: true,
      filter: true,
      hide: true,
      width: 150,
    },
    {
      headerName: 'Hospital Name',
      field: 'hospitalName',
      sortable: true,
      filter: true,
      width: 280,
    },
    {
      headerName: 'Hospital Type',
      field: 'hospitalType',
      sortable: true,
      filter: true,
      width: 180,
    },
    {
      headerName: 'Hospital Code',
      field: 'hospitalCode',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      width: 300,
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
      width: 150,
    },
    {
      headerName: 'GST',
      field: 'gst',
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: 'Status',
      field: 'isActive',
      width: 140,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => {
        const isActive = params.value === true;
        return (
          <span
            className={`cursor-pointer font-bold ${
              isActive ? 'text-green-500' : 'text-red-400'
            }`}
            onClick={() => toggleStatus(params)}
            style={{ cursor: 'pointer' }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      headerName: 'Basic Edit',
      width: 150,
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
    {
      headerName: 'Address Edit',
      width: 160,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleAddressEdit(params.data)}
          className="cursor-pointer flex justify-center mt-3 items-center"
        >
         <Edit
            size={18}
            className="text-blue-500 hover:scale-110 transition-transform"
          />
        </span>
      ),
    },
    {
      headerName: 'Delete',
      hide: true,
      flex: 0.8,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          className="cursor-pointer text-red-600 font-bold"
          onClick={() => handleDelete(params.data.hospitalID)}
        >
          x
        </span>
      ),
    },
  ];

useEffect(() => {
  console.log("✅ Updated Addresses State:", addresses);
}, [addresses]);

const handleAddressEdit = async (rowData: any) => {
  const hospitalID = rowData.hospitalID;

  setShowAddressForm(true);

  try {
    const response = await api.get('/Address/getaddress', {
      params: { id: hospitalID, Type: 'Hospital' },
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
    const responseDistricts = await api.get(`/Address/districts?StateCode=${state}`);

    if (responseDistricts.data?.data && Array.isArray(responseDistricts.data.data)) {
      const fetchedDistricts = responseDistricts.data.data;
      setDistricts(fetchedDistricts);

      // Set pincodes from districts for this address
      const uniquePincodes = Array.from(
        new Set(fetchedDistricts.map((d) => d.pinCode))
      );
      setPincodes(uniquePincodes);

      // Set selected state (if you keep state for selected district globally)
      setSelectedState(state);

      // 2. Load cities for the district
      const district = address.district;
      const responseCities = await api.get(`/Address/cities?districtName=${district}`);

      if (responseCities.data?.data && Array.isArray(responseCities.data.data) && responseCities.data.data.length > 0) {
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
    const { hospitalID, isActive } = params.data;
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      console.error('User ID not found in session storage.');
      alert('User not logged in. Please log in again.');
      return;
    }

    const updatedStatus = !isActive; // Toggle status

    const payload = {
      guidID: hospitalID, // API expects this field name
      updatedBy: userID,
      isActive: updatedStatus,
    };

    try {
      const response = await api.patch('/Hospital', payload); // ✅ Use base URL from api instance

      if (response.status === 200) {
        const updatedData = rowData.map((item: any) =>
          item.hospitalID === hospitalID
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

  const handleDelete = async (hospitalID: number) => {
    setDeleteRowId(hospitalID);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!deleteRowId) return;

    try {
      await api.delete(`/Hospital/${deleteRowId}`); // Use axios instance

      // Update UI after successful deletion
      const updatedData = rowData.filter(
        (item) => item.hospitalID !== deleteRowId,
      );
      setRowData(updatedData);
      setFilteredData(updatedData);

      toast.success('Hospital deleted successfully');
    } catch (error: any) {
      console.error('Error deleting hospital:', error);
      const errorMsg =
        error.response?.data?.message ||
        'Failed to delete hospital. Please try again.';
      toast.error(errorMsg);
    } finally {
      setShowConfirmation(false);
      setDeleteRowId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeleteRowId(null);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
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
      hospitalCode: formData.hospitalCode.trim() || '',
      hospitalType: formData.hospitalType.trim(),
      email: formData.email?.trim() || '',
      mobile: formData.mobile?.trim() || '',
      landline: formData.landline?.trim() || '',
      gst: formData.gst?.trim() || '',
      createdBy: userID,
      updatedBy: userID,
      isActive: formData.isActive,
    };

    if (formData.hospitalID) {
      payload.hospitalID = formData.hospitalID;
    }

    try {
      let response;
      let successMessage = '';

      if (formData.hospitalID) {
        console.log('Performing PUT request...');
        response = await api.put('/Hospital', payload);
        successMessage = 'Hospital information updated successfully!';
      } else {
        console.log('Performing POST request...');
        response = await api.post('/Hospital', payload);
        successMessage = 'Hospital information saved successfully!';
      }

      console.log('Response status:', response.status);

      if (response.status === 200 || response.status === 201) {
        console.log('Success:', response.data);
        toast.success(successMessage);
        await refreshTableData();
        resetForm();
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error: any) {
      console.error(
        'Error saving hospital:',
        error.response?.data || error.message,
      );
      toast?.error?.('Failed to save hospital. Please try again.');
    }
  };

 const refreshTableData = async () => {
  try {
    const tenantID = sessionStorage.getItem('tenantID');

    if (!tenantID) {
      console.error('Missing tenantID in session storage.');
      return;
    }

    const response = await api.get('/Hospital/List', {
      params: { tenantId: tenantID },
    });

    const hospitalData = response.data?.data ?? response.data;

    if (Array.isArray(hospitalData)) {
      setRowData([...hospitalData]);
      setFilteredData([...hospitalData]);
    } else {
      console.error('Unexpected API response format:', response.data);
    }
  } catch (error) {
    console.error('Error fetching table data:', error);
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
  setFormData({
    hospitalID: data.hospitalID,
    hospitalName: data.hospitalName,
    hospitalCode: data.hospitalCode,
    hospitalType: data.hospitalType,
    email: data.email,
    mobile: data.mobile,
    landline: data.landline,
    gst: data.gst,
    isActive: !!(
      data.isActive === 'true' ||
      data.isActive === true ||
      data.isActive === 1
    ),
  });

  // Set selected tenant ID to reflect in dropdown
  setSelectedTenant(data.tenantID || '');

  setShowForm(true);
  setFormMode('Edit');

  setTimeout(() => {
    editFormRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 100);
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
        Hospital
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formData.hospitalID === 0 ? 'Add New Data' : 'Edit Hospital Details'}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-wrap gap-4 items-center justify-between"
          >
            <div className="grid grid-cols-3 gap-4 w-full mb-4">
              {/* Tenant Dropdown */}
             {formMode !== 'Edit' && (
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
)}

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

              {/* Mobile */}
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

              {/* Status Checkbox (Edit Mode Only) */}
              {formMode === 'Edit' && (
                <div className="flex items-center">
                  <label className="text-black dark:text-black flex items-center w-fit cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-md relative mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-gradient-to-b checked:from-[#004A99] checked:to-[#007BFF] checked:border-[#007BFF] checked:after:content-['✔️'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white"
                    />
                    <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>
              )}

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

              {/* Submit / Cancel Buttons - Full Width Row */}
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
              </div>
            </div>
          </form>
        </div>
      )}


      {showAddressForm  && (
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
        <CustomButton onClick={handleUpdateAddresses}>Update</CustomButton>
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

        {/* <button
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
  hover:from-[#007BFF] hover:to-[#004A99]
  text-white transition duration-150 
  ease-out hover:ease-in py-2 px-5 rounded-lg"
          onClick={() => {
            setFormData({
              hospitalID: 0,
              hospitalType: '',
              hospitalName: '',
              hospitalCode: '',
              createdBy: '',
            }); // Reset form data
            setIsActive(false); // Reset checkbox state
            setShowForm(true);
            setFormMode('Add'); // 👈 Add this
          }}
        >
          + Add
        </button> */}

        <button
          onClick={() => navigate('/hospitalRegister')}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
  hover:from-[#007BFF] hover:to-[#004A99]
  text-white transition duration-150 
  ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
        Add New
        </button>
      </div>

      <div
        className="ag-theme-alpine mt-6 w-full overflow-x-auto"
        style={{ minWidth: '1200px' }}
      >
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

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              <CustomButton onClick={confirmDelete}>Yes, Delete</CustomButton>

              <button
                onClick={cancelDelete}
                className="bg-[#d4d4d4] text-white py-2 px-4 rounded shadow-none hover:bg-[#808080] border border-[#d4d4d4]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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

