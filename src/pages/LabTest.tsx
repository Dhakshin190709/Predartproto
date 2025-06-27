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
  const [labTestMap, setLabTestMap] = useState<{ [key: string]: string }>({});

  const [laboratoryMap, setLaboratoryMap] = useState<Record<string, string>>(
    {},
  );
  const [labTestOptions, setLabTestOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
  labTestID: '', // ✅ Add this
  labTestMasterID: '',
  tenantID: '',
  hospitalID: '',
  laboratoryID: '',
  unit: '',
  price: '',
  isActive: true,
});


  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        isActive: true,
        labTestMasterID: '',
        tenantID: '',
        hospitalID: '',
        laboratoryID: '',
        unit: '',
        price: '',
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
      isActive: true,
      labTestMasterID: '',
      tenantID: '',
      hospitalID: '',
      laboratoryID: '',
      unit: '',
      price: '',
    });
  };

  const handleEditClick = (feature: RowData) => {
  setFormData({
    labTestID: feature.labTestID || '', // ✅ Include this line
    labTestMasterID: feature.labTestMasterID || '',
    tenantID: feature.tenantID || '',
    hospitalID: feature.hospitalID || '',
    laboratoryID: feature.laboratoryID || '',
    unit: feature.unit || '',
    price: feature.price ?? '',
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

    const payload: any = {
      tenantID: formData.tenantID,
      hospitalID: formData.hospitalID,
      laboratoryID: formData.laboratoryID,
      labTestMasterID: formData.labTestMasterID,
      unit: formData.unit.trim(),
      price: parseFloat(formData.price.toString()),
      isActive: formData.isActive ?? true,
      createdBy: userID,
      updatedBy: userID,
    };

    // ✅ Include labTestID only when updating
    if (formMode === 'Edit') {
      payload.labTestID = formData.labTestID;
    }

    let response;
    let toastMessage = '';

    if (formMode === 'Add') {
      response = await api.post('/LabTest', payload);
      toastMessage = 'Lab test added successfully!';
    } else {
      response = await api.put('/LabTest', payload);
      toastMessage = 'Lab test updated successfully!';
    }

    toast.success(toastMessage);
    await refreshTableData();
    resetFormData();
    setShowForm(false);
    setFormErrors({});
  } catch (error: any) {
    console.error('Error saving lab test:', error.response?.data || error.message);
    toast.error('Failed to save/update lab test. Please try again.');
  }
};


  const refreshTableData = async () => {
    try {
      const response = await api.get('/LabTest'); // ✅ Updated endpoint

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
        'Error fetching lab test data:',
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      labTestMasterID: '',
      tenantID: '',
      hospitalID: '',
      laboratoryID: '',
      unit: '',
      price: '',
      isActive: true,
    });
  };
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

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/Hospital/List');
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
    const fetchLabTests = async () => {
      try {
        const res = await api.get('/LabTestMaster');
        if (res.data?.success) {
          const options = res.data.data.map((t: any) => ({
            id: t.labTestMasterID,
            name: t.testName,
          }));
          setLabTestOptions(options);

          // Build a mapping from ID to name
          const map: { [key: string]: string } = {};
          res.data.data.forEach((t: any) => {
            map[t.labTestMasterID] = t.testName;
          });
          setLabTestMap(map);
        } else {
          toast.error('Failed to load lab test list');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching lab tests');
      }
    };

    fetchLabTests();
  }, []);

  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'Lab Test ID',
      field: 'labTestMasterID',
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
      headerName: 'Lab Test Master Name',
      field: 'labTestMasterID',
      valueGetter: (params) => labTestMap[params.data.labTestMasterID] || 'N/A',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 220,
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
      headerName: 'Laboratory Name',
      field: 'laboratoryID',
      valueGetter: (params) => laboratoryMap[params.data.laboratoryID] || 'N/A',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
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
      headerName: 'Price',
      field: 'price',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 120,
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
          onClick={() => handleDelete(params.data.labTestMasterID)}
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
        row.unit?.toLowerCase().includes(searchText) ||
        row.price?.toString().toLowerCase().includes(searchText) ||
        row.labTestMasterID?.toLowerCase().includes(searchText); // optional

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

  const labTestID = params.data.labTestID; // ✅ Use labTestID from the row
  const updatedStatus = !(params.data.isActive === true);

  try {
    await api.patch('/LabTest', {
      guidID: labTestID,            // ✅ Correct key for backend
      isActive: updatedStatus,
      updatedBy: userID,
    });

    // Update local table state
    const updatedData = rowData.map((item) =>
      item.labTestID === labTestID
        ? { ...item, isActive: updatedStatus }
        : item
    );

    setRowData(updatedData);
    setFilteredData(updatedData);

    toast.success('Lab test status updated successfully!');
  } catch (error) {
    console.error('Error updating status:', error.response?.data || error.message);
    toast.error('Failed to update lab test status. Please try again.');
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
    const errors: any = {};

    if (!formData.tenantID) errors.tenantID = 'Tenant is required';
    if (!formData.hospitalID) errors.hospitalID = 'Hospital is required';
    if (!formData.labTestMasterID)
      errors.labTestMasterID = 'Lab Test is required';
    if (!formData.laboratoryID) errors.laboratoryID = 'Laboratory is required';

    if (!formData.unit.trim()) {
      errors.unit = 'Unit is required';
    } else if (!/^[0-9]+$/.test(formData.unit)) {
      errors.unit = 'Unit must be digits only';
    }

    if (formData.price === 0 || isNaN(formData.price)) {
      errors.price = 'Price is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Lab Test
      </h2>

      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add Lab Test' : 'Edit Lab Test'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Dropdowns Row */}
            <div className="flex flex-col md:flex-row gap-6">
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
            </div>

            {/* Lab Test Name & Laboratory Dropdown */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <select
                  value={formData.labTestMasterID}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      labTestMasterID: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                >
                  <option value="">Select Lab Test Master</option>
                  {labTestOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
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

            {/* Unit and Price */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="Enter Unit"
                  className="w-full rounded-lg border border-stroke py-3 px-4 bg-transparent text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div className="flex-1">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter Price"
                  className="w-full rounded-lg border border-stroke py-3 px-4 bg-transparent text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>

            {/* isActive Checkbox and Buttons */}
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

export default PricePlan;
