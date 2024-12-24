import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Modal from "react-modal"; // Ensure you have installed react-modal
import {
  FaSearch,
  FaFileDownload,
  FaFileExcel,
  FaFileWord,
  FaFilePdf,
} from "react-icons/fa";

const AppointmentReport: React.FC = () => {
  const [hospitalName, setHospitalName] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [appointmentName, setAppointmentName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quickSearchText, setQuickSearchText] = useState(""); // Global search state
   const [filterFromDate, setFilterFromDate] = useState('');
  const [rowData, setRowData] = useState<any[]>([
    {
      hospitalName: "City Hospital",
      patientId: "P123",
      name: "John Doe",
      phoneNumber: "1234567890",
      appointmentName: "Dental Checkup",
      date: "2024-01-15",
    },
    {
      hospitalName: "Green Valley Clinic",
      patientId: "P456",
      name: "Jane Smith",
      phoneNumber: "0987654321",
      appointmentName: "Eye Consultation",
      date: "2024-02-20",
    },
    {
      hospitalName: "Sunrise Health Center",
      patientId: "P789",
      name: "Mark Taylor",
      phoneNumber: "5678901234",
      appointmentName: "General Checkup",
      date: "2024-03-10",
    },
  ]); // Sample appointment data

  const handleSearch = () => {
    const filteredData = rowData.filter((row) => {
      return (
        row.hospitalName.toLowerCase().includes(hospitalName.toLowerCase()) &&
        row.patientId.toLowerCase().includes(patientId.toLowerCase()) &&
        row.name.toLowerCase().includes(name.toLowerCase()) &&
        row.phoneNumber.includes(phoneNumber) &&
        row.appointmentName.toLowerCase().includes(appointmentName.toLowerCase()) &&
        row.date.includes(date)
      );
    });
    setRowData(filteredData);
  };

  const applyGlobalSearch = (data: any[]) => {
    return data.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(quickSearchText.toLowerCase())
      )
    );
  };

  const handleDownload = (format: string) => {
    alert(`Downloading report in ${format} format...`);
    setIsModalVisible(false); // Close modal after selection
  };

  const columns = [
    { headerName: "Hospital Name", field: "hospitalName", sortable: true, filter: true },
    { headerName: "Patient ID", field: "patientId", sortable: true, filter: true },
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Phone Number", field: "phoneNumber", sortable: true, filter: true },
    { headerName: "Appointment Name", field: "appointmentName", sortable: true, filter: true },
    { headerName: "Appointment Date", field: "date", sortable: true, filter: true },
  ];

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Appointment Report</h1>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-4">
          {/* Hospital Name Filter */}
          <input
            type="text"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder="Hospital Name"
            className="w-[40%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />

          {/* Patient ID Filter */}
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Patient ID"
            className="w-[30%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />

          {/* Name Filter */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Patient Name"
            className="w-[30%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
        </div>

        <div className="flex gap-4">
          {/* Phone Number Filter */}
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
            className="w-[40%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />

          {/* Appointment Name Filter */}
          <input
            type="text"
            value={appointmentName}
            onChange={(e) => setAppointmentName(e.target.value)}
            placeholder="Appointment Name"
            className="w-[30%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
<input
            type="text"
            value={filterFromDate}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = filterFromDate ? 'date' : 'text')}
            placeholder="From Date"
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-[30%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
</div>
<div className="flex gap-4">
          {/* From Date */}
          

          {/* To Date */}
          <input
            type="text"
            placeholder="To Date"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = e.target.value ? 'date' : 'text')}
            className="w-[38%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
        
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
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
        style={{ height: "400px", width: "100%" }}
      >
        <AgGridReact
          rowData={applyGlobalSearch(rowData)}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
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

export default AppointmentReport;
