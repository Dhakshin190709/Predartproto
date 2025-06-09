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
  const [filteredRowData, setFilteredRowData] =
    useState<RowData[]>(filteredData);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    planName: '',
    planCode: '',
    planDescription: '',
    setupPrice: '', // empty string, not 0
    monthlyPrice: '',
    quarterlyPrice: '',
    halfyearlyPrice: '',
    yearlyPrice: '',
    isActive: true,
    pricePlanID: '',
  });

  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        planName: '',
        planCode: '',
        planDescription: '',
        setupPrice: '',
        monthlyPrice: '',
        quarterlyPrice: '',
        halfyearlyPrice: '',
        yearlyPrice: '',
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

  const handleEditClick = (plan: RowData) => {
    setFormData({
      pricePlanID: plan.pricePlanID || '', // 🔁 Add this line
      planName: plan.planName || '',
      planCode: plan.planCode || '',
      planDescription: plan.planDescription || '',
      setupPrice: plan.setupPrice || '',
      monthlyPrice: plan.monthlyPrice || '',
      quarterlyPrice: plan.quarterlyPrice || '',
      halfyearlyPrice: plan.halfyearlyPrice || '',
      yearlyPrice: plan.yearlyPrice || '',
      isActive: plan.isActive ?? true,
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
      // Validation failed, errors are set in state by validateForm
      toast.error('Please fix the errors before submitting.');
      return;
    }

    try {
      // Prepare data for API (make sure to convert prices to numbers)
      const userID = sessionStorage.getItem('userID');
      if (!userID) {
        toast.error('User not logged in. Please log in again.');
        return;
      }

      const payload = {
        pricePlanID: formData.pricePlanID || undefined, // undefined for new plans
        planName: formData.planName.trim(),
        planCode: formData.planCode?.trim() || '',
        planDescription: formData.planDescription?.trim() || '',
        setupPrice: Number(formData.setupPrice),
        monthlyPrice: Number(formData.monthlyPrice),
        quarterlyPrice: Number(formData.quarterlyPrice),
        halfyearlyPrice: Number(formData.halfyearlyPrice),
        yearlyPrice: Number(formData.yearlyPrice),
        isActive: formData.isActive ?? true,
        createdBy: userID,
        updatedBy: userID,
      };

      let response;
      let toastMessage = '';

      if (!formData.pricePlanID) {
        response = await api.post('/PricePlan', payload);
        toastMessage = 'Plan saved successfully!';
      } else {
        response = await api.put('/PricePlan', payload);
        toastMessage = 'Plan updated successfully!';
      }

      toast.success(toastMessage);
      await refreshTableData(); // refresh data after save
      resetFormData();
      setShowForm(false);
      setFormErrors({});
    } catch (error: any) {
      console.error(
        'Error saving plan:',
        error.response?.data || error.message,
      );
      toast.error('Failed to save/update plan. Please try again.');
    }
  };

  const refreshTableData = async () => {
    try {
      const response = await api.get('/PricePlan'); // Updated endpoint for price plans
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
        'Error fetching price plan data:',
        error.response?.data || error.message,
      );
    }
  };
  
  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      planName: '',
      planCode: '',
      planDescription: '',
      setupPrice: '',
      monthlyPrice: '',
      quarterlyPrice: '',
      halfyearlyPrice: '',
      yearlyPrice: '',
      isActive: true,
    });
  };

  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'Plan ID',
      field: 'planID',
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
      headerName: 'Plan Name',
      field: 'planName',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 220,
    },
    {
      headerName: 'Plan Code',
      field: 'planCode',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 160,
    },

    {
      headerName: 'Setup Price',
      field: 'setupPrice',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 130,
      valueFormatter: (params: any) => `₹${params.value}`,
    },
    {
      headerName: 'Monthly',
      field: 'monthlyPrice',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 130,
      valueFormatter: (params: any) => `₹${params.value}`,
    },
    {
      headerName: 'Quarterly',
      field: 'quarterlyPrice',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 130,
      valueFormatter: (params: any) => `₹${params.value}`,
    },
    {
      headerName: 'Half-Yearly',
      field: 'halfyearlyPrice',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 130,
      valueFormatter: (params: any) => `₹${params.value}`,
    },
    {
      headerName: 'Yearly',
      field: 'yearlyPrice',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 130,
      valueFormatter: (params: any) => `₹${params.value}`,
    },
    {
      headerName: 'Description',
      field: 'planDescription',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 380,
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
        hide: true,
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 80,
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.planID)}
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
        row.planName?.toLowerCase().includes(searchText) ||
        row.planCode?.toLowerCase().includes(searchText) ||
        row.planDescription?.toLowerCase().includes(searchText) ||
        row.setupPrice?.toString().includes(searchText) ||
        row.monthlyPrice?.toString().includes(searchText) ||
        row.quarterlyPrice?.toString().includes(searchText) ||
        row.halfyearlyPrice?.toString().includes(searchText) ||
        row.yearlyPrice?.toString().includes(searchText);

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

    const pricePlanID = params.data.pricePlanID; // The GUID used to identify the plan
    const updatedStatus = !(params.data.isActive === true);

    try {
      await api.put('/PricePlan/UpdateStatus', {
        guidID: pricePlanID, // ✅ send as guidID
        isActive: updatedStatus,
        updatedBy: userID,
      });

      // Update only the selected row in the UI
      const updatedData = rowData.map((item) =>
        item.pricePlanID === pricePlanID
          ? { ...item, isActive: updatedStatus }
          : item,
      );

      setRowData(updatedData);
      setFilteredData(updatedData);

      toast.success('Price plan status updated successfully!');
    } catch (error) {
      console.error(
        'Error updating status:',
        error.response?.data || error.message,
      );
      toast.error('Failed to update price plan status. Please try again.');
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

    // planName required
    if (!formData.planName.trim()) {
      errors.planName = 'Plan Name is required';
    }

    const desc = formData.planDescription.trim();
    const descRegex = /^[a-zA-Z0-9\s.,:;'"()\-!?]*$/;

    if (!desc) {
      errors.planDescription = 'Description is required';
    } else if (desc.length > 250) {
      errors.planDescription = 'Description must be max 250 characters';
    } else if (!descRegex.test(desc)) {
      errors.planDescription =
        'Description contains invalid characters (no emojis or special chars allowed)';
    } else if (/^(.)\1*$/.test(desc)) {
      // This regex means "the entire string is the same character repeated"
      errors.planDescription =
        'Description cannot be the same character repeated multiple times';
    }

    // Prices validation: decimals allowed, max 6 digits before decimal, max 2 after decimal, required
    const priceFields = [
      { key: 'setupPrice', label: 'Setup Price' },
      { key: 'monthlyPrice', label: 'Monthly Price' },
      { key: 'quarterlyPrice', label: 'Quarterly Price' },
      { key: 'halfyearlyPrice', label: 'Half Yearly Price' },
      { key: 'yearlyPrice', label: 'Yearly Price' },
    ];

    priceFields.forEach(({ key, label }) => {
      const rawVal = formData[key];
      const val =
        rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : '';

      if (val === '') {
        errors[key] = `${label} is required`;
      } else if (!/^\d{1,6}(\.\d{1,2})?$/.test(val)) {
        errors[key] =
          `${label} must be a valid number (up to 6 digits and 2 decimals)`;
      } else {
        const numVal = parseFloat(val);
        if (isNaN(numVal) || numVal < 0) {
          errors[key] = `${label} must be a non-negative number`;
        }
      }
    });

    setFormErrors(errors);

    return Object.keys(errors).length === 0; // true if no errors
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Price Plan
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New Plan' : 'Edit Plan'}
          </h3>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            {/* Row 1: Plan Name, Setup, Monthly, Quarterly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData({ ...formData, planName: e.target.value })
                  }
                  placeholder="Plan Name"
                  maxLength={40}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                {formErrors.planName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.planName}
                  </p>
                )}
              </div>

              {['setupPrice', 'monthlyPrice', 'quarterlyPrice'].map((key) => (
                <div key={key}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    maxLength={6}
                    placeholder={key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                    value={formData[key]}
                    onChange={(e) => {
                      const val = e.target.value;
                      const regex = /^\d{0,6}(\.\d{0,2})?$/;

                      if (val === '' || regex.test(val)) {
                        setFormData({ ...formData, [key]: val });
                      }
                    }}
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                  {formErrors[key] && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors[key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Row 2: Description (textarea), Half Yearly, Yearly, IsActive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['halfyearlyPrice', 'yearlyPrice'].map((key) => (
                <div key={key}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    maxLength={6}
                    placeholder={key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                    value={formData[key]}
                    onChange={(e) => {
                      const val = e.target.value;
                      const regex = /^\d{0,6}(\.\d{0,2})?$/;

                      if (val === '' || regex.test(val)) {
                        setFormData({ ...formData, [key]: val });
                      }
                    }}
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                  {formErrors[key] && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors[key]}
                    </p>
                  )}
                </div>
              ))}
              <div className="md:col-span-1">
                <textarea
                  value={formData.planDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      planDescription: e.target.value,
                    })
                  }
                  placeholder="Plan Description"
                  rows={1}
                  maxLength={200}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                {formErrors.planDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.planDescription}
                  </p>
                )}
              </div>
              {formMode === 'Edit' && (
                <div className="flex items-center gap-2 mt-2">
                  <label
                    htmlFor="isActive"
                    className="text-black dark:text-white select-none"
                  >
                    Active
                  </label>
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
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
