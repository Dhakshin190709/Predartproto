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
    const storedTenantID = sessionStorage.getItem('tenantID');
    if (storedTenantID) {
      setTenantID(storedTenantID);
      api
        .get(`/Tenant/${storedTenantID}`)
        .then((res) => {
          if (res.data.success && res.data.data) {
            setTenantName(res.data.data.tenantName);
          } else {
            console.error('Failed to fetch tenant data');
          }
        })
        .catch((err) => console.error('Error:', err));
    } else {
      console.error('No tenantID found in sessionStorage');
    }
  }, []);

  useEffect(() => {
    const role = sessionStorage.getItem('roleName') || '';
    const tenant = sessionStorage.getItem('tenantID') || '';
    const unit = sessionStorage.getItem('unitID') || '';

    setRoleName(role);
    setTenantID(tenant);
    setUnitID(unit);

    if (role === 'TenantAdmin' && tenant) {
      // Fetch hospital list and enable dropdown
      api
        .get(`/Hospital/List?tenantId=${tenant}`)
        .then((res) => {
          const activeHospitals = res.data.filter((h: any) => h.isActive);
          setHospitals(activeHospitals);
          setIsDropdownDisabled(false);
          setHospitalID(''); // ⛔️ Do NOT prefill hospitalID
        })
        .catch((err) => console.error('Error fetching tenant hospitals:', err));
    } else if (unit) {
      // Fetch single hospital details for other roles and disable dropdown
      api
        .get(`/Hospital/${unit}`)
        .then((res) => {
          if (res.data.success && res.data.data) {
            setHospitalName(res.data.data.hospitalName);
            setHospitalID(res.data.data.hospitalID);
            setIsDropdownDisabled(true);
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
    const tenantID = sessionStorage.getItem('tenantID') || '';
    const sessionUnitID = sessionStorage.getItem('unitID') || '';
    const { pharmacyName, days } = formData;

    // For TenantAdmin, unitID may come from hospital dropdown selection
    // For PharmacyAdmin, unitID is always from sessionStorage
    const selectedHospitalID =
      roleName === 'TenantAdmin' ? hospitalID : sessionUnitID;

    // Validate if at least one filter is selected
    if (
      !tenantID &&
      !selectedHospitalID &&
      !pharmacyName &&
      !fromTime &&
      !toTime &&
      !days
    ) {
      toast.error('Please select at least one filter');
      return;
    }

    const params: Record<string, string> = {};

    // Always send TenantID if available
    if (tenantID) {
      params.TenantID = tenantID;
    }

    // Role-based logic for HospitalID
    if (
      (roleName === 'PharmacyAdmin' && sessionUnitID) || // always from session
      (roleName === 'TenantAdmin' && hospitalID) // from user selection
    ) {
      params.HospitalID = selectedHospitalID;
    }

    // Add PharmacyID if matched by name
    const selectedPharmacy = pharmacies.find(
  (p) => p.pharmacyName === pharmacyName
);
if (selectedPharmacy) {
  params.PharmacyID = selectedPharmacy.pharmacyID;
}


    // Add date and days filters
    if (fromTime) params.StartDate = fromTime;
    if (toTime) params.EndDate = toTime;
    if (days) params.days = days.toString();

    console.log('params:', params);

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

    // Reset formData fields
    setFormData({
      pharmacyName: '',
      days: '',
    });

    // Reset date fields
    setFromTime('');
    setToTime('');

    // Conditionally reset hospitalID
    if (role !== 'PharmacyAdmin') {
      if (role !== 'TenantAdmin') {
        setTenantID('');
      }
      setHospitalID('');
    }

    // Clear grid data
    setRowData([]);

    // Optional: reset dropdown selection if needed
    if (role === 'TenantAdmin') {
      // Keep "Select Hospital" as the first option
      setHospitalID('');
    }
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
            <select
              value={tenantID}
              className="w-full rounded border p-2 bg-gray-100 cursor-not-allowed"
              disabled
            >
              {tenantName && <option value={tenantID}>{tenantName}</option>}
            </select>
          </div>

          <div>
            <select
              value={hospitalID}
              onChange={(e) => setHospitalID(e.target.value)}
              className={`w-full rounded border p-2 ${isDropdownDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isDropdownDisabled}
            >
              {roleName === 'TenantAdmin' && (
                <>
                  <option value="">Select Hospital</option>{' '}
                  {/* Default blank option */}
                  {hospitals.map((hospital: any) => (
                    <option
                      key={hospital.hospitalID}
                      value={hospital.hospitalID}
                    >
                      {hospital.hospitalName}
                    </option>
                  ))}
                </>
              )}

              {roleName !== 'TenantAdmin' && hospitalName && (
                <option value={hospitalID}>{hospitalName}</option>
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
