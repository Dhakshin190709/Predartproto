import axios from 'axios'; // Ensure Axios is installed via npm or yarn
import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Edit } from 'lucide-react';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS
import { ToastContainer } from 'react-toastify';
import api from '../../api/request';

const LabTestMaster: React.FC = () => {
  // Initialize rowData with useState
  const editFormRef = useRef<HTMLDivElement | null>(null);

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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    labTestMasterID: '',
    testName: '',
    testCode: '',
    testType: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        labTestMasterID: '',
        testName: '',
        testCode: '',
        testType: '',
        description: '',
        isActive: true,
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
    setFormData({
      labTestMasterID: '',
      testName: '',
      testCode: '',
      testType: '',
      description: '',
      isActive: true,
    });
    setFormErrors({});
  };

  const handleEditClick = (row: RowData) => {
    setFormData({
      labTestMasterID: row.labTestMasterID || '', // ✅ Add this
      testName: row.testName || '',
      testCode: row.testCode || '',
      testType: row.testType || '',
      description: row.description || '',
      isActive: row.isActive ?? true,
    });

    setShowForm(true);
    setFormMode('Edit');

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100);
  };

  // Add or update tenant

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      toast.error('User ID missing. Please log in again.');
      return;
    }

    const currentDateTime = new Date().toISOString();

    const payload = {
      createdBy: userID, // You may store original creator separately if needed
      updatedBy: userID,
      createdOn: currentDateTime,
      updatedOn: currentDateTime,
      isActive: formData.isActive ?? true,
      testName: formData.testName.trim(),
      testCode: formData.testCode.trim(),
      testType: formData.testType.trim(),
      description: formData.description.trim(),
      ...(formMode === 'Edit' && { labTestMasterID: formData.labTestMasterID }), // Include only for edit
    };

    try {
      const response =
        formMode === 'Edit'
          ? await api.put('/LabTestMaster', payload) // PUT for update
          : await api.post('/LabTestMaster', payload); // POST for add

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `Lab test ${formMode === 'Edit' ? 'updated' : 'added'} successfully!`,
        );
        await refreshTableData();
        resetFormData();
        setShowForm(false);
        setFormErrors({});
      } else {
        toast.error('Failed to save lab test master.');
      }
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);
      toast.error('Failed to save lab test master. Please try again.');
    }
  };

  const refreshTableData = async () => {
    try {
      const response = await api.get('/LabTestMaster');

      if (response.data && Array.isArray(response.data.data)) {
        setRowData([...response.data.data]);
        setFilteredData([...response.data.data]);
      } else {
        console.error(
          'Error: response.data.data is not an array',
          response.data,
        );
      }
    } catch (error: any) {
      console.error(
        'Error fetching lab test master data:',
        error.response?.data || error.message,
      );
      toast.error('Failed to fetch lab test master records.');
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      labTestMasterID: '',
      testName: '',
      testCode: '',
      testType: '',
      description: '',
      isActive: true,
    });
  };

  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'LabTestMaster ID',
      field: 'labTestMasterID',
      hide: true,
    },
    {
      headerName: 'S.No',
      valueGetter: 'node.rowIndex + 1',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 100,
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Test Name',
      field: 'testName',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 220,
    },
    {
      headerName: 'Test Code',
      field: 'testCode',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 220,
    },
    {
      headerName: 'Test Type',
      field: 'testType',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 220,
    },
    {
      headerName: 'Description',
      field: 'description',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 300,
    },
    {
      headerName: 'Status',
      field: 'isActive',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 160,
      cellRenderer: (params: any) => {
        const isActive = params.value === true;
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
      width: 130,
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEditClick(params.data)}
          className="cursor-pointer flex justify-center items-center"
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
      headerClass: 'center-header',
      hide: true,
      cellClass: 'text-center',
      width: 80,
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.featureID)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
    },
  ];

  // Define applyGlobalSearch function
  const applyGlobalSearch = (data: RowData[]) => {
    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data);
      return [];
    }

    const searchText = quickSearchText.toLowerCase();

    return data.filter((row) => {
      return (
        row.testName?.toLowerCase().includes(searchText) ||
        row.testCode?.toLowerCase().includes(searchText) ||
        row.testType?.toLowerCase().includes(searchText) ||
        row.description?.toLowerCase().includes(searchText) ||
        (row.isActive !== undefined &&
          (row.isActive ? 'active' : 'inactive').includes(searchText))
      );
    });
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const toggleStatus = async (params: any) => {
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const labTestMasterID = params.data.labTestMasterID; // ✅ Use correct ID field
    const updatedStatus = !(params.data.isActive === true);

    try {
      await api.patch('/LabTestMaster', {
        guidID: labTestMasterID,
        updatedBy: userID,
        isActive: updatedStatus,
      });

      const updatedData = rowData.map((item) =>
        item.labTestMasterID === labTestMasterID
          ? { ...item, isActive: updatedStatus }
          : item,
      );

      setRowData(updatedData);
      setFilteredData(updatedData);

      toast.success('Lab test status updated successfully!');
    } catch (error: any) {
      console.error(
        'Error updating status:',
        error.response?.data || error.message,
      );
      toast.error('Failed to update test status. Please try again.');
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

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const nameRegex = /^[a-zA-Z0-9\s_-]{3,100}$/; // For package name
    const codeRegex = /^[A-Z0-9_-]{3,20}$/; // For package code
    const priceRegex = /^[0-9]+(\.[0-9]{1,2})?$/; // For price
    const descRegex = /^[a-zA-Z0-9\s.,:;'"()\-!?]*$/; // For description
    const alphaNumOnly = /^[a-zA-Z0-9\s-]+$/;

    // ✅ Test Name
    if (!formData.testName.trim()) {
      errors.testName = 'Test Name is required';
    } else if (!alphaNumOnly.test(formData.testName.trim())) {
      errors.testName = 'Test Name should contain only letters and numbers';
    }

    // ✅ Test Type
    if (!formData.testType.trim()) {
      errors.testType = 'Test Type is required';
    } else if (!alphaNumOnly.test(formData.testType.trim())) {
      errors.testType = 'Test Type should contain only letters and numbers';
    }

    // ✅ Description
    const description = formData.description?.trim() || '';
    if (!description) {
      errors.description = 'Description is required';
    } else if (description.length > 250) {
      errors.description = 'Description must be max 250 characters';
    } else if (!descRegex.test(description)) {
      errors.description =
        'Description contains invalid characters (no emojis or special characters)';
    }

    // ✅ Status (isActive)
    if (formData.isActive !== true && formData.isActive !== false) {
      errors.isActive = 'Status is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper to check repeated words
  const hasRepeatedWords = (text: string) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordSet = new Set<string>();

    for (const word of words) {
      if (wordSet.has(word)) return true;
      wordSet.add(word);
    }
    return false;
  };
useEffect(() => {
  if (descriptionRef.current) {
    descriptionRef.current.style.height = 'auto'; // reset
    descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`; // fit content
  }
}, [formData.description]);

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Lab Test Master
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New LabTestMaster' : 'Edit Feature'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* ✅ Row 1: Test Name | Test Type | Is Active (as dropdown) */}
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              {/* Test Name */}
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.testName}
                  onChange={(e) =>
                    setFormData({ ...formData, testName: e.target.value })
                  }
                  placeholder="Test Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                {formErrors.testName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.testName}
                  </p>
                )}
              </div>

              {/* Test Type */}
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.testType}
                  onChange={(e) =>
                    setFormData({ ...formData, testType: e.target.value })
                  }
                  placeholder="Test Type"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                {formErrors.testType && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.testType}
                  </p>
                )}
              </div>
            </div>

            {/* ✅ Row 2: Description */}
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="md:w-2/3 w-full">
               <textarea
  ref={descriptionRef}   // ✅ Here
  value={formData.description}
  onChange={(e) => {
    setFormData({ ...formData, description: e.target.value });
  }}
  placeholder="Description"
  rows={1}
  maxLength={250}
  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
/>

                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Second row: isActive checkbox (only in Edit mode) and buttons */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {formMode === 'Edit' && (
                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-black dark:text-white select-none"
                  >
                    Active
                  </label>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-5 rounded-lg"
                >
                  {formMode === 'Add' ? 'Save' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-5 rounded-lg"
                >
                  Cancel
                </button>
              </div>
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

      <div className="w-full overflow-x-auto">
        <div
          className="ag-theme-alpine min-w-[600px]"
          style={{ height: 'auto' }}
        >
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

export default LabTestMaster;
