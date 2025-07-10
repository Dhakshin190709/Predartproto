import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { CheckCircle, Edit } from 'lucide-react';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';
import api from '../api/request';
import CustomButton from '../components/CustomButton';

interface RowData {
  isActive: boolean;
  consentFormTemplateID: string;
  tenantID: string;
 
 
  title: string;
  htmlContent: string;
 
  tenantName?: string; // ✅ Add this
  hospitalName?: string; // ✅ Add this
}

const EmailTemplate: React.FC = () => {
  const [name, setName] = useState(''); // Name filter for UI
  const [hospitalList, setHospitalList] = useState([]);
  const [hospitalMap, setHospitalMap] = useState({});
  const [tenantList, setTenantList] = useState([]);
  const [initialData, setInitialData] = useState<RowData[]>([]);

  const [tenantMap, setTenantMap] = useState({});
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
  const [formData, setFormData] = useState<RowData>({
    isActive: true,
    consentFormTemplateID: '',
    tenantID: '',
   
    title: '',
    htmlContent: '',
  
  });

  const roleName = sessionStorage.getItem('roleName');
  const phoneRegex = /^[6-9]\d{9}$/;
  const [formMode, setFormMode] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [pharmacyPhoneNumberValid, setpharmacyPhoneNumberValid] =
    useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const gridRef = useRef(null);

  const [errors, setErrors] = useState<any>({});

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
  const fetchConsentFormTemplates = async () => {
    try {
      const roleName = sessionStorage.getItem('roleName');
      const tenantID = sessionStorage.getItem('tenantID');
      const unitID = sessionStorage.getItem('unitID');

      let response;

      if (roleName === 'SuperAdmin') {
        response = await api.get('/ConsentFormTemplate'); // 👈 updated path
      } else if (roleName === 'TenantAdmin') {
        if (!tenantID) {
          console.error('Missing tenantID for TenantAdmin.');
          return;
        }
        response = await api.get('/ConsentFormTemplate', {
          params: { tenantId: tenantID },
        });
      } else {
        if (!tenantID || !unitID) {
          console.error('Missing tenantID or unitID for role:', roleName);
          return;
        }
        response = await api.get('/ConsentFormTemplate', {
          params: { tenantId: tenantID, hospitalId: unitID },
        });
      }

      console.log('ConsentFormTemplate API Data:', response.data);
      const templateData = response.data?.data ?? response.data;

      if (Array.isArray(templateData)) {
        const enriched = templateData.map((item) => ({
          ...item,
          tenantName: tenantMap[item.tenantID] || 'N/A',
          hospitalName: hospitalMap[item.hospitalID] || 'N/A',
        }));

        setInitialData(enriched);
        setRowData(enriched);
      } else {
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error: any) {
      console.error('Error fetching consent form template data:', error);
    }
  };

  // Re-fetch if mappings change too
  fetchConsentFormTemplates();
}, [tenantMap, hospitalMap]);


  // Handle tenant selection
  const handleTenantChange = (e) => {
    setSelectedTenant(e.target.value);
    console.log(`Selected Tenant: ${e.target.value}`);
  };

  const columnDefs = [
    { headerName: 'S.No', valueGetter: 'node.rowIndex + 1', width: 80 },
    {
      headerName: 'Template ID',
      field: 'consentFormTemplateID',
      hide: true,
      sortable: true,
      filter: true,
      width: 250,
    },
    {
      headerName: 'Tenant Name',
      field: 'tenantID',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 280,
      valueGetter: (params) => tenantMap[params.data.tenantID] || 'N/A',
    },

   
    {
      headerName: 'title',
      field: 'title',
      sortable: true,
      filter: true,
      width: 560,
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
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      headerName: 'Edit',
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
      headerName: 'Delete',
      width: 100,
      hide: true,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          className="cursor-pointer text-red-600 font-bold"
          // onClick={() => handleDelete(params.data.consentFormTemplateID)}
        >
          x
        </span>
      ),
    },
  ];

  const toggleStatus = async (params: any) => {
    const { consentFormTemplateID, isActive } = params.data;
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      console.error('User ID not found in session storage.');
      alert('User not logged in. Please log in again.');
      return;
    }

    const updatedStatus = !isActive; // ✅ Toggle current status

    const payload = {
      guidID: consentFormTemplateID, // ✅ GUID for Consent form
      updatedBy: userID,
      isActive: updatedStatus,
    };

    try {
      const response = await api.patch('/ConsentFormTemplate', payload);

      if (response.status === 200) {
        // ✅ Update local state after success
        const updatedData = rowData.map((item: any) =>
          item.consentFormTemplateID === consentFormTemplateID
            ? { ...item, isActive: updatedStatus }
            : item,
        );

        setRowData(updatedData);
        setFilteredData(updatedData);

        console.log('Updated isActive:', updatedStatus);
        toast.success('Consent form status updated successfully!');
      } else {
        toast.error('Failed to update Consent form status.');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMsg =
        error.response?.data?.message ||
        'Failed to update Consent form status.';
      toast.error(errorMsg);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', formData, formMode);

    console.log('validateForm result:', isValid);
    if (!isValid) return;

    const userID = sessionStorage.getItem('userID');
    const unitID = sessionStorage.getItem('unitID');
    if (!userID) {
      console.error('User ID not found in session storage.');
      alert('User not logged in. Please log in again.');
      return;
    }

    if (!formData.pharmacyID && formMode === 'Edit') {
      console.error('Pharmacy ID is required for update.');
      toast.error('Pharmacy ID is missing. Cannot update.');
      return;
    }

    // Use tenantID from formData, not from selectedTenant
    const payload: Record<string, any> = {
      tenantID: formData.tenantID || selectedTenant, // Prioritize formData.tenantID
      pharmacyID: formData.pharmacyID || 0,
      pharmacyName: formData.pharmacyName.trim(),
      pharmacyCode: formData.pharmacyCode?.trim() || '',
      type: selectedType,
      pharmacyEmail: formData.pharmacyEmail?.trim() || '',
      pharmacyPhoneNumber: formData.pharmacyPhoneNumber?.trim() || '',
      workHours: formData.workHours?.trim() || '',
      createdBy: userID,
      updatedBy: userID,
      isActive: formData.isActive,
      hospitalID: unitID,
    };

    try {
      console.log('Performing PUT request with tenantID:', payload.tenantID);
      const response = await api.put('/Pharmacy', payload);
      console.log('Response status:', response.status);

      if (response.status === 200 || response.status === 201) {
        console.log('Success:', response.data);
        toast.success('Pharmacy information updated successfully!');
        await refreshTableData();
        resetForm();
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error: any) {
      console.error(
        'Error updating pharmacy:',
        error.response?.data || error.message,
      );
      toast?.error?.('Failed to update pharmacy. Please try again.');
    }
  };

  const refreshTableData = async () => {
    try {
      const roleName = sessionStorage.getItem('roleName');
      const tenantID = sessionStorage.getItem('tenantID');
      const unitID = sessionStorage.getItem('unitID');

      let response;

      if (roleName === 'SuperAdmin') {
        // ✅ SuperAdmin: get all Consent forms, no params
        response = await api.get('/EmailTemplate');
      } else if (roleName === 'TenantAdmin') {
        // ✅ TenantAdmin: get Consent forms by tenantID
        if (!tenantID) {
          console.error('Missing tenantID for TenantAdmin.');
          return;
        }
        response = await api.get('/EmailTemplate', {
          params: { tenantId: tenantID },
        });
      } else {
        // ✅ Other roles: get Consent forms by tenantID and hospitalID
        if (!tenantID || !unitID) {
          console.error('Missing tenantID or unitID for user role:', roleName);
          return;
        }
        response = await api.get('/EmailTemplate', {
          params: {
            tenantId: tenantID,
            hospitalId: unitID,
          },
        });
      }

      const emailTemplateData = response.data?.data ?? response.data;

      if (Array.isArray(emailTemplateData)) {
        setRowData([...emailTemplateData]);
        setFilteredData([...emailTemplateData]);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching Consent form data:', error);
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
    const templateID = data.consentFormTemplateID;

    navigate(`/ConsentFormRegister?id=${templateID}`);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this specific field
    setErrors((prev: any) => ({ ...prev, [field]: '' }));
  };
  const handleFilterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setQuickSearchText(value);

    const filtered = initialData.filter(
      (row) =>
        row.name?.toLowerCase().includes(value) ||
        row.title?.toLowerCase().includes(value) ||
        row.tenantName?.toLowerCase().includes(value) ||
        row.hospitalName?.toLowerCase().includes(value),
    );

    setRowData(filtered);
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
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/Tenant');
        if (response.data.success && Array.isArray(response.data.data)) {
          setTenantList(response.data.data);
          const mapping = {};
          response.data.data.forEach((t) => {
            mapping[t.tenantID] = t.tenantName;
          });
          setTenantMap(mapping);
        } else {
          console.error('Invalid tenant response format');
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };

    fetchTenants();
  }, []);

  
  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Consent Form
      </h2>

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

        {roleName !== 'TenantAdmin' && (
          <button
            onClick={() => navigate('/ConsentFormRegister')}
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
        <div
          className="ag-theme-alpine min-w-[600px]"
          style={{ height: 'auto' }}
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

export default EmailTemplate;
