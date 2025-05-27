import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import autoTable from 'jspdf-autotable';



import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Modal from 'react-modal'; // Ensure you have installed react-modal
import {
  FaSearch,
  FaFileDownload,
  FaFileExcel,
  FaFileWord,
  FaFileCsv,
  FaFilePdf,
} from 'react-icons/fa';
import CustomButton from '../../components/CustomButton';
import api from '../../api/request';

const AppointmentReport: React.FC = () => {
  const [hospitalName, setHospitalName] = useState<string>('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorID, setSelectedDoctorID] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalID, setSelectedHospitalID] = useState('');
  const [patientId, setPatientId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [appointmentName, setAppointmentName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [quickSearchText, setQuickSearchText] = useState(''); // Global search state
  const [filterFromDate, setFilterFromDate] = useState('');
  const [statusMapping, setStatusMapping] = useState({});
  const [toWhomMapping, setToWhomMapping] = useState({});
  const [exportData, setExportData] = useState<any[]>([]);
  const [filterToDate, setFilterToDate] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [statusID, setStatusID] = useState('');

  const [rowData, setRowData] = useState<any[]>([]); // Sample appointment data
  const doctorID = sessionStorage.getItem('doctorID');

 
const handleSearch = async () => {
  const role = sessionStorage.getItem('roleName')?.toLowerCase();

  const storedUnitID = sessionStorage.getItem('unitID');
  const storedDoctorID = sessionStorage.getItem('doctorID');

  const hospitalID = role === 'doctor' ? storedUnitID : selectedHospitalID;
  const doctorID = role === 'doctor' ? storedDoctorID : selectedDoctorID;

  // Build query params object instead of string
  let params: Record<string, string> = {};

  if (hospitalID) {
    params.HospitalID = hospitalID;
  }

  if (doctorID) {
    params.DoctorID = doctorID;
  }

  // Determine if all filters are filled
  const hasFullFilter =
    hospitalID &&
    doctorID &&
    selectedStatus &&
    filterFromDate &&
    filterToDate;

  if (hasFullFilter) {
    params.StatusID = selectedStatus;
    params.StartDate = filterFromDate;
    params.EndDate = filterToDate;
  } else {
    if (selectedStatus) {
      params.StatusID = selectedStatus;
    }

    if (filterFromDate && filterToDate) {
      params.StartDate = filterFromDate;
      params.EndDate = filterToDate;
    } else if (filterFromDate && doctorID && hospitalID) {
      params.StartDate = filterFromDate;
    }
  }

  let hasAnyFilter = false;

  if (role === 'doctor') {
    hasAnyFilter = !!selectedStatus || !!filterFromDate || !!filterToDate;
  } else if (role === 'reception' || role === 'hostitaladmin') {
    hasAnyFilter = !!selectedStatus || !!filterFromDate || !!filterToDate || !!doctorID;
  } else {
    hasAnyFilter = !!selectedStatus || !!filterFromDate || !!filterToDate || !!doctorID || !!hospitalID;
  }

  if (!hasAnyFilter) {
    toast.warning('Please select at least one filter before searching.');
    return;
  }

  try {
    // Using axios with params object automatically encodes query parameters
    const response = await api.get('/Appointment/AppointmentReport', { params });
    console.log('Search Results:', response.data);
    setRowData(response.data);
  } catch (error) {
    console.error('Error fetching appointment report:', error);
    toast.error('Failed to fetch appointment report. Please try again later.');
  }
};


  const handleReset = () => {
  const role = sessionStorage.getItem('roleName')?.toLowerCase();

  setSelectedStatus('');
  setFilterFromDate('');
  setFilterToDate('');

  if (role !== 'doctor') {
    setSelectedDoctorID('');
  }

  // Only reset hospital if it's not prefilled (for doctor role, hospital is prefilled and disabled)
  const isHospitalPrefilled = !!sessionStorage.getItem('unitID');
  if (!isHospitalPrefilled && role !== 'doctor') {
    setSelectedHospitalID('');
  }

  setRowData([]);
  fetchAppointmentReport();
};

  
  
  
  const applyGlobalSearch = (data: any[]) => {
    if (!quickSearchText.trim()) return data;

    const lowerSearch = quickSearchText.toLowerCase();

    return data.filter((item) => {
      return Object.entries(item).some(([key, value]) => {
        let displayValue = String(value);

        // Special handling for statusID
        if (key === 'statusID') {
          displayValue = statusMapping[value] || 'Unknown';
        }

        // Special handling for appointmentDate
        if (key === 'appointmentDate' && value) {
          const date = new Date(value);
          displayValue = date.toLocaleDateString('en-GB');
        }

        // Special handling for toWhom
        if (key === 'toWhom') {
          displayValue = toWhomMapping[value] || 'Unknown';
        }

        return displayValue.toLowerCase().includes(lowerSearch);
      });
    });
  };

  const handleDownload = (format: string, data: any[]) => {
    if (!data || data.length === 0) {
      alert('No data available to download.');
      return;
    }
  
    const selectedFields = [
      'doctorName',
      'doctorEmail',
      'doctorPhoneNumber',
      'patientName',
      'patientGender',
      'patientDateOfBirth',
      'patientEmail',
      'patientPhoneNumber',
      'hospitalName'
    ];
  
    const filteredData = data.map(item => {
      const filteredItem: any = {};
      selectedFields.forEach(key => {
        filteredItem[key] = item[key] || '';
      });
      return filteredItem;
    });
  
    switch (format) {
      case 'Excel':
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'data.xlsx');
        break;
  
      case 'CSV':
        const csvSheet = XLSX.utils.json_to_sheet(filteredData);
        const csvOutput = XLSX.utils.sheet_to_csv(csvSheet);
        saveAs(new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' }), 'data.csv');
        break;
  
        case 'PDF':
          const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'A4',
          });
        
          autoTable(doc, {
            head: [selectedFields],
            body: filteredData.map(row => selectedFields.map(key => row[key] ?? '')),
            columnStyles: selectedFields.reduce((styles, key, index) => {
              styles[index] = { cellWidth: 'auto' }; // or a number like 70
              return styles;
            }, {} as Record<number, { cellWidth: string | number }>),
            styles: {
              fontSize: 8,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [22, 160, 133],
              textColor: 255,
              fontStyle: 'bold',
            },
          });
        
          doc.save('data.pdf');
          break;
        
        
        
        
      
  
      default:
        alert('Unsupported format');
    }
  
    setIsModalVisible(false);
  };
  
  
  

  const [roleName, setRoleName] = useState<string | null>(null);

 useEffect(() => {
  const fetchHospitals = async () => {
    try {
      const response = await api.get('/Hospital/List');
      const data = response.data;

      // Filter only active hospitals
      const activeHospitals = data.filter(
        (hospital) => hospital.isActive === true,
      );

      setHospitals(activeHospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  fetchHospitals();
}, []);

 useEffect(() => {
  const fetchDoctors = async () => {
    if (!selectedHospitalID) return; // Wait until hospital is selected

    try {
      const response = await api.get('/Doctor', {
        params: { hospitalId: selectedHospitalID },
      });
      const result = response.data;

      if (result?.success && Array.isArray(result.data)) {
        // Filter only active doctors
        const activeDoctors = result.data.filter(
          (doctor) => doctor.isActive === true,
        );
        setDoctors(activeDoctors);
      } else {
        console.error('Unexpected doctor data format:', result);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  fetchDoctors();
}, [selectedHospitalID]);

  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem('roleName');
    const doctorID = sessionStorage.getItem('doctorID');
    const unitID = sessionStorage.getItem('unitID');
  
    setRoleName(role);
  
    if (role === 'Doctor') {
      if (unitID) setSelectedHospitalID(unitID);
      if (doctorID) {
        setSelectedDoctorID(doctorID);
        setIsDoctorLoggedIn(true);
      }
    } else if (role === 'Reception') {
      if (unitID) setSelectedHospitalID(unitID);
    } else if (role === 'HostitalAdmin') {
      if (unitID) setSelectedHospitalID(unitID);
    }
  }, []);
  

  const allColumns = [
    {
      headerName: 'S.No',
      valueGetter: (params: any) => params.node.rowIndex + 1,
      width: 80, // Small fixed width
      resizable: false,
      headerClass: 'text-left',
      cellClass: 'left',
      sortable: false,
      filter: false,
    
    },
    {
      headerName: 'Appointment Date',
      field: 'appointmentDate',
      width: 180, // Small fixed width
      resizable: false,
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('en-GB');
      },
    },
    {
      headerName: 'Patient Name',
      field: 'patientName',
     
      width: 300,
      resizable: false,
      sortable: true,
      filter: true,
    },
    // Doctor Name will be inserted conditionally below
    {
      headerName: 'To Whom',
      field: 'toWhom',
      width: 140,
      resizable: false,
      sortable: true,
      filter: true,
      valueGetter: (params: any) =>
        toWhomMapping[params.data.toWhom] || 'Unknown',
    },
    {
      headerName: 'Status',
      field: 'statusID',
      width: 300,
      resizable: false,
      sortable: true,
      filter: true,
      valueGetter: (params: any) =>
        statusMapping[params.data.statusID] || 'Unknown',
    },
    {
      headerName: 'Reason',
      field: 'notes',
      width: 600,
      resizable: true,
      sortable: true,
      filter: true,
    },
  ];
  
  // Dynamically add Doctor Name if role is Reception or HospitalAdmin
  const columns = [...allColumns];
  if (roleName === 'Reception' || roleName === 'HostitalAdmin') {
    columns.splice(3, 0, {
      headerName: 'Doctor Name',
      field: 'doctorName',
     
      width: 300,
      resizable: false,
      sortable: true,
      filter: true,
    });
  }
  




useEffect(() => {
  fetchStatusOptions();
  fetchToWhomOptions();
}, []);


const fetchAppointmentReport = async () => {
  const role = sessionStorage.getItem('roleName');
  const doctorID = sessionStorage.getItem('doctorID');
  const unitID = sessionStorage.getItem('unitID');

  const params: Record<string, string> = {};

  if (role === 'Doctor' && doctorID && unitID) {
    params['DoctorID'] = doctorID;
    params['HospitalID'] = unitID;
  } else if ((role === 'Reception' || role === 'HostitalAdmin') && unitID) {
    params['HospitalID'] = unitID;
  }

  try {
    const response = await api.get('/Appointment/AppointmentReport', { params });
    console.log('Appointment rowData:', response.data);
    setRowData(response.data);
  } catch (error) {
    console.error('Error fetching appointment data:', error);
  }
};
useEffect(() => {
  fetchAppointmentReport();
}, []);

useEffect(() => {
  setExportData(rowData); // Whenever rowData updates, update exportData
}, [rowData]);

const fetchStatusOptions = async () => {
  try {
    const response = await api.get('/AppLOV', {
      params: { type: 'AppointmentStauts' },
    });

    const data = response.data?.data || [];
    setStatusOptions(data);

    const statusMap = data.reduce((acc: Record<string, string>, item: any) => {
      acc[item.appLOVID] = item.name;
      return acc;
    }, {});
    setStatusMapping(statusMap);
  } catch (error) {
    console.error('Error fetching status data:', error);
  }
};

const fetchToWhomOptions = async () => {
  try {
    const response = await api.get('/AppLOV', {
      params: { type: 'toWhom' },
    });

    const toWhomMap = (response.data.data || []).reduce(
      (acc: Record<string, string>, item: any) => {
        acc[item.appLOVID] = item.name;
        return acc;
      },
      {},
    );

    setToWhomMapping(toWhomMap);
  } catch (error) {
    console.error('Error fetching toWhom data:', error);
  }
};

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Appointment Report
      </h1>
      {/* Filters Section */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Row 1 - Hospital and Doctor Name */}
        <div className="w-full">
          <select
            value={selectedHospitalID}
            onChange={(e) => setSelectedHospitalID(e.target.value)}
            disabled={!!sessionStorage.getItem('unitID')}
            className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black focus:outline-none focus:border-primary"
          >
            <option value="">-- Select Hospital --</option>
            {hospitals.map((hospital) => (
              <option key={hospital.hospitalID} value={hospital.hospitalID}>
                {hospital.hospitalName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <select
            value={selectedDoctorID}
            onChange={(e) => setSelectedDoctorID(e.target.value)}
            disabled={isDoctorLoggedIn}
            className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black focus:outline-none focus:border-primary"
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map((doctor) => (
              <option key={doctor.doctorID} value={doctor.doctorID}>
                {doctor.doctorName}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2 - From and To Date in first column */}
        <div className="flex gap-4 col-span-1">
          <input
            type="text"
            value={filterFromDate}
            placeholder="From Date"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = filterFromDate ? 'date' : 'text')}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-1/2 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />

          <input
            type="text"
            value={filterToDate}
            placeholder="To Date"
            min={filterFromDate}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = filterToDate ? 'date' : 'text')}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="w-1/2 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
        </div>

        <div className="w-full">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className=" w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          >
            <option value="">Select Status</option>
            {statusOptions.map((status) => (
              <option key={status.appLOVID} value={status.appLOVID}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons in second column */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
  {/* Search Button */}
  <button
    type="button"
    onClick={handleSearch}
    className="flex items-center bg-gradient-to-b from-[#004A99] to-[#007BFF] 
      hover:from-[#007BFF] hover:to-[#004A99] text-white 
      transition duration-150 ease-out hover:ease-in 
      px-4 py-2 rounded-lg"
  >
    <FaSearch />
    <span className="ml-2">Search</span>
  </button>

  {/* Reset Button */}
  <CustomButton
    onClick={handleReset}
    className="flex items-center border border-gray-300 
      opacity-80 hover:opacity-100 px-4 py-2 rounded-lg gap-2"
  >
    Reset
  </CustomButton>

  {/* Download Button */}
  <button
    type="button"
    onClick={() => setIsModalVisible(true)}
    className="flex items-center bg-gradient-to-b from-[#004A99] to-[#007BFF] 
      hover:from-[#007BFF] hover:to-[#004A99] text-white 
      transition duration-150 ease-out hover:ease-in 
      px-4 py-2 rounded-lg"
  >
    <FaFileDownload />
    <span className="ml-2">Download</span>
  </button>

  {/* Toast Container */}
  <ToastContainer position="top-right" autoClose={3000} />
</div>


      <hr className="border-t-2 border-stroke bg-transparent my-6" />
      {/* Global Search */}
      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Quick Search..."
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
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                  fill=""
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                  fill=""
                ></path>
              </g>
            </svg>
          </span>
        </div>
      </div>

      {/* AG Grid Table */}
      <div
        className="ag-theme-alpine mt-6 w-full"
        style={{ height: '400px', width: '100%' }}
      >
        <AgGridReact
          rowData={applyGlobalSearch(rowData)}
          columnDefs={columns}
          paginationPageSizeSelector={[5, 10, 20, 50, 100]}
          domLayout="autoHeight"
          pagination={true}
          paginationPageSize={10}
          enableFilter={true}
          enableSorting={true}
          suppressMovableColumns={true}
        />
      </div>

      {/* Modal for Download Format */}
      <Modal
  isOpen={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)}
  className="bg-white w-full max-w-sm mx-auto rounded-lg p-6 shadow-lg"
  overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
  ariaHideApp={false}
>
  <h2 className="text-lg font-semibold mb-4 text-gray-800">
    Select Download Format
  </h2>
  <div className="space-y-4">
    <button
      className="flex items-center w-full text-green-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
      onClick={() => handleDownload('Excel', exportData)}
    >
      <FaFileExcel className="mr-3" />
      Excel
    </button>
    <button
      className="flex items-center w-full text-yellow-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
      onClick={() => handleDownload('CSV', exportData)}
    >
      <FaFileCsv className="mr-3" />
      CSV
    </button>
    <button
      className="flex items-center w-full text-red-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
      onClick={() => handleDownload('PDF', exportData)}
    >
      <FaFilePdf className="mr-3" />
      PDF
    </button>
  </div>
  <button
    className="mt-4 w-full text-gray-700 font-medium px-4 py-2 border rounded-lg hover:bg-gray-100"
    onClick={() => setIsModalVisible(false)}
  >
    Cancel
  </button>
</Modal>

    </div>
  );
};

export default AppointmentReport;
