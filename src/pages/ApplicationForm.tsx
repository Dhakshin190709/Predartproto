import React, { useState } from 'react';
import HospitalLogo from '../images/logo/hplogo-removebg-preview.png';
const PatientApplicationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    dob: '',
    age: '',
    gender: '',
    mobile: '',
    address1: '',
    address2: '',
    email: '',
    idProof: '',
    declarationDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 border border-gray-300 shadow-lg rounded-lg font-sans">
      {/* Form Title */}
      <h1 className="text-3xl font-bold text-center mb-4">Patient Application Form</h1>

      {/* Hospital Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
       <div className="flex items-center space-x-1">
  <img
    src={HospitalLogo}
    alt="Hospital Logo"
    className="h-30 w-30 mb-2"
  />

  <div>
    <h2 className="text-2xl font-bold">ABC Multispeciality Hospital</h2>
    <p className="text-gray-700">123, Health Street, Wellness City, TN - 600001</p>
  </div>
</div>

        <div className="flex flex-col items-end">
          {/* <h3 className="text-lg font-semibold mb-2">Barcode & QR Code</h3> */}
          {/* <img
            src="https://barcode.tec-it.com/barcode.ashx?data=123456789&code=Code128&dpi=96"
            alt="Barcode"
            className="h-16 mb-2"
          /> */}
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?data=SampleQRCode&size=100x100"
            alt="QR Code"
            className="h-16"
          />
        </div>
      </div>

      {/* Patient Details */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="Patient Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            placeholder="Date of Birth"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Age"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder="Gender"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email ID"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <textarea
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            placeholder="Address Line 1"
            rows={2}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary col-span-2"
          />
          <textarea
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            placeholder="Address Line 2"
            rows={2}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary col-span-2"
          />
          <input
            name="idProof"
            value={formData.idProof}
            onChange={handleChange}
            placeholder="ID Proof (Aadhaar/Passport)"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary col-span-2"
          />
        </div>
      </div>

      {/* Declaration */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold underline mb-2">Declaration</h2>
        <p className="mb-4">
          I hereby declare that the above information is true and correct to the best of my knowledge and belief. I agree to abide by the hospital rules and provide any additional information if required.
        </p>
        <div className="flex justify-between mb-8 ">
          <div>
            <p className="border-t border-gray-500 w-48 mt-4 text-center">Patient Signature</p>
          </div>
          <div>
            <input
              type="date"
              name="declarationDate"
              value={formData.declarationDate}
              onChange={handleChange}
              placeholder="Date"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Office Use Only */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold underline mb-2">For Office Use Only</h2>
        <div className="space-y-2">
          <p>Patient ID: ________________________</p>
          <p>Assigned Doctor: ________________________</p>
          <p>Remarks:</p>
          <p className="border border-gray-300 rounded px-2 py-4 h-24"></p>
        </div>
      </div>
    </div>
  );
};

export default PatientApplicationForm;
