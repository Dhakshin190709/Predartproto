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

const Supplier: React.FC = () => {
  // Initialize rowData with useState
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [tenants, setTenants] = useState([]);
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
  const [tenantMap, setTenantMap] = useState<Record<string, string>>({});
  const [hospitalMap, setHospitalMap] = useState<Record<string, string>>({});
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [laboratories, setLaboratories] = useState([]);
  const [selectedTenantID, setSelectedTenantID] = useState('');
  const [supplierOptions, setSupplierOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [supplierMap, setSupplierMap] = useState<{ [key: string]: string }>({});

  const [labTestOptions, setLabTestOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    supplierID: '', // string (UUID)
    tenantID: '', // string (UUID)
    hospitalID: '', // string (UUID)
    supplierName: '', // string
    supplierEmail: '', // string
    supplierPhoneNumber: '', // string
    address1: '', // string
    address2: '', // string
    supplierCode: '', // string
    userID: '', // string (UUID)
    isActive: true, // boolean
  });

  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        supplierID: '',
        tenantID: '',
        hospitalID: '',
        supplierName: '',
        supplierEmail: '',
        supplierPhoneNumber: '',
        address1: '',
        address2: '',
        supplierCode: '',
        userID: '',
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
    setShowForm(false);
    setFormMode('');
    setFormData({
      supplierID: '',
      tenantID: '',
      hospitalID: '',
      supplierName: '',
      supplierEmail: '',
      supplierPhoneNumber: '',
      address1: '',
      address2: '',
      supplierCode: '',
      userID: '',
      isActive: true,
    });
    setFormErrors({}); // 👈 clear all form errors
  };

  const handleEditClick = (feature: RowData) => {
    setFormData({
      supplierID: feature.supplierID || '',
      tenantID: feature.tenantID || '',
      hospitalID: feature.hospitalID || '',
      supplierName: feature.supplierName || '',
      supplierEmail: feature.supplierEmail || '',
      supplierPhoneNumber: feature.supplierPhoneNumber || '',
      address1: feature.address1 || '',
      address2: feature.address2 || '',
      supplierCode: feature.supplierCode || '',
      userID: feature.userID || '',
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
        ...formData,
        userID,
        createdBy: userID,
        updatedBy: userID,
      };

      let response;

      if (formMode === 'Add') {
        // Exclude supplierID for POST
        const { supplierID, ...postPayload } = basePayload;
        response = await api.post('/Supplier/AddSupplier', postPayload);
        toast.success('Supplier added successfully!');
      } else {
        // Include supplierID for PUT
        response = await api.put('/Supplier/UpdateSupplier', basePayload);
        toast.success('Supplier updated successfully!');
      }

      await refreshTableData();
      resetFormData();
      setShowForm(false);
      setFormErrors({});
    } catch (error: any) {
      console.error(
        'Error saving supplier:',
        error.response?.data || error.message,
      );
      toast.error('Failed to save/update supplier. Please try again.');
    }
  };

  const refreshTableData = async () => {
    try {
      const response = await api.get('/Supplier');

      if (Array.isArray(response.data)) {
        const suppliers = response.data;

        // ✅ Remove duplicates by supplierID
        const uniqueSuppliersMap = new Map();
        suppliers.forEach((s: any) => {
          if (!uniqueSuppliersMap.has(s.supplierID)) {
            uniqueSuppliersMap.set(s.supplierID, s);
          }
        });

        const uniqueSuppliers = Array.from(uniqueSuppliersMap.values());

        // Table data
        setRowData([...uniqueSuppliers]);
        setFilteredData([...uniqueSuppliers]);

        // Dropdown options
        const options = uniqueSuppliers.map((s: any) => ({
          id: s.supplierID,
          name: s.supplierName,
        }));
        setSupplierOptions(options);

        // ID -> Name map
        const map: { [key: string]: string } = {};
        uniqueSuppliers.forEach((s: any) => {
          map[s.supplierID] = s.supplierName;
        });
        setSupplierMap(map);
      } else {
        console.error('Expected an array, but got:', response.data);
      }
    } catch (error: any) {
      console.error(
        'Error fetching supplier data:',
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      supplierID: '',
      tenantID: '',
      hospitalID: '',
      supplierName: '',
      supplierEmail: '',
      supplierPhoneNumber: '',
      address1: '',
      address2: '',
      supplierCode: '',
      userID: '',
      isActive: true,
    });
  };

  useEffect(() => {
    const fetchTenantList = async () => {
      setLoading(true);
      try {
        const response = await api.get('/Tenant/TenantList');
        if (response.data?.data) {
          const tenantData = response.data.data;
          setTenants(tenantData);

          const map: Record<string, string> = {};
          tenantData.forEach((t: any) => {
            map[t.tenantID] = t.tenantName;
          });
          setTenantMap(map);
        } else {
          setError('Tenant data is missing');
        }
      } catch (err) {
        console.error('Tenant fetch error:', err);
        setError('Tenant fetch failed');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantList();
  }, []);

  // useEffect(() => {
  //   const fetchLaboratories = async () => {
  //     try {
  //       const response = await api.get('/Laboratory');
  //       if (response.data?.data) {
  //         const labData = response.data.data;
  //         setLaboratories(labData);

  //         const map: Record<string, string> = {};
  //         labData.forEach((lab: any) => {
  //           map[lab.laboratoryID] = lab.labName;
  //         });

  //         setLaboratoryMap(map); // ✅ this sets labID => labName
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch laboratories:', error);
  //     }
  //   };

  //   fetchLaboratories();
  // }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/Hospital/HospitalsList');
        const data = res.data || [];
        const activeHospitals = data
          .filter((h: any) => h.isActive)
          .map((h: any) => ({
            hospitalID: h.hospitalID,
            hospitalName: h.hospitalName,
          }));
        setHospitals(activeHospitals);

        const map: Record<string, string> = {};
        activeHospitals.forEach((h: any) => {
          map[h.hospitalID] = h.hospitalName;
        });
        setHospitalMap(map);
      } catch (err) {
        console.error('Hospital fetch error:', err);
      }
    };

    fetchHospitals();
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      if (!formData.tenantID) {
        setHospitals([]); // clear hospitals if tenant is unselected
        return;
      }

      try {
        const response = await api.get(
          `/Hospital?tenantId=${formData.tenantID}`,
        );
        const hospitalData = response.data;

        if (Array.isArray(hospitalData)) {
          const extractedHospitals = hospitalData.map(
            (item: any) => item.hospital,
          );
          setHospitals(extractedHospitals);
        } else {
          setHospitals([]);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setHospitals([]);
      }
    };

    fetchHospitals();
  }, [formData.tenantID]);

  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'Supplier ID',
      field: 'supplierID',
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
      headerName: 'Tenant Name',
      field: 'tenantID',
      valueGetter: (params) => tenantMap[params.data.tenantID] || 'N/A',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: 'Hospital Name',
      field: 'hospitalID',
      valueGetter: (params) => hospitalMap[params.data.hospitalID] || 'N/A',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 300,
    },
    {
      headerName: 'Supplier Name',
      field: 'supplierName',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
    },

    {
      headerName: 'Supplier Email',
      field: 'supplierEmail',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 320,
    },
    {
      headerName: 'Supplier Phone Number',
      field: 'supplierPhoneNumber',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
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
            //onClick={() => toggleStatus(params)}
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
          onClick={() => handleDelete(params.data.labTestMasterID)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
    },
  ];

  const applyGlobalSearch = (data: RowData[]) => {
    console.log('Data passed to applyGlobalSearch:', data);

    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data);
      return [];
    }

    const searchText = quickSearchText.toLowerCase();

    return data.filter((row) => {
      const matchesSearch =
        row.supplierName?.toLowerCase().includes(searchText) ||
        row.supplierEmail?.toLowerCase().includes(searchText) ||
        row.supplierPhoneNumber?.toLowerCase().includes(searchText) ||
        row.supplierCode?.toLowerCase().includes(searchText) ||
        row.address1?.toLowerCase().includes(searchText) ||
        row.address2?.toLowerCase().includes(searchText);

      return matchesSearch;
    });
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  // const toggleStatus = async (params: any) => {
  //   const userID = sessionStorage.getItem('userID');

  //   if (!userID) {
  //     alert('User not logged in. Please log in again.');
  //     return;
  //   }

  //   const labTestID = params.data.labTestID; // ✅ Use labTestID from the row
  //   const updatedStatus = !(params.data.isActive === true);

  //   try {
  //     await api.patch('/LabTest', {
  //       guidID: labTestID, // ✅ Correct key for backend
  //       isActive: updatedStatus,
  //       updatedBy: userID,
  //     });

  //     // Update local table state
  //     const updatedData = rowData.map((item) =>
  //       item.labTestID === labTestID
  //         ? { ...item, isActive: updatedStatus }
  //         : item,
  //     );

  //     setRowData(updatedData);
  //     setFilteredData(updatedData);

  //     toast.success('Lab test status updated successfully!');
  //   } catch (error) {
  //     console.error(
  //       'Error updating status:',
  //       error.response?.data || error.message,
  //     );
  //     toast.error('Failed to update lab test status. Please try again.');
  //   }
  // };

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
    const errors: any = {};

    const noOnlySpaces = /\S/;
    const noEmojis =
      /^[^\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]*$/u;

    const supplierNameRegex = /^[A-Za-z][A-Za-z0-9\s\-]*$/;

    const emailRegex =
      /^[a-zA-Z][a-zA-Z0-9_.]*@[a-zA-Z]+\.(com|in|org|net|edu|gov)$/;
    const phoneRegex = /^(?!.*(\d)\1{4,})[6-9]\d{9}$/;
    const alphaNumericSlash = /^[a-zA-Z0-9\s/]+$/;
    const noTripleRepeat = /^(?!.*([a-zA-Z])\1{2,}).+$/;
    const atLeastOneLetter = /[a-zA-Z]/;
    const containsNumber = /\d/;

    if (!formData.tenantID) errors.tenantID = 'Tenant is required';
    if (!formData.hospitalID) errors.hospitalID = 'Hospital is required';

    // Supplier Name
    if (!formData.supplierName.trim()) {
      errors.supplierName = 'Supplier name is required';
    } else if (!supplierNameRegex.test(formData.supplierName)) {
      errors.supplierName =
        'Only letters, numbers, spaces, and hyphens allowed (e.g., Apollo - LLC - 123)';
    }

    // Supplier Email
    if (!formData.supplierEmail.trim()) {
      errors.supplierEmail = 'Supplier email is required';
    } else if (!emailRegex.test(formData.supplierEmail)) {
      errors.supplierEmail = 'Invalid email format. Example: abc@example.com';
    }

    // Supplier Phone Number
    if (!formData.supplierPhoneNumber.trim()) {
      errors.supplierPhoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.supplierPhoneNumber)) {
      errors.supplierPhoneNumber =
        'Must start with 6–9 and be exactly 10 digits. No repeated digits more than 4 times.';
    }

    // Address 1 & Address 2
    const validateAddressLine = (field: string, fieldName: string) => {
      if (!field || !noOnlySpaces.test(field)) {
        errors[fieldName] = 'This field is required.';
      } else if (!noEmojis.test(field)) {
        errors[fieldName] = 'No emojis allowed.';
      } else if (!alphaNumericSlash.test(field)) {
        errors[fieldName] =
          'Only letters, numbers, spaces, and slashes allowed.';
      } else if (field.length < 3) {
        errors[fieldName] = 'Minimum 3 characters required.';
      } else if (!atLeastOneLetter.test(field)) {
        errors[fieldName] = 'Must contain at least one letter.';
      } else if (!containsNumber.test(field)) {
        errors[fieldName] = 'Must contain at least one number.';
      } else if (!noTripleRepeat.test(field)) {
        errors[fieldName] =
          'No character should repeat more than twice in a row.';
      }
    };

    validateAddressLine(formData.address1, 'address1');
    validateAddressLine(formData.address2, 'address2');

    // // Supplier Code
    // if (!formData.supplierCode.trim()) {
    //   errors.supplierCode = 'Supplier code is required';
    // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Supplier
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add Supplier' : 'Edit Supplier'}
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Tenant & Hospital Dropdowns */}
      {formMode.trim().toLowerCase() !== 'edit' && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Tenant */}
              <div className="flex-1">
                <select
                  value={formData.tenantID}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantID: e.target.value })
                  }
                  className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none"
                >
                  <option value="">Select Tenant</option>
                  {tenants.map((tenant) => (
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

              {/* Hospital */}
              <div className="flex-1">
                <select
                  value={formData.hospitalID}
                  onChange={(e) => {
                    const selectedHospital = hospitals.find(
                      (h) => h.hospitalID === e.target.value,
                    );
                    setFormData({
                      ...formData,
                      hospitalID: selectedHospital?.hospitalID || '',
                    });
                  }}
                  className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none"
                >
                  <option value="">Select Hospital</option>
                  {formData.tenantID ? (
                    hospitals.length > 0 ? (
                      hospitals.map((hospital) => (
                        <option
                          key={hospital.hospitalID}
                          value={hospital.hospitalID}
                        >
                          {hospital.hospitalName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hospitals available</option>
                    )
                  ) : (
                    <option disabled>Please select a tenant first</option>
                  )}
                </select>
                {formErrors.hospitalID && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.hospitalID}
                  </p>
                )}
              </div>
            </div>
)}
            {/* Supplier Name and Code */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <input
                  type="text"
                  maxLength={40}
                  value={formData.supplierName}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierName: e.target.value })
                  }
                  placeholder="Supplier Name"
                  className="w-full rounded-lg border border-stroke py-3 px-4 bg-transparent text-black outline-none"
                />
                {formErrors.supplierName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.supplierName}
                  </p>
                )}
              </div>

              {/* <div className="flex-1">
          <input
            type="text"
            value={formData.supplierCode}
            onChange={(e) =>
              setFormData({ ...formData, supplierCode: e.target.value })
            }
            placeholder="Supplier Code"
            className="w-full rounded-lg border border-stroke py-3 px-4 bg-transparent text-black outline-none"
          />
            {formErrors.supplierCode && (
            <p className="text-red-500 text-sm mt-1">{formErrors.supplierCode}</p>
          )}
        </div> */}
              <div className="flex-1">
                <input
                  type="email"
                  value={formData.supplierEmail}
                  maxLength={60}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierEmail: e.target.value })
                  }
                  placeholder="Supplier Email"
                  className="w-full rounded-lg border border-stroke py-3 px-4 bg-transparent text-black outline-none"
                />
                {formErrors.supplierEmail && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.supplierEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Email and Phone */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.supplierPhoneNumber}
                  maxLength={10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supplierPhoneNumber: e.target.value,
                    })
                  }
                  placeholder="Phone Number"
                  className="w-full rounded-lg border border-stroke py-3 px-4 bg-transparent text-black outline-none"
                />
                {formErrors.supplierPhoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.supplierPhoneNumber}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.address1}
                  maxLength={40}
                  onChange={(e) =>
                    setFormData({ ...formData, address1: e.target.value })
                  }
                  placeholder="Address Line 1"
                  className="w-full rounded-lg border border-stroke py-3 px-4 bg-transparent text-black outline-none"
                />
                {formErrors.address1 && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.address1}
                  </p>
                )}
              </div>
            </div>

            {/* Address Fields */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <input
                  type="text"
                  maxLength={40}
                  value={formData.address2}
                  onChange={(e) =>
                    setFormData({ ...formData, address2: e.target.value })
                  }
                  placeholder="Address Line 2"
                  className="w-full rounded-lg border border-stroke py-3 px-4 bg-transparent text-black outline-none"
                />
                {formErrors.address2 && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.address2}
                  </p>
                )}
              </div>
              <div className="flex-1"></div>
            </div>

            {/* isActive and Buttons */}
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
                  onClick={resetForm} // 👈 call resetForm instead of just hiding the form
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

export default Supplier;
