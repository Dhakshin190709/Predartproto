import axios from 'axios'; // Ensure Axios is installed via npm or yarn
import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Edit } from 'lucide-react';
import { toast } from 'react-toastify'; // Import toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import type { AgGridReact as AgGridReactType } from 'ag-grid-react';
import api from '../../api/request';
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
  const gridRef = useRef<AgGridReactType>(null);
  const [formMode, setFormMode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const userID = sessionStorage.getItem('userID');

  const [formData, setFormData] = useState({
    medicineID: '', // Required for PUT request
    medicineName: '',
    medicineCode: '',
    brand: '',
    unit: 0,
    manufacturerName: '',
    manufacturerCode: '',
    isActive: '',
    medicineType: '',
    description: '',
    dosage: '',
  });

  const refreshTableData = async () => {
    try {
      const response = await api.get('/MedicineMaster'); // Using the axios instance (api)

      const filteredData = response.data.filter((item: any) => {
        return (
          item.isActive === false || // Keep inactive rows too
          item.medicineName?.trim() ||
          item.medicineCode?.trim() ||
          item.brand?.trim() ||
          item.unit?.trim() ||
          item.manufacturerName?.trim() ||
          item.manufacturerCode?.trim()
        );
      });

      setRowData(filteredData); // Assuming this updates your table's state
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  // handle Add button click
  const handleAdd = () => {
    setFormData({
      medicineName: '',
      medicineCode: '',
      brand: '',
      unit: 0,
      manufacturerName: '',
      manufacturerCode: '',
      isActive: true,
    });
    setFormMode('Add');
    setShowForm(true);
  };

  // Reset form data when switching to "Add" mode
  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        medicineName: '',
        medicineCode: '',
        brand: '',
        unit: 0,
        manufacturerName: '',
        manufacturerCode: '',
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

 const handleEditClick = (medicine: RowData) => {
  setFormData({
    medicineID: medicine.medicineID || '',
    medicineName: medicine.medicineName || '',
    medicineCode: medicine.medicineCode || '',
    brand: medicine.brand || '',
    unit: medicine.unit || 0,
    manufacturerName: medicine.manufacturerName || '',
    manufacturerCode: medicine.manufacturerCode || '',
    isActive: medicine.isActive ?? '',
    
    // ✅ Newly added fields
    dosage: medicine.dosage || '',
    description: medicine.description || '',
    medicineType: medicine.medicineType || '',
  });

  setShowForm(true);
  setFormMode('Edit');

  // Optional: Scroll to form
  setTimeout(() => {
    editFormRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 100);
};

  const resetFormData = () => {
    setFormData({
      medicineID: '',
      medicineName: '',
      medicineCode: '',
      brand: '',
      unit: 0,
      manufacturerName: '',
      manufacturerCode: '',
      isActive: true, // default active on reset
    });
  };

  // Delete tenant
  const confirmDelete = async () => {
    try {
      if (deleteRowId !== null) {
        await axios.delete(`${apiBaseUrl}/${deleteRowId}`);
        const updatedData = rowData.filter(
          (item) => item.tenantID !== deleteRowId,
        ); // Use tenantID instead of Id
        setRowData(updatedData);
        setFilteredData(updatedData);
      }
      setShowConfirmation(false);
      setDeleteRowId(null);
    } catch (error) {
      console.error('Error deleting tenant:', error);
    }
  };

  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'Medicine ID',
      field: 'medicineID',
      sortable: true,
      filter: true,
      hide: true,
      width: 150,
    },
    {
      headerName: 'S.No',
      headerClass: 'center-header',
      cellClass: 'text-center',
      valueGetter: 'node.rowIndex + 1',
      filter: false,
      sortable: false,
      width: 80,
    },
    {
      headerName: 'Medicine Name',
      field: 'medicineName',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: 'Medicine Code',
      field: 'medicineCode',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Brand',
      field: 'brand',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Unit',
      field: 'unit',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      headerName: 'Manufacturer Name',
      field: 'manufacturerName',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: 'Manufacturer Code',
      field: 'manufacturerCode',
      hide:true,
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Medicine Type',
      field: 'medicineType',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 180,
    },
    {
      headerName: 'Description',
      field: 'description',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 250,
    },
    {
      headerName: 'Dosage',
      field: 'dosage',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },

    {
      headerName: 'Status',
      field: 'isActive',
      headerClass: 'center-header',
      cellStyle: { textAlign: 'center' },
      width: 120,
      cellRenderer: (params: any) => {
        const value = params.value;
        const isActive = value === true || value === 'Active';
        const isInactive = value === false || value === 'Inactive';

        return (
          <span
            onClick={() => toggleStatus(params)}
            className={`cursor-pointer font-bold ${
              isActive ? 'text-green-500' : isInactive ? 'text-red-400' : ''
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
      headerClass: 'center-header',
      hide:true,
      cellClass: 'text-center',
      width: 80,
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.medicineID)}
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

    // Extract searchable field names from columnDefs
    const searchableFields = columnDefs
      .filter((col) => col.field && col.filter) // only fields that are searchable
      .map((col) => col.field as keyof RowData);

    return data.filter((row) => {
      return searchableFields.some((field) => {
        const value = row[field];
        return value?.toString().toLowerCase().includes(searchText);
      });
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
    const currentStatus = params.data.isActive;
    const updatedStatus = !currentStatus;
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const payload = {
      guidID: params.data.medicineID,
      updatedBy: userID,
      isActive: updatedStatus,
    };

    try {
      const response = await api.patch('/MedicineMaster', payload);

      // ✅ Update the cell visually without gridRef
      params.node.setDataValue('isActive', updatedStatus);

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const handleDelete = (Id: number) => {
    setDeleteRowId(Id);
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeleteRowId(null);
  };

  const alphabetRegex = /^[A-Za-z\s]+$/;
  const alphanumericRegex = /^[A-Za-z0-9]+$/;

  const digitsOnlyRegex = /^\d+$/;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // medicineName: required, alphabets only
    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'Medicine Name is required';
    } else if (!alphabetRegex.test(formData.medicineName.trim())) {
      newErrors.medicineName = 'Medicine Name must contain alphabets only';
    }

    // medicineCode: required, alphanumeric, max length 5
    // if (!formData.medicineCode.trim()) {
    //   newErrors.medicineCode = 'Medicine Code is required';
    // } else if (!alphanumericRegex.test(formData.medicineCode.trim())) {
    //   newErrors.medicineCode = 'Medicine Code must be alphanumeric';
    // } else if (formData.medicineCode.trim().length > 5) {
    //   newErrors.medicineCode = 'Medicine Code must be max 5 characters';
    // }

    // brand: required, alphabets only
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    } else if (!alphabetRegex.test(formData.brand.trim())) {
      newErrors.brand = 'Brand must contain alphabets only';
    }

    // unit: required, digits only
    if (formData.unit === null || formData.unit === undefined) {
      newErrors.unit = 'Unit is required';
    } else if (!Number.isInteger(formData.unit)) {
      newErrors.unit = 'Unit must be an integer';
    } else if (formData.unit <= 0) {
      newErrors.unit = 'Unit must be greater than zero';
    }

    // manufacturerName: required, alphabets only
    if (!formData.manufacturerName.trim()) {
      newErrors.manufacturerName = 'Manufacturer Name is required';
    } else if (!alphabetRegex.test(formData.manufacturerName.trim())) {
      newErrors.manufacturerName =
        'Manufacturer Name must contain alphabets only';
    }

    // manufacturerCode: required, alphanumeric, max length 5
    // if (!formData.manufacturerCode.trim()) {
    //   newErrors.manufacturerCode = 'Manufacturer Code is required';
    // } else if (!alphanumericRegex.test(formData.manufacturerCode.trim())) {
    //   newErrors.manufacturerCode = 'Manufacturer Code must be alphanumeric';
    // } else if (formData.manufacturerCode.trim().length > 5) {
    //   newErrors.manufacturerCode = 'Manufacturer Code must be max 5 characters';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Validation failed, so do not submit
      return;
    }

    const payload = {
      ...formData,

      unit: Number(formData.unit), // ✅ Ensure 'unit' is a number
      isActive: formData.isActive === 'Active' || formData.isActive === true,
      createdBy: sessionStorage.getItem('userID'),
    };

    try {
      const apiUrl = '/MedicineMaster'; // Use relative URL, since it's set in the axios instance

      const response =
        formMode === 'Add'
          ? await api.post(apiUrl, payload)
          : await api.put(apiUrl, payload);

      if (response.status !== 200) {
        throw new Error('API error');
      }

      await refreshTableData();

      toast.success(
        `Medicine ${formMode === 'Add' ? 'created' : 'updated'} successfully!`,
      );

      setFormData({
        medicineName: '',
        medicineCode: '',
        brand: '',
        unit: 0,
        manufacturerName: '',
        manufacturerCode: '',
        isActive: '',
          dosage: '',
      description: '',
      medicineType: '',
      });

      setShowForm(false);
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' })); // clear error on change
  };

  useEffect(() => {
    if (quickSearchText.trim() === '') {
      setFilteredData(rowData);
    } else {
      setFilteredData(applyGlobalSearch(rowData));
    }
  }, [quickSearchText, rowData]);

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Medicine Master
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New Medicine' : 'Edit Medicine'}
          </h3>
          <form onSubmit={handleFormSubmit} className="mb-6">
            <div className="grid grid-cols-4 gap-6">
              {/* Medicine Name */}
              <div className="flex flex-col">
                <input
                  type="text"
                  maxLength={30}
                  value={formData.medicineName}
                  onChange={(e) => handleChange('medicineName', e.target.value)}
                  placeholder="Medicine Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.medicineName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.medicineName}
                  </p>
                )}
              </div>

              {/* Medicine Code (hidden) */}
              {formMode === 'Add' && (
                <input
                  type="hidden"
                  value={formData.medicineCode}
                  maxLength={5}
                  onChange={(e) => handleChange('medicineCode', e.target.value)}
                />
              )}

              {/* Brand */}
              <div className="flex flex-col">
                <input
                  type="text"
                  value={formData.brand}
                  maxLength={30}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="Brand"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.brand && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                )}
              </div>

              {/* Unit */}
              <div className="flex flex-col">
                <input
                  type="text"
                  value={formData.unit}
                  maxLength={2}
                  onChange={(e) => handleChange('unit', Number(e.target.value))}
                  placeholder="Unit"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.unit && (
                  <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
                )}
              </div>

              {/* Manufacturer Name */}
              <div className="flex flex-col">
                <input
                  type="text"
                  value={formData.manufacturerName}
                  maxLength={30}
                  onChange={(e) =>
                    handleChange('manufacturerName', e.target.value)
                  }
                  placeholder="Manufacturer Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.manufacturerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.manufacturerName}
                  </p>
                )}
              </div>

              {/* Manufacturer Code (hidden) */}
              {formMode === 'Add' && (
                <input
                  type="hidden"
                  value={formData.manufacturerCode}
                  onChange={(e) =>
                    handleChange('manufacturerCode', e.target.value)
                  }
                  maxLength={5}
                />
              )}

              {/* Medicine Type */}
              <div className="flex flex-col">
                <input
                  type="text"
                  id="medicineType"
                  value={formData.medicineType}
                  onChange={(e) =>
                    setFormData({ ...formData, medicineType: e.target.value })
                  }
                  maxLength={25}
                  placeholder="Medicine Type"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Dosage */}
              <div className="flex flex-col">
                <input
                  type="text"
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                  maxLength={15}
                  placeholder="Dosage"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {formMode === 'Add' && <div></div>}
              {/* Status (only in Edit mode) */}
              {formMode === 'Edit' && (
                <div className="flex flex-col">
                  <select
                    value={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.isActive && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.isActive}
                    </p>
                  )}
                </div>
              )}
              {/* Description (textarea, span 2 columns) */}
              <div className="flex flex-col col-span-2">
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description"
                  maxLength={160}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-4">
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

      <ToastContainer position="top-right" autoClose={3000} />
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
          rowData={filteredData} // ✅ Use filteredData instead of original rowData
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          domLayout="autoHeight"
          headerHeight={40}
          ref={gridRef}
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
