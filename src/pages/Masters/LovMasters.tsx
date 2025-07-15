import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import CustomButton from '../../components/CustomButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import api from '../../api/request';
import { Edit } from 'lucide-react';

interface RowData {
  appLOVID: number;
  name: string;
  code: string;
  type: string;
  isActive: string;
}

const LovMasters: React.FC = () => {
  // Type filter for UI
  const [type, setType] = useState<string>('');
  const [Name, setName] = useState('');
  const [code, setCode] = useState(''); // Code filter for UI
  const [isActive, setIsActive] = useState(false); // Active filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(''); // For global search
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RowData>({
    appLOVID: 0,
    name: '',
    code: '',
    type: '',
    isActive: 'Active',
  });

  // Sample data

  const [isSubmitting, setIsSubmitting] = useState(false);

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  // Function to send data to API

  useEffect(() => {
    console.log('Component mounted');
    fetchData(); // Only fetch once on mount
  }, []);

  // Fetch data function
  const fetchData = async () => {
    try {
      const response = await api.get('/AppLOV'); // Using axios instance

      console.log('Fetched data:', response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map((item: any) => ({
          ...item,
          isActive: Boolean(item.isActive), // Ensures isActive is a boolean
        }));

        setRowData(formattedData);
        setFilteredData(formattedData);
      } else {
        console.error(
          "API response 'data' is not an array or missing:",
          response.data,
        );
      }
    } catch (error: any) {
      console.error('Error occurred while fetching data:', error);
    }
  };
  const handleReset = () => {
    setType(''); // Clear the dropdown
    fetchData(); // Re-fetch all records
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEditMode =
      formData.appLOVID !== 0 &&
      formData.appLOVID !== '' &&
      formData.appLOVID !== null;

    const payload: any = {
      type: formData.type,
      name: formData.name,
      code: formData.code || '',

      isActive: formData.isActive === 'Active',
    };

    if (isEditMode) {
      payload.appLOVID = formData.appLOVID;
    }

    try {
      const response = isEditMode
        ? await api.put('/AppLOV', payload)
        : await api.post('/AppLOV', payload);

      const result = response.data;

      toast.success(
        result.message ||
          (isEditMode
            ? 'Data updated successfully!'
            : 'Data added successfully!'),
      );

      // Update UI
      if (isEditMode) {
        const updatedRowData = rowData.map((item) =>
          item.appLOVID === formData.appLOVID ? { ...item, ...payload } : item,
        );
        setRowData(updatedRowData);
        setFilteredData(updatedRowData);
      } else {
        fetchData(); // Re-fetch for new record
      }

      // Reset form
      setFormData({
        appLOVID: 0,
        name: '',
        code: '',
        type: '',
        isActive: 'Active',
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Error submitting form:', error);

      // Handle possible validation errors from API
      const errorMsg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : error.response?.data?.message ||
          'An error occurred. Please try again.';

      toast.error(errorMsg);
    }
  };

  // Column Definitions for AG Grid
  const columnDefs: ColDef[] = [
    {
      headerName: 'appLOVID',
      field: 'appLOVID',
      sortable: true,
      filter: true,
      width: 150,
      hide: true,
    },
    {
      headerName: 'S.No',
      field: 'S.No',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      valueGetter: 'node.rowIndex + 1',
      filter: true,
      flex: 1,
      width: 80, // Reduced width
    },
    {
      headerName: 'Type',
      field: 'type',
      flex: 2, // Increased flex to make it take more space
      sortable: true,
      filter: true,
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 250, // Increased width
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 2, // Increased flex to make it take more space
      sortable: true,
      filter: true,
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 300, // Increased width
    },
    {
      headerName: 'Code',
      field: 'code',
      flex: 1,
      sortable: true,
      filter: true,
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 100, // Reduced width
    },

    {
      headerName: 'Status',
      field: 'isActive',
      flex: 0.8,
      width: 100, // Reduced width

      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => {
        const status = params.value ? 'Active' : 'Inactive'; // Display 'Active' if true, 'Inactive' if false
        return (
          <span
            onClick={() => toggleStatus(params)}
            className={`cursor-pointer font-bold ${params.value ? 'text-green-500' : 'text-red-400'} hover:underline`}
          >
            {status}
          </span>
        );
      },
    },
    {
      headerName: 'Edit',
      field: 'edit',

      width: 80,

      cellClass: 'text-center',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEdit(params)}
          className="cursor-pointer text-blue-500 font-bold"
        >
          <Edit
            size={18}
            className="text-blue-500 hover:scale-110 mt-3 transition-transform"
          />
        </span>
      ),
    },
    {
      headerName: 'Delete',
      field: 'delete',
      hide: true,
      flex: 0.8,
      width: 80, // Reduced width
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
    },
  ];

  // Toggles the isActive of a row between Active/Inactive

  const toggleStatus = async (params: any) => {
    const newStatus = !params.data.isActive;
    const appLOVID = params.data.appLOVID;
    const updatedBy =
      sessionStorage.getItem('userID') ||
      '00000000-0000-0000-0000-000000000000';

    const payload = {
      guidID: appLOVID,
      updatedBy,
      updatedOn: new Date().toISOString(),
      isActive: newStatus,
    };

    try {
      const response = await api.patch('/AppLOV', payload); // Use axios PATCH method
      const result = response.data;

      toast.success(result.message || 'Status updated successfully');

      // Update local UI state
      const updatedData = rowData.map((item) =>
        item.appLOVID === appLOVID ? { ...item, isActive: newStatus } : item,
      );
      setRowData(updatedData);
      setFilteredData(updatedData);
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMsg =
        error.response?.data?.message || 'Error occurred while updating status';
      toast.error(errorMsg);
    }
  };

  const handleDelete = (params: any) => {
    setDeleteRowId(params.data.appLOVID);

    setShowConfirmation(true); // Show the confirmation message box
  };

  // Confirm the deletion and update data

  const confirmDelete = async () => {
    if (deleteRowId !== null) {
      try {
        // Send DELETE request using axios instance
        const response = await api.delete(`/AppLOV/${deleteRowId}`);

        console.log('Row deleted successfully:', response.data);

        // Filter out the deleted row from local state
        const updatedData = rowData.filter(
          (item: any) => item.appLOVID !== deleteRowId,
        );
        setRowData(updatedData);
        setFilteredData(updatedData);
      } catch (error: any) {
        console.error('Error occurred while deleting row:', error);
        const errorMsg =
          error.response?.data?.message || 'Failed to delete the row';
        toast.error(errorMsg);
      } finally {
        setShowConfirmation(false); // Hide confirmation dialog
        setDeleteRowId(null); // Reset ID
      }
    }
  };

  // Cancel the deletion
  const cancelDelete = () => {
    setShowConfirmation(false); // Hide the confirmation dialog
    setDeleteRowId(null); // Reset the delete row ID
  };

  const handleEdit = (params: any) => {
    setFormData(params.data); // Set the data of the row to the form
    setShowForm(true); // Show the form for editing
  };

  const handleSearch = async () => {
    try {
      const response = await api.get('/AppLOV', {
        params: { type },
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setRowData(response.data.data);
      } else {
        setRowData([]); // No data fallback
      }
    } catch (error) {
      console.error('Search error:', error);
      setRowData([]); // Clear grid if error
    }
  };

  // Filters the rows based on Type, Code, and Active isActive
  const handleFilterSearch = () => {
    if (isActive) {
      console.log('Active filter applied, but not updating table data');
      return;
    }
    const filtered = rowData.filter(
      (item) =>
        (type ? item.name.toLowerCase().includes(type.toLowerCase()) : true) &&
        (code ? item.code.toLowerCase().includes(code.toLowerCase()) : true) &&
        (isActive ? item.isActive === 'Active' : true),
    );
    setRowData(filtered);
    setFilteredData(filtered); // Reset filtered data
  };

  // Apply the global search filter to the data
  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter(
      (row) =>
        row.name.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.code.toLowerCase().includes(quickSearchText.toLowerCase()),
    );
  };
  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit(); // Ensure columns fit the grid width
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Lov Masters
      </h2>

      {/* Filters Section (Type, Code, Active) */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Select Type</option>
          <option value="Bloodgroup">Bloodgroup</option>
          <option value="AppointmentStatus">AppointmentStatus</option>
          <option value="Gender">Gender</option>
          <option value="Address">Address</option>

          <option value="Specializations">Specializations</option>
          <option value="Qualification">Qualification</option>
          <option value="Hospital">Hospital</option>
          <option value="Worktype">Worktype</option>
          <option value="Relationship">Relationship</option>
          <option value="DocumentType">DocumentType</option>
          <option value="LanguageMaster">LanguageMaster</option>
          <option value="toWhom">toWhom</option>

          <option value="UnitType">UnitType</option>
          <option value="PharmacyType">PharmacyType</option>
          <option value="Weekday">Weekday</option>

          <option value="MedicineTransfer">MedicineTransfer</option>
          <option value="MedicalRecordDocument">MedicalRecordDocument</option>
          <option value="LabType">LabType</option>
          <option value="LabFacilities">LabFacilities</option>
          <option value="Status">Status</option>
           <option value="TenantDocumentType">TenantDocumentType</option>
        </select>

        {/* Search Button */}

        <CustomButton onClick={handleSearch}>Search</CustomButton>
        <CustomButton
          onClick={handleReset}
          className="flex items-center border border-gray-300 
      opacity-80 hover:opacity-100 px-4 py-2 rounded-lg gap-2"
        >
          Reset
        </CustomButton>
      </div>
      <ToastContainer position="top-right" />

      <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {/* Conditional Form for Adding or Editing Rows */}
      {showForm && (
        <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
          <h3 className="text-xl font-semibold mb-4">
            {formData.appLOVID === 0 ? 'Add New Data' : 'Edit Data'}
          </h3>{' '}
          {/* Conditional Title */}
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-wrap gap-4 items-center justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
              {/* Type Dropdown */}
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-68 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">Select Type</option>
                <option value="Bloodgroup">Bloodgroup</option>
                <option value="AppointmentStatus">AppointmentStatus</option>
                <option value="Gender">Gender</option>
                <option value="Address">Address</option>

                <option value="Specializations">Specializations</option>
                <option value="Qualification">Qualification</option>
                <option value="Hospital">Hospital</option>
                <option value="Worktype">Worktype</option>
                <option value="Relationship">Relationship</option>
                <option value="DocumentType">DocumentType</option>
                <option value="LanguageMaster">LanguageMaster</option>
                <option value="toWhom">toWhom</option>

                <option value="UnitType">UnitType</option>
                <option value="PharmacyType">PharmacyType</option>
                <option value="Weekday">Weekday</option>

                <option value="MedicineTransfer">MedicineTransfer</option>
                <option value="MedicalRecordDocument">
                  MedicalRecordDocument
                </option>
                <option value="LabType">LabType</option>
                <option value="LabFacilities">LabFacilities</option>
                  <option value="Status">Status</option>
                  <option value="TenantDocumentType">TenantDocumentType</option>
              </select>

              {/* Name Input */}
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Name"
                className="w-68 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />

              {/* Code Input */}
              <input
                type="hidden"
                value={formData.code}
                maxLength={5}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Code"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />

              {/* Status Dropdown */}
              <select
                value={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.value })
                }
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="mt-4 flex gap-4">
              <CustomButton type="submit">
                {formData.appLOVID === 0 ? 'Add' : 'Update'}
              </CustomButton>

              <CustomButton type="button" onClick={() => setShowForm(false)}>
                Cancel
              </CustomButton>
            </div>
          </form>
        </div>
      )}

      {/* Global Search and Add Button in the Same Row */}
      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative">
          {/* <input
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
          </span> */}
        </div>
        <div className="mb-4">
          {' '}
          {/* Fixed div closing here */}
          <CustomButton onClick={() => setShowForm(true)}>+ Add</CustomButton>
        </div>{' '}
        {/* Added closing div here */}
      </div>

      {/* Table Component */}
      <div className="w-full overflow-x-auto">
        <div
          className="ag-theme-alpine min-w-[600px]"
          style={{ height: 'auto' }}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
            headerHeight={40} // Adjust header height
            rowHeight={40} // Adjust row height
            onGridReady={onGridReady}
          />
        </div>
      </div>

      {/* Conditional Confirmation Message Box */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              <CustomButton onClick={confirmDelete}>Yes, Delete</CustomButton>
              <CustomButton
                onClick={cancelDelete}
                className="bg-gray-300 text-black hover:bg-gray-400"
              >
                Cancel
              </CustomButton>
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

export default LovMasters;
