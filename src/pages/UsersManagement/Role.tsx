import React, { useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import { Edit } from "lucide-react";
import CustomButton from "../../components/CustomButton";
import api from "../../api/request";
interface RowData {
 roleID: string | null;
  roleName: string;
  roleCode: string;
  createdBy: string;
  status: string;
}

const Role: React.FC = () => {
  
  const gridColumnApi = useRef<any>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

 
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
  roleID: null,
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
    const response = await api.get("/Role");

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
    console.log("Editing row with roleID:", roleID);
  
    const rowToEdit = rowData.find((row) => row.roleID === roleID);
  
    if (rowToEdit) {
      console.log("Found row to edit:", rowToEdit);
  
      setFormData({ ...rowToEdit });
      setShowForm(true);
      setFormMode("Edit");
  
      // Wait a bit before scrolling to ensure the form is visible
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      console.error("Row not found for roleID:", roleID);
    }
  };
  

  
  
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    alert("User not logged in. Please log in again.");
    return;
  }

  try {
    const isActive = formData.status === "Active";

    // Construct payload according to API requirements:
    const payload: any = {
      roleName: formData.roleName,       // API expects "Role" (not roleName)
     roleCode: formData.roleCode || "",   // API might expect "RoleCode"
      createdBy: userID,
      isActive: isActive,
    };

    if (formData.roleID) {
      payload.RoleID = formData.roleID; // Include roleID only if updating
    }

    let response;
    if (!formData.roleID) {
      // POST to create new role (omit RoleID)
      response = await api.post("/Role", payload);
    } else {
      // PUT to update role (include RoleID)
      response = await api.put("/Role", payload);
    }

    if (
      response.data &&
      (response.data.success || Array.isArray(response.data.data))
    ) {
      await fetchRoles();
      setShowForm(false);
      resetFormData();
    } else {
      console.error("Unexpected response format:", response.data);
    }
  } catch (error) {
    console.error("Error saving role:", error);
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
    await api.delete(`/Role/${deleteRowId}`);

    const updatedData = rowData.filter((item) => item.roleID !== deleteRowId);
    setRowData(updatedData);
    setFilteredData(updatedData);

    setShowConfirmation(false);
    setDeleteRowId(null);
  } catch (error) {
    console.error("Error deleting role:", error);
    alert("Failed to delete the role. Please try again.");
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
    { headerName: "Role Name", field: "roleName",headerClass: 'left-header', 
      cellClass: 'text-left', sortable: true, filter: true,width: 350 },
    { headerName: "Role Code", field: "roleCode",cellClass: 'text-center', headerClass: 'center-header',sortable: true, filter: true,width: 160 },
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
  width: 50,
  headerClass: "center-header",
  cellClass: "text-center",
  cellRenderer: (params: any) => (
    <span
      className="cursor-pointer flex justify-center mt-3 items-center"
      onClick={() => handleEdit(params.data.roleID)}
    >
      <Edit size={18} className="text-blue-500 hover:scale-110 transition-transform" />
    </span>
  ),
},

    {
      headerName: "Delete",
      hide:true,
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
  const userID = sessionStorage.getItem("userID");

  if (!userID) {
    alert("User not logged in. Please log in again.");
    return;
  }

  const updatedRole = rowData.find((role) => role.roleID === roleID);
  if (!updatedRole) {
    console.error("Role not found in rowData");
    return;
  }

  // Prepare the payload
  const payload = {
    guidID: roleID, // API expects roleID as guidID
    updatedBy: userID,
    isActive: newStatus === "Active",
  };

  try {
    const response = await api.patch(`/Role`, payload); // Use `api` if configured
    if (response.status === 200) {
      // Update UI state
      const updatedData = rowData.map((item) =>
        item.roleID === roleID ? { ...item, status: newStatus } : item
      );
      setRowData(updatedData);
      setFilteredData(updatedData);
    } else {
      console.error("Failed to update status:", response.status);
    }
  } catch (error) {
    console.error("Error updating role status:", error);
    alert("Failed to update role status. Please try again.");
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
        <div 
        ref={formRef}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none">
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
               type="hidden"
                maxLength={5}
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
{/* Show status dropdown only in Edit mode */}
{formMode === "Edit" && (
  <select
    value={formData.status}
    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
    className="w-60 rounded-lg border border-stroke bg-white py-2 pl-4 pr-8 text-black outline-none focus:border-primary"
  >
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
)}

              
            </div>
            <div className="mt-4 flex gap-4">
             
              

              <CustomButton type="submit">
              {formMode === "Add" ? "Save" : "Update"}
</CustomButton>

<CustomButton type="button" onClick={() => setShowForm(false)}>
  Cancel
</CustomButton>
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
  
       

        <CustomButton onClick={handleAdd}>
      + Add
    </CustomButton>
      </div>



      {/* AgGrid Table */}
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      

<AgGridReact
   rowData={filteredData}
  ref={gridApi}
  gridOptions={{}}
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
     
      
      {/* Deletion Confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
              
             

              <CustomButton onClick={confirmDelete}>Yes, Delete</CustomButton>
<CustomButton onClick={cancelDelete} className="bg-gray-300 text-black hover:bg-gray-400">
  Cancel
</CustomButton>
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
