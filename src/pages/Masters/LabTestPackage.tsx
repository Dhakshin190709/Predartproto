import axios from 'axios'; // Ensure Axios is installed via npm or yarn
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Edit } from 'lucide-react';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS
import { ToastContainer } from 'react-toastify';
import api from '../../api/request';

const LabTestPackage: React.FC = () => {
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
  const [tenants, setTenants] = useState([]);
  const [tenantID, setTenantID] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [laboratories, setLaboratories] = useState([]);
  const [selectedTenantID, setSelectedTenantID] = useState('');
  const [laboratoryMap, setLaboratoryMap] = useState<Record<string, string>>(
    {},
  );

  // New state
  const [tenantMap, setTenantMap] = useState<Record<string, string>>({});
  const [hospitalMap, setHospitalMap] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    tenantName: '',
    hospitalName: '',
    laboratoryName: '',
    packageName: '',
    packageCode: '',
    packagePrice: '',
    packageDescription: '',
    isActive: true,
  });

  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        tenantName: '',
        hospitalName: '',
        laboratoryName: '',
        packageName: '',
        packageCode: '',
        packagePrice: '',
        packageDescription: '',
        isActive: true,
      });
    }
  }, [formMode]);

  useEffect(() => {
    const fetchTenantList = async () => {
      setLoading(true);
      try {
        const response = await api.get('/Tenant');
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

  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        const response = await api.get('/Laboratory');
        if (response.data?.data) {
          const labData = response.data.data;
          setLaboratories(labData);

          const map: Record<string, string> = {};
          labData.forEach((lab: any) => {
            map[lab.laboratoryID] = lab.labName;
          });

          setLaboratoryMap(map); // ✅ this sets labID => labName
        }
      } catch (error) {
        console.error('Failed to fetch laboratories:', error);
      }
    };

    fetchLaboratories();
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
    setShowForm(false);
    setFormMode('');
    setIsActive(false);
    resetFormData(); // you already have this function
  };

  const handleEditClick = (row: RowData) => {
    setFormData({
      labTestPackageID: row.labTestPackageID || '',
      tenantID: row.tenantID || '',
      tenantName: tenantMap[row.tenantID] || '',
      hospitalID: row.hospitalID || '',
      hospitalName: hospitalMap[row.hospitalID] || '',
      laboratoryID: row.laboratoryID || '', // ✅ Correct field name
      laboratoryName: laboratoryMap[row.laboratoryID] || '', // ✅ Optional for display
      packageName: row.packageName || '',
      packageCode: row.packageCode || '',
      packagePrice: row.packagePrice?.toString() || '',
      packageDescription: row.packageDescription || '',
      isActive: row.isActive ?? true,
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

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      toast.error('Missing user ID. Please log in again.');
      return;
    }

    const payload: any = {
      createdBy: userID,
      updatedBy: userID,
      isActive: true,
      tenantID: formData.tenantID || '',
      hospitalID: formData.hospitalID || '',
      laboratoryID:
        formData.laboratoryID || '00000000-0000-0000-0000-000000000000',

      packageName: formData.packageName.trim(),
      packageCode: formData.packageCode.trim(),
      packagePrice: parseFloat(formData.packagePrice),
      packageDescription: formData.packageDescription.trim(),
    };

    // Only for Edit: include ID
    if (formMode === 'Edit') {
      payload.labTestPackageID = formData.labTestPackageID;
    }

    try {
      const response =
        formMode === 'Edit'
          ? await api.put('/LabTestPackage', payload)
          : await api.post('/LabTestPackage', payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          formMode === 'Edit'
            ? 'Lab test package updated successfully!'
            : 'Lab test package saved successfully!',
        );
        await refreshTableData();
        resetFormData();
        setShowForm(false);
        setFormErrors({});
      } else {
        toast.error('Failed to save lab test package.');
      }
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);
      toast.error('Failed to save lab test package. Please try again.');
    }
  };

  const refreshTableData = async () => {
    try {
      const response = await api.get('/LabTestPackage');

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
        'Error fetching lab test package data:',
        error.response?.data || error.message,
      );
      toast.error('Failed to fetch lab test packages.');
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      tenantName: '',
      hospitalName: '',
      laboratoryName: '',
      packageName: '',
      packageCode: '',
      packagePrice: '',
      packageDescription: '',
      isActive: true,
    });
  };

  const columnDefs: ColDef<RowData, any>[] = useMemo(
    () => [
      {
        headerName: 'LabTestPackage ID',
        field: 'labTestPackageID',
        hide: true,
      },
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
        width: 200,
      },
      {
        headerName: 'Laboratory Name',
        field: 'laboratoryID',
        valueGetter: (params) =>
          laboratoryMap[params.data.laboratoryID] || 'N/A',
        headerClass: 'left-header',
        cellClass: 'text-left',
        sortable: true,
        filter: true,
        width: 200,
      },

      {
        headerName: 'Package Name',
        field: 'packageName',
        headerClass: 'left-header',
        cellClass: 'text-left',
        sortable: true,
        filter: true,
        width: 160,
      },
      {
        headerName: 'Package Code',
        field: 'packageCode',
        headerClass: 'left-header',
        cellClass: 'text-left',
        sortable: true,
        filter: true,
        width: 160,
      },
      {
        headerName: 'Package Price',
        field: 'packagePrice',
        headerClass: 'left-header',
        cellClass: 'text-left',
        sortable: true,
        filter: true,
        width: 160,
      },
      {
        headerName: 'Description',
        field: 'packageDescription',
        headerClass: 'left-header',
        cellClass: 'text-left',
        sortable: true,
        filter: true,
        width: 240,
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
    ],
    [tenantMap, hospitalMap, laboratoryMap],
  ); // ✅ Dependency on updated maps

  // Define applyGlobalSearch function
  const applyGlobalSearch = (data: RowData[]) => {
    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data);
      return [];
    }

    const searchText = quickSearchText.toLowerCase();

    return data.filter((row) => {
      return (
        row.tenantName?.toLowerCase().includes(searchText) ||
        row.hospitalName?.toLowerCase().includes(searchText) ||
        row.laboratoryName?.toLowerCase().includes(searchText) ||
        row.packageName?.toLowerCase().includes(searchText) ||
        row.packageCode?.toLowerCase().includes(searchText) ||
        row.packagePrice?.toString().toLowerCase().includes(searchText) ||
        row.packageDescription?.toLowerCase().includes(searchText)
      );
    });
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const toggleStatus = async (params: any) => {
    const userID = sessionStorage.getItem('userID');
    const token = sessionStorage.getItem('token');

    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const labTestPackageID = params.data.labTestPackageID; // ✅ Use correct ID field
    const updatedStatus = !(params.data.isActive === true);

    try {
      await api.patch('/LabTestPackage', {
        guidID: labTestPackageID,
        id: 0, // required by API even if unused
        updatedBy: userID,
        updatedOn: new Date().toISOString(),
        isActive: updatedStatus,
      });

      // Update state
      const updatedData = rowData.map((item) =>
        item.labTestPackageID === labTestPackageID
          ? { ...item, isActive: updatedStatus }
          : item,
      );

      setRowData(updatedData);
      setFilteredData(updatedData);

      toast.success('Lab test package status updated successfully!');
    } catch (error: any) {
      console.error(
        'Error updating status:',
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

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const nameRegex = /^[a-zA-Z0-9\s_-]{3,100}$/;
    const codeRegex = /^[A-Z0-9_-]{3,20}$/;
    const priceRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
    const descRegex = /^[a-zA-Z0-9\s.,:;'"()\-!?]*$/; // safe punctuation
    const numberRegex = /^\d+(\.\d{1,2})?$/; // valid number with optional decimal

    // Validate tenant
    if (!formData.tenantID) {
      errors.tenantID = 'Tenant is required';
    }

    // Validate hospital
    if (!formData.hospitalID) {
      errors.hospitalID = 'Hospital is required';
    }

    // Validate laboratory
    // if (!formData.laboratoryID) {
    //   errors.laboratoryID = 'Laboratory is required';
    // }

    // Validate package name
    if (!formData.packageName.trim()) {
      errors.packageName = 'Package Name is required';
    } else if (!nameRegex.test(formData.packageName.trim())) {
      errors.packageName = 'Invalid characters in Package Name';
    }

    // Validate package code
    // if (!formData.packageCode.trim()) {
    //   errors.packageCode = 'Package Code is required';
    // } else if (!codeRegex.test(formData.packageCode.trim())) {
    //   errors.packageCode = 'Invalid Package Code format';
    // }

    // Validate package price
    if (!formData.packagePrice) {
      errors.packagePrice = 'Price is required';
    } else if (!priceRegex.test(formData.packagePrice)) {
      errors.packagePrice = 'Invalid price format';
    }

    // Validate description
    const description = formData.packageDescription?.trim() || '';
    if (!description) {
      errors.packageDescription = 'Description is required';
    } else if (description.length > 250) {
      errors.packageDescription = 'Description must be max 250 characters';
    } else if (!descRegex.test(description)) {
      errors.packageDescription =
        'Description contains invalid characters (no emojis or special characters)';
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
        Lab Test Package
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add New LabTestPackage' : 'Edit Feature'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* First row: Feature Name and Feature Description side by side */}
            {/* ✅ Row 1 */}
            {formMode !== 'Edit' && (
              <div className="flex flex-col md:flex-row gap-6 mb-4">
                {/* Tenant Dropdown */}
                <div className="flex-1">
                  <select
                    value={formData.tenantID}
                    onChange={(e) =>
                      setFormData({ ...formData, tenantID: e.target.value })
                    }
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
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

                {/* Hospital Dropdown */}
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
                        hospitalName: selectedHospital?.hospitalName || '',
                      });
                    }}
                    className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
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

                {/* Laboratory Dropdown */}
                <div className="flex-1">
                  <select
                    value={formData.laboratoryID}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        laboratoryID: e.target.value || '',
                      })
                    }
                    className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                  >
                    <option value="">Select Laboratory</option>
                    {laboratories.map((lab) => (
                      <option key={lab.laboratoryID} value={lab.laboratoryID}>
                        {lab.labName}
                      </option>
                    ))}
                  </select>
                  {formErrors.laboratoryID && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.laboratoryID}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ✅ Row 2 */}
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.packageName}
                  onChange={(e) =>
                    setFormData({ ...formData, packageName: e.target.value })
                  }
                  placeholder="Package Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                {formErrors.packageName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.packageName}
                  </p>
                )}
              </div>

          
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.packagePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, packagePrice: e.target.value })
                  }
                  placeholder="Package Price"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                {formErrors.packagePrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.packagePrice}
                  </p>
                )}
              </div>
            </div>

            {/* ✅ Row 3 */}
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              {/* Description spanning 2/3 width */}
              <div className="md:w-2/3 w-full">
                <textarea
                  value={formData.packageDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      packageDescription: e.target.value,
                    })
                  }
                  placeholder="Package Description"
                  rows={2}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                {formErrors.packageDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.packageDescription}
                  </p>
                )}
              </div>

              {/* <div className="md:w-1/3 w-full flex items-center mt-4 md:mt-0">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700 dark:text-white">
                  Is Active
                </label>
              </div> */}
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

     <div className="w-full overflow-x-auto">
  <div className="ag-theme-alpine min-w-[600px]" style={{ height: 'auto' }}>
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

export default LabTestPackage;
