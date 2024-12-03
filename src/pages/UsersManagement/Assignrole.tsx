import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface RowData {
  Id: number;
  tenantName: string;
  userName: string;
  mobileNo: string;
  email: string;
  roles: string[]; // Now roles is an array of strings (multi-role support)
  status: string;
}

interface Role {
  id: number;
  name: string;
}

const Assignrole: React.FC = () => {
  const [name, setName] = useState('');
  const [tenant, setTenant] = useState('');
  const [hospitality, setHospitality] = useState('');
  const [userName, setUserName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<RowData>({
    Id: 0,
    tenantName: '',
    userName: '',
    mobileNo: '',
    email: '',
    roles: [], // Initially no roles selected
    status: 'Active',
  });

  const [tenants, setTenants] = useState<string[]>([]);
  const [hospitalities, setHospitalities] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);


  // Fetch data on component mount
  useEffect(() => {
    // Mock API calls
    const fetchTenants = async () => {
      setTenants(['Tenant A', 'Tenant B']);
    };

    const fetchHospitalities = async () => {
      setHospitalities(['Hospitality A', 'Hospitality B']);
    };

    const fetchUsers = async () => {
      setUsers(['Alex', 'John', 'Ram']);
    };

    const fetchRoles = async () => {
      setAvailableRoles([
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
        { id: 3, name: 'Manager' },
        { id: 4, name: 'Doctor' },
        { id: 5, name: 'Nurse' },
        { id: 6, name: 'Cashier' },
        { id: 7, name: 'Lab Technician' },
        { id: 8, name: 'Paramedic' },
        { id: 9, name: 'Lead' },
        { id: 10, name: 'Nutritionist' },
      ]);
    };

    fetchTenants();
    fetchHospitalities();
    fetchUsers();
    fetchRoles();

    // Set initial row data (from an API)
    setRowData([
      { Id: 1, tenantName: 'Tenant A', userName: 'Alex', mobileNo: '1234567890', email: 'alex@example.com', roles: ['Admin'], status: 'Active' },
      { Id: 2, tenantName: 'Tenant B', userName: 'John', mobileNo: '0987654321', email: 'john@example.com', roles: ['User'], status: 'Inactive' },
      { Id: 3, tenantName: 'Tenant A', userName: 'Ram', mobileNo: '1112223333', email: 'ram@example.com', roles: ['User'], status: 'Active' },
    ]);
  }, []);

  const columnDefs: ColDef<RowData, any>[] = [
    { headerName: 'ID', field: 'Id',width:100, sortable: true, filter: true,headerClass: 'text-left', cellClass:'text-center'},
    { headerName: 'Tenant Name', field: 'tenantName', sortable: true, filter: true, flex: 1.5, headerClass: 'text-left',cellClass: 'text-center', },
    { headerName: 'User Name', field: 'userName', sortable: true, filter: true, flex: 1.5, headerClass: 'text-left',cellClass: 'text-center',},
    { headerName: 'Mobile No', field: 'mobileNo', sortable: true, filter: true,headerClass: 'text-left',},
    { headerName: 'Email', field: 'email', sortable: true, filter: true, flex: 1.5, headerClass: 'text-left', },
    { headerName: 'Roles', field: 'roles', sortable: true, filter: true, headerClass: 'text-left',cellClass: 'text-center', 
      cellRenderer: (params: any) => (
        <span>{params.value.join(', ')}</span>  // Display multiple roles as a comma-separated list
      ) 
    },
    {
      headerName: 'Status',
      field: 'status',
      flex: 1,
      headerClass: 'text-center',
      cellClass: 'text-center',
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
      headerName: 'Change',
      flex: 1,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleChangeRole(params.data.Id)}
          className="cursor-pointer text-blue-500 font-bold"
        >
          Change
        </span>
      ),
    },
  ];

  const toggleStatus = (params: any) => {
    const updatedData = rowData.map(item =>
      item.Id === params.data.Id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    );
    setRowData(updatedData);
    setFilteredData(updatedData);
  };

  const handleChangeRole = (Id: number) => {
    const userToEdit = rowData.find(user => user.Id === Id);
    if (userToEdit) {
      setFormData(userToEdit);
      setShowForm(true);
    }
  };

  const handleRoleChange = (role: string) => {
    const updatedRoles = formData.roles.includes(role)
      ? formData.roles.filter((r) => r !== role) // Remove the role if already selected
      : [...formData.roles, role]; // Add the role if not selected
    setFormData({ ...formData, roles: updatedRoles });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update roles logic here
    const updatedData = rowData.map(item =>
      item.Id === formData.Id ? { ...item, roles: formData.roles } : item
    );
    setRowData(updatedData);
    setFilteredData(updatedData);
    setShowForm(false);
  };

  const applyFilters = () => {
    const filtered = rowData.filter((row) => {
      return (
        (tenant ? row.tenantName.includes(tenant) : true) &&
        (hospitality ? row.userName.includes(hospitality) : true) &&
        (userName ? row.userName.includes(userName) : true) &&
        (quickSearchText ? row.userName.toLowerCase().includes(quickSearchText.toLowerCase()) || row.email.toLowerCase().includes(quickSearchText.toLowerCase()) || row.tenantName.toLowerCase().includes(quickSearchText.toLowerCase()) : true)
      );
    });
    setFilteredData(filtered);
  };

  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };
  
  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Assign Role</h2>

      {/* Dropdowns for Tenant, Hospitality, and Users */}
      <div className="flex gap-4 mb-4 items-center">
        <select
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={(e) => setTenant(e.target.value)}
        >
          <option value="">Select Tenant</option>
          {tenants.map((tenant, index) => (
            <option key={index} value={tenant}>
              {tenant}
            </option>
          ))}
        </select>

        <select
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={(e) => setHospitality(e.target.value)}
        >
          <option value="">Select Hospitality</option>
          {hospitalities.map((hospitality, index) => (
            <option key={index} value={hospitality}>
              {hospitality}
            </option>
          ))}
        </select>

        <select
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={(e) => setUserName(e.target.value)}
        >
          <option value="">Select User</option>
          {users.map((user, index) => (
            <option key={index} value={user}>
              {user}
            </option>
          ))}
        </select>

        <button
          onClick={applyFilters}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in rounded px-5 py-2  w-fit text-center"
        >
          Search
        </button>
      </div>

      {/* Grid Table */}
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={filteredData}
          onGridReady={onGridReady}
          domLayout="autoHeight"
        />
      </div>

    {/* Role Change Form Modal */}
    {showForm && (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg">
      <h3 className="text-black font-semibold mb-6">Change Roles for {formData.userName}</h3>
      <form onSubmit={handleFormSubmit}>

        {/* Roles Editable */}
        <div className="mb-4">
  <label className="mb-2.5 block font-medium text-black dark:text-white">Roles</label>
  <div className="grid grid-cols-4 gap-4">
    {availableRoles.map((role) => (
      <div key={role.id} className="flex items-center">
        <input
          type="checkbox"
          id={`role-${role.id}`}
          checked={formData.roles.includes(role.name)}
          onChange={() => handleRoleChange(role.name)}
          className="mr-2"
        />
        <label htmlFor={`role-${role.id}`} className="text-black">
          {role.name}
        </label>
      </div>
    ))}
  </div>
</div>


        {/* Action Buttons */}
        <div className="mt-4 flex gap-4">
          <button
            type="button"
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in rounded px-5 py-2 mt-2 w-fit text-center"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in rounded px-5 py-2 mt-2 w-fit text-center"
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

export default Assignrole;
