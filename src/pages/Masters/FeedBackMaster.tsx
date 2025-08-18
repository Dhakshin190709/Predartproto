import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import CustomButton from '../../components/CustomButton';

interface RowData {
  Id: number;
  feedbackTitle: string;
  status: string;
}

const Role: React.FC = () => {
  const [name, setName] = useState(''); // Role Name filter for UI
  const [isActive, setIsActive] = useState(false); // Active filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(""); // For global search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [showConfirmation, setShowConfirmation] = useState(false); // Show confirmation for deletion
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null); // ID of row to delete
  const [formData, setFormData] = useState<RowData>({
    Id: 0,
    feedbackTitle: '',
    status: 'Active',
  });
  

  const initialData: RowData[] = [
    { Id: 1, feedbackTitle: 'Feedback 1', status: 'Active' },
    { Id: 2, feedbackTitle: 'Feedback 2', status: 'Inactive' },
    { Id: 3, feedbackTitle: 'Feedback 3', status: 'Active' },
  ];
  

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

  useEffect(() => {
    setRowData(initialData);
    setFilteredData(initialData);
  }, []);

  const columnDefs: ColDef<RowData, any>[] = [
    { headerName: 'ID', field: 'Id', sortable: true, filter: true, width: 100, headerClass: 'text-left' },
    { headerName: 'Feedback Title', field: 'feedbackTitle', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
    {
      headerName: 'Status',
      field: 'status',
      flex: 1,
      headerClass: 'text-center',
     
      cellRenderer: (params: any) => (
        <span
          onClick={() => toggleStatus(params)}
          className={`cursor-pointer font-bold ${params.value === 'Active' ? 'text-green-500' : 'text-red-400'} hover:underline`}
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'Edit',
      flex: 0.5,
      headerClass: 'text-center',
     
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEdit(params.data.Id)}
          className="cursor-pointer text-blue-500 font-bold"
        >
          Edit
        </span>
      ),
    },
    {
      headerName: 'Delete',
      flex: 0.5,
      headerClass: 'text-center',
     
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.Id)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
      suppressSizeToFit: true,
      width: 150,
    },
  ];

  const toggleStatus = (params: any) => {
    const updatedData = rowData.map(item =>
      item.Id === params.data.Id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    );
    setRowData(updatedData);
    setFilteredData(updatedData);
  };

  const handleDelete = (Id: number) => {
    setDeleteRowId(Id);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    const updatedData = rowData.filter(item => item.Id !== deleteRowId);
    setRowData(updatedData);
    setFilteredData(updatedData);
    setShowConfirmation(false);
    setDeleteRowId(null);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeleteRowId(null);
  };

  const handleEdit = (Id: number) => {
    const rowToEdit = rowData.find(row => row.Id === Id);
    if (rowToEdit) {
      setFormData(rowToEdit);
      setShowForm(true);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Id === 0) {
      // Adding new data
      const newData = { ...formData, Id: rowData.length + 1 }; // Automatically generate new ID
      setRowData([...rowData, newData]);
      setFilteredData([...rowData, newData]);
    } else {
      // Updating existing data
      const updatedData = rowData.map(item =>
        item.Id === formData.Id ? { ...item, feedbackTitle: formData.feedbackTitle, status: formData.status } : item
      );
      setRowData(updatedData);
      setFilteredData(updatedData);
    }
  
    setShowForm(false);
    setFormData({
      Id: 0,
      feedbackTitle: '',
      status: 'Active', // Default status when resetting the form
    });
  };
  

 
  const handleFilterSearch = () => {
    const filtered = initialData.filter(item =>
      (name ? item.feedbackTitle.toLowerCase().includes(name.toLowerCase()) : true) &&
      (isActive ? item.status === 'Active' : true)
    );
    setRowData(filtered);
    setFilteredData(filtered);
  };
  
  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.feedbackTitle.toLowerCase().includes(quickSearchText.toLowerCase())
    );
  };
  
  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">FeedBack Master</h2>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Feeback Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        />
        
        
        <CustomButton onClick={handleFilterSearch}>Search</CustomButton>
      </div>

      <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {showForm && (
        <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none">
          <h3 className="text-xl font-semibold mb-4">{formData.Id === 0 ? 'Add New FeedBack' : 'Edit FeedBack'}</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <input
                type="text"
                value={formData.feedbackTitle}
                onChange={(e) => setFormData({ ...formData, feedbackTitle: e.target.value })}
                placeholder="FeedBack Title"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
             
              
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                hover:from-[#007BFF] hover:to-[#004A99]
                text-white transition duration-150 
                ease-out hover:ease-in py-2 px-5 rounded-lg"
                            
              >
                {formData.Id === 0 ? 'Add' : 'Update'}
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
                            viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.5"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z" fill=""></path><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill=""></path></g></svg>
  </span>
  </div>
  
        <button
           className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
           hover:from-[#007BFF] hover:to-[#004A99]
           text-white transition duration-150 
           ease-out hover:ease-in py-2 px-5 rounded-lg"
                       
          onClick={() => setShowForm(true)}
        >
          + Add
        </button>
      </div>



      {/* AgGrid Table */}
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          gridOptions={{}}
          domLayout="autoHeight"
          rowData={applyGlobalSearch(filteredData)}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
        />
      </div>

      
      {/* Deletion Confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={confirmDelete}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                hover:from-[#007BFF] hover:to-[#004A99]
                text-white transition duration-150 
                ease-out hover:ease-in py-2 px-5 rounded-lg"
                            
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
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
    </div>
  );
};

export default Role;
