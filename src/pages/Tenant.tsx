import axios from 'axios'; // Ensure Axios is installed via npm or yarn
import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Edit } from 'lucide-react';
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
  const [formData, setFormData] = useState<RowData>({
    Id: 0,

    tenantName: '',
    status: 'Active',
    tenantCode: '',
    tenantPlan: '',
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
      tenantPlan: '',
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
        tenantPlan: '',
        createdBy: '',
        status: 'Active',
      });
    }
  }, [formMode]);

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
      tenantPlan: tenant.tenantPlan,
      isActive: tenant.isActive, // Ensure this is set for editing
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

  const userID = sessionStorage.getItem('userID');
  if (!userID) {
    console.error('User ID not found in session storage.');
    toast.error('User not logged in. Please log in again.');
    return;
  }

  try {
    const isActive = formData.status === 'Active';
    const createdBy = userID;

    const payload = {
      tenantID: formData.tenantID || undefined,
      tenantName: formData.tenantName,
       tenantCode: formData.tenantCode?.trim() || "",
      tenantPlan: formData.tenantPlan,
      CreatedBy: createdBy,
      IsActive: isActive,
    };

    console.log('Sending payload:', payload);

    let response;
    let toastMessage = '';

    // Determine whether it's a Save (POST) or Update (PUT)
    if (!formData.tenantID) {
      console.log('Performing POST request...');
      response = await api.post('/Tenant', payload);
      toastMessage = 'Tenant saved successfully!'; // Save action
    } else {
      console.log('Performing PUT request...');
      response = await api.put('/Tenant', payload);
      toastMessage = 'Tenant updated successfully!'; // Update action
    }

    console.log('Server response:', response.data);

    // Show the appropriate toast message
    toast.success(toastMessage);

    // Refresh the table data and reset the form
    await refreshTableData();
    resetFormData();
    setShowForm(false);
  } catch (error: any) {
    console.error(
      'Error saving tenant:',
      error.response?.data || error.message,
    );

    // Show error toast
    toast.error('Failed to save/update tenant data. Please try again.');
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
      headerName: 'Tenant Plan',
      field: 'tenantPlan',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 130,
    },

    {
      headerName: 'Status',
      field: 'isActive',
      flex: 1,
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
      flex: 1,
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 20,
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
      // width: 30,
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.tenantID)} // Use tenantID here
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
            <div className="flex gap-4 mb-2">
              <input
                type="text"
                value={formData.tenantName}
                onChange={(e) =>
                  setFormData({ ...formData, tenantName: e.target.value })
                }
                placeholder="Tenant Name"
                className="w-50 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <div>
                <input
                  type="hidden"
                  id="tenantCode"
                  maxLength={5}
                  name="tenantCode"
                  placeholder="Tenant Code"
                  value={formData.tenantCode || ''} // Ensure it defaults to an empty string
                  className="w-50 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  onChange={(e) =>
                    setFormData({ ...formData, tenantCode: e.target.value })
                  }
                  required
                />
                 
              </div>
              <div>
                <select
                id="tenantPlan"
                name="tenantPlan"
                value={formData.tenantPlan}
                onChange={(e) =>
                  setFormData({ ...formData, tenantPlan: e.target.value })
                }
                className="w-50 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              >
                <option value="">Select Plan</option>
                <option value="Free">Free</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Diamond">Diamond</option>
                <option value="Platinum">Platinum</option>
              </select>
              </div>
               <div>
              {formMode === 'Edit' && (
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              )}
            </div>
            </div>

           
            <div>
              <input
                type="hidden"
                id="createdBy"
                name="createdBy"
                placeholder="Created By"
                value={formData.createdBy || ''} // Ensure it defaults to an empty string
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                onChange={(e) =>
                  setFormData({ ...formData, createdBy: e.target.value })
                } // Directly update createdBy as string
                required
              />
            </div>

           

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
                onClick={() => setShowForm(false)}
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

      <div className="ag-theme-alpine mt-6 w-full" style={{ height: '400px' }}>
        <AgGridReact
          rowData={
            filteredData.length > 0 ? applyGlobalSearch(filteredData) : []
          }
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10} // ✅ Default page size
          paginationPageSizeSelector={[10, 20, 50, 100]} // ✅ Enable dropdown for page size
          domLayout="autoHeight"
          headerHeight={40}
          rowHeight={40}
          onGridReady={onGridReady}
        />
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
