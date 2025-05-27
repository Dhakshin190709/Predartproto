import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';
 import { toast } from 'react-toastify';
 import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/request';
const FileUpload = () => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentURL, setDocumentURL] = useState('');
  const [isImage, setIsImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
 const[doctorID,setDoctorID]=useState([]);
  const [documentTypes, setDocumentTypes] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadBoxes, setUploadBoxes] = useState([{ id: Date.now() }]);

const [selectedPatientName, setSelectedPatientName] = useState('');

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
const [roleName, setRoleName] = useState<string | null>(null);

useEffect(() => {
  const storedRoleName = sessionStorage.getItem("roleName");
  setRoleName(storedRoleName);
}, []);

 const sessionPatientId = sessionStorage.getItem('patientID');
console.log('Session Patient ID:', sessionPatientId);

  
 
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

 const fetchDocumentTypes = async () => {
  try {
    const response = await api.get('/AppLOV?type=documentType');
    
    if (response.data && Array.isArray(response.data.data)) {
      const activeDocumentTypes = response.data.data.filter(
        (item) => item.isActive === true // or item.status === 'Active'
      );
      setDocumentTypes(activeDocumentTypes);
    } else {
      console.error('Invalid data format:', response.data);
    }
  } catch (error) {
    console.error('Failed to fetch document types:', error);
  }
};

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  // Fetch Uploaded Documents
 const fetchUploadedDocuments = async () => {
  try {
    const response = await api.get(`/Doctor/GetDocuments`, {
      params: { doctorId: patientID },
    });
    setUploadedDocuments(response.data.data || []);
  } catch (error) {
    console.error('Failed to fetch uploaded documents:', error);
  }
};

useEffect(() => {
    const fetchPatients = async () => {
      const tenantID = sessionStorage.getItem('tenantID');
      const sessionPatientId = sessionStorage.getItem('patientID');
      const storedRoleName = sessionStorage.getItem('roleName');

      setRoleName(storedRoleName); // Save roleName for use in JSX

      console.log('Session Patient ID:', sessionPatientId);
      console.log('Role Name:', storedRoleName);

      if (!tenantID || !storedRoleName || !sessionPatientId) {
        console.warn('Missing tenantID, roleName, or sessionPatientId.');
        return;
      }

      try {
        if (storedRoleName.toLowerCase() === 'patient') {
          // Fetch single patient data
          const response = await api.get(`/Patient/${sessionPatientId}`);
          const data = response.data;

          if (data.success && data.data) {
            console.log('Fetched single patient data:', data.data);
            setSelectedPatient(data.data.patientID);
            setSelectedPatientName(data.data.patientName);

            // Also set patients array so dropdown can show this patient if needed
            setPatients([data.data]);
          } else {
            console.warn('No data returned for patient');
          }
        } else {
          // Fetch all patients
          const response = await api.get('/Patient', {
            params: { tenantID },
          });

          const data = response.data;

          if (data.success && data.data) {
            console.log('Fetched patient list:', data.data);
            setPatients(data.data);

            const matchingPatient = data.data.find(
              (p) => String(p.patientID) === String(sessionPatientId)
            );

            if (matchingPatient) {
              console.log('Matched patient:', matchingPatient.patientName);
              setSelectedPatient(matchingPatient.patientID);
              setSelectedPatientName(matchingPatient.patientName);
            } else {
              console.warn('No matching patient found for session ID');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatients();
  }, []);

   const isPatientRole = roleName?.toLowerCase() === 'patient';



  const handlePatientChange = (e) => {
    setSelectedPatient(e.target.value);
    const selected = patients.find(
      (p) => String(p.patientID) === e.target.value
    );
    setSelectedPatientName(selected ? selected.patientName : '');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewSrc(reader.result as string);
      };
    }
  };
  const handleDocumentTypeChange = (event) => {
    setSelectedDocumentType(event.target.value);
  };

const handleUpload = async () => {
  if (!selectedFile || !selectedType) {
    toast.error('Please select all fields..');
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(selectedFile);

  reader.onload = async () => {
    const base64String = reader.result?.toString().split(',')[1];
    if (!base64String) {
      toast.error('Failed to convert file to Base64.');
      return;
    }

    const roleName = sessionStorage.getItem('roleName');
    let id = '';

    if (roleName === 'Patient') {
      const sessionPatientId = sessionStorage.getItem('patientID');
      if (!sessionPatientId) {
        toast.error('Patient ID not found in session for Patient role.');
        return;
      }
      id = sessionPatientId;
    } else if (roleName === 'Reception') {
      if (!selectedPatient) {
        toast.error('Please select a patient from the dropdown.');
        return;
      }
      id = selectedPatient;
    } else {
      toast.error('Unsupported role.');
      return;
    }

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop();
    const filePath = `uploads/${selectedFile.name}`;

    const payload = {
      createdBy: userID,
      isActive: true,
      id: id,
      type: 'patient',
      documentType: selectedType,
      fileName: selectedFile.name,
      fileLocation: filePath,
      fileBase64: base64String,
      fileExtension: fileExtension,
    };

     try {
      const response = await api.post('/Doctor/SaveDocuments', payload);

      if (response.status === 200 || response.status === 201) {
        toast.success('Document uploaded successfully!');
        setSelectedFile(null);
        setPreviewSrc(null);
        setSelectedType('');
      } else {
        toast.error('Upload failed. Please try again.');
      }
    } catch (error: any) {
      toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
    }
  };
};


  // View Document in Modal
 const handleViewDocument = async (documentID: string, fileName: string) => {
  try {
    const response = await api.get(`/Doctor/Documents/${documentID}`);
    
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

  // Extract Only Filename (Ignore ID)
  const getFormattedFileName = (fileName) => {
    return fileName.split('_').pop();
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4 mt-4">Document Upload</h2>

      {/* File Upload Section */}
      <div className="flex items-center gap-2 flex-wrap">
      {isPatientRole ? (
        <input
          type="text"
          readOnly
          value={selectedPatientName}
          className="w-[35] rounded-lg border border-stroke bg-gray-100 py-2 px-4 text-black outline-none cursor-not-allowed"
        />
      ) : (
        <select
          id="patientDropdown"
          value={selectedPatient || ''}
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="w-[35] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary"
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient.patientID} value={patient.patientID}>
              {patient.patientName}
            </option>
          ))}
        </select>
      )}



        {/* Document Type Dropdown */}
        <select
          className="w-[35%] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black 
    outline-none focus:border-primary"
          onChange={(e) => setSelectedType(e.target.value)}
          value={selectedType}
        >
          <option value="">Select Document Type</option>
          {documentTypes.map((doc) => (
            <option key={doc.id} value={doc.name}>
              {doc.name}
            </option>
          ))}
        </select>

        {/* File Input */}
        <input type="file" onChange={handleFileChange} className="w-[30%]" />

        {/* Preview Icon */}
        {previewSrc && (
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="text-blue-500"
          >
            <Eye className="w-5 h-5" />
          </button>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="w-[15%] bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] 
    text-white py-2 px-4 rounded-lg text-sm"
        >
          Upload
        </button>
      </div>
  <ToastContainer position="top-right" autoClose={3000} />
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
                  <td className="border px-4 py-2">{doc.documentType}</td>
                  <td className="border px-4 py-2">
                    {getFormattedFileName(doc.fileName)}
                  </td>
                  <td className="border px-4 py-2">
                    {doc.createdOn ? doc.createdOn.split('T')[0] : 'N/A'}
                  </td>
                  <td className="border px-4 py-2 justify-center gap-2">
                    {/* View Button */}
                    <button
                      onClick={() =>
                        handleViewDocument(doc.documentID, doc.fileName)
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
                <td colSpan={4} className="border px-4 py-2 text-center">
                  No documents uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            <h2 className="text-lg font-bold mb-2">{selectedType} Preview</h2>
            {selectedFile?.type.includes('pdf') ? (
              <iframe
                src={previewSrc}
                width="100%"
                height="300px"
                title="PDF Preview"
              ></iframe>
            ) : (
              <img src={previewSrc} alt="Preview" className="w-full h-auto" />
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
    </div>
  );
};

export default FileUpload;
