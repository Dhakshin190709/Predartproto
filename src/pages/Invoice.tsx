import React, { useEffect, useState } from 'react';
import api from '../api/request';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
interface Tenant {
  tenantID: string;
  tenantName: string;
}

interface Hospital {
  hospitalID: string;
  hospitalName: string;
}

interface Patient {
  patientID: string;
  patientName: string;
}

interface Medicine {
  medicineID: string;
  medicineName: string;
}

interface LineItem {
  medicineID: string;
  quantityOrdered: number | '';
  quantityShipped: number | '';
  unitPrice: number | '';
  expiryDate: string;
  status: string;
  netPrice: number;
}
interface LOV {
  appLOVID: string;
  name: string;
}
const InvoiceForm: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [statuses, setStatuses] = useState<LOV[]>([]);
  
  const [formData, setFormData] = useState({
    tenantID: '',
    hospitalID: '',
    patientID: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    totalAmount: '',
    status: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      medicineID: '',
      quantityOrdered: '',
      quantityShipped: '',
      unitPrice: '',
      expiryDate: '',
      status: '',
      netPrice: 0,
    },
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTenants();
    fetchPatients();
    fetchMedicines();
    fetchStatuses();
  }, []);

  useEffect(() => {
    calculateTotalAmount();
  }, [lineItems]);

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

  const fetchHospitals = async (tenantId: string) => {
    try {
      const res = await api.get(`/Hospital/HospitalsList?tenantId=${tenantId}`);
      setHospitals(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/Patient');
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (error) {
      console.error(error);
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
  const updatedItems = [...lineItems];
  const item = updatedItems[index];

  if (name === 'quantityOrdered' || name === 'unitPrice' || name === 'quantityShipped') {
    const qtyOrdered =
      name === 'quantityOrdered' ? Number(value) : Number(item.quantityOrdered);
    const unitPrice =
      name === 'unitPrice' ? Number(value) : Number(item.unitPrice);

    // Always store quantityShipped as number
    const qtyShipped =
      name === 'quantityShipped' ? Number(value) : Number(item.quantityShipped);

    const net = qtyOrdered * unitPrice || 0;

    updatedItems[index] = {
      ...item,
      [name]: value === '' ? '' : Number(value),
      netPrice: net,
      quantityShipped: qtyShipped, // force numeric
    };
  } else {
    updatedItems[index] = {
      ...item,
      [name]: value,
    };
  }

  setLineItems(updatedItems);
};


  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        medicineID: '',
        quantityOrdered: '',
        quantityShipped: '',
        unitPrice: '',
        expiryDate: '',
        status: '',
        netPrice: 0,
      },
    ]);
  };

  const calculateTotalAmount = () => {
    const total = lineItems.reduce((sum, item) => sum + item.netPrice, 0);
    setFormData((prev) => ({
      ...prev,
      totalAmount: total.toString(),
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // 1️⃣ Main invoice fields
    if (!formData.tenantID) newErrors.tenantID = 'Tenant is required';
    if (!formData.hospitalID) newErrors.hospitalID = 'Hospital is required';
    if (!formData.patientID) newErrors.patientID = 'Patient is required';
    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice Number is required';
    } else if (!/^INV-\d+$/.test(formData.invoiceNumber.trim())) {
      newErrors.invoiceNumber =
        'Invoice Number must be like "INV-001" (INV- plus numbers)';
    }

    if (!formData.invoiceDate)
      newErrors.invoiceDate = 'Invoice Date is required';

    if (!formData.status) newErrors.status = 'Status is required';

    // 2️⃣ Line items
    lineItems.forEach((item, index) => {
      const prefix = `LineItem[${index + 1}]`;
      if (!item.medicineID)
        newErrors[`${prefix}.medicineID`] =
          `Medicine is required for item ${index + 1}`;

      // Must be a number and not zero or repeating zeroes
      const validQtyOrdered =
        Number(item.quantityOrdered) > 0 &&
        !/^0+$/.test(String(item.quantityOrdered));
      const validQtyShipped =
        item.quantityShipped !== '' &&
        Number(item.quantityShipped) >= 0 &&
        !/^0+$/.test(String(item.quantityShipped));

      const validUnitPrice =
        Number(item.unitPrice) > 0 && !/^0+$/.test(String(item.unitPrice));

      if (!validQtyOrdered)
        newErrors[`${prefix}.quantityOrdered`] =
          `Valid Quantity Ordered is required for item ${index + 1}`;
      if (!validQtyShipped)
        newErrors[`${prefix}.quantityShipped`] =
          `Valid Quantity Shipped is required for item ${index + 1}`;
      if (!validUnitPrice)
        newErrors[`${prefix}.unitPrice`] =
          `Valid Unit Price is required for item ${index + 1}`;

      // Status
      if (!item.status)
        newErrors[`${prefix}.status`] =
          `Status is required for item ${index + 1}`;

      // Expiry date
      if (!item.expiryDate) {
        newErrors[`${prefix}.expiryDate`] =
          `Expiry Date is required for item ${index + 1}`;
      } else {
        const today = new Date();
        const expiry = new Date(item.expiryDate);
        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);
        if (expiry <= today) {
          newErrors[`${prefix}.expiryDate`] =
            `Expiry Date must be a future date for item ${index + 1}`;
        }
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation Errors:', newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };



const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isSubmitting) {
    // Prevent double submit
    toast.info('Submission in progress. Please wait...');
    return;
  }

  if (validate()) {
    setIsSubmitting(true); // Lock the button

    const currentUserID = sessionStorage.getItem('userID');

    const statusObj = statuses.find((s) => s.name === formData.status);
    const statusID = statusObj ? statusObj.appLOVID : null;

    const payload = {
      invoice: {
        createdBy: currentUserID,
        createdOn: new Date().toISOString(),
        updatedBy: currentUserID,
        updatedOn: new Date().toISOString(),
        isActive: true,

        tenantID: formData.tenantID,
        hospitalID: formData.hospitalID,
        patientID: formData.patientID,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
        totalAmount: String(formData.totalAmount),
        statusID: statusID,
      },
      invoiceLineItem: lineItems.map((item) => {
        const lineStatusObj = statuses.find((s) => s.name === item.status);
        return {
          createdBy: currentUserID,
          createdOn: new Date().toISOString(),
          updatedBy: currentUserID,
          updatedOn: new Date().toISOString(),
          isActive: true,

          medicineMasterID: item.medicineID,
          quantityOrdered: Number(item.quantityOrdered),
          quantityShipped: Number(item.quantityShipped),
          unitPrice: Number(item.unitPrice),
          netPrice: Number(item.netPrice),
          expiryDate: new Date(item.expiryDate).toISOString(),
          statusID: lineStatusObj ? lineStatusObj.appLOVID : null,
        };
      }),
    };

    console.log('🚀 Final Payload:', payload);

    try {
      const res = await api.post('/Invoice/SaveInvoice', payload);
      console.log('API Response:', res.data);
      toast.success('Invoice saved successfully!');

      // 🔵 Reset form & line items
      setFormData({
        tenantID: '',
        hospitalID: '',
        patientID: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0], // today
        totalAmount: '',
        status: '',
      });
      setLineItems([
        {
          medicineID: '',
          quantityOrdered: '',
          quantityShipped: '',
          unitPrice: '',
          netPrice: '',
          expiryDate: '',
          status: '',
        },
      ]);
    } catch (error) {
      console.error('API Error:', error);
      toast.error('Something went wrong while saving the invoice.');
    } finally {
      setIsSubmitting(false);
    }
  } else {
    toast.error('Please fix the form errors before submitting.');
  }
};




  return (
       <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
    <div className="max-w-5xl mx-auto p-4">
      
      <h1 className="text-2xl font-semibold text-black mt-4 mb-8">
        Create Invoice
      </h1>

      {/* First half */}
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
              name="patientID"
              value={formData.patientID}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary resize-y placeholder:text-base"
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.patientID} value={p.patientID}>
                  {p.patientName}
                </option>
              ))}
            </select>
            {errors.patientID && (
              <p className="text-red-500 text-xs mt-1">{errors.patientID}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="invoiceNumber"
              placeholder="Invoice Number"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary resize-y placeholder:text-base"
            />
            {errors.invoiceNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.invoiceNumber}
              </p>
            )}
          </div>
          <div>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary resize-y placeholder:text-base"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Total Amount"
              name="totalAmount"
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
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary resize-y placeholder:text-base"
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

        {/* Second half — Line Items */}
        <h2 className="text-xl font-semibold text-black mt-4 mb-8">
          Line Items
        </h2>
        {lineItems.map((item, index) => (
          <div
            key={index}
            className="border border-stroke rounded-lg p-4 mb-4 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <select
                value={item.medicineID}
                onChange={(e) =>
                  handleLineItemChange(index, 'medicineID', e.target.value)
                }
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
              >
                <option value="">Select Medicine</option>
                {medicines.map((m) => (
                  <option key={m.medicineID} value={m.medicineID}>
                    {m.medicineName}
                  </option>
                ))}
              </select>
              {errors[`LineItem[${index + 1}].medicineID`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`LineItem[${index + 1}].medicineID`]}
                </p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder="Quantity Ordered"
                value={item.quantityOrdered}
                onChange={(e) =>
                  handleLineItemChange(index, 'quantityOrdered', e.target.value)
                }
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
              />
              {errors[`LineItem[${index + 1}].quantityOrdered`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`LineItem[${index + 1}].quantityOrdered`]}
                </p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder="Quantity Shipped"
                value={item.quantityShipped}
                onChange={(e) =>
                  handleLineItemChange(index, 'quantityShipped', e.target.value)
                }
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
              />
              {errors[`LineItem[${index + 1}].quantityShipped`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`LineItem[${index + 1}].quantityShipped`]}
                </p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder="Unit Price"
                value={item.unitPrice}
                onChange={(e) =>
                  handleLineItemChange(index, 'unitPrice', e.target.value)
                }
               className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
              />
              {errors[`LineItem[${index + 1}].unitPrice`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`LineItem[${index + 1}].unitPrice`]}
                </p>
              )}
            </div>

            <div>
              <input
                type="date"
                placeholder="Expiry Date"
                value={item.expiryDate}
                onChange={(e) =>
                  handleLineItemChange(index, 'expiryDate', e.target.value)
                }
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
              />

              {errors[`LineItem[${index + 1}].expiryDate`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`LineItem[${index + 1}].expiryDate`]}
                </p>
              )}
            </div>
            <div>
              <select
                value={item.status}
                onChange={(e) =>
                  handleLineItemChange(index, 'status', e.target.value)
                }
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
              >
                <option value="">Select Status</option>
                {statuses.map((s) => (
                  <option key={s.appLOVID} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors[`LineItem[${index + 1}].status`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`LineItem[${index + 1}].status`]}
                </p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder="Net Price"
                value={item.netPrice}
                readOnly
               className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none placeholder:text-base"
              />
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-1">
          <div
            className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
            onClick={addLineItem}
          >
            +
          </div>
          <span className="text-sm font-medium text-black-600">Add</span>
        </div>
        <div className="flex mt-2">
          <button
            type="submit"
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
    hover:from-[#007BFF] hover:to-[#004A99]
    text-white transition duration-150 
    ease-out hover:ease-in py-2 px-5 rounded-lg"
          >
            Submit Invoice
          </button>
             <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </form>
    </div>
    </div>
  );
};

export default InvoiceForm;
