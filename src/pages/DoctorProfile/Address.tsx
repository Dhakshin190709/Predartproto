import React, { useState, useEffect } from 'react';

import 'react-form-wizard-component/dist/style.css';

import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { inputFieldClass } from '../../components/FormStyles';


interface Address {
  addressID?: string | null;
  id?: string | null;
  addressType?: string;
  address1?: string;
  address2?: string;
  city?: string;
  district?: string;
  state?: string;
  zipCode?: string;
  type?: string; // Optional or required, based on your use case
}

interface AddressProps {
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<any[]>>;
  handleAddressSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Address: React.FC<AddressProps> = ({ addresses, setAddresses, handleAddressSubmit }) => {
 


  const [addressTypes, setAddressTypes] = useState([]);
 
 
  const [errors, setErrors] = useState<AddressError[]>([]);

 

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV')
      .then((response) => response.json())
      .then((data) => {
        console.log('Raw API Data:', data); // Log entire data to check its structure

        if (data && Array.isArray(data.data)) {
          // Log available types to understand what is available in the response
          const availableTypes = data.data.map((item) => item.type);
          console.log('Available Types in Data:', availableTypes);

          // Filter data based on type, including the 'LanguageMaster' type
          const filteredData = {
            addressTypes: data.data.filter(
              (item) => item.type?.toLowerCase() === 'address',
            ),
            // Add LanguageMaster filter
          };

          // Log filtered results for debugging
          console.log('Filtered Data:', filteredData);

          // Set state with the filtered data

          setAddressTypes(filteredData.addressTypes);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleAddressChange = (
    index: number,
    field: keyof Address,
    value: string,
  ) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);

    const updatedErrors = [...errors];
    if (updatedErrors[index]?.[field] && value.trim() !== '') {
      updatedErrors[index][field] = ''; // Clear error on correction
      setErrors(updatedErrors);
    }
  };

   const addAddress = () => {
        setAddresses([
          ...addresses,
          {
            addressType: 'TemporaryAddress',
            type: 'Doctor',
            address1: '', // Required
            address2: '',
            city: '', // Required
            district: '',
            state: '',
            zipCode: '', // Renamed from 'pincode'
            isActive: true,
            degreeName: '',
            university: '',
            location: '',
            startDate: null, // Added startDate field
            endDate: null, // Added endDate field
            isHighestEducation: true,
          },
        ]);
      };

  const removeAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };

  return (
    <form className="space-y-4" onSubmit={handleAddressSubmit}>
      {/* User Info */}

      {/* Address List */}
      <h2 className="text-lg font-bold text-black-700 text-left mt-8">
        Address
      </h2>
      {addresses.map((address, index) => (
        <div
          key={index}
          className={inputFieldClass}
        >
          {/* Address Type Dropdown */}
          <div className="flex justify-between items-center mb-4">
            <select
              className="w-[200px] rounded-lg border border-stroke bg-transparent p-2 pl-4 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={address.type}
              onChange={(e) =>
                handleAddressChange(index, 'type', e.target.value)
              }
            >
              <option value="">Select Address Type</option>
              {addressTypes.map((type) => (
                <option key={type.appLOVID} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors[index]?.type && (
              <p className="error-text">{errors[index].type}</p>
            )}
          </div>
          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
             
              <input
                type="text"
                className={inputFieldClass}
                value={address.address1}
                onChange={(e) =>
                  handleAddressChange(index, 'address1', e.target.value)
                }
                placeholder="Enter address line 1"
              />
              {errors[index]?.address1 && (
                <p className="error-text">{errors[index].address1}</p>
              )}
            </div>
            <div>
             
              <input
                type="text"
                className={inputFieldClass}
                value={address.address2}
                onChange={(e) =>
                  handleAddressChange(index, 'address2', e.target.value)
                }
                placeholder="Enter address line 2"
              />
              {errors[index]?.address2 && (
                <p className="error-text">{errors[index].address2}</p>
              )}
            </div>
          </div>

          {/* City, District, State,pincode */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
            <div>
            
              <input
                type="text"
                className={inputFieldClass}
                value={address.city}
                onChange={(e) =>
                  handleAddressChange(index, 'city', e.target.value)
                }
                placeholder="Enter city"
              />
              {errors[index]?.city && (
                <p className="error-text">{errors[index].city}</p>
              )}
            </div>

            <div>
         
              <input
                type="text"
                placeholder="Enter District"
                className={inputFieldClass}
                value={address.district}
                onChange={(e) =>
                  handleAddressChange(index, 'district', e.target.value)
                }
              />

              {errors[index]?.district && (
                <p className="error-text">{errors[index].district}</p>
              )}
            </div>

            <div>
              {/* State Input Field */}
              <input
                type="text"
                placeholder="Enter State"
                className={inputFieldClass}
                value={address.state}
                onChange={(e) =>
                  handleAddressChange(index, 'state', e.target.value)
                }
              />

              {errors[index]?.state && (
                <p className="error-text">{errors[index].state}</p>
              )}
            </div>

            <div>
             
              <input
                type="text"
                className={inputFieldClass}
                value={address.zipCode}
                onChange={(e) =>
                  handleAddressChange(index, 'zipCode', e.target.value)
                }
                placeholder="Enter pincode"
              />
              {errors[index]?.zipCode && (
                <p className="error-text">{errors[index].zipCode}</p>
              )}
            </div>
          </div>

          {/* Active Checkbox */}

          <div className="flex justify-end mt-4">
            <label className="text-sm font-medium text-gray-700 mr-2">
              Active
            </label>
            <input
              type="checkbox"
              className="p-2 border rounded-md"
              checked={address.isActive || true} // Makes sure it's checked initially
              onChange={(e) =>
                handleAddressChange(index, 'isActive', e.target.checked)
              }
            />
          </div>
        </div>
      ))}
      {/* Add New Address */}
      <div className="flex items-center justify-end gap-1">
        {/* Clickable Icon */}
        <div
          className="flex justify-center items-center h-10 w-10
                     text-white rounded-full cursor-pointer bg-gradient-to-b
                      from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
          onClick={addAddress}
        >
          +
        </div>

        {/* Non-clickable Text */}
        <span className="text-sm font-medium text-black-600">Add</span>

      </div>
      <div className="flex justify-center gap-2">
        
       
        {/* <CustomButton  type="submit">Submit address</CustomButton> */}
      </div>
    </form>
  );
};

export default Address;
