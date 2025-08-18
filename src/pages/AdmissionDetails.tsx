
import React, { useState } from "react";
import Barcode from 'react-barcode';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomButton from "../components/CustomButton";

const AdmissionDetails = () => {
  
  const [admissionDate, setAdmissionDate] = useState(null);
  const [admissionTime, setAdmissionTime] = useState(null);
  const [dischargeDate, setDischargeDate] = useState(null);
  const [dischargeTime, setDischargeTime] = useState(null);
  return (
    <>
 <h1 className="text-3xl font-bold mb-4 text-center text-black pt-28">
    Admission Details
  </h1>
    <div className="max-w-7xl mx-auto min-h-screen p-6 bg-white shadow-lg border mb-8 border-gray-300 rounded-lg">
      <div className="text-center mb-6 border-b pb-4">
        <h1 className="text-xl font-bold">XYZ Hospital</h1>
        <p className="text-sm">ABS Global, Pudur - 628905</p>
        <p className="text-sm">Phone: 0031-753239 | www.xyzhospital.in</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
       

        {/* Right Side: Patient Details */}
        <div className="border p-4 rounded-lg shadow-md bg-gray-50">
          <h3 className="font-bold text-lg mb-4 text-center">Patient Details</h3>
          <div className="grid gap-4">
            <input
              type="text"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              
              placeholder="Patient Name"
            />
            <input
              type="date"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              
              placeholder="Date of Birth"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
text-black outline-none focus:border-primary dark:border-form-strokedark
dark:bg-form-input dark:text-white dark:focus:border-primary"

                placeholder="Age"
              />
              <input
                type="text"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                
                placeholder="Gender"
              />
            </div>
            <input
              type="text"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              
              placeholder="Father/Spouse Name"
            />
            <textarea
             className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
             text-black outline-none focus:border-primary dark:border-form-strokedark
             dark:bg-form-input dark:text-white dark:focus:border-primary"
             
              placeholder="Address"
              rows="3"
            ></textarea>
          </div>
        </div>
         {/* Left Side: Patient Admission Details */}
         <div className="border p-4 rounded-lg shadow-md bg-gray-50">
          <h3 className="font-bold text-lg mb-4 text-center">Patient Admission Details</h3>
          {/* Row 1: Barcodes */}
          <div className="border-b pb-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              {/* Barcode 1: UHID */}
              <div>
                <p className="font-bold mb-2">UHID</p>
                <Barcode value="123456789" height={60} />
              </div>
              {/* Barcode 2: Encounter No. */}
              <div>
                <p className="font-bold mb-2">Encounter No.</p>
                <Barcode value="987654321" height={60} />
              </div>
            </div>
          </div>

          {/* Row 2: Room, Date, Time */}
          <div className="border-b pb-4 mb-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Room No."
        />
        {/* Date Picker for Admission Date */}
        <DatePicker
          selected={admissionDate}
          onChange={(date) => setAdmissionDate(date)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholderText="Select Admission Date"
          dateFormat="dd/MM/yyyy"
        />
        {/* Time Picker for Admission Time */}
        <DatePicker
          selected={admissionTime}
          onChange={(time) => setAdmissionTime(time)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholderText="Select Admission Time"
          showTimeSelect
          showTimeSelectOnly
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="HH:mm"
        />
        {/* Date Picker for Discharge Date */}
        <DatePicker
          selected={dischargeDate}
          onChange={(date) => setDischargeDate(date)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholderText="Select Discharge Date"
          dateFormat="dd/MM/yyyy"
        />
        {/* Time Picker for Discharge Time */}
        <DatePicker
          selected={dischargeTime}
          onChange={(time) => setDischargeTime(time)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholderText="Select Discharge Time"
          showTimeSelect
          showTimeSelectOnly
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="HH:mm"
        />
      </div>
    </div>

          {/* Row 3: Primary Consultant and Department */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                
                placeholder="Primary Consultant"
              />
              <input
                type="text"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                
                placeholder="Department"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis Section */}
      <div className="border p-4 rounded-lg shadow-md bg-gray-50 mt-6">
        <h3 className="font-bold text-lg mb-4 text-center">Diagnosis</h3>
        <div className="grid grid-cols-2 gap-4">
          <textarea
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        
            placeholder="Provisional Diagnosis"
            rows="3"
          ></textarea>
          <textarea
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        
            placeholder="Final Diagnosis"
            rows="3"
          ></textarea>
          <textarea
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
    text-black outline-none focus:border-primary dark:border-form-strokedark
    dark:bg-form-input dark:text-white dark:focus:border-primary"
    
            placeholder="Secondary Diagnosis"
            rows="3"
          ></textarea>
          <textarea
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          
            placeholder="Operative Procedure"
            rows="3"
          ></textarea>
        </div>
      </div>
<div>
<h3 className="font-bold flex text-lg mb-4 mt-4 text-center">Declaration</h3>
        <p className="text-sm mb-4 leading-relaxed">
          I hereby declare that all the information provided above is accurate
          to the best of my knowledge. I understand the terms and conditions
          and give my consent for treatment. Above category has been opted by us and all expenses involved in the course of treatment during admission
          have been explained to us. We agree to make the payments before discharge as per rules of the institute. I/We hereby give consent for carrying out treatment, including investigation, medications, and operation
          under any kind of anaesthesia at my/our risk.
        </p>
       
</div>
      {/* Declaration Section */}
     
      <div className="grid grid-cols-2 mt-4 gap-6">
  <div>
    <div className="border-t mt-8 border-gray-300"></div>
    <label className="block font-bold mt-2">SIGNATURE OF PATIENT/ATTENDENT</label>
  </div>
  <div>
    <div className="border-t-[0.5px] mt-8 border-gray-300"></div>
    <label className="block font-bold mt-2 ">ADMITTING DOCTORS'S NAME/SIGN</label>
  </div>
  <div>
    <div className="border-t mt-8 border-gray-300"></div>
    <label className="block font-bold mt-2 ">SIGNATURE OF ADMITTING STAFF</label>
  </div>
  <div>
    <div className="border-t mt-8 border-gray-300"></div>
    <label className="block font-bold mt-2 ">DISCHARGINNG DOCTOR'S NAME/SIGN</label>
  </div>
</div>


        <div className="mt-4">
         
          <textarea
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Discharge Status"
            rows="3"
          ></textarea>
        </div>
        <div className="flex justify-end">
        <CustomButton>
    submit
    </CustomButton>
</div>

       
    </div>
    </>
  );
};

export default AdmissionDetails;
