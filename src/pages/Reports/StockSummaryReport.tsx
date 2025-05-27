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


  const [rowData, setRowData] = useState<RowData[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacyResponse[]>([]);
  const [tenantName, setTenantName] = useState('');
  const [tenantID, setTenantID] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalID, setHospitalID] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
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
  ];

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await api.get('/Pharmacy');
        setPharmacies(response.data);
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
    const storedUnitID = sessionStorage.getItem('unitID');
    if (storedUnitID) {
      api
        .get(`/Hospital/${storedUnitID}`)
        .then((res) => {
          if (res.data.success && res.data.data) {
            setHospitalName(res.data.data.hospitalName);
            setHospitalID(res.data.data.hospitalID);
          } else {
            console.error('Failed to fetch hospital data');
          }
        })
        .catch((err) => console.error('Error:', err));
    } else {
      console.error('No unitID found in sessionStorage');
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
  const tenantID = sessionStorage.getItem('tenantID') || '';
  const unitID = sessionStorage.getItem('unitID') || '';
const { pharmacyID } = formData;

  if (!tenantID && !unitID && !pharmacyName && !fromTime && !toTime) {
    toast.error('Please select at least one filter');
    return;
  }

  const params: Record<string, string> = {};

  if (tenantID) params.TenantID = tenantID;
  if (unitID) params.HospitalID = unitID;

 if (pharmacyID) {
  params.PharmacyID = pharmacyID;
}

  if (fromTime) params.StartDate = fromTime;
  if (toTime) params.EndDate = toTime;

  try {
    const response = await api.get('/PharmacyReport/StockSummaryReport', { params });

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
              className="w-full rounded border p-2 bg-gray-100 cursor-not-allowed"
              disabled
            >
              {hospitalName && (
                <option value={hospitalID}>{hospitalName}</option>
              )}
            </select>
          </div>

          <div>
           <select
  name="pharmacyID"
  value={formData.pharmacyID}
  onChange={handleChange}
  className="w-full rounded border p-2 bg-gray-100"
>
  <option value="">Select Pharmacy</option>
  {pharmacies.map((item, index) => (
    <option key={index} value={item.p.pharmacyID}>
      {item.p.pharmacyName}
    </option>
  ))}
</select>

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
