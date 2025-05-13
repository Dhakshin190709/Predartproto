import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { Venus, Mars } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Profile from '../images/icon/profile.svg';
import CustomButton from '../components/CustomButton';
import { toast } from 'react-toastify'; // Import the toast library
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { FaFemale, FaGenderless, FaMale } from 'react-icons/fa';
interface Patient {
  hospitalName: string;
  patientDateOfBirth: string;
  patientGender: string;
  patientPhoneNumber: string;
  patientEmail: string;
}

interface Appointment {
  appointmentDate: string;
  doctorName: string;
  notes: string;
  hospitalName: string;
}
type DocumentRow = {
  sNo: number;
  documentName: string;
  uploadDate: string;
  uploadedBy: string;
  documentType: string;
  downloadLink: string;
};

const ProfileSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [roleName, setRoleName] = useState<string | null>(null);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const patientArray = Array.isArray(patientData) ? patientData : [patientData];
  const [selectedPatientID, setSelectedPatientID] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  const [patientID, setPatientID] = useState<string | null>(null);
  const doctorID = sessionStorage.getItem('doctorID');

  //hardcode should remove in future
  const documentData = [
    {
      documentName: 'Blood Test Report',
      uploadDate: '2025-04-20',
      uploadedBy: 'Dr. Smith',
      documentType: 'Lab Report',
      downloadLink: '/documents/report1.pdf',
    },
    {
      documentName: 'X-Ray',
      uploadDate: '2025-04-15',
      uploadedBy: 'Dr. Patel',
      documentType: 'Radiology',
      downloadLink: '/documents/xray.pdf',
    },
  ];
  const medicineData = [
    {
      medicineName: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Twice a day',
      duration: '5 days',
      instructions: 'After meals',
    },
    {
      medicineName: 'Amoxicillin',
      dosage: '250mg',
      frequency: 'Thrice a day',
      duration: '7 days',
      instructions: 'Before meals',
    },
  ];
  const chronicDiseaseData = [
    {
      appointmentDate: '2025-04-01',
      hospitalName: 'City Health Center',
      doctorName: 'Dr. Asha Menon',
      notes: 'Diabetes - Regular checkup',
      diseaseName: 'Diabetes',
      treatmentStatus: 'Ongoing',
    },
    {
      appointmentDate: '2025-03-20',
      hospitalName: 'Global Medicals',
      doctorName: 'Dr. Kamal Singh',
      notes: 'Hypertension review',
      diseaseName: 'Hypertension',
      treatmentStatus: 'Stable',
    },
  ];
  const paymentData = [
    {
      invoiceNo: 'INV001',
      paymentDate: '2025-04-15',
      paymentMethod: 'UPI',
      amount: 1500,
      status: 'Paid',
      receiptLink: '/receipts/inv001.pdf',
    },
    {
      invoiceNo: 'INV002',
      paymentDate: '2025-04-12',
      paymentMethod: 'Card',
      amount: 800,
      status: 'Unpaid',
      receiptLink: '',
    },
  ];

  const fetchPatientData = (patientID: string) => {
    console.log('Fetching data for patient ID:', patientID);
    axios
      .get(
        `https://predart003-001-site1.anytempurl.com/api/Patient/${patientID}`,
      )
      .then((res) => {
        console.log('Fetched patient data:', res.data.data);
        setPatientData(res.data.data);
      })
      .catch((err) => console.error('Error fetching patient:', err));
  };

  useEffect(() => {
    const userRole = sessionStorage.getItem('roleName'); // ✅ sessionStorage
    setRoleName(userRole);
  }, []);

  useEffect(() => {
    const storedRoleName = sessionStorage.getItem('roleName');
    const storedPatientID = sessionStorage.getItem('patientID');

    setRoleName(storedRoleName);
    setPatientID(storedPatientID); // <-- You forgot this part: set patientID too.

    if (storedRoleName === 'Patient' && storedPatientID) {
      fetchPatientData(storedPatientID); // Assuming this is needed separately
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'appointment' && roleName) {
      const idToUse = roleName === 'Patient' ? patientID : doctorID;

      if (idToUse) {
        let apiUrl = '';

        if (roleName === 'Patient') {
          // Patient role: only patientID
          apiUrl = `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?PatientID=${idToUse}`;
        } else if (roleName === 'Doctor' && selectedPatientID) {
          // Doctor role: both doctorID and selected patient
          apiUrl = `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?DoctorID=${doctorID}&PatientID=${selectedPatientID}`;
        }

        if (apiUrl) {
          axios
            .get(apiUrl)
            .then((res) => {
              console.log('Full response:', res);

              const formattedData = (res.data || []).map(
                (item: any, index: number) => ({
                  sNo: index + 1,
                  hospitalName: item.hospitalName,
                  appointmentDate: item.appointmentDate?.slice(0, 10),
                  doctorName: item.doctorName,
                  notes: item.notes,
                }),
              );

              console.log('Formatted Appointment Data:', formattedData);
              setAppointmentData(formattedData);
            })
            .catch((err) => console.error('Error fetching appointments:', err));
        }
      }
    }
  }, [activeTab, patientID, doctorID, roleName, selectedPatientID]); // <-- added selectedPatientID dependency

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appointment':
        return (
          <div>
            <div
              className="ag-theme-alpine"
              style={{ height: '350px', width: '100%' }}
            >
              <AgGridReact
  rowData={appointmentData.map((row, index) => ({
    ...row,
    sNo: index + 1,
  }))}
  pagination={true}
  paginationPageSize={5}
  domLayout="autoHeight"
  suppressPaginationPanel={false}
  paginationPageSizeSelector={[10, 20, 50, 100, 5]}
  columnDefs={[
    {
      headerName: 'S.No',
      field: 'sNo',
      width: 100,
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Appointment Date',
      field: 'appointmentDate',
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Hospital Name',
      field: 'hospitalName',
      flex: 1.5,
      sortable: true,
      filter: true,
    },
    // Conditionally render 'Doctor Name' column based on roleName
    ...(roleName === 'Patient'
      ? [
          {
            headerName: 'Doctor Name',
            field: 'doctorName',
            flex: 1.5,
            sortable: true,
            filter: true,
          },
        ]
      : []),
    {
      headerName: 'Reason',
      field: 'notes',
      flex: 2,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'View',
      field: 'view',
      cellRenderer: (params: any) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault(); // Prevents navigation
            setModalMessage('Development in progress');
            setIsModalOpen(true); // Opens the modal
          }}
          className="text-blue-600 underline"
        >
          View
        </a>
      ),
      width: 100,
    },
    
  ]}
/>

             
            </div>
          </div>
        );

      case 'chronic disease':
        return (
          <div
            className="ag-theme-alpine"
            style={{ height: '350px', width: '100%' }}
          >
            <AgGridReact
              rowData={chronicDiseaseData.map((row, index) => ({
                ...row,
                sNo: index + 1,
              }))}
              pagination={true}
              paginationPageSize={5}
              paginationPageSizeSelector={[5, 10, 20, 50, 100]}
              columnDefs={[
                { headerName: 'S.No', field: 'sNo', width: 80 },
                {
                  headerName: 'Disease Name',
                  field: 'diseaseName',
                  flex: 1.2,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Appointment Date',
                  field: 'appointmentDate',
                  width: 150,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Hospital Name',
                  field: 'hospitalName',
                  flex: 1.5,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Doctor Name',
                  field: 'doctorName',
                  flex: 1.5,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Treatment Status',
                  field: 'treatmentStatus',
                  flex: 1.2,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Notes',
                  field: 'notes',
                  flex: 2,
                  sortable: true,
                  filter: true,
                },
              ]}
            />
          </div>
        );

      case 'medical':
        return (
          <div
            className="ag-theme-alpine"
            style={{ height: '350px', width: '100%' }}
          >
            <AgGridReact
              rowData={medicineData.map((row, index) => ({
                ...row,
                sNo: index + 1,
              }))}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[5, 10, 20, 50, 100]}
              columnDefs={[
                { headerName: 'S.No', field: 'sNo', width: 80 },
                {
                  headerName: 'Medicine Name',
                  field: 'medicineName',
                  flex: 1.5,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Dosage',
                  field: 'dosage',
                  width: 120,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Frequency',
                  field: 'frequency',
                  width: 120,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Duration',
                  field: 'duration',
                  width: 120,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Instructions',
                  field: 'instructions',
                  flex: 1.5,
                  sortable: true,
                  filter: true,
                },
              ]}
            />
          </div>
        );

      case 'medical documents':
        return (
          <div
            className="ag-theme-alpine"
            style={{ height: '350px', width: '100%' }}
          >
            <AgGridReact
              rowData={documentData.map((row, index) => ({
                ...row,
                sNo: index + 1,
              }))}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[5, 10, 20, 50, 100]}
              columnDefs={[
                { headerName: 'S.No', field: 'sNo', width: 100 },
                {
                  headerName: 'Document Type',
                  field: 'documentType',
                  flex: 1,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Document Name',
                  field: 'documentName',
                  flex: 1.5,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Upload Date',
                  field: 'uploadDate',
                  width: 150,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Uploaded By',
                  field: 'uploadedBy',
                  flex: 1.5,
                  sortable: true,
                  filter: true,
                },

                {
                  headerName: 'Download',
                  field: 'downloadLink',
                  cellRenderer: (params: any) => (
                    <a
                      href={params.value}
                      onClick={(e) => {
                        e.preventDefault(); // Prevents navigation
                        setModalMessage('Development in progress');
                        setIsModalOpen(true); // Opens the modal
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Download
                    </a>
                  ),
                  width: 120,
                },

               
                
              ]}
            />
          </div>
        );

      case 'payment':
        return (
          <div
            className="ag-theme-alpine"
            style={{ height: '350px', width: '100%' }}
          >
            <AgGridReact
              rowData={paymentData.map((row, index) => ({
                ...row,
                sNo: index + 1,
              }))}
              pagination={true}
              paginationPageSize={5}
              paginationPageSizeSelector={[5, 10, 20, 50, 100]}
              columnDefs={[
                { headerName: 'S.No', field: 'sNo', width: 80 },
                {
                  headerName: 'Invoice No',
                  field: 'invoiceNo',
                  flex: 1,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Payment Date',
                  field: 'paymentDate',
                  width: 150,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Payment Method',
                  field: 'paymentMethod',
                  flex: 1,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Amount',
                  field: 'amount',
                  width: 120,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Status',
                  field: 'status',
                  flex: 1,
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: 'Receipt',
                  field: 'receiptLink',
                  cellRenderer: (params: any) =>
                    params.value ? (
                      <a
                        href={params.value}
                        target="_blank"
                        onClick={(e) => {
                          e.preventDefault(); // Prevents navigation
                          setModalMessage('Development in progress');
                          setIsModalOpen(true); // Opens the modal
                        }}
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Download
                      </a>
                    ) : (
                      'N/A'
                    ),
                  width: 120,
                },
              ]}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSearch = async () => {
   
  
    if (!selectedPatient.trim() && !mobileNumber.trim()) {
      toast.warn('Please enter any one field'); 
      return;
    }

    try {
      console.log('Selected Patient:', selectedPatient);
      console.log('Mobile Number:', mobileNumber);

      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/Patient?PatientName=${encodeURIComponent(selectedPatient)}&MobileNo=${encodeURIComponent(mobileNumber)}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        setPatientData(result.data); // Store the patient data as an array
        setIsSearchPerformed(true); // Mark the search as performed
      } else {
        setPatientData([]); // Set to empty array if no data found
        setIsSearchPerformed(true); // Mark search as performed
        toast.error('No patient found with given details.'); // Display an error toast
      }
    } catch (error) {
      console.error('Error during search:', error);
      toast.error('Something went wrong while searching.'); // Display a general error toast
    }
  };

  const viewPatientRecord = (patientID: string) => {
    setSelectedPatientID(patientID);
    setAppointmentData([]);
    // When doctor clicks "View Record", fetch specific patient
    fetchPatientData(patientID);
  };

  return (
    <div className="p-4 space-y-4">
    <h1 className="text-3xl font-semibold text-black mb-6">
      Patient Record
    </h1>
    <div className="h-screen flex flex-col">
      {/* Top Search Bar */}
      {roleName === 'Doctor' && !selectedPatientID && (
        <div className="p-4 flex items-center gap-4 bg-gray-100 mb-6">
          {/* Patient Name Input */}
          <input
            type="text"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-[40%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Patient Name"
          />

          {/* Mobile Number Input */}
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter Mobile Number"
            className="w-[30%] rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-4
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

          {/* Search Button */}
          <CustomButton onClick={handleSearch} className='w-[10%] py-3'>Search</CustomButton>
          <CustomButton
            onClick={() => {
              // Reset search fields and states
              setSelectedPatient(''); // Clear patient name input
              setMobileNumber(''); // Clear mobile number input
              setPatientData([]); // Clear patient data
              setIsSearchPerformed(false); // Reset search performed state
              setSelectedPatientID(null); // Reset selected patient ID (if any)
            }}
            className="opacity-60 hover:opacity-100 border py-3 w-[10%] border-gray-300 flex justify-center items-center gap-2"

           
          
          >
            Reset
          </CustomButton>
        </div>
      )}

      {roleName === 'Doctor' && !isSearchPerformed && (
        <div className="text-center">
          {/* Display message when doctor hasn't searched yet */}
          <p>Please search for a patient to view their details.</p>
        </div>
      )}
      <ToastContainer />
      <div className="p-6">
        {roleName === 'Patient' && patientData && (
          <>
            {/* Top 25% Profile */}
            <div className="h-1/4 bg-gradient-to-r from-blue-100 to-blue-50 flex items-center p-25 shadow-md">
              <div className="flex-shrink-0 pr-8 h-full flex items-center">
                <img
                  src={Profile}
                  alt="Profile"
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>

              <div className="pl-8 grid grid-cols-2 gap-x-12 gap-y-4 w-full text-gray-900 text-lg">
                <div className="flex space-x-2 items-center max-w-full">
                  <span className="font-semibold text-gray-600">Name:</span>
                  <span
                    className="font-bold truncate max-w-[20rem] inline-flex items-center"
                    title={`${patientData.patientName} (${patientData.patientGender})`}
                  >
                    {patientData.patientName} (
                    {['F', 'Female'].includes(patientData.patientGender) && (
                      <FaFemale className="text-pink-500 mr-1" /> // Darkest Female Pink
                    )}
                    {['M', 'Male'].includes(patientData.patientGender) && (
                      <FaMale className="text-blue-500 mr-1" /> // Darkest Male Blue
                    )}
                    {['O', 'Other', 'Others'].includes(
                      patientData.patientGender,
                    ) && (
                      <FaGenderless className="text-gray-500 mr-1" /> // Darkest Others Gray
                    )}
                    )
                  </span>
                </div>

                <div className="flex space-x-2">
                  <span className="font-semibold text-gray-600">
                    Date of Birth:
                  </span>
                  <span className="font-bold">
                    {patientData.patientDateOfBirth?.slice(0, 10)}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <span className="font-semibold text-gray-600">Phone:</span>
                  <span className="font-bold">
                    {patientData.patientPhoneNumber}
                  </span>
                </div>

                <div className="flex space-x-2 items-center max-w-full">
                  <span className="font-semibold text-gray-600">Email:</span>
                  <span
                    className="font-bold truncate max-w-[20rem]"
                    title={patientData.patientEmail}
                  >
                    {patientData.patientEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom 75% Tabs */}
            <div className="h-3/4 p-6 overflow-y-auto">
              <div className="flex space-x-4 mb-4 border-b pb-2">
                {[
                  'appointment',
                  'chronic disease',
                  'medical',
                  'medical documents',
                  'payment',
                ].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-t capitalize font-medium transition ${
                      activeTab === tab
                        ? 'bg-blue-400 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4">{renderTabContent()}</div>
            </div>
          </>
        )}

        {/* Back to Patient List Link */}
        {roleName === 'Doctor' && selectedPatientID && patientData && (
          <a
            onClick={() => {
              setSelectedPatientID(null); // Reset the selected patient ID to return to the list
              setActiveTab(null); // Reset the tab selection if necessary
            }}
            className="mb-4 inline-flex items-center text-blue-500 font-semibold hover:text-gray-600 cursor-pointer"
          >
            Back <span className="ml-2">{' >'}</span>
          </a>
        )}

        {/* Patient Cards Display */}
        {roleName === 'Doctor' &&
          isSearchPerformed &&
          patientArray.length > 0 &&
          !selectedPatientID && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {patientArray.map((patient) => (
                <div
                  key={patient.patientID}
                  className="card p-4 border-2 border-blue-100 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {/* Image */}
                  <img
                    src={Profile}
                    alt={`${patient.patientName}'s profile`}
                    className="w-16 h-16 rounded-full mb-4 object-cover mx-auto"
                  />

                  {/* Patient Name */}
                  <h3 className="text-xl font-semibold text-center">
                    {patient.patientName}
                  </h3>

                  {/* Patient Contact Info */}
                  <p className="text-sm text-center">
                    {/* Phone */}
                    <span className="block">
                      Phone: {patient.patientPhoneNumber}
                    </span>

                    {/* Email with truncation */}
                    <span
                      className="block truncate max-w-[15rem]"
                      title={patient.patientEmail}
                    >
                      Email: {patient.patientEmail}
                    </span>
                  </p>

                 {/* View Record Button */}
<div className="flex justify-center mt-4">
  <button
    onClick={() => viewPatientRecord(patient.patientID)} // Call function to view patient details
    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-800"
  >
    View Record
  </button>
</div>

                </div>
              ))}
            </div>
          )}

        {/* Patient Profile Details */}
        {roleName === 'Doctor' && selectedPatientID && patientData && (
          <>
            {/* Patient Profile Section */}
            <div className="h-1/4 bg-gradient-to-r from-blue-100 to-blue-50 flex items-center p-25 shadow-md">
              <div className="flex-shrink-0 pr-8 h-full flex items-center">
                <img
                  src={Profile}
                  alt="Profile"
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>
              <div className="pl-8 grid grid-cols-2 gap-x-12 gap-y-4 w-full text-gray-900 text-lg">
                <div className="flex space-x-2 items-center max-w-full">
                  <span className="font-semibold text-gray-600">Name:</span>
                  <span
                    className="font-bold truncate max-w-[20rem] inline-flex items-center"
                    title={`${patientData.patientName} (${patientData.patientGender})`}
                  >
                    {patientData.patientName} (
                    {['F', 'Female'].includes(patientData.patientGender) && (
                      <FaFemale className="text-pink-500 mr-1" /> // Darkest Female Pink
                    )}
                    {['M', 'Male'].includes(patientData.patientGender) && (
                      <FaMale className="text-blue-500 mr-1" /> // Darkest Male Blue
                    )}
                    {['O', 'Other', 'Others'].includes(
                      patientData.patientGender,
                    ) && (
                      <FaGenderless className="text-gray-500 mr-1" /> // Darkest Others Gray
                    )}
                    )
                  </span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-semibold text-gray-600">
                    Date of Birth:
                  </span>
                  <span className="font-bold">
                    {patientData.patientDateOfBirth?.slice(0, 10)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-semibold text-gray-600">Phone:</span>
                  <span className="font-bold">
                    {patientData.patientPhoneNumber}
                  </span>
                </div>
                <div className="flex space-x-2 items-center max-w-full">
                  <span className="font-semibold text-gray-600">Email:</span>
                  <span
                    className="font-bold truncate max-w-[20rem]"
                    title={patientData.patientEmail}
                  >
                    {patientData.patientEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom 75% Tabs */}
            <div className="h-3/4 p-6 overflow-y-auto">
              <div className="flex space-x-4 mb-4 border-b pb-2">
                {[
                  'appointment',
                  'chronic disease',
                  'medical',
                  'medical documents',
                  'payment',
                ].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-t capitalize font-medium transition ${
                      activeTab === tab
                        ? 'bg-blue-400 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4">{renderTabContent()}</div>
            </div>
          </>
        )}
      </div>
      {isModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        
      </div>
      <div className="modal-body">
        <p>{modalMessage}</p>
      </div>
      <div className="modal-footer">
        <button
          onClick={() => setIsModalOpen(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
 <style>
      {`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 20px;
          border-radius: 10px;
          width: 400px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .modal-body p {
          font-size: 16px;
        }
      `}
    </style>
    </div>
    </div>
  );
};

export default ProfileSection;
