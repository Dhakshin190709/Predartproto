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

const TenantAddOn: React.FC = () => {
  // Initialize rowData with useState
  const editFormRef = useRef<HTMLDivElement | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [addOnList, setAddOnList] = useState([]);

  const [quickSearchText, setQuickSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [formMode, setFormMode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [tenantList, setTenantList] = useState([]);
  const tenantMap = Object.fromEntries(
    tenantList.map((t) => [t.tenantID, t.tenantName]),
  );
  const addOnMap = Object.fromEntries(
    addOnList.map((a) => [a.addOnID, a.addOnName]),
  );

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    tenantAddOnID: '',
    tenantID: '',
    addOnID: '',
    quantity: 0,
    purchasedOn: new Date().toISOString(),
    paymentStatus: undefined,

    isActive: true,
  });

  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        tenantID: '',
        addOnID: '',
        quantity: 0,
        purchasedOn: new Date().toISOString(),
        paymentStatus: false,
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
    setShowForm(false);
    setFormMode('');
    setFormData({
      tenantID: '',
      addOnID: '',
      quantity: 0,
      purchasedOn: new Date().toISOString(),
      paymentStatus: false,
    });
  };

  const handleEditClick = (feature: RowData) => {
    setFormData({
      tenantAddOnID: feature.tenantAddOnID, // ✅ store ID for PUT
      tenantID: feature.tenantID || '',
      addOnID: feature.addOnID || '',
      quantity: feature.quantity ?? 0,
      purchasedOn: feature.purchasedOn || new Date().toISOString(),
      paymentStatus: feature.paymentStatus ?? false,
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

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const response = await api.get('/AddOn');
        if (response.data.success && Array.isArray(response.data.data)) {
          setAddOnList(response.data.data);
        } else {
          console.error('Failed to fetch add-ons:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching add-ons:', error);
      }
    };

    fetchAddOns();
  }, []);

  // Add or update tenant

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const basePayload = {
        tenantID: formData.tenantID,
        addOnID: formData.addOnID,
        quantity: formData.quantity,
        purchasedOn: formData.purchasedOn,
        paymentStatus: formData.paymentStatus,
        isActive: formData.isActive ?? true,
        updatedBy: userID,
      };

      const payload =
        formMode === 'Add'
          ? { ...basePayload, createdBy: userID }
          : { ...basePayload, tenantAddOnID: formData.tenantAddOnID };

      let response;
      let toastMessage = '';

      if (formMode === 'Add') {
        response = await api.post('/TenantAddOn', payload);
        toastMessage = 'Tenant Add-On added successfully!';
      } else {
        response = await api.put('/TenantAddOn', payload);
        toastMessage = 'Tenant Add-On updated successfully!';
      }

      // Handle API Response
      const apiRes = response?.data;
      if (apiRes?.success && apiRes?.data !== 'Failed') {
        toast.success(toastMessage);
        await refreshTableData();
        resetFormData();
        setShowForm(false);
        setFormErrors({});
      } else {
        toast.error('Something went wrong. Please check your data.');
      }
    } catch (error: any) {
      console.error(
        'Error saving Tenant Add-On:',
        error.response?.data || error.message,
      );
      toast.error('Failed to save/update Tenant Add-On. Please try again.');
    }
  };

 const refreshTableData = async () => {
  try {
    const roleName = sessionStorage.getItem('roleName');
    const tenantID = sessionStorage.getItem('tenantID');

    let url = '/TenantAddOn';

    // If role is TenantAdmin, add TenantID to query
    if (roleName === 'TenantAdmin' && tenantID) {
      url += `?TenantID=${tenantID}`;
    }

    const response = await api.get(url);

    if (response.data && Array.isArray(response.data.data)) {
      setRowData([...response.data.data]);
      setFilteredData([...response.data.data]);
    } else {
      console.error('Error: response.data.data is not an array', response.data);
    }
  } catch (error: any) {
    console.error(
      'Error fetching Tenant Add-On data:',
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

  const columnDefs: ColDef[] = [
    {
      headerName: 'S.No',
      valueGetter: 'node.rowIndex + 1',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 80,
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Tenant Name',
      field: 'tenantID',
      headerClass: 'left-header',
      cellClass: 'text-left',
      flex: 1,
      valueGetter: (params) => tenantMap[params.data.tenantID] || 'N/A', // Requires map
    },
    {
      headerName: 'Add-On',
      field: 'addOnID',
      headerClass: 'left-header',
      cellClass: 'text-left',
      flex: 1,
      valueGetter: (params) => addOnMap[params.data.addOnID] || 'N/A', // Requires map
    },
    {
      headerName: 'Quantity',
      field: 'quantity',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 120,
    },
    {
      headerName: 'Purchased On',
      field: 'purchasedOn',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 160,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString('en-IN'),
    },
    {
      headerName: 'Payment Status',
      field: 'paymentStatus',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 140,
      cellRenderer: (params) => (
        <span className={params.value ? 'text-green-500' : 'text-red-500'}>
          {params.value ? 'Paid' : 'Unpaid'}
        </span>
      ),
    },
    {
      headerName: 'Status',
      field: 'isActive',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 120,
      cellRenderer: (params) => {
        const isActive = params.value === true;
        return (
          <span
            onClick={() => toggleStatus(params)}
            className={`cursor-pointer font-bold ${
              isActive ? 'text-green-500' : 'text-red-500'
            } hover:underline`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      headerName: 'Edit',
      width: 80,
      cellClass: 'text-center',
      cellRenderer: (params) => (
        <span
          onClick={() => handleEditClick(params.data)}
          className="cursor-pointer text-blue-500 hover:scale-110"
        >
          <Edit
            size={18}
            className="text-blue-500 hover:scale-110 mt-3 transition-transform"
          />
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

    const tenantAddOnID = params.data.tenantAddOnID; // ✅ Use correct ID field
    const updatedStatus = !(params.data.isActive === true);

    try {
      await api.put('/TenantAddOn/UpdateStatus', {
        guidID: tenantAddOnID, // ✅ Correct key and value
        isActive: updatedStatus,
        updatedBy: userID,
      });

      const updatedData = rowData.map((item) =>
        item.tenantAddOnID === tenantAddOnID
          ? { ...item, isActive: updatedStatus }
          : item,
      );

      setRowData(updatedData);
      setFilteredData(updatedData);

      toast.success('Tenant Add-On status updated successfully!');
    } catch (error: any) {
      console.error(
        'Error updating status:',
        error.response?.data || error.message,
      );
      toast.error('Failed to update Tenant Add-On status. Please try again.');
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

    // Tenant Name (tenantID)
    if (!formData.tenantID) {
      errors.tenantID = 'Tenant is required';
    }

    // Add-On (addOnID)
    if (!formData.addOnID) {
      errors.addOnID = 'Add-On is required';
    }

    // Quantity: required, digits only, max 4 digits
    const quantityStr = String(formData.quantity || '');
    const quantityRegex = /^\d{1,4}$/;

    if (!quantityStr) {
      errors.quantity = 'Quantity is required';
    } else if (!quantityRegex.test(quantityStr)) {
      errors.quantity = 'Quantity must be a number with max 4 digits';
    }

    // Purchased On: required and must be today or future
    if (!formData.purchasedOn) {
      errors.purchasedOn = 'Purchased On date is required';
    } else {
      const selectedDate = new Date(formData.purchasedOn);
      const selected = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );

      const today = new Date();
      const current = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      if (selected < current) {
        errors.purchasedOn = 'Purchased On cannot be in the past';
      }
    }

    // Payment Status
    if (formData.paymentStatus === undefined) {
      errors.paymentStatus = 'Payment status is required';
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
    const fetchTenantData = async () => {
      try {
        const roleName = sessionStorage.getItem('roleName');
        const tenantID = sessionStorage.getItem('tenantID');

        if (roleName === 'TenantAdmin' && tenantID) {
          const response = await api.get(`/Tenant/${tenantID}`);
          if (response.data.success && response.data.data) {
            const tenant = response.data.data;
            setTenantList([tenant]); // Set as single-item list
            setFormData((prev) => ({
              ...prev,
              tenantID: String(tenant.tenantID),
            }));
          } else {
            console.error('Tenant fetch failed:', response.data.message);
          }
        } else {
          // For other roles, fetch all tenants
          const response = await api.get('/Tenant');
          if (response.data.success && Array.isArray(response.data.data)) {
            setTenantList(response.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching tenant(s):', error);
      }
    };

    fetchTenantData();
  }, []);

  useEffect(() => {
    if (formMode === 'Add') {
      const roleName = sessionStorage.getItem('roleName');
      const tenantID = sessionStorage.getItem('tenantID');

      if (roleName === 'TenantAdmin' && tenantID) {
        setFormData((prev) => ({
          ...prev,
          tenantID: tenantID,
        }));
      }
    }
  }, [formMode]);

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Tenant AddOn
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New Tenant AddOn' : 'Edit Tenant AddOn'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Row 1: Tenant and Add-On Dropdowns */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Tenant Dropdown */}
              <div className="flex-1">
                <select
                  value={String(formData.tenantID || '')}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantID: e.target.value })
                  }
                  disabled={
                    sessionStorage.getItem('roleName') === 'TenantAdmin'
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600"
                >
                  <option value="">Select Tenant</option>
                  {tenantList.map((tenant) => (
                    <option
                      key={tenant.tenantID}
                      value={String(tenant.tenantID)}
                    >
                      {tenant.tenantName}
                    </option>
                  ))}
                </select>

                {formErrors.tenantID && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.tenantID}
                  </p>
                )}
                {/* Below Tenant: Quantity and Purchased On */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  {/* Quantity */}
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder='Quantity'
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value || '0'),
                        })
                      }
                      min={0}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />

                    {formErrors.quantity && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.quantity}
                      </p>
                    )}
                  </div>

                  {/* Purchased On */}
                  <div className="flex-1">
                    <input
                      type="date"
                      value={formData.purchasedOn?.split('T')[0] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchasedOn: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : '', // or null if your backend expects null
                        })
                      }
                      disabled={formMode === 'Edit'}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {formErrors.purchasedOn && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.purchasedOn}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add-On Dropdown */}
              <div className="flex-1">
                <select
                  value={formData.addOnID}
                  onChange={(e) =>
                    setFormData({ ...formData, addOnID: e.target.value })
                  }
                  disabled={formMode === 'Edit'}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">Select Add-On</option>
                  {addOnList.map((addon) => (
                    <option key={addon.addOnID} value={addon.addOnID}>
                      {addon.addOnName}
                    </option>
                  ))}
                </select>
                {formErrors.addOnID && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.addOnID}
                  </p>
                )}
                {/* Below Add-On: Payment Status and isActive */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  {/* Payment Status */}
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        id="paymentStatus"
                        type="checkbox"
                        checked={formData.paymentStatus === true}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentStatus: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="paymentStatus"
                        className="text-black dark:text-white select-none"
                      >
                        Payment Status
                      </label>
                    </div>
                    {formErrors.paymentStatus && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.paymentStatus}
                      </p>
                    )}
                  </div>

                  {/* isActive (Edit Mode Only) */}
                  {formMode === 'Edit' && (
                    <div className="flex items-center gap-2">
                      <input
                        id="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
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
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
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
          rowData={filteredData}
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

export default TenantAddOn;
