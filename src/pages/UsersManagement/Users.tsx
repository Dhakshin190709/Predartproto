import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import { Edit } from 'lucide-react';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Eye, EyeOff } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import {
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUsernameAvailability,
} from '../Utils/validationUtils';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
interface RowData {
  userID: number;
  tenantName: string;
  username: string;
  mobile: string;
  email: string;
  role: string;
  isActive: string;
  unitType: string;
}

const Users: React.FC = () => {
  const [apiData, setApiData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUnitName, setSelectedUnitName] = useState<string>('N/A');
  const [selectedUnitID, setSelectedUnitID] = useState(''); // Ensure default state

  const [selectedSecondDropdownValue, setSelectedSecondDropdownValue] =
    useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unitTypes, setUnitTypes] = useState<any[]>([]);
  const [selectedUnitType, setSelectedUnitType] = useState('');

  const [selectedSecondItem, setSelectedSecondItem] = useState('');
  const [secondDropdownData, setSecondDropdownData] = useState([]); // ✅ Ensure it's an array
  const [unitType, setUnitType] = useState('');
  const [secondDropdown, setSecondDropdown] = useState('');

  const [name, setName] = useState(''); // Name filter for UI
  const [isActive, setIsActive] = useState(false); // Active filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState('');
  const [tenants, setTenants] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Show confirmation for deletion
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null); // ID of row to delete
  const [formData, setFormData] = useState({
    userID: 0,
    username: '',
    email: '',
    phone: '',
    isActive: 'Active',
    tenantID: '',
    createdBy: '',
    unittype: '', // Ensure these fields exist
    seconddropdown: '',
    selectedUnitType: '', // Updated
    selectedSecondItem: '', // Updated
    password: '',
    userPlan: 'Free',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    tenantName: '',
    unittype: '',
    unitID: '',
    userPlan: '',
  });
  const formRef = useRef<HTMLDivElement | null>(null);
  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    if (gridApi.current) {
      gridApi.current.paginationSetPageSize(newSize);
    }
  };
  const fetchHospitalData = async () => {
    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Hospital',
      );
      const data = await response.json();
      console.log('Fetched Hospitals:', data);

      // ✅ Ensure state updates correctly
      setSecondDropdownData(data);
      return data;
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      return [];
    }
  };

  const fetchLaboratoryData = async () => {
    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Laboratory',
      );
      const result = await response.json();

      // ✅ Check if the response has the correct structure
      if (Array.isArray(result)) {
        console.log('Fetched Laboratory Data:', result);
        setSecondDropdownData(result);
        return result;
      } else if (result.success && Array.isArray(result.data)) {
        console.log('Fetched Laboratory Data:', result.data);
        setSecondDropdownData(result.data);
        return result.data;
      } else {
        console.error('Unexpected response format:', result);
        return [];
      }
    } catch (error) {
      console.error('Error fetching laboratory data:', error);
      return [];
    }
  };

  useEffect(() => {
    console.log('Updated secondDropdownData:', secondDropdownData);
  }, [secondDropdownData]);

  // Example: Edit Mode - Prefilled Data
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch Unit Types
  const fetchUnitTypes = async () => {
    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=UnitType',
      );
      const result = await response.json();

      console.log('Unit Types API Response:', result);

      if (result.success && Array.isArray(result.data)) {
        setUnitTypes(result.data);
      } else {
        setUnitTypes([]);
      }
    } catch (error) {
      console.error('Error fetching unit types:', error);
      setUnitTypes([]);
    }
  };

  useEffect(() => {
    fetchUnitTypes();
  }, []); // Runs once when the component mounts

  // State to store fetched unit names

  const [unitNames, setUnitNames] = useState<Record<string, string>>({});

  const unitNamesRef = useRef<{ [key: string]: string }>({});
  const fetchUnitName = async (unitType: string, unitID: string) => {
    // Check if data is already in cache
    const cachedName = unitNamesRef.current[unitID];
    if (cachedName) {
      console.log(`Using cached data for ${unitID}: ${cachedName}`);
      return cachedName; // Return cached value and don't call the API again
    }
    if (!unitID || unitID === 'N/A') {
      console.warn(`⚠️ Invalid unitID: ${unitID}`);
      return 'N/A';
    }

    const normalizedType = unitType?.trim().toLowerCase();
    console.log('🔍 Checking unitType before API call:', normalizedType);
    console.log('🔍 Checking unitID before API call:', unitID);

    if (!normalizedType) {
      console.warn(`⚠️ Missing or invalid unitType: ${unitType}`);
      return 'N/A';
    }

    // 🔄 Check Cache Before API Call
    if (unitNamesRef.current[unitID]) {
      console.log(`✅ Using Cached Name for ${unitID}`);
      return unitNamesRef.current[unitID];
    }

    // 🔄 Determine API URL
    let apiUrl = '';
    if (normalizedType === 'hospital') {
      apiUrl = `https://predart003-001-site1.anytempurl.com/api/Hospital/${unitID}`;
    } else if (normalizedType === 'lab') {
      apiUrl = `https://predart003-001-site1.anytempurl.com/api/Laboratory/${unitID}`;
    } else {
      console.warn(`❌ Invalid unitType provided: ${unitType}`);
      return 'N/A';
    }

    console.log(`🔗 Fetching from API: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error(`⚠️ API Request Failed: ${response.statusText}`);
        return 'N/A';
      }

      const result = await response.json();
      console.log(`✅ API Response for ${unitID}:`, result);

      let unitName = 'N/A';

      if (result?.data) {
        if (normalizedType === 'hospital' && result.success) {
          unitName = result.data.hospitalName?.trim() || 'N/A';
        } else if (normalizedType === 'lab' && result.success) {
          if (Array.isArray(result.data)) {
            const matchingLab = result.data.find(
              (lab) => String(lab.laboratoryID) === String(unitID),
            );
            unitName = matchingLab?.labName?.trim() || 'N/A';
          } else if (
            typeof result.data === 'object' &&
            String(result.data.laboratoryID) === String(unitID)
          ) {
            unitName = result.data.labName?.trim() || 'N/A';
          }
        }
      }

      // Cache the result
      unitNamesRef.current[unitID] = unitName;

      return unitName;
    } catch (error) {
      console.error(`⚠️ Error fetching unit name for ${unitID}:`, error);
      return 'N/A';
    }
  };

  const UnitNameRenderer: React.FC<any> = ({ data }) => {
    const { unitType, unitID } = data || {};
    const [name, setName] = useState('Loading...');

    useEffect(() => {
      const load = async () => {
        if (!unitType || !unitID) {
          setName('N/A');
          return;
        }

        const cachedName = unitNamesRef.current[unitID];
        if (cachedName) {
          setName(cachedName);
          return;
        }

        const n = await fetchUnitName(unitType, unitID);
        setName(n || 'N/A');
      };

      load();
    }, [unitType, unitID]);

    return <span>{name}</span>;
  };

  // Unit Type Change Handler
  const handleUnitTypeChange = (event) => {
    const unitID = event.target.value;
    setSelectedUnitID(unitID);

    console.log('🔵 Available unitTypes:', unitTypes);
    console.log('🟡 Selected Unit ID:', unitID);

    const selectedUnit = unitTypes.find(
      (unit) => String(unit.appLOVID) === unitID,
    );

    if (!selectedUnit) {
      console.warn('⚠️ No matching unit found for unitID:', unitID);
      setSelectedUnitType('');
      setErrors((prevErrors) => ({
        ...prevErrors,
        unitType: 'Unit Type is required',
      }));
      return;
    }

    const normalizedUnitType = selectedUnit.name.trim().toLowerCase();
    setSelectedUnitType(selectedUnit.name);

    console.log('🟢 Updated selectedUnitID:', unitID);
    console.log('🟢 Updated selectedUnitType:', selectedUnit.name);
    console.log('🔍 Normalized Unit Type:', normalizedUnitType);

    setErrors((prevErrors) => ({
      ...prevErrors,
      unitType: '', // clear unitType error
    }));

    if (normalizedUnitType === 'lab') {
      console.log('🧪 Fetching Lab Data...');
      fetchLaboratoryData();
    } else if (normalizedUnitType === 'hospital') {
      console.log('🏥 Fetching Hospital Data...');
      fetchHospitalData();
    } else {
      console.warn('⚠️ Unknown unit type:', selectedUnit.name);
    }
  };

  // Handle Second Dropdown Selection
  const handleSecondItemChange = (e) => {
    setSelectedSecondItem(e.target.value);

    // Clear the error for unitID when the user selects a valid item
    setErrors((prevErrors) => ({
      ...prevErrors,
      unitID: '', // clear unitID error
    }));
  };
  // Fetch Data Based on Selected Unit Type
  useEffect(() => {
    if (selectedUnitType === 'Lab') {
      fetchLaboratoryData();
    } else if (selectedUnitType === 'Hospital') {
      fetchHospitalData();
    } else {
      setSecondDropdownData([]); // Reset if neither Lab nor Hospital
    }
  }, [selectedUnitType]);

  // Fetch data on component mount (only once)

  const fetchAllUserData = async () => {
    try {
      let url = 'https://predart003-001-site1.anytempurl.com/api/User';
      const roleName = sessionStorage.getItem('roleName');
      const unitID = sessionStorage.getItem('unitID');

      if (roleName === 'HostitalAdmin' && unitID) {
        url += `?hospitalId=${unitID}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();

      if (Array.isArray(data)) {
        setApiData(data);
        setRowData(data);
        setFilteredData(data); // Also update grid data
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch user data.');
    }
  };

  useEffect(() => {
    fetchAllUserData();
  }, []);

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Tenant')
      .then((response) => response.json())
      .then((data) => {
        console.log('Tenant API Response:', data); // Debugging

        if (data.data) {
          setTenants(data.data); // Adjusting if API response contains { data: [...] }
        } else {
          setTenants(data);
        }
      })
      .catch((error) => console.error('Error fetching tenant data:', error));
  }, []);
  useEffect(() => {
    if (formData.userID !== 0 && formData.tenantID) {
      setSelectedTenant(formData.tenantID);
    }
  }, [formData.userID, formData.tenantID]);

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
    {
      headerName: 'User Name',
      field: 'username',
      sortable: true,
      filter: true,
      flex: 2,
      headerClass: 'text-left',
      cellStyle: { textAlign: 'left' },
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
              const tenant = tenants.find(
                (t) => String(t.tenantID) === String(params.data.tenantID),
              );
              return tenant ? tenant.tenantName : 'N/A';
            },
          },
        ]
      : []), // Only add this column if isSuperAdmin is true

    {
      headerName: 'phone No',
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
      headerName: 'Unit Type',
      field: 'unitType',
      sortable: true,
      filter: true,
      flex: 1.5,
      headerClass: 'text-left',
      cellStyle: { textAlign: 'left' },
      valueGetter: (params: any) => {
        const value = params.data?.unitType;
        return value ? value : 'N/A';
      },
    },

    {
      headerName: 'Unit Name',
      field: 'unitName',
      sortable: true,
      filter: true,
      flex: 2,
      headerClass: 'text-left',
      cellStyle: { textAlign: 'left' },
      cellRenderer: UnitNameRenderer, // Uses async fetching correctly
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
            className={`cursor-pointer font-bold ${
              isActive ? 'text-green-500' : 'text-red-400'
            } hover:underline`}
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
        <div
          onClick={() => handleEdit(params.data.userID)}
          className="cursor-pointer flex items-center justify-center w-8 h-8 mt-1 rounded-md hover:bg-gray-100"
        >
          <Edit size={18} className="text-blue-500" />
        </div>
      ),
    },
    {
      headerName: 'Delete',
      hide: true,
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

  const toggleStatus = async (params: any) => {
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    const updatedStatus =
      params.data.isActive === 'Active' || params.data.isActive === true
        ? false
        : true;

    const payload = {
      guidID: params.data.userID, // The user ID being updated

      updatedBy: userID,

      isActive: updatedStatus,
    };

    try {
      const response = await axios.patch(
        'https://predart003-001-site1.anytempurl.com/api/User',
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (response.status === 200) {
        console.log('User status updated successfully:', response.data);

        // Update the UI
        const updatedData = rowData.map((item) =>
          item.userID === params.data.userID
            ? { ...item, isActive: updatedStatus ? 'Active' : 'Inactive' }
            : item,
        );

        setRowData(updatedData);
        setFilteredData(updatedData);
      } else {
        console.error('Failed to update user status:', response.data);
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('An error occurred while updating the status.');
    }
  };

  const handleAdd = () => {
    setFormData({
      userID: 0,
      username: '',
      email: '',
      phone: '',
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
      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/User/${deleteRowId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

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
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update the rowData and filteredData states with the new status
      const updatedData = rowData.map((item) =>
        item.userID === userID ? { ...item, isActive: updatedStatus } : item,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      console.log('Updated formData:', newState); // Debugging
      return newState;
    });
  };

  const handleEdit = async (userID: number) => {
    if (!Array.isArray(rowData)) return;

    const selectedRow = rowData.find((item) => item.userID === userID);
    if (!selectedRow) return;

    console.log('🟢 Selected Row Data:', selectedRow);
    console.log('✅ Unit Type from API:', selectedRow.unitType);
    console.log('✅ Unit ID from API:', selectedRow.unitID);

    const formData = {
      userID: selectedRow.userID,
      username: selectedRow.username ?? '',
      email: selectedRow.email ?? '',
      mobile: selectedRow.phone ?? '',
      isActive: selectedRow.isActive ? 'Active' : 'Inactive',
      tenantID: selectedRow.tenantID ?? '',
      createdBy: selectedRow.createdBy ?? '',
      password: selectedRow.password ?? '', // Include password from selectedRow
      userPlan: selectedRow.userPlan ?? 'Free',
    };

    console.log('🟢 Form Data before setting state:', formData);

    setFormData(formData);
    setSelectedUnitID(selectedRow.unitID); // ✅ Setting Unit ID
    setSelectedUnitType(selectedRow.unitType); // ✅ Setting Unit Type

    console.log('🔄 Updated selectedUnitID:', selectedRow.unitID);
    console.log('🔄 Updated selectedUnitType:', selectedRow.unitType);

    let fetchedData = [];
    if (selectedRow.unitType === 'Lab') {
      fetchedData = await fetchLaboratoryData();
    } else if (selectedRow.unitType === 'Hospital') {
      fetchedData = await fetchHospitalData();
    }

    console.log('🟢 Fetched Data for', selectedRow.unitType, ':', fetchedData);

    let selectedUnitID = selectedRow.unitID || '';
    let selectedUnitName = 'N/A';

    if (!selectedUnitID) {
      console.warn(
        '⚠️ selectedRow.unitID is missing, unable to set hospital/lab.',
      );
    }

    const selectedItem = fetchedData.find((item) =>
      selectedRow.unitType === 'Hospital'
        ? item.hospitalID === selectedUnitID
        : item.laboratoryID === selectedUnitID,
    );

    if (selectedItem) {
      selectedUnitID =
        selectedRow.unitType === 'Hospital'
          ? selectedItem.hospitalID
          : selectedItem.laboratoryID;

      selectedUnitName =
        selectedRow.unitType === 'Hospital'
          ? selectedItem.hospitalName
          : selectedItem.labName;

      console.log(`✅ Setting Selected Unit ID:`, selectedUnitID);
      console.log(`✅ Setting Unit Name:`, selectedUnitName);
    } else {
      console.warn(
        `⚠️ No matching ${selectedRow.unitType} found for ID:`,
        selectedUnitID,
      );
    }

    setSelectedSecondItem(selectedUnitID);
    setSelectedUnitName(selectedUnitName);
    setShowForm(true);
  };

  // 🛠️ Track `selectedUnitID` and `selectedUnitType` changes
  useEffect(() => {
    console.log('🛠️ selectedUnitID changed:', selectedUnitID);
  }, [selectedUnitID]);

  const handleSave = () => {
    const updatedData = rowData.map((item) =>
      item.userID === formData.userID
        ? {
            ...item,
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            isActive: formData.isActive === 'Active', // Convert to boolean
            tenantID: formData.tenantID,
            userPlan: formData.userPlan,
          }
        : item,
    );

    setRowData(updatedData);
    setFilteredData(updatedData);
    setShowForm(false);
  };

  const [roleIDs, setRoleIDs] = useState([]);

  const [roleNames, setRoleNames] = useState([]);

  useEffect(() => {
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      console.error('User ID not found in session storage.');
      return;
    }

    const fetchUserRoles = async () => {
      try {
        const roleResponse = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/UserRoles/${userID}`,
        );

        if (!roleResponse.ok) {
          throw new Error('Failed to fetch user roles.');
        }

        const roleData = await roleResponse.json();

        if (
          roleData.success &&
          Array.isArray(roleData.data) &&
          roleData.data.length > 0
        ) {
          const roleIDs = roleData.data.map((item) => item.roleID);

          // Fetch role names
          const roleNamesPromises = roleIDs.map(async (roleID) => {
            const roleResponse = await fetch(
              `https://predart003-001-site1.anytempurl.com/api/Role/${roleID}`,
            );
            if (!roleResponse.ok) {
              console.error(`Failed to fetch role name for roleID: ${roleID}`);
              return null;
            }
            const roleInfo = await roleResponse.json();
            return roleInfo?.data?.roleName || `Unknown Role (${roleID})`;
          });

          const resolvedRoleNames = await Promise.all(roleNamesPromises);

          // Check if the user is a SuperAdmin
          setIsSuperAdmin(resolvedRoleNames.includes('SuperAdmin'));
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    };

    fetchUserRoles();
  }, []);

  const validateFormFields = () => {
    const newErrors: { [key: string]: string } = {};
    const roleName = sessionStorage.getItem('roleName');

    console.log('Validating form fields...');
    console.log('Selected Unit Type:', selectedUnitType);
    console.log('Selected Unit ID:', selectedSecondItem);

    if (!(formData.username || '').trim()) {
      newErrors.username = 'Username is required';
    }

    if (!(formData.email || '').trim()) {
      newErrors.email = 'Email is required';
    }

    if (!(formData.phone || '').trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!(formData.password || '').trim()) {
      newErrors.password = 'Password is required';
    }

    if (!(formData.userPlan || '').trim()) {
      newErrors.plan = 'Plan is required';
    }

    // Only validate unitType and unitID if role is not SuperAdmin
    if (roleName !== 'SuperAdmin') {
      if (!(selectedUnitType || '').trim()) {
        newErrors.unitType = 'Unit Type is required';
      }

      if (!(selectedSecondItem || '').trim()) {
        newErrors.unitID = 'Unit ID is required';
      }
    }
    setErrors(newErrors);

    console.log('Errors:', newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    console.log('Selected Tenant before sending:', selectedTenant); // Debugging

    if (!selectedTenant) {
      alert('Please select a tenant before submitting.');
      return;
    }
    if (validateFormFields()) {
      console.log('Form is valid. Submitting...');

      const isActiveBoolean = formData.isActive === 'Active';
      const method = formData.userID && formData.userID !== 0 ? 'PUT' : 'POST';
      const url = 'https://predart003-001-site1.anytempurl.com/api/User';

      const body = JSON.stringify({
        userID: formData.userID !== 0 ? formData.userID : undefined,
        username: formData.username.trim(),
        email: formData.email.trim(),
        mobile: formData.phone.trim(),
        password: formData.password.trim() || 'DefaultPassword',
        isActive: isActiveBoolean,
        tenantID: selectedTenant,
        unitType: selectedUnitType,
        unitID: selectedSecondItem || null,
        user: userID,
        createdBy: userID,
        userPlan: formData.userPlan || 'Free',
      });

      console.log('Final Payload:', body); // Debugging

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body,
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('API Full Response:', data);

        if (response.ok) {
          console.log('User added/updated successfully.');
          setShowForm(false);
          setFormData({
            userID: 0,
            username: '',
            email: '',
            phone: '',
            isActive: 'Active',
            tenantID: '',
            createdBy: '',
            password: '',
            userPlan: 'Free',
          });
          setSelectedTenant('');
        } else {
          let errorMessage = 'An error occurred. Please try again.';
          if (data.errors) {
            errorMessage = Object.keys(data.errors)
              .map((key) => `${key}: ${data.errors[key].join(', ')}`)
              .join(', ');
          } else if (data.message) {
            errorMessage = data.message;
          }
          console.error('API Error:', errorMessage);
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Network Error:', error);
        alert('An unexpected error occurred. Please try again later.');
      }
    } else {
      console.log('Form has validation errors.');
      return;
    }
  };

  // const handleFilterSearch = () => {
  //   const filtered = apiData.filter((item) => {
  //     const matchesName = name
  //       ? item.username.toLowerCase().includes(name.toLowerCase())
  //       : true;
  //     const matchesStatus =
  //       isActive !== undefined ? item.isActive === isActive : true;
  //     return matchesName && matchesStatus;
  //   });

  //   setFilteredData(filtered);
  //   setRowData(filtered); // Update rowData with filtered data
  // };

  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter(
      (row) =>
        (row.username?.toLowerCase() ?? '').includes(
          quickSearchText.toLowerCase(),
        ) ||
        (row.tenantName?.toLowerCase() ?? '').includes(
          quickSearchText.toLowerCase(),
        ) ||
        (row.email?.toLowerCase() ?? '').includes(
          quickSearchText.toLowerCase(),
        ) ||
        (row.mobile?.toLowerCase() ?? '').includes(
          quickSearchText.toLowerCase(),
        ) ||
        (row.unitType?.toLowerCase() ?? '').includes(
          quickSearchText.toLowerCase(),
        ),
    );
  };

  useEffect(() => {
    const filtered = applyGlobalSearch(rowData);
    setFilteredData(filtered);
  }, [quickSearchText, rowData]);

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;

    params.api.sizeColumnsToFit(); // Auto-fit columns
  };
  const handleUsernameBlur = async () => {
    setTouchedFields((prev) => ({ ...prev, username: true }));
    const { success, message } = await checkUsernameAvailability(
      formData.username,
    );

    if (!success) {
      setErrors((prev) => ({ ...prev, username: message }));
      setUsernameAvailable(false);
    } else {
      setErrors((prev) => ({ ...prev, username: '' }));
      setUsernameAvailable(true);
    }
  };

  const handleEmailBlur = async () => {
    const { success, message } = await checkEmailAvailability(formData.email);
    if (!success) {
      setErrors((prev) => ({ ...prev, email: message }));
      setEmailAvailable(false);
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
      setEmailAvailable(true);
    }
  };

  const handlePhoneBlur = async () => {
    const { success, message } = await checkPhoneAvailability(formData.phone);
    if (!success) {
      setErrors((prev) => ({ ...prev, phone: message }));
      setPhoneAvailable(false);
    } else {
      setErrors((prev) => ({ ...prev, phone: '' }));
      setPhoneAvailable(true);
    }
  };

  const handleSingleInputChange = (field: string, value: string) => {
    // Update form data
    setFormData({ ...formData, [field]: value });

    // Validate the field immediately
    const newErrors = { ...errors }; // Copy previous errors

    // Check if the field is valid and clear error if valid
    if (value.trim()) {
      newErrors[field] = ''; // Clear error if valid
    }

    // Update the errors state with the cleared or unchanged errors
    setErrors(newErrors);
  };

  const handleFilterSearch = async () => {
    if (!name && isActive === false) {
      toast.warning('Please enter or select anyone field.');
      return;
    }

    try {
      const response = await axios.get(
        'https://predart003-001-site1.anytempurl.com/api/User',
        {
          params: {
            userName: name || undefined, // Avoid sending empty string
            isActive: isActive ? true : undefined,
          },
        },
      );

      if (response.data?.length > 0) {
        setFilteredData(response.data);
      } else {
        toast.info('No users found for given filters.');
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error fetching user data.');
      setFilteredData([]);
    }
  };

  const handleReset = () => {
    setName('');
    setIsActive(false);
    fetchAllUserData(); // just call the same function
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Users</h2>
      {isFormVisible && (
        <div>
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <input
              type="text"
              placeholder="Enter user name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-[30%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
            />
           <label className="flex items-center space-x-2 cursor-pointer text-black">
  <input
    type="checkbox"
    checked={isActive}
    onChange={(e) => setIsActive(e.target.checked)}
    className="w-4 h-4 accent-blue-600 rounded"
  />
  <span>Active</span>
</label>


            <CustomButton className="h-10 px-6" onClick={handleFilterSearch}>
              Search
            </CustomButton>
            <CustomButton
              onClick={handleReset}
              className="h-10 px-6 border border-gray-300 opacity-80 hover:opacity-100 flex items-center gap-1"
            >
              Reset
            </CustomButton>
          </div>
          <hr className="border-t-2 border-stroke bg-transparent my-6" />
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
      {showForm && (
        <div
          ref={formRef} // Attach the ref here
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
         text-black outline-none"
        >
          <h3 className="text-xl font-semibold mb-4">
            {formData.userID === 0 ? 'Add New Data' : 'Edit Data'}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-wrap gap-4 items-center justify-between"
          >
            <div className="grid grid-cols-4 gap-4 mb-2">
              <select
                disabled={formData.userID !== 0} // Disable in edit mode
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={selectedTenant} // Ensure controlled component
                onChange={(e) => setSelectedTenant(e.target.value)} // Update state
              >
                <option value="">
                  {formData.userID !== 0 && selectedTenant
                    ? tenants.find((t) => t.tenantID == selectedTenant)
                        ?.tenantName || 'No Tenant Selected'
                    : 'Select Tenant'}
                </option>

                {formData.userID === 0 &&
                  tenants.map((tenant) => (
                    <option key={tenant.tenantID} value={tenant.tenantID}>
                      {tenant.tenantName}
                    </option>
                  ))}
              </select>

              {/* Username */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  maxLength={25}
                  onChange={(e) =>
                    handleSingleInputChange('username', e.target.value)
                  }
                  onBlur={handleUsernameBlur}
                  placeholder="User Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {usernameAvailable && formData.username && !errors.username && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                )}
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleSingleInputChange('email', e.target.value)
                  }
                  onBlur={handleEmailBlur}
                  placeholder="Email"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                />
                {emailAvailable && formData.email && !errors.email && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* phone */}
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    handleSingleInputChange('phone', e.target.value)
                  }
                  onBlur={() => handlePhoneBlur()}
                  placeholder="phone"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                />
                {phoneAvailable && formData.phone && !errors.phone && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                )}
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Second Row: Password, Status (Only for Edit Mode), User Plan */}
            <div className="grid grid-cols-4 gap-4 mb-2">
              {/* Password (Only Show in Add Mode) */}
              {formData.userID === 0 && (
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-12 text-black outline-none focus:border-primary"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

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
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    userPlan: e.target.value,
                  }));
                }}
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
              {errors.userPlan && (
                <p className="text-red-500 text-sm mt-1">{errors.userPlan}</p>
              )}

              <div>
                {/* First Dropdown: Unit Type */}
                <select
                  key={selectedUnitID}
                  value={selectedUnitType}
                  onChange={handleUnitTypeChange} // Update the state and clear error
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select Unit Type</option>
                  {unitTypes.map((unit) => (
                    <option key={unit.appLOVID} value={String(unit.appLOVID)}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                {errors.unitType && (
                  <p className="text-red-500 text-sm mt-1">{errors.unitType}</p>
                )}
              </div>
              {/* Second Dropdown: Lab or Hospital */}
              {selectedUnitType && (
                <div>
                  <select
                    value={selectedSecondItem}
                    onChange={handleSecondItemChange}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="" disabled>
                      {selectedUnitType === 'Lab'
                        ? 'Select Lab'
                        : 'Select Hospital'}
                    </option>
                    {secondDropdownData.length > 0 ? (
                      secondDropdownData.map((item) => (
                        <option
                          key={
                            selectedUnitType === 'Lab'
                              ? item.laboratoryID
                              : item.hospitalID
                          }
                          value={
                            selectedUnitType === 'Lab'
                              ? item.laboratoryID
                              : item.hospitalID
                          }
                        >
                          {selectedUnitType === 'Lab'
                            ? item.labName
                            : item.hospitalName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No Data Available</option>
                    )}
                  </select>

                  {/* Display error directly below the second dropdown */}
                  {errors.unitID && (
                    <p className="text-red-500 text-sm mt-1">{errors.unitID}</p>
                  )}
                </div>
              )}

              {/* Empty column for spacing when Status is hidden */}
              {formData.userID === 0 && <div></div>}
            </div>

            {/* Buttons Row */}
            <div className="flex justify-end gap-4 mt-4">
              <CustomButton type="submit" onClick={handleFormSubmit}>
                {formData.userID === 0 ? 'Save' : 'Update'}
              </CustomButton>

              <CustomButton type="button" onClick={handleCancel}>
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
            placeholder="Quick Search.."
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

        <CustomButton onClick={handleAdd}>+ Add</CustomButton>
      </div>

      <div className="ag-theme-alpine mt-6 w-full" style={{ height: '400px' }}>
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
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
              <CustomButton onClick={confirmDelete}>Yes, Delete</CustomButton>
              <CustomButton
                onClick={cancelDelete}
                className="bg-gray-300 text-black hover:bg-gray-400"
              >
                Cancel
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
