import React, { useState } from 'react';
import CustomButton from '../../components/CustomButton';
const OffersMaster: React.FC = () => {
    const [filterName, setFilterName] = useState('');
    const [filterOfferType, setFilterOfferType] = useState('');
    const [filterCode, setFilterCode] = useState('');
    const [filterValidity, setFilterValidity] = useState('');
    const [filterActive, setFilterActive] = useState<boolean | ''>('');
  
    return (
      <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Offers Creation</h1>
  
        {/* Filters Section */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex gap-4">
            {/* Row 1 */}
            <input
              type="text"
              placeholder="Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="flex-1 rounded-lg border border-stroke py-4 px-6"
            />
            <input
              type="text"
              placeholder="Offer Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="flex-1 rounded-lg border border-stroke py-4 px-6"
            />
  
            <select
              value={filterOfferType}
              onChange={(e) => setFilterOfferType(e.target.value)}
              className="flex-1 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="" disabled>Select Offer Type</option>
              <option value="Discount">Discount</option>
              <option value="Cashback">Cashback</option>
              <option value="Free Trial">Free Trial</option>
            </select>
  
           
          </div>
  
          <div className="flex gap-4">
            {/* Row 2 */}
            <input
              type="text"
              placeholder="Offer Code"
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              className="flex-1 rounded-lg border border-stroke py-4 px-6"
            />
            <select
              value={filterOfferType}
              onChange={(e) => setFilterOfferType(e.target.value)}
              className="flex-1 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="" disabled>Select Subscription Type</option>
              <option value="Discount">Basic</option>
              <option value="Cashback">Premium</option>
              <option value="Free Trial">Gold</option>
            </select>
  
            <input
              type="date"
              placeholder="Validity"
              value={filterValidity}
              onChange={(e) => setFilterValidity(e.target.value)}
              className="flex-1 rounded-lg border border-stroke py-4 px-6"
            />
            
  
            
          </div>
          <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterActive === true}
                onChange={(e) => setFilterActive(e.target.checked ? true : '')}
                className="mr-2"
              />
              Active
            </label>
         {/* Search Button */}
        <div className="flex justify-start mt-4">
        <CustomButton >
    save
    </CustomButton>
        </div>
        </div>
      </div>
    );
  };
  
  export default OffersMaster;
  