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
type RowData = {
  tenantID?: string;
  hospitalID?: string;
  title?: string;
  code?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  organizedBy?: string;
  remarks?: string;
  isActive?: boolean;
};

const MedicalCamp: React.FC = () => {
  // Initialize rowData with useState
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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
  const [filteredRowData, setFilteredRowData] =
    useState<RowData[]>(filteredData);
  const [hospitalList, setHospitalList] = useState([]);
  const [hospitalMap, setHospitalMap] = useState({});

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [tenantList, setTenantList] = useState([]);

  const [tenantMap, setTenantMap] = useState({});
  const [formData, setFormData] = useState({
    tenantID: '',
    hospitalID: '',
    title: '',
    code: '',
    location: '',
    startDate: '',
    endDate: '',
    organizedBy: '',
    remarks: '',
    isActive: true,
  });

  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        tenantID: '',
        hospitalID: '',
        title: '',
        code: '',
        location: '',
        startDate: '',
        endDate: '',
        organizedBy: '',
        remarks: '',
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

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/Tenant');
        if (response.data.success && Array.isArray(response.data.data)) {
          setTenantList(response.data.data);
          const mapping = {};
          response.data.data.forEach((t) => {
            mapping[t.tenantID] = t.tenantName;
          });
          setTenantMap(mapping);
        } else {
          console.error('Invalid tenant response format');
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };

    fetchTenants();
  }, []);

  useEffect(() => {
    if (!formData.tenantID) {
      setHospitalList([]);
      setFormData((prev) => ({ ...prev, hospitalID: '' }));
      return;
    }

    const fetchHospitals = async () => {
      try {
        const response = await api.get(`/Hospital/List`, {
          params: { tenantId: formData.tenantID },
        });

        if (Array.isArray(response.data)) {
          setHospitalList(response.data);
        } else {
          console.error('Invalid hospital list format');
          setHospitalList([]);
        }
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        setHospitalList([]);
      }
    };

    fetchHospitals();
  }, [formData.tenantID]);

  const resetForm = () => {
    setShowForm(false); // Show the fields again
    setFormMode('');
    setName(''); // Reset input fields if necessary
    setIsActive(false);
  };

  const handleEditClick = (camp: RowData) => {
    const formatDate = (dateStr: string) => {
      return dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
    };

    setFormData({
      campID: camp.campID || '', // ✅ include this
      tenantID: camp.tenantID || '',
      hospitalID: camp.hospitalID || '',
      title: camp.title || '',
      code: camp.code || '',
      location: camp.location || '',
      startDate: formatDate(camp.startDate),
      endDate: formatDate(camp.endDate),
      organizedBy: camp.organizedBy || '',
      remarks: camp.remarks || '',
      isActive: camp.isActive ?? true,
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
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/Hospital');
        if (Array.isArray(response.data)) {
          setHospitalList(response.data);

          // Create mapping: hospitalID -> hospitalName
          const mapping = {};
          response.data.forEach((item) => {
            const hospital = item.hospital;
            if (hospital?.hospitalID && hospital?.hospitalName) {
              mapping[hospital.hospitalID] = hospital.hospitalName;
            }
          });

          setHospitalMap(mapping);
        } else {
          console.error('Invalid hospital response format');
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    fetchHospitals();
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

      const now = new Date().toISOString();

      const payload = {
        createdBy: userID,
        createdOn: now,
        updatedBy: userID,
        updatedOn: now,
        isActive: formData.isActive ?? true,
        campID: formData.campID || undefined, // undefined for new
        tenantID: formData.tenantID,
        hospitalID: formData.hospitalID,
        title: formData.title.trim(),
        code: formData.code?.trim() || '',
        location: formData.location.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        organizedBy: formData.organizedBy.trim(),
        remarks: formData.remarks?.trim() || '',
      };

      let response;
      let toastMessage = '';

      if (!formData.campID) {
        response = await api.post('/MedicalCamp', payload);
        toastMessage = 'Camp saved successfully!';
      } else {
        response = await api.put('/MedicalCamp', payload);
        toastMessage = 'Camp updated successfully!';
      }

      toast.success(toastMessage);
      await refreshTableData(); // refresh grid/table
      resetFormData();
      setShowForm(false);
      setFormErrors({});
    } catch (error: any) {
      console.error(
        'Error saving camp:',
        error.response?.data || error.message,
      );
      toast.error('Failed to save/update camp. Please try again.');
    }
  };

  const refreshTableData = async () => {
    try {
      const response = await api.get('/MedicalCamp');
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
        'Error fetching medical camp data:',
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      tenantID: '',
      hospitalID: '',
      title: '',
      code: '',
      location: '',
      startDate: '',
      endDate: '',
      organizedBy: '',
      remarks: '',
      isActive: true,
    });
  };

  const columnDefs: ColDef<RowData, any>[] = [
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
      sortable: true,
      filter: true,
      width: 180,
      valueGetter: (params) => tenantMap[params.data.tenantID] || 'N/A',
    },

    {
      headerName: 'Hospital Name',
      field: 'hospitalID',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
      valueGetter: (params) => hospitalMap[params.data.hospitalID] || 'N/A',
    },

    {
      headerName: 'Title',
      field: 'title',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: 'Code',
      field: 'code',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 160,
    },
    {
      headerName: 'Location',
      field: 'location',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 160,
      valueFormatter: (params: any) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 160,
      valueFormatter: (params: any) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    {
      headerName: 'Organized By',
      field: 'organizedBy',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 180,
    },
    {
      headerName: 'Remarks',
      field: 'remarks',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 300,
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
      cellClass: 'text-center',
      width: 80,
      hide: true,
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.id)}
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
        row.title?.toLowerCase().includes(searchText) ||
        row.code?.toLowerCase().includes(searchText) ||
        row.location?.toLowerCase().includes(searchText) ||
        row.organizedBy?.toLowerCase().includes(searchText) ||
        row.remarks?.toLowerCase().includes(searchText) ||
        row.startDate?.toLowerCase().includes(searchText) ||
        row.endDate?.toLowerCase().includes(searchText);

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

    const campID = params.data.campID; // 🔁 campID instead of pricePlanID
    const updatedStatus = !(params.data.isActive === true);

    try {
      await api.patch('/MedicalCamp', {
        guidID: campID, // ✅ pass as guidID
        isActive: updatedStatus,
        updatedBy: userID,
      });

      // Update only the selected row in the UI
      const updatedData = rowData.map((item) =>
        item.campID === campID ? { ...item, isActive: updatedStatus } : item,
      );

      setRowData(updatedData);
      setFilteredData(updatedData);

      toast.success('Medical camp status updated successfully!');
    } catch (error: any) {
      console.error(
        'Error updating status:',
        error.response?.data || error.message,
      );
      toast.error('Failed to update camp status. Please try again.');
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

    // Required: Tenant, Hospital
    if (!formData.tenantID) {
      errors.tenantID = 'Tenant is required';
    }
    if (!formData.hospitalID) {
      errors.hospitalID = 'Hospital is required';
    }

    // Common validations
    const alphaOnlyRegex = /^[A-Za-z\s]{1,100}$/;
    const repeatedCharRegex = /^(.)\1+$/;

    // Title
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (!alphaOnlyRegex.test(formData.title)) {
      errors.title = 'Title must contain only alphabets and spaces';
    } else if (repeatedCharRegex.test(formData.title.trim())) {
      errors.title = 'Title cannot have repeated characters';
    }

    // Location
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    } else if (!alphaOnlyRegex.test(formData.location)) {
      errors.location = 'Location must contain only alphabets and spaces';
    } else if (repeatedCharRegex.test(formData.location.trim())) {
      errors.location = 'Location cannot have repeated characters';
    }

    // Organized By
    if (!formData.organizedBy.trim()) {
      errors.organizedBy = 'Organized By is required';
    } else if (!alphaOnlyRegex.test(formData.organizedBy)) {
      errors.organizedBy =
        'Organized By must contain only alphabets and spaces';
    } else if (repeatedCharRegex.test(formData.organizedBy.trim())) {
      errors.organizedBy = 'Organized By cannot have repeated characters';
    }

    // Dates
    if (!formData.startDate) {
      errors.startDate = 'Start Date is required';
    }
    if (!formData.endDate) {
      errors.endDate = 'End Date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        errors.endDate = 'End Date must be after Start Date';
      }
    }

    // Remarks (optional but validate if entered)
    const remarks = formData.remarks.trim();
    const remarksRegex = /^[a-zA-Z0-9\s.,:;'"()\-!?]*$/;
    //const repeatedCharRegex = /^([a-zA-Z0-9])\1{4,}$/; // Example: aaaa, 11111

    if (!remarks) {
      errors.remarks = 'Remarks is required';
    } else if (remarks.length > 250) {
      errors.remarks = 'Remarks must be max 250 characters';
    } else if (!remarksRegex.test(remarks)) {
      errors.remarks = 'Remarks contains invalid characters';
    } else if (repeatedCharRegex.test(remarks)) {
      errors.remarks = 'Remarks cannot be the same character repeated';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Medical Camp
      </h2>
      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add Medical Camp' : 'Edit Medical Camp'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            {/* Row 1: Left - Tenant + Hospital | Right - Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column (Tenant + Hospital) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tenant */}
                <div>
                  <select
                    value={formData.tenantID}
                    onChange={(e) =>
                      setFormData({ ...formData, tenantID: e.target.value })
                    }
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">Select Tenant</option>
                    {tenantList.map((tenant) => (
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
                <div>
                  <select
                    value={formData.hospitalID}
                    onChange={(e) =>
                      setFormData({ ...formData, hospitalID: e.target.value })
                    }
                    disabled={!formData.tenantID}
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">Select Hospital</option>
                    {hospitalList.map((hospital) => (
                      <option
                        key={hospital.hospitalID}
                        value={hospital.hospitalID}
                      >
                        {hospital.hospitalName}
                      </option>
                    ))}
                  </select>
                  {formErrors.hospitalID && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.hospitalID}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column (Title) */}
              <div>
                <input
                  type="text"
                  value={formData.title}
                  maxLength={40}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Title"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Left - Location + OrganizedBy | Right - StartDate + EndDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column (Location + Organized By) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={formData.location}
                    maxLength={50}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Location"
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                  {formErrors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.location}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.organizedBy}
                    maxLength={40}
                    onChange={(e) =>
                      setFormData({ ...formData, organizedBy: e.target.value })
                    }
                    placeholder="Organized By"
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                  {formErrors.organizedBy && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.organizedBy}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column (Start Date + End Date) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <input
                    type={formData.startDate ? 'date' : 'text'}
                    placeholder="Start Date"
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none"
                    value={formData.startDate || ''}
                    min={today} // ⛔ Disallow past dates
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                  {formErrors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <input
                    type={formData.endDate ? 'date' : 'text'}
                    placeholder="End Date"
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none"
                    value={formData.endDate || ''}
                    min={formData.startDate || ''}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                  {formErrors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Remarks full width */}
            <div>
              <textarea
                rows={3}
                maxLength={255}
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder="Remarks"
                className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
              {formErrors.remarks && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.remarks}
                </p>
              )}
            </div>

            {/* Status (Only on Edit Mode) */}
            {formMode === 'Edit' && (
              <div className="flex items-center gap-2">
                <label htmlFor="isActive" className="text-black select-none">
                  Active
                </label>
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
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

   <div className="w-full overflow-x-auto">
  <div className="ag-theme-alpine min-w-[600px]" style={{ height: 'auto' }}>
    <AgGridReact
      rowData={
        filteredData.length > 0 ? applyGlobalSearch(filteredData) : []
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

export default MedicalCamp;
