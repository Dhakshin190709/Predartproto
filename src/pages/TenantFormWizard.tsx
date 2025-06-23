import React, { useState, useEffect, useRef, useMemo } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import CustomButton from '../components/CustomButton';
import { inputFieldClass } from '../components/FormStyles';
import api from '../api/request';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import 'react-toastify/dist/ReactToastify.css';

const ITEMS_PER_PAGE = 3;
interface State {
  id: number;
  stateName: string;
  stateCode: string;
}

interface District {
  id: number;
  pinCode: string;
  districtName: string;
  stateCode: string;
}

interface City {
  id: number;
  cityName: string;
}

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
interface PricePlan {
  pricePlanID: string;
  planName: string;
  planCode: string;
  planDescription: string;
  setupPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
}

export default function TenantFormWizard() {
  const [errors, setErrors] = useState({});
  const [addressTypes, setAddressTypes] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const location = useLocation();
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [cities, setCities] = useState<City[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [showCityInput, setShowCityInput] = useState(false);
  const [planFeatures, setPlanFeatures] = useState<
    Record<string, FeatureLimit[]>
  >({});
  const [planFeaturesMap, setPlanFeaturesMap] = useState({});
  const [showPlanModal, setShowPlanModal] = useState(false);
  const navigate = useNavigate();

  const [toastShown, setToastShown] = useState<
    'error' | 'duplicate' | 'success' | null
  >(null);
  const [formErrors, setFormErrors] = useState<
    Record<number, Record<string, string>>
  >({});
  //const [currentStep, setCurrentStep] = useState(1); // Track the active step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [steps, setSteps] = useState<{ label: string }[]>([]);
  const [formData, setFormData] = useState({
    tenantID: '', // required for update
    tenantName: '',
    tenantCode: '', // add this field
    gst: '',
    email: '',
    phoneNumber: '',
    landline: '',
    status: '', // 'active' or 'inactive'
  });

  const basicFields = [
    'tenantName',
    'tenantCode',
    'gst',
    'email',
    'phoneNumber',
  ];
  const isStepComplete = (fields: string[], data: any) => {
    return fields.every((field) => {
      const value = data[field];
      return value !== undefined && value !== null && value !== '';
    });
  };
  const [activeStep, setActiveStep] = useState(0);

  const isAddressStepComplete = (addresses: any[]) => {
    return (
      addresses.length > 0 &&
      addresses.every(
        (addr) => addr.address1 && addr.city && addr.state && addr.zipCode,
      )
    );
  };

  const [formReady, setFormReady] = useState(false);

  const jumpToStep = sessionStorage.getItem('jumpToStep');

  const wizardRef = useRef<any>(null);

  useEffect(() => {
    let jumpStep = parseInt(sessionStorage.getItem('jumpToStep') || '-1');
    if (jumpStep <= 0) return;

    const targetStep = jumpStep - 1; // jump to previous step

    sessionStorage.removeItem('jumpToStep'); // ✅ remove early to avoid double jumps

    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(() => {
      attempts++;
      console.log(
        `⌛ Waiting for wizardRef... attempt ${attempts}`,
        wizardRef.current,
      );

      if (
        wizardRef.current &&
        typeof wizardRef.current.goToTab === 'function'
      ) {
        console.log('✅ wizardRef ready, navigating to step:', targetStep);
        wizardRef.current.goToTab(targetStep);
        clearInterval(interval);
      }

      if (attempts >= maxAttempts) {
        console.warn('❌ wizardRef timeout after max attempts');
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval); // cleanup
  }, []);

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

  const addAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        addressType: '',
        address1: '',
        address2: '',
        state: '',
        district: '',
        zipCode: '',
        city: '',
        isPrimary: prev.length === 0, // first one as primary
      },
    ]);
  };

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

  useEffect(() => {
    api
      .get('/Address/states')
      .then((res) => {
        setStates(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to fetch states:', err);
      });
  }, []);

  // On state change
  const handleStateChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedDistrict('');
    setCities([]);
    setShowCityInput(false);

    updateAddress(index, 'state', stateCode);
    updateAddress(index, 'district', '');
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    api
      .get(`/Address/districts?StateCode=${stateCode}`)
      .then((res) => {
        console.log('Districts:', res.data.data);
        setDistricts(res.data.data);
        const uniquePincodes = Array.from(
          new Set(res.data.data.map((d) => d.pinCode)),
        );
        setPincodes(uniquePincodes);
      })
      .catch((err) => {
        console.error('Failed to fetch districts:', err);
      });
  };

  // On district change
  const handleDistrictChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    setShowCityInput(false);

    updateAddress(index, 'district', districtName);
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    const filteredPins = districts
      .filter((d) => d.districtName === districtName)
      .map((d) => d.pinCode);
    setPincodes(filteredPins);

    api
      .get(`/Address/cities?districtName=${encodeURIComponent(districtName)}`)
      .then((res) => {
        const cityData = res.data.data;
        if (cityData.length === 0) {
          setShowCityInput(true);
          setCities([]);
        } else {
          setCities(cityData);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    const fetchAddressTypes = async () => {
      try {
        const response = await api.get('/AppLOV'); // ✅ Relative path
        const data = response.data;

        const filteredAddressTypes = data.data.filter(
          (item: any) => item.type === 'Address',
        );
        setAddressTypes(filteredAddressTypes);
      } catch (error) {
        console.error('Error fetching address types:', error);
      }
    };

    fetchAddressTypes();
  }, []);

  const validateAddress = (address: Address, index: number) => {
    const errors: { [key: string]: string } = {};
    const addressRegex = /^(?!\d+$).{3,}$/;

    // Validation checks
    if (!address.addressType) errors.addressType = 'Address type is required';
    if (!address.address1) {
      errors.address1 = 'Address line 1 is required';
    } else if (!addressRegex.test(address.address1)) {
      errors.address1 = 'Please enter a valid address with area or street name';
    }
    if (!address.address2) {
      errors.address2 = 'Address line 2 is required';
    } else if (!addressRegex.test(address.address2)) {
      errors.address2 = 'Please enter a valid address with area or street name';
    }
    const cityRegex = /^[A-Za-z\s.]+$/;
    if (!address.city) {
      errors.city = 'City is required';
    } else if (!cityRegex.test(address.city)) {
      errors.city = 'City name must contain only letters, spaces, and dots';
    }

    // else if (address.city.length < 5) {
    //   errors.city = 'City must be at least 5 characters';
    // }
    if (!address.district) errors.district = 'District is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zipCode) errors.zipCode = 'Zip code is required';

    // Show error messages below fields
    setFormErrors((prev) => ({ ...prev, [index]: errors }));

    // If any errors exist, show toast once
    // if (Object.keys(errors).length > 0) {
    //   toast.error('Please fill all the Address fields');
    //   return false;
    // }

    return true;
  };
  const handleSelectAddress = (index: number) => {
    const newTouched = { ...touchedFields };
    Object.keys(addresses[index]).forEach((field) => {
      newTouched[`${index}-${field}`] = true;
    });
    setTouchedFields(newTouched);
    validateAddress(addresses[index], index);
  };

  const isAddressFetched = useRef(false);

  useEffect(() => {
    fetchPatientAddress();
  }, []); // run only once on component mount

  const handlePrimaryChange = (selectedIndex: number) => {
    const updatedAddresses = addresses.map((addr, idx) => ({
      ...addr,
      isPrimary: idx === selectedIndex, // only selected one gets true
    }));
    setAddresses(updatedAddresses);
  };

  // const [toastShown, setToastShown] = useState(false); // ← Add this at component level

  const [lastSavedAddresses, setLastSavedAddresses] = useState<any[]>([]);

  const handleAddressSubmit = async () => {
    const allErrors: { [idx: number]: { [field: string]: string } } = {};
    const userID = sessionStorage.getItem('userID');
    const tenantID = sessionStorage.getItem('tenantID');

    let hasError = false;
    let hasDuplicate = false;
    const validAddresses: any[] = [];

    const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
    const noOnlySpaces = /\S/;
    const notRepeated = /^(?!([a-zA-Z0-9])\1{5,})/;
    const onlyAlphaNumSlash = /^[a-zA-Z0-9,\s/]+$/;

    const validateField = (
      value: string,
      key: string,
      pattern: RegExp,
      min = 1,
      msg = 'Invalid format.',
      errors: Record<string, string>,
    ) => {
      if (!value || !noOnlySpaces.test(value))
        errors[key] = 'Address Type is required.';
      else if (!noEmojis.test(value)) errors[key] = 'No emojis allowed.';
      else if (!notRepeated.test(value))
        errors[key] = 'No repetitive characters.';
      else if (value.length < min || !pattern.test(value)) errors[key] = msg;
    };

    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    const validateAddressLine = (
      value: string,
      key: string,
      errors: Record<string, string>,
    ) => {
      if (!value || !noOnlySpaces.test(value)) {
        errors[key] = `${capitalize(key)} is required.`;
      } else if (!noEmojis.test(value)) {
        errors[key] = 'No emojis allowed.';
      } else if (!notRepeated.test(value)) {
        errors[key] = 'No repetitive characters.';
      } else if (!onlyAlphaNumSlash.test(value)) {
        errors[key] =
          'Only letters, numbers, spaces, and / allowed. No special characters.';
      } else if (value.length < 3) {
        errors[key] = 'Minimum 3 characters required.';
      } else if (!/[A-Za-z]/.test(value)) {
        errors[key] = 'Must contain at least one letter.';
      } else if (!/\d/.test(value)) {
        errors[key] = 'Must contain at least one number.';
      } else if (/^\d+$/.test(value)) {
        errors[key] =
          `${capitalize(key)} cannot be numbers only. Include area or street name.`;
      }
    };

    const validateCity = (value: string, errors: Record<string, string>) => {
      const onlyLettersAndSpace = /^[A-Za-z\s.]+$/;
      if (!value || !/\S/.test(value)) {
        errors.city = 'City is required.';
      } else if (!onlyLettersAndSpace.test(value)) {
        errors.city = 'City name must contain only letters, spaces and dots';
      } else if (value.length < 5) {
        errors.city = 'City must be at least 5 characters long.';
      }
    };

    const isDuplicateAddress = (addr: any, list: any[]) => {
      return list.some(
        (existing) =>
          existing.address1.trim().toLowerCase() ===
            addr.address1.trim().toLowerCase() &&
          existing.address2.trim().toLowerCase() ===
            addr.address2.trim().toLowerCase() &&
          existing.city.trim().toLowerCase() ===
            addr.city.trim().toLowerCase() &&
          existing.state.trim().toLowerCase() ===
            addr.state.trim().toLowerCase() &&
          existing.zipCode.trim() === addr.zipCode.trim(),
      );
    };

    let isAnyFieldFilled = false;

    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      const errors: Record<string, string> = {};

      if (
        addr.addressType ||
        addr.address1 ||
        addr.address2 ||
        addr.city ||
        addr.district ||
        addr.state ||
        addr.zipCode
      ) {
        isAnyFieldFilled = true;
      }

      validateField(
        addr.addressType,
        'addressType',
        /^[a-zA-Z0-9\s]+$/u,
        1,
        'Only letters, numbers, and spaces are allowed.',
        errors,
      );
      validateAddressLine(addr.address1, 'address1', errors);
      validateAddressLine(addr.address2, 'address2', errors);
      validateCity(addr.city, errors);

      if (!addr.city) errors.city = 'City is required.';
      if (!addr.district) errors.district = 'District is required.';
      if (!addr.state) errors.state = 'State is required.';
      if (!addr.zipCode) errors.zipCode = 'ZipCode is required.';

      if (Object.keys(errors).length === 0) {
        const duplicateInCurrentForm = addresses.some(
          (otherAddr, j) =>
            j !== i &&
            otherAddr.address1?.trim().toLowerCase() ===
              addr.address1?.trim().toLowerCase() &&
            otherAddr.address2?.trim().toLowerCase() ===
              addr.address2?.trim().toLowerCase() &&
            otherAddr.city?.trim().toLowerCase() ===
              addr.city?.trim().toLowerCase() &&
            otherAddr.state?.trim().toLowerCase() ===
              addr.state?.trim().toLowerCase() &&
            otherAddr.zipCode?.trim() === addr.zipCode?.trim(),
        );

        if (
          isDuplicateAddress(addr, validAddresses) ||
          duplicateInCurrentForm
        ) {
          errors.duplicate = 'Duplicate address found.';
          hasDuplicate = true;
          hasError = true;
          allErrors[i] = errors;
          continue;
        }
      }

      if (Object.keys(errors).length) {
        allErrors[i] = errors;
        hasError = true;
        continue;
      }

      validAddresses.push({
        addressID: addr.addressID || undefined,
        createdBy: userID,
        updatedBy: userID,
        isActive: true,
        id: tenantID,
        type: 'Tenant',
        addressType: addr.addressType || '',
        address1: addr.address1 || '',
        address2: addr.address2 || '',
        city: addr.city || '',
        district: addr.district || '',
        state: addr.state || '',
        zipCode: addr.zipCode || '',
        isPrimary: addr.isPrimary || false,
      });
    }

    setFormErrors(allErrors);

    if (!isAnyFieldFilled) return;

    if (hasError || validAddresses.length === 0) {
      if (toastShown !== 'duplicate' && hasDuplicate) {
        toast.error('Duplicate addresses are not allowed.');
        setToastShown('duplicate');
      } else if (toastShown !== 'error' && !hasDuplicate) {
        toast.error('Please fix validation errors in the address form.');
        setToastShown('error');
      }
      return;
    }

    const filteredAddresses = addresses.filter(
      (_, index) => !allErrors[index]?.duplicate,
    );
    setAddresses(filteredAddresses);

    const isSameAsLastSaved =
      JSON.stringify(validAddresses) === JSON.stringify(lastSavedAddresses);
    if (validAddresses.length > 0 && isSameAsLastSaved) return;

    try {
      const toUpdate = validAddresses.filter((a) => a.addressID);
      const toCreate = validAddresses.filter((a) => !a.addressID);

      if (toUpdate.length > 0) {
        await api.put('/Address', toUpdate); // ✅ PUT as array
      }

      if (toCreate.length > 0) {
        await Promise.all(toCreate.map((addr) => api.post('/Address', addr)));
      }

      toast.dismiss();
      toast.success('All addresses saved successfully!');
      setIsAddressSaved(true);
      setToastShown('success');
      setLastSavedAddresses(JSON.parse(JSON.stringify(validAddresses)));
    } catch (err) {
      console.error('API error:', err);
      if (toastShown !== 'error') {
        toast.error('Something went wrong while saving addresses.');
        setToastShown('error');
      }
    }
  };

  const emptyAddressTemplate = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  };

  const handleAddressChange = (index: number, key: string, value: string) => {
    const updated = [...addresses];
    updated[index][key] = value;
    setAddresses(updated);
    setToastShown(false); // ✅ Allow toast again
  };

  const handleAddAddress = () => {
    setAddresses([...addresses, emptyAddressTemplate]); // however you're adding
    setToastShown(''); // <-- reset toast state so new toasts can be shown
  };

  const handleCityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const inputValue = e.target.value;

    // Allow only letters and space
    const filteredValue = inputValue.replace(/[^A-Za-z\s]/g, '');

    const updated = [...addresses];
    updated[index].city = filteredValue;
    setAddresses(updated);

    // Optionally validate immediately if field was touched
    if (touchedFields[`${index}-city`]) {
      validateAddress(updated[index], index);
    }
  };

  const fetchPatientAddress = async () => {
    const tenantID = sessionStorage.getItem('tenantID');
    if (!tenantID || isAddressFetched.current) return;

    try {
      const response = await api.get(
        `/Address/getaddress?id=${tenantID}&Type=Tenant`,
      );

      const addressData = response.data?.data || [];

      if (!Array.isArray(addressData)) {
        console.warn('Invalid response format for address data');
        return;
      }

      if (addressData.length === 0) {
        setAddresses([
          {
            addressID: '',
            addressType: '',
            address1: '',
            address2: '',
            city: '',
            district: '',
            state: '',
            zipCode: '',
            type: '',
            isPrimary: false,
          },
        ]);
        return;
      }

      // ✅ Remove duplicates
      const seen = new Set();
      const filteredUnique = addressData.filter((addr: any) => {
        const key = `${addr.address1?.trim().toLowerCase()}|${addr.address2?.trim().toLowerCase()}|${addr.city?.trim().toLowerCase()}|${addr.state?.trim().toLowerCase()}|${addr.zipCode?.trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // ✅ Format for form
      const formatted = filteredUnique.map((addr: any) => ({
        addressID: addr.addressID || '',
        addressType: addr.addressType || '',
        address1: addr.address1 || '',
        address2: addr.address2 || '',
        city: addr.city || '',
        district: addr.district || '',
        state: addr.state || '',
        zipCode: addr.zipCode || '',
        type: addr.type || '',
        isPrimary: addr.isPrimary || false,
      }));

      setAddresses(formatted);
      setLastSavedAddresses(JSON.parse(JSON.stringify(formatted)));
      isAddressFetched.current = true;

      // ✅ Load dropdowns
      const address = formatted[0];
      if (address.state) {
        const districtRes = await api.get(
          `/Address/districts?StateCode=${address.state}`,
        );
        const districtData = districtRes.data?.data || [];
        setDistricts(districtData);

        const pincodes = [...new Set(districtData.map((d: any) => d.pinCode))];
        setPincodes(pincodes);
      }

      if (address.district) {
        const cityRes = await api.get(
          `/Address/cities?districtName=${encodeURIComponent(address.district)}`,
        );
        const cityData = cityRes.data?.data || [];
        setCities(cityData);
        setShowCityInput(cityData.length === 0);
      }

      // ✅ Step Skip Logic
      const isAddressStepComplete = (addresses: any[]) => {
        return (
          addresses.length > 0 &&
          addresses.every((a) => a.address1 && a.city && a.state && a.zipCode)
        );
      };

      if (isAddressStepComplete(formatted)) {
        console.log('✅ Skipping Address Step');
        setTimeout(() => {
          wizardRef.current?.nextTab(2); // 0 = Basic, 1 = Address, 2 = Plan
        }, 100);
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    }
  };

  const validateForm = (data) => {
    const errors = {};

    const tenantNameRegex = /^[A-Za-z0-9 ]+$/;
    const gstRegex = /^[0-9A-Z]{15}$/;
    const emojiRegex =
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g;
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|org|in|co|net|edu|gov)$/i;
    const phoneRegex = /^(?!.*(\d)\1{4,})[6-9]\d{9}$/;
    const specialCharRegex = /[^0-9+\s-]/;
    const landlineRegex = /^(?:\+91\s\d{2,4}\s\d{6,8}|0\d{2,4}-\d{6,8})$/;
    const validTenantNameRegex = /^[A-Z][a-zA-Z0-9]+( [A-Z][a-zA-Z0-9]+)*$/;

    if (!data.tenantName) {
      errors.tenantName = 'Tenant Name is required.';
    } else if (!tenantNameRegex.test(data.tenantName)) {
      errors.tenantName = 'Special characters and emojis are not allowed.';
    } else if (!validTenantNameRegex.test(data.tenantName)) {
      errors.tenantName = 'Enter a valid Tenant Name.';
    }

    if (!data.gst) {
      errors.gst = 'GST Number is required.';
    } else if (!gstRegex.test(data.gst)) {
      errors.gst =
        'GST must be 15 alphanumeric characters (e.g., 29ABCDE1234F2Z5).';
    }

    if (!data.email) {
      errors.email = 'Email is required.';
    } else if (emojiRegex.test(data.email)) {
      errors.email = 'Special characters and emojis are not allowed.';
    } else if (!emailPattern.test(data.email)) {
      errors.email = 'Invalid email format.';
    }

    if (!data.phoneNumber) {
      errors.phoneNumber = 'Phone number is required.';
    } else if (!phoneRegex.test(data.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number.';
    }

    if (!data.status) {
      errors.status = 'Select Status is required.';
    }

    if (!data.landline) {
      errors.landline = 'Landline is required.';
    } else if (!landlineRegex.test(data.landline)) {
      errors.landline =
        'Enter a valid landline (e.g., 044-1234567 or +91 22 12345688).';
    } else if (emojiRegex.test(data.landline)) {
      errors.landline = 'Special characters and emojis are not allowed.';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const tenantID = sessionStorage.getItem('tenantID');
    if (!tenantID) return;

    const fetchTenant = async () => {
      try {
        const response = await api.get(`/Tenant/${tenantID}`);
        if (response.data?.success && response.data?.data) {
          const tenant = response.data.data;

          const updatedFormData = {
            tenantID: tenant.tenantID || '',
            tenantCode: tenant.tenantCode || '',
            tenantName: tenant.tenantName || '',
            gst: tenant.gstNumber || '',
            email: tenant.email || '',
            phoneNumber: tenant.mobile || '',
            landline: tenant.landline || '',
            status: tenant.isActive ? 'active' : 'inactive',
          };

          setFormData(updatedFormData);

          // Check if step 1 is complete
          const isBasicStepComplete = [
            'tenantName',
            'tenantCode',
            'gst',
            'email',
            'phoneNumber',
          ].every((field) => updatedFormData[field]?.toString().trim() !== '');

          if (isBasicStepComplete) {
            console.log('✅ Skipping to Step 2');
            setTimeout(() => {
              wizardRef.current?.nextTab(1); // 🔥 jump to step 2 (index 1)
            }, 100); // give time for mount
          }

          setFormReady(true);
        }
      } catch (err) {
        console.error('Failed to fetch tenant data:', err);
      }
    };

    fetchTenant();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log('Form is valid. Submitting...', formData);

      const userID = sessionStorage.getItem('userID'); // Assuming you store user ID
      const tenantID = formData.tenantID; // Ensure this is present in formData

      const payload = {
        tenantID: tenantID, // Must be set from selected tenant
        tenantName: formData.tenantName,
        tenantCode: formData.tenantCode || '', // Add this to your form if needed
        gstNumber: formData.gst,
        email: formData.email,
        mobile: formData.phoneNumber,
        landline: formData.landline,
        isActive: formData.status === 'active',
        createdBy: userID,
        createdOn: new Date().toISOString(),
        updatedBy: userID,
        updatedOn: new Date().toISOString(),
      };

      try {
        const response = await api.put('/Tenant', payload);
        const result = response.data;

        if (response.status === 200 && result.success) {
          toast.success('Basic Details updated successfully!');
        } else {
          toast.error('Failed to update tenant.');
        }
      } catch (error) {
        console.error('PUT Error:', error);
        toast.error('An error occurred while updating tenant.');
      }
    }
  };

  const handleComplete = () => {
    console.log('Form completed!');
    // Handle form completion logic here
  };

  const finishButtonTemplate = (handleComplete: () => void) => (
    <button className="finish-button" onClick={handleComplete}>
      Finish
    </button>
  );

  <div className="step-navigation">
    {steps.map((step, index) => (
      <div
        key={index}
        className={`tab ${completedSteps.includes(index + 1) ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
        onClick={() => setCurrentStep(index + 1)} // Optional: allows clicking tabs to navigate
      >
        {step.label}
      </div>
    ))}
  </div>;
  const nextButtonTemplate = (handleNext: () => void) => (
    <div>
      <button type="button" className="base-button" onClick={handleNext}>
        Next
      </button>
    </div>
  );

  const backTemplate = (handlePrev: () => void) => (
    <button type="button" className="base-button" onClick={handlePrev}>
      Back
    </button>
  );

  //Step 3:Choose plan

  const [plans, setPlans] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPlanID, setSelectedPlanID] = useState('');
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);

  const [selectedDurations, setSelectedDurations] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/PricePlan/PlanDetails'); // ✅ updated endpoint
        if (res.data?.success && Array.isArray(res.data.data)) {
          setPlans(res.data.data); // ✅ now sets detailed plans
        } else {
          toast.error('Failed to fetch plan details.');
        }
      } catch (err) {
        console.error('API Error:', err);
        toast.error('Error fetching plan details.');
      }
    };

    fetchPlans();
  }, []);

  const visiblePlans = plans.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );
  const memoizedPlans = useMemo(() => plans, [plans]);

  const handleChoosePlan = (plan: any) => {
    console.log('Plan chosen:', plan);
    setSelectedPlanID(plan.pricePlanID);
    setSelectedPlanDetails(plan);
    setShowPlanModal(true); // show modal instead of going to next step
  };

  const hasFetched = useRef(false);

  const handleDurationChange = (planID: string, value: string) => {
    setSelectedDurations((prev) => ({ ...prev, [planID]: value }));
  };

  const getPrice = (plan: any, key: string) => {
    return plan[key] || 0;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [documentURL, setDocumentURL] = useState('');
  const [isImage, setIsImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [doctorID, setDoctorID] = useState([]);
  const [documentTypes, setDocumentTypes] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadBoxes, setUploadBoxes] = useState([{ id: Date.now() }]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const [selectedPatientName, setSelectedPatientName] = useState('');

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [roleName, setRoleName] = useState<string | null>(null);

  useEffect(() => {
    const storedRoleName = sessionStorage.getItem('roleName');
    setRoleName(storedRoleName);
  }, []);

  const sessionPatientId = sessionStorage.getItem('patientID');
  console.log('Session Patient ID:', sessionPatientId);

  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  const fetchDocumentTypes = async () => {
    try {
      const response = await api.get('/AppLOV?type=documentType');

      if (response.data && Array.isArray(response.data.data)) {
        const activeDocumentTypes = response.data.data.filter(
          (item) => item.isActive === true, // or item.status === 'Active'
        );
        setDocumentTypes(activeDocumentTypes);
      } else {
        console.error('Invalid data format:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch document types:', error);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  const fetchUploadedDocuments = async () => {
    try {
      console.log('Fetching documents for patientId:', sessionPatientId);
      const response = await api.get(`/Doctor/GetDocuments`, {
        params: { patientId: sessionPatientId },
      });
      console.log('API response:', response.data);
      setUploadedDocuments(response.data);

      console.log('Uploaded documents:', response.data.data);
    } catch (error) {
      console.error('Failed to fetch uploaded documents:', error);
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      const tenantID = sessionStorage.getItem('tenantID');
      const sessionPatientId = sessionStorage.getItem('patientID');
      const storedRoleName = sessionStorage.getItem('roleName');

      setRoleName(storedRoleName ?? '');

      console.log('Session Patient ID:', sessionPatientId);
      console.log('Role Name:', storedRoleName);

      if (!tenantID || !storedRoleName) {
        console.warn('Missing tenantID or roleName in session.');
        return;
      }

      try {
        if (storedRoleName.toLowerCase() === 'patient' && sessionPatientId) {
          // 👉 Case: role is patient AND patient ID exists
          const response = await api.get(`/Patient/${sessionPatientId}`);
          const data = response.data;

          if (data.success && data.data) {
            setSelectedPatient(data.data.patientID);
            setSelectedPatientName(data.data.patientName);
            setPatients([data.data]);
          } else {
            console.warn('No data returned for single patient.');
          }
        } else {
          // 👉 Case: role is TenantAdmin OR patientID is missing → fetch all
          const response = await api.get('/Patient', {
            params: { tenantID },
          });

          const data = response.data;

          if (data.success && Array.isArray(data.data)) {
            setPatients(data.data);

            // Try to auto-select patient if ID was present earlier
            if (sessionPatientId) {
              const matchedPatient = data.data.find(
                (p) => String(p.patientID) === String(sessionPatientId),
              );

              if (matchedPatient) {
                setSelectedPatient(matchedPatient.patientID);
                setSelectedPatientName(matchedPatient.patientName);
              } else {
                console.warn('Session patient ID not found in list.');
              }
            }
          } else {
            console.warn('No patient list returned.');
          }
        }
      } catch (err) {
        console.error('Error fetching patient(s):', err);
      }
    };

    fetchPatients();
  }, []);

  const isPatientRole = roleName?.toLowerCase() === 'patient';

  const handlePatientChange = (e) => {
    setSelectedPatient(e.target.value);
    const selected = patients.find(
      (p) => String(p.patientID) === e.target.value,
    );
    setSelectedPatientName(selected ? selected.patientName : '');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewSrc(reader.result as string);
      };
    }
  };
  const handleDocumentTypeChange = (event) => {
    setSelectedDocumentType(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      toast.error('Please select all fields..');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onload = async () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (!base64String) {
        toast.error('Failed to convert file to Base64.');
        return;
      }

      const roleName = sessionStorage.getItem('roleName');
      let id = '';

      if (roleName === 'Patient') {
        const sessionPatientId = sessionStorage.getItem('patientID');
        if (!sessionPatientId) {
          toast.error('Patient ID not found in session for Patient role.');
          return;
        }
        id = sessionPatientId;
      } else if (roleName === 'Reception' || roleName === 'TenantAdmin') {
        if (!selectedPatient) {
          toast.error('Please select a patient from the dropdown.');
          return;
        }
        id = selectedPatient;
      } else {
        toast.error('Unsupported role.');
        return;
      }

      const userID = sessionStorage.getItem('userID');
      if (!userID) {
        toast.error('User not logged in. Please log in again.');
        return;
      }

      const fileExtension = selectedFile.name.split('.').pop();
      const filePath = `uploads/${selectedFile.name}`;

      const payload = {
        createdBy: userID,
        isActive: true,
        id: id,
        type: 'patient',
        documentType: selectedType,
        fileName: selectedFile.name,
        fileLocation: filePath,
        fileBase64: base64String,
        fileExtension: fileExtension,
      };

      try {
        const response = await api.post('/Doctor/SaveDocuments', payload);

        if (response.status === 200 || response.status === 201) {
          toast.success('Document uploaded successfully!');
          setSelectedFile(null);
          setPreviewSrc(null);
          setSelectedType('');
          // 🔁 Re-fetch uploaded documents
          fetchUploadedDocuments();
        } else {
          toast.error('Upload failed. Please try again.');
        }
      } catch (error: any) {
        toast.error(
          'Upload failed: ' + (error.response?.data?.message || error.message),
        );
      }
    };
  };

  // View Document in Modal
  const handleViewDocument = async (documentID: string, fileName: string) => {
    try {
      const response = await api.get(`/Doctor/Documents/${documentID}`);

      const fileBase64 = response.data?.data?.fileBase64;
      if (!fileBase64) {
        alert('Invalid file data received.');
        return;
      }

      // Determine if the file is an image by extension
      const isImageFile = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
      setIsImage(isImageFile);

      // Decode base64 to binary data
      const byteCharacters = atob(fileBase64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Determine MIME type based on file extension
      let fileType = 'application/pdf';
      if (isImageFile) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        fileType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      }

      const blob = new Blob([byteArray], { type: fileType });
      const url = URL.createObjectURL(blob);

      setDocumentURL(url);
      setModalOpen(true);
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error loading document.');
    }
  };

  // Extract Only Filename (Ignore ID)
  const getFormattedFileName = (fileName) => {
    return fileName.split('_').pop();
  };

  return (
    <>
      {formReady && (
        <FormWizard
          ref={(el) => {
            wizardRef.current = el;
            console.log('📦 wizardRef assigned:', el); // <- Debug: you should see this!
          }}
          stepSize="sm"
          shape="circle"
          color="#2196f3"
          onComplete={() => toast.success('Completed!')}
          backButtonTemplate={backTemplate}
          nextButtonTemplate={nextButtonTemplate}
          finishButtonTemplate={(onComplete) => (
            <button
              className="finish-button"
              onClick={() => {
                console.log('Form completed!');
                toast.success('Doctor profile completed successfully');
                onComplete();
              }}
            >
              Finish
            </button>
          )}
        >
          {/* Step:1 Basic details */}

          <FormWizard.TabContent
            title="Basic Details"
            icon={
              <div
                className="flex justify-center items-center h-10 w-10 text-white rounded-full
              cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
              >
                <i className="ti-user"></i>
              </div>
            }
          >
            <div className="w-full max-w-screen-2xl mx-auto p-4">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-3 gap-4 p-4 rounded-lg"
              >
                {/* Column 1: Tenant Name + GST */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleChange}
                    placeholder="Tenant Name"
                    className={inputFieldClass}
                  />
                  {errors.tenantName && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.tenantName}
                    </span>
                  )}

                  <div className="flex gap-4 mt-4">
                    <input
                      type="text"
                      name="gst"
                      value={formData.gst}
                      onChange={handleChange}
                      placeholder="GST Number"
                      className={inputFieldClass}
                    />
                  </div>
                  {errors.gst && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.gst}
                    </span>
                  )}
                </div>

                {/* Column 2: Email and Phone + Status */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    maxLength={50}
                    onChange={handleChange}
                    placeholder="Email"
                    className={inputFieldClass}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.email}
                    </span>
                  )}

                  <div className="flex gap-4 mt-4">
                    <div className="flex flex-col w-1/2">
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        maxLength={10}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className={inputFieldClass}
                      />
                      {errors.phoneNumber && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.phoneNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col w-1/2">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">InActive</option>
                      </select>
                      {errors.status && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 3: Landline + Submit */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="landline"
                    value={formData.landline}
                    maxLength={20}
                    onChange={handleChange}
                    placeholder="Landline"
                    className={inputFieldClass}
                  />
                  {errors.landline && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.landline}
                    </span>
                  )}

                  <div className="flex justify-end mt-10">
                    <CustomButton
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded"
                    >
                      Submit
                    </CustomButton>
                    <ToastContainer
                      position="top-right"
                      autoClose={1000} // Automatically close the toast after 5 seconds
                      hideProgressBar={false} // Show the progress bar
                      newestOnTop={true} // Show newest toasts on top
                      closeOnClick
                      rtl={false}
                    />
                  </div>
                </div>
              </form>
            </div>
          </FormWizard.TabContent>

          {/* Step:2 Address */}

          <FormWizard.TabContent
            title="Address"
            icon={
              <div
                className="flex justify-center items-center h-10 w-10 text-white rounded-full
              cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
              >
                <i className="ti-location-pin"></i>
              </div>
            }
          >
            <div>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  // handleSubmit will only handle the current form state
                  handleAddressSubmit();
                }}
              >
                <h2 className="text-lg font-bold text-black-700 text-left mt-8">
                  Address
                </h2>
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
                              updateAddress(
                                index,
                                'addressType',
                                e.target.value,
                              )
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
                            onChange={(e) => {
                              const sanitizedValue = e.target.value.replace(
                                /[^a-zA-Z0-9, /]/g,
                                '',
                              );
                              updateAddress(index, 'address1', sanitizedValue);
                            }}
                            placeholder="Enter address line 1"
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
                            onChange={(e) => {
                              const sanitizedValue = e.target.value.replace(
                                /[^a-zA-Z0-9, /]/g,
                                '',
                              );
                              updateAddress(index, 'address2', sanitizedValue);
                            }}
                            placeholder="Enter address line 2"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>

                        {/* Section 2: Pincode & City */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                          <div>
                            {showCityInput ? (
                              <>
                                <input
                                  type="text"
                                  value={address.city || ''}
                                  onChange={(e) => {
                                    handleCityChange(e, index);
                                    setManualCity(e.target.value);
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
                                  onChange={(e) =>
                                    updateAddress(index, 'city', e.target.value)
                                  }
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
                      <div className="flex justify-end items-center mt-4">
                        <label className="flex items-center gap-2 text-sm text-black dark:text-white">
                          <input
                            type="checkbox"
                            checked={address.isPrimary}
                            onChange={() => handlePrimaryChange(index)}
                          />
                          Set as Primary
                        </label>
                      </div>
                    </div>
                  ))}

                {/* Add New Address */}
                {/* <div className="flex items-center justify-end gap-1">
                <div
                  className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                  onClick={handleAddAddress}
                >
                  +
                </div>
                <span className="text-sm font-medium text-black-600">Add</span>
              </div> */}

                <div className="flex justify-end">
                  <CustomButton
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                  >
                    Save Address
                  </CustomButton>
                </div>
              </form>
            </div>
          </FormWizard.TabContent>

          {/* Step:3 Choose plan */}

          <FormWizard.TabContent
            title="Choose Plan"
            icon={
              <div
                className="flex justify-center items-center h-10 w-10 text-white rounded-full
              cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
              >
                <i className="ti-package"></i>{' '}
                {/* Or try ti-layers, ti-briefcase, etc. */}
              </div>
            }
          >
            <div className="p-6 w-full relative">
              {/* Navigation Arrows */}
              <div className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 z-10">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={currentPage === 0}
                  className="w-10 h-10 flex items-center justify-center bg-white border shadow rounded-full text-xl hover:bg-gray-100 disabled:opacity-40"
                >
                  ‹
                </button>
              </div>

              <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 z-10">
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      (prev + 1) * ITEMS_PER_PAGE < plans.length
                        ? prev + 1
                        : prev,
                    )
                  }
                  disabled={(currentPage + 1) * ITEMS_PER_PAGE >= plans.length}
                  className="w-10 h-10 flex items-center justify-center bg-white border shadow rounded-full text-xl hover:bg-gray-100 disabled:opacity-40"
                >
                  ›
                </button>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePlans.map((plan) => {
                  const selectedType =
                    selectedDurations[plan.pricePlanID] || 'monthlyPrice';
                  const selectedPrice = getPrice(plan, selectedType);
                  const features = planFeaturesMap[plan.pricePlanID] || {};

                  return (
                    <div
                      key={plan.pricePlanID}
                      className={`bg-white border transition rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg ${
                        selectedPlanID === plan.pricePlanID
                          ? 'border-blue-600 shadow-xl'
                          : 'border-blue-100'
                      }`}
                    >
                      <div>
                        {/* Title */}
                        {/* Title + Dropdown on the same line */}
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-3xl font-bold text-blue-800">
                            {plan.planName}
                          </h2>

                          <select
                            className="border border-gray-300 rounded-lg py-1 px-2 text-sm"
                            value={selectedType}
                            onChange={(e) =>
                              handleDurationChange(
                                plan.pricePlanID,
                                e.target.value,
                              )
                            }
                          >
                            <option value="monthlyPrice">Monthly</option>
                            <option value="quarterlyPrice">Quarterly</option>
                            <option value="halfyearlyPrice">Half-Yearly</option>
                            <option value="yearlyPrice">Yearly</option>
                          </select>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-3">
                          {plan.planDescription?.slice(0, 140)}...
                        </p>

                        {/* Tick Info */}
                        <div className="text-md text-gray-700 space-y-1">
                          {/* Selected Price */}
                          <p className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" />
                            Subscription Price: ₹{selectedPrice}
                          </p>
                          <p className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" />
                            Setup Price: ₹{plan.setupPrice}
                          </p>
                        </div>
                        {/* Features */}
                        <div className="text-md text-gray-700 mt-2 space-y-1">
                          <h4 className="font-semibold text-blue-700 mb-2 text-left">
                            Features Included
                          </h4>

                          {plan.limits?.length > 0 && (
                            <ul className="list-disc list-outside pl-6 space-y-1 text-left">
                              {plan.limits.map((feat, index) => (
                                <li key={index}>
                                  {feat.featureName || 'N/A'} —{' '}
                                  {feat.limitValue}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Choose Plan Button */}
                      <button
                        type="button"
                        className="mt-6 py-2 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleChoosePlan(plan)}
                      >
                        Choose Plan
                      </button>
                    </div>
                  );
                })}
              </div>

              {showPlanModal && selectedPlanDetails && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                  <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md relative">
                    <button
                      onClick={() => setShowPlanModal(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
                    >
                      ×
                    </button>

                    <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">
                      Plan Summary
                    </h2>

                    <div className="grid gap-2 text-sm text-gray-800">
                      {[
                        {
                          label: 'Plan Name',
                          value: selectedPlanDetails.planName,
                        },
                        {
                          label: 'Subscription Price',
                          value:
                            '₹' +
                            getPrice(
                              selectedPlanDetails,
                              selectedDurations[
                                selectedPlanDetails.pricePlanID
                              ] || 'monthlyPrice',
                            ),
                        },
                        {
                          label: 'Setup Price',
                          value: '₹' + selectedPlanDetails.setupPrice,
                        },
                        (() => {
                          const subPrice = parseFloat(
                            getPrice(
                              selectedPlanDetails,
                              selectedDurations[
                                selectedPlanDetails.pricePlanID
                              ] || 'monthlyPrice',
                            ) || 0,
                          );
                          const setup = parseFloat(
                            selectedPlanDetails.setupPrice || 0,
                          );
                          const subtotal = subPrice + setup;
                          const sgst = +(subtotal * 0.09).toFixed(2);
                          const cgst = +(subtotal * 0.09).toFixed(2);
                          const total = +(subtotal + sgst + cgst).toFixed(2);

                          return [
                            { label: 'SGST (9%)', value: `₹${sgst}` },
                            { label: 'CGST (9%)', value: `₹${cgst}` },
                            {
                              label: 'Total Amount',
                              value: `₹${total.toLocaleString('en-IN')}`,
                              className: 'text-green-700 font-semibold text-lg',
                              labelClass: 'text-green-700 font-semibold',
                            },
                          ];
                        })(),
                      ]
                        .flat()
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex text-sm text-gray-800 items-center"
                          >
                            <div
                              className={`min-w-[160px] font-medium ${item.labelClass || ''}`}
                            >
                              {item.label}
                            </div>
                            <div className="px-1">:</div>
                            <div className={item.className || ''}>
                              {item.value}
                            </div>
                          </div>
                        ))}
                    </div>

                    <button
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-medium"
                      onClick={() => {
                        setShowPlanModal(false);

                        // Calculate total and navigate
                        const subPrice = parseFloat(
                          getPrice(
                            selectedPlanDetails,
                            selectedDurations[
                              selectedPlanDetails.pricePlanID
                            ] || 'monthlyPrice',
                          ) || 0,
                        );
                        const setup = parseFloat(
                          selectedPlanDetails.setupPrice || 0,
                        );
                        const subtotal = subPrice + setup;
                        const sgst = +(subtotal * 0.09).toFixed(2);
                        const cgst = +(subtotal * 0.09).toFixed(2);
                        const total = +(subtotal + sgst + cgst).toFixed(2);

                        // Navigate to RazorPay page with total
                        navigate('/RazorPay', {
                          state: {
                            totalAmount: total,
                            planName: selectedPlanDetails.planName,
                            subscriptionPrice: subPrice,
                            setupPrice: setup,
                            sgst,
                            cgst,
                          },
                        });
                      }}
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </FormWizard.TabContent>

          <FormWizard.TabContent
            title="Document Upload"
            icon={
              <div
                className="flex justify-center items-center h-10 w-10 text-white rounded-full
                cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
              >
                <i className="far fa-file"></i>
              </div>
            }
          >
            <div className="p-6 bg-white rounded-md shadow-md">
              <h2 className="text-xl font-bold mb-4 mt-4">Document Upload</h2>

              {/* File Upload Section */}
              <div className="flex items-center gap-2 flex-wrap">
                {isPatientRole ? (
                  <input
                    type="text"
                    readOnly
                    value={selectedPatientName}
                    className="w-[35] rounded-lg border border-stroke bg-gray-100 py-2 px-4 text-black outline-none cursor-not-allowed"
                  />
                ) : (
                  <select
                    id="patientDropdown"
                    value={selectedPatient || ''}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-[35] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.patientID} value={patient.patientID}>
                        {patient.patientName}
                      </option>
                    ))}
                  </select>
                )}

                {/* Document Type Dropdown */}
                <select
                  className="w-[35%] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black 
    outline-none focus:border-primary"
                  onChange={(e) => setSelectedType(e.target.value)}
                  value={selectedType}
                >
                  <option value="">Select Document Type</option>
                  {documentTypes.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </select>

                {/* File Input */}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-[30%]"
                />

                {/* Preview Icon */}
                {previewSrc && (
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="text-blue-500"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  className="w-[15%] bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] 
    text-white py-2 px-4 rounded-lg text-sm"
                >
                  Upload
                </button>
              </div>
              <ToastContainer position="top-right" autoClose={3000} />
              {/* Uploaded Documents Table */}

              <div className="mt-6">
                <h2 className="text-lg font-bold mb-2">Uploaded Documents</h2>
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2">File Name</th>
                      <th className="border px-4 py-2">Document Type</th>

                      <th className="border px-4 py-2">Date</th>
                      <th className="border px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedDocuments.length > 0 ? (
                      uploadedDocuments.map((doc, index) => (
                        <tr key={index} className="text-center">
                          <td className="border px-4 py-2">
                            {doc.documentType}
                          </td>
                          <td className="border px-4 py-2">
                            {getFormattedFileName(doc.fileName)}
                          </td>
                          <td className="border px-4 py-2">
                            {doc.createdOn
                              ? doc.createdOn.split('T')[0]
                              : 'N/A'}
                          </td>
                          <td className="border px-4 py-2 justify-center gap-2">
                            {/* View Button */}
                            <button
                              onClick={() =>
                                handleViewDocument(doc.documentID, doc.fileName)
                              }
                              className="bg-gradient-to-b from-[#008000] to-[#00FF00] hover:from-[#00FF00] hover:to-[#008000] 
                text-white px-3 py-1 rounded-lg"
                            >
                              View
                            </button>

                            {/* Delete Button */}
                            {/* <button
                onClick={() => handleDeleteDocument(doc.documentID)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button> */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="border px-4 py-2 text-center"
                        >
                          No documents uploaded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Preview Modal */}
              {isPreviewOpen && previewSrc && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg w-96 relative">
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                    <h2 className="text-lg font-bold mb-2">
                      {selectedType} Preview
                    </h2>
                    {selectedFile?.type.includes('pdf') ? (
                      <iframe
                        src={previewSrc}
                        width="100%"
                        height="300px"
                        title="PDF Preview"
                      ></iframe>
                    ) : (
                      <img
                        src={previewSrc}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Modal for Viewing Documents */}
              {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-4 rounded shadow-lg max-w-xl w-full relative flex flex-col items-center">
                    <button
                      className="absolute top-2 right-2 text-gray-500 text-xl"
                      onClick={() => setModalOpen(false)}
                    >
                      &times;
                    </button>
                    <h2 className="text-lg font-bold mb-2">View Document</h2>
                    <div className="flex justify-center items-center w-full max-h-[80vh]">
                      {isImage ? (
                        <img
                          src={documentURL}
                          alt="Uploaded document"
                          style={{ maxWidth: '100%', maxHeight: '80vh' }}
                        />
                      ) : (
                        <iframe
                          src={documentURL}
                          title="PDF Document"
                          width="100%"
                          height="600px"
                          style={{ border: 'none' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FormWizard.TabContent>
          <FormWizard.TabContent
            title="Consent"
            icon={
              <div
                className="flex justify-center items-center h-10 w-10 text-white rounded-full
                cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
              >
                <i className="ti-check-box"></i>
              </div>
            }
          >
            <div>
              <input
                type="text"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                onChange={(e) => {
                  const sanitizedValue = e.target.value.replace(
                    /[^a-zA-Z0-9, /]/g,
                    '',
                  );
                }}
                placeholder="Enter address line 1"
              />
            </div>
          </FormWizard.TabContent>
        </FormWizard>
      )}
      {/* add style */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");

         .main-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
         .validation-summary {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.validation-summary h4 {
  color: #856404;
  margin-bottom: 8px;
}
.tab {
  padding: 10px 20px;
  border: 1px solid #ccc;
  cursor: pointer;
}
.tab.active {
  background-color: #007bff;
  color: white;
}
.tab.completed {
  background-color: #28a745; /* ✅ Green for completed steps */
  color: white;
}

.validation-summary ul {
  padding-left: 20px;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}
.error-text {
  color: red;
  font-size: 0.9rem;
  margin-top: 4px;
}

.form-group {
  margin-bottom: 16px;
}


        .title {
          margin-top: 40px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
        }
           /* Responsive styles */
  @media (max-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .w-[500px] {
      width: 100%;
    }

    .text-lg {
      font-size: 1rem;
    }

    .space-y-4 > *:not(:last-child) {
      margin-bottom: 1rem;
    }

    .h-10 {
      height: 2.5rem;
    }
  }

   .base-button {
  background: linear-gradient(to bottom, #004A99, #007BFF);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  transition: background 0.15s ease-out;
  cursor: pointer;
}

.base-button:hover {
  background: linear-gradient(to bottom, #007BFF, #004A99);
  transition: background 0.15s ease-in;
}


.wizard .nav-tabs > li.completed > a {
  background-color: green !important;
  color: white !important;
}

  @media (min-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
    
      
        .wizard-card-footer{
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
        .base-button {
          background-color: blue;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
          }
          
          .base-button:hover {
          background-color: navy;
          }
          
          .base-button:focus {
          outline: none;
          }
          
          .base-button:active {
          transform: translateY(2px);
          }
          

        .finish-button{
          background-color: green;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
        }
        .finish-button:hover {
          background-color: darkgreen;
          }
        
        .finish-button:focus {
          outline: none;
         }
          
        .finish-button:active {
          transform: translateY(2px);
         }

      `}</style>
    </>
  );
}
