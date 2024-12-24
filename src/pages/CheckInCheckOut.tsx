import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface RowData {
  Id: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  roomNo: string;
  checkInOut: string;
}

const CheckInCheckOut: React.FC = () => {
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [quickSearchText, setQuickSearchText] = useState('');
  const [gridApi, setGridApi] = useState<any>(null);
  const [gridColumnApi, setGridColumnApi] = useState<any>(null);

  // Define data array before using it in any other variable or function
  const data: RowData[] = [
    { Id: 1, doctorName: 'Dr. John Doe', specialization: 'Cardiology', date: '2024-12-16', time: '10:00 AM', roomNo: '101', checkInOut: 'Check-In' },
    { Id: 2, doctorName: 'Dr. Jane Smith', specialization: 'Neurology', date: '2024-12-16', time: '11:30 AM', roomNo: '102', checkInOut: 'Check-Out' },
    { Id: 3, doctorName: 'Dr. Alex Brown', specialization: 'Orthopedics', date: '2024-12-16', time: '01:00 PM', roomNo: '103', checkInOut: 'Check-In' },
  ];

  const [filteredData, setFilteredData] = useState<RowData[]>(data);

  const columnDefs: ColDef<RowData, any>[] = [
    { headerName: 'ID', field: 'Id', sortable: true, filter: true, width: 100, headerClass: 'text-left' },
    { headerName: 'Doctor Name', field: 'doctorName', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
    { headerName: 'Specialization', field: 'specialization', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
    { headerName: 'Date', field: 'date', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
    { headerName: 'Time', field: 'time', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
    { headerName: 'Room No', field: 'roomNo', sortable: true, filter: true, flex: 1, headerClass: 'text-left' },
    {
      headerName: 'Check-In/Out',
      field: 'checkInOut',
      flex: 1,
      headerClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          onClick={() => toggleStatus(params)}
          className={`cursor-pointer font-bold ${params.value === 'Check-In' ? 'text-green-500' : 'text-red-400'} hover:underline`}
        >
          {params.value}
        </span>
      ),
    },
  ];

  const toggleStatus = (params: any) => {
    console.log('Status toggled:', params.value);
  };

  const applyGlobalSearch = () => {
    if (!quickSearchText) {
      return filteredData; // Return filtered data as is if no quick search text
    }

    return filteredData.filter((item) => {
      return (
        item.doctorName?.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        item.specialization?.toLowerCase().includes(quickSearchText.toLowerCase())
      );
    });
  };

  const handleFilterSearch = () => {
    const filtered = data.filter((item) => {
      const matchesHospitalName = hospitalName
        ? item.doctorName.toLowerCase().includes(hospitalName.toLowerCase())
        : true;

      const matchesDoctorName = doctorName
        ? item.doctorName.toLowerCase().includes(doctorName.toLowerCase())
        : true;

      return matchesHospitalName && matchesDoctorName;
    });

    setFilteredData(filtered);
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Check-in/out</h2>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Hospital Name"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Doctor Name"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        />
        <button
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
          onClick={handleFilterSearch}
        >
          Search
        </button>
      </div>

      <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {/* AgGrid Table */}
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          gridOptions={{}}
          domLayout="autoHeight"
          rowData={applyGlobalSearch()}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
};

export default CheckInCheckOut;
