import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Link } from 'react-router-dom';

interface RowData {
    id: number;
    offerName: string;
    name: string; // For backward compatibility
    offerType: string;
    code: string;
    validity: string;
    subscriptionType: string;
    isActive: boolean;
    status: string;
  }
  
  const initialData: RowData[] = [
    {
      id: 1,
      offerName: 'New Year Offer',
      name: 'New Year Offer',
      offerType: 'Discount',
      code: 'NY2024',
      validity: '2024-12-31',
      subscriptionType: 'Premium',
      isActive: true,
      status: 'Active', 
    },
    {
      id: 2,
      offerName: 'Spring Sale',
      name: 'Spring Sale',
      offerType: 'Cashback',
      code: 'SPRING50',
      validity: '2024-03-31',
      subscriptionType: 'Basic',
      isActive: false,
      status: 'Inactive',
    },
    {
      id: 3,
      offerName: 'Festive Bonanza',
      name: 'Festive Bonanza',
      offerType: 'Free Trial',
      code: 'FESTIVE2024',
      validity: '2024-10-31',
      subscriptionType: 'Gold',
      isActive: true,
      status: 'Active',
    },
  ];

const OffersMaster: React.FC = () => {
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterOfferType, setFilterOfferType] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterValidity, setFilterValidity] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | ''>('');
const [quickSearchText, setQuickSearchText] = useState(''); // Global search input
const [showForm, setShowForm] = useState(false);
  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
   const [showConfirmation, setShowConfirmation] = useState(false);
   const [deleteRowId, setDeleteRowId] = useState<number | null>(null); 
  const [formData, setFormData] = useState<RowData>({
   
        id: 0,
        offerName: '',
        offerType: '',
        code: '',
        validity: '',
        subscriptionType: '',
        status: '',
        name: '',  // Provide a default value for 'name'
        isActive: false,  // Provide a default value for 'isActive'
     
      
  });
  
  useEffect(() => {
    setRowData(initialData);
    setFilteredData(initialData);
  }, []);

  const columnDefs = [
    {
      headerName: 'ID',
      field: 'id',
      flex: 0.5,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Offer Name',
      field: 'offerName',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Offer Type',
      field: 'offerType',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Code',
      field: 'code',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Validity',
      field: 'validity',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Subscription Type',
      field: 'subscriptionType',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Active/Inactive',
      field: 'isActive',
      flex: 1,
      cellRenderer: (params: any) =>
        params.value ? (
          <span className="text-green-500">Active</span>
        ) : (
          <span className="text-red-500">Inactive</span>
        ),
    },
    {
        headerName: 'Edit',
        cellRenderer: (params: any) => (
          <button
            className="text-blue-500 hover:underline"
            onClick={() => handleEdit(params.data)} // Call handleEdit with the selected row data
          >
            Edit
          </button>
        ),
        flex: 0.5,
      },
      
      {
        headerName: 'Delete',
        flex: 1,
        headerClass: 'text-center',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params: any) => (
          <span
            onClick={() => handleDelete(params.data.Id)}
            className="cursor-pointer text-red-600 font-bold hover:text-red-800"
          >
            x
          </span>
        ),
        suppressSizeToFit: true,
        width: 150,
      },
  ];

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  const handleFilterSearch = () => {
    const filtered = initialData.filter((item) => {
      const matchesName = filterName
        ? item.name.toLowerCase().includes(filterName.toLowerCase())
        : true;
      const matchesOfferType = filterOfferType
        ? item.offerType.toLowerCase().includes(filterOfferType.toLowerCase())
        : true;
      const matchesCode = filterCode
        ? item.code.toLowerCase().includes(filterCode.toLowerCase())
        : true;
      const matchesValidity = filterValidity
        ? new Date(item.validity) >= new Date(filterValidity)
        : true;
      const matchesActive =
        filterActive !== '' ? item.isActive === filterActive : true;
  
      return (
        matchesName &&
        matchesOfferType &&
        matchesCode &&
        matchesValidity &&
        matchesActive
      );
    });
  
    setFilteredData(filtered); // Update filtered data
    setRowData(filtered); // Ensure the displayed data is updated
  };
  
  const applyGlobalSearch = (data: RowData[]) => {
    if (!quickSearchText.trim()) {
      return data; // Return unfiltered data if search text is empty
    }
    return data.filter((row) => {
      const searchText = quickSearchText.toLowerCase();
      return (
        row.offerName.toLowerCase().includes(searchText) ||
        row.offerType.toLowerCase().includes(searchText) ||
        row.code.toLowerCase().includes(searchText) ||
        row.validity.toLowerCase().includes(searchText) ||
        row.subscriptionType.toLowerCase().includes(searchText) ||
        (row.isActive ? 'active' : 'inactive').includes(searchText)
      );
    });
  };

  useEffect(() => {
    const filteredData = applyGlobalSearch(initialData);
    setRowData(filteredData);
  }, [quickSearchText]);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (formData.id === 0) {
      // Adding new offer
      const newOffer = { ...formData, Id: rowData.length + 1 };
      setRowData([...rowData, newOffer]);
      setFilteredData([...rowData, newOffer]);
    } else {
      // Editing existing offer
      const updatedOffers = rowData.map(item =>
        item.id === formData.id ? { ...item, ...formData } : item
      );
      setRowData(updatedOffers);
      setFilteredData(updatedOffers);
    }
  
    // Reset form and hide
    setShowForm(false);
    setFormData({
        id: 0,
        offerName: '',
        offerType: '',
        code: '',
        validity: '',
        subscriptionType: '',
        status: '',
        name: '',  // Provide a default value for 'name'
        isActive: false,  // Provide a default value for 'isActive'
      });
      
  };
  
  const handleEdit = (data: RowData) => {
    // Set the form data to the selected row's data
    setFormData({
      id: data.id,
      offerName: data.offerName,
      offerType: data.offerType,
      code: data.code,
      validity: data.validity,
      subscriptionType: data.subscriptionType,
      status: data.status,
      name: data.name, // Use the 'name' field from the row
      isActive: data.isActive, // Set isActive from the row data
    });
  
    // Show the form
    setShowForm(true);
  };
  const handleDelete = (Id: number) => {
    setDeleteRowId(Id);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    const updatedData = rowData.filter(item => item.id !== deleteRowId);
    setRowData(updatedData);
    setFilteredData(updatedData);
    setShowConfirmation(false);
    setDeleteRowId(null);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeleteRowId(null);
  };
  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Offers Master
      </h1>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Offer Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

         
 <select
           value={filterOfferType}
           onChange={(e) => setFilterOfferType(e.target.value)}
           className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
           text-black outline-none focus:border-primary dark:border-form-strokedark 
           dark:bg-form-input dark:text-white dark:focus:border-primary"
          
        >
          <option value="" disabled>Select Offer Type</option>
          <option value="Discount">Discount</option>
          <option value="Cashback">Cashback</option>
          <option value="Free Trial">Free Trial</option>
        </select>

          <input
            type="text"
            placeholder="Offer Code"
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="flex gap-4">
          <input
            type="date"
            placeholder="Validity"
           
            onChange={(e) => setFilterValidity(e.target.value)}
            className="w-[32%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filterActive === true}
              onChange={(e) => setFilterActive(e.target.checked ? true : '')}
              className="mr-2"
            />
            Active
          </label>
        </div>

        {/* Search Button */}
        <div className="flex justify-start mt-4">
          <button
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
            onClick={handleFilterSearch}
          >
            Search
          </button>
        </div>
      </div>

      <hr className="border-t-2 border-stroke bg-transparent my-6" />
      {showForm && (
  <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none">
    <h3 className="text-xl font-semibold mb-4">{formData.id === 0 ? 'Add New Offer' : 'Edit Offer'}</h3>
    <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-4 mb-2">
        <input
          type="text"
          value={formData.offerName}
          onChange={(e) => setFormData({ ...formData, offerName: e.target.value })}
          placeholder="Offer Name"
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <select
          value={formData.offerType}
          onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="" disabled>Select Offer Type</option>
          <option value="Discount">Discount</option>
          <option value="Cashback">Cashback</option>
          <option value="Free Trial">Free Trial</option>
        </select>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="Offer Code"
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <input
          type="date"
          value={formData.validity}
          onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
          placeholder="Validity Date"
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <select
          value={formData.subscriptionType}
          onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="" disabled>Select Subscription Type</option>
          <option value="Basic">Basic</option>
          <option value="Premium">Premium</option>
          <option value="Gold">Gold</option>
        </select>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="mt-4 flex gap-4">
        <button
          type="submit"
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
        hover:from-[#007BFF] hover:to-[#004A99]
        text-white transition duration-150 
        ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          {formData.id === 0 ? 'Add Offer' : 'Update Offer'}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
          hover:from-[#007BFF] hover:to-[#004A99]
          text-white transition duration-150 
          ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}

      <div className="mb-4 flex justify-between mt-4 items-center">
      <div className="relative">
          <input
            type="text"
            placeholder="Quick Search"
            value={quickSearchText}
            onChange={(e) => setQuickSearchText(e.target.value)}
            className="sm:w-60 w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
          />
        </div>
        <Link to="/offerscreation">
          <button className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg">
            + Add New
          </button>
        </Link>
      </div>

      <div
        className="ag-theme-alpine"
        style={{ height: '400px', width: '100%' }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          headerHeight={40}
          rowHeight={40}
          onGridReady={onGridReady}
        />
      </div>
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={confirmDelete}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                hover:from-[#007BFF] hover:to-[#004A99]
                text-white transition duration-150 
                ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersMaster;
