import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface RowData {
  Id: number;
  menuName: string;
  code: string;
  selectedParentMenu: string;
  status: string;
}

const Menus: React.FC = () => {
  const [selectedMenuName, setSelectedMenuName] = useState(""); // For filtering
  const [code, setCode] = useState(""); // For filtering
  const [selectedParentMenu, setSelectedParentMenu] = useState(""); // For filtering
  const [isActive, setIsActive] = useState(false); // Active filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(""); // For global search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [showConfirmation, setShowConfirmation] = useState(false);
 
 
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState<RowData>({
    Id: 0,
    menuName: '',
    code: '',
    parentMenu: '',
    status: 'Active',
  });

  const data: RowData[] = [
    { Id: 1, menuName: "Dashboard", code: "001", parentMenu: "Home", status: "Active" },
    { Id: 2, menuName: "Settings", code: "002", parentMenu: "Admin", status: "Inactive" },
    { Id: 3, menuName: "Reports", code: "003", parentMenu: "Analysis", status: "Active" },
  ];

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

  useEffect(() => {
    setRowData(data); // Initialize data
    setFilteredData(data); // Initialize filtered data
  }, []);

  // Update filtered data whenever quickSearchText or rowData changes
  useEffect(() => {
    setFilteredData(applyGlobalSearch(rowData));
  }, [quickSearchText, rowData]);

  const applyGlobalSearch = (data: RowData[]) => {
    if (!quickSearchText.trim()) return data; // Return all data if search text is empty.
    const lowerCaseSearch = quickSearchText.toLowerCase();
    return data.filter((row) =>
      [row.menuName, row.code, row.parentMenu].some(
        (field) => field?.toLowerCase().includes(lowerCaseSearch)
      )
    );
  };

  const columnDefs: ColDef<RowData, any>[] = [
    { headerName: 'ID', field: 'Id', sortable: true, filter: true, width: 100, headerClass: 'text-left' },
    { headerName: 'Menu', field: 'menuName', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
    { headerName: 'Code', field: 'code', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
    { headerName: 'Parent Menu', field: 'parentMenu', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
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
      cellStyle: { textAlign: 'center' },
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
      cellStyle: { textAlign: 'center' },
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
  };

  const handleDelete = (Id: number) => {
    const updatedData = rowData.filter(item => item.Id !== Id);
    setRowData(updatedData);
  };
  const handleDeleteClick = (row) => {
    setSelectedRow(row); 
    setShowConfirmation(true); 
  };

  const confirmDelete = () => {
    if (selectedRow) {
      // Remove the row from the data (you can implement your deletion logic here)
      setRowData(rowData.filter((row) => row.id !== selectedRow.id));
    }
    setShowConfirmation(false); // Hide the modal after deletion
  };

  const cancelDelete = () => {
    setShowConfirmation(false); // Simply hide the modal without doing anything
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
      const newData = { ...formData, Id: rowData.length + 1 };
      setRowData([...rowData, newData]);
    } else {
      const updatedData = rowData.map(item =>
        item.Id === formData.Id ? { ...item, ...formData } : item
      );
      setRowData(updatedData);
    }
    setShowForm(false);
    setFormData({
      Id: 0,
      menuName: '',
      code: '',
      parentMenu: '',
      status: 'Active',
    });
  };

  const handleFilterSearch = () => {
    const filteredData = data.filter((menu) => {
      return (
        (selectedMenuName === "" || menu.menuName === selectedMenuName) &&
        (code === "" || menu.code === code) &&
        (selectedParentMenu === "" || menu.parentMenu === selectedParentMenu)
      );
    });
    setFilteredData(filteredData);
  };

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Menus</h2>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {/* Menu Name Input */}
        <input
          type="text"
          placeholder="Menu Name"
          value={selectedMenuName}
          onChange={(e) => setSelectedMenuName(e.target.value)}
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        />

        {/* Code Input */}
        <input
          type="text"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        />

        {/* Parent Menu Dropdown */}
        <select
          value={selectedParentMenu}
          onChange={(e) => setSelectedParentMenu(e.target.value)}
          className="w-48 rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        >
          <option value="">Select Parent Menu</option>
          <option value="parent1">Parent Menu 1</option>
          <option value="parent2">Parent Menu 2</option>
          <option value="parent3">Parent Menu 3</option>
        </select>

        {/* Active Checkbox */}
        <label className="text-black flex items-center w-fit cursor-pointer">
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
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
          onClick={handleFilterSearch}
        >
          Search
        </button>
      </div>

      <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {/* Table and Other Components */}
     

      {showForm && (
        <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none mt-4">
          <h3 className="text-xl font-semibold mb-4">
            {formData.Id === 0 ? 'Add New Data' : 'Edit Data'}
          </h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 mb-2">
              {/* Menu Name Input */}
              <input
                type="text"
                value={formData.menuName}
                onChange={(e) => setFormData({ ...formData, menuName: e.target.value })}
                placeholder="Menu Name"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />

              {/* Code Input */}
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Code"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />

              {/* Parent Menu Dropdown */}
              <select
                value={formData.selectedParentMenu}
                onChange={(e) => setFormData({ ...formData, selectedParentMenu: e.target.value })}
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">Select Parent Menu</option>
                <option value="parent1">Parent Menu 1</option>
                <option value="parent2">Parent Menu 2</option>
                <option value="parent3">Parent Menu 3</option>
              </select>

              {/* Active Checkbox */}
              <label className="text-black flex items-center w-fit cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-md relative mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-gradient-to-b checked:from-[#004A99] checked:to-[#007BFF] checked:border-[#007BFF] checked:after:content-['✔️'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white"
                />
                <span>Active</span>
              </label>
            </div>

            <div className="mt-4 flex gap-4">
              {/* Submit Button */}
              <button
                type="submit"
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                {formData.Id === 0 ? 'Add' : 'Update'}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
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
                       
           onClick={() => {
            setShowForm(true);
            setFormData({
              Id: 0,  // Reset Id to 0 for Add action
              menuName: '',
              code: '',
              selectedParentMenu: '',
              isActive: false,
            });
          }}
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
      {/* Deletion Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={confirmDelete}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
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

export default Menus;
