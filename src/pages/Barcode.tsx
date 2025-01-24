import React, { useState } from 'react';
import BarcodeScanner from 'react-qr-barcode-scanner';
import Barcode from 'react-barcode'; // Barcode generator

const BarcodeScannerPage = () => {
  const [scannedData, setScannedData] = useState(''); // Holds the raw scanned data
  const [name, setName] = useState(''); // Holds the name corresponding to the barcode

  // Mock data for barcode values and corresponding names
  const barcodeData: Record<string, string> = {
    '12345623455556666512334': 'John Doe',
    '789101': 'Jane Smith',
    '112233': 'Alice Johnson',
  };

  // Handle successful scan
  const handleScan = (data: string) => {
    if (data) {
      const trimmedData = data.trim(); // Remove any trailing spaces or formatting issues
      setScannedData(trimmedData); // Store the raw data
      const matchedName = barcodeData[trimmedData] || 'Name not found';
      setName(matchedName); // Match or show fallback message
    }
  };

  // Handle scan error
  const handleError = (err: Error) => {
    console.error('Scan Error:', err);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Barcode Scanner</h1>

      {/* Render a sample barcode */}
      <div className="flex flex-col items-center mb-6">
        <Barcode value="12345623455556666512334" height={60} /> {/* Increased barcode width */}
      </div>

      {/* Barcode scanner component */}
      <div className="w-full max-w-md">
        <BarcodeScanner
          onUpdate={(err, result) => {
            if (result) {
              console.log('Full Scanner Result:', result); // Debugging output to inspect result
              handleScan(result.text || ''); // Adjust this based on your inspection
            }
            if (err) handleError(err);
          }}
        />
      </div>

      {/* Display the scanned raw data */}
      {scannedData && (
        <h2 className="mt-4 text-lg font-medium">Scanned Data: {scannedData}</h2>
      )}

      {/* Display the name corresponding to the barcode */}
      {name && <h2 className="mt-2 text-lg font-semibold">Name: {name}</h2>}
    </div>
  );
};

export default BarcodeScannerPage;
