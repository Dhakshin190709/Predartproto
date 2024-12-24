import React, { useState, useEffect } from 'react'; 
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface RowData {
  Id: number;
  patientName: string;
  mobileNo: string;
  date: string;
  status: string;
}

const PaymentGateway: React.FC = () => {
  const [id, setId] = useState(''); // ID filter for UI
  const [mobileNo, setMobileNo] = useState(''); // Mobile filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [paymentData, setPaymentData] = useState({
    billAmount: '',
    date: '',
    paymentType: '', // Default is empty, not "Cash"
    transactionNumber: '',
    balance: '',
    upiId: '', // Added upiId here
  });

  const [formErrors, setFormErrors] = useState<any>({}); // Store form errors

  const initialData: RowData[] = [
    { Id: 1, patientName: 'Alex', mobileNo: '1234567890', date: '2024-12-01', status: 'Active' },
    { Id: 2, patientName: 'John', mobileNo: '0987654321', date: '2024-11-20', status: 'Inactive' },
    { Id: 3, patientName: 'Ram', mobileNo: '1112223333', date: '2024-12-01', status: 'Active' },
  ];

  useEffect(() => {
    setRowData(initialData);
    setFilteredData(initialData);
  }, []);

  const handlePaymentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submitting
    const errors: any = validateForm(paymentData);
    setFormErrors(errors);

    // If no errors, submit the form
    if (Object.keys(errors).length === 0) {
      console.log('Payment Details Submitted:', paymentData);
      setShowForm(false); // Close form after submission
    }
  };

  const validateForm = (data: any) => {
    const errors: any = {};

    // Bill Amount Validation
    if (!data.billAmount || isNaN(Number(data.billAmount)) || Number(data.billAmount) <= 0) {
      errors.billAmount = 'Bill Amount must be a positive number';
    }

    // Date Validation
    if (!data.date) {
      errors.date = 'Payment Date is required';
    }

    // Payment Type Validation
    if (!data.paymentType) {
      errors.paymentType = 'Payment Type is required';
    }

    // Balance Validation
    if (!data.balance || isNaN(Number(data.balance)) || Number(data.balance) < 0) {
      errors.balance = 'Balance must be a valid number';
    }

    // Transaction Number Validation (if payment type is not "Cash")
    if (data.paymentType !== 'Cash' && !data.transactionNumber) {
      errors.transactionNumber = 'Transaction Number is required for non-cash payments';
    }

    return errors;
  };

  const handleCancel = () => {
    setShowForm(false); // Close the form if canceled
  };

  
  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'ID',
      field: 'Id',
      sortable: true,
      filter: true,
      flex: 0.5,
      headerClass: 'text-center', // Center header text
      cellClass: 'text-center',   // Center cell data
      cellStyle: { textAlign: 'center' }, // Center cell content
    },
    {
      headerName: 'Date',
      field: 'date',
      sortable: true,
      filter: true,
      flex: 1,
      headerClass: 'ag-header-cell-label', // Center header text
      cellClass: 'text-center',   // Center cell data
      cellStyle: { textAlign: 'center' }, // Center cell content
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
      },
    },
    {
      headerName: 'Patient Name',
      field: 'patientName',
      sortable: true,
      filter: true,
      flex: 1.5,
      headerClass: 'text-center', // Center header text
      cellClass: 'text-center',   // Center cell data
      cellStyle: { textAlign: 'center' }, // Center cell content
    },
    {
      headerName: 'Mobile No',
      field: 'mobileNo',
      sortable: true,
      filter: true,
      flex: 1.5,
      headerClass: 'text-center', // Center header text
      cellClass: 'text-center',   // Center cell data
      cellStyle: { textAlign: 'center' }, // Center cell content
      valueFormatter: (params) => `${params.value}`,
    },
    {
      headerName: 'Status',
      field: 'status',
      flex: 1,
      headerClass: 'text-center', // Center header text
      cellClass: 'text-center',   // Center cell data
      cellStyle: { textAlign: 'center' }, // Center cell content
      cellRenderer: (params: any) => (
        <span
          onClick={() => toggleStatus(params)}
          className={`cursor-pointer font-bold ${params.value === 'Active' ? 'text-green-500' : 'text-red-400'} hover:underline`}
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'Action',
      flex: 1,
      headerClass: 'text-center', // Center header text
      cellClass: 'text-center',   // Center cell data
      cellStyle: { textAlign: 'center' }, // Center cell content
      cellRenderer: (params: any) => (
        <span
          onClick={() => handlePaymentEdit(params.data.Id)}
          className="cursor-pointer text-blue-500 font-bold"
        >
          Payment Info
        </span>
      ),
    },
  ];
  

  const handlePaymentEdit = (Id: number) => {
    // Find the selected row by ID to pre-fill the payment form
    const selectedRow = rowData.find((row) => row.Id === Id);
    if (selectedRow) {
      setPaymentData({
        billAmount: '',
        date: '',
        paymentType: '', // Make sure paymentType starts as an empty string
        transactionNumber: '',
        balance: '',
        upiId: '', // Reset or set any value if needed
      });
      setShowForm(true);
    }
  };

  const toggleStatus = (params: any) => {
    const updatedData = rowData.map(item =>
      item.Id === params.data.Id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    );
    setRowData(updatedData);
    setFilteredData(updatedData);
  };

  // Implement the handleFilterSearch function
  const handleFilterSearch = () => {
    const filtered = rowData.filter((row) => {
      const matchesId = row.Id.toString().includes(id);
      const matchesMobile = row.mobileNo.includes(mobileNo);
      return matchesId && matchesMobile;
    });
    setFilteredData(filtered);
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Payment</h2>

      {/* Table Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Mobile No"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
        />
         <button
          onClick={handleFilterSearch}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="ag-theme-alpine mt-6 w-full" style={{ height: '400px' }}>
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          headerHeight={40}
          rowHeight={40}
        />
      </div>

      {/* Payment Form Popout */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-xl font-bold mb-4 text-black">Payment Details</h3>
            <form onSubmit={handlePaymentFormSubmit} className="flex flex-wrap gap-4">

              {/* Row 1: Bill Amount and Payment Date */}
              <div className="flex gap-4 w-full">
                <div className="w-1/2">
                  <input
                    type="text"
                    value={paymentData.billAmount}
                    onChange={(e) => setPaymentData({ ...paymentData, billAmount: e.target.value })}
                    placeholder="Bill Amount"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
                  />
                  {formErrors.billAmount && <p className="text-red-500 text-sm mr-2">{formErrors.billAmount}</p>}
                </div>
                <div className="w-1/2">
                  <input
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                    placeholder="Payment Date"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text outline-none focus:border-primary"
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mr-2">{formErrors.date}</p>}
                </div>
              </div>

              {/* Row 2: Payment Type and Balance */}
              <div className="flex gap-4 w-full">
                <div className="w-1/2">
                  <select
                    value={paymentData.paymentType}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                  >
                    <option value="">Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="GPay">GPay</option>
                    <option value="PhonePay">PhonePay</option>
                    <option value="UPI">UPI ID</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                  {formErrors.paymentType && <p className="text-red-500 text-sm mr-2">{formErrors.paymentType}</p>}
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    value={paymentData.balance}
                    onChange={(e) => setPaymentData({ ...paymentData, balance: e.target.value })}
                    placeholder="Balance"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                  />
                  {formErrors.balance && <p className="text-red-500 text-sm mr-2">{formErrors.balance}</p>}
                </div>
              </div>

              {/* Row 3: Transaction Number and UPI ID */}
              <div className="flex gap-4 w-full">
                {paymentData.paymentType !== 'Cash' && (
                  <div className="w-1/2">
                    <input
                      type="text"
                      value={paymentData.transactionNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, transactionNumber: e.target.value })}
                      placeholder="Transaction No."
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                    />
                    {formErrors.transactionNumber && <p className="text-red-500 text-sm mr-2">{formErrors.transactionNumber}</p>}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6 gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentGateway;
