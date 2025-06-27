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
  smsTemplateID?: string;
  language?: string;
  code?: string;
  name?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
};

const SmsTemplateForm: React.FC = () => {
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
  const [filteredRowData, setFilteredRowData] =
    useState<RowData[]>(filteredData);
  const [hospitalList, setHospitalList] = useState([]);
  const [hospitalMap, setHospitalMap] = useState({});

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [tenantList, setTenantList] = useState([]);

  const [tenantMap, setTenantMap] = useState({});
  const [formData, setFormData] = useState({
    language: '',
    code: '',
    name: '',
    content: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        language: '',
        code: '',
        name: '',
        content: '',
        description: '',
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

  const handleEditClick = (template: RowData) => {
  setFormData({
    smsTemplateID: template.smsTemplateID || '', // ✅ include this line
    language: template.language || '',
    code: template.code || '',
    name: template.name || '',
    content: template.content || '',
    description: template.description || '',
    isActive: template.isActive ?? true,
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

    const now = new Date().toISOString();

    const payload: any = {
      createdBy: userID,
      createdOn: now,
      updatedBy: userID,
      updatedOn: now,
      isActive: formData.isActive ?? true,
      language: formData.language.trim(),
      code: formData.code.trim(),
      name: formData.name.trim(),
      content: formData.content.trim(),
      description: formData.description?.trim() || '',
    };

    let response;
    let message;

    if (formData.smsTemplateID) {
      // ✅ Update flow - PUT with smsTemplateID
      payload.smsTemplateID = formData.smsTemplateID;
      response = await api.put('/SMSTemplate', payload);
      message = 'SMS Template updated successfully!';
    } else {
      // ✅ Create flow - POST
      response = await api.post('/SMSTemplate', payload);
      message = 'SMS Template saved successfully!';
    }

    toast.success(message);
    await refreshTableData();
    resetFormData();
    setShowForm(false);
    setFormErrors({});
  } catch (error: any) {
    console.error(
      'Error saving/updating template:',
      error.response?.data || error.message,
    );
    toast.error('Failed to save/update template. Please try again.');
  }
};

  const refreshTableData = async () => {
    try {
      const response = await api.get('/SMSTemplate');

      if (Array.isArray(response.data)) {
        setRowData([...response.data]);
        setFilteredData([...response.data]);
      } else {
        console.error('Error: response is not an array', response.data);
      }
    } catch (error: any) {
      console.error(
        'Error fetching SMS template data:',
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    refreshTableData();
  }, []);

  const resetFormData = () => {
    setFormData({
      language: '',
      code: '',
      name: '',
      content: '',
      description: '',
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
      headerName: 'Language',
      field: 'language',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 160,
    },
    {
      headerName: 'Code',
      field: 'code',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 140,
    },
    {
      headerName: 'Name',
      field: 'name',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      width: 200,
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
      headerName: 'Content',
      field: 'content',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: false,
      filter: true,
      width: 400,
      tooltipField: 'content', // Show full text on hover
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
        row.language?.toLowerCase().includes(searchText) ||
        row.code?.toLowerCase().includes(searchText) ||
        row.name?.toLowerCase().includes(searchText) ||
        row.content?.toLowerCase().includes(searchText) ||
        row.description?.toLowerCase().includes(searchText);

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

    const smsTemplateID = params.data.smsTemplateID; // 🔁 use smsTemplateID
    const updatedStatus = !(params.data.isActive === true);

    try {
      await api.patch('/SMSTemplate', {
        guidID: smsTemplateID, // ✅ backend expects guidID
        isActive: updatedStatus,
        updatedBy: userID,
      });

      // Update only the selected row in the UI
      const updatedData = rowData.map((item) =>
        item.smsTemplateID === smsTemplateID
          ? { ...item, isActive: updatedStatus }
          : item,
      );

      setRowData(updatedData);
      setFilteredData(updatedData);

      toast.success('SMS Template status updated successfully!');
    } catch (error: any) {
      console.error(
        'Error updating SMS Template status:',
        error.response?.data || error.message,
      );
      toast.error('Failed to update SMS Template status. Please try again.');
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

    // ✅ Allow letters, numbers, special characters (basic), but no emojis
    const textWithSymbolsRegex = /^[\w\s.,:;'"()\-!?@#%&*/\\[\]{}|+=<>~^`$]*$/;
    const codeRegex = /^[A-Za-z][0-9]{1,49}$/;

    // ❌ Prevent repeated characters like aaaa, 1111, !!!!
    const repeatedCharRegex = /(.)\1{2,}/; // 3 or more repeated characters

    // Emoji regex (basic)
    const emojiRegex = /[\u{1F600}-\u{1F6FF}]/u;

    // Language
    if (!formData.language.trim()) {
      errors.language = 'Language is required';
    } else if (!textWithSymbolsRegex.test(formData.language)) {
      errors.language = 'Language contains invalid characters';
    } else if (repeatedCharRegex.test(formData.language)) {
      errors.language = 'Language cannot contain repeated characters';
    } else if (emojiRegex.test(formData.language)) {
      errors.language = 'Language cannot contain emojis';
    }

    // Code
    // Code
    if (!formData.code.trim()) {
      errors.code = 'Code is required';
    } else if (!codeRegex.test(formData.code)) {
      errors.code =
        'Code must start with a letter followed by numbers (e.g., S00011)';
    } else if (repeatedCharRegex.test(formData.code)) {
      errors.code = 'Code cannot contain repeated characters';
    }

    // Name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (!textWithSymbolsRegex.test(formData.name)) {
      errors.name = 'Name contains invalid characters';
    } else if (repeatedCharRegex.test(formData.name)) {
      errors.name = 'Name cannot contain repeated characters';
    } else if (emojiRegex.test(formData.name)) {
      errors.name = 'Name cannot contain emojis';
    }

    // Content
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      errors.content = 'Content must be at least 10 characters';
    } else if (repeatedCharRegex.test(formData.content)) {
      errors.content = 'Content cannot contain repeated characters';
    } else if (!textWithSymbolsRegex.test(formData.content)) {
      errors.content = 'Content contains invalid characters';
    } else if (emojiRegex.test(formData.content)) {
      errors.content = 'Content cannot contain emojis';
    }

    // Description (optional)
    const desc = formData.description.trim();

    if (!desc) {
      errors.description = 'Description is required';
    } else if (desc.length > 250) {
      errors.description = 'Description must be max 250 characters';
    } else if (!textWithSymbolsRegex.test(desc)) {
      errors.description = 'Description contains invalid characters';
    } else if (repeatedCharRegex.test(desc)) {
      errors.description = 'Description cannot contain repeated characters';
    } else if (emojiRegex.test(desc)) {
      errors.description = 'Description cannot contain emojis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        SMS Template
      </h2>
      {showForm && (
        <div
          ref={editFormRef}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'Add' ? 'Add SMS Template' : 'Edit SMS Template'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            {/* Row 1: Language + Code */}
            {/* Row 1: Left (Language + Code), Right (Name) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left half: Language + Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Language */}
                <div>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    placeholder="Language"
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none"
                  />
                  {formErrors.language && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.language}
                    </p>
                  )}
                </div>

                {/* Code */}
                <div>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="Code"
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none"
                  />
                  {formErrors.code && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.code}
                    </p>
                  )}
                </div>
              </div>

              {/* Right half: Name */}
              <div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
            </div>

            {/* Row 2: Description (left) + Content (right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Description */}
              <div>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <textarea
                  rows={1}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Template Content"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none"
                />
                {formErrors.content && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.content}
                  </p>
                )}
              </div>
            </div>

            {/* Status - Show only in Edit Mode */}
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

export default SmsTemplateForm;
