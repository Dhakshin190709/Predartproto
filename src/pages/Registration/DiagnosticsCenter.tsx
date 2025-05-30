import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import api from '../../api/request';
const LabRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    tenant: '',
    hospitalType: '',
  });
  const [hospitals, setHospitals] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [address, setAddress] = useState<string>('');

  const [patientID, setPatientID] = useState(null);

  const [labTypes, setLabTypes] = useState([]);

  const [selectedLabType, setSelectedLabType] = useState('');
  const [labName, setLabName] = useState('');
  const [labCode, setLabCode] = useState('');
  const [labFacilities, setLabFacilities] = useState('');
  const [selectedFacilitiesType, setSelectedFacilitiesType] = useState('');
 const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [facilitiesTypes, setFacilitiesTypes] = useState([]);
 const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
   const [cities, setCities] = useState<City[]>([]);
   const [pincodes, setPincodes] = useState<string[]>([]);
   const [showCityInput, setShowCityInput] = useState(false);
   const [manualCity, setManualCity] = useState('');
   const [touchedFields, setTouchedFields] = useState<{
     [key: string]: boolean;
   }>({});
  const [addresses, setAddresses] = useState<Address[]>([
    {
      addressType: '',
      address1: '',
      address2: '',
      state: '',
      district: '',
      zipCode: '',
      city: '',
      type: 'patient',
    },
  ]);
  useEffect(() => {
    const fetchAppLOVTypes = async () => {
      try {
        const response = await api.get('/AppLOV');
        const data = response.data;

        if (!Array.isArray(data.data)) {
          console.error('Unexpected format: Expected an array in data.data');
          return;
        }

        const addressTypes = data.data.filter(
          (item: any) => item.type === 'Address',
        );
        const labTypes = data.data.filter(
          (item: any) => item.type === 'LabType',
        );
        const facilitiesTypes = data.data.filter(
          (item: any) => item.type === 'FacilitiesType',
        );

        setAddressTypes(addressTypes);
        setLabTypes(labTypes);
        setFacilitiesTypes(facilitiesTypes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAppLOVTypes();
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/Hospital/list');
        const data = response.data;

        if (data && data.data) {
          setHospitals(data.data); // Assuming `data.data` contains the hospital list
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    fetchHospitals();
  }, []);

  // Fetch tenant data
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/Tenant');
        const data = response.data;

        console.log('Tenant Data:', data);

        // Adjust if the API returns `data.data` or directly `data`
        setTenants(data.data || data);
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchTenants();
  }, []);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle the form submission
  };

  const handleSingleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };
 
  const [addressTypes, setAddressTypes] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

   const [formErrors, setFormErrors] = useState<{
      district: any;
      pincode: any;
      city: any;
      state: any;
      patientName: string;
      patientEmail: string;
      patientPhoneNumber: string;
      patientDateOfBirth: string;
      patientGender: string;
    }>({
      patientName: '',
      patientEmail: '',
      patientPhoneNumber: '',
      patientDateOfBirth: '',
      patientGender: '',
      state: '',
      district: '',
      pincode: '',
      city: '',
    });
  
  const handleAddressSubmit = () => {
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found in session storage.');
      alert('User not logged in. Please log in again.');
      return;
    }

    // Add patientID and createdBy to each address
    const addressData = addresses.map((address) => ({
      ...address,
      id: patientID,
      createdBy: userID,
    }));

    // Validate required fields
    const requiredFields = [
      'addressType',
      'address1',
      'city',
      'zipCode',
      'type',
    ];
    const invalidAddresses = addressData.filter((address) =>
      requiredFields.some((field) => !address[field]),
    );

    if (invalidAddresses.length > 0) {
      console.error(
        'Missing required fields in some addresses:',
        invalidAddresses,
      );
      alert(
        'Some addresses are missing required fields. Please check your input.',
      );
      return;
    }

    // API call using Axios instance
    api
      .post('/Patient/SaveAddress', addressData)
      .then((response) => {
        console.log('Addresses saved successfully:', response.data);
        alert('Addresses saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving addresses:', error);
        alert('Failed to save addresses.');
      });
  };

  const handleLabSubmit = async () => {
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found in session storage.');
      alert('User not logged in. Please log in again.');
      return;
    }

    const payload = {
      createdBy: userID,
      tenantID: formData.tenant,
      hospitalID: formData.hospitalType,
      labName: labName,
      labCode: labCode,
      labType: selectedLabType,
      labFacilities: selectedFacilitiesType,
    };

    try {
      const response = await api.post('/Laboratory', payload); // Reuses baseURL + headers

      console.log('Lab Created Successfully:', response.data);
      alert('Lab Created Successfully!');

      // Reset Form
      setLabName('');
      setLabCode('');
      setSelectedLabType('');
      setLabFacilities('');
    } catch (error) {
      console.error('Error creating lab:', error);
      alert('Failed to create lab. Please try again.');
    }
  };

  const handleSelectAddress = (index: number) => {
    const newTouched = { ...touchedFields };
    Object.keys(addresses[index]).forEach((field) => {
      newTouched[`${index}-${field}`] = true;
    });
    setTouchedFields(newTouched);
    validateAddress(addresses[index], index);
  };

  const validateAddress = (address: Address, index: number) => {
    const errors: { [key: string]: string } = {};

    if (!address.addressType) errors.addressType = 'Address type is required'; // ✅ Match this to your form field
    if (!address.address1) errors.address1 = 'Address line 1 is required';
    if (!address.address2) errors.address2 = 'Address line 2 is required';
    if (!address.city) errors.city = 'City is required';
    if (!address.district) errors.district = 'District is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zipCode) errors.zipCode = 'Zip code is required';

    setFormErrors((prev) => ({ ...prev, [index]: errors }));
  };

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get('/Address/states');

        if (response.data?.data && Array.isArray(response.data.data)) {
          setStates(response.data.data);
        } else {
          console.warn('Unexpected format in states response');
        }
      } catch (error) {
        console.error('Error fetching states:', error);
        toast.error('Failed to load states');
      }
    };

    fetchStates();
  }, []);

 const updateAddress = (
    index: number,
    field: keyof Address,
    value: string,
  ) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);

    if (touchedFields[`${index}-${field}`]) {
      validateAddress(updatedAddresses[index], index);
    }
  };

  const handleStateChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const stateCode = e.target.value;

    // Reset dependent fields
    setSelectedState(stateCode);
    setSelectedDistrict('');
    setCities([]);
    setShowCityInput(false);

    // Clear corresponding address fields
    updateAddress(index, 'state', stateCode);
    updateAddress(index, 'district', '');
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    try {
      const response = await api.get(
        `/Address/districts?StateCode=${stateCode}`,
      );

      if (response.data?.data && Array.isArray(response.data.data)) {
        const districts = response.data.data;
        setDistricts(districts);

        // Extract and deduplicate pin codes
        const uniquePincodes = Array.from(
          new Set(districts.map((d: District) => d.pinCode)),
        );
        setPincodes(uniquePincodes);
      } else {
        console.warn('Unexpected district data format:', response.data);
        setDistricts([]);
        setPincodes([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to load districts for the selected state.');
      setDistricts([]);
      setPincodes([]);
    }
  };

    const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    setShowCityInput(false);

    // Reset related fields in address
    updateAddress(index, 'district', districtName);
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    // Update pin codes related to the selected district
    const filteredPins = districts
      .filter((item) => item.districtName === districtName)
      .map((item) => item.pinCode);

    setPincodes(filteredPins);

    try {
      const response = await api.get(
        `/Address/cities?districtName=${districtName}`,
      );
      const cityData = response.data?.data;

      if (Array.isArray(cityData) && cityData.length > 0) {
        setCities(cityData);
        setShowCityInput(false);
      } else {
        setCities([]);
        setShowCityInput(true); // No cities returned; show manual input
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to load cities for the selected district.');
      setCities([]);
      setShowCityInput(true); // Assume fallback to manual entry
    }
  };

  const validateCity = (city: string) => {
    const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u; // No emojis
    const noSpecialChars = /^[a-zA-Z\s]+$/; // Only letters and spaces allowed
    const maxLength = city.length <= 20; // Maximum length of 20 characters

    // Check if the city is valid: no emojis, no special characters, and max length of 20
    return (
      city && noEmojis.test(city) && noSpecialChars.test(city) && maxLength
    );
  };

  return (
    <div className="bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Right Section */}
      <div className="w-full border-stroke dark:border-strokedark">
        <div className="w-full p-0 sm:p-4 xl:p-6">
          {' '}
          {/* Reduced padding */}
          <h2 className="mt-0 mb-3 text-2xl font-semibold text-black dark:text-white sm:text-title-xl2">
            Diagnostics Center
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  value={formData.tenant || ''} // Use formData.tenant
                  onChange={(e) => {
                    setFormData({ ...formData, tenant: e.target.value });
                    handleSingleInputChange('tenant', e.target.value);
                  }}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>
                    Select Tenant
                  </option>
                  {tenants.map((tenant) => (
                    <option key={tenant.tenantID} value={tenant.tenantID}>
                      {tenant.tenantName} {/* Display the tenant's name */}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hospital */}
              <div>
                <select
                  value={formData.hospitalType}
                  onChange={(e) =>
                    handleSingleInputChange('hospitalType', e.target.value)
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select Hospital</option>
                  {hospitals.length > 0 ? (
                    hospitals.map((hospital) => (
                      <option
                        key={hospital.hospitalID}
                        value={hospital.hospitalID}
                      >
                        {hospital.hospitalName}
                      </option>
                    ))
                  ) : (
                    <option value="">No Hospitals Available</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                {/* Lab Name Input */}
                <input
                  type="text"
                  placeholder="Enter Lab Name"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                />
              </div>
              <div>
                {/* Code Input */}
                <input
                  type="text"
                  placeholder="Enter Code"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10  
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={labCode}
                  onChange={(e) => setLabCode(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={selectedLabType} // Ensure you have a state for this
                  onChange={(e) => setSelectedLabType(e.target.value)}
                >
                  <option value="">Select Lab Type</option>
                  {labTypes.map((type) => (
                    <option key={type.appLOVID} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                {/* Facilities Input */}
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={selectedFacilitiesType} // Ensure you have a state for this
                  onChange={(e) => setSelectedFacilitiesType(e.target.value)}
                >
                  <option value="">Select Facilities Type</option>
                  {facilitiesTypes.map((type) => (
                    <option key={type.appLOVID} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

           <div className="space-y-4">
            {/*  address form  */}

            <h2 className="text-xl font-bold text-left mb-4">Address</h2>
            {addresses &&
              addresses.length > 0 &&
              addresses.map((address, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAddress(index)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  {/* Address Type */}
                  <div className="mb-4">
                    <div className="flex flex-col">
                      <select
                        className="w-[200px] rounded-lg border border-stroke p-2 pl-4 text-black outline-none bg-transparent dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.addressType}
                        onChange={(e) =>
                          updateAddress(index, 'addressType', e.target.value)
                        }
                      >
                        <option value="">Select Address Type</option>
                        {addressTypes.map((type) => (
                          <option key={type.appLOVID} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      {formErrors[index]?.addressType && (
                        <p className="text-red-500 text-sm mt-1 text-left">
                          {formErrors[index].addressType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.address1}
                        onChange={(e) =>
                          updateAddress(index, 'address1', e.target.value)
                        }
                        placeholder="Enter address line 1"
                        maxLength={50}
                      />
                      {formErrors[index]?.address1 && (
                        <p className="text-red-500 text-sm">
                          {formErrors[index].address1}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.address2}
                        onChange={(e) =>
                          updateAddress(index, 'address2', e.target.value)
                        }
                        placeholder="Enter address line 2"
                        maxLength={50}
                      />
                      {formErrors[index]?.address2 && (
                        <p className="text-red-500 text-sm">
                          {formErrors[index].address2}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* City, District, State, Zip Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Section 1: State & District */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div>
                        <select
                          value={address.state || ''}
                          onChange={(e) => handleStateChange(e, index)}
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state.id} value={state.stateName}>
                              {state.stateName}
                            </option>
                          ))}
                        </select>
                        {formErrors[index]?.state && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].state}
                          </p>
                        )}
                      </div>
                      <div>
                        <select
                          value={address.zipCode || ''}
                          onChange={(e) =>
                            updateAddress(index, 'zipCode', e.target.value)
                          }
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <option value="">Select Pincode</option>
                          {pincodes.map((pin, index) => (
                            <option key={index} value={pin}>
                              {pin}
                            </option>
                          ))}
                        </select>

                        {formErrors[index]?.zipCode && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].zipCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Pincode & City */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-5">
                      <div>
                        <select
                          value={address.district || ''}
                          onChange={(e) => handleDistrictChange(e, index)}
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <option value="">Select District</option>
                          {[
                            ...new Map(
                              districts.map((d) => [d.districtName, d]),
                            ).values(),
                          ].map((dist) => (
                            <option key={dist.id} value={dist.districtName}>
                              {dist.districtName}
                            </option>
                          ))}
                        </select>
                        {formErrors[index]?.district && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].district}
                          </p>
                        )}
                      </div>
                      <div>
                        {showCityInput ? (
                          <>
                            <input
                              type="text"
                              value={address.city || ''}
                              maxLength={20}
                              onChange={(e) => {
                                const value = e.target.value;
                                setManualCity(value); // store the value in the state
                                updateAddress(index, 'city', value);

                                if (!validateCity(value)) {
                                  setFormErrors((prev) => ({
                                    ...prev,
                                    [index]: {
                                      ...prev[index],
                                      city: 'Invalid city name',
                                    },
                                  }));
                                } else {
                                  setFormErrors((prev) => {
                                    const { city, ...rest } = prev[index] || {};
                                    return {
                                      ...prev,
                                      [index]: rest,
                                    };
                                  });
                                }
                              }}
                              placeholder="Enter City"
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />

                            {formErrors[index]?.city && (
                              <p className="text-red-500 text-sm">
                                {formErrors[index].city}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <select
                              value={address.city || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateAddress(index, 'city', value);

                                if (!value) {
                                  setFormErrors((prev) => ({
                                    ...prev,
                                    [index]: {
                                      ...prev[index],
                                      city: 'City is required',
                                    },
                                  }));
                                } else {
                                  setFormErrors((prev) => {
                                    const { city, ...rest } = prev[index] || {};
                                    return {
                                      ...prev,
                                      [index]: rest,
                                    };
                                  });
                                }
                              }}
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              <option value="">Select City</option>
                              {cities.map((city) => (
                                <option key={city.id} value={city.cityName}>
                                  {city.cityName}
                                </option>
                              ))}
                            </select>

                            {formErrors[index]?.city && (
                              <p className="text-red-500 text-sm">
                                {formErrors[index].city}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Add this at the bottom of the address block */}
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      checked={true}
                      className="mr-2 accent-blue-500"
                    />
                    <label className="text-black dark:text-white">
                      isPrimary
                    </label>
                  </div>
                </div>
              ))}
          </div>

            <div className="mt-9">
              <CustomButton
                onClick={() => {
                  handleAddressSubmit();
                  handleLabSubmit();
                }}
              >
                Login
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LabRegistration;
