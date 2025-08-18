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

const TenantPromoUsage: React.FC = () => {
  // Initialize rowData with useState
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [tenantRowData, setTenantRowData] = useState<RowData[]>([]);
  const [filteredTenantData, setFilteredTenantData] = useState<RowData[]>([]);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [formMode, setFormMode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tenantNameMap, setTenantNameMap] = useState<{ [key: string]: string }>(
    {},
  );
  const [promoNameMap, setPromoNameMap] = useState<{ [key: string]: string }>(
    {},
  );

  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [promoCodeOptions, setPromoCodeOptions] = useState<
    { promoCodeID: string; promoName: string }[]
  >([]);
  const [tenantOptions, setTenantOptions] = useState<
    { tenantID: string; tenantName: string }[]
  >([]);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState<RowData>({
    tenantID: '',
    promoCodeID: '',
    usedOn: '',
    isActive: true,
  });

  // handle Add button click
  const handleAdd = () => {
    setFormData({
      tenantPromoUsageID: '',
      tenantID: '',
      promoCodeID: '',
      usedOn: '',
      isActive: true,
    });
    setFormMode('Add');
    setShowForm(true); // Show the form
  };

  // Reset form data when switching to "Add" mode
  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        tenantPromoUsageID: '',
        tenantID: '',
        promoCodeID: '',
        usedOn: '',
        isActive: true,
      });
    }
  }, [formMode]);

  const fetchTenants = async () => {
  try {
    const tenantID = sessionStorage.getItem('tenantID');
    const roleName = sessionStorage.getItem('roleName');

    console.log('Role:', roleName);
    console.log('Tenant ID from session:', tenantID);

    if (roleName === 'TenantAdmin' && tenantID) {
      console.log('Fetching single tenant...');
      const response = await api.get(`/Tenant/${tenantID}`);
      console.log('Single tenant API response:', response.data);

      if (response.data.success && response.data.data) {
        const tenant = response.data.data;

        console.log('Setting tenant options:', [
          {
            tenantID: tenant.tenantID,
            tenantName: tenant.tenantName,
          },
        ]);

        setTenantOptions([
          {
            tenantID: tenant.tenantID,
            tenantName: tenant.tenantName,
          },
        ]);

        setTenantNameMap({
          [tenant.tenantID]: tenant.tenantName,
        });

        setFormData((prev) => {
          const updatedForm = {
            ...prev,
            tenantID: tenant.tenantID,
          };
          console.log('FormData after prefill:', updatedForm);
          return updatedForm;
        });
      }
    } else {
      console.log('Fetching all tenants...');
      // ✅ USE THE NEW ENDPOINT
      const response = await api.get('/Tenant/TenantList');
      console.log('All tenant API response:', response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        const allTenants = response.data.data;

        console.log('All Tenants:', allTenants);

        setTenantOptions(
          allTenants.map((tenant: any) => ({
            tenantID: tenant.tenantID,
            tenantName: tenant.tenantName,
          })),
        );

        const map: { [key: string]: string } = {};
        allTenants.forEach((tenant: any) => {
          map[tenant.tenantID] = tenant.tenantName;
        });
        console.log('Tenant Name Map:', map);

        setTenantNameMap(map);
      }
    }
  } catch (error) {
    console.error('❌ Failed to fetch tenants:', error);
  }
};


  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    console.log('🔄 useEffect triggered for tenantOptions change');
    const tenantID = sessionStorage.getItem('tenantID');
    const roleName = sessionStorage.getItem('roleName');

    console.log('Current tenantOptions:', tenantOptions);
    console.log('Current formData:', formData);

    if (
      roleName === 'TenantAdmin' &&
      tenantOptions.length > 0 &&
      tenantID &&
      !formData.tenantID
    ) {
      console.log('🔁 Resetting tenantID after options loaded');
      setFormData((prev) => ({
        ...prev,
        tenantID: tenantID,
      }));
    }
  }, [tenantOptions]);

  const fetchPromoCodes = async () => {
    try {
      const response = await api.get('/PromoCode');
      const activePromos = (response.data.data || []).filter(
        (promo: any) => promo.isActive,
      );
      setPromoCodeOptions(
        activePromos.map((promo: any) => ({
          promoCodeID: promo.promoCodeID,
          promoName: promo.promoName,
        })),
      );
      const map: { [key: string]: string } = {};
      activePromos.forEach((promo: any) => {
        map[promo.promoCodeID] = promo.promoName;
      });
      setPromoNameMap(map);
    } catch (error) {
      console.error('Failed to fetch promo codes', error);
    }
  };

  useEffect(() => {
    const storedRole = sessionStorage.getItem('roleName');
    if (storedRole) {
      setRoleName(storedRole);
    }
    fetchTenants();
    fetchPromoCodes();
  }, []);

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
      tenantPromoUsageID: tenant.tenantPromoUsageID || '',
      tenantID: tenant.tenantID || '',
      promoCodeID: tenant.promoCodeID || '',
      usedOn: tenant.usedOn
        ? new Date(tenant.usedOn).toISOString().split('T')[0]
        : '',
      isActive: tenant.isActive ?? true,
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

  const validateForm = () => {
    let errors = {
      tenantID: '',
      promoCodeID: '',
      usedOn: '',
    };

    let isValid = true;

    const roleName = sessionStorage.getItem('roleName');

    if (roleName !== 'TenantAdmin' && !formData.tenantID) {
      errors.tenantID = 'Tenant is required';
      isValid = false;
    }

    if (!formData.promoCodeID) {
      errors.promoCodeID = 'Promo name is required';
      isValid = false;
    }

    if (!formData.usedOn) {
      errors.usedOn = 'UsedOn date is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleName = sessionStorage.getItem('roleName');
    let tenantIDToUse = formData.tenantID?.trim(); // from formData

    // If formData.tenantID is empty and role is TenantAdmin, use sessionStorage value
    if (roleName === 'TenantAdmin' && !tenantIDToUse) {
      tenantIDToUse = sessionStorage.getItem('tenantID') || '';
    }

    if (!tenantIDToUse) {
      toast.error('Tenant ID is missing!');
      return;
    }

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      toast.error('User not logged in.');
      return;
    }

    try {
      const now = new Date().toISOString();
      const payload = {
        createdBy: userID,
        updatedBy: userID,
        isActive: formData.isActive ?? true,
        tenantID: tenantIDToUse, // ✅ guaranteed to be set
        promoCodeID: formData.promoCodeID?.trim() || '',
        usedOn: formData.usedOn || now,
      };

      console.log('Payload:', payload); // ✅ check this

      const response = await api.post('/TenantPromoUsage', payload);
      toast.success('Tenant promo usage saved successfully!');
      await refreshTableData();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error(
        '❌ Error saving tenant promo usage:',
        error.response?.data || error.message,
      );
      toast.error('Failed to save tenant promo usage.');
    }
  };

  const refreshTableData = async () => {
    try {
      const roleName = sessionStorage.getItem('roleName');
      const tenantID = sessionStorage.getItem('tenantID');

      let url = '/TenantPromoUsage';

      // If the role is TenantAdmin, append TenantID to the API URL
      if (roleName === 'TenantAdmin' && tenantID) {
        url += `?TenantID=${tenantID}`;
      }

      const response = await api.get(url); // baseURL is assumed set in api

      if (response.data && Array.isArray(response.data.data)) {
        setTenantRowData([...response.data.data]);
        setFilteredTenantData([...response.data.data]);
      } else {
        console.error(
          'Error: response.data.data is not an array',
          response.data,
        );
      }
    } catch (error: any) {
      console.error(
        'Error fetching tenant promo usage data:',
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      tenantPromoUsageID: '',
      tenantID: '',
      promoCodeID: '',
      usedOn: '',
      isActive: true,
    });
  };

  const columnDefs: ColDef<RowData, any>[] = [
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
      field: 'tenantID',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 300,
      valueFormatter: (params: any) =>
        tenantNameMap[params.value] || params.value,
    },

    {
      headerName: 'Promo Name',
      field: 'promoCodeID',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 350,
      valueFormatter: (params: any) =>
        promoNameMap[params.value] || params.value,
    },

    {
      headerName: 'Used On',
      field: 'usedOn',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 250,
 valueFormatter: (params) => {
  if (!params.value) return '';
  const date = new Date(params.value);
  if (isNaN(date.getTime())) return '';
  // Format to local yyyy-mm-dd
  return date.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD
},


    },
    {
      headerName: 'Status',
      field: 'isActive',
      width: 200,
      headerClass: 'left-header',
      cellClass: 'left-center',
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
      hide: true,
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 100,
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
    if (!Array.isArray(data)) return [];

    const searchText = quickSearchText.toLowerCase();
    if (!searchText) return data;

    return data.filter((row) => {
      const discountString = row.discountValue?.toString().toLowerCase() || '';
      return (
        row.TenantName?.toLowerCase().includes(searchText) ||
        row.PromoCode?.toLowerCase().includes(searchText) ||
        row.usedOn?.toLowerCase().includes(searchText)
      );
    });
  };

  // Filter search function (handles name and isActive filters)
  const handleFilterSearch = () => {
    const filtered = tenantRowData.filter(
      (item) =>
        (name
          ? item.TenantName?.toLowerCase().includes(name.toLowerCase())
          : true) && (isActive ? item.isActive === true : true),
    );
    return filtered;
  };

  // Call applyGlobalSearch after filtering
  const handleSearch = () => {
    const filtered = handleFilterSearch();
    const globallySearched = applyGlobalSearch(filtered);
    setFilteredTenantData(applyGlobalSearch(handleFilterSearch()));
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

    const promoUsageID = params.data.tenantPromoUsageID;
    const updatedStatus = !(params.data.isActive === true);
    const updatedOn = new Date().toISOString();

    try {
      await api.put('/TenantPromoUsage/UpdateStatus', {
        guidID: promoUsageID,
        id: 0,
        updatedBy: userID,
        updatedOn,
        isActive: updatedStatus,
      });

      // ✅ Update only that record in filtered data
      const updatedFiltered = filteredTenantData.map((item) =>
        item.tenantPromoUsageID === promoUsageID
          ? { ...item, isActive: updatedStatus }
          : item,
      );

      setFilteredTenantData(updatedFiltered);

      toast.success(
        `Promo usage status updated to ${updatedStatus ? 'Active' : 'Inactive'}!`,
      );
    } catch (error: any) {
      console.error(
        'Error updating promo usage status:',
        error.response?.data || error.message,
      );
      toast.error('Failed to update status. Please try again.');
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
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Tenant Promo Usage
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New Usage' : 'Edit Usage'}
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Row 1: PromoCode Name, Discount, Valid From, Valid To */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <select
                  value={formData.tenantID || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tenantID: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  disabled={roleName === 'TenantAdmin'}
                >
                  {/* Show 'Select Tenant' option only if not TenantAdmin */}
                  {roleName !== 'TenantAdmin' && (
                    <option value="" disabled>
                      Select Tenant
                    </option>
                  )}

                  {tenantOptions.map((tenant) => (
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
              </div>
              <div className="flex flex-col">
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.promoCodeID}
                  onChange={(e) =>
                    setFormData({ ...formData, promoCodeID: e.target.value })
                  }
                >
                  <option value="">Select Promo Name</option>
                  {promoCodeOptions.map((promo) => (
                    <option key={promo.promoCodeID} value={promo.promoCodeID}>
                      {promo.promoName}
                    </option>
                  ))}
                </select>
                {formErrors.promoCodeID && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.promoCodeID}
                  </p>
                )}
              </div>

              <div>
                <input
                  type={formData.usedOn ? 'date' : 'text'}
                  placeholder="Used On"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.usedOn || ''}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usedOn: e.target.value,
                    }))
                  }
                />
                {formErrors.usedOn && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.usedOn}
                  </p>
                )}
              </div>
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
            <div className="flex gap-4">
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
        <div
          className="ag-theme-alpine min-w-[600px] mt-6"
          style={{ height: 'auto' }}
        >
          <AgGridReact
            rowData={
              filteredTenantData.length > 0
                ? applyGlobalSearch(filteredTenantData)
                : []
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

export default TenantPromoUsage;
