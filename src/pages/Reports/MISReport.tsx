import React, { useState, useEffect } from 'react';
import CustomButton from '../../components/CustomButton';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { toast } from 'react-toastify'; // or your toast utility
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import api from '../../api/request';
const HospitalDropdown = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedStatusID, setSelectedStatusID] = useState('');
  const roleName = sessionStorage.getItem('roleName');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [statusMapping, setStatusMapping] = useState({});
const [toastInProgress, setToastInProgress] = useState(false);
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const roleName = sessionStorage.getItem('roleName');
        const tenantID = sessionStorage.getItem('tenantID') || '';

        // Build API params conditionally
        const params =
          roleName === 'TenantAdmin' && tenantID ? { tenantID } : {};

        const response = await api.get('/Hospital/HospitalsList', { params });
        const hospitals = response.data; // assuming this is an array

        const activeHospitals = hospitals.filter(
          (hospital: any) => hospital.isActive === true,
        );
        setHospitals(activeHospitals);

        const unitID = sessionStorage.getItem('unitID') || '';
        setSelectedHospital(unitID);
        setSelectedHospitalId(unitID);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    fetchHospitals();
  }, []);

  useEffect(() => {
    const role = sessionStorage.getItem('roleName')?.toLowerCase();
    const doctorID = sessionStorage.getItem('doctorID');
    const unitID = sessionStorage.getItem('unitID');

    if (role === 'doctor' && doctorID) {
      // Prefill only once for doctor
      fetchDoctors('');
    } else if (unitID) {
      // Set initial selected hospital and trigger useEffect below
      setSelectedHospitalId(unitID);
    }
  }, []);

  // Trigger only for non-doctor roles when selectedHospitalId changes
  useEffect(() => {
    const role = sessionStorage.getItem('roleName')?.toLowerCase();

    if (role !== 'doctor' && selectedHospitalId) {
      fetchDoctors(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const fetchDoctors = async (hospitalId: string) => {
    try {
      const role = sessionStorage.getItem('roleName')?.toLowerCase();
      const sessionDoctorID = sessionStorage.getItem('doctorID');

      // For role "doctor", fetch only their profile using /Doctor/{doctorID}
      if (role === 'doctor' && sessionDoctorID) {
        const response = await api.get(`/Doctor/${sessionDoctorID}`);
        const doctor = response.data?.data;

        if (doctor) {
          setDoctors([
            {
              doctorName: doctor.doctorName,
              doctorID: doctor.doctorID,
            },
          ]);
          setSelectedDoctor(doctor.doctorID); // prefill the dropdown
        } else {
          setDoctors([]);
        }
        return;
      }

      // If not doctor, fetch doctors for selected hospital
      if (!hospitalId) return;

      const response = await api.get(`/Doctor`, {
        params: { hospitalId },
      });

      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        setDoctors(
          data.data.map((doctor: { doctorName: string; doctorID: string }) => ({
            doctorName: doctor.doctorName,
            doctorID: doctor.doctorID,
          })),
        );
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  useEffect(() => {
    fetchStatusOptions();
  }, []);

  const fetchStatusOptions = async () => {
    try {
      const response = await api.get('/AppLOV', {
        params: { type: 'AppointmentStatus' },
      });
      const data = response.data?.data || [];
      setStatusOptions(data);

      const statusMap = data.reduce((acc: any, item: any) => {
        acc[item.appLOVID] = item.name;
        return acc;
      }, {});
      setStatusMapping(statusMap);
    } catch (error) {
      console.error('Error fetching status data:', error);
    }
  };

  const handleDoctorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoctor(event.target.value);
  };

  const handleHospitalChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const hospitalId = event.target.value;
    setSelectedHospital(hospitalId);
    setSelectedHospitalId(hospitalId);
  };

 const handleSearch = async () => {
  setLoading(true);
  try {
    const roleName = sessionStorage.getItem('roleName');
    const tenantID = sessionStorage.getItem('tenantID');

    // Show warning if both TenantAdmin or SuperAdmin have no filters selected
    if (
      (roleName === 'TenantAdmin' || roleName === 'SuperAdmin') &&
      !selectedHospitalId &&
      !selectedDoctor &&
      !fromTime &&
      !toTime &&
      !selectedStatus
    ) {
     if (!toastInProgress) {
        setToastInProgress(true);
        toast.warning('Please select at least one filter before searching.', {
          onClose: () => setToastInProgress(false),
        });
      }
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();

    if (roleName === 'TenantAdmin' && tenantID) {
      params.append('tenantID', tenantID);
    }

    if (selectedHospitalId) params.append('HospitalID', selectedHospitalId);
    if (selectedDoctor) params.append('DoctorID', selectedDoctor);
    if (fromTime) params.append('StartDate', fromTime);
    if (toTime) params.append('EndDate', toTime);
    if (selectedStatus) params.append('StatusID', selectedStatus);

    const response = await api.get(
      `/Appointment/MISReport?${params.toString()}`,
    );
    const data = response.data;

    const appointmentsData = Array.isArray(data)
      ? data
      : data.data || data.result || [];

    if (Array.isArray(appointmentsData) && appointmentsData.length > 0) {
      const groupedByPatient: Record<string, any> = {};

      appointmentsData.forEach((appointment: any) => {
        const key = appointment.patientID;

        if (groupedByPatient[key]) {
          groupedByPatient[key].count += 1;

          const currFrom = new Date(groupedByPatient[key].fromDate);
          const currTo = new Date(groupedByPatient[key].toDate);
          const apptDate = new Date(appointment.appointmentDate);

          if (apptDate < currFrom)
            groupedByPatient[key].fromDate = appointment.appointmentDate;
          if (apptDate > currTo)
            groupedByPatient[key].toDate = appointment.appointmentDate;
        } else {
          groupedByPatient[key] = {
            hospitalName: appointment.hospitalName || '-',
            doctorName: appointment.doctorName || '-',
            patientName: appointment.patientName || '-',
            patientID: appointment.patientID,
            fromDate: appointment.appointmentDate,
            toDate: appointment.appointmentDate,
            status: appointment.statusID || '',
            count: 1,
          };
        }
      });

      const groupedAppointmentsArray = Object.values(groupedByPatient);
      setAppointments(groupedAppointmentsArray);
    } else {
      setAppointments([]);
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
     if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('Failed to fetch appointments.', {
        onClose: () => setToastInProgress(false),
      });
    }
    setAppointments([]);
  } finally {
    setLoading(false);
  }
};


  const handleReset = () => {
   if (roleName === 'TenantAdmin' || roleName === 'SuperAdmin') {
      // Reset everything for TenantAdmin
      setSelectedHospital('');
      setSelectedHospitalId('');
      setSelectedDoctor('');
    } else if (roleName === 'HospitalAdmin') {
      // Reset everything except hospital for HospitalAdmin
      setSelectedDoctor('');
    } else if (roleName === 'Doctor') {
      // Reset everything except hospital and doctor for Doctor
      // So no reset for hospital or doctor here
    }

    setFromTime('');
    setToTime('');
    setSelectedStatus('');
    setAppointments([]);
  };

  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'sno',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: '100',
    },
    {
      headerName: 'Hospital Name',
      field: 'hospitalName',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Doctor Name',
      field: 'doctorName',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Patient Name',
      field: 'patientName',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'First Appointment',
      field: 'fromDate',
      filter: 'agDateColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Last Appointment',
      field: 'toDate',
      filter: 'agDateColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Status',
      field: 'status',
      filter: 'agTextColumnFilter',
      sortable: true,
    },

    {
      headerName: 'Total Appointments',
      field: 'totalAppointments',
      filter: 'agNumberColumnFilter',
      sortable: true,
    },
  ];

  const gridOptions = {
    paginationPageSize: 10,
    domLayout: 'autoHeight',
  };

  const rowData = appointments.map((appointment, index) => ({
    sno: index + 1,
    hospitalName: appointment.hospitalName,
    doctorName: appointment.doctorName,
    patientName: appointment.patientName,
    fromDate: new Date(appointment.fromDate).toLocaleDateString(), // format for grid
    toDate: new Date(appointment.toDate).toLocaleDateString(),
    status: statusMapping[appointment.status] || '-',
    totalAppointments: appointment.count,
  }));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold text-black mb-6">MIS Report</h1>
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedHospital}
          onChange={handleHospitalChange}
          className="w-full md:w-60 rounded border p-2"
          disabled={roleName !== 'TenantAdmin' && roleName !== 'SuperAdmin'} // 🔓 Allow both
        >
          <option value="">Select a hospital</option>
          {hospitals.map((hospital) => (
            <option key={hospital.hospitalID} value={hospital.hospitalID}>
              {hospital.hospitalName}
            </option>
          ))}
        </select>

        <select
          value={selectedDoctor}
          onChange={handleDoctorChange}
          disabled={
            sessionStorage.getItem('roleName')?.toLowerCase() === 'doctor' ||
            !selectedHospital
          }
          className="w-full md:w-60 rounded border p-2"
        >
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.doctorID} value={doctor.doctorID}>
              {doctor.doctorName}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="From Date"
          value={fromTime ? fromTime.split('T')[0] : ''}
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => {
            if (!fromTime) e.target.type = 'text';
          }}
          onChange={(e) => setFromTime(e.target.value)}
          className="w-full md:w-48 rounded border p-2"
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
          className="w-full md:w-48 rounded border p-2"
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-60 rounded border p-2"
        >
          <option value="">Select Status</option>
          {statusOptions.map((status) => (
            <option key={status.appLOVID} value={status.appLOVID}>
              {status.name}
            </option>
          ))}
        </select>

        <CustomButton onClick={handleSearch}>Search</CustomButton>
  <ToastContainer />
        <CustomButton
          onClick={handleReset}
          className="opacity-60 hover:opacity-100 border border-gray-300 flex items-center gap-2"
        >
          Reset
        </CustomButton>
      </div>
  <div className="mt-6 w-full overflow-x-auto">
      <div
        className="ag-theme-alpine"
       style={{ height: '400px', minWidth: '800px' }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[5, 10, 20, 50, 100]}
          domLayout="autoHeight"
          enableSorting={true}
          enableFilter={true}
          gridOptions={gridOptions}
        />
      </div>
      </div>
    </div>
  );
};

export default HospitalDropdown;
