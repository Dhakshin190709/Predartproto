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
  pharmacyID: string; // change here
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
    pharmacyID: '', // changed
    startDate: '',
    endDate: '',
  });
  const [roleName, setRoleName] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [unitID, setUnitID] = useState('');
  const [isDropdownDisabled, setIsDropdownDisabled] = useState(true);
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacyResponse[]>([]);
  const [tenantName, setTenantName] = useState('');
  const [tenantID, setTenantID] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalID, setHospitalID] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [tenantOptions, setTenantOptions] = useState<any[]>([]);
  const [toastInProgress, setToastInProgress] = useState(false);
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
    headerName: 'Medicine Name',
    field: 'medicineName',
    sortable: true,
    filter: true,
  },
  {
    headerName: 'Quantity',
    field: 'quantity',
    sortable: true,
    filter: true,
  },
  {
    headerName: 'Price Per Unit',
    field: 'pricePerUnit',
    sortable: true,
    filter: true,
  },
  {
    headerName: 'Total Count',
    field: 'totalCount',
    sortable: true,
    filter: true,
  },
  {
    headerName: 'Manufacturer Name',
    field: 'manufacturerName',
    sortable: true,
    filter: true,
  },
  // {
  //   headerName: 'Start Date',
  //   field: 'startDate',
  //   sortable: true,
  //   filter: true,
  // },
  // {
  //   headerName: 'End Date',
  //   field: 'endDate',
  //   sortable: true,
  //   filter: true,
  // },
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
            const activeTenants = res.data.data.filter(
              (tenant: any) => tenant.isActive,
            );
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
        .get('/Hospital/HospitalsList')
        .then((res) => {
          const activeHospitals = res.data.filter((h: any) => h.isActive);
          setHospitals(activeHospitals);
          setIsDropdownDisabled(false);
          setHospitalID('');
        })
        .catch((err) =>
          console.error('Error fetching hospitals for SuperAdmin:', err),
        );
    } else if (role === 'TenantAdmin' && tenant) {
      // Fetch hospitals by tenant
      api
        .get(`/Hospital/HospitalsList?tenantId=${tenant}`)
        .then((res) => {
          const activeHospitals = res.data.filter((h: any) => h.isActive);
          setHospitals(activeHospitals);
          setIsDropdownDisabled(false);
          setHospitalID('');
        })
        .catch((err) => console.error('Error fetching tenant hospitals:', err));
    } else if (unit) {
      api
        .get(`/Hospital/${unit}`)
        .then((res) => {
          if (res.data.success && res.data.data) {
            setHospitalName(res.data.data.hospitalName); // for label (optional)
            setHospitalID(res.data.data.hospitalID); // internal use
            setFormData((prev) => ({
              ...prev,
              hospitalName: res.data.data.hospitalID, // ✅ important
            }));
            setIsDropdownDisabled(true); // disable dropdown
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
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRowData((prev) => [...prev, formData]);
    setFormData({
      tenantName: '',
      hospitalName: '',
      pharmacyName: '',

      startDate: '',
      endDate: '',
    });
  };

 const handleSearch = async () => {
  const roleName = sessionStorage.getItem('roleName') || '';
  const sessionTenantID = sessionStorage.getItem('tenantID') || '';
  const sessionUnitID = sessionStorage.getItem('unitID') || '';

  const { tenantName, hospitalName, pharmacyName } = formData;
  const hospitalID = hospitalName; // ✅ Define it here

  const selectedTenantID =
    roleName === 'SuperAdmin' ? tenantName : sessionTenantID;

  const selectedHospitalID =
    roleName === 'SuperAdmin'
      ? hospitalName
      : roleName === 'TenantAdmin'
        ? hospitalID // ✅ Now it is defined
        : sessionUnitID;

  if (
    !selectedTenantID &&
    !selectedHospitalID &&
    !pharmacyName &&
    !fromTime &&
    !toTime
  ) {
    if (!toastInProgress) {
      setToastInProgress(true);
      toast.warn('Please select at least one filter', {
        onClose: () => setToastInProgress(false),
      });
    }
    return;
  }

  const params: Record<string, string> = {};

  if (selectedTenantID) params.TenantID = selectedTenantID;
  if (selectedHospitalID) params.HospitalID = selectedHospitalID;

  const selectedPharmacy = pharmacies.find(
    (p) => p.pharmacyName === pharmacyName,
  );
  if (selectedPharmacy) {
    params.PharmacyID = selectedPharmacy.pharmacyID;
  }

  if (fromTime) params.StartDate = fromTime;
  if (toTime) params.EndDate = toTime;

  try {
    const response = await api.get('/PharmacyReport/StockSummaryReport', {
      params,
    });

    if (Array.isArray(response.data)) {
      setRowData(response.data);
    } else if (Array.isArray(response.data.data)) {
      setRowData(response.data.data);
    } else {
      setRowData([]);
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.error('No data found or unexpected response format', {
          onClose: () => setToastInProgress(false),
        });
      }
    }
  } catch (error) {
    console.error('Search error:', error);
  if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('Error during search', {
        onClose: () => setToastInProgress(false),
      });
    }
  }
};


  const handleReset = () => {
    const role = sessionStorage.getItem('roleName') || '';

    // Reset form fields
    setFormData((prev) => ({
      ...prev,
      tenantName: role === 'SuperAdmin' ? '' : prev.tenantName, // Keep tenant for TenantAdmin
      hospitalName: '',
      pharmacyName: '',
      days: '',
    }));

    // Reset date filters
    setFromTime('');
    setToTime('');

    // Role-based dropdown clearing
    if (role === 'SuperAdmin') {
      setTenantID('');
      setHospitalID('');
    } else if (role === 'TenantAdmin') {
      // Don't reset tenant ID
      setHospitalID('');
    }

    // Clear grid data
    setRowData([]);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Stock Sumamry Report
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
                  setFormData((prev) => ({
                    ...prev,
                    tenantName: e.target.value,
                  }))
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
                setFormData((prev) => ({
                  ...prev,
                  hospitalName: e.target.value,
                }))
              }
              className={`w-full rounded border p-2 ${
                isDropdownDisabled
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'bg-white'
              }`}
              disabled={isDropdownDisabled}
            >
              {(roleName === 'TenantAdmin' || roleName === 'SuperAdmin') && (
                <>
                  <option value="">Select Hospital</option>
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

              {roleName !== 'TenantAdmin' &&
                roleName !== 'SuperAdmin' &&
                formData.hospitalName && (
                  <option value={formData.hospitalName}>{hospitalName}</option>
                )}
            </select>
          </div>

          <div>
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
          </div>

          {/* Row 2 */}
          {/* Col 1: Start Date + End Date */}
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

          {/* Col 2: Search + Reset buttons inline */}
          <div className="flex gap-2">
            <CustomButton
              type="button"
              onClick={handleSearch}
              className="w-1/4"
            >
              Search
            </CustomButton>
            <CustomButton
              type="button"
              onClick={handleReset}
              className="w-1/4 opacity-60 hover:opacity-100 border border-gray-300 flex items-center justify-center"
            >
              Reset
            </CustomButton>
          </div>

          {/* Col 3: Leave empty or add more fields */}
          <div></div>

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
