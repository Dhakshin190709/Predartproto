import React, { useState, useEffect, useRef } from 'react';  
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';


interface RowData {
  id: number;
  patientName: string;
  patientId: string; // Appointment ID
  mobileNumber: string;  // Mobile Number
  fromDate: string;      // From Date
  toDate: string;        // To Date
}

const initialData: RowData[] = [
  {
    id: 1,
    patientName: 'John Doe',
    patientId: 'PAT001',
    mobileNumber: '1234567890',
    fromDate: '2024-12-01',
    toDate: '2024-12-10',
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    patientId: 'PAT002',
    mobileNumber: '9876543210',
    fromDate: '2024-12-05',
    toDate: '2024-12-15',
  },
  {
    id: 3,
    patientName: 'Alice Johnson',
    patientId: 'PAT003',
    mobileNumber: '1122334455',
    fromDate: '2024-12-10',
    toDate: '2024-12-20',
  },
];

const PatientHistory: React.FC = () => {
  const [type, setType] = useState(''); // Type filter for UI
  // State for filter form
const [filterPatientName, setFilterPatientName] = useState('');
const [filterPatientId, setFilterPatientId] = useState('');
const [filterMobileNumber, setFilterMobileNumber] = useState('');
const [filterFromDate, setFilterFromDate] = useState('');
const [filterToDate, setFilterToDate] = useState('');




  
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(""); // For global search
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    id: 0, // Default to 0 for "Add New Data"
    patientId: '',
    patientName: '',
    
    mobileNumber: '',
    fromDate: '',
    toDate: '',
    
  });
  
 
 


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
      headerClass: 'text-center',
    },
    { 
      headerName: 'Patient ID', 
      field: 'patientId', 
      flex: 1, 
      sortable: true, 
      filter: true, 
      headerClass: 'text-center',
     
    },

    { 
      headerName: 'Patient Name', 
      field: 'patientName', 
      flex: 1, 
      sortable: true, 
      filter: true, 
      headerClass: 'text-center',
    },
   
    { 
      headerName: 'Mobile Number', 
      field: 'mobileNumber', 
      flex: 1, 
      sortable: true, 
      filter: true, 
      headerClass: 'text-center',
      
    },
    { 
      headerName: 'Date', 
      field: 'fromDate', 
      flex: 1, 
      sortable: true, 
      filter: true, 
      headerClass: 'text-center',
      
    },
    
  ];
  

 
  

  

  // Handles the form submission to update the row data
 const handleFormSubmit = (e) => {
  e.preventDefault();

  // Create the new data object
  const newData = {
    id: Date.now(), // Unique ID for the new data
    name: formData.patientName,
    appointmentId: formData.patientId,
    mobileNumber: formData.mobileNumber,
    fromDate: formData.fromDate,
    toDate: formData.toDate,
  };

  
  // Reset the form inputs
  setFormData({
    id: 0, // Reset to initial state for "Add New Data"
    patientName: '',
    patientId: '',
    mobileNumber: '',
    fromDate: '',
    toDate: '',
    
  });

  setShowForm(false); // Hide the form after submission
};



  // Apply the global search filter to the data
  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.patientName.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.patientId.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.mobileNumber.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.fromDate.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.toDate.toLowerCase().includes(quickSearchText.toLowerCase())
    );
  };
  
  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit(); // Ensure columns fit the grid width
  };

  const handleFilterSearch = () => {
    const filtered = initialData.filter(item => {
      const matchesName = filterPatientName ? item.patientName.toLowerCase().includes(filterPatientName.toLowerCase()) : true;
      const matchesAppointmentId = filterPatientId ? item.patientId.toString().includes(filterPatientId) : true;
      const matchesMobile = filterMobileNumber ? item.mobileNumber.toString().includes(filterMobileNumber) : true;
      const matchesFromDate = filterFromDate ? new Date(item.fromDate) >= new Date(filterFromDate) : true;
      const matchesToDate = filterToDate ? new Date(item.toDate) <= new Date(filterToDate) : true;
  
      return (
        matchesName &&
        matchesAppointmentId &&
        matchesMobile &&
        matchesFromDate &&
        matchesToDate
      );
    });
  
    setRowData(filtered); // Update the displayed data in the table
    setFilteredData(filtered); // Optionally update a filtered state if required
  };
  
  
  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Family Medical History</h1>
     

      <div className="rounded-lg border border-stroke bg-transparent py-4 px-6 text-gray-400 shadow-md">
          <div className="text-center font-semibold" style={{ color: '#bcc2be' }}>
          Patient ID: PAT001 | Patient Name: John Doe | Mobile Number: 1234567890 | Date: 2024-12-09  
          </div>
        </div>

    
    


    <hr className="border-t-2 border-stroke bg-transparent my-6" />

   

      {/* Global Search and Add Button in the Same Row */}
      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
      <div className="relative">
  <select
    value={filterPatientId}
    onChange={(e) => setFilterPatientId(e.target.value)}
    className="sm:w-60 w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  >
    <option value="" disabled>Select Relationship</option>
    <option value="Father">Father</option>
    <option value="Mother">Mother</option>
    <option value="Brother">Brother</option>
    <option value="Sister">Sister</option>
    <option value="Spouse">Spouse</option>
    <option value="Other">Other</option>
  </select>
  
</div>


  <div className="relative">
  <input
    type="text"
    placeholder="From Date (dd-mm-yyyy)..."
    value={filterFromDate}
    onChange={(e) => setFilterFromDate(e.target.value)}
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

<div className="relative">
  <input
    type="text"
    placeholder="To Date (dd-mm-yyyy)..."
    value={filterToDate}
    onChange={(e) => setFilterToDate(e.target.value)}
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
     

      
    </div>
  );
};

export default PatientHistory;
