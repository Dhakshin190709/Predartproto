import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { Edit } from "lucide-react";
import { fetchHospitalAPI, fetchTenants } from '../../Utils';
import CustomButton from '../../components/CustomButton';


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
    hospitalID: '',
    hospitalName: '',
    hospitalCode: '',
    hospitalType: '',
    isActive: true, // now matches your check in the submit handler
  });
  
const [formMode, setFormMode] = useState(""); 
  const apiBaseUrl = 'https://predart003-001-site1.anytempurl.com/api/Hospital/List'; 

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  const editFormRef = useRef<HTMLDivElement | null>(null);
   // Fetch data from the API
  


  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital/List')
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
  
   // Fetch tenant data from utils
   useEffect(() => {
    fetchTenants().then(setTenants);
  }, []);

  // Handle tenant selection
  const handleTenantChange = (e) => {
    setSelectedTenant(e.target.value);
    console.log(`Selected Tenant: ${e.target.value}`);
  };

// hospital type from appLOV

  useEffect(() => {
    const getHospitalTypes = async () => {
      const types = await fetchHospitalAPI();
      setHospitalTypes(types);
    };

    getHospitalTypes();
  }, []);
  

  


  const columnDefs = [
    { headerName: 'S.No', valueGetter: 'node.rowIndex + 1', width: 80 },
    { headerName: "Hospital ID", field: "hospitalID", sortable: true, filter: true,hide:true,width: 150 },
    
    { headerName: 'Hospital Name', field: 'hospitalName',sortable: true, filter: true, width: 280 },
    { headerName: 'Hospital Type', field: 'hospitalType', sortable: true, filter: true, width: 180 },
    { headerName: 'Hospital Code', field: 'hospitalCode', sortable: true, filter: true, width: 100 },

    {
      headerName: "Status",
      field: "isActive",
      flex: 1,
      width: 70,
      headerClass: "center-header",
      cellClass: "text-center",
      cellRenderer: (params: any) => {
        const isActive = params.value === true; // Ensure boolean conversion
    
        return (
          <span
            className={`cursor-pointer font-bold ${
              isActive ? "text-green-500" : "text-red-400"
            }`}
            onClick={() => toggleStatus(params)} // Make it clickable
            style={{ cursor: "pointer" }} // Ensure the cursor shows it's clickable
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    

      
  
    {
      headerName: "Edit",
      flex: 0.8,
      width: 50,
      headerClass: "center-header",
      cellClass: "text-center",
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEdit(params.data)}
          className="cursor-pointer flex justify-center mt-3 items-center"
        >
          <Edit size={18} className="text-blue-500 hover:scale-110 transition-transform" />
        </span>
      ),
    },
      {
        headerName: "Delete",
        hide:true,
        flex: 0.8,
        // width: 50,
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


 
  const toggleStatus = async (params: any) => {
    const { hospitalID, isActive } = params.data;
    const updatedStatus = isActive === true; // Ensure it's a boolean toggle
    const userID = sessionStorage.getItem("userID");
  
    if (!userID) {
      console.error("User ID not found in session storage.");
      alert("User not logged in. Please log in again.");
      return;
    }
  
    try {
      const response = await axios.patch("https://predart003-001-site1.anytempurl.com/api/Hospital", {
        guidID: hospitalID, // Send hospitalID as guidID
        updatedBy: userID,
        isActive: !updatedStatus, // Toggle boolean
      });
  
      if (response.status === 200) {
        // Ensure `isActive` is stored as boolean
        const updatedData = rowData.map((item) =>
          item.hospitalID === hospitalID ? { ...item, isActive: !updatedStatus } : item
        );
        setRowData(updatedData);
        setFilteredData(updatedData);
        console.log("Updated isActive:", !updatedStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
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
  


  

  
   
 

  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      console.error("User ID not found in session storage.");
      alert("User not logged in. Please log in again.");
      return;
    }
  
    try {
      // const isActive = formData.isActive === "Active";

  
      // Construct payload
      const payload: Record<string, any> = {
        tenantID: selectedTenant,
        hospitalName: formData.hospitalName.trim(),
        hospitalCode: formData.hospitalCode.trim(),
        hospitalType: formData.hospitalType.trim(),
        createdBy: userID,
        updatedBy: userID,
        isActive: formData.isActive, // Ensure boolean is sent
      };
      
      
  
      if (formData.hospitalID) {
        payload.hospitalID = formData.hospitalID; // Include hospitalID for updates
      }
  
      const url = "https://predart003-001-site1.anytempurl.com/api/Hospital";
  
      let response;
      if (formData.hospitalID) {
        console.log("Performing PUT request...");
        response = await axios.put(url, payload);
        console.log("Update response:", response.data);
      } else {
        console.log("Performing POST request...");
        response = await axios.post(url, payload);
        console.log("Create response:", response.data);
      }
  
      if (response.status === 200 || response.status === 201) {
        console.log("Success:", response.data);
        await refreshTableData(); // Refresh table without reloading
        resetForm(); // Reset form without reloading the page
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error saving hospital:", error.response?.data || error.message);
    }
  };
  
  
  
  

  const refreshTableData = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}`);
      
      let hospitalData = response.data?.data ?? response.data; // Handle cases where 'data' is missing
  
      if (Array.isArray(hospitalData)) {
        setRowData([...hospitalData]);
        setFilteredData([...hospitalData]);
      } else {
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };
  
    
const resetFormData = () => {
  setFormData({
      hospitalID: '',  // Set to empty if it's a new hospital
      hospitalName: '',
      hospitalCode: '',
      hospitalType: '',
      isActive: 'true', // Ensure default is active
     
  });
};

  
const resetForm = () => {
  setShowForm(false); // Hide the form after reset
  setFormMode(""); // Reset form mode (e.g., "Edit" or "Create")
  setFormData({
    hospitalID: '',  
    hospitalName: "",
    hospitalCode: "",
    hospitalType: "",
    isActive: true, // Default to true for new entries
  });
};


  
const handleEdit = (data: RowData) => {
  setFormData({
    hospitalID: data.hospitalID,
    hospitalName: data.hospitalName,
    hospitalCode: data.hospitalCode,
    hospitalType: data.hospitalType,
    isActive: !!(data.isActive === "true" || data.isActive === true || data.isActive === 1), // Convert to boolean
  });

  setShowForm(true);
  setFormMode("Edit");

  // Scroll to the edit form smoothly
  setTimeout(() => {
    editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
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
        <div 
        ref={editFormRef}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none">
          <h3 className="text-xl font-semibold mb-4">
            {formData.hospitalID === 0 ? 'Add New Data' : 'Edit Data'}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-wrap gap-4 items-center justify-between"
          >
<div className="grid grid-cols-3 gap-4 mb-4">
  {/* Tenant Dropdown */}
  <select
  value={selectedTenant || ''}
  onChange={(e) => setSelectedTenant(e.target.value)}
  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
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
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
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
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  />

  {/* Hospital Code Input */}
  <input
    type="text"
    id="hospitalCode"
    name="hospitalCode"
    placeholder="Hospital Code"
    maxLength={5}
    value={formData.hospitalCode}
    onChange={(e) => setFormData({ ...formData, hospitalCode: e.target.value })}
    required
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
   
 
 {/* Checkbox for Status - Only show in Edit mode */}
 {formMode === "Edit" && (
  <label className="text-black dark:text-black flex items-center w-fit cursor-pointer">
    <input
      type="checkbox"
      checked={formData.isActive}
      onChange={(e) => {
        setFormData((prev) => ({
          ...prev,
          isActive: e.target.checked,
        }));
      }}
      className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-md relative mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-gradient-to-b checked:from-[#004A99] checked:to-[#007BFF] checked:border-[#007BFF] checked:after:content-['✔️'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white"
    />
    <span>{formData.isActive ? "Active" : "Inactive"}</span>
  </label>
)}



<div>
  <input
     type="hidden" 
    id="createdBy"
    name="createdBy"
    placeholder="Created By"
    value={formData.createdBy || ''} // Ensure it defaults to an empty string
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })} // Directly update createdBy as string
    required
  />
</div>
    
</div>


            <div className="mt-4 flex gap-4">
            <CustomButton type="submit">
  {formData.hospitalID ? "Update" : "Save"}
</CustomButton>


<button
   onClick={() => setShowForm(false)}
    className="bg-[#d4d4d4] text-white py-2 px-4 rounded shadow-none hover:bg-[#808080] border border-[#d4d4d4]"
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
  onClick={() => {
    setFormData({ hospitalID: 0, hospitalType: "", hospitalName: "", hospitalCode: "", createdBy: "" }); // Reset form data
    setIsActive(false); // Reset checkbox state
    setShowForm(true);
    setFormMode("Add"); // 👈 Add this
  }}
>
  + Add
</button>

      </div>

      <div className="ag-theme-alpine mt-6 w-full" style={{ height: '400px' }}>
        
        
        <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10} // ✅ Default page size
        paginationPageSizeSelector={[10, 20, 50, 100]} // ✅ Enable dropdown for page size
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
            <CustomButton onClick={confirmDelete}>
  Yes, Delete
</CustomButton>


<button
    onClick={cancelDelete}
    className="bg-[#d4d4d4] text-white py-2 px-4 rounded shadow-none hover:bg-[#808080] border border-[#d4d4d4]"
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
