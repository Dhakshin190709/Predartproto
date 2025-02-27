import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react"; // Importing the cross icon

const FileUpload = () => {
  const [uploadBoxes, setUploadBoxes] = useState([{ id: Date.now() }]);
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

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
  };

  const handleAddUploadBox = () => {
    setUploadBoxes([...uploadBoxes, { id: Date.now() }]);
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4 mt-4">Document Upload</h2>

      <div className="flex flex-col items-start space-y-4">
        {/* Left-Aligned Upload Boxes */}
        <div className="flex flex-col space-y-4">
          {uploadBoxes.map((box) => (
            <FileUploadBox key={box.id} documentTypes={documentTypes} />
          ))}
        </div>

        {/* + Add Button */}
        <div className="flex items-center gap-1">
          <div
            className="flex justify-center items-center h-10 w-10 text-white 
          rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] 
          hover:from-[#007BFF] hover:to-[#004A99]"
            onClick={handleAddUploadBox}
          >
            +
          </div>
          <span className="text-sm font-medium text-black-600">Add</span>
        </div>
      </div>
    </div>
  );
};

const FileUploadBox = ({ documentTypes }: { documentTypes: { id: string; name: string }[] }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const doctorID = '4f753961-3a5b-4fa3-3c8b-08dd548796a6';
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewSrc(null);
    setIsRemoveConfirmOpen(false);
  };
  

  return (
    <div className="w-96 rounded-lg border border-stroke bg-transparent p-6 shadow-md text-black">
      <div>
        <select
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black 
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
      </div>

      <div className="mt-4">
        <input type="file" onChange={handleFileChange} />
        {previewSrc && (
          <div className="mt-4">
            <a href="#" onClick={() => setIsPreviewOpen(true)} className="text-blue-500 underline mr-4">
              Preview
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleRemoveFile(); }} 
            className="text-red-500 underline">
  Remove
</a>

          </div>
        )}

        <div className="flex mt-4">
          <button
            onClick={handleUpload}
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] 
            text-white py-2 px-5 rounded-lg"
          >
            Upload
          </button>
        </div>
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
    </div>
  );
};

export default FileUpload;
