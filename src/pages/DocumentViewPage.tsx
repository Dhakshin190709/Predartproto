import React, { useEffect, useState } from "react";

const DocumentView: React.FC = () => {
  const [document, setDocument] = useState<{ fileBase64: string; fileExtenstion: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          "https://predart003-001-site1.anytempurl.com/api/Doctor/Documents/1be66cc4-b994-4c27-88c0-08dd4cc36dfd"
        );
        const result = await response.json();
        
        if (result.success && result.data) {
          setDocument(result.data);
        } else {
          setError("Failed to load document");
        }
      } catch (err) {
        setError("Error fetching document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!document || !document.fileBase64) return <p>No document available</p>;

  const { fileBase64, fileExtenstion } = document;
  const uri = `data:application/${fileExtenstion};base64,${fileBase64}`;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      {fileExtenstion.toLowerCase() === "pdf" ? (
        <iframe src={uri} width="100%" height="600px" title="PDF Viewer"></iframe>
      ) : (
        <img src={uri} alt="Fetched Document" style={{ maxWidth: "100%", height: "auto" }} />
      )}
    </div>
  );
};

export default DocumentView;
