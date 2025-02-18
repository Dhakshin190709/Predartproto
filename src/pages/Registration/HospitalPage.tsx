import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

interface RowData {
    hospitalID: number;
    hospitalName: string;
    hospitalCode: string;
    hospitalType: string;
    isActive: string;
  }

const Hospital: React.FC = () => {
  const [name, setName] = useState(''); // Name filter for UI
  const [isActive, setIsActive] = useState(true);// Active filter for UI
  const [rowData, setRowData] = useState([]);
  const [tenants, setTenants] = useState([]); // State for tenant data
  const [selectedTenant, setSelectedTenant] = useState(""); // State for selected tenan
    const [hospitalTypes, setHospitalTypes] = useState([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(''); // For global search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [showConfirmation, setShowConfirmation] = useState(false); // Show confirmation for deletion
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null); // ID of row to delete
  const [formData, setFormData] = useState<RowData>({
    hospitalID: 0,
    hospitalName: '',
    hospitalCode: '',
    hospitalType: '',
    isActive: 'Active',
  });

 

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

   // Fetch data from the API
  


  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('API Data:', data); // Debugging log
        setRowData(data.data || data); // Adjust based on the API structure
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);
  
   // Fetch tenant data
   useEffect(() => {
  fetch("https://predart003-001-site1.anytempurl.com/api/Tenant")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Tenant Data:", data);
      setTenants(data.data || data); // Adjust based on the API structure
    })
    .catch((error) => {
      console.error("Error fetching tenant data:", error);
    });
}, []);


  // Handle tenant selection
  const handleTenantChange = (e) => {
    setSelectedTenant(e.target.value);
    console.log(`Selected Tenant: ${e.target.value}`);
  };

// hospital type from appLOV
useEffect(() => {
  fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV")
    .then((response) => response.json())
    .then((data) => {
      // Filter for "Hospital" type
      const filteredTypes = data.data.filter((item) => item.type === "Hospital");
      setHospitalTypes(filteredTypes); // Set filtered options
    })
    .catch((error) => console.error("Error fetching data:", error));
}, []);

  


  const columnDefs = [
    { headerName: 'S.No', valueGetter: 'node.rowIndex + 1', width: 80 },
    { headerName: "Hospital ID", field: "hospitalID", sortable: true, filter: true,hide:true,width: 150 },
    { headerName: 'Hospital Type', field: 'hospitalType', sortable: true, filter: true, width: 200 },
    { headerName: 'Hospital Name', field: 'hospitalName', sortable: true, filter: true, width: 200 },
    { headerName: 'Hospital Code', field: 'hospitalCode', sortable: true, filter: true, width: 150 },

    {
        headerName: "Status",
        field: "isActive",
        flex: 1,
        width:50,
        headerClass: 'center-header',
        cellClass: 'text-center',
        cellRenderer: (params: any) => {
            const isActive = params.value === true ? "Active" : "Inactive";
            return (
              <span
                className={`cursor-pointer font-bold ${
                  isActive === "Active" ? "text-green-500" : "text-red-400"
                }`}
              >
                {isActive}
              </span>
            );
          }
          
          
          
      },
      
  
     
    {
        headerName: "Edit",
        flex: 0.8,
        width:50,
        headerClass: 'center-header',
        cellClass: 'text-center',
        cellRenderer: (params: any) => (
          <span
            className="cursor-pointer text-blue-500 font-bold"
            onClick={() => handleEdit(params.data)} // Ensure roleID is passed correctly
            
          >
            Edit
          </span>
        ),
      },
      {
        headerName: "Delete",
        flex: 0.8,
        width: 50,
        headerClass: 'center-header',
        cellClass: 'text-center',
        cellRenderer: (params: any) => (
          <span
            className="cursor-pointer text-red-600 font-bold"
            onClick={() => handleDelete(params.data.hospitalID)} // Pass hospitalID directly to handleDelete
          >
            x
          </span>
        ),
      }
      
  ];


  const toggleStatus = (params: any) => {
    const updatedData = rowData.map((item) =>
      item.hospitalID === params.data.hospitalID
        ? { ...item, isActive: item.isActive === 'Active' ? 'Inactive' : 'Active' }
        : item,
    );
    setRowData(updatedData);
    setFilteredData(updatedData);
  };

  const handleDelete = async (hospitalID: number) => {
    setDeleteRowId(hospitalID);
    setShowConfirmation(true);
  };
  
  const confirmDelete = async () => {
    // API call to delete the data from the database
    await fetch(`https://predart003-001-site1.anytempurl.com/api/Hospital/${deleteRowId}`, {
      method: 'DELETE',
    });
  
    // After successful deletion, update the UI
    const updatedData = rowData.filter((item) => item.hospitalID !== deleteRowId);
    setRowData(updatedData);
    setFilteredData(updatedData);
  
    setShowConfirmation(false);
    setDeleteRowId(null);
  };
  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeleteRowId(null);
  };
  


  

  
   
  
  const createdBy = "dd606a34-6e0a-4b0f-8cfd-8e9138267627"; // hardcoded value

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      // Convert the isActive status to boolean
      const isActive = formData.isActive === 'Active';
  
      // Construct the payload
      const newFormData = {
        tenantID: selectedTenant, // Pass the selected tenant ID
        hospitalName: formData.hospitalName,
        hospitalCode: formData.hospitalCode,
        hospitalType: formData.hospitalType,
        isActive: isActive,  // Pass the boolean value of isActive
        createdBy: createdBy,  // Hardcoded createdBy
      };
  
      console.log('Form Data being sent:', newFormData);
  
      // Determine the method and URL based on whether it's a new entry or an update
      const method = formData.hospitalID === 0 ? 'POST' : 'PUT'; // POST for new, PUT for update
      const url = formData.hospitalID === 0
        ? 'https://predart003-001-site1.anytempurl.com/api/Hospital'
        : `https://predart003-001-site1.anytempurl.com/api/Hospital/${formData.hospitalID}`; // Add hospitalID for PUT
  
      // Perform the API request
      let response;
      if (method === 'POST') {
        console.log('Performing POST request...');
        response = await axios.post(url, newFormData);
      } else {
        console.log('Performing PUT request...');
        response = await axios.put(url, newFormData);
      }
  
      console.log('Server response:', response.data);
  
      // Update the state with the new or updated data
      setRowData((prevRowData) => {
        if (formData.hospitalID !== 0) {
          // Update existing hospital entry
          return prevRowData.map((row) =>
            row.hospitalID === formData.hospitalID ? response.data : row
          );
        }
        // Add new hospital entry
        return [...prevRowData, response.data];
      });
  
      setFilteredData((prevFilteredData) => {
        if (formData.hospitalID !== 0) {
          return prevFilteredData.map((row) =>
            row.hospitalID === formData.hospitalID ? response.data : row
          );
        }
        return [...prevFilteredData, response.data];
      });
  
      // Hide the form and reset it
      setShowForm(false);
      setFormData({
        hospitalID: 0,
        hospitalName: '',
        hospitalCode: '',
        hospitalType: '',
        isActive: 'Active',
      });
      setSelectedTenant('');
  
    } catch (error) {
      console.error('Error submitting form:', error.response?.data || error.message);
    }
  };
  
  
  
  

  





  const handleEdit = (data: RowData | number) => {
    let rowToEdit: RowData | undefined;
  
    if (typeof data === 'number') {
      rowToEdit = rowData.find((row) => row.hospitalID === data);
    } else {
      rowToEdit = data;
    }
  
    if (rowToEdit) {
      setFormData(rowToEdit);
      setShowForm(true);
    }
  };
  
  
  const handleFilterSearch = () => {
    const filtered = initialData.filter(
      (item) =>
        (name
          ? item.hospitalName.toLowerCase().includes(name.toLowerCase())
          : true) && (isActive ? item.isActive === 'Active' : true),
    );
    setRowData(filtered);
    setFilteredData(filtered);
  };

  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.hospitalName.toLowerCase().includes(quickSearchText.toLowerCase()),
    );
  };

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Hospital
      </h2>

     
      {showForm && (
        <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none">
          <h3 className="text-xl font-semibold mb-4">
            {formData.hospitalID === 0 ? 'Add New Data' : 'Edit Data'}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-wrap gap-4 items-center justify-between"
          >
            <div className="flex gap-4 mb-2 items-center">
  {/* Tenant Dropdown */}
  <select
  value={selectedTenant || ''}
  onChange={(e) => setSelectedTenant(e.target.value)}
  className="w-35 rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
  text-black outline-none focus:border-primary dark:border-form-strokedark 
  dark:bg-form-input dark:text-white dark:focus:border-primary"
>
  <option value="" disabled>Select Tenant</option>
  {tenants.map((tenant) => (
    <option key={tenant.tenantID} value={tenant.tenantID}>
      {tenant.tenantName}
    </option>
  ))}
</select>



  {/* Hospital Type Dropdown */}
 <div>
  <select
    id="hospitalType"
    name="hospitalType"
    value={formData.hospitalType}
    className="w-38 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    onChange={(e) =>
      setFormData({ ...formData, hospitalType: e.target.value })
    }
    required
  >
    <option value="">Hospital Type</option>
    {hospitalTypes.length > 0 ? (
      hospitalTypes.map((type) => (
        <option key={type.appLOVID} value={type.name}>
          {type.name} {/* Displaying the name of the hospital */}
        </option>
      ))
    ) : (
      <option value="">No Hospital Types Available</option>
    )}
  </select>
</div>

  {/* Hospital Name Input */}
  <input
    type="text"
    value={formData.hospitalName}
    onChange={(e) =>
      setFormData({ ...formData, hospitalName: e.target.value })
    }
    placeholder="Hospital Name"
    className="w-50 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  />

  {/* Hospital Code Input */}
  <input
    type="text"
    id="hospitalCode"
    name="hospitalCode"
    placeholder="Hospital Code"
    value={formData.hospitalCode}
    onChange={(e) => setFormData({ ...formData, hospitalCode: e.target.value })}
    required
    className="w-35 rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
   <div>
  <input
     type="hidden" 
    id="createdBy"
    name="createdBy"
    placeholder="Created By"
    value={formData.createdBy || ''} // Ensure it defaults to an empty string
    className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })} // Directly update createdBy as string
    required
  />
</div>
  {/* Checkbox for Status */}
  <label className="text-black dark:text-black flex items-center w-fit cursor-pointer">
      <input
        type="checkbox"
        checked={isActive} // Checkbox reflects the state
        onChange={(e) => {
          console.log('Checkbox checked:', e.target.checked); // Debugging
          setIsActive(e.target.checked); // Update state based on checkbox value
        }}
        
        className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-md relative mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-gradient-to-b checked:from-[#004A99] checked:to-[#007BFF] checked:border-[#007BFF] checked:after:content-['✔️'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white"
      />
      <span>{isActive ? 'Active' : 'Inactive'}</span> {/* Reflect state */}
    </label>
    
</div>


            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
              >
                {formData.hospitalID === 0 ? 'Add' : 'Update'}
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

      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={quickSearchText}
            onChange={handleFilterSearch}
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
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                  fill=""
                ></path>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                  fill=""
                ></path>
              </g>
            </svg>
          </span>
        </div>

        <button
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
          onClick={() => setShowForm(true)}
        >
          + Add
        </button>
      </div>

      <div className="ag-theme-alpine mt-6 w-full" style={{ height: '400px' }}>
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
       <style jsx>{`
        .center-header .ag-header-cell-label {
          text-align: center;
          display: flex;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
    
  );
};

export default Hospital;
