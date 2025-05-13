import React, { useState, useEffect ,useMemo} from 'react';
import CustomButton from '../../components/CustomButton';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
const HospitalDropdown = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [roleName, setRoleName] = useState<string>('');
 

  // Find the doctor's name based on selectedDoctor ID
  const selectedDoctorName = doctors.find(
    (doctor) => doctor.doctorID === selectedDoctor
  )?.doctorName;
  
  useEffect(() => {
    const roleName = sessionStorage.getItem('roleName'); // Get roleName from session storage

    const fetchHospitals = async () => {
      try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/Hospital/List');
        const data = await response.json();
        const activeHospitals = data.filter((hospital: any) => hospital.isActive === true);
        setHospitals(activeHospitals);

        const unitID = sessionStorage.getItem('unitID'); // Get unitID from session storage
        if (roleName === 'Doctor') {
          const doctorID = sessionStorage.getItem('doctorID');
          setSelectedDoctor(doctorID || ''); // Pre-set doctorID for Doctor role
          setSelectedHospital(unitID || ''); // Pre-set hospital for Doctor role
          setSelectedHospitalId(unitID || '');
        } else if (roleName === 'HostitalAdmin') {
          setSelectedHospital(unitID || ''); // Pre-set hospital for HospitalAdmin role
          setSelectedHospitalId(unitID || '');
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospitalId) {
      fetchDoctors(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const fetchDoctors = async (hospitalId: string) => {
    try {
      if (!hospitalId) return;
      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/Doctor?hospitalId=${hospitalId}`
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setDoctors(
          data.data.map((doctor: { doctorName: string; doctorID: string }) => ({
            doctorName: doctor.doctorName,
            doctorID: doctor.doctorID,
          }))
        );
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleDoctorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoctor(event.target.value); // this is the doctorID
  };

  const handleHospitalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const hospitalId = event.target.value;
    setSelectedHospital(hospitalId);
    setSelectedHospitalId(hospitalId);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let url = `https://predart003-001-site1.anytempurl.com/api/Appointment/ConsolidationReport?`;
  
      const params = new URLSearchParams();
      if (selectedHospitalId) {
        params.append('HospitalID', selectedHospitalId);
      }
      if (selectedDoctor) {
        params.append('DoctorID', selectedDoctor);
      }
      if (fromTime) {
        params.append('StartDate', fromTime);
      }
      if (toTime) {
        params.append('EndDate', toTime);
      }
  
      url += params.toString();
  
      const response = await fetch(url);
      const data = await response.json();
  
      if (Array.isArray(data) && data.length > 0) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const columnDefs = useMemo(() => [
    { headerName: 'S.No', valueGetter: 'node.rowIndex + 1', width: 90 },
    { headerName: 'Hospital Name', field: 'hospitalName' },
    { headerName: 'Doctor Name', field: 'doctorName' },
    {
      headerName: 'Appointment Date',
      field: 'appointmentDate',
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    { headerName: 'New', field: 'new', width: 100 },
    { headerName: 'Waiting', field: 'waiting', width: 100 },
    { headerName: 'Approved', field: 'approved', width: 100 },
    { headerName: 'Rejected', field: 'rejected', width: 100 },
    { headerName: 'Closed', field: 'closed', width: 100 },
    { headerName: 'Cancel', field: 'cancel', width: 100 },
    { headerName: 'Rescheduled', field: 'rescheduled', width: 120 },
    { headerName: 'Consult Another Doctor', field: 'consultAnotherDoctor', width: 180 },
    { headerName: 'Recommend to Admit', field: 'recommendtoAdmit', width: 160 },
  ], []);

  useEffect(() => {
    // Retrieve roleName from sessionStorage when the component mounts
    const storedRoleName = sessionStorage.getItem("roleName");  // Adjust this based on your actual storage key
    if (storedRoleName) {
      setRoleName(storedRoleName);
    }
  }, []);
  const handleReset = () => {
    if (roleName === "Doctor") {
      // For Doctor role, keep the hospital and doctor prefilled
      setFromTime('');
      setToTime('');
      setAppointments([]);
    } else if (roleName === "HostitalAdmin") {
      // For HospitalAdmin role, keep the hospital prefilled
      setSelectedDoctor('');
      setFromTime('');
      setToTime('');
      setAppointments([]);
    }
  };
  
  

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Consolidated Report
      </h1>
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedHospital}
          onChange={handleHospitalChange}
          disabled={sessionStorage.getItem('roleName') !== 'HospitalAdmin'}
         className="w-full md:w-60 rounded border p-2 bg-gray-100 "
        >
          <option value="">Select a hospital</option>
          {hospitals.map((hospital) => (
            <option key={hospital.hospitalID} value={hospital.hospitalID}>
              {hospital.hospitalName}
            </option>
          ))}
        </select>

        {roleName === 'Doctor' ? (
  // Prefilled and non-editable input for Doctor role
  <input
    type="text"
    value={selectedDoctorName || ''}
    disabled
    className="w-full md:w-60 rounded border p-2 bg-white"
  />
) : (
  // Dropdown for HospitalAdmin and other roles
  <select
    value={selectedDoctor}
    onChange={handleDoctorChange}
    disabled={!selectedHospital}
   className="w-full md:w-60 rounded border p-2 bg-gray-100 "
  >
    <option value="">Select a doctor</option>
    {doctors.map((doctor) => (
      <option key={doctor.doctorID} value={doctor.doctorID}>
        {doctor.doctorName}
      </option>
    ))}
  </select>
)}


        <input
          type="text"
          placeholder="From Date"
          value={fromTime ? fromTime.split('T')[0] : ''}
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => {
            if (!fromTime) e.target.type = 'text';
          }}
          onChange={(e) => setFromTime(e.target.value)}
       className="w-full md:w-60 rounded border p-2 bg-gray-100 "
        />

        <input
          type="text"
          placeholder="To Date"
          value={toTime ? toTime.split('T')[0] : ''}
          onFocus={(e) => {
            e.target.type = 'date';
            e.target.min = fromTime ? new Date(fromTime).toISOString().split('T')[0] : '';
          }}
          onBlur={(e) => {
            if (!toTime) e.target.type = 'text';
          }}
          onChange={(e) => setToTime(e.target.value)}
         className="w-full md:w-60 rounded border p-2 bg-gray-100 "
        />

       

      

         <CustomButton onClick={handleSearch}>Search</CustomButton>
        
                  <CustomButton
                     onClick={handleReset}
                    className="opacity-60 hover:opacity-100 border border-gray-300 flex items-center gap-2"
                  >
                    Reset
                  </CustomButton>
      </div>
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <AgGridReact
        rowData={appointments}
        columnDefs={columnDefs}
        paginationPageSizeSelector={[ 10, 20, 50, 100]}
        pagination={true}
        paginationPageSize={10}
        suppressRowClickSelection={true}
        domLayout="autoHeight"
      />
    </div>

    </div>
  );
};

export default HospitalDropdown;
