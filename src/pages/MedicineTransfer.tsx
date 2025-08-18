import React, { useEffect, useState } from 'react';
import api from '../api/request';
import CustomButton from '../components/CustomButton';

interface Pharmacy {
  pharmacyID: string;
  pharmacyName: string;
  tenantID: string;
}

interface Medicine {
  pharmacyMedicineID: string;
  medicineID: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  pricePerUnit: number;
}

interface Status {
  appLOVID: string;
  name: string;
}
const PharmacyTransfer: React.FC = () => {
  const [tenantID, setTenantID] = useState<string>('');
  const [pharmacyList, setPharmacyList] = useState<Pharmacy[]>([]);
  const [fromPharmacy, setFromPharmacy] = useState('');
  const [toPharmacy, setToPharmacy] = useState('');
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
 const [statusList, setStatusList] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [errors, setErrors] = useState({
    fromPharmacy: '',
    toPharmacy: '',
    selectedMedicine: '',
    selectedStatus: '',
    quantity: '',
    cost: '',
  });
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setQuantity(val);
    }
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setCost(val);
    }
  };

  // Load tenantID and pharmacy list
  useEffect(() => {
    const sessionTenantID = sessionStorage.getItem('tenantID');
    if (sessionTenantID) {
      setTenantID(sessionTenantID);

      api
        .get(`/Pharmacy/List?tenantId=${sessionTenantID}`)
        .then((res) => {
          setPharmacyList(res.data);
        })
        .catch((err) => {
          console.error('Error fetching pharmacy list:', err);
          setPharmacyList([]);
        });
    } else {
      console.warn('No tenantID found in session storage.');
    }
  }, []);

  // Fetch medicine list when From Pharmacy changes
  useEffect(() => {
    if (fromPharmacy) {
      api
        .get(`/PharmacyMedicine?pharmacyID=${fromPharmacy}`)
        .then((res) => {
          setMedicineList(res.data);
        })
        .catch((err) => {
          console.error('Error fetching medicines:', err);
          setMedicineList([]);
        });
    } else {
      setMedicineList([]);
      setSelectedMedicine('');
    }
  }, [fromPharmacy]);

  useEffect(() => {
    api
      .get('/AppLOV?type=MedicineTransfer')
      .then((res) => {
        if (res.data?.data) {
          setStatusList(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching status list:', err);
      });
  }, []);

  const validate = () => {
    let tempErrors = {
      fromPharmacy: '',
      toPharmacy: '',
      selectedMedicine: '',
      selectedStatus: '',
      quantity: '',
      cost: '',
    };

    let isValid = true;

    if (!fromPharmacy) {
      tempErrors.fromPharmacy = 'From Pharmacy is required';
      isValid = false;
    }

    if (!toPharmacy) {
      tempErrors.toPharmacy = 'To Pharmacy is required';
      isValid = false;
    }

    if (!selectedMedicine) {
      tempErrors.selectedMedicine = 'Medicine is required';
      isValid = false;
    }

    if (!selectedStatus) {
      tempErrors.selectedStatus = 'Status is required';
      isValid = false;
    }

    // Quantity must be positive number, no spaces, no letters or emojis
    if (!quantity) {
      tempErrors.quantity = 'Quantity is required';
      isValid = false;
    } else if (!/^\d*\.?\d+$/.test(quantity)) {
      tempErrors.quantity = 'Quantity must be a valid number';
      isValid = false;
    }

    // Cost must be positive number, decimals allowed
    if (!cost) {
      tempErrors.cost = 'Cost is required';
      isValid = false;
    } else if (!/^\d*\.?\d+$/.test(cost)) {
      tempErrors.cost = 'Cost must be a valid number';
      isValid = false;
    }

    setErrors(tempErrors);

    return isValid;
  };

  const handleSave = () => {
    if (!validate()) {
      return; // don't proceed if validation fails
    }

    const payload = {
      fromPharmacy,
      toPharmacy,
      selectedMedicine,
      selectedStatus,
      quantity: Number(quantity),
      cost: Number(cost),
    };

    console.log('Saving data:', payload);
    // api.post('/save-endpoint', payload)...
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 max-w-xl w-full bg-white rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-semibold text-center">Medicine Transfer</h2>

        {/* From Pharmacy Dropdown */}
        <div>
          <select
            value={fromPharmacy}
            onChange={(e) => setFromPharmacy(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            disabled={!pharmacyList.length}
          >
            <option value="">-- Select From Pharmacy --</option>
            {pharmacyList.map((pharmacy) => (
              <option key={pharmacy.pharmacyID} value={pharmacy.pharmacyID}>
                {pharmacy.pharmacyName}
              </option>
            ))}
          </select>
          {errors.fromPharmacy && (
            <p className="text-red-500 text-sm mt-1">{errors.fromPharmacy}</p>
          )}
        </div>

        {/* To Pharmacy Dropdown */}
        <div>
          <select
            value={toPharmacy}
            onChange={(e) => setToPharmacy(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            disabled={!pharmacyList.length}
          >
            <option value="">-- Select To Pharmacy --</option>
            {pharmacyList.map((pharmacy) => (
              <option key={pharmacy.pharmacyID} value={pharmacy.pharmacyID}>
                {pharmacy.pharmacyName}
              </option>
            ))}
          </select>
          {errors.toPharmacy && (
            <p className="text-red-500 text-sm mt-1">{errors.toPharmacy}</p>
          )}
        </div>

        {/* Medicine Dropdown */}
        <div>
          <select
            value={selectedMedicine}
            onChange={(e) => setSelectedMedicine(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            disabled={!medicineList.length}
          >
            <option value="">-- Select Medicine --</option>
            {medicineList.map((medicine) => (
              <option
                key={medicine.pharmacyMedicineID}
                value={medicine.pharmacyMedicineID}
              >
                {medicine.medicineID}
              </option>
            ))}
          </select>
          {errors.selectedMedicine && (
            <p className="text-red-500 text-sm mt-1">
              {errors.selectedMedicine}
            </p>
          )}
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">-- Select Status --</option>
            {statusList.map((status) => (
              <option key={status.appLOVID} value={status.appLOVID}>
                {status.name}
              </option>
            ))}
          </select>
          {errors.selectedStatus && (
            <p className="text-red-500 text-sm mt-1">{errors.selectedStatus}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Quantity */}
          <div>
            <input
              type="number"
              value={quantity}
              maxLength={5}
              placeholder="Quantity"
              onChange={handleQuantityChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
              min="0"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Cost */}
          <div>
            <input
              type="number"
              value={cost}
              maxLength={7}
              placeholder="Cost (₹)"
              onChange={handleCostChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
              min="0"
              step="0.01"
            />
            {errors.cost && (
              <p className="text-red-500 text-sm mt-1">{errors.cost}</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <CustomButton onClick={handleSave}>Save</CustomButton>
        </div>
      </div>
    </div>
  );
};

export default PharmacyTransfer;
