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

const TenantSubscription: React.FC = () => {
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
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [pricePlans, setPricePlans] = useState<
    { pricePlanID: string; planName: string }[]
  >([]);
  const [tenantOptions, setTenantOptions] = useState<
    { tenantID: string; tenantName: string }[]
  >([]);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState<RowData>({
    tenantID: '',
    pricePlanID: '',
    subscribedOn: '',
    expiresOn: '',
    paymentStatus: true,
    isEnabled: true,
    isActive: true,
  });

  // handle Add button click
  const handleAdd = () => {
    setFormData({
      tenantSubscriptionID: '',
      tenantID: '',
      pricePlanID: '',
      subscribedOn: '',
      expiresOn: '',
      paymentStatus: true,
      isEnabled: true,
      isActive: true,
    });
    setFormMode('Add');
    setShowForm(true); // Show the form
  };

  // Reset form data when switching to "Add" mode
  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        tenantSubscriptionID: '',
        tenantID: '',
        pricePlanID: '',
        subscribedOn: '',
        expiresOn: '',
        paymentStatus: true,
        isEnabled: true,
        isActive: true,
      });
    }
  }, [formMode]);

  // useEffect(() => {
  //   const fetchTenants = async () => {
  //     try {
  //       const response = await api.get('/Tenant');
  //       if (response.data.success) {
  //         const activeTenants = response.data.data.filter(
  //           (tenant: any) => tenant.isActive,
  //         );
  //         setTenantOptions(
  //           activeTenants.map((tenant: any) => ({
  //             tenantID: tenant.tenantID,
  //             tenantName: tenant.tenantName,
  //           })),
  //         );
  //       } else {
  //         console.error('API returned success: false');
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch tenants:', error);
  //     }
  //   };

  //   fetchTenants();
  // }, []);

  // useEffect(() => {
  //   const fetchPricePlans = async () => {
  //     try {
  //       const response = await api.get('/PricePlan');
  //       if (response.data.success) {
  //         const activePlans = response.data.data.filter(
  //           (plan: any) => plan.isActive,
  //         );
  //         setPricePlans(
  //           activePlans.map((plan: any) => ({
  //             pricePlanID: plan.pricePlanID,
  //             planName: plan.planName,
  //           })),
  //         );
  //       } else {
  //         console.error('API returned success: false');
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch price plans:', error);
  //     }
  //   };

  //   fetchPricePlans();
  // }, []);

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
    const roleName = sessionStorage.getItem('roleName');
    const tenantID = sessionStorage.getItem('tenantID');
    const createdBy = sessionStorage.getItem('userID');

    setFormData({
      tenantID: roleName === 'TenantAdmin' ? tenantID || '' : '',
      pricePlanID: '',
      subscribedOn: '',
      expiresOn: '',
      isActive: true,
      isEnabled: false,
      paymentStatus: false,
      createdBy: createdBy || '',
    });

    setFormMode('');
    setName('');
    setIsActive(false);
    setShowForm(true); // <-- Move this AFTER setting formData
  };

  const handleEditClick = (tenant: RowData) => {
    setFormData({
      tenantSubscriptionID: tenant.tenantSubscriptionID || '',
      tenantID: tenant.tenantID || '',
      pricePlanID: tenant.pricePlanID || '',
      subscribedOn: tenant.subscribedOn
        ? new Date(tenant.subscribedOn).toISOString().split('T')[0]
        : '',
      expiresOn: tenant.expiresOn
        ? new Date(tenant.expiresOn).toISOString().split('T')[0]
        : '',
      paymentStatus: tenant.paymentStatus ?? true,
      isEnabled: tenant.isEnabled ?? true,
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
      pricePlanID: '',
      subscribedOn: '',
      expiresOn: '',
    };

    let isValid = true;

    if (!formData.tenantID) {
      errors.tenantID = 'Tenant is required';
      isValid = false;
    }

    if (!formData.pricePlanID) {
      errors.pricePlanID = 'Price Plan is required';
      isValid = false;
    }

    if (!formData.subscribedOn) {
      errors.subscribedOn = 'Subscribed date is required';
      isValid = false;
    }

    if (!formData.expiresOn) {
      errors.expiresOn = 'Expire date is required';
      isValid = false;
    }

    if (formData.subscribedOn && formData.expiresOn) {
      const start = new Date(formData.subscribedOn);
      const end = new Date(formData.expiresOn);
      if (end <= start) {
        errors.expiresOn = 'Expire date must be after subscribed date';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop if invalid
    }

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found in session storage.');
      toast.error('User not logged in. Please log in again.');
      return;
    }

    try {
      const now = new Date().toISOString();

      const payload = {
        createdBy: userID,
        updatedBy: userID,
        isActive: formData.isActive ?? true,
        isEnabled: formData.isEnabled ?? true,
        paymentStatus: formData.paymentStatus ?? true,
        tenantID: formData.tenantID?.trim() || '',
        pricePlanID: formData.pricePlanID?.trim() || '',
        subscribedOn: formData.subscribedOn || now,
        expiresOn: formData.expiresOn || now,
      };

      const response = await api.post('/TenantSubscription', payload);
      toast.success('Tenant subscription saved successfully!');
      await fetchTenantSubscriptions(tenantMap, pricePlanMap);
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error(
        'Error saving tenant subscription:',
        error.response?.data || error.message,
      );
      toast.error('Failed to save tenant subscription. Please try again.');
    }
  };

  const [tenantList, setTenantList] = useState<any[]>([]); // store full tenant list
  const [tenantMap, setTenantMap] = useState<Record<string, string>>({});
  const [pricePlanMap, setPricePlanMap] = useState<Record<string, string>>({});

  const fetchTenantSubscriptions = async (
    tenantMap: Record<string, string>,
    pricePlanMap: Record<string, string>,
  ) => {
    try {
      const roleName = sessionStorage.getItem('roleName');
      const tenantID = sessionStorage.getItem('tenantID');

      let url = '/TenantSubscription';

      if (roleName === 'TenantAdmin' && tenantID) {
        url = `/TenantSubscription?TenantID=${tenantID}`;
      }

      const res = await api.get(url);

      if (Array.isArray(res.data.data)) {
        const enriched = res.data.data.map((item: any) => ({
          ...item,
          tenantName: tenantMap[item.tenantID] || item.tenantID,
          planName: pricePlanMap[item.pricePlanID] || item.pricePlanID,
        }));

        setTenantRowData(enriched);
        setFilteredTenantData(enriched);
      }
    } catch (error) {
      console.error('Failed to fetch tenant subscriptions:', error);
    }
  };

  const fetchData = async () => {
  try {
    const roleName = sessionStorage.getItem('roleName');
    const tenantID = sessionStorage.getItem('tenantID');

    let tenantMapLocal: Record<string, string> = {};
    let tenantOptionsLocal: any[] = [];

    if (roleName === 'TenantAdmin' && tenantID) {
      const tenantRes = await api.get(`/Tenant/${tenantID}`);
      if (tenantRes.data.success && tenantRes.data.data) {
        const tenant = tenantRes.data.data;

        tenantMapLocal[tenant.tenantID] = tenant.tenantName;
        tenantOptionsLocal = [
          {
            tenantID: tenant.tenantID,
            tenantName: tenant.tenantName,
          },
        ];

        // ✅ Prefill tenantID in formData
        setFormData((prev) => ({
          ...prev,
          tenantID: tenant.tenantID,
        }));
      }
    } else {
      // ✅ Use the correct endpoint
      const tenantRes = await api.get('/Tenant/TenantList');
      if (tenantRes.data.success) {
        const tenants = tenantRes.data.data;

        tenantMapLocal = tenants.reduce(
          (map, t) => {
            map[t.tenantID] = t.tenantName;
            return map;
          },
          {} as Record<string, string>
        );

        tenantOptionsLocal = tenants.map((t: any) => ({
          tenantID: t.tenantID,
          tenantName: t.tenantName,
        }));
      }
    }

    setTenantMap(tenantMapLocal);
    setTenantOptions(tenantOptionsLocal);

    // ✅ Price Plans logic unchanged — assuming PricePlan still uses isActive
    const planRes = await api.get('/PricePlan');
    let pricePlanMapLocal: Record<string, string> = {};
    let pricePlansLocal: any[] = [];

    if (planRes.data.success) {
      const plans = planRes.data.data;

      pricePlanMapLocal = plans.reduce(
        (map, p) => {
          map[p.pricePlanID] = p.planName;
          return map;
        },
        {} as Record<string, string>
      );

      pricePlansLocal = plans
        .filter((p: any) => p.isActive)
        .map((p: any) => ({
          pricePlanID: p.pricePlanID,
          planName: p.planName,
        }));

      setPricePlanMap(pricePlanMapLocal);
      setPricePlans(pricePlansLocal);
    }

    await fetchTenantSubscriptions(tenantMapLocal, pricePlanMapLocal);
  } catch (error) {
    console.error('❌ Failed to fetch data:', error);
  }
};



  useEffect(() => {
    console.log('📌 tenantID set in formData:', formData.tenantID);
  }, [formData.tenantID]);

  useEffect(() => {
    const roleName = sessionStorage.getItem('roleName');
    const tenantID = sessionStorage.getItem('tenantID');

    if (
      showForm &&
      formMode === 'Add' &&
      roleName === 'TenantAdmin' &&
      tenantID
    ) {
      setFormData((prev) => ({
        ...prev,
        tenantID,
      }));
    }
  }, [showForm, formMode]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(tenantMap).length && Object.keys(pricePlanMap).length) {
      fetchTenantSubscriptions(tenantMap, pricePlanMap);
    }
  }, [tenantMap, pricePlanMap]);

  const resetFormData = () => {
    setFormData({
      tenantSubscriptionID: '',
      tenantID: '',
      pricePlanID: '',
      subscribedOn: '',
      expiresOn: '',
      paymentStatus: true,
      isEnabled: true,
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
      field: 'tenantName', // <-- use tenantName here
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 400,
    },

    {
      headerName: 'Price Plan',
      field: 'planName', // ✅ Use the enriched field
      sortable: true,
      headerClass: 'left-header',
      cellClass: 'text-left',
      filter: true,
      width: 250,
    },
    {
      headerName: 'Subscribed On',
      field: 'subscribedOn',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params: any) => {
        const date = new Date(params.value);
        return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
      },
    },
    {
      headerName: 'Expires On',
      field: 'expiresOn',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params: any) => {
        const date = new Date(params.value);
        return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
      },
    },
    {
      headerName: 'Status',
      field: 'isActive',
      width: 150,
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
      width: 150,
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
    if (!Array.isArray(data)) return [];

    const searchText = quickSearchText.toLowerCase();
    if (!searchText) return data;

    return data.filter((row) => {
      const discountString = row.discountValue?.toString().toLowerCase() || '';
      return (
        row.tenantName?.toLowerCase().includes(searchText) || // ✅ correct field name
        row.planName?.toLowerCase().includes(searchText) || // ✅ correct field name
        row.subscribedOn?.toLowerCase().includes(searchText) ||
        row.expiresOn?.toLowerCase().includes(searchText)
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

    const tenantSubscriptionID = params.data.tenantSubscriptionID;
    const updatedStatus = !(params.data.isActive === true);
    const updatedOn = new Date().toISOString();

    try {
      await api.put('/TenantSubscription/UpdateStatus', {
        guidID: tenantSubscriptionID,
        id: 0,
        updatedBy: userID,
        updatedOn,
        isActive: updatedStatus,
      });
      await fetchTenantSubscriptions();
      // ✅ Update only that record in filtered data
      const updatedFiltered = filteredTenantData.map((item) =>
        item.tenantSubscriptionID === tenantSubscriptionID
          ? { ...item, isActive: updatedStatus }
          : item,
      );

      setFilteredTenantData(updatedFiltered); // ✅ update filteredTenantData
      setTenantRowData(updatedFiltered); // ✅ optional: update original data too

      toast.success(
        `Tenant subscription status updated to ${updatedStatus ? 'Active' : 'Inactive'}!`,
      );
    } catch (error: any) {
      console.error(
        'Error updating tenant subscription status:',
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
        Tenant Subscription
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add'
              ? 'Add New Tenant Subscription'
              : 'Edit Tenant Subscription'}
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Row 1: PromoCode Name, Discount, Valid From, Valid To */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.tenantID || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantID: e.target.value })
                  }
                  disabled={
                    sessionStorage.getItem('roleName') === 'TenantAdmin'
                  }
                >
                  <option value="">Select Tenant</option>
                  {tenantOptions.map((tenant) => (
                    <option key={tenant.tenantID} value={tenant.tenantID}>
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
                  value={formData.pricePlanID}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePlanID: e.target.value })
                  }
                >
                  <option value="">Select Price Plan</option>
                  {pricePlans.map((plan) => (
                    <option key={plan.pricePlanID} value={plan.pricePlanID}>
                      {plan.planName}
                    </option>
                  ))}
                </select>
                {formErrors.pricePlanID && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.pricePlanID}
                  </p>
                )}
              </div>

              <div>
                <input
                  type={formData.subscribedOn ? 'date' : 'text'}
                  placeholder="Subscribed On"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.subscribedOn || ''}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subscribedOn: e.target.value,
                    }))
                  }
                />
                {formErrors.subscribedOn && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.subscribedOn}
                  </p>
                )}
              </div>

              <div>
                <input
                  type={formData.expiresOn ? 'date' : 'text'}
                  placeholder="Expires On"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.expiresOn || ''}
                  min={formData.subscribedOn || ''} // 👈 restrict past dates
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiresOn: e.target.value,
                    }))
                  }
                />

                {formErrors.expiresOn && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.expiresOn}
                  </p>
                )}
              </div>
            </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">

              {/* Column 1: Is Active */}
              <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentStatus: e.target.checked,
                    })
                  }
                />
                <label>Payment Status</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isEnabled: e.target.checked,
                    })
                  }
                />
                <label>Is Enabled</label>
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
          className="ag-theme-alpine min-w-[700px] mt-6"
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

export default TenantSubscription;
