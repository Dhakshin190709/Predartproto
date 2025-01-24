import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface RowData {
  Id: number;
  visitorName: string;
 
  gender: string;
  age: number;
  fromDate: string;
  toDate: string;
}

const VisitorPass: React.FC = () => {
  const [name, setName] = useState(''); // Name filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(''); // For global search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing

  const [formData, setFormData] = useState<RowData>({
    Id: 0,
    visitorName: '',
    
    gender: '',
    age: 0,
    fromDate: '',
    toDate: '',
  });

  const [selectedPatient, setSelectedPatient] = useState(''); // State for selected patient
  const [gender, setGender] = useState(''); // State for gender filter
  const [age, setAge] = useState(0); // State for age filter
  const [fromDate, setFromDate] = useState(''); // State for From Date filter
  const [toDate, setToDate] = useState(''); // State for To Date filter
const [filterFromDate, setFilterFromDate] = useState('');
const [filterToDate, setFilterToDate] = useState('');
  const initialData: RowData[] = [
    { Id: 1, visitorName: 'John Doe', gender: 'Male', age: 29, fromDate: '2024-01-01', toDate: '2024-01-10' },
    { Id: 2, visitorName: 'Jane Smith', gender: 'Female', age: 34, fromDate: '2024-01-05', toDate: '2024-01-15' },
    { Id: 3, visitorName: 'Michael Johnson',gender: 'Male', age: 40, fromDate: '2024-01-08', toDate: '2024-01-20' },
  ];

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

  useEffect(() => {
    setRowData(initialData);
    setFilteredData(initialData);
  }, []);

  const columnDefs: ColDef<RowData, any>[] = [
    { headerName: 'ID', field: 'Id', sortable: true, filter: true, flex: 1, headerClass: 'text-left', cellClass: 'left' },
    { headerName: 'Visitor Name', field: 'visitorName', sortable: true, filter: true, flex: 1.5, headerClass: 'text-left', cellClass: 'left' },
   
    { headerName: 'Gender', field: 'gender', sortable: true, filter: true, flex: 1, headerClass: 'text-left', cellClass: 'left' },
    { headerName: 'Age', field: 'age', sortable: true, filter: true, flex: 1, headerClass: 'text-left', cellClass: 'left' },
    { headerName: 'From Date', field: 'fromDate', sortable: true, filter: true, flex: 1.5, headerClass: 'text-left', cellClass: 'left' },
    { headerName: 'To Date', field: 'toDate', sortable: true, filter: true, flex: 1.5, headerClass: 'text-left', cellClass: 'left' },
  ];

  const handleEdit = (Id: number) => {
    const rowToEdit = rowData.find(row => row.Id === Id);
    if (rowToEdit) {
      setFormData(rowToEdit);
      setShowForm(true);
    }
  };

  const handleFilterSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter logic based on formData
    const filteredResults = rowData.filter((item) => {
      return (
        (!selectedPatient || item.visitorName === selectedPatient) &&
        (!gender || item.gender === gender) &&
        (!age || item.age === age) &&
        (!fromDate || new Date(item.fromDate) >= new Date(fromDate)) &&
        (!toDate || new Date(item.toDate) <= new Date(toDate))
      );
    });

    // Update the filtered data state
    setFilteredData(filteredResults);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Id === 0) {
      const newData = { ...formData, Id: rowData.length + 1 };
      setRowData([...rowData, newData]);
      setFilteredData([...rowData, newData]);
    } else {
      const updatedData = rowData.map(item =>
        item.Id === formData.Id ? { ...item, ...formData } : item
      );
      setRowData(updatedData);
      setFilteredData(updatedData);
    }

    setShowForm(false);
    setFormData({
      Id: 0,
      visitorName: '',
     
      gender: '',
      age: 0,
      fromDate: '',
      toDate: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.visitorName.toLowerCase().includes(quickSearchText.toLowerCase()) 
      
    );
  };

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Visitors Pass</h2>

      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {/* Select Patient Dropdown */}
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        >
          <option value="">Select Patient</option>
          <option value="patient1">Patient 1</option>
          <option value="patient2">Patient 2</option>
          <option value="patient3">Patient 3</option>
        </select>

        <input
  type="text" // Use text for custom placeholder functionality
  value={filterFromDate}
  onFocus={(e) => (e.target.type = "date")} // Change type to date on focus
  onBlur={(e) => (e.target.type = filterFromDate ? "date" : "text")} // Retain date format if value exists
  placeholder="From Date"
  onChange={(e) => setFilterFromDate(e.target.value)} 
  className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
  text-black outline-none focus:border-primary dark:border-form-strokedark 
  dark:bg-form-input dark:text-white dark:focus:border-primary"
/>


{/* To Date Filter */}
<input
  type="text" // Use text for custom placeholder functionality
  value={filterToDate}
  onFocus={(e) => (e.target.type = "date")} // Change type to date on focus
  onBlur={(e) => (e.target.type = filterToDate ? "date" : "text")} // Retain date format if value exists
  placeholder="To Date"
  onChange={(e) => setFilterToDate(e.target.value)} 
  className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
  text-black outline-none focus:border-primary dark:border-form-strokedark 
  dark:bg-form-input dark:text-white dark:focus:border-primary"
/>
        
        

        {/* Search Button */}
        <button
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
          onClick={handleFilterSearch}
        >
          Search
        </button>
      </div>
      <hr className="border-t-2 border-stroke bg-transparent my-6" />
      

      {/* Add/Edit Visitor Form */}
      {showForm && (
  <div className="mt-6 p-6 bg-gray-100 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
    <h3 className="text-xl font-semibold">{formData.Id === 0 ? 'Add New Visitor' : 'Edit Visitor'}</h3>
    <form onSubmit={handleFormSubmit}>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* First Row with 3 Fields */}
        <div>
         
          <input
            type="text"
            name="visitorName"
            placeholder='Visitor Name'
            value={formData.visitorName}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            required
          />
        </div>
        <div>
         
          <select
            name="gender"
            value={formData.gender}
            onChange={handleSelectChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
         
          <input
            type="number"
            name="age"
            value={formData.age}
            placeholder='Age'
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            required
          />
        </div>

        {/* Second Row with 2 Fields and an Empty Column */}
        <div>
        
        <input
  type="text" // Use text for custom placeholder functionality
  value={filterFromDate}
  onFocus={(e) => (e.target.type = "date")} // Change type to date on focus
  onBlur={(e) => (e.target.type = filterFromDate ? "date" : "text")} // Retain date format if value exists
  placeholder="From Date"
  onChange={(e) => setFilterFromDate(e.target.value)} 
  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
  text-black outline-none focus:border-primary dark:border-form-strokedark 
  dark:bg-form-input dark:text-white dark:focus:border-primary"
/>
</div>
<div>
{/* To Date Filter */}
<input
  type="text" // Use text for custom placeholder functionality
  value={filterToDate}
  onFocus={(e) => (e.target.type = "date")} // Change type to date on focus
  onBlur={(e) => (e.target.type = filterToDate ? "date" : "text")} // Retain date format if value exists
  placeholder="To Date"
  onChange={(e) => setFilterToDate(e.target.value)} 
  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
  text-black outline-none focus:border-primary dark:border-form-strokedark 
  dark:bg-form-input dark:text-white dark:focus:border-primary"
/>
        
        </div>

        {/* Empty column in third row */}
        <div></div>
      </div>

      <button
        type="submit"
        className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in mt-4 py-2 px-5 rounded-lg"
      >
        {formData.Id === 0 ? 'Add Visitor' : 'Update Visitor'}
      </button>
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
  
        <button className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
          onClick={() => setShowForm(true)}
        >
          + Add
        </button>
      </div>
      {/* Ag-Grid Table */}
      <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={applyGlobalSearch(filteredData)}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default VisitorPass;
