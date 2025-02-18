import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface RowData {
  userID: number;
  tenantName: string;
  username: string;
  mobile: string;
  email: string;
  role: string;
  isActive: string;
}
const Users: React.FC = () => {
  const [apiData, setApiData] = useState([]);
  const [name, setName] = useState(''); // Name filter for UI
  const [isActive, setIsActive] = useState(false); // Active filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState('');
   const [tenants, setTenants] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
   const [selectedTenant, setSelectedTenant] = useState("");
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Show confirmation for deletion
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null); // ID of row to delete
  const [formData, setFormData] = useState({
    userID: 0,
    username: '',
    email: '',
    mobile: '',
    isActive: 'Active',
    tenantID: '',
    createdBy: '',
    password: '', // New field
    userPlan: 'Free', // Default plan
  });
  

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

  // Fetch data on component mount (only once)
  useEffect(() => {
    // Function to fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/User',
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setApiData(data.data);
          setRowData(data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Only fetch data when apiData is empty (to prevent multiple requests)
    if (apiData.length === 0) {
      fetchData();
    }
  }, [apiData]); // Empty dependency array means it runs only once

  // Log the rowData to check if it's being updated correctly
  // useEffect(() => {
  //   console.log('Row Data:', rowData); 
  // }, [rowData]);


  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/Tenant")
      .then((response) => response.json())
      .then((data) => {
        console.log("Tenant Data Structure:", data);
        setTenants(data.data || data); // Adjust if needed
      })
      .catch((error) => console.error("Error fetching tenant data:", error));
  }, []);
  


  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'ID',
      field: 'userID',
      hide: true,
      sortable: true,
      filter: true,
      flex: 1,
      headerClass: 'text-left',
      cellClass: 'left',
    },
    {
      headerName: 'S.No',
      valueGetter: (params: any) => params.node.rowIndex + 1,
      flex: 0.8,
      headerClass: 'text-left',
      cellClass: 'left',
      sortable: false,
      filter: false,
    },
    ...(isSuperAdmin
      ? [
          {
            headerName: 'Tenant Name',
            field: 'tenantID',
            flex: 1.5,
            headerClass: 'text-left',
            cellStyle: { textAlign: 'left' },
            valueGetter: (params: any) => {
              if (!tenants.length) return 'Loading...';
              const tenant = tenants.find((t) => String(t.tenantID) === String(params.data.tenantID));
              return tenant ? tenant.tenantName : 'N/A';
            },
          },
        ]
      : []), // Only add this column if isSuperAdmin is true
    {
      headerName: 'User Name',
      field: 'username',
      sortable: true,
      filter: true,
      flex: 2,
      headerClass: 'text-left',
      cellStyle: { textAlign: 'left' },
    },
    {
      headerName: 'Mobile No',
      field: 'mobile',
      sortable: true,
      filter: true,
      flex: 1.3,
      headerClass: 'text-left',
      cellStyle: { textAlign: 'left' },
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      flex: 2,
      headerClass: 'text-left',
      cellStyle: { textAlign: 'left' },
    },
    {
      headerName: 'Status',
      field: 'isActive',
      flex: 1,
      headerClass: 'text-center',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => {
        const isActive = params.value === 'Active' || params.value === true;
        return (
          <span
            onClick={() => toggleStatus(params)}
            className={`cursor-pointer font-bold ${isActive ? 'text-green-500' : 'text-red-400'} hover:underline`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      headerName: 'Edit',
      flex: 0.7,
      headerClass: 'text-center',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEdit(params.data.userID)}
          className="cursor-pointer text-blue-500 font-bold"
        >
          Edit
        </span>
      ),
    },
    {
      headerName: 'Delete',
      flex: 0.8,
      headerClass: 'text-center',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.userID)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
      suppressSizeToFit: true,
      width: 150,
    },
  ];
  

  const toggleStatus = (params: any) => {
    const updatedData = rowData.map((item) =>
      item.userID === params.data.userID
        ? {
            ...item,
            isActive:
              item.isActive === 'Active' || item.isActive === true
                ? 'Inactive'
                : 'Active',
          }
        : item,
    );
    setRowData(updatedData);
    setFilteredData(updatedData);
  };

  
  
  const handleAdd = () => {
    setFormData({
      userID: 0,
      username: '',
      email: '',
      mobile: '',
      isActive: 'Active',
      tenantID: '',
      createdBy: '',
      password: '',
      userPlan: 'Free',
    });
    setShowForm(true);
    setIsFormVisible(false);
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setIsFormVisible(true);
    
  };
  
  
  const handleDelete = (userID: number) => {
    setDeleteRowId(userID);
    setShowConfirmation(true);
  };
  
  const confirmDelete = async () => {
    try {
      // Send DELETE request to API to delete the user by userID
      const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/User/${deleteRowId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete the user');
      }
  
      // If the delete request is successful, filter the rowData to remove the deleted user
      const updatedData = rowData.filter((item) => item.userID !== deleteRowId);
      setRowData(updatedData);
      setFilteredData(updatedData);
  
      // Hide the confirmation modal and reset deleteRowId
      setShowConfirmation(false);
      setDeleteRowId(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('There was an error deleting the user. Please try again.');
    }
  };
  
  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeleteRowId(null);
  };
  
  const handleStatusChange = async (userID: number, currentStatus: boolean) => {
    try {
      // Toggle the isActive status
      const updatedStatus = !currentStatus;
  
      // Send PATCH request to API to update isActive status of the user
      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/User/${userID}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isActive: updatedStatus,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
  
      // Update the rowData and filteredData states with the new status
      const updatedData = rowData.map((item) =>
        item.userID === userID ? { ...item, isActive: updatedStatus } : item
      );
  
      setRowData(updatedData);
      setFilteredData(updatedData);
  
      // Toggle form visibility based on the status
      if (updatedStatus) {
        setShowForm(true); // Show the form when status is Active
        setIsFormVisible(false); // Hide the form when status is Active
      } else {
        setShowForm(false); // Hide the form when status is Inactive
        setIsFormVisible(true); // Show the form when status is Inactive
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('There was an error updating the status. Please try again.');
    }
  };
  
  

  const handleEdit = (userID: number) => {
    
    const selectedRow = rowData.find((item) => item.userID === userID);
    if (selectedRow) {
      setFormData({
        userID: selectedRow.userID,
        username: selectedRow.username || '',
        email: selectedRow.email || '',
        mobile: selectedRow.mobile || '',
        isActive: selectedRow.isActive ? 'Active' : 'Inactive', // Convert boolean to string
        tenantID: selectedRow.tenantID || '',
        createdBy: selectedRow.createdBy || '',
        password: '', // Leave this field empty for security reasons
        userPlan: selectedRow.userPlan || 'Free',
      });
      setShowForm(true);
      setIsFormVisible(false);
    }
  };

  const handleSave = () => {
    const updatedData = rowData.map((item) =>
      item.userID === formData.userID
        ? {
            ...item,
            username: formData.username,
            email: formData.email,
            mobile: formData.mobile,
            isActive: formData.isActive === 'Active', // Convert to boolean
            tenantID: formData.tenantID,
            userPlan: formData.userPlan,
          }
        : item
    );
  
    setRowData(updatedData);
    setFilteredData(updatedData);
    setShowForm(false);
  };
   
  const [roleIDs, setRoleIDs] = useState([]);

   const [roleNames, setRoleNames] = useState([]);

  

   useEffect(() => {
     const userID = sessionStorage.getItem("userID");
   
     if (!userID) {
       console.error("User ID not found in session storage.");
       return;
     }
   
     const fetchUserRoles = async () => {
       try {
         const roleResponse = await fetch(`https://predart003-001-site1.anytempurl.com/api/UserRoles/${userID}`);
   
         if (!roleResponse.ok) {
           throw new Error("Failed to fetch user roles.");
         }
   
         const roleData = await roleResponse.json();
   
         if (roleData.success && Array.isArray(roleData.data) && roleData.data.length > 0) {
           const roleIDs = roleData.data.map((item) => item.roleID);
   
           // Fetch role names
           const roleNamesPromises = roleIDs.map(async (roleID) => {
             const roleResponse = await fetch(`https://predart003-001-site1.anytempurl.com/api/Role/${roleID}`);
             if (!roleResponse.ok) {
               console.error(`Failed to fetch role name for roleID: ${roleID}`);
               return null;
             }
             const roleInfo = await roleResponse.json();
             return roleInfo?.data?.roleName || `Unknown Role (${roleID})`;
           });
   
           const resolvedRoleNames = await Promise.all(roleNamesPromises);
   
           // Check if the user is a SuperAdmin
           setIsSuperAdmin(resolvedRoleNames.includes("SuperAdmin"));
         }
       } catch (error) {
         console.error("Error fetching user roles:", error);
       }
     };
   
     fetchUserRoles();
   }, []);
   

  


  const handleFormSubmit = async (e) => {
    e.preventDefault();
  // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");

  console.log("Retrieved userID from sessionStorage:", userID);
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }
    // Convert `isActive` to boolean
    const isActiveBoolean = formData.isActive === "Active";
  
    // Set method dynamically based on userID
    const method = formData.userID === 0 ? "POST" : "PUT";
  
    // Use the same URL for both POST and PUT
    const url = "https://predart003-001-site1.anytempurl.com/api/User";
  
    // Construct request body with hardcoded tenantID and createdBy
    const body = JSON.stringify({
      userID: formData.userID === 0 ? undefined : formData.userID, // Include userID only for PUT
      username: formData.username.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      isActive: isActiveBoolean, // Convert to boolean
      tenantID: selectedTenant,  // Hardcoded tenantID
      createdBy: userID,  // Hardcoded createdBy
      password: formData.password.trim() || "DefaultPassword",
      userPlan: formData.userPlan || "Free",
    });
  
    console.log("Request Body:", body);
  
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
  
      const data = await response.json();
      console.log("API Full Response:", data);
  
      if (response.ok) {
        console.log("User added/updated successfully.");
        if (formData.userID === 0) {
          const newUser = { ...formData, userID: data.userID };
          setRowData((prev) => [...prev, newUser]);
          setFilteredData((prev) => [...prev, newUser]);
        } else {
          const updatedData = rowData.map((item) =>
            item.userID === formData.userID ? { ...item, ...formData } : item
          );
          setRowData(updatedData);
          setFilteredData(updatedData);
        }
  
        setShowForm(false);
        setFormData({
          userID: 0,
          username: "",
          email: "",
          mobile: "",
          isActive: "Active",
          tenantID: "",
          createdBy: "",
          password: "",
          userPlan: "Free",
        });
      } else {
        console.error("API Error:", data.errors || data.message);
        alert("Error: " + JSON.stringify(data.errors || data.message));
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };
  
  
  
 
  
  
  
  
  const handleFilterSearch = () => {
    const filtered = apiData.filter((item) => {
      const matchesName = name
        ? item.username.toLowerCase().includes(name.toLowerCase())
        : true;
      const matchesStatus =
        isActive !== undefined ? item.isActive === isActive : true;
      return matchesName && matchesStatus;
    });

    setFilteredData(filtered);
    setRowData(filtered); // Update rowData with filtered data
  };

  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter(
      (row) =>
        row.username.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.tenantName.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.email.toLowerCase().includes(quickSearchText.toLowerCase()),
    );
  };

  
  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Users</h2>
      {isFormVisible && (
        <div>
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
          <label className="text-black dark:text-black flex items-center w-fit cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-md relative mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-gradient-to-b checked:from-[#004A99] checked:to-[#007BFF] checked:border-[#007BFF] checked:after:content-['✔️'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white"
            />
            <span>Active</span>
          </label>
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
        <hr className="border-t-2 border-stroke bg-transparent my-6" />

        </div>
      )}
      
      {showForm && (
        <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
         text-black outline-none">
          <h3 className="text-xl font-semibold mb-4">
            {formData.userID === 0 ? 'Add New Data' : 'Edit Data'}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-wrap gap-4 items-center justify-between"
          >
          <div className="grid grid-cols-4 gap-4 mb-2">
  {/* Tenant Name */}
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

  {/* Username */}
  <input
    type="text"
    value={formData.username}
    onChange={(e) =>
      setFormData({ ...formData, username: e.target.value })
    }
    placeholder="User Name"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  />

  {/* Email */}
  <input
    type="email"
    value={formData.email}
    onChange={(e) =>
      setFormData({ ...formData, email: e.target.value })
    }
    placeholder="Email"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
  />

  {/* Mobile */}
  <input
    type="text"
    value={formData.mobile}
    onChange={(e) =>
      setFormData({ ...formData, mobile: e.target.value })
    }
    placeholder="Mobile"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
  />
</div>

{/* Second Row: Password, Status (Only for Edit Mode), User Plan */}
<div className="grid grid-cols-4 gap-4 mb-2">
  {/* Password */}
  <input
    type="password"
    value={formData.password}
    onChange={(e) =>
      setFormData({ ...formData, password: e.target.value })
    }
    placeholder="Password"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
  />

  {/* Status (Only Show in Edit Mode) */}
  {formData.userID !== 0 && (
    <select
      value={formData.isActive}
      onChange={(e) => {
        const newStatus = e.target.value;
        setFormData({ ...formData, isActive: newStatus });
        handleStatusChange(formData.userID, newStatus === 'Active');
      }}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  )}

  {/* User Plan */}
  <select
    value={formData.userPlan}
    onChange={(e) =>
      setFormData({ ...formData, userPlan: e.target.value })
    }
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  >
    <option value="Free">Free</option>
    <option value="Bronze">Bronze</option>
    <option value="Silver">Silver</option>
    <option value="Gold">Gold</option>
    <option value="Diamond">Diamond</option>
    <option value="Platinum">Platinum</option>
  </select>

  {/* Empty column for spacing when Status is hidden */}
  {formData.userID === 0 && <div></div>}
</div>

{/* Buttons Row */}
<div className="flex justify-end gap-4 mt-4">
  <button
    type="submit"
    onClick={handleFormSubmit}
    className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
  >
    {formData.userID === 0 ? 'Add' : 'Update'}
  </button>
  
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
          onClick={handleAdd}
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
    </div>
  );
};

export default Users;
