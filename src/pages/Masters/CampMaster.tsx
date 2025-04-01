import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Link } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';

interface RowData {
  id: number;
  campName: string;
  fromDate: string;
  toDate: string;
  description: string;
}

const initialData: RowData[] = [
  {
    id: 1,
    campName: 'Health Camp',
    fromDate: '2024-12-01',
    toDate: '2024-12-02',
    description: 'Free health check-up and consultation camp',
  },
  {
    id: 2,
    campName: 'Education Camp',
    fromDate: '2024-12-05',
    toDate: '2024-12-06',
    description: 'Camp focused on providing education for underprivileged children',
  },
  {
    id: 3,
    campName: 'Blood Donation Camp',
    fromDate: '2024-12-10',
    toDate: '2024-12-11',
    description: 'Camp organized to collect blood donations for hospitals',
  },
];

const CampMaster: React.FC = () => {
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [quickSearchText, setQuickSearchText] = useState('');

  const [filterCampName, setFilterCampName] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

  useEffect(() => {
    setRowData(initialData);
    setFilteredData(initialData);
  }, []);

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
      headerName: 'Camp Name',
      field: 'campName',
      flex: 1,
      sortable: true,
      filter: true,
      headerClass: 'text-center',
    },
    {
      headerName: 'Camp Date',
      field: 'fromDate',
      flex: 1,
      sortable: true,
      filter: true,
      headerClass: 'text-center',
    },
    {
      headerName: 'Description',
      field: 'description',
      flex: 2,
      sortable: true,
      filter: true,
      headerClass: 'text-center',
    },
  ];

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  const handleFilterSearch = () => {
    const filtered = initialData.filter((item) => {
      const matchesName = filterCampName ? item.campName.toLowerCase().includes(filterCampName.toLowerCase()) : true;
      const matchesDescription = filterDescription
        ? item.description.toLowerCase().includes(filterDescription.toLowerCase())
        : true;
      const matchesFromDate = filterFromDate ? new Date(item.fromDate) >= new Date(filterFromDate) : true;
      const matchesToDate = filterToDate ? new Date(item.toDate) <= new Date(filterToDate) : true;

      return matchesName && matchesDescription && matchesFromDate && matchesToDate;
    });

    setRowData(filtered);
    setFilteredData(filtered);
  };

  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter(
      (row) =>
        row.campName.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.description.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.fromDate.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.toDate.toLowerCase().includes(quickSearchText.toLowerCase())
    );
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Camp Master</h1>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Camp Name"
            value={filterCampName}
            onChange={(e) => setFilterCampName(e.target.value)}
            className="w-1/2 rounded-lg border border-stroke py-4 px-6"
          />
          <input
            type="text"
            value={filterFromDate}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = filterFromDate ? 'date' : 'text')}
            placeholder="From Date"
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-1/5 rounded-lg border border-stroke bg-transparent py-4 px-6 text-black outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="To Date"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = e.target.value ? 'date' : 'text')}
            className="w-1/5 rounded-lg border border-stroke bg-transparent py-4 px-6 text-black outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-4">
          <textarea
            placeholder="Description"
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
            className="w-1/2 rounded-lg border border-stroke py-4 px-6"
            rows={4}
          />
        </div>
        <div className="flex justify-start mt-4">
          <button
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
              hover:from-[#007BFF] hover:to-[#004A99]
              text-white transition duration-150 
              ease-out hover:ease-in py-2 px-5 rounded-lg"
           
          >
            
          </button>
          <CustomButton onClick={handleFilterSearch}>Search</CustomButton>

        </div>
      </div>

      <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {/* Quick Search */}
      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
      <div className="relative">
    <input
      type="text"
      placeholder="Quick Search"
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
        <Link to="/campcreation">
          <button
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
              hover:from-[#007BFF] hover:to-[#004A99]
              text-white transition duration-150 
              ease-out hover:ease-in py-2 px-5 rounded-lg"
          >
            + Add New
          </button>
        </Link>
      </div>

      <div className="ag-theme-alpine mt-6" style={{ height: '400px', width: '100%' }}>
        <AgGridReact
          rowData={applyGlobalSearch(filteredData)}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          headerHeight={40}
          rowHeight={40}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};

export default CampMaster;
