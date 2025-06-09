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

const PricePlan: React.FC = () => {
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

 const [formData, setFormData] = useState({
  featureName: '',
  featureCode: '',
  featureDescription: '',
  isActive: true,
});

 useEffect(() => {
  if (formMode === 'Add') {
    setFormData({
      featureName: '',
      featureCode: '',
      featureDescription: '',
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
    setShowForm(false); // Show the fields again
    setFormMode('');
    setName(''); // Reset input fields if necessary
    setIsActive(false);
  };
const handleEditClick = (feature: RowData) => {
  setFormData({
    featureName: feature.featureName || '',
    featureCode: feature.featureCode || '',
    featureDescription: feature.featureDescription || '',
    isActive: feature.isActive ?? true,
  });

  setShowForm(true);
  setFormMode('Edit');

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

  // Validate form fields
  const isValid = validateForm();

  if (!isValid) {
    toast.error('Please fix the errors before submitting.');
    return;
  }

  try {
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const payload = {
      featureName: formData.featureName.trim(),
      featureCode: formData.featureCode.trim(),
      featureDescription: formData.featureDescription.trim(),
      isActive: formData.isActive ?? true,
      createdBy: userID,
      updatedBy: userID,
    };

    let response;
    let toastMessage = '';

    if (formMode === 'Add') {
      response = await api.post('/PlanFeature', payload);
      toastMessage = 'Feature added successfully!';
    } else {
      response = await api.put('/PlanFeature', payload);
      toastMessage = 'Feature updated successfully!';
    }

    toast.success(toastMessage);
    await refreshTableData(); // Refresh the grid/table
    resetFormData();          // Clear form
    setShowForm(false);       // Hide the form
    setFormErrors({});        // Clear errors
  } catch (error: any) {
    console.error('Error saving feature:', error.response?.data || error.message);
    toast.error('Failed to save/update feature. Please try again.');
  }
};


 const refreshTableData = async () => {
  try {
    const response = await api.get('/PlanFeature'); // ✅ Correct endpoint
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
      'Error fetching plan feature data:',
      error.response?.data || error.message,
    );
  }
};

useEffect(() => {
  refreshTableData();
}, []);

  const resetFormData = () => {
  setFormData({
    featureName: '',
    featureCode: '',
    featureDescription: '',
    isActive: true,
  });
};


 const columnDefs: ColDef<RowData, any>[] = [
  {
    headerName: 'Feature ID',
    field: 'featureID',
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
    headerName: 'Feature Name',
    field: 'featureName',
    headerClass: 'left-header',
    cellClass: 'text-left',
    sortable: true,
    filter: true,
    width: 220,
  },
  {
    headerName: 'Feature Code',
    field: 'featureCode',
    headerClass: 'left-header',
    cellClass: 'text-left',
    sortable: true,
    filter: true,
    width: 160,
  },
  {
    headerName: 'Description',
    field: 'featureDescription',
    headerClass: 'left-header',
    cellClass: 'text-left',
    sortable: true,
    filter: true,
    flex: 1,
  },
  {
    headerName: 'Status',
    field: 'isActive',
    headerClass: 'center-header',
    cellClass: 'text-center',
    width: 120,
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
    width: 80,
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
  console.log('Data passed to applyGlobalSearch:', data);

  if (!Array.isArray(data)) {
    console.error('Data is not an array:', data);
    return [];
  }

  const searchText = quickSearchText.toLowerCase();

  return data.filter((row) => {
    const matchesSearch =
      row.featureName?.toLowerCase().includes(searchText) ||
      row.featureCode?.toLowerCase().includes(searchText) ||
      row.featureDescription?.toLowerCase().includes(searchText);

    return matchesSearch;
  });
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

  const planFeatureID = params.data.planFeatureID; // Use correct field
  const updatedStatus = !(params.data.isActive === true);

  try {
    await api.put('/PlanFeature/UpdateStatus', {
      guidID: planFeatureID,           // ✅ Correct key
      isActive: updatedStatus,
      updatedBy: userID,
    });

    const updatedData = rowData.map((item) =>
      item.planFeatureID === planFeatureID
        ? { ...item, isActive: updatedStatus }
        : item
    );

    setRowData(updatedData);
    setFilteredData(updatedData);

    toast.success('Plan feature status updated successfully!');
  } catch (error) {
    console.error(
      'Error updating status:',
      error.response?.data || error.message
    );
    toast.error('Failed to update plan feature status. Please try again.');
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

  // Validate featureName
  const featureName = formData.featureName?.trim() || '';
  const featureNameRegex = /^[A-Za-z\s]+$/; // alphabets and spaces only

  if (!featureName) {
    errors.featureName = 'Feature Name is required';
  } else if (featureName.length > 20) {
    errors.featureName = 'Feature Name must be max 20 characters';
  } else if (!featureNameRegex.test(featureName)) {
    errors.featureName = 'Feature Name must contain alphabets only (no numbers or special characters)';
  } else if (hasRepeatedWords(featureName)) {
    errors.featureName = 'Feature Name must not contain repeated words';
  }

  // Validate featureDescription
  const featureDescription = formData.featureDescription?.trim() || '';
  const descRegex = /^[a-zA-Z0-9\s.,:;'"()\-!?]*$/; // allowed chars + numbers + punctuation

  if (!featureDescription) {
    errors.featureDescription = 'Description is required';
  } else if (featureDescription.length > 250) {
    errors.featureDescription = 'Description must be max 250 characters';
  } else if (!descRegex.test(featureDescription)) {
    errors.featureDescription = 'Description contains invalid characters (no emojis or special chars allowed)';
  } else if (hasRepeatedWords(featureDescription)) {
    errors.featureDescription = 'Description must not contain repeated words';
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


  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
       Plan Feature
      </h2>

      {showForm && (
  <div
    ref={editFormRef}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
  >
    <h3 className="text-xl font-semibold mb-4">
      {formMode === 'Add' ? 'Add New Feature' : 'Edit Feature'}
    </h3>
  <form onSubmit={handleFormSubmit} className="space-y-6">

  {/* First row: Feature Name and Feature Description side by side */}
  <div className="flex flex-col md:flex-row gap-6">
    <div className="flex-1">
      <input
        type="text"
        value={formData.featureName}
        onChange={(e) =>
          setFormData({ ...formData, featureName: e.target.value })
        }
        placeholder="Feature Name"
        maxLength={40}
        className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
      />
      {formErrors.featureName && (
        <p className="text-red-500 text-sm mt-1">{formErrors.featureName}</p>
      )}
    </div>

    <div className="flex-1">
      <textarea
        value={formData.featureDescription}
        onChange={(e) =>
          setFormData({ ...formData, featureDescription: e.target.value })
        }
        placeholder="Feature Description"
        rows={1}
        maxLength={200}
        className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
      />
      {formErrors.featureDescription && (
        <p className="text-red-500 text-sm mt-1">{formErrors.featureDescription}</p>
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
        <label htmlFor="isActive" className="text-black dark:text-white select-none">
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
        onClick={() => setShowForm(false)}
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

export default PricePlan;
