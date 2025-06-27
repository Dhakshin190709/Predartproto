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

const AddOn: React.FC = () => {
  // Initialize rowData with useState
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [addOns, setAddOns] = useState<RowData[]>([]);
  const [filteredAddOns, setFilteredAddOns] = useState<RowData[]>([]);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [formMode, setFormMode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState({});
  const [addOn, setAddOn] = useState([]);
  const [formData, setFormData] = useState<RowData>({
    addOnName: '',
    addOnCode: '',
    addOnType: '',
    description: '',
    price: '',
    isRecurring: false,
    isActive: true,
  });

  // handle Add button click
  const handleAdd = () => {
    setFormData({
      addOnID: '',
      addOnName: '',
      addOnCode: '',
      addOnType: '',
      description: '',
      price: '',
      isRecurring: false,
      isActive: true,
    });
    setFormMode('Add');
    setShowForm(true); // Show the form
  };

  // Reset form data when switching to "Add" mode
  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        addOnID: '',
        addOnName: '',
        addOnCode: '',
        addOnType: '',
        description: '',
        price: 0,
        isRecurring: false,
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

  const handleEditClick = (addOn: AddOn) => {
    setFormData({
      addOnID: addOn.addOnID,
      addOnName: addOn.addOnName,
      addOnCode: addOn.addOnCode,
      addOnType: addOn.addOnType,
      description: addOn.description,
      price: addOn.price,
      isRecurring: addOn.isRecurring,
      isActive: addOn.isActive,
    });

    setShowForm(true); // Show the form when editing
    setFormMode('Edit');

    // Scroll to the edit form smoothly
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const validateAddOnForm = () => {
    let isValid = true;
    const errors: any = {};

    // 1. AddOn Name – required & allow letters, numbers, spaces, and hyphens
    if (!formData.addOnName?.trim()) {
      errors.addOnName = 'AddOn Name is required';
      isValid = false;
    } else if (!/^[A-Za-z0-9\s-]+$/.test(formData.addOnName)) {
      errors.addOnName =
        'AddOn Name can only contain letters, numbers, spaces, and hyphens';
      isValid = false;
    }

    // 2. AddOn Type – required & allow letters, numbers, spaces, and hyphens
    if (!formData.addOnType?.trim()) {
      errors.addOnType = 'AddOn Type is required';
      isValid = false;
    } else if (!/^[A-Za-z0-9\s-]+$/.test(formData.addOnType)) {
      errors.addOnType =
        'AddOn Type can only contain letters, numbers, spaces, and hyphens';
      isValid = false;
    }

    // 3. Price – required & only numbers
    if (!formData.price?.toString().trim()) {
      errors.price = 'Price is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.price)) {
      errors.price = 'Price should contain only numbers';
      isValid = false;
    }

    // 4. Description – required & only letters, numbers, and spaces
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (!/^[A-Za-z0-9\s]+$/.test(formData.description)) {
      errors.description =
        'Description should contain only letters, numbers, and spaces';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
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

    if (!validateAddOnForm()) return;

    try {
      const isActive = formData.isActive ?? true;
      const now = new Date().toISOString();

      const payload: any = {
        addOnName: formData.addOnName.trim(),
        addOnCode: formData.addOnCode.trim(),
        addOnType: formData.addOnType.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        isRecurring: Boolean(formData.isRecurring),
        isActive,
      };

      if (!formData.addOnID) {
        // Create case
        payload.createdBy = userID;
        payload.createdOn = now;

        const response = await api.post('/AddOn', payload);
        toast.success('Add-on saved successfully!');
      } else {
        // Update case
        payload.addOnID = formData.addOnID; // ✅ Ensure addOnID is passed
        payload.updatedBy = userID;
        payload.updatedOn = now;

        const response = await api.put('/AddOn', payload);
        toast.success('Add-on updated successfully!');
      }

      await refreshTableData();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error(
        'Error saving add-on:',
        error.response?.data || error.message,
      );
      toast.error('Failed to save/update add-on. Please try again.');
    }
  };

  // Fetch updated list of tenants to refresh the table
  const refreshTableData = async () => {
    try {
      const response = await api.get('/AddOn'); // Uses baseURL and headers from api.js
      if (response.data && Array.isArray(response.data.data)) {
        setAddOns([...response.data.data]); // Update table rows
        setFilteredAddOns([...response.data.data]); // Update filtered rows if used for search/filtering
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

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      addOnID: '', // empty string for new add-on
      addOnName: '',
      addOnCode: '',
      addOnType: '',
      description: '',
      price: '', // keep as string if your input uses text; else 0 if number
      isRecurring: false, // default to false, adjust if you want true
      isActive: true, // boolean true by default
    });
  };

  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'AddOn ID',
      field: 'addOnID',
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
      headerName: 'AddOn Name',
      headerClass: 'left-header',
      cellClass: 'left-center',
      field: 'addOnName',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: 'AddOn Code',
      field: 'addOnCode',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: 'AddOn Type',
      field: 'addOnType',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Description',
      field: 'description',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 350,
    },
    {
      headerName: 'Price',
      field: 'price',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 80,
    },

    {
      headerName: 'Status',
      field: 'isActive',
  
      width: 150,
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
        row.code?.toLowerCase().includes(searchText) ||
        row.description?.toLowerCase().includes(searchText) ||
        row.price?.toString().toLowerCase().includes(searchText); // ✅ Added price

      return matchesSearch;
    });
  };

  // Filter search function (handles name and isActive filters)
  const handleFilterSearch = () => {
    const filtered = promoRowData.filter(
      (item) =>
        (name ? item.code?.toLowerCase().includes(name.toLowerCase()) : true) &&
        (isActive ? item.isActive === true : true),
    );
    return filtered;
  };

  // Call applyGlobalSearch after filtering
  const handleSearch = () => {
    const filtered = handleFilterSearch();
    const globallySearched = applyGlobalSearch(filtered);
    setFilteredAddOns(globallySearched);
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

    const updatedStatus = !(
      params.data.isActive === 'Active' || params.data.isActive === true
    );

    try {
      const payload = {
        guidID: params.data.addOnID,
        id: params.data.id || 0,
        updatedBy: userID,
        updatedOn: new Date().toISOString(),
        isActive: updatedStatus,
      };

      const response = await api.put('/AddOn/UpdateStatus', payload);

      if (response.status === 200 || response.status === 204) {
        // ✅ Update grid visually
        params.node.setDataValue('isActive', updatedStatus);

        toast.success('Add-on status updated successfully!');
      } else {
        console.error('Unexpected response:', response);
        toast.error('Something went wrong. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update add-on status. Please try again.');
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
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">AddOn</h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New AddOn' : 'Edit AddOn'}
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Row 1: AddOn Name, Code, Type, Price */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* AddOn Name */}
              <div>
                <input
                  type="text"
                  placeholder="AddOn Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.addOnName}
                  onChange={(e) =>
                    setFormData({ ...formData, addOnName: e.target.value })
                  }
                />
                {formErrors.addOnName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.addOnName}
                  </p>
                )}
              </div>

              {/* AddOn Type */}
              <div>
                <input
                  type="text"
                  placeholder="AddOn Type"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.addOnType}
                  onChange={(e) =>
                    setFormData({ ...formData, addOnType: e.target.value })
                  }
                />

                {formErrors.addOnType && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.price}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Description */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Description"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Row 3: Is Active, Is Recurring */}
            <div className="grid grid-cols-4 gap-4 items-center">
              {/* Column 1: Is Active */}
              <div className="col-span-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <label>Is Active</label>
              </div>

              {/* Column 2: Is Recurring */}
              <div className="col-span-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                />
                <label>Is Recurring</label>
              </div>
            </div>

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

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg"
              >
                {formMode === 'Add' ? 'Save' : 'Update'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg"
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

  <div className="w-full overflow-x-auto">
  <div className="ag-theme-alpine min-w-[600px]" style={{ height: 'auto' }}>
        <AgGridReact
          rowData={
            filteredAddOns.length > 0 ? applyGlobalSearch(filteredAddOns) : []
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

export default AddOn;
