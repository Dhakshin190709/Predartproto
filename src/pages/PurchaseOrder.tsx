import React, { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import api from '../api/request';

interface Pharmacy {
  pharmacyID: string;
  pharmacyName: string;
}

interface Status {
  appLOVID: string;
  name: string;
}

interface Medicine {
  medicineID: string;
  medicineName: string;
}

interface LineItem {
  medicineID: string;
  quantityOrdered: number | '';
  quantityReceived: number | '';
  description: string;
  unitPrice: number | '';
  lineTotal: number;
  expiryDate: string;
  status: string;
}

export default function PurchaseOrder() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [formData, setFormData] = useState({
    tenantID: '',
    hospitalID: '',
    supplierID: '',
    pharmacyID: '',
    poNumber: '',
    poDate: new Date().toISOString().slice(0, 10),
    totalAmount: 0,
    status: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      medicineID: '',
      quantityOrdered: '',
      quantityReceived: '',
      description: '',
      unitPrice: '',
      lineTotal: 0,
      expiryDate: '',
      status: '',
    },
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [toastInProgress, setToastInProgress] = useState(false);

  // 📌 Fetch dropdown data
  useEffect(() => {
    fetchPharmacies();
    fetchStatuses();
    fetchMedicines();
    fetchTenants();
    // 👇 use your existing hospital & tenant fetch logic here too
  }, []);

  const fetchPharmacies = async () => {
    try {
      const res = await api.get('/Pharmacy/List');
      setPharmacies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

 const fetchStatuses = () => {
  try {
    const masterLOV = JSON.parse(localStorage.getItem('masterLOV') || '{}');

    if (masterLOV && Array.isArray(masterLOV.data)) {
      const statuses = masterLOV.data.filter(
        (item: any) => item.type === 'Status'
      );
      setStatuses(statuses);
    } else {
      console.warn('No masterLOV data found in localStorage.');
    }
  } catch (err) {
    console.error('Error reading masterLOV from localStorage:', err);
  }
};


  const fetchMedicines = async () => {
    try {
      const res = await api.get('/MedicineMaster');
      setMedicines(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchTenants = async () => {
    try {
      const res = await api.get('/Tenant/TenantList');
      if (res.data.success) {
        setTenants(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHospitals = async (tenantId: string) => {
    try {
      const res = await api.get(`/Hospital/HospitalsList?tenantId=${tenantId}`);
      setHospitals(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'tenantID') {
      fetchHospitals(value);
      setFormData((prev) => ({ ...prev, hospitalID: '' }));
    }
  };

  const handleLineItemChange = (index: number, name: string, value: string) => {
    const updated = [...lineItems];
    const item = updated[index];

    if (name === 'quantityOrdered' || name === 'unitPrice') {
      const qty =
        name === 'quantityOrdered'
          ? Number(value)
          : Number(item.quantityOrdered);
      const price =
        name === 'unitPrice' ? Number(value) : Number(item.unitPrice);
      const lineTotal = qty * price || 0;

      updated[index] = {
        ...item,
        [name]: value === '' ? '' : Number(value),
        lineTotal,
      };
    } else {
      updated[index] = { ...item, [name]: value };
    }

    // Update totalAmount too
    const newTotalAmount = updated.reduce(
      (sum, li) => sum + (li.lineTotal || 0),
      0,
    );
    setLineItems(updated);
    setFormData((prev) => ({ ...prev, totalAmount: newTotalAmount }));
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        medicineID: '',
        quantityOrdered: '',
        quantityReceived: '',
        description: '',
        unitPrice: '',
        lineTotal: 0,
        expiryDate: '',
        status: '',
      },
    ]);
  };
const validate = () => {
  const newErrors: { [key: string]: string } = {};

  if (!formData.tenantID) newErrors.tenantID = 'Tenant is required';
  if (!formData.hospitalID) newErrors.hospitalID = 'Hospital is required';
  if (!formData.supplierID) newErrors.supplierID = 'Supplier is required';
  if (!formData.pharmacyID) newErrors.pharmacyID = 'Pharmacy is required';

  if (!formData.poNumber.trim()) {
    newErrors.poNumber = 'PO Number is required';
  } else if (!/^PO-\d+$/.test(formData.poNumber.trim())) {
    newErrors.poNumber = 'Format must be PO-001';
  }

  if (!formData.status) newErrors.status = 'Status is required';

  lineItems.forEach((li, index) => {
    const prefix = `LineItem[${index + 1}]`;

    if (!li.medicineID)
      newErrors[`${prefix}.medicineID`] = 'Medicine required';

    if (!(Number(li.quantityOrdered) > 0))
      newErrors[`${prefix}.quantityOrdered`] = 'Qty Ordered > 0';

    if (li.quantityReceived === '')
      newErrors[`${prefix}.quantityReceived`] = 'Qty Received required';

    if (!(Number(li.unitPrice) > 0))
      newErrors[`${prefix}.unitPrice`] = 'Unit Price > 0';

    if (!li.expiryDate) {
      newErrors[`${prefix}.expiryDate`] = 'Expiry date required';
    } else {
      const today = new Date();
      const expiry = new Date(li.expiryDate);
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);
      if (expiry <= today) {
        newErrors[`${prefix}.expiryDate`] = 'Expiry must be future';
      }
    }

    if (!li.status) newErrors[`${prefix}.status`] = 'Status required';

    // ✅ New: Validate description
    if (!li.description || li.description.trim() === '') {
      newErrors[`${prefix}.description`] = 'Description is required';
    } else {
      if (li.description.length > 255) {
        newErrors[`${prefix}.description`] = 'Max 255 characters allowed';
      }
      // Reject 6+ repeating same char (like "aaaaaa")
      if (/(.)\1{5,}/.test(li.description)) {
        newErrors[`${prefix}.description`] = 'No repeating characters allowed';
      }
      // Allow only basic letters, numbers, spaces & punctuation
      const allowedRegex = /^[a-zA-Z0-9\s.,;:!?'"()\[\]{}\-_/\\]*$/;
      if (!allowedRegex.test(li.description)) {
        newErrors[`${prefix}.description`] =
          'Only letters, numbers & punctuation allowed. Emojis or special symbols not allowed.';
      }
    }
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix form errors.');
      return;
    }

    if (toastInProgress) return;

    setToastInProgress(true);

    const currentUserID = sessionStorage.getItem('userID');

    const statusObj = statuses.find((s) => s.name === formData.status);
    const statusID = statusObj ? statusObj.appLOVID : '';

    const payload = {
      purchaseOrder: {
        createdBy: currentUserID,
        createdOn: new Date().toISOString(),
        updatedBy: currentUserID,
        updatedOn: new Date().toISOString(),
        isActive: true,
        tenantID: formData.tenantID,
        hospitalID: formData.hospitalID,
        supplierID: formData.supplierID,
        pharmacyID: formData.pharmacyID,
        poNumber: formData.poNumber,
        poDate: new Date(formData.poDate).toISOString(),
        totalAmount: String(formData.totalAmount),
        statusID,
      },
      purchaseOrderLineItem: lineItems.map((li) => ({
        createdBy: currentUserID,
        createdOn: new Date().toISOString(),
        updatedBy: currentUserID,
        updatedOn: new Date().toISOString(),
        isActive: true,
        medicineMasterID: li.medicineID,
        quantityOrdered: Number(li.quantityOrdered),
        quantityReceived: Number(li.quantityReceived),
        description: li.description,
        unitPrice: Number(li.unitPrice),
        lineTotal: li.lineTotal,
        expiryDate: new Date(li.expiryDate).toISOString(),
        statusID: statuses.find((s) => s.name === li.status)?.appLOVID || '',
      })),
    };

    try {
      const res = await api.post('/PurchaseOrder/SavePurchaseOrder', payload);
      toast.success('Purchase Order Saved!');
      setFormData({
        tenantID: '',
        hospitalID: '',
        supplierID: '',
        pharmacyID: '',
        poNumber: '',
        poDate: new Date().toISOString().slice(0, 10),
        totalAmount: 0,
        status: '',
      });
      setLineItems([
        {
          medicineID: '',
          quantityOrdered: '',
          quantityReceived: '',
          description: '',
          unitPrice: '',
          lineTotal: 0,
          expiryDate: '',
          status: '',
        },
      ]);
    } catch (err) {
      console.error(err);
      toast.error('Error saving PO');
    } finally {
      setToastInProgress(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-black mt-4 mb-8">
        Create Purchase Order
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <select
              name="tenantID"
              value={formData.tenantID}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary resize-y placeholder:text-base"
            >
              <option value="">Select Tenant</option>
              {tenants.map((t) => (
                <option key={t.tenantID} value={t.tenantID}>
                  {t.tenantName}
                </option>
              ))}
            </select>
            {errors.tenantID && (
              <p className="text-red-500 text-xs mt-1">{errors.tenantID}</p>
            )}
          </div>
          <div>
            <select
              name="hospitalID"
              value={formData.hospitalID}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary resize-y placeholder:text-base"
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.hospitalID} value={h.hospitalID}>
                  {h.hospitalName}
                </option>
              ))}
            </select>
            {errors.hospitalID && (
              <p className="text-red-500 text-xs mt-1">{errors.hospitalID}</p>
            )}
          </div>
          <div>
            <select
              name="supplierID"
              value={formData.supplierID}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
            >
              <option value="">Select Supplier</option>
              {pharmacies.map((p) => (
                <option key={p.pharmacyID} value={p.pharmacyID}>
                  {p.pharmacyName}
                </option>
              ))}
            </select>
            {errors.supplierID && (
              <p className="text-red-500 text-xs mt-1">{errors.supplierID}</p>
            )}
          </div>
          <div>
            <select
              name="pharmacyID"
              value={formData.pharmacyID}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
            >
              <option value="">Select Pharmacy</option>
              {pharmacies.map((p) => (
                <option key={p.pharmacyID} value={p.pharmacyID}>
                  {p.pharmacyName}
                </option>
              ))}
            </select>
            {errors.pharmacyID && (
              <p className="text-red-500 text-xs mt-1">{errors.pharmacyID}</p>
            )}
          </div>
          <div>
            <input
              name="poNumber"
              placeholder="PO Number"
              value={formData.poNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none placeholder:text-base"
            />
            {errors.poNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.poNumber}</p>
            )}
          </div>
          <div>
            <input
              type="date"
              name="poDate"
              value={formData.poDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black
           outline-none placeholder:text-base"
            />
            {errors.poDate && (
              <p className="text-red-500 text-xs mt-1">{errors.poDate}</p>
            )}
          </div>

          <div>
            <input
              placeholder="Total Amount"
              value={formData.totalAmount}
              readOnly
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
            />
            {errors.totalAmount && (
              <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>
            )}
          </div>
          <div>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
            >
              <option value="">Select Status</option>
              {statuses.map((s) => (
                <option key={s.appLOVID} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-red-500 text-xs mt-1">{errors.status}</p>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-black mt-4 mb-8">
          Line Items
        </h2>
       {lineItems.map((li, idx) => {
  const prefix = `LineItem[${idx + 1}]`;
  return (
    <div
      key={idx}
      className="border border-stroke rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Medicine Dropdown */}
      <div>
        <select
          value={li.medicineID}
          onChange={(e) => handleLineItemChange(idx, 'medicineID', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
        >
          <option value="">Select Medicine</option>
          {medicines.map((m) => (
            <option key={m.medicineID} value={m.medicineID}>
              {m.medicineName}
            </option>
          ))}
        </select>
        {errors[`${prefix}.medicineID`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`${prefix}.medicineID`]}</p>
        )}
      </div>

      {/* Qty Ordered */}
      <div>
        <input
          type="number"
          placeholder="Qty Ordered"
          value={li.quantityOrdered}
          onChange={(e) => handleLineItemChange(idx, 'quantityOrdered', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
        />
        {errors[`${prefix}.quantityOrdered`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`${prefix}.quantityOrdered`]}</p>
        )}
      </div>

      {/* Qty Received */}
      <div>
        <input
          type="number"
          placeholder="Qty Received"
          value={li.quantityReceived}
          onChange={(e) => handleLineItemChange(idx, 'quantityReceived', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
        />
        {errors[`${prefix}.quantityReceived`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`${prefix}.quantityReceived`]}</p>
        )}
      </div>

      {/* Unit Price */}
      <div>
        <input
          type="number"
          placeholder="Unit Price"
          value={li.unitPrice}
          onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
        />
        {errors[`${prefix}.unitPrice`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`${prefix}.unitPrice`]}</p>
        )}
      </div>

      {/* Line Total */}
      <div>
        <input
          type="number"
          placeholder="Line Total"
          value={li.lineTotal}
          readOnly
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
        />
      </div>

      {/* Expiry Date */}
      <div>
        <input
          type="date"
          placeholder="Expiry Date"
          value={li.expiryDate}
          onChange={(e) => handleLineItemChange(idx, 'expiryDate', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
        />
        {errors[`${prefix}.expiryDate`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`${prefix}.expiryDate`]}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <select
          value={li.status}
          onChange={(e) => handleLineItemChange(idx, 'status', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
        >
          <option value="">Status</option>
          {statuses.map((s) => (
            <option key={s.appLOVID} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        {errors[`${prefix}.status`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`${prefix}.status`]}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <textarea
          placeholder="Description"
          rows={1}
          value={li.description}
          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
        />
        {errors[`${prefix}.description`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`${prefix}.description`]}</p>
        )}
      </div>
    </div>
  );
})}


        <div className="flex items-center justify-end gap-1">
          <div
            className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
            onClick={addLineItem}
          >
            +
          </div>
          <span className="text-sm font-medium text-black-600">Add</span>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
    hover:from-[#007BFF] hover:to-[#004A99]
    text-white transition duration-150 
    ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Submit PO
        </button>
      </form>
    </div>
  );
}
