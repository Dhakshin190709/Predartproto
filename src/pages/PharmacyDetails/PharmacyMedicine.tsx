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

type FormErrors = {
  pharmacyID?: string;
  medicineID?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity?: string;
  pricePerUnit?: string;
  gst?: string;
  isActive?: string;
};

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
  const [pharmacies, setPharmacies] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [medicines, setMedicines] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    pharmacyMedicineID: '',
    pharmacyID: '',
    medicineID: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
    pricePerUnit: '',
    gst: '',
    isActive: true,
    purchaseCost: '',
    minOrderQty: '',
    quantityReceived: '',
    quantityInStock: '',
    quantitySold: '',
  });

  const getPharmacyNameById = (id: string) => {
    const pharmacy = pharmacies.find((p) => p.id === id);
    return pharmacy ? pharmacy.name : id;
  };

  const getMedicineNameById = (id: string) => {
    const medicine = medicines.find((m) => m.id === id);
    return medicine ? medicine.name : id;
  };

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await api.get('/Pharmacy'); // Use axios instance for API call
        const formatted = response.data.map((item: any) => ({
          id: item.p.pharmacyID, // Accessing the pharmacyID from the 'p' property
          name: item.p.pharmacyName, // Accessing the pharmacyName from the 'p' property
        }));
        setPharmacies(formatted); // Update the state with the formatted data
      } catch (error: any) {
        console.error('Failed to fetch pharmacies:', error);
        toast.error('Failed to load pharmacies'); // Show a user-friendly error message
      }
    };

    fetchPharmacies();
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/MedicineMaster'); // Use the axios instance
        const formatted = response.data.map((item: any) => ({
          id: item.medicineID,
          name: item.medicineName,
        }));
        setMedicines(formatted);
      } catch (error: any) {
        console.error('Failed to fetch medicines:', error);
        toast.error('Failed to load medicines');
      }
    };

    fetchMedicines();
  }, []);

  const refreshTableData = async () => {
    try {
      const response = await api.get('/PharmacyMedicine'); // Use relative path here

      const filteredData = response.data.filter((item: any) => {
        return (
          item.pharmacyID?.trim() ||
          item.medicineID?.trim() ||
          item.batchNumber?.trim() ||
          item.expiryDate ||
          item.quantity != null || // Check for null or undefined explicitly
          item.pricePerUnit != null || // Same here for pricePerUnit
          item.gst != null // Same for gst
        );
      });

      setRowData(filteredData); // This updates your table/grid
    } catch (error: any) {
      console.error('Error fetching PharmacyMedicine data:', error);
      // Optionally, you can show a toast notification for error handling
      toast.error('Failed to load pharmacy data');
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

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
        pharmacyMedicineID: '',
        pharmacyID: '',
        medicineID: '',
        batchNumber: '',
        expiryDate: '',
        quantity: '',
        pricePerUnit: '',
        gst: '',
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

  // const resetForm = () => {
  //   setShowForm(false); // Show the fields again
  //   setFormMode('');
  //   setName(''); // Reset input fields if necessary
  //   setIsActive(false);
  // };

 const handleEditClick = (medicine) => {
  setFormData({
    pharmacyMedicineID: medicine.pharmacyMedicineID || '',
    pharmacyID: medicine.pharmacyID || '',
    medicineID: medicine.medicineID || '',
    batchNumber: medicine.batchNumber || '',
    expiryDate: medicine.expiryDate ? medicine.expiryDate.slice(0, 10) : '', // format YYYY-MM-DD for date input
    quantity: medicine.quantity ?? 0,
    pricePerUnit: medicine.pricePerUnit ?? 0,
    gst: medicine.gst ?? 0,
    purchaseCost: medicine.purchaseCost ?? 0,
    minOrderQty: medicine.minOrderQty ?? 0,
    quantityReceived: medicine.quantityReceived ?? 0,
    quantityInStock: medicine.quantityInStock ?? 0,
    quantitySold: medicine.quantitySold ?? 0,
    isActive: medicine.isActive ?? true,
  });

  setShowForm(true);
  setFormMode('Edit');

  // Scroll smoothly to form if needed
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

  const columnDefs: ColDef<any, any>[] = [
    {
      headerName: 'Pharmacy Medicine ID',
      field: 'pharmacyMedicineID',
      hide: true,
      sortable: true,
      filter: true,
      width: 180,
    },
    {
      headerName: 'S.No',
      headerClass: 'center-header',
      cellClass: 'text-center',
      valueGetter: (params) => params.node?.rowIndex + 1,
      sortable: false,
      filter: false,
      width: 80,
    },
    {
      headerName: 'Pharmacy Name',
      field: 'pharmacyID',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 250,
      valueGetter: (params) => getPharmacyNameById(params.data.pharmacyID),
    },

    {
      headerName: 'Medicine Name',
      field: 'medicineID',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 250,
      valueGetter: (params) => getMedicineNameById(params.data.medicineID),
    },

    {
      headerName: 'Batch Number',
      field: 'batchNumber',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Expiry Date',
      field: 'expiryDate',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    {
      headerName: 'Quantity',
      field: 'quantity',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      headerName: 'Price Per Unit',
      field: 'pricePerUnit',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) =>
        params.value != null ? `₹ ${parseFloat(params.value).toFixed(2)}` : '',
    },
    {
      headerName: 'GST (%)',
      field: 'gst',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: 'Purchase Cost',
      field: 'purchaseCost',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) =>
        params.value != null ? `₹ ${parseFloat(params.value).toFixed(2)}` : '',
    },
    {
      headerName: 'Min Order Qty',
      field: 'minOrderQty',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      filter: true,
      width: 130,
    },
    {
      headerName: 'Quantity Received',
      field: 'quantityReceived',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Quantity In Stock',
      field: 'quantityInStock',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: 'Quantity Sold',
      field: 'quantitySold',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      filter: true,
      width: 130,
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
          onClick={() => handleDelete(params.data.pharmacyMedicineID)}
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
      return columnDefs.some((col) => {
        // Skip non-filterable columns
        if (!col.filter) return false;

        let cellValue: string | number | undefined = '';

        // Handle custom valueGetters
        if (col.valueGetter && typeof col.valueGetter === 'function') {
          // Simulate valueGetter execution like AG Grid does
          cellValue = col.valueGetter({ data: row });
        } else if (col.field) {
          // Normal direct field value
          cellValue = row[col.field as keyof RowData];
        }

        return cellValue?.toString().toLowerCase().includes(searchText);
      });
    });
  };
  useEffect(() => {
    const result = applyGlobalSearch(rowData);
    setFilteredData(result);
  }, [quickSearchText, rowData]);

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
      guidID: params.data.pharmacyMedicineID,
      updatedBy: userID,
      isActive: updatedStatus,
    };

    try {
      const response = await api.patch('/PharmacyMedicine', payload); // Use axios PATCH request

      if (response.status === 200) {
        // ✅ Visually update the grid row status
        params.node.setDataValue('isActive', updatedStatus);

        toast.success(response.data.message || 'Status updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Error updating status');
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear the error as user corrects the input
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      // Basic clearing logic per field
      if (field === 'batchNumber' && /^\d+$/.test(value)) {
        delete newErrors.batchNumber; // Remove error if the value is a valid number
      } else if (field === 'batchNumber' && value.trim() === '') {
        // Handle the case where the field is left empty
        newErrors.batchNumber = 'Batch number is required';
      }

      if (field === 'quantity' && Number(value) > 0) {
        delete newErrors.quantity;
      }
      if (field === 'pricePerUnit' && Number(value) > 0) {
        delete newErrors.pricePerUnit;
      }
      if (field === 'gst') {
        const gstValue = Number(value);
        if (!isNaN(gstValue) && gstValue >= 0 && gstValue <= 100) {
          delete newErrors.gst;
        }
      }
      if (field === 'expiryDate' && new Date(value) > new Date()) {
        delete newErrors.expiryDate;
      }

      return newErrors;
    });
  };

  useEffect(() => {
    if (quickSearchText.trim() === '') {
      setFilteredData(rowData);
    } else {
      setFilteredData(applyGlobalSearch(rowData));
    }
  }, [quickSearchText, rowData]);

 const validateForm = (touchedFields = {}) => {
  const errors = {};

  // Debug: Log filled or empty status of each field
  console.log("=== Validation Debug: Field Status ===");
  Object.entries(formData).forEach(([key, value]) => {
    const isEmpty = value === '' || value === null || value === undefined;
    console.log(`${key}:`, isEmpty ? '❌ Empty' : `✅ Filled -> ${value}`);
  });

  // Required fields (Add mode)
  if (formMode === 'Add') {
    if (!formData.pharmacyID) errors.pharmacyID = 'Pharmacy is required';
    if (!formData.medicineID) errors.medicineID = 'Medicine is required';
  }

  // Batch number
  if (!formData.batchNumber.trim()) {
    errors.batchNumber = 'Batch number is required';
  } else if (!/^\d+$/.test(formData.batchNumber.trim())) {
    errors.batchNumber = 'Batch number must contain only digits';
  }

  // Expiry date
  if (!formData.expiryDate) {
    errors.expiryDate = 'Expiry date is required';
  } else if (new Date(formData.expiryDate) <= new Date()) {
    errors.expiryDate = 'Expiry date must be in the future';
  }

  // Quantity
  if (!formData.quantity && !touchedFields.quantity) {
    errors.quantity = 'Quantity is required';
  } else if (formData.quantity && Number(formData.quantity) <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }

  // Price per unit
  if (!formData.pricePerUnit && !touchedFields.pricePerUnit) {
    errors.pricePerUnit = 'Price is required';
  } else if (formData.pricePerUnit && Number(formData.pricePerUnit) <= 0) {
    errors.pricePerUnit = 'Price must be greater than 0';
  }

  // GST
  if ((formData.gst === '' || formData.gst === null) && !touchedFields.gst) {
    errors.gst = 'GST is required';
  } else if (
    formData.gst !== '' &&
    (isNaN(formData.gst) || Number(formData.gst) < 0 || Number(formData.gst) > 100)
  ) {
    errors.gst = 'GST must be between 0 and 100';
  }

  // Purchase Cost
  if (!formData.purchaseCost && !touchedFields.purchaseCost) {
    errors.purchaseCost = 'Purchase cost is required';
  } else if (formData.purchaseCost && Number(formData.purchaseCost) <= 0) {
    errors.purchaseCost = 'Purchase cost must be greater than 0';
  }

  // Minimum Order
  if (!formData.minOrderQty && !touchedFields.minOrderQty) {
    errors.minOrderQty = 'Minimum order is required';
  } else if (formData.minOrderQty && Number(formData.minOrderQty) <= 0) {
    errors.minOrderQty = 'Minimum order must be greater than 0';
  }

  // Quantity Received
  if (!formData.quantityReceived && !touchedFields.quantityReceived) {
    errors.quantityReceived = 'Quantity received is required';
  } else if (formData.quantityReceived && Number(formData.quantityReceived) <= 0) {
    errors.quantityReceived = 'Quantity received must be greater than 0';
  }

  // Increase Stock
  if (!formData.quantityInStock && !touchedFields.quantityInStock) {
    errors.quantityInStock = 'quantityInStock stock is required';
  } else if (formData.quantityInStock && Number(formData.quantityInStock) <= 0) {
    errors.quantityInStock = 'quantityInStock stock must be greater than 0';
  }

  // Sold
  if (!formData.quantitySold && !touchedFields.quantitySold) {
    errors.quantitySold = 'Sold quantity is required';
  } else if (formData.quantitySold && Number(formData.quantitySold) < 0) {
    errors.quantitySold = 'Sold quantity cannot be negative';
  }

  // Status (only in Edit mode)
  if (formMode === 'Edit' && formData.isActive === '') {
    errors.isActive = 'Status is required';
  }

  // Debug: Log errors if any
  console.log("=== Validation Errors ===");
  console.log(errors);

  return errors;
};
 
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Set form errors
      return;
    }

    const userID =
      sessionStorage.getItem('userID') ||
      '00000000-0000-0000-0000-000000000000';
    const isEdit = formMode === 'Edit';
    const url = '/PharmacyMedicine'; // Use relative path for axios

    // Constructing payload
    const payload = {
      pharmacyID: formData.pharmacyID,
      createdBy: userID,
      medicineID: formData.medicineID,
      batchNumber: formData.batchNumber,
      expiryDate: formData.expiryDate,
      quantity: parseFloat(formData.quantity) || 0,
      pricePerUnit: parseFloat(formData.pricePerUnit) || 0,
      gst: parseFloat(formData.gst) || 0,
      isActive: formData.isActive === 'false' ? false : true,

      // ✅ Newly added fields
      purchaseCost: parseFloat(formData.purchaseCost) || 0,
      minOrderQty: parseFloat(formData.minOrderQty) || 0,
      quantityReceived: parseFloat(formData.quantityReceived) || 0,
      quantityInStock: parseFloat(formData.quantityInStock) || 0,
      quantitySold: parseFloat(formData.quantitySold) || 0,

      ...(isEdit && {
        pharmacyMedicineID: formData.pharmacyMedicineID,
        updatedBy: userID,
        updatedOn: new Date().toISOString(),
      }),
      ...(!isEdit && {
        createdBy: userID,
        createdOn: new Date().toISOString(),
      }),
    };

    try {
      const response = isEdit
        ? await api.put(url, payload) // PUT for update
        : await api.post(url, payload); // POST for new record

      if (response.status === 200) {
        toast.success(
          `Pharmacy medicine successfully ${isEdit ? 'updated' : 'added'}!`,
          {
            position: 'top-right',
            autoClose: 3000,
          },
        );

        setShowForm(false);
  resetForm(); 
        // Refresh the table data after successful operation
        refreshTableData();
      } else {
        // Handle failed response
        toast.error(`Failed: ${response.data}`, {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error occurred while submitting the form.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const resetForm = () => {
  setFormData({
    pharmacyID: '',
    medicineID: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
    pricePerUnit: '',
    gst: '',
    isActive: true,
    purchaseCost: '',
    minOrderQty: '',
    quantityReceived: '',
    quantityInStock: '',
    quantitySold: '',
    pharmacyMedicineID: '',
  });
  setFormErrors({});
};

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Pharmacy Medicine
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add'
              ? 'Add Pharmacy Medicine'
              : 'Edit Pharmacy Medicine'}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {formMode === 'Add' && (
              <>
                {/* Pharmacy Select */}
                <div className="flex flex-col">
                  <select
                    value={formData.pharmacyID}
                    onChange={(e) => handleChange('pharmacyID', e.target.value)}
                    className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
                  >
                    <option value="">Select Pharmacy</option>
                    {pharmacies.map((pharmacy) => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.pharmacyID && (
                    <span className="text-red-500 text-sm mt-1">
                      {formErrors.pharmacyID}
                    </span>
                  )}
                </div>

                {/* Medicine Select */}
                <div className="flex flex-col">
                  <select
                    value={formData.medicineID}
                    onChange={(e) => handleChange('medicineID', e.target.value)}
                    className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
                  >
                    <option value="">Select Medicine</option>
                    {medicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.medicineID && (
                    <span className="text-red-500 text-sm mt-1">
                      {formErrors.medicineID}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Batch Number */}
            <div className="flex flex-col">
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => handleChange('batchNumber', e.target.value)}
                placeholder="Batch Number"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.batchNumber && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.batchNumber}
                </span>
              )}
            </div>

            {/* Expiry Date */}
            <div className="flex flex-col">
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.expiryDate && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.expiryDate}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex flex-col">
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="Quantity"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.quantity && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.quantity}
                </span>
              )}
            </div>

            {/* Price Per Unit */}
            <div className="flex flex-col">
              <input
                type="number"
                step="0.01"
                value={formData.pricePerUnit}
                onChange={(e) => handleChange('pricePerUnit', e.target.value)}
                placeholder="Price Per Unit"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.pricePerUnit && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.pricePerUnit}
                </span>
              )}
            </div>

            {/* GST */}
            <div className="flex flex-col">
              <input
                type="number"
                step="0.01"
                value={formData.gst}
                onChange={(e) => handleChange('gst', e.target.value)}
                placeholder="GST %"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.gst && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.gst}
                </span>
              )}
            </div>

            {/* Purchase Cost */}
            <div className="flex flex-col">
              <input
                type="number"
                step="0.01"
                value={formData.purchaseCost}
                onChange={(e) => handleChange('purchaseCost', e.target.value)}
                placeholder="Purchase Cost"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.purchaseCost && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.purchaseCost}
                </span>
              )}
            </div>

            {/* Min Order Qty */}
            <div className="flex flex-col">
              <input
                type="number"
                step="0.01"
                value={formData.minOrderQty}
                onChange={(e) => handleChange('minOrderQty', e.target.value)}
                placeholder="Min Order Qty"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.minOrderQty && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.minOrderQty}
                </span>
              )}
            </div>

            {/* Quantity Received */}
            <div className="flex flex-col">
              <input
                type="number"
                step="0.01"
                value={formData.quantityReceived}
                onChange={(e) =>
                  handleChange('quantityReceived', e.target.value)
                }
                placeholder="Quantity Received"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.quantityReceived && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.quantityReceived}
                </span>
              )}
            </div>

            {/* Quantity In Stock */}
            <div className="flex flex-col">
              <input
                type="number"
                step="0.01"
                value={formData.quantityInStock}
                onChange={(e) =>
                  handleChange('quantityInStock', e.target.value)
                }
                placeholder="Quantity In Stock"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.quantityInStock && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.quantityInStock}
                </span>
              )}
            </div>

            {/* Quantity Sold */}
            <div className="flex flex-col">
              <input
                type="number"
                step="0.01"
                value={formData.quantitySold}
                onChange={(e) => handleChange('quantitySold', e.target.value)}
                placeholder="Quantity Sold"
                className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
              />
              {formErrors.quantitySold && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.quantitySold}
                </span>
              )}
            </div>

            {formMode === 'Edit' && (
              <div className="flex flex-col">
                <select
                  value={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.value)}
                  className="rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary"
                >
                  <option value="">Select Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                {formErrors.isActive && (
                  <span className="text-red-500 text-sm mt-1">
                    {formErrors.isActive}
                  </span>
                )}
              </div>
            )}

            {/* Buttons Row - Full Width */}
            <div className="col-span-full flex justify-end gap-4 mt-4">
              <button
                type="submit"
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg transition duration-150 ease-out hover:ease-in"
              >
                {formMode === 'Add' ? 'Save' : 'Update'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg transition duration-150 ease-out hover:ease-in"
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

    <div className="ag-theme-alpine mt-6 w-full overflow-x-auto">
  <div style={{ minWidth: '600px', height: '400px' }}>
    <AgGridReact
      rowData={filteredData}
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
