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

const PromoCode: React.FC = () => {
  // Initialize rowData with useState
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [promoRowData, setPromoRowData] = useState<RowData[]>([]);
  const [filteredPromoData, setFilteredPromoData] = useState<RowData[]>([]);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [formMode, setFormMode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
const [errors, setErrors] = useState<Record<string, string>>({});

  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState<RowData>({
    code: '',
    description: '',
    discountValue: '',
    promoName: '',
    validFrom: '',
    validTo: '',
    isPercentage: false,
    appliesToPlans: true,
    appliesToAddOns: true,
    oneTimeUse: false,
  });

  // handle Add button click
  const handleAdd = () => {
    setFormData({
      promoCodeID: '',
      code: '',
      description: '',
      discountValue: '',
      validFrom: '',
      validTo: '',
      isPercentage: true,
      appliesToPlans: true,
      appliesToAddOns: true,
      oneTimeUse: true,
      isActive: true,
    });
    setFormMode('Add');
    setShowForm(true); // Show the form
  };

  // Reset form data when switching to "Add" mode
  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        promoCodeID: '',
        code: '',
        description: '',
        discountValue: '',
        validFrom: '',
        validTo: '',
        isPercentage: true,
        appliesToPlans: true,
        appliesToAddOns: true,
        oneTimeUse: true,
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
    code: '',
    description: '',
    discountValue: '',
    promoName: '',
    validFrom: '',
    validTo: '',
    isPercentage: false,
    appliesToPlans: true,
    appliesToAddOns: true,
    oneTimeUse: false,
  });

  setErrors({});      // ✅ clear generic errors if you have them
  setFormErrors({});  // ✅ clear the actual validation errors too
};


  const handleEditClick = (promoCode: RowData) => {
    setFormData({
      promoCodeID: promoCode.promoCodeID,
      promoName: promoCode.promoName, // <-- Add this line!
      code: promoCode.code,
      description: promoCode.description,
      discountValue: promoCode.discountValue,
      validFrom: promoCode.validFrom
        ? new Date(promoCode.validFrom).toISOString().split('T')[0]
        : '',
      validTo: promoCode.validTo
        ? new Date(promoCode.validTo).toISOString().split('T')[0]
        : '',
      isPercentage: promoCode.isPercentage,
      appliesToPlans: promoCode.appliesToPlans,
      appliesToAddOns: promoCode.appliesToAddOns,
      oneTimeUse: promoCode.oneTimeUse,
      isActive: promoCode.isActive,
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

  const validatePromoCodeForm = () => {
    let isValid = true;
    const errors: any = {};

    // PromoCode Name: required & only letters
    const promoName = formData.promoName?.toString().trim() || '';

    if (!promoName) {
      errors.promoName = 'PromoCode Name is required';
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(promoName)) {
      errors.promoName = 'PromoCode Name should contain only letters';
      isValid = false;
    }

    // Description: required & only letters
    if (!formData.description) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.description)) {
      errors.description = 'Description should contain only letters';
      isValid = false;
    }

    // Discount Value: required & only numbers
    if (!formData.discountValue) {
      errors.discountValue = 'Discount Value is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.discountValue)) {
      errors.discountValue = 'Discount Value should contain only numbers';
      isValid = false;
    } else if (formData.discountValue.length > 2) {
      errors.discountValue = 'Discount Value must be at most 2 digits';
      isValid = false;
    }

    // Valid From date: required
    if (!formData.validFrom) {
      errors.validFrom = 'Valid From date is required';
      isValid = false;
    }
    const code = formData.code?.toString().trim() || '';
    if (!code) {
      errors.code = 'Promo Code is required';
      isValid = false;
    } else if (!/^[A-Z0-9]+$/.test(code)) {
      errors.code =
        'Promo Code must contain only uppercase letters and numbers (e.g., PROMO100).';
      isValid = false;
    } else if (/^([A-Z0-9])\1{4,}$/.test(code)) {
      // ⬆️ Checks for same character repeated 5 or more times (adjust as needed)
      errors.code =
        'Promo Code should not have repeated characters like "AAAAAA" or "111111".';
      isValid = false;
    }

    // Valid To date: required and must be after Valid From
    if (!formData.validTo) {
      errors.validTo = 'Valid To date is required';
      isValid = false;
    } else if (
      formData.validFrom &&
      new Date(formData.validTo) <= new Date(formData.validFrom)
    ) {
      errors.validTo = 'Valid To must be after Valid From';
      isValid = false;
    }

    setFormErrors(errors); // ⬅️ formErrors state to hold all error messages
    return isValid;
  };

  // Add or update tenant

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePromoCodeForm()) {
      toast.error('Please correct the highlighted errors.');
      return;
    }

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found in session storage.');
      toast.error('User not logged in. Please log in again.');
      return;
    }

    try {
      const isActive = formData.isActive ?? true;
      const now = new Date().toISOString();

      const payload = {
        ...(formData.promoCodeID && {
          promoCodeID: formData.promoCodeID.trim(),
        }),
        code: formData.code.trim(),
        description: formData.description.trim(),
        promoName: formData.promoName.trim(),
        discountValue: Number(formData.discountValue),
        isPercentage: formData.isPercentage,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        appliesToPlans: formData.appliesToPlans,
        appliesToAddOns: formData.appliesToAddOns,
        oneTimeUsePerTenant: formData.oneTimeUse,
        isActive,
        createdBy: userID,
        updatedBy: userID,
      };

      let response;
      let toastMessage = '';

      if (!formData.promoCodeID) {
        response = await api.post('/PromoCode', payload);
        toastMessage = 'Promo code saved successfully!';
      } else {
        response = await api.put('/PromoCode', payload);
        toastMessage = 'Promo code updated successfully!';
      }

      toast.success(toastMessage);
      await refreshTableData();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error(
        'Error saving promo code:',
        error.response?.data || error.message,
      );
      toast.error('Failed to save/update promo code. Please try again.');
    }
  };

  const refreshTableData = async () => {
    try {
      const response = await api.get('/PromoCode'); // ✅ Corrected endpoint
      if (response.data && Array.isArray(response.data.data)) {
        setPromoRowData([...response.data.data]); // Update promo code table
        setFilteredPromoData([...response.data.data]); // For search/filter use
      } else {
        console.error(
          'Error: response.data.data is not an array',
          response.data,
        );
      }
    } catch (error: any) {
      console.error(
        'Error fetching promo codes:',
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      promoCodeID: '', // empty string for new promo code
      code: '',
      description: '',
      discountValue: '',
      validFrom: '',
      validTo: '',
      isPercentage: true, // default true as per your earlier
      appliesToPlans: true,
      appliesToAddOns: true,
      oneTimeUse: true,
      isActive: true, // boolean, not string
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
      headerName: 'Promo Name',
      field: 'promoName',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,

      width: 250,
    },
    {
      headerName: 'Code',
      field: 'code',
      sortable: true,
      headerClass: 'left-header',
      cellClass: 'text-left',
      filter: true,

      width: 150,
    },

    {
      headerName: 'Discount Value',
      field: 'discountValue',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Valid From',
      field: 'validFrom',
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
      headerName: 'Valid To',
      field: 'validTo',
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
      headerName: 'Description',
      headerClass: 'left-header',
      cellClass: 'left-center',
      field: 'description',
      sortable: true,
      filter: true,
      width: 380,
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
    console.log('Data passed to applyGlobalSearch:', data);
    if (!Array.isArray(data)) return [];

    const searchText = quickSearchText.toLowerCase();
    if (!searchText) return data;

    return data.filter((row) => {
      const discountString = row.discountValue?.toString().toLowerCase() || '';
      return (
        row.code?.toLowerCase().includes(searchText) ||
        row.description?.toLowerCase().includes(searchText) ||
        discountString.includes(searchText)
      );
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
    setFilteredPromoData(globallySearched);
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

    const promoCodeID = params.data.promoCodeID;
    const updatedStatus = !(params.data.isActive === true);

    try {
      await api.put('/PromoCode/UpdateStatus', {
        guidID: promoCodeID,
        updatedBy: userID,
        isActive: updatedStatus,
      });

      // ✅ Only update that particular record in filteredPromoData
      const updatedFiltered = filteredPromoData.map((item) =>
        item.promoCodeID === promoCodeID
          ? { ...item, isActive: updatedStatus }
          : item,
      );

      setFilteredPromoData(updatedFiltered);

      toast.success(
        `Promo code status updated to ${updatedStatus ? 'Active' : 'Inactive'}!`,
      );
    } catch (error) {
      console.error(
        'Error updating promo code status:',
        error.response?.data || error.message,
      );
      toast.error('Failed to update promo code status. Please try again.');
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
        PromoCode
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New PromoCode' : 'Edit PromoCode'}
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Row 1: PromoCode Name, Discount, Valid From, Valid To */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Promo Code Name */}
              <div>
                <input
                  type="text"
                  placeholder="Promo Name"
                  maxLength={20}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.promoName} // <== here
                  onChange={
                    (e) =>
                      setFormData({
                        ...formData,

                        promoName: e.target.value,
                      }) // <== here
                  }
                />

                {formErrors.promoName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.promoName}
                  </p>
                )}
              </div>

              {/* Discount Value */}
              <div>
                <input
                  type="text" // change to text to allow maxLength
                  placeholder="Discount Value"
                  maxLength={2}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.discountValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,2}$/.test(value)) {
                      setFormData({ ...formData, discountValue: value });
                    }
                  }}
                />

                {formErrors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.discountValue}
                  </p>
                )}
              </div>

              {/* Valid From */}
              <div>
                {/* Valid From Input */}
                <input
                  type={formData.validFrom ? 'date' : 'text'}
                  placeholder="Valid From"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.validFrom || ''}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validFrom: e.target.value,
                    }))
                  }
                />
                {formErrors.validFrom && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.validFrom}
                  </p>
                )}
              </div>

              {/* Valid To */}
              <div>
                <input
                  type={formData.validTo ? 'date' : 'text'}
                  placeholder="Valid To"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.validTo || ''}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validTo: e.target.value,
                    }))
                  }
                />
                {formErrors.validTo && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.validTo}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Description (full width) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              {/* Description - 3/4 width (3 columns) */}
              <div className="md:col-span-3">
                <input
                  type="text"
                  placeholder="Description"
                  maxLength={250}
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

              {/* Promo Code - 1/4 width (1 column) */}
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="Promo Code"
                  maxLength={10}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                  value={formData.code || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
                {formErrors.code && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>
                )}
              </div>
            </div>

            {/* Row 3: Checkboxes and status dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, isPercentage: e.target.checked })
                  }
                />{' '}
                Is Percentage
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.appliesToPlans}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appliesToPlans: e.target.checked,
                    })
                  }
                />{' '}
                Applies to Plans
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.appliesToAddOns}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appliesToAddOns: e.target.checked,
                    })
                  }
                />{' '}
                Applies to Add-Ons
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.oneTimeUse}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      oneTimeUse: e.target.checked,
                    })
                  }
                />{' '}
                One Time Use Per Tenant
              </label>

              {formMode === 'Edit' && (
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              )}
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
  onClick={() => {
    resetForm();
    setShowForm(false);
  }}
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
          className="ag-theme-alpine min-w-[600px]"
          style={{ height: 'auto' }}
        >
          <AgGridReact
            rowData={
              filteredPromoData.length > 0
                ? applyGlobalSearch(filteredPromoData)
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

export default PromoCode;
