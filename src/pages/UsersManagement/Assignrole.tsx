import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { fetchHospitalAPI, fetchRoles } from '../../Utils';
import CustomButton from '../../components/CustomButton';
import api from '../../api/request';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface RowData {
  userID: number;
  tenantName: string;
  username: string;
  mobile: string;
  hospitalType: string;
  email: string;
  roles: string[]; // Now roles is an array of strings (multi-role support)
  status: string;
  assignRole: string;
}

// Define a type for the UserRole data
interface UserRole {
  userID: number;
  tenantName: string;
  username: string;
  email: string;
  mobile: string;
}

interface Tenant {
  tenantID: number;
  tenantName: string;
}

interface User {
  userID: number;
  tenantID: number;
  username: string;
  email: string;
  mobile: string;
}
const Assignrole: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false); // Popup visibility
  const [roles, setRoles] = useState<string[]>([]); // Fetched role names
  const [selectedUser, setSelectedUser] = useState<any>(null); // User details for whom roles are assigned
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]); // Store selected role IDs
  const [currentUserID, setCurrentUserID] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [allRoles, setAllRoles] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [tenant, setTenant] = useState('');
  const [hospitality, setHospitality] = useState('');
  const [username, setUserName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [rowData, setRowData] = useState<UserRole[]>([]);

  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<RowData>({
    userID: 0,
    tenantName: '',
    username: '',
    mobile: '',
    email: '',
    hospitalType: '',
    roles: [], // Initially no roles selected
    status: 'Active',
    assignRole: '',
  });
  const [tenants, setTenants] = useState([]); // State for tenant data
  const [selectedTenant, setSelectedTenant] = useState('');

  const [hospitalities, setHospitalities] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);

  const [error, setError] = useState<string | null>(null);

  //fetch from hp utils
  useEffect(() => {
    const getHospitalTypes = async () => {
      const types = await fetchHospitalAPI();
      setHospitalTypes(types);
    };

    getHospitalTypes();
  }, []);

  // Fetch tenant data

   useEffect(() => {
    // Using axios to fetch the tenant data
    api.get('/Tenant') // Use the base URL from the axios instance
      .then((response) => {
        console.log('Tenant Data:', response.data);
        setTenants(response.data.data || response.data); // Adjust based on API structure
      })
      .catch((error) => {
        console.error('Error fetching tenant data:', error);
      });
  }, []);

  // Fetch user data and map tenantName
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Using axios to make the request
        const response = await api.get('/User');
        const result = response.data; // Axios automatically parses the response as JSON

        console.log('API Response:', result); // Debugging log

        let usersArray = [];

        // Check if response is an array or contains data in a 'data' field
        if (Array.isArray(result)) {
          usersArray = result;
        } else if (result.success && Array.isArray(result.data)) {
          usersArray = result.data;
        } else {
          console.error('❌ Unexpected API response format:', result);
          return;
        }

        // Create a tenant lookup for faster mapping
        const tenantLookup = tenants.reduce((acc, tenant) => {
          acc[tenant.tenantID] = tenant.tenantName;
          return acc;
        }, {});

        // Transform data to include tenantName
        const transformedData = usersArray.map((user: User) => ({
          ...user,
          tenantName: tenantLookup[user.tenantID] || 'Unknown Tenant',
        }));

        setRowData(transformedData);
        setUsers(transformedData.map((user) => user.username));
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        alert('Error fetching user data.');
      }
    };

    // Fetch users once tenants are loaded
    if (tenants.length > 0) {
      fetchUsers();
    }
  }, [tenants]);

  if (error) {
    return <div>Error: {error}</div>;
  }
  // Handle tenant selection
  const handleTenantChange = (e) => {
    setSelectedTenant(e.target.value);
    console.log(`Selected Tenant: ${e.target.value}`);
  };

 

const handleSaveRoles = async () => {
  if (selectedRoles.length === 0) {
    toast.warn('Please select at least one role.');
    return;
  }

  const userID = selectedUser?.userID;
  if (!userID) {
    toast.error('User not selected.');
    return;
  }

  const createdBy = sessionStorage.getItem('userID');
  if (!createdBy) {
    console.error('Logged-in user ID not found in session storage.');
    toast.error('User not logged in. Please log in again.');
    return;
  }

  const roleAssignments = selectedRoles.map((roleID) => ({
    userID,
    roleID,
    createdBy,
  }));

  try {
    const response = await api.post('/UserRoles/AssignRoles', roleAssignments);
    const result = response.data;

    if (response.status !== 200) {
      console.error('Failed to assign roles:', result.errors || result.message);
      toast.error(`Failed to assign roles: ${result.errors || result.message}`);
      return;
    }

    console.log('Roles assigned successfully:', result);
    toast.success('Roles assigned successfully!');

    const updatedRowData = rowData.map((row) =>
      row.userID === userID ? { ...row, assignRoleStatus: 'success' } : row,
    );
    setRowData([...updatedRowData]);
    setShowPopup(false);
  } catch (error) {
    console.error('Error during role assignment:', error);
    toast.error('Error occurred while assigning roles. Please try again.');
  }
};

  // fetch role from utils
  useEffect(() => {
    const getRoles = async () => {
      const data = await fetchRoles();
      setRoles(data);
    };
    getRoles();
  }, []);

  const handleRoleSelection = (
    e: React.ChangeEvent<HTMLInputElement>,
    role: string,
  ) => {
    if (e.target.checked) {
      // Add role to selectedRoles if checked
      setSelectedRoles((prev) => [...prev, role]);
    } else {
      // Remove role from selectedRoles if unchecked
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
    }
  };

  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'ID',
      field: 'userID',
      width: 100,
      sortable: true,
      filter: true,
      headerClass: 'text-left',
      cellClass: 'text-center',
      hide: 'true',
    },
    {
      headerName: 'S.No',
      valueGetter: (params: any) => params.node.rowIndex + 1, // Automatically generate serial number
      flex: 0.55, // Reduced flex to make it smaller
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: false, // Optional: you can disable sorting for the serial number column
      filter: false, // Optional: you can disable filtering for the serial number column
    },
    {
      headerName: 'Tenant Name',
      hide: true,
      field: 'tenantName',
      sortable: true,
      filter: true,
      flex: 1,
      headerClass: 'left-header',
      cellClass: 'text-left',
      cellRenderer: (params) => params.value || 'No Tenant Name',
    },

    {
      headerName: 'User Name',
      field: 'username',
      sortable: true,
      filter: true,
      flex: 1.5,
      headerClass: 'left-header',
      cellClass: 'text-left',
      cellRenderer: (params) => params.value || 'No User Name', // Handle empty values
    },
    {
      headerName: 'Mobile No',
      field: 'mobile',
      sortable: true,
      flex: 0.9,
      filter: true,
      headerClass: 'center-header',
      cellClass: 'text-center',
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      flex: 1.5,
      headerClass: 'left-header',
      cellClass: 'text-left',
    },

    {
      headerName: 'Assign Role',
      field: 'assignRole',
      flex: 1,
      headerClass: 'text-center',
      cellClass: 'text-left',
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleChangeRole(params.data)} // Pass the whole row data
          className="cursor-pointer text-blue-500 font-bold"
        >
          AssignRole
        </span>
      ),
      cellClassRules: {
        // Apply green color if role assignment was successful
        'text-green-500': (params: any) =>
          params.data.assignRoleStatus === 'success',
        'text-red-500': (params: any) =>
          params.data.assignRoleStatus === 'failed',
      },
    },
  ];

  const handleRoleToggle = (roleID: string) => {
    setSelectedRoles(
      (prevSelected) =>
        prevSelected.includes(roleID)
          ? prevSelected.filter((id) => id !== roleID) // Remove if already selected
          : [...prevSelected, roleID], // Add if not selected
    );
  };

  const toggleStatus = (params: any) => {
    const updatedData = rowData.map((item) =>
      item.userID === params.data.userID
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item,
    );
    setRowData(updatedData);
    setFilteredData(updatedData);
  };

  const handleChangeRole = async (user: any) => {
    setSelectedUser(user); // Store the selected user details
    setShowPopup(true); // Open the popup

    try {
      // Fetch all available roles
      const rolesResponse = await api.get('/Role');
    if (rolesResponse.status !== 200) throw new Error('Failed to fetch roles');

    const rolesResult = rolesResponse.data;

      // Ensure roles data is an array
      if (rolesResult.success && Array.isArray(rolesResult.data)) {
        setAllRoles(rolesResult.data);
      } else {
        console.error('Roles response is not an array:', rolesResult);
        return;
      }

      // Fetch roles assigned to the selected user
     const userRolesResponse = await api.get(`/UserRoles/${user.userID}`);
    if (userRolesResponse.status !== 200) throw new Error('Failed to fetch user roles');

    const userRolesResult = userRolesResponse.data;

      // **Debugging Log**
      console.log('Fetched user roles response:', userRolesResult);

      // Ensure user roles data is an array before processing
      if (userRolesResult.success && Array.isArray(userRolesResult.data)) {
        const assignedRoleIDs = userRolesResult.data.map(
          (role: any) => role.roleID,
        );
        setSelectedRoles(assignedRoleIDs);
      } else {
        console.error('User roles response is not an array:', userRolesResult);
      }
    } catch (error) {
      console.error('Error fetching roles or user roles:', error);
    }
  };

  const handleRoleChange = (roleID: number) => {
    setSelectedRoles(
      (prevSelectedRoles) =>
        prevSelectedRoles.includes(roleID)
          ? prevSelectedRoles.filter((id) => id !== roleID) // Remove the role
          : [...prevSelectedRoles, roleID], // Add the role
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!Array.isArray(rowData)) {
      console.error('rowData is not an array:', rowData);
      return;
    }

    const updatedData = rowData.map((item) =>
      item.userID === formData.userID
        ? { ...item, roles: formData.roles }
        : item,
    );

    setRowData(updatedData);
    setFilteredData(updatedData); // Ensure filteredData is also updated
    setShowForm(false); // Close the form
  };

  const applyFilters = () => {
    const filtered = rowData.filter((row) => {
      return (
        (tenant ? row.tenantName.includes(tenant) : true) &&
        (hospitality ? row.username.includes(hospitality) : true) &&
        (username ? row.username.includes(username) : true) &&
        (quickSearchText
          ? row.username
              .toLowerCase()
              .includes(quickSearchText.toLowerCase()) ||
            row.email.toLowerCase().includes(quickSearchText.toLowerCase()) ||
            row.tenantName.toLowerCase().includes(quickSearchText.toLowerCase())
          : true)
      );
    });
    setFilteredData(filtered);
  };

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    console.log('Grid is ready', params);
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Assign Role
      </h2>

      {/* Dropdowns for Tenant, Hospitality, and Users */}
      <div className="flex gap-4 mb-4 items-center">
        {/* Tenant Dropdown */}
        {/*        
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
</select> */}

        {/* <select
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
          {type.name} 
        </option>
      ))
    ) : (
      <option value="">No Hospital Types Available</option>
    )}
  </select> */}

        <select
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={(e) => setUserName(e.target.value)}
        >
          <option value="">Select User</option>
          {users.map((username, index) => (
            <option key={index} value={username}>
              {username}
            </option>
          ))}
        </select>

        <CustomButton onClick={applyFilters}>Search</CustomButton>
      </div>

      {/* Grid Table */}
  <ToastContainer position="top-right" autoClose={3000} />
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData} // Ensure the updated rowData is passed here
          onGridReady={onGridReady}
          domLayout="autoHeight"
          gridOptions={{}}
          pagination={true}
          paginationPageSize={10} // ✅ Default page size
          paginationPageSizeSelector={[10, 20, 50, 100]} // ✅ Enable dropdown for page size
          headerHeight={40}
          rowHeight={40}
        />
      </div>

      {/* Role Change Form Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-lg font-bold mb-6 text-center">Assign Role</h2>

            <form>
              {/* Display the selected user's name */}
              <div className="mb-4">
                <p className="text-lg font-medium">
                  Assign roles for: {selectedUser?.username}
                </p>
              </div>

              {/* Dynamically render roles in multiple rows with 3 checkboxes per row */}
              <div className="grid grid-cols-3 gap-6 mb-4">
                {allRoles.map((role) => (
                  <div key={role.roleID} className="role-checkbox">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={role.roleID}
                        checked={selectedRoles.includes(role.roleID)} // Checked if the role is in the array
                        onChange={() => handleRoleChange(role.roleID)} // Toggle role
                      />
                      {role.roleName}
                    </label>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-4 justify-end">
                <CustomButton onClick={() => setShowPopup(false)}>
                  Cancel
                </CustomButton>

                <CustomButton onClick={handleSaveRoles}>Save</CustomButton>
              </div>
            </form>
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

export default Assignrole;
