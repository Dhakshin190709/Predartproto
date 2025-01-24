import { useState,useEffect } from 'react';
import { FaSearch } from "react-icons/fa";
import axios from 'axios';

const DocumentUpload = () => {

  
  const [documentTypes, setDocumentTypes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    useEffect(() => {
      const fetchDocumentTypes = async () => {
        try {
          const response = await axios.get(
            "https://predart003-001-site1.anytempurl.com/api/AppLOV",
            { params: { fetchType: "DocumentType" } }
          );
    
          if (response.data && Array.isArray(response.data.data)) {
            // Filter items where `type` is "DocumentType"
            const filteredDocumentTypes = response.data.data.filter(
              (item) => item.type === "DocumentType"
            );
            setDocumentTypes(filteredDocumentTypes);
          } else {
            console.error("Unexpected API response structure:", response.data);
            setError("Invalid data format received.");
          }
        } catch (err) {
          console.error("Error fetching document types:", err);
          setError("Failed to load document types.");
        } finally {
          setLoading(false);
        }
      };
    
      fetchDocumentTypes();
    }, []);
    
    
  const [uploadBoxes, setUploadBoxes] = useState([
    { id: 1, selectedType: "", files: [], showPreview: false, preview: "", previewType: "" },
  ]);

  const handleDropdownChange = (id, value) => {
    setUploadBoxes((prev) =>
      prev.map((box) =>
        box.id === id ? { ...box, selectedType: value } : box
      )
    );
  };

  const handleFileChange = (id, e) => {
    const files = e.target.files;
    setUploadBoxes((prev) =>
      prev.map((box) =>
        box.id === id ? { ...box, files: files } : box
      )
    );
  };

  const handlePreview = (id) => {
    const file = uploadBoxes.find((box) => box.id === id).files[0];
    if (file) {
      const previewType = file.type.includes("image") ? "image" : "text";
      const reader = new FileReader();
      reader.onload = () => {
        setUploadBoxes((prev) =>
          prev.map((box) =>
            box.id === id
              ? { ...box, showPreview: true, preview: reader.result, previewType: previewType }
              : box
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const closePreview = (id) => {
    setUploadBoxes((prev) =>
      prev.map((box) =>
        box.id === id ? { ...box, showPreview: false, preview: "" } : box
      )
    );
  };

  const removeFile = (id) => {
    setUploadBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, files: [] } : box))
    );
  };

  const addUploadBox = () => {
    setUploadBoxes((prev) => [
      ...prev,
      { id: prev.length + 1, selectedType: "", files: [], showPreview: false, preview: "", previewType: "" },
    ]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-black mb-6">Document Upload</h2>

      {/* Appointment Number Input */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Appointment Number"
          className="w-[25%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <span className="absolute left-50 top-1/2 transform -translate-y-1/2 text-gray-500">
          <FaSearch size={18} />
        </span>
      </div>

      {/* Patient Info */}
      <div className="rounded-lg border border-stroke bg-transparent py-4 px-6 text-gray-400 shadow-md mb-6">
        <div className="text-center font-semibold" style={{ color: '#bcc2be' }}>
          Patient Name: Priya | Date: 2024-12-09 | Age: 22 | Gender: Female
        </div>
      </div>

      {/* Upload Boxes */}
      <div className="flex flex-col gap-6">
        {uploadBoxes.map((box) => (
          <div key={box.id} className="w-full sm:w-80 md:w-96 rounded-lg border border-stroke bg-transparent py-4 px-6">
           <select
  value={box.selectedType}
  onChange={(e) => handleDropdownChange(box.id, e.target.value)}
  className="w-full mb-4 flex rounded-lg border border-stroke bg-transparent py-4 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
>
  <option value="">-- Select File Type --</option>
  {documentTypes.map((type, index) => (
    <option key={index} value={type.name}>
      {type.name}
    </option>
  ))}
</select>


            <div
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange(box.id, { target: { files: e.dataTransfer.files } });
              }}
              onDragOver={(e) => e.preventDefault()}
              className="w-full border-stroke bg-transparent text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center"
            >
              <p className="text-gray-500">Drag & Drop Files Here</p>
              <p className="text-gray-500 mt-2">or</p>
              <label
                htmlFor={`file-upload-${box.id}`}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg cursor-pointer"
              >
                Choose File
              </label>
              <input
                id={`file-upload-${box.id}`}
                type="file"
                onChange={(e) => handleFileChange(box.id, e)}
                className="hidden"
              />
            </div>

            {box.files.length > 0 && (
              <div className="mt-4">
                <div className="flex border border-stroke bg-transparent text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary items-center justify-between p-2 border border-gray-300 rounded mt-2">
                  <div className="flex items-center">
                    <div className="bg-gray-200 h-10 w-10 rounded flex items-center justify-center mr-2">
                      📄
                    </div>
                    <span
                      className="text-gray-700 cursor-pointer"
                      onClick={() => handlePreview(box.id)}
                    >
                      {box.files[0].name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(box.id)}
                    className="text-red-500 underline hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>

                {box.showPreview && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg max-w-lg max-h-screen overflow-auto">
                      {box.previewType === "image" ? (
                        <img
                          src={box.preview}
                          alt="Preview"
                          className="max-w-full max-h-96"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap break-words text-black">
                          {box.files[0].name}
                        </pre>
                      )}
                      <button
                        onClick={() => closePreview(box.id)}
                        className="mt-2 text-red-500 underline"
                      >
                        Close Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center justify-start gap-1 mt-6 px-80">
          <div
            className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
            onClick={addUploadBox}
          >
            +
          </div>
          <span className="text-sm pr-7 font-medium text-black-600">Add</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
