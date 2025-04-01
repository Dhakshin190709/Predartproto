import React, { useState } from 'react';
import CustomButton from '../../components/CustomButton';

const CampCreation = () => {
  const [formData, setFormData] = useState({
    campName: '',
    overview: '',
    registrationDeadline: '',
    campLocation: '',
    detailedAddress: '',
    organizerName: '',
    organizerContact: '',
    campFee: '',
    service: '',
    servicesList: [],
    accommodation: '',
    logisticArrangement: '',
    feeType: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceAdd = () => {
    if (formData.service) {
      setFormData({
        ...formData,
        servicesList: [...formData.servicesList, formData.service],
        service: '', // Clear the input after adding
      });
    }
  };

  const handleServiceRemove = (serviceToRemove) => {
    setFormData({
      ...formData,
      servicesList: formData.servicesList.filter((service) => service !== serviceToRemove),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Camp Creation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Camp Name, Camp Location, Organizer Name */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="campName"
            value={formData.campName}
            onChange={handleChange}
            placeholder="Camp Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            name="campLocation"
            value={formData.campLocation}
            onChange={handleChange}
            placeholder="Camp Location"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            name="organizerName"
            value={formData.organizerName}
            onChange={handleChange}
            placeholder="Organizer Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Row 2: Organizer Contact, Registration Deadline, Fees */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="tel"
            name="organizerContact"
            value={formData.organizerContact}
            onChange={handleChange}
            placeholder="Organizer Contact Number"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
            placeholder="Registration Deadline"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="number"
            name="campFee"
            value={formData.campFee}
            onChange={handleChange}
            placeholder="Camp Fee"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Row 3: Overview, Detailed Address */}
        <div className="grid grid-cols-2 gap-4">
  <textarea
    name="overview"
    value={formData.overview}
    onChange={handleChange}
    placeholder="Overview"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
  <textarea
    name="detailedAddress"
    value={formData.detailedAddress}
    onChange={handleChange}
    placeholder="Detailed Address"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
</div>


        {/* Row 4: Service, Add Service Button */}
        <div className="flex w-full space-x-4">
  <input
    type="text"
    name="service"
    value={formData.service}
    onChange={handleChange}
    placeholder="Service"
    className="w-[35%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
  <button
    type="button"
    onClick={handleServiceAdd}
    className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
    hover:from-[#007BFF] hover:to-[#004A99]
    text-white transition duration-150 
    ease-out hover:ease-in py-2 px-5 rounded-lg"
  >
    Add Service
  </button>
</div>



        {/* Display Services Added */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {formData.servicesList.map((service, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span>{service}</span>
              <button
                type="button"
                onClick={() => handleServiceRemove(service)}
                className="text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        
 
  
  











<div className="flex items-center space-x-8 mt-4">
  {/* Row for radio buttons under Accommodation */}
  <div className="flex items-center space-x-4 w-1/3">
    <label><b>Accommodation:</b></label>
    <div className="flex items-center space-x-4">
      <input
        type="radio"
        id="accommodationNone"
        name="accommodation"
        value="none"
        onChange={handleChange}
        checked={formData.accommodation === 'none'}
      />
      <label htmlFor="accommodationNone">None</label>
      <input
        type="radio"
        id="accommodationStayAndFood"
        name="accommodation"
        value="stayAndFood"
        onChange={handleChange}
        checked={formData.accommodation === 'stayAndFood'}
      />
      <label htmlFor="accommodationStayAndFood">Stay & Food</label>
    </div>
  </div>

  {/* Row for radio buttons under Logistic */}
  <div className="flex items-center space-x-4 w-1/3">
    <label><b>Logistic Arrangement:</b></label>
    <div className="flex items-center space-x-4">
      <input
        type="radio"
        id="logisticYes"
        name="logisticArrangement"
        value="yes"
        onChange={handleChange}
        checked={formData.logisticArrangement === 'yes'}
      />
      <label htmlFor="logisticYes">Yes</label>
      <input
        type="radio"
        id="logisticNo"
        name="logisticArrangement"
        value="no"
        onChange={handleChange}
        checked={formData.logisticArrangement === 'no'}
      />
      <label htmlFor="logisticNo">No</label>
    </div>
  </div>

  {/* Row for radio buttons under Fees */}
  <div className="flex items-center space-x-4 w-1/3">
    <label><b>Fees:</b></label>
    <div className="flex items-center space-x-4">
      <input
        type="radio"
        id="feesFree"
        name="feeType"
        value="free"
        onChange={handleChange}
        checked={formData.feeType === 'free'}
      />
      <label htmlFor="feesFree">Free</label>
      <input
        type="radio"
        id="feesPrice"
        name="feeType"
        value="price"
        onChange={handleChange}
        checked={formData.feeType === 'price'}
      />
      <label htmlFor="feesPrice">Price</label>
    </div>
  </div>
</div>





        {/* Create Camp Button */}
        <div className="flex justify-center mt-4">
         
          <CustomButton >
          Create Camp
    </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default CampCreation;
