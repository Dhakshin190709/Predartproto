import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import api from '../../api/request';
import CustomButton from '../../components/CustomButton';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
interface RowData {
  tenantName: string;
  hospitalName: string;
  pharmacyName: string;
  days: number | '';
  startDate: string;
  endDate: string;
}

interface PharmacyResponse {
  p: {
    pharmacyID: string;
    pharmacyName: string;
  };
}

const TenantHospitalPharmacyGrid: React.FC = () => {
  const [formData, setFormData] = useState<RowData>({
    tenantName: '',
    hospitalName: '',
    
    pharmacyName: '',
    days: '', // ✅ Change from 0 to ''
    startDate: '',
    endDate: '',
  });

  const [rowData, setRowData] = useState<RowData[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacyResponse[]>([]);
  const [tenantName, setTenantName] = useState('');
  const [tenantID, setTenantID] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalID, setHospitalID] = useState('');

const [tenantOptions, setTenantOptions] = useState<any[]>([]);

  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [roleName, setRoleName] = useState('');

  const [unitID, setUnitID] = useState('');
  const [hospitals, setHospitals] = useState([]);

  const [isDropdownDisabled, setIsDropdownDisabled] = useState(true);
  const columnDefs = [
    {
      headerName: 'Tenant Name',
      field: 'tenantName',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Hospital Name',
      field: 'hospitalName',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Pharmacy Name',
      field: 'pharmacyName',
      sortable: true,
      filter: true,
    },

    {
      headerName: 'Start Date',
      field: 'startDate',
      sortable: true,
      filter: true,
    },
    { headerName: 'End Date', field: 'endDate', sortable: true, filter: true },
    { headerName: 'days', field: 'days', sortable: true, filter: true },
  ];

 useEffect(() => {
  const roleName = sessionStorage.getItem('roleName') || '';
  const tenantID = sessionStorage.getItem('tenantID') || '';

  const fetchPharmacies = async () => {
    try {
      let response;
      if (roleName === 'PharmacyAdmin' || roleName === 'TenantAdmin') {
        response = await api.get(`/Pharmacy/List?tenantId=${tenantID}`);
        const filtered = response.data.map((p: any) => ({
          pharmacyName: p.pharmacyName,
          pharmacyID: p.pharmacyID,
        }));
        setPharmacies(filtered);
      } else {
        response = await api.get('/Pharmacy');
        const filtered = response.data.map((p: any) => ({
          pharmacyName: p.p?.pharmacyName,
          pharmacyID: p.p?.pharmacyID,
        }));
        setPharmacies(filtered);
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  fetchPharmacies();
}, []);


 useEffect(() => {
  const role = sessionStorage.getItem('roleName');
  setRoleName(role || '');

  if (role === 'SuperAdmin') {
    api
      .get('/Tenant')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          const activeTenants = res.data.data.filter((tenant: any) => tenant.isActive);
          setTenantOptions(activeTenants);
        }
      })
      .catch((err) => console.error('Error fetching tenants:', err));
  } else {
    const storedTenantID = sessionStorage.getItem('tenantID');
   if (storedTenantID) {
  setTenantID(storedTenantID);
  api
    .get(`/Tenant/${storedTenantID}`)
    .then((res) => {
      if (res.data.success && res.data.data) {
        const tenantData = res.data.data;
        setTenantName(tenantData.tenantName);
        setFormData((prev) => ({
          ...prev,
          tenantName: tenantData.tenantID, // Set ID, not Name
        }));
      }
    })
    .catch((err) => console.error('Error:', err));
}

  }
}, []);


 useEffect(() => {
  const role = sessionStorage.getItem('roleName') || '';
  const tenant = sessionStorage.getItem('tenantID') || '';
  const unit = sessionStorage.getItem('unitID') || '';

  setRoleName(role);
  setTenantID(tenant);
  setUnitID(unit);

  if (role === 'SuperAdmin') {
    // Fetch all hospitals for SuperAdmin
    api
      .get('/Hospital/List')
      .then((res) => {
        const activeHospitals = res.data.filter((h: any) => h.isActive);
        setHospitals(activeHospitals);
        setIsDropdownDisabled(false);
        setHospitalID('');
      })
      .catch((err) => console.error('Error fetching hospitals for SuperAdmin:', err));
  } else if (role === 'TenantAdmin' && tenant) {
    // Fetch hospitals by tenant
    api
      .get(`/Hospital/List?tenantId=${tenant}`)
      .then((res) => {
        const activeHospitals = res.data.filter((h: any) => h.isActive);
        setHospitals(activeHospitals);
        setIsDropdownDisabled(false);
        setHospitalID('');
      })
      .catch((err) => console.error('Error fetching tenant hospitals:', err));
  }else if (unit) {
  api
    .get(`/Hospital/${unit}`)
    .then((res) => {
      if (res.data.success && res.data.data) {
        setHospitalName(res.data.data.hospitalName);         // for label (optional)
        setHospitalID(res.data.data.hospitalID);             // internal use
        setFormData((prev) => ({
          ...prev,
          hospitalName: res.data.data.hospitalID,           // ✅ important
        }));
        setIsDropdownDisabled(true);                         // disable dropdown
      } else {
        console.error('Failed to fetch hospital data');
      }
    })
    .catch((err) => console.error('Error fetching hospital:', err));
} else {
    console.error('No tenantID or unitID found');
  }
}, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'days' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRowData((prev) => [...prev, formData]);
    setFormData({
      tenantName: '',
      hospitalName: '',
      pharmacyName: '',
      days: '',
      startDate: '',
      endDate: '',
    });
  };

 const handleSearch = async () => {
  const roleName = sessionStorage.getItem('roleName') || '';
  const sessionUnitID = sessionStorage.getItem('unitID') || '';
  
  // ✅ Use correct formData keys
  const {
    tenantName,       // dropdown value for tenant
    hospitalName,     // dropdown value for hospital
    pharmacyName,
    days,
    startDate,
    endDate,
  } = formData;

  const selectedHospitalID =
    roleName === 'TenantAdmin' ? hospitalName : sessionUnitID;

  // ✅ SUPERADMIN LOGIC
  if (roleName === 'SuperAdmin') {
    const params: Record<string, string> = {};

    if (tenantName) params.TenantID = tenantName;
    if (hospitalName) params.HospitalID = hospitalName;

    const selectedPharmacy = pharmacies.find(
      (p) => p.pharmacyName === pharmacyName
    );
    if (selectedPharmacy) {
      params.PharmacyID = selectedPharmacy.pharmacyID;
    }

    if (startDate) params.StartDate = startDate;
    if (endDate) params.EndDate = endDate;
    if (days) params.days = days.toString();

    const isAnyParamSelected = Object.keys(params).length > 0;

    if (!isAnyParamSelected) {
      toast.warn('Please select at least one filter');
      return;
    }

    try {
      const response = await api.get('/PharmacyReport/ExpiringStockReport', {
        params,
      });

      console.log('API response:', response.data);

      if (Array.isArray(response.data)) {
        setRowData(response.data);
      } else if (Array.isArray(response.data.data)) {
        setRowData(response.data.data);
      } else {
        setRowData([]);
        toast.error('No data found or unexpected response format');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error during search');
    }

    return; // ❌ Skip the rest for SuperAdmin
  }

  // ✅ For TenantAdmin, HospitalAdmin, PharmacyAdmin
  if (
    !tenantName &&
    !selectedHospitalID &&
    !pharmacyName &&
    !startDate &&
    !endDate &&
    !days
  ) {
    toast.warn('Please select at least one filter');
    return;
  }

  const params: Record<string, string> = {};

  if (tenantName) {
    params.TenantID = tenantName;
  }

  if (
    (['PharmacyAdmin', 'HospitalAdmin'].includes(roleName) && sessionUnitID) ||
    (roleName === 'TenantAdmin' && hospitalName)
  ) {
    params.HospitalID = selectedHospitalID;
  }

  const selectedPharmacy = pharmacies.find(
    (p) => p.pharmacyName === pharmacyName
  );
  if (selectedPharmacy) {
    params.PharmacyID = selectedPharmacy.pharmacyID;
  }

  if (startDate) params.StartDate = startDate;
  if (endDate) params.EndDate = endDate;
  if (days) params.days = days.toString();

  try {
    const response = await api.get('/PharmacyReport/ExpiringStockReport', {
      params,
    });

    console.log('API response:', response.data);

    if (Array.isArray(response.data)) {
      setRowData(response.data);
    } else if (Array.isArray(response.data.data)) {
      setRowData(response.data.data);
    } else {
      setRowData([]);
      toast.error('No data found or unexpected response format');
    }
  } catch (error) {
    console.error('Search error:', error);
    toast.error('Error during search');
  }
};



const handleReset = () => {
  const role = sessionStorage.getItem('roleName') || '';
  const storedTenantID = sessionStorage.getItem('tenantID') || '';
  const storedHospitalID = sessionStorage.getItem('unitID') || '';

  // Base reset values
  const newFormData = {
    tenantName: '',
    hospitalName: '',
    pharmacyName: '',
    days: '',
    startDate: '',
    endDate: '',
  };

  // Preserve tenant and hospital for specific roles
  if (role === 'TenantAdmin' && storedTenantID) {
    newFormData.tenantName = storedTenantID;
  }

  if ((role === 'HospitalAdmin' || role === 'PharmacyAdmin') && storedTenantID && storedHospitalID) {
    newFormData.tenantName = storedTenantID;
    newFormData.hospitalName = storedHospitalID;
  }

  setFormData(newFormData);

  // Reset time fields
  setFromTime('');
  setToTime('');

  // Role-based resets
  if (role === 'SuperAdmin') {
    setTenantID('');
    setHospitalID('');
  } else if (role === 'TenantAdmin') {
    setHospitalID('');
    setTenantID(storedTenantID);
  } else if (role === 'HospitalAdmin' || role === 'PharmacyAdmin') {
    // Do not clear hospital or tenant
    setTenantID(storedTenantID);
    setHospitalID(storedHospitalID);
  }

  // Clear table/grid data
  setRowData([]);
};



  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Expiring Stock Report
      </h1>
      <div className="p-4">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {/* Row 1 */}
          <div>
         {roleName === 'SuperAdmin' ? (
  <select
    value={formData.tenantName}
    onChange={(e) =>
      setFormData((prev) => ({ ...prev, tenantName: e.target.value }))
    }
    className="w-full rounded border p-2 bg-white"
  >
    <option value="">Select a tenant</option>
    {tenantOptions.map((tenant) => (
      <option key={tenant.tenantID} value={tenant.tenantID}>
        {tenant.tenantName}
      </option>
    ))}
  </select>
) : (
  <select
    value={formData.tenantName}
    className="w-full rounded border p-2 bg-gray-100 cursor-not-allowed"
    disabled
  >
    {formData.tenantName && (
      <option value={formData.tenantName}>{tenantName}</option>
    )}
  </select>
)}


          </div>

          <div>
           <select
  value={formData.hospitalName}
  onChange={(e) =>
    setFormData((prev) => ({ ...prev, hospitalName: e.target.value }))
  }
  className={`w-full rounded border p-2 ${
    isDropdownDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
  }`}
  disabled={isDropdownDisabled}
>
  {(roleName === 'TenantAdmin' || roleName === 'SuperAdmin') && (
    <>
      <option value="">Select Hospital</option>
      {hospitals.map((hospital: any) => (
        <option key={hospital.hospitalID} value={hospital.hospitalID}>
          {hospital.hospitalName}
        </option>
      ))}
    </>
  )}

  {roleName !== 'TenantAdmin' && roleName !== 'SuperAdmin' && formData.hospitalName && (
    <option value={formData.hospitalName}>{hospitalName}</option>
  )}
</select>


          </div>

         <div>
  <select
    name="pharmacyName"
    value={formData.pharmacyName}
    onChange={handleChange}
    className="w-full rounded border p-2 bg-gray-100"
  >
    <option value="">Select Pharmacy</option>
    {pharmacies.map((item, index) => (
      <option key={index} value={item.pharmacyName}>
        {item.pharmacyName}
      </option>
    ))}
  </select>
</div>


          {/* Row 2: Start Date & End Date (Col 1) */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="From Date"
              value={fromTime ? fromTime.split('T')[0] : ''}
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => {
                if (!fromTime) e.target.type = 'text';
              }}
              onChange={(e) => setFromTime(e.target.value)}
              className="w-1/2 rounded border p-2 bg-gray-100"
            />
            <input
              type="text"
              placeholder="To Date"
              value={toTime ? toTime.split('T')[0] : ''}
              onFocus={(e) => {
                e.target.type = 'date';
                e.target.min = fromTime
                  ? new Date(fromTime).toISOString().split('T')[0]
                  : '';
              }}
              onBlur={(e) => {
                if (!toTime) e.target.type = 'text';
              }}
              onChange={(e) => setToTime(e.target.value)}
              className="w-1/2 rounded border p-2 bg-gray-100"
            />
          </div>

          {/* Row 2: Days & Quantity (Col 2) */}
          <div className="flex gap-2">
            <input
              name="days"
              type="number"
              value={formData.days === 0 ? '' : formData.days}
              onChange={handleChange}
              placeholder="Days"
              className="w-1/2 rounded border p-2 bg-gray-100"
            />
            <CustomButton type="button" onClick={handleSearch}>
              Search
            </CustomButton>
            <CustomButton
              type="button"
              className="opacity-60 hover:opacity-100 border border-gray-300 flex items-center gap-2"
              onClick={handleReset}
            >
              Reset
            </CustomButton>
          </div>

          <ToastContainer position="top-right" autoClose={3000} />
        </form>

        <div className="ag-theme-alpine" style={{ height: 300, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            domLayout="autoHeight"
          />
        </div>
      </div>
    </div>
  );
};

export default TenantHospitalPharmacyGrid;
