import React, { useState, useEffect, useRef } from 'react';  
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';


interface RowData {
  id: number;
  name: string;
  code: string;
  displayValue: string;
  status: string;
}

const LovMasters: React.FC = () => {
  const [type, setType] = useState(''); // Type filter for UI
  const [Name, setName] = useState('');
  const [code, setCode] = useState(''); // Code filter for UI
  const [isActive, setIsActive] = useState(false); // Active filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(""); // For global search
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RowData>({
    id: 0,
    name: '',
    code: '',
    displayValue: '',
    status: 'Active',
  });

  // Sample data
  const initialData: RowData[] = [
    { id: 1, name: 'Demo Name 1', code: 'ABC123', displayValue: 'Demo Value 1', status: 'Active' },
    { id: 2, name: 'Demo Name 2', code: 'XYZ456', displayValue: 'Demo Value 2', status: 'Inactive' },
    { id: 3, name: 'Demo Name 3', code: 'LMN789', displayValue: 'Demo Value 3', status: 'Active' },
  ];

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

  useEffect(() => {
    setRowData(initialData); // Setting initial data
    setFilteredData(initialData); // Set the same data as filtered initially
  }, []);

  // Column Definitions for AG Grid
  const columnDefs: ColDef[] = [
    { 
      headerName: 'S.No', 
      field: 'id', 
      flex: 0.5, 
      sortable: true, 
      filter: true, 
      headerClass: 'text-left',
    },
    { 
      headerName: 'Name', 
      field: 'name', 
      flex: 1, 
      sortable: true, 
      filter: true, 
      headerClass: 'text-left',
    },
    { 
      headerName: 'Code', 
      field: 'code', 
      flex: 1, 
      sortable: true, 
      filter: true, 
      headerClass: 'text-center',

    },
    { 
      headerName: 'Display Value', 
      field: 'displayValue', 
      flex: 1.5, 
      sortable: true, 
      filter: true, 
      headerClass: 'text-center',
      
    },
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
      field: 'edit',
      flex: 0.5,
      headerClass: 'text-center',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEdit(params)}
          className="cursor-pointer text-blue-500 font-bold"
        >
          Edit
        </span>
      ),
    },
    {
      headerName: 'Delete',
      field: 'delete',
      flex: 0.5,
      headerClass: 'text-center ',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
    },
  ];

  // Toggles the status of a row between Active/Inactive
  const toggleStatus = (params: any) => {
    const updatedData = rowData.map(item =>
      item.id === params.data.id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    );
    setRowData(updatedData);
    setFilteredData(updatedData);
  };

  // Handles the delete button click
  const handleDelete = (params: any) => {
    setDeleteRowId(params.data.id);
    setShowConfirmation(true); // Show the confirmation message box
  };

  // Confirm the deletion and update the data
  const confirmDelete = () => {
    const updatedData = rowData.filter(item => item.id !== deleteRowId);
    setRowData(updatedData);
    setFilteredData(updatedData);
    setShowConfirmation(false); // Hide the confirmation box after deletion
    setDeleteRowId(null); // Reset the delete row ID
  };

  // Cancel the deletion
  const cancelDelete = () => {
    setShowConfirmation(false); // Hide the confirmation box
    setDeleteRowId(null); // Reset the delete row ID
  };


  const handleEdit = (params: any) => {
    setFormData(params.data); // Set the data of the row to the form
    setShowForm(true); // Show the form for editing
  };

  // Handles the form submission to update the row data
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    if (formData.id === 0) {
      // Add new data
      const newData = { ...formData, id: rowData.length + 1 }; // Generate a new ID
      setRowData([...rowData, newData]);
      setFilteredData([...rowData, newData]);
    } else {
      // Update existing data
      const updatedData = rowData.map(item =>
        item.id === formData.id ? { ...item, ...formData } : item
      );
      setRowData(updatedData);
      setFilteredData(updatedData);
    }

    setShowForm(false); // Hide the form after submitting
    setFormData({ id: 0, name: '', code: '', displayValue: '', status: 'Active' }); // Reset form
  };

  // Filters the rows based on Type, Code, and Active status
  const handleFilterSearch = () => {
    if (isActive) {
      console.log('Active filter applied, but not updating table data');
      return; 
    }
    const filtered = initialData.filter(item =>
      (type ? item.name.toLowerCase().includes(type.toLowerCase()) : true) &&
      (code ? item.code.toLowerCase().includes(code.toLowerCase()) : true) &&
      (isActive ? item.status === 'Active' : true)
    );
    setRowData(filtered);
    setFilteredData(filtered); // Reset the filteredData to the new filtered rows
  };

  // Apply the global search filter to the data
  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.name.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.code.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.displayValue.toLowerCase().includes(quickSearchText.toLowerCase())
    );
  };
  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit(); // Ensure columns fit the grid width
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Lov Masters</h2>

      {/* Filters Section (Type, Code, Active) */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Select Type</option>
          <option value="type1">Type 1</option>
          <option value="type2">Type 2</option>
        </select>

        {/* Name Filter */}
        <input
          type="text"
          placeholder="Name"
          value={Name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        {/* Code Filter */}
        <input
          type="text"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        {/* Active Status Checkbox */}
        <label className="text-black dark:text-black flex items-center w-fit cursor-pointer">
  <input
    type="checkbox"
    checked={isActive}
    onChange={(e) => setIsActive(e.target.checked)}
    className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-md relative mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-gradient-to-b checked:from-[#004A99] checked:to-[#007BFF] checked:border-[#007BFF] checked:after:content-['✔️'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white"
  />
  <span>Active</span>
</label>



        {/* Search Button */}
        <button
       className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
       hover:from-[#007BFF] hover:to-[#004A99]
       text-white transition duration-150 
       ease-out hover:ease-in py-2 px-5 rounded-lg"
          onClick={handleFilterSearch}  
        >
          Search
        </button>
      </div>

      <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {/* Conditional Form for Adding or Editing Rows */}
      {showForm && (
        <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
          <h3 className="text-xl font-semibold mb-4">{formData.id === 0 ? 'Add New Data' : 'Edit Data'}</h3> {/* Conditional Title */}
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Code"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <input
                type="text"
                value={formData.displayValue}
                onChange={(e) => setFormData({ ...formData, displayValue: e.target.value })}
                placeholder="Display Value"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                hover:from-[#007BFF] hover:to-[#004A99]
                text-white transition duration-150 
                ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                {formData.id === 0 ? 'Add' : 'Update'}
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

      {/* Global Search and Add Button in the Same Row */}
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
  
    <div className="mb-4"> {/* Fixed div closing here */}
    <button
       className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
       hover:from-[#007BFF] hover:to-[#004A99]
       text-white transition duration-150 
       ease-out hover:ease-in py-2 px-5 rounded-lg"
      onClick={() => setShowForm(true)}
    >
      + Add
      </button>
       </div> {/* Added closing div here */}
       </div> 
       
      {/* Table Component */}
      <div
        className="ag-theme-alpine mt-6 w-fit"
        style={{ height: '400px', width: '100%' }}
      >
        <AgGridReact
         rowData={applyGlobalSearch(filteredData)}
         columnDefs={columnDefs}
         pagination={true}
         paginationPageSize={10}
         domLayout="autoHeight"
         headerHeight={40} // Adjust header height
         rowHeight={40} // Adjust row height
         onGridReady={onGridReady}
        />
      </div>
      {/* Conditional Confirmation Message Box */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={confirmDelete}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in rounded px-5 py-2 mt-2 w-fit text-center"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gradient hover:to-[#004A99] text-black transition duration-150 ease-out hover:ease-in rounded px-5 py-2 mt-2 w-fit text-center"
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

export default LovMasters;
