// import React, { useState } from "react";
// import Modal from "react-modal";
// import { FaSearch, FaFileDownload, FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";
// import { AgGridReact } from "ag-grid-react"; // Import ag-Grid React component
// import "ag-grid-community/styles/ag-grid.css"; // Import ag-Grid core styles
// import "ag-grid-community/styles/ag-theme-alpine.css"; // Import ag-Grid theme styles

// const DoctorReport: React.FC = () => {
//   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
//   const [quickSearch, setQuickSearch] = useState<string>("");

//   const handleSearch = () => {
//     alert("Search functionality triggered!");
//   };

//   const handleDownload = (format: string) => {
//     alert(`Downloading report in ${format} format...`);
//     setIsModalVisible(false); // Close modal after selection
//   };

//   // Column definitions for ag-Grid
//   const columnDefs = [
//     { headerName: "Hospital Name", field: "hospitalName", sortable: true, filter: true },
//     { headerName: "Doctor ID", field: "doctorId", sortable: true, filter: true },
//     { headerName: "Doctor Name", field: "doctorName", sortable: true, filter: true },
//     { headerName: "Doctor Report Date", field: "date", sortable: true, filter: true },
//   ];
//    const [filterFromDate, setFilterFromDate] = useState('');
//   const applyGlobalSearch = (data: any[]) => {
//     return data.filter((row) => {
//       return (
//         (row.hospitalName && row.hospitalName.toLowerCase().includes(quickSearchText.toLowerCase())) ||
//         (row.doctorId && row.doctorId.toLowerCase().includes(quickSearchText.toLowerCase())) ||
//         (row.doctorName && row.doctorName.toLowerCase().includes(quickSearchText.toLowerCase())) ||
//         (row.date && row.date.toLowerCase().includes(quickSearchText.toLowerCase()))
//       );
//     });
//   };
  
//   // Sample row data for ag-Grid
//   const rowData = [
//     { hospitalName: "City Hospital", doctorId: "D001", doctorName: "Dr. John", date: "2024-12-01" },
//     { hospitalName: "Greenfield Clinic", doctorId: "D002", doctorName: "Dr. Emily", date: "2024-12-02" },
//     { hospitalName: "Sunshine Medical", doctorId: "D003", doctorName: "Dr. Michael", date: "2024-12-03" },
//   ];
//   const [quickSearchText, setQuickSearchText] = useState("");
  
//   return (
// <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
//       {/* Page Title */}
//       <h1 className="text-2xl font-semibold text-gray-800 mb-6">
//         Doctor Report
//       </h1>
  

//       {/* Form Container */}
     
//         <div className="grid grid-cols-2 gap-6 mb-6">
//           {/* Hospital Name */}
//           <div>
           
//             <input
//               type="text"
//               placeholder="Enter Hospital Name"
//               className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 
//             pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark
//              dark:bg-form-input dark:text-white dark:focus:border-primary"
//             />
//           </div>

//           {/* Doctor ID */}
//           <div>
           
//             <input
//               type="text"
//               placeholder="Enter Doctor ID"
//               className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 
//               pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark
//                dark:bg-form-input dark:text-white dark:focus:border-primary"
//             />
//           </div>

//           {/* Doctor Name */}
//           <div>
           
//             <input
//               type="text"
//               placeholder="Enter Doctor Name"
//               className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 
//             pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark
//              dark:bg-form-input dark:text-white dark:focus:border-primary"
//             />
//           </div>

//           {/* Date */}
//           <div className="grid grid-cols-2 gap-4 w-full">
//           {/* From Date */}
//           <input
//             type="text"
//             value={filterFromDate}
//             onFocus={(e) => (e.target.type = 'date')}
//             onBlur={(e) => (e.target.type = filterFromDate ? 'date' : 'text')}
//             placeholder="From Date"
//             onChange={(e) => setFilterFromDate(e.target.value)}
//             className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
//           />

//           {/* To Date */}
//           <input
//             type="text"
//             placeholder="To Date"
//             onFocus={(e) => (e.target.type = 'date')}
//             onBlur={(e) => (e.target.type = e.target.value ? 'date' : 'text')}
//             className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
//           />
//         </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-between mt-6">
//           <button
//             className="flex items-center bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
//             onClick={handleSearch}
//           >
//             <FaSearch className="mr-2" />
//             Search
//           </button>

//           <button
//             className="flex items-center bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
//             onClick={() => setIsModalVisible(true)}
//           >
//             <FaFileDownload className="mr-2" />
//             Download
//           </button>
//         </div>
     
//         <hr className="border-t-2 border-stroke bg-transparent my-6" />

//  {/* Global Search */}
//  <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Quick Search..."
//             value={quickSearchText}
//             onChange={(e) => setQuickSearchText(e.target.value)}
//             className="sm:w-60 w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           />
//           <span className="absolute right-4 top-4">
//             <svg
//               className="fill-current"
//               width="22"
//               height="22"
//               viewBox="0 0 22 22"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <g opacity="0.5">
//                 <path
//                   fillRule="evenodd"
//                   clipRule="evenodd"
//                   d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
//                   fill=""
//                 ></path>
//                 <path
//                   fillRule="evenodd"
//                   clipRule="evenodd"
//                   d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
//                   fill=""
//                 ></path>
//               </g>
//             </svg>
//           </span>
//         </div>
//       </div>
//       {/* Ag-Grid Table */}
//      <div
//              className="ag-theme-alpine mt-6 w-full"
//              style={{ height: "400px", width: "100%" }}
//            >
//              <AgGridReact
//                rowData={applyGlobalSearch(rowData)} // Apply global search
//                columnDefs={columnDefs} 
//                pagination={true}
//                paginationPageSize={10}
//                domLayout="autoHeight"
//                headerHeight={40} // Adjust header height
//                rowHeight={40} // Adjust row height
//              />
//            </div>
           

//       {/* Modal for Download Format */}
//       <Modal
//         isOpen={isModalVisible}
//         onRequestClose={() => setIsModalVisible(false)}
//         className="bg-white w-full max-w-md mx-auto rounded-lg p-6 shadow-lg"
//         overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
//         ariaHideApp={false}
//       >
//         {/* Modal Title */}
//         <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
//           Select Download Format
//         </h2>

//         {/* Format Options */}
//         <div className="space-y-4">
//           <button
//             className="flex items-center justify-center w-full text-green-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
//             onClick={() => handleDownload("Excel")}
//           >
//             <FaFileExcel className="mr-3" />
//             Excel
//           </button>
//           <button
//             className="flex items-center justify-center w-full text-blue-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
//             onClick={() => handleDownload("Word")}
//           >
//             <FaFileWord className="mr-3" />
//             Word
//           </button>
//           <button
//             className="flex items-center justify-center w-full text-red-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
//             onClick={() => handleDownload("PDF")}
//           >
//             <FaFilePdf className="mr-3" />
//             PDF
//           </button>
//         </div>

//         {/* Cancel Button */}
//         <button
//           className="mt-4 w-full text-gray-700 font-medium px-4 py-2 border rounded-lg hover:bg-gray-100"
//           onClick={() => setIsModalVisible(false)}
//         >
//           Cancel
//         </button>
//       </Modal>
//     </div>
//   );
// };

// export default DoctorReport;




































import React from 'react';

const PatientHistory: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          🚧 Development in Progress
        </h1>
        <p className="text-gray-700">
          This feature is currently under development. Please check back later!
        </p>
      </div>
    </div>
  );
};

export default PatientHistory;

