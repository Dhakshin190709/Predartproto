import axios from 'axios'; // Ensure Axios is installed via npm or yarn
import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { CheckCircle, Edit } from 'lucide-react';
import api from '../api/request';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS
import { ToastContainer } from 'react-toastify';

const Tenant: React.FC = () => {
  // Initialize rowData with useState
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [formMode, setFormMode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<RowData>({
    Id: 0,
    gstNumber: '',
    tenantName: '',
    status: 'Active',
    tenantCode: '',
    // tenantPlan: '',

    email: '',
    mobile: '',
    landline: '',
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  // Fetch tennat from utils
  const fetchTenants = async () => {
    try {
      const response = await api.get('/Tenant'); // Uses baseURL from api.js
      console.log('Full API Response:', response);
      console.log('Fetched Data:', response.data);

      if (response.data && Array.isArray(response.data.data)) {
        setRowData(response.data.data);
        setFilteredData(response.data.data);
      } else {
        console.error("Data format is incorrect. Expected an array in 'data'.");
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  // Function to update tenant status

  // handle Add button click
  const handleAdd = () => {
    setFormData({
      tenantID: 0,
      tenantName: '',
      tenantCode: '',
      //   tenantPlan: '',
      createdBy: '',
      status: 'Active',
    });
    setFormMode('Add');
    setShowForm(true); // Show the form
  };

  // Reset form data when switching to "Add" mode
  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        tenantID: 0,
        tenantName: '',
        tenantCode: '',
        //tenantPlan: '',
        createdBy: '',
        status: 'Active',
      });
    }
  }, [formMode]);

  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // Show OTP input after send
const [toastInProgress, setToastInProgress] = useState(false);
  const [mobileOtpLoading, setMobileOtpLoading] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [mobileSent, setMobileSent] = useState(false);
  const [mobileVerifyLoading, setMobileVerifyLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [mobileOtpTimer, setMobileOtpTimer] = useState(0);
  const [mobileResendAvailable, setMobileResendAvailable] = useState(false);
  const [emailOtpTimer, setEmailOtpTimer] = useState(0);
  const [emailResendAvailable, setEmailResendAvailable] = useState(false);

  const handleSendEmailOtp = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return;

    setEmailOtpLoading(true);
    setEmailSent(true);
    setEmailResendAvailable(false);
    setEmailOtpTimer(60); // Start countdown

    setTimeout(() => {
      setEmailOtpLoading(false);
      toast.success('OTP sent to your email.');
    }, 1000);
  };
  useEffect(() => {
    let interval: any;

    if (emailOtpTimer > 0) {
      interval = setInterval(() => {
        setEmailOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (emailOtpTimer === 0 && emailSent) {
      setEmailResendAvailable(true);
    }

    return () => clearInterval(interval);
  }, [emailOtpTimer, emailSent]);

  const handleVerifyEmailOtp = () => {
    if (!emailOtp.trim()) {
      toast.error('Please enter the OTP.');
      return;
    }

    setEmailVerifyLoading(true);

    setTimeout(() => {
      if (emailOtp === '123456') {
        setIsEmailVerified(true);
        toast.success('Email verified.');
      } else {
        toast.error('Invalid email OTP.');
      }
      setEmailVerifyLoading(false);
    }, 2000);
  };

  const handleVerifyMobileOtp = () => {
    if (!mobileOtp.trim()) {
      toast.error('Please enter the OTP.');
      return;
    }

    if (!/^\d{6}$/.test(mobileOtp)) {
      toast.error('OTP must be a 6-digit number.');
      return;
    }

    setMobileVerifyLoading(true);

    setTimeout(() => {
      if (mobileOtp === '123456') {
        setIsMobileVerified(true);
        toast.success('Mobile number verified.');
      } else {
        toast.error('Invalid mobile OTP.');
      }
      setMobileVerifyLoading(false);
    }, 2000); // Simulated delay
  };

  const handleSendMobileOtp = () => {
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) return;

    setMobileOtpLoading(true);
    setMobileSent(true);
    setMobileResendAvailable(false);
    setMobileOtpTimer(60); // 60 seconds countdown

    // Fake OTP sent delay
    setTimeout(() => {
      setMobileOtpLoading(false);
      toast.success('OTP sent to your mobile.');
    }, 1000);
  };

  useEffect(() => {
    let interval: any;

    if (mobileOtpTimer > 0) {
      interval = setInterval(() => {
        setMobileOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (mobileOtpTimer === 0 && mobileSent) {
      setMobileResendAvailable(true);
    }

    return () => clearInterval(interval);
  }, [mobileOtpTimer, mobileSent]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the form from submitting and refreshing the page

    // Perform save operation (Add or Update)
    console.log(formMode === 'Add' ? 'Data Added' : 'Data Updated');

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false); // Show the fields again
    setFormMode('');
    setName(''); // Reset input fields if necessary
    setIsActive(false);
  };

  const handleEditClick = (tenant: RowData) => {
    setFormData({
      tenantID: tenant.tenantID,
      tenantName: tenant.tenantName,
      tenantCode: tenant.tenantCode,
      gstNumber: tenant.gstNumber || '',
      email: tenant.email || '', // ✅ Add email
      mobile: tenant.mobile || '', // ✅ Add mobile
      landline: tenant.landline || '', // ✅ Add landline
      isActive: tenant.isActive, // ✅ Already present
    });

    setShowForm(true); // Show the form when editing
    setFormMode('Edit');

    // Scroll to the edit form
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  // Add or update tenant

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified || !isMobileVerified) {
    if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('Please verify both email and mobile before saving.', {
        onClose: () => setToastInProgress(false),
      });
    }
    return;
  }
    const errors: any = {};

    const tenantNameRegex =
      /^(?!.*(.)\1{2,})(?!.*\b(\w+)\b.*\b\2\b)(?!.*[\d_!@#$%^&*(),.?":{}|<>~`+=;\\/])(?!.*[\u{1F600}-\u{1F6FF}])^[A-Za-z ]{2,30}$/u;
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const emailPattern =
      /^(?=[^@]*[a-zA-Z])[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|org|in|co|net|edu|gov)$/i;

    const phoneRegex = /^(?!.*(\d)\1{4,})[6-9]\d{9}$/;
    const landlineRegex = /^(?:\+91\s\d{2}\s\d{8}|0\d{2,4}-\d{6,8})$/;

    // ✅ Tenant Name validation
    if (!formData.tenantName) {
      errors.tenantName = 'Tenant Name is required.';
    } else if (!tenantNameRegex.test(formData.tenantName)) {
      errors.tenantName =
        'Only alphabets allowed. No numbers, special characters, emojis, or repeated words.';
    }

    // ✅ GST Number validation
    if (!formData.gstNumber) {
      errors.gstNumber = 'GST Number is required.';
    } else if (!gstRegex.test(formData.gstNumber)) {
      errors.gstNumber =
        'GST must be in format like 22AAAAA0000A1Z5 (15 characters).';
    }

    // ✅ Email validation
    if (!formData.email) {
      errors.email = 'Email is required.';
    } else if (formData.email.length > 50) {
      errors.email = 'Email must be at most 50 characters.';
    } else if (!emailPattern.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // ✅ Mobile validation
    if (!formData.mobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (formData.mobile.length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    } else if (!phoneRegex.test(formData.mobile)) {
      errors.mobile =
        'Enter valid 10-digit mobile number starting with 6-9 and no repeated digits.';
    }

    // ✅ Landline validation
    if (!formData.landline) {
      errors.landline = 'Landline is required.';
    } else if (formData.landline.length > 20) {
      errors.landline = 'Landline must be at most 20 characters.';
    } else if (!landlineRegex.test(formData.landline)) {
      errors.landline =
        'Enter a valid landline (e.g., 044-1234567 or +91 22 12345688).';
    }

    // 🚫 Stop submission if errors exist
    if (Object.keys(errors).length > 0) {
      console.error('Validation failed:', errors);
      if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('Please fix the errors before submitting.', {
        onClose: () => setToastInProgress(false),
      });
    }
      setFormErrors(errors);
      return;
    }

    // ✅ Proceed with save/update
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found in session storage.');
      if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('User not logged in. Please log in again.', {
        onClose: () => setToastInProgress(false),
      });
    }
      return;
    }

    try {
      const isActive = formData.tenantID ? true : false;

      const createdBy = userID;

      const payload = {
        tenantID: formData.tenantID || undefined,
        tenantName: formData.tenantName,
        tenantCode: formData.tenantCode?.trim() || '',
        gstNumber: formData.gstNumber?.trim(),
        tenantPlan: formData.tenantPlan,
        email: formData.email?.trim(),
        mobile: formData.mobile?.trim(),
        landline: formData.landline?.trim(),
        CreatedBy: createdBy,
        isActive: isActive,
      };

      let response;
      let toastMessage = '';

      if (!formData.tenantID) {
        response = await api.post('/Tenant', payload);
        toastMessage = 'Tenant saved successfully!';
      } else {
        response = await api.put('/Tenant', payload);
        toastMessage = 'Tenant updated successfully!';
      }

     if (!toastInProgress) {
      setToastInProgress(true);
      toast.success(toastMessage, {
        onClose: () => setToastInProgress(false),
      });
    }
      await refreshTableData();
      resetFormData();
      setShowForm(false);
      setFormErrors({});
    } catch (error: any) {
      console.error(
        'Error saving tenant:',
        error.response?.data || error.message,
      );
      if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('Failed to save/update tenant data. Please try again.', {
        onClose: () => setToastInProgress(false),
      });
    }
    }
  };

  // Fetch updated list of tenants to refresh the table
  const refreshTableData = async () => {
    try {
      const response = await api.get('/Tenant'); // Uses baseURL and headers from api.js
      if (response.data && Array.isArray(response.data.data)) {
        setRowData([...response.data.data]); // Update table rows
        setFilteredData([...response.data.data]); // Update filtered rows if used for search/filtering
      } else {
        console.error(
          'Error: response.data.data is not an array',
          response.data,
        );
      }
    } catch (error: any) {
      console.error(
        'Error fetching table data:',
        error.response?.data || error.message,
      );
    }
  };

  const resetFormData = () => {
    setFormData({
      tenantID: '', // Set to empty string if it’s a new tenant
      tenantName: '',
      tenantCode: '',
      tenantPlan: '',
      isActive: 'true',
      createdBy: '',
    });
  };

  // Delete tenant
  const confirmDelete = async () => {
    try {
      if (deleteRowId !== null) {
        await api.delete(`/Tenant/${deleteRowId}`); // Uses baseURL and auth headers from api.js
        const updatedData = rowData.filter(
          (item) => item.tenantID !== deleteRowId,
        );
        setRowData(updatedData);
        setFilteredData(updatedData);
      }
      setShowConfirmation(false);
      setDeleteRowId(null);
    } catch (error: any) {
      console.error(
        'Error deleting tenant:',
        error.response?.data || error.message,
      );
    }
  };

  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'Tenant ID',
      field: 'tenantID',
      sortable: true,
      filter: true,
      hide: true,
      width: 150,
    },
    {
      headerName: 'S.No',
      field: 'S.No',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      valueGetter: 'node.rowIndex + 1',
      filter: true,
      width: 100,
    },
    {
      headerName: 'Tenant Name',
      headerClass: 'left-header',
      cellClass: 'left-center',
      field: 'tenantName',
      sortable: true,
      filter: true,
      width: 280,
    },
    {
      headerName: 'Tenant Code',
      field: 'tenantCode',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 160,
    },
    {
      headerName: 'GST Number',
      field: 'gstNumber',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 160,
    },
    {
      headerName: 'Email',
      field: 'email',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 220,
    },
    {
      headerName: 'Mobile',
      field: 'mobile',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Landline',
      field: 'landline',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Status',
      field: 'isActive',

      width: 120,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => {
        const isActive = params.value === 'Active' || params.value === true;
        return (
          <span
            onClick={() => toggleStatus(params)}
            className={`cursor-pointer font-bold ${
              isActive ? 'text-green-500' : 'text-red-400'
            } hover:underline`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      headerName: 'Edit',

      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 120,
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEditClick(params.data)}
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
      flex: 1,
      cellClass: 'text-center',
      headerClass: 'center-header',
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.tenantID)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
      suppressSizeToFit: true,
      width: 150,
    },
  ];

  // Define applyGlobalSearch function
  const applyGlobalSearch = (data: RowData[]) => {
    console.log('Data passed to applyGlobalSearch:', data);

    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data);
      return [];
    }

    const searchText = quickSearchText.toLowerCase();

    return data.filter((row) => {
      const matchesSearch =
        row.tenantName?.toLowerCase().includes(searchText) ||
        row.tenantID.toString().includes(searchText);

      return matchesSearch; // Allow all rows to pass search
    });
  };

  // Filter search function (handles name and isActive filters)
  const handleFilterSearch = () => {
    const filtered = rowData.filter(
      (item) =>
        (name
          ? item.tenantName.toLowerCase().includes(name.toLowerCase())
          : true) && (isActive ? item.isActive === true : true), // Make sure you are checking `isActive` correctly
    );
    setFilteredData(filtered);
  };

  // Call applyGlobalSearch after filtering
  const handleSearch = () => {
    const filtered = handleFilterSearch(); // Apply basic filters
    const globallySearched = applyGlobalSearch(filtered); // Apply global search
    setFilteredData(globallySearched); // Update filtered data
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const toggleStatus = async (params: any) => {
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    console.log('params.data:', params.data); // Debugging
    console.log('params.data.guidID:', params.data.guidID); // Ensure this exists

    // Toggle the status based on the current state
    const updatedStatus = !(
      params.data.isActive === 'Active' || params.data.isActive === true
    );

    try {
      // Use the `api` instance to ensure the token is included
      await api.patch(`/Tenant`, {
        guidID: params.data.tenantID, // Use correct field
        updatedBy: userID,
        isActive: updatedStatus,
      });

      // Update state with the new status
      const updatedData = rowData.map((item) =>
        item.tenantID === params.data.tenantID // Ensure correct identifier
          ? { ...item, isActive: updatedStatus ? 'Active' : 'Inactive' }
          : item,
      );

      setRowData(updatedData);
      setFilteredData(updatedData);

      // Show success toast
      toast.success('Tenant status updated successfully!');
    } catch (error) {
      console.error(
        'Error updating status:',
        error.response?.data || error.message,
      );

      // Show error toast
      toast.error('Failed to update tenant status. Please try again.');
    }
  };

  // Delete confirmation
  const handleDelete = (Id: number) => {
    setDeleteRowId(Id);
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeleteRowId(null);
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Tenant</h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New Tenant' : 'Edit Tenant'}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-wrap gap-4 items-center justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {/* Tenant Name */}
              <div className="min-w-[300px]">
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantName: e.target.value })
                  }
                  placeholder="Tenant Name"
                  maxLength={40}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formErrors.tenantName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.tenantName}
                  </p>
                )}
              </div>

              {/* GST Number */}
              <div className="min-w-[300px]">
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, gstNumber: e.target.value })
                  }
                  placeholder="GST Number"
                  maxLength={15}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formErrors.gstNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.gstNumber}
                  </p>
                )}
              </div>

              {/* Email with OTP */}
              <div className="relative min-w-[300px]">
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setIsEmailVerified(false);
                    setEmailSent(false);
                    setEmailOtp('');
                  }}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {!isEmailVerified ? (
                  <>
                    {!emailSent ? (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
                          emailOtpLoading
                        }
                        className={`absolute right-2 top-3 text-sm px-3 py-1 rounded ${
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                          !emailOtpLoading
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {emailOtpLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    ) : emailResendAvailable ? (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        className="absolute right-2 top-3 bg-yellow-500 text-white text-sm px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <div className="absolute right-3 top-4 text-sm text-gray-500">
                        Resend in {emailOtpTimer}s
                      </div>
                    )}

                    {emailSent && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          maxLength={6}
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                          className="w-1/2  rounded-lg border border-stroke bg-transparent px-2 py-1 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        <button
                          onClick={handleVerifyEmailOtp}
                          disabled={emailVerifyLoading}
                          className={`px-2 py-1 rounded text-white flex items-center justify-center ${
                            emailVerifyLoading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {emailVerifyLoading ? (
                            <div
                              className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
                              style={{ borderStyle: 'dashed' }}
                            ></div>
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="absolute right-3 top-4 text-green-600">
                    <CheckCircle size={18} className="text-green-600" />
                  </span>
                )}

                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Mobile with OTP */}
              <div className="relative min-w-[300px]">
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => {
                    setFormData({ ...formData, mobile: e.target.value });
                    setIsMobileVerified(false);
                    setMobileSent(false);
                    setMobileOtp('');
                  }}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />

                {!isMobileVerified ? (
                  <>
                    {!mobileSent ? (
                      <button
                        type="button"
                        onClick={handleSendMobileOtp}
                        disabled={
                          !/^[6-9]\d{9}$/.test(formData.mobile) ||
                          mobileOtpLoading
                        }
                        className={`absolute right-2 top-3 text-sm px-3 py-1 rounded ${
                          /^[6-9]\d{9}$/.test(formData.mobile) &&
                          !mobileOtpLoading
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {mobileOtpLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    ) : mobileResendAvailable ? (
                      <button
                        type="button"
                        onClick={handleSendMobileOtp}
                        className="absolute right-2 top-3 bg-yellow-500 text-white text-sm px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <div className="absolute right-3 top-4 text-sm text-gray-500">
                        Resend in {mobileOtpTimer}s
                      </div>
                    )}

                    {mobileSent && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          maxLength={6}
                          value={mobileOtp}
                          onChange={(e) => setMobileOtp(e.target.value)}
                          className="w-1/2  rounded-lg border border-stroke bg-transparent px-2 py-1 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        <button
                          onClick={handleVerifyMobileOtp}
                          disabled={mobileVerifyLoading}
                          className={`px-2 py-1 rounded text-white flex items-center justify-center ${
                            mobileVerifyLoading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {mobileVerifyLoading ? (
                            <div
                              className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
                              style={{ borderStyle: 'dashed' }}
                            ></div>
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="absolute right-3 top-4 text-green-600">
                    <CheckCircle size={18} className="text-green-600" />
                  </span>
                )}

                {formErrors.mobile && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.mobile}
                  </p>
                )}
              </div>

              {/* Landline */}
              <div className="min-w-[300px]">
                <input
                  type="tel"
                  placeholder="Landline"
                  value={formData.landline}
                  onChange={(e) =>
                    setFormData({ ...formData, landline: e.target.value })
                  }
                  maxLength={15}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formErrors.landline && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.landline}
                  </p>
                )}
              </div>
            </div>

            {/* Hidden Fields */}
            <input
              type="hidden"
              id="tenantCode"
              maxLength={5}
              name="tenantCode"
              placeholder="Tenant Code"
              value={formData.tenantCode || ''}
              onChange={(e) =>
                setFormData({ ...formData, tenantCode: e.target.value })
              }
            />

            <input
              type="hidden"
              id="createdBy"
              name="createdBy"
              value={formData.createdBy || ''}
              onChange={(e) =>
                setFormData({ ...formData, createdBy: e.target.value })
              }
            />

            {/* Buttons */}
            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                {formMode === 'Add' ? 'Save' : 'Update'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormMode('Add'); // Reset mode if needed
                  setFormData({
                    tenantID: '',
                    tenantName: '',
                    tenantCode: '',
                    gstNumber: '',
                    email: '',
                    mobile: '',
                    landline: '',
                    isActive: true,
                    createdBy: '',
                  });
                  setFormErrors({});
                }}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
  hover:from-[#007BFF] hover:to-[#004A99]
  text-white transition duration-150 
  ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={1000} // Automatically close the toast after 5 seconds
        hideProgressBar={false} // Show the progress bar
        newestOnTop={true} // Show newest toasts on top
        closeOnClick
        rtl={false}
      />
      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={quickSearchText}
            onChange={(e) => setQuickSearchText(e.target.value)}
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

        <button
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
        hover:from-[#007BFF] hover:to-[#004A99]
        text-white transition duration-150 
        ease-out hover:ease-in py-2 px-5 rounded-lg"
          onClick={() => {
            setFormMode('Add');
            setShowForm(true); // Ensure the form shows up in "Add" mode
          }}
        >
          + Add
        </button>
      </div>

      <div
        className="ag-theme-alpine mt-6"
        style={{
          height: '400px',
          width: '100%',
          overflowX: 'auto', // 👈 Enables horizontal scroll
        }}
      >
        <div style={{ minWidth: '1200px' }}>
          {' '}
          {/* 👈 Minimum width to trigger scroll */}
          <AgGridReact
            rowData={
              filteredData.length > 0 ? applyGlobalSearch(filteredData) : []
            }
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            domLayout="autoHeight"
            headerHeight={40}
            rowHeight={40}
            onGridReady={onGridReady}
          />
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={confirmDelete}
                //onClick={handleSave}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
    hover:from-[#007BFF] hover:to-[#004A99]
    text-white transition duration-150 
    ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                // onClick={handleCancel}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
              hover:from-[#007BFF] hover:to-[#004A99]
              text-white transition duration-150 
              ease-out hover:ease-in py-2 px-5 rounded-lg"
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

export default Tenant;
