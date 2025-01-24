import React, { useState } from "react";
import QRCode from "qrcode.react";  // Default import

const QRCodeGenerator: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");

  const qrCodeValue = name && age ? JSON.stringify({ name, age }) : "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">QR Code Generator</h1>
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Age</label>
          <input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-6 flex justify-center">
          {qrCodeValue ? (
            <QRCode value={qrCodeValue} size={200} className="shadow-lg" />
          ) : (
            <p className="text-gray-500">Enter your name and age to generate a QR code</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
