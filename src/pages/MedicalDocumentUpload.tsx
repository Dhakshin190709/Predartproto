import React, { useEffect, useState } from 'react';
import api from '../api/request';
import { toast, ToastContainer } from 'react-toastify';
import { Eye, X } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import CustomButton from '../components/CustomButton';

interface Appointment {
  appointmentID: string;
  patientID: string;
  patientName: string;
  patientGender: string;
  uhid?: string;
  appointmentNumber: number;
}

interface DocumentType {
  id: string;
  name: string;
}

const MedicalDocumentUpload: React.FC = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientID, setSelectedPatientID] = useState('');
  const [appointmentNumber, setAppointmentNumber] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState<Appointment | null>(null);
 const [modalOpen, setModalOpen] = useState(false);
  const [documentURL, setDocumentURL] = useState('');
  const [isImage, setIsImage] = useState(false);
 
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  // 🔄 Load Patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/Patient');
        if (res.data && res.data.success) {
          setPatients(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);
 const getFormattedFileName = (fileName) => {
    return fileName.split('_').pop();
  };
  // 🔄 Load Document Types
 useEffect(() => {
  const fetchDocumentTypes = () => {
    try {
      const masterLOV = JSON.parse(localStorage.getItem('masterLOV') || '{}');

      if (masterLOV && Array.isArray(masterLOV.data)) {
        const activeDocs = masterLOV.data
          .filter((item: any) => item.type === 'MedicalRecordDocument' && item.isActive === true);

        setDocumentTypes(activeDocs);
      } else {
        console.warn('No masterLOV data found in localStorage.');
      }
    } catch (error) {
      console.error('Error reading masterLOV from localStorage:', error);
    }
  };

  fetchDocumentTypes();
}, []);



  // 🔄 Load Uploaded Documents (when appointment found)
  // const fetchUploadedDocuments = async (patientID: string) => {
  //   try {
  //     const response = await api.get(`/Document/GetDocuments`, {
  //       params: { ID: patientID },
  //     });
  //     setUploadedDocuments(response.data.data || []);
  //   } catch (error) {
  //     console.error('Error fetching uploaded documents:', error);
  //   }
  // };


const handleViewDocument = async (documentID: string, fileName: string) => {
    try {
      const response = await api.get(`/Document/${documentID}`);

      const fileBase64 = response.data?.data?.fileBase64;
      if (!fileBase64) {
        alert('Invalid file data received.');
        return;
      }

      // Determine if the file is an image by extension
      const isImageFile = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
      setIsImage(isImageFile);

      // Decode base64 to binary data
      const byteCharacters = atob(fileBase64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Determine MIME type based on file extension
      let fileType = 'application/pdf';
      if (isImageFile) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        fileType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      }

      const blob = new Blob([byteArray], { type: fileType });
      const url = URL.createObjectURL(blob);

      setDocumentURL(url);
      setModalOpen(true);
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error loading document.');
    }
  };
  const handleSearch = async () => {
    if (!selectedPatientID && !appointmentNumber) {
      toast.warn('Please select at least one filter!');
      return;
    }
    if (!selectedPatientID) {
      toast.warn('Please select a patient!');
      return;
    }
    if (!appointmentNumber) {
      toast.warn('Please enter appointment number!');
      return;
    }

    try {
      const res = await api.get(`/Appointment/GetAppointment?PatientID=${selectedPatientID}`);
      if (res.data && Array.isArray(res.data)) {
        const matched = res.data.find(
          (a: Appointment) => a.appointmentNumber === Number(appointmentNumber)
        );

        if (matched) {
          setAppointmentDetails(matched);
         // fetchUploadedDocuments(matched.patientID);
        } else {
          setAppointmentDetails(null);
          setUploadedDocuments([]);
          toast.warn('No matching appointment found for this patient.');
        }
      } else {
        setAppointmentDetails(null);
        setUploadedDocuments([]);
        toast.warn('No appointments found for this patient.');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Something went wrong.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewSrc(reader.result as string);
      };
    }
  };

 const handleUpload = async () => {
  if (!selectedFile || !selectedType) {
    toast.error('Please select all fields.');
    return;
  }
  if (!appointmentDetails) {
    toast.error('Please search and select an appointment first.');
    return;
  }

  const userID = sessionStorage.getItem('userID');
  if (!userID) {
    toast.error('User not logged in.');
    return;
  }

  const nowISO = new Date().toISOString();
  const filePath = `uploads/${selectedFile.name}`;

  // Create FormData
  const formData = new FormData();
  formData.append('File', selectedFile); // Actual file blob

  formData.append('MrdDocument.ID', appointmentDetails?.patientID || '');
  formData.append('MrdDocument.Type', 'patient');
  formData.append('MrdDocument.DocumentType', selectedType);
  formData.append('MrdDocument.FileName', selectedFile.name);
  formData.append('MrdDocument.FileLocation', filePath);
  formData.append('MrdDocument.TenantID', appointmentDetails?.tenantID || '');
  formData.append('MrdDocument.AppointmentID', appointmentDetails?.appointmentID || '');
formData.append('MrdDocument.TenantCode', 'null');
  formData.append('MrdDocument.PatientMobile', appointmentDetails?.patientPhoneNumber || '');
  formData.append('MrdDocument.CreatedBy', userID);
  formData.append('MrdDocument.CreatedOn', nowISO);
  formData.append('MrdDocument.UpdatedBy', userID);
  formData.append('MrdDocument.UpdatedOn', nowISO);
  formData.append('MrdDocument.IsActive', 'true');
  formData.append('CreatedBy', userID);
  formData.append('CreatedOn', nowISO);
  formData.append('UpdatedBy', userID);
  formData.append('UpdatedOn', nowISO);
  formData.append('IsActive', 'true');

  try {
    const response = await api.post('/Document/MedicalRecordPDF', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200 || response.status === 201) {
      toast.success('Document uploaded successfully!');
      setSelectedFile(null);
      setSelectedType('');
      setPreviewSrc(null);
      //fetchUploadedDocuments(appointmentDetails.patientID);
    } else {
      toast.error('Upload failed. Try again.');
    }
  } catch (error: any) {
    toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
  }
};



  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-black mb-6">Medical Document Upload</h1>

      {/* Row: Patient, Appointment, Search */}
      <div className="flex items-center space-x-4 mb-6">
        <select
          value={selectedPatientID}
          onChange={(e) => setSelectedPatientID(e.target.value)}
          className="w-1/3 rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary"
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p.patientID} value={p.patientID}>{p.patientName}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Appointment Number"
          value={appointmentNumber}
          onChange={(e) => setAppointmentNumber(e.target.value)}
          className="w-1/ rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary"
        />

        <CustomButton onClick={handleSearch}>Search</CustomButton>
      </div>

      {/* Show Patient Details */}
      {appointmentDetails && (
        <div className="border rounded p-4 bg-gray-50 w-full md:w-[66%] mb-6">
          <div className="flex flex-wrap gap-8">
            <div><strong>Name:</strong> {appointmentDetails.patientName}</div>
            <div><strong>Gender:</strong> {appointmentDetails.patientGender}</div>
           
            <div><strong>Appointment Number:</strong> {appointmentDetails.appointmentNumber}</div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {appointmentDetails && (
        <div className="p-4 bg-white rounded-md shadow-md w-full md:w-[66%]">
          <h2 className="text-lg font-bold mb-4">Upload Document</h2>

          <div className="flex items-center gap-4 flex-wrap mb-4">
            <select
              className="w-[40%] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary"
              onChange={(e) => setSelectedType(e.target.value)}
              value={selectedType}
            >
              <option value="">Select Document Type</option>
              {documentTypes.map((doc) => (
                <option key={doc.id} value={doc.name}>{doc.name}</option>
              ))}
            </select>

            <input type="file" onChange={handleFileChange} className="w-[40%]" />

            {previewSrc && (
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="text-blue-500"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleUpload}
              className="w-[15%] bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-4 rounded-lg text-sm"
            >
              Upload
            </button>
          </div>

          {/* Uploaded Documents Table */}
         <div className="mt-6">
                  <h2 className="text-lg font-bold mb-2">Uploaded Documents</h2>
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2">File Name</th>
                        <th className="border px-4 py-2">Document Type</th>

                        <th className="border px-4 py-2">Date</th>
                        <th className="border px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedDocuments.length > 0 ? (
                        uploadedDocuments.map((doc, index) => (
                          <tr key={index} className="text-center">
                            <td className="border px-4 py-2">
                              {doc.documentType}
                            </td>
                            <td className="border px-4 py-2">
                              {getFormattedFileName(doc.fileName)}
                            </td>
                            <td className="border px-4 py-2">
                              {doc.createdOn
                                ? doc.createdOn.split('T')[0]
                                : 'N/A'}
                            </td>
                            <td className="border px-4 py-2 justify-center gap-2">
                              {/* View Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewDocument(
                                    doc.documentID,
                                    doc.fileName,
                                  )
                                }
                                className="bg-gradient-to-b from-[#008000] to-[#00FF00] hover:from-[#00FF00] hover:to-[#008000] 
                text-white px-3 py-1 rounded-lg"
                              >
                                View
                              </button>

                              {/* Delete Button */}
                              {/* <button
                onClick={() => handleDeleteDocument(doc.documentID)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button> */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="border px-4 py-2 text-center"
                          >
                            No documents uploaded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
        </div>
      )}
 {/* Preview Modal */}
                {isPreviewOpen && previewSrc && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-96 relative">
                      <button
                        onClick={() => setIsPreviewOpen(false)}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                      </button>
                      <h2 className="text-lg font-bold mb-2">
                        {selectedType} Preview
                      </h2>
                      {selectedFile?.type.includes('pdf') ? (
                        <iframe
                          src={previewSrc}
                          width="100%"
                          height="300px"
                          title="PDF Preview"
                        ></iframe>
                      ) : (
                        <img
                          src={previewSrc}
                          alt="Preview"
                          className="w-full h-auto"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Modal for Viewing Documents */}
                {modalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg max-w-xl w-full relative flex flex-col items-center">
                      <button
                        className="absolute top-2 right-2 text-gray-500 text-xl"
                        onClick={() => setModalOpen(false)}
                      >
                        &times;
                      </button>
                      <h2 className="text-lg font-bold mb-2">View Document</h2>
                      <div className="flex justify-center items-center w-full max-h-[80vh]">
                        {isImage ? (
                          <img
                            src={documentURL}
                            alt="Uploaded document"
                            style={{ maxWidth: '100%', maxHeight: '80vh' }}
                          />
                        ) : (
                          <iframe
                            src={documentURL}
                            title="PDF Document"
                            width="100%"
                            height="600px"
                            style={{ border: 'none' }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default MedicalDocumentUpload;
