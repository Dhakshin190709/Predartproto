import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';

interface RowData {
  id: number; // S.No
  patientId: string; // Patient ID
  paymentId: string; // Payment ID
  date: string; // Date
  description: string; // Description
  paymentType: string; // Payment Type
  amount: number; // Amount
  status: string; // Paid/Unpaid
}

const initialData: RowData[] = [
  {
    id: 1,
    patientId: 'PAT001',
    paymentId: 'PAY001',
    date: '2024-12-01',
    description: 'Payment for consultation',
    paymentType: 'Credit Card',
    amount: 200,
    status: 'Paid',
  },
  {
    id: 2,
    patientId: 'PAT002',
    paymentId: 'PAY002',
    date: '2024-12-05',
    description: 'Payment for surgery',
    paymentType: 'Cash',
    amount: 1000,
    status: 'Unpaid',
  },
  {
    id: 3,
    patientId: 'PAT003',
    paymentId: 'PAY003',
    date: '2024-12-10',
    description: 'Payment for treatment',
    paymentType: 'Debit Card',
    amount: 500,
    status: 'Paid',
  },
];

const PaymentHistory: React.FC = () => {
  const [filterPatientId, setFilterPatientId] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const [rowData, setRowData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [quickSearchText, setQuickSearchText] = useState(''); // Global search
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

  useEffect(() => {
    setRowData(initialData); // Setting initial data
    setFilteredData(initialData); // Set the same data as filtered initially
  }, []);

  // Column Definitions for AG Grid
  const columnDefs: ColDef[] = [
    { headerName: 'S.No', field: 'id', flex: 0.5, sortable: true, filter: true, headerClass: 'text-center' },
    { headerName: 'Patient ID', field: 'patientId', flex: 1, sortable: true, filter: true, headerClass: 'text-center' },
    { headerName: 'Payment ID', field: 'paymentId', flex: 1, sortable: true, filter: true, headerClass: 'text-center' },
    { headerName: 'Date', field: 'date', flex: 1, sortable: true, filter: true, headerClass: 'text-center' },
    { headerName: 'Description', field: 'description', flex: 1.5, sortable: true, filter: true, headerClass: 'text-center' },
    { headerName: 'Payment Type', field: 'paymentType', flex: 1, sortable: true, filter: true, headerClass: 'text-center' },
    { headerName: 'Amount', field: 'amount', flex: 1, sortable: true, filter: true, headerClass: 'text-center' },
    { headerName: 'Status', field: 'status', flex: 1, sortable: true, filter: true, headerClass: 'text-center' },
  ];

  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.patientId.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.paymentId.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.date.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.description.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.paymentType.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.status.toLowerCase().includes(quickSearchText.toLowerCase())
    );
  };

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit(); // Ensure columns fit the grid width
  };

  const handleFilterSearch = () => {
    const fromDate = filterFromDate ? new Date(filterFromDate) : null;
    const toDate = filterToDate ? new Date(filterToDate) : null;

    const filtered = initialData.filter(item => {
      const matchesPatientId = filterPatientId ? item.patientId.toString().includes(filterPatientId.trim()) : true;
      const matchesFromDate = fromDate ? new Date(item.date) >= fromDate : true;
      const matchesToDate = toDate ? new Date(item.date) <= toDate : true;

      return matchesPatientId && matchesFromDate && matchesToDate;
    });

    setRowData(filtered); // Update the displayed data in the table
    setFilteredData(filtered); // Optionally update a filtered state if required
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Payment History</h1>
      <div className="rounded-lg border border-stroke bg-transparent py-4 px-6 text-gray-400 shadow-md">
          <div className="text-center font-semibold" style={{ color: '#bcc2be' }}>
          Patient ID: PAT001 | Patient Name: John Doe | Mobile Number: 1234567890 | Date: 2024-12-09  
          </div>
        </div>

    <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {/* Global Search */}
      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Hospital Name"
            value={quickSearchText}
            onChange={(e) => setQuickSearchText(e.target.value)}
            className="sm:w-60 w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <span className="absolute right-4 top-4">
            <svg
              className="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.5">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z" fill=""></path>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill=""></path>
              </g>
            </svg>
          </span>
        </div>
      </div>

      {/* Table Component */}
      <div className="ag-theme-alpine mt-6 w-fit" style={{ height: '400px', width: '100%' }}>
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

export default PaymentHistory;
