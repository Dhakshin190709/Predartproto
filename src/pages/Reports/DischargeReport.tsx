import React, { useState } from "react";
import Modal from "react-modal"; // Ensure you have installed react-modal
import { FaSearch, FaFileDownload, FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react"; // Ensure you have installed ag-grid-react and ag-grid-community
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const DischargeReport: React.FC = () => {
  // State variables
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [hospitalName, setHospitalName] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [dischargeDate, setDischargeDate] = useState<string>("");
  const [quickSearchText, setQuickSearchText] = useState<string>("");
 
  const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');
  // Sample Data for AG Grid
  const initialData = [
    { id: 1, hospitalName: "City Hospital", patientName: "John Doe", dischargeDate: "2024-12-01", amount: 500 },
    { id: 2, hospitalName: "Metro Hospital", patientName: "Jane Smith", dischargeDate: "2024-12-03", amount: 300 },
    { id: 3, hospitalName: "Health Center", patientName: "Alice Brown", dischargeDate: "2024-12-05", amount: 700 },
  ];
  const [rowData, setRowData] = useState(initialData);

  // AG Grid column definitions
  const columnDefs = [
    { field: "id", headerName: "ID", sortable: true, filter: true, width: 100 },
    { field: "hospitalName", headerName: "Hospital Name", sortable: true, filter: true, width: 200 },
    { field: "patientName", headerName: "Patient Name", sortable: true, filter: true, width: 200 },
    { field: "dischargeDate", headerName: "Discharge Date", sortable: true, filter: true, width: 150 },
    { field: "amount", headerName: "Amount ($)", sortable: true, filter: true, width: 120 },
  ];

  // Handlers
  const handleSearch = () => {
    const filteredData = initialData.filter((row) => {
      const matchesHospitalName =
        hospitalName === "" || row.hospitalName.toLowerCase().includes(hospitalName.toLowerCase());
      const matchesPatientName =
        patientName === "" || row.patientName.toLowerCase().includes(patientName.toLowerCase());
      const matchesPatientId = patientId === "" || row.id.toString() === patientId;
      const matchesDischargeDate = dischargeDate === "" || row.dischargeDate === dischargeDate;

      return matchesHospitalName && matchesPatientName && matchesPatientId && matchesDischargeDate;
    });

    setRowData(filteredData);
  };

  const handleDownload = (format: string) => {
    alert(`Downloading report in ${format} format...`);
    setIsModalVisible(false); // Close modal after selection
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Discharge Report</h1>

      {/* Form Container */}
    
        {/* First Row: Hospital Name and Patient Name */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder="Hospital Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />

          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Patient Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
        </div>

        {/* Second Row: Patient ID and Discharge Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Patient ID"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />

<div className="grid grid-cols-2 gap-4 w-full">
          {/* From Date */}
          <input
            type="text"
            value={filterFromDate}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = filterFromDate ? 'date' : 'text')}
            placeholder="From Date"
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />

          {/* To Date */}
          <input
            type="text"
            placeholder="To Date"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = e.target.value ? 'date' : 'text')}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
        </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mb-6">
          <button
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            onClick={handleSearch}
          >
            <FaSearch className="mr-2" />
            Search
          </button>

          <button
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={() => setIsModalVisible(true)}
          >
            <FaFileDownload className="mr-2" />
            Download
          </button>
        </div>
     

      {/* Horizontal Rule */}
      <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {/* Quick Search */}
      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Quick Search..."
            value={quickSearchText}
            onChange={(e) => setQuickSearchText(e.target.value)}
            className="sm:w-60 w-full rounded-lg border border-stroke bg-transparent py-4 
            pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none
             dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
      <div className="ag-theme-alpine" style={{ height: 300, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={5}
          quickFilterText={quickSearchText} // Quick search binding
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
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Select Download Format</h2>

        <div className="space-y-4">
          <button
            className="flex items-center w-full text-green-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
            onClick={() => handleDownload("Excel")}
          >
            <FaFileExcel className="mr-3" />
            Excel
          </button>
          <button
            className="flex items-center w-full text-blue-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
            onClick={() => handleDownload("Word")}
          >
            <FaFileWord className="mr-3" />
            Word
          </button>
          <button
            className="flex items-center w-full text-red-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
            onClick={() => handleDownload("PDF")}
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

export default DischargeReport;
