import React, { useState } from 'react';
import MySVG from '../components/MySvgComponent';
import CustomButton from '../components/CustomButton';


const AdmissionPage: React.FC = () => {
    const [selection, setSelection] = useState("");

  return (
    <>
      <div className="bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="container">
          <div className="max-w-screen-xl mx-auto py-4">
            <div className="flex flex-wrap items-center">
              <div className="hidden w-full xl:block xl:w-1/2">
                <div className="py-17.5 px-26 text-center">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit
                    suspendisse.
                  </p>

                  <span className="mt-15 inline-block">
                    <MySVG/>
                  </span>
                </div>
              </div>

              <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
                <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                  
                  <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                  Admission Form
                  </h2>

                 
    
                  <div className="space-y-4">
  {/* Patient Details */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <input
        type="text"
        placeholder="Enter patient name"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
    </div>
    <div>
      <input
        type="text"
        placeholder="Enter UHID number"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
    </div>
  </div>

  {/* Age, Gender, and Consultant Name */}
  <div className="grid grid-cols-2 gap-4 items-center">
    {/* Age and Gender Section */}
    <div className="grid grid-cols-2 gap-4">
      <div>
       
        <input
          type="number"
          placeholder="Age"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </div>
      <div>
        
        <select
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
    </div>
    {/* Consultant Name Section */}
    <div>
    
      <input
        type="text"
        placeholder="Enter consultant name"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
    </div>
  </div>

  {/* Diagnosis and Accommodation */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <input
        type="text"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        placeholder="Enter diagnosis"
      />
    </div>
    <div>
      <input
        type="text"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        placeholder="Enter department"
      />
    </div>
    </div>
    <div className="flex items-center gap-6">
      <label className="flex items-center">
        <input
          type="radio"
          name="wardRoom"
          value="ward"
          className="mr-2"
          onChange={(e) => setSelection(e.target.value)}
        />
        Ward
      </label>
      <label className="flex items-center">
        <input
          type="radio"
          name="wardRoom"
          value="room"
          className="mr-2"
          onChange={(e) => setSelection(e.target.value)}
        />
        Room
      </label>
      
      {/* Display inline input for Ward/Room Number */}
      {selection && (
        <div className="flex items-center ml-4">
          <span className="mr-5">
            Enter {selection === "ward" ? "Ward" : "Room"} Number:
          </span>
          <input
            type="text"
            placeholder={`${selection === "ward" ? "Ward" : "Room"} Number`}
            className="w-32 rounded-lg border border-stroke bg-transparent py-1 px-3 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
      )}
      </div>

      
  

  {/* Payment Details */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <input
        type="number"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        placeholder="Enter advance amount"
      />
    </div>
    <div>
      <select
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      >
        <option value="">Payment method</option>
        <option value="cash">Cash</option>
        <option value="credit">Credit</option>
        <option value="insurance">Insurance</option>
      </select>
    </div>
    
  </div>

  {/* Additional Information */}
  <div>
    <textarea
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
      rows={3}
      placeholder="Enter any additional instructions"
    ></textarea>
  </div>

  <div className="grid grid-cols-2 gap-4 items-center mt-4"> 
  {/* Staff Signature */}
  <div className="text-center mt-6">
    <span className="border-b border-stroke dark:border-white w-full block"></span>
    <p className="text-gray-500 dark:text-gray-300 mt-2">Staff Signature (Admission Desk)</p>
  </div>
  
  {/* Signature of the Consultant */}
  <div className="text-center mt-6">
    <span className="border-b border-stroke dark:border-white w-full block"></span>
    <p className="text-gray-500 dark:text-gray-300 mt-2">Signature of the Consultant</p>

  </div>
</div>


  {/* Submit Button */}
  <div className="text-center">
  <CustomButton>
     submit
    </CustomButton>
  </div>
</div>

   
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdmissionPage;
