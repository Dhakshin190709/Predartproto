import React, { useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";

interface RowData {
roleID: number;
  roleName: string;
  roleCode: string;
  createdBy: string;
  status: string;
}

const Role: React.FC = () => {
  
  const gridColumnApi = useRef<any>(null);

 
  const gridApi = useRef<any>(null);
  const [name, setName] = useState(''); // Role Name filter for UI
  const [formMode, setFormMode] = useState(""); 
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(""); // For global search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [showConfirmation, setShowConfirmation] = useState(false); // Show confirmation for deletion
 
  
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState<RowData>({
  roleID: 0,
    roleName: "",
    roleCode: "",
    createdBy: "",
    status: "Active",
  });
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("https://predart003-001-site1.anytempurl.com/api/Role");
      if (response.data && Array.isArray(response.data.data)) {
        const roles = response.data.data.map((role: any) => ({
          roleID: role.roleID,
          roleName: role.roleName,
          roleCode: role.roleCode,
          createdBy: role.createdBy || "",
          status: role.isActive ? "Active" : "Inactive",
        }));
        setRowData(roles);
        setFilteredData(roles); // Update filtered data after fetching
      } else {
        console.error("Unexpected API response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };
  



  const handleEdit = (roleID: number | string) => {
    // Log the roleID to see what's passed into the function
    console.log("Editing row with roleID:", roleID);
  
    const rowToEdit = rowData.find((row) => row.roleID === roleID);
  
    if (rowToEdit) {
      console.log("Found row to edit:", rowToEdit);
  
      // Set the form data for editing
      setFormData({ ...rowToEdit });
      setShowForm(true);  // Show the form modal
      setFormMode("Edit"); // Set form mode to "Edit"
    } else {
      console.error("Row not found for roleID:", roleID);
    }
  };


  
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }
    try {
      const isActive = formData.status === 'Active';
      const createdBy = userID; // Fixed CreatedBy ID
      let response;
  
      if (!formData.roleID) {
          // POST request for adding a new role
          response = await axios.post("https://predart003-001-site1.anytempurl.com/api/Role", {
              roleName: formData.roleName,
              roleCode: formData.roleCode,
              createdBy: createdBy,
              isActive: isActive,
          });
  
          if (response.data && Array.isArray(response.data.data)) {
              // Fetch latest data after adding a new role
              fetchRoles();
          } else {
              console.error("Error: response.data.data is not an array", response.data);
          }
      } else {
          // PUT request for updating an existing role (No roleID in URL)
          response = await axios.put("https://predart003-001-site1.anytempurl.com/api/Role", {
              roleID: formData.roleID,
              roleName: formData.roleName,
              roleCode: formData.roleCode,
              createdBy: createdBy,
              isActive: isActive,
          });
  
          if (response.data.success) {
              // Fetch latest data after updating the role
              fetchRoles();
          } else {
              console.error("Error updating role:", response.data.message);
          }
      }
  
      // Reset form and hide it
      setShowForm(false);
      resetFormData();
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };
  


  
// Fetch updated list of roles to refresh the table
const refreshTableData = async () => {
  try {
    const response = await axios.get("https://predart003-001-site1.anytempurl.com/api/Role"); // Make a GET request to fetch the latest tenant data
    if (response.data && Array.isArray(response.data.data)) {
      setRowData([...response.data.data]);  // Refresh the row data with the updated list
      setFilteredData([...response.data.data]); // Refresh filtered data
    } else {
      console.error('Error: response.data.data is not an array', response.data);
    }
  } catch (error) {
    console.error('Error fetching table data:', error);
  }
};

const resetFormData = () => {
  setFormData({
  roleID: 0,                // Reset roleID to 0 for a new role
    roleName: '',
    roleCode: '',
    createdBy: '',        // Reset createdBy to an empty string
    status: 'Active',     // Assuming status is a string, you can set default to 'Active'
  });
};

  
  
  
const handleAdd = () => {
  setFormMode("Add"); // Set mode to 'Add'
  setFormData({
      roleID: 0,
      roleName: "",
      roleCode: "",
      createdBy: "",
      status: "Active",
  }); // Reset form data
  setFormMode('Add');
  setShowForm(true); // Show the form

  // Optionally fetch the latest data to ensure the table is updated
  fetchRoles();
};

  
 // Reset form data when switching to "Add" mode
  useEffect(() => {
    if (formMode === 'Add') {
      setFormData({
        roleID: 0,
        roleName: "",
        roleCode: "",
        createdBy: "",
        status: "Active",
      });
    }
  }, [formMode]);


const handleSave = () => {
  // Perform save operation (Add or Update)
  console.log(formMode === "Add" ? "Data Added" : "Data Updated");
  resetForm();
};

const handleCancel = () => {
  resetForm();
};

const resetForm = () => {
  setShowForm(false); // Show the fields again
  setFormMode("");
  setName(""); // Reset input fields if necessary
  setIsActive(false);
};
  


const handleDelete = (roleID: number) => {
  setDeleteRowId(roleID);
  setShowConfirmation(true);
};



const confirmDelete = async () => {
  try {
    await axios.delete(`https://predart003-001-site1.anytempurl.com/api/Role/${deleteRowId}`);
    const updatedData = rowData.filter((item) => item.roleID !== deleteRowId);
    setRowData(updatedData);
    setFilteredData(updatedData);
    setShowConfirmation(false);
    setDeleteRowId(null);
  } catch (error) {
    console.error("Error deleting row:", error);
  }
};


// Cancel the delete action
const cancelDelete = () => {
  setShowConfirmation(false); // Hide the confirmation dialog
  setDeleteRowId(null); // Clear the delete row id
};

  const columnDefs: ColDef<RowData>[] = [
    
    { headerName: "S.No", field: "S.No", sortable: true,cellClass: 'text-center',headerClass: 'center-header', valueGetter: "node.rowIndex + 1",filter: true,width:100},
 
    { headerName: "Role ID", field: "roleID", sortable: true, filter: true,hide: true,width: 150 },
    { headerName: "Role Name", field: "roleName",headerClass: 'center-header', 
      cellClass: 'text-center', sortable: true, filter: true,width: 400 },
    { headerName: "Role Code", field: "roleCode",cellClass: 'text-center', headerClass: 'center-header',sortable: true, filter: true,width: 150 },
    {
      headerName: "Status",
      field: "status",
      width:100,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          className={`cursor-pointer font-bold ${
            params.value === "Active" ? "text-green-500" : "text-red-400"
          }`}
          onClick={() => handleStatusToggle(params.data.roleID, params.value)} // Trigger status toggle on click
        >
          {params.value}
        </span>
      ),
    },
    
    
    {
      headerName: "Edit",
      flex: 0.5,
      width:50,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          className="cursor-pointer text-blue-500 font-bold"
          onClick={() => handleEdit(params.data.roleID)} // Ensure roleID is passed correctly
          
        >
          Edit
        </span>
      ),
    },
    {
      headerName: "Delete",
      flex: 0.5,
      width:50,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          className="cursor-pointer text-red-600 font-bold"
          onClick={() => handleDelete(params.data.roleID)} // Call the handleDelete function
        >
          x
        </span>
      ),
    },
  ];
  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  const handleStatusToggle = async (roleID: number, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const updatedRole = rowData.find((role) => role.roleID === roleID);
  
    if (updatedRole) {
      updatedRole.status = newStatus;
      setRowData(prevData =>
        prevData.map(item =>
          item.roleID === roleID ? { ...item, status: newStatus } : item
        )
      );
  
      const payload = {
        roleName: updatedRole.roleName,
        roleCode: updatedRole.roleCode,
        createdBy: updatedRole.createdBy,
        isActive: newStatus === "Active",
      };
  
      const url = `https://predart003-001-site1.anytempurl.com/api/Role/${updatedRole.roleID}`;
      try {
        const response = await axios.patch(url, payload);
        if (response.status === 200) {
          // Optionally refresh roles after success
          setFilteredData([...rowData]);  // Ensure filtered data is updated
        } else {
          console.error('Failed to update status');
        }
      } catch (error) {
        console.error("Error updating role status:", error);
      }
    }
  };
  
  

  
const applyGlobalSearch = () => {
  console.log("Search text:", quickSearchText); // Check the search text
  if (quickSearchText.trim() === "") {
    setFilteredData(rowData); // If search text is empty, reset filtered data to all data
  } else {
    const filteredData = rowData.filter((row) =>
      row.roleName.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.roleCode.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.roleID.toString().includes(quickSearchText) // Change 'id' to 'roleID'
    );
    console.log("Filtered data:", filteredData); // Check the filtered data
    setFilteredData(filteredData); // Apply the search filter
  }
};

useEffect(() => {
  console.log("Row data:", rowData); // Check the rowData structure
  applyGlobalSearch(); // Re-run the search filter whenever the `quickSearchText` or `rowData` changes
}, [quickSearchText, rowData]);

  
// Apply filters based on search fields
const handleFilterSearch = () => {
  const filtered = rowData.filter((item) =>
    (name ? item.roleName.toLowerCase().includes(name.toLowerCase()) : true) &&
    (isActive ? item.status === "Active" : true)
  );
  setFilteredData(filtered); // Update filtered data for rendering
};

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Roles</h2>
    
    

      {showForm && (
        <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none">
          <h3 className="text-xl font-semibold mb-4">{formData.roleID === 0 ? 'Add New Role' : 'Edit Role'}</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <input
                type="text"
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                placeholder="Role Name"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <input
                type="text"
                value={formData.roleCode}
                onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                placeholder="Role Code"
                className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
             
  <input
  type="hidden"
    id="createdBy"
    name="createdBy"
    placeholder="Created By"
    value={formData.createdBy || ''} // Ensure it defaults to an empty string
    className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
     text-black outline-none focus:border-primary dark:border-form-strokedark
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })} // Directly update createdBy as string
    required
  />
<select
  value={formData.status}
  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                {/* {formData.roleID === 0 ? 'Add' : 'Update'} */}
                {formMode === "Add" ? "Add" : "Update"}
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
  
        <button
           className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
           hover:from-[#007BFF] hover:to-[#004A99]
           text-white transition duration-150 
           ease-out hover:ease-in py-2 px-5 rounded-lg"
                       
           onClick={handleAdd}
        >
          + Add
        </button>
      </div>



      {/* AgGrid Table */}
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          gridOptions={{}}
          ref={gridApi}
          domLayout="autoHeight"
          rowData={filteredData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
     
      
      {/* Deletion Confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              <button
                 onClick={confirmDelete}
                // onClick={handleSave}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                hover:from-[#007BFF] hover:to-[#004A99]
                text-white transition duration-150 
                ease-out hover:ease-in py-2 px-5 rounded-lg"
                            
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                // onClick={handleCancel}
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

export default Role;
