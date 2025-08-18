import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Modal from 'react-modal'; // Ensure you have installed react-modal
import {
  FaSearch,
  FaFileDownload,
  FaFileExcel,
  FaFileWord,
  FaFilePdf,
} from 'react-icons/fa';
const EventReport: React.FC = () => {
  const [eventName, setEventName] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [fees, setFees] = useState<string>("");
    const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventDescription, setEventDescription] = useState<string>("");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [rowData, setRowData] = useState<any[]>([
    {
      eventName: "Annual Tech Conference",
      fromDate: "2024-01-15",
      toDate: "2024-01-17",
      fees: "$200",
      eventDescription: "A three-day conference discussing the latest trends in technology.",
    },
    {
      eventName: "Health & Wellness Expo",
      fromDate: "2024-03-20",
      toDate: "2024-03-22",
      fees: "$100",
      eventDescription: "An expo featuring wellness experts and fitness activities.",
    },
    {
      eventName: "Marketing Summit 2024",
      fromDate: "2024-05-10",
      toDate: "2024-05-12",
      fees: "$150",
      eventDescription: "A summit for marketers to network and explore new strategies.",
    },
  ]); // Sample event data

  const [quickSearchText, setQuickSearchText] = useState(""); // Global search state

  const handleSearch = () => {
    const newRowData = [
      {
        eventName,
        fromDate: filterFromDate,
        toDate,
        fees,
        eventDescription,
      },
    ];
    setRowData(newRowData); // Update grid data
  };

  const columns = [
    { headerName: "Event Name", field: "eventName", sortable: true, filter: true },
    { headerName: "Event Date", field: "fromDate", sortable: true, filter: true },
  
    { headerName: "Fees", field: "fees", sortable: true, filter: true },
    { headerName: "Event Description", field: "eventDescription", sortable: true, filter: true },
  ];

  const applyGlobalSearch = (data: any[]) => {
    return data.filter((row) =>
      row.eventName.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.fromDate.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.toDate.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.fees.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.eventDescription.toLowerCase().includes(quickSearchText.toLowerCase())
    );
  };
// Download Handler
const handleDownload = (format: string) => {
  alert(`Downloading report in ${format} format...`);
  setIsModalVisible(false); // Close modal after selection
};
  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Event Report</h1>

      {/* Filters Section (Type, Code, Active) */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-4">
          {/* Event Name Filter */}
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Event Name"
            className="w-[40%] rounded-lg border border-stroke bg-transparent py-4 pl-6 
            pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark
             dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

          {/* From Date Filter */}
          <input
            type="text"
            value={filterFromDate}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = filterFromDate ? "date" : "text")}
            placeholder="From Date"
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

          {/* To Date Filter */}
          <input
            type="text"
            value={toDate}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = toDate ? "date" : "text")}
            placeholder="To Date"
            onChange={(e) => setToDate(e.target.value)}
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

          {/* Fees Filter */}
          <input
            type="text"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            placeholder="Fees"
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Event Description Textarea */}
        <textarea
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          placeholder="Event Description"
          rows={4}
          className="w-[58%] rounded-lg border border-stroke bg-transparent py-2 pl-4 pr-8
           text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

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
          rowData={applyGlobalSearch(rowData)} // Apply global search
          columnDefs={columns}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          headerHeight={40} // Adjust header height
          rowHeight={40} // Adjust row height
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
                  onClick={() => handleDownload('Excel')}
                >
                  <FaFileExcel className="mr-3" />
                  Excel
                </button>
                <button
                  className="flex items-center w-full text-blue-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                  onClick={() => handleDownload('Word')}
                >
                  <FaFileWord className="mr-3" />
                  Word
                </button>
                <button
                  className="flex items-center w-full text-red-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                  onClick={() => handleDownload('PDF')}
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

export default EventReport;
