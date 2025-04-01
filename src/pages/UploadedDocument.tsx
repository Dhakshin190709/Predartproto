import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Eye } from "lucide-react";
const FileUpload = () => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentURL, setDocumentURL] = useState("");
  const [isImage, setIsImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const doctorID = "4f753961-3a5b-4fa3-3c8b-08dd548796a6";
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string }[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadBoxes, setUploadBoxes] = useState([{ id: Date.now() }]);
 

  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const fetchDocumentTypes = async () => {
    try {
      const response = await axios.get(
        "https://predart003-001-site1.anytempurl.com/api/AppLOV?type=documentType"
      );
      if (response.data && Array.isArray(response.data.data)) {
        setDocumentTypes(response.data.data);
      } else {
        console.error("Invalid data format:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch document types:", error);
    }
  }; useEffect(() => {
    fetchDocumentTypes();
  }, []);

  
  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  // Fetch Uploaded Documents
  const fetchUploadedDocuments = async () => {
    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDocuments?doctorID=${doctorID}`
      );
      setUploadedDocuments(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch uploaded documents:", error);
    }
  };

  
  // const handleFileChange = (event) => {
  //   setSelectedFile(event.target.files[0]);
  // };

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
  
  // Upload Document (POST API)
  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      alert("Please select a file and document type.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64String = reader.result?.toString().split(",")[1];
      if (!base64String) {
        console.error("Failed to convert file to Base64");
        return;
      }

      const userID = sessionStorage.getItem("userID");
      if (!userID) {
        alert("User not logged in. Please log in again.");
        return;
      }

      const fileExtension = selectedFile.name.split(".").pop();
      const filePath = `uploads/${selectedFile.name}`;

      const payload = {
        createdBy: userID,
        isActive: true,
        id: doctorID,
        type: "doctor",
        documentType: selectedType,
        fileName: selectedFile.name,
        fileLocation: filePath,
        fileBase64: base64String,
        fileExtenstion: fileExtension,
      };

      try {
        const response = await axios.post(
          "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDocuments",
          payload
        );
        console.log("Upload successful:", response.data);
        setSelectedFile(null);
        setPreviewSrc(null);
        setSelectedType("");
      } catch (error: any) {
        console.error("Upload failed:", error);
      }
    };
  };

  
  
  // View Document in Modal
  const handleViewDocument = async (documentID, fileName) => {
    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/Documents/${documentID}`
      );

      if (!response.data?.data?.fileBase64) {
        alert("Invalid file data received.");
        return;
      }

      const fileBase64 = response.data.data.fileBase64;
      const isImageFile = fileName.match(/\.(jpg|jpeg|png|gif)$/i);
      setIsImage(!!isImageFile);

      const byteCharacters = atob(fileBase64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      const fileType = isImageFile
        ? `image/${fileName.split(".").pop()}`
        : "application/pdf";
      const blob = new Blob([byteArray], { type: fileType });
      const url = URL.createObjectURL(blob);

      setDocumentURL(url);
      setModalOpen(true);
    } catch (error) {
      console.error("Error viewing document:", error);
      alert("Error loading document.");
    }
  };

  // Extract Only Filename (Ignore ID)
  const getFormattedFileName = (fileName) => {
    return fileName.split("_").pop();
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4 mt-4">Document Upload</h2>

     

{/* File Upload Section */}
<div className="flex items-center gap-2 flex-wrap">
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
    <button onClick={() => setIsPreviewOpen(true)} className="text-blue-500">
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
            <td className="border px-4 py-2">{getFormattedFileName(doc.fileName)}</td>
            <td className="border px-4 py-2">
              {doc.createdOn ? doc.createdOn.split("T")[0] : "N/A"}
            </td>
            <td className="border px-4 py-2 justify-center gap-2">
              {/* View Button */}
              <button
                onClick={() => handleViewDocument(doc.documentID, doc.fileName)}
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
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-2 right-2">
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
            <h2 className="text-lg font-bold mb-2">{selectedType} Preview</h2>
            {selectedFile?.type.includes("pdf") ? (
              <iframe src={previewSrc} width="100%" height="300px" title="PDF Preview"></iframe>
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
            alt="Document"
            className="max-w-full max-h-[80vh] object-contain"
          />
        ) : (
          <iframe
            src={documentURL}
            className="w-full h-[400px] border"
            title="Document Preview"
          ></iframe>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default FileUpload;
