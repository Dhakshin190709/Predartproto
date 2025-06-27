import React, { useEffect, useState } from 'react';
import api from '../api/request';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaVial } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

interface PatientLabOrder {
  patientLabOrderID: string;
  patientID: string;
  laboratoryID: string;
  status: string;
}

interface Patient {
  patientID: string;
  patientName: string;
}

interface Laboratory {
  laboratoryID: string;
  labName: string;
}

interface LabTestMaster {
  labTestID: string;
  testName: string;
}

const PatientLabTestList: React.FC = () => {
  const [labOrders, setLabOrders] = useState<PatientLabOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [labTests, setLabTests] = useState<LabTestMaster[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderID, setSelectedOrderID] = useState('');
  const [selectedLabTest, setSelectedLabTest] = useState('');
  const [sampleStatus, setSampleStatus] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [labOrderRes, patientRes, labRes, labTestRes] = await Promise.all([
          api.get('/PatientLabOrder'),
          api.get('/Patient'),
          api.get('/Laboratory'),
          api.get('/LabTest')
        ]);

        if (
          labOrderRes.data?.success &&
          patientRes.data?.success &&
          labRes.data?.success &&
          labTestRes.data?.success
        ) {
          setLabOrders(labOrderRes.data.data);
          setPatients(patientRes.data.data);
          setLabs(labRes.data.data);
          setLabTests(labTestRes.data.data.filter((t: any) => t.isActive));
        } else {
          toast.error('Failed to fetch one or more data sources.');
        }
      } catch (error) {
        console.error('API error:', error);
        toast.error('Error loading lab orders');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getPatientName = (patientID: string) => {
    const patient = patients.find((p) => p.patientID === patientID);
    return patient ? patient.patientName : 'Unknown';
  };

  const getLabName = (labID: string) => {
    const lab = labs.find((l) => l.laboratoryID === labID);
    return lab ? lab.labName : 'Unknown';
  };

  const handleCardClick = (id: string) => {
    setSelectedOrderID(id);
    setShowModal(true);
  };

  const handleSave = async () => {
  if (!selectedLabTest || !sampleStatus || !reportUrl) {
    toast.error('Please fill all fields');
    return;
  }

  const userId = sessionStorage.getItem('userID');
  const now = new Date().toISOString();

  const payload = [{
    createdBy: userId,
    createdOn: now,
    updatedBy: userId,
    updatedOn: now,
    isActive: true,
    patientLabOrderID: selectedOrderID,
    labTestID: selectedLabTest,
    sampleStatus: sampleStatus,
    sampleCollectedBy: userId,
    sampleCollectedOn: now,
    reportFileUrl: reportUrl,
  }];

  try {
    const res = await api.post('/PatientLabTest', payload);
    if (res.status === 200 || res.status === 201) {
      toast.success(res.data?.message || 'Test added successfully');
      setShowModal(false);
      setSelectedLabTest('');
      setSampleStatus('');
      setReportUrl('');
    } else {
      toast.error('Failed to add test');
    }
  } catch (error) {
    console.error(error);
    toast.error('Error submitting test');
  }
};


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-black mb-6">Patient Lab Test</h1>

      {loading ? (
        <p className="text-gray-600 text-center">Loading...</p>
      ) : labOrders.length === 0 ? (
        <p className="text-red-500 text-center">No lab orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labOrders.map((order) => (
            <div
              key={order.patientLabOrderID}
              onClick={() => handleCardClick(order.patientLabOrderID)}
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border border-blue-100 bg-white rounded-2xl shadow-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                  <FaVial size={20} />
                </div>
                <h2 className="text-xl font-semibold text-blue-800">Lab Order</h2>
              </div>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold text-black">Laboratory:</span> {getLabName(order.laboratoryID)}</p>
                <p><span className="font-semibold text-black">Patient:</span> {getPatientName(order.patientID)}</p>
                <p><span className="font-semibold text-black">Status:</span> {order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Add Lab Test</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Dropdown */}
              <select
                className="w-full border border-gray-300 p-2 rounded-md"
                value={selectedLabTest}
                onChange={(e) => setSelectedLabTest(e.target.value)}
              >
                <option value="">-- Select Test --</option>
                {labTests.map((test) => (
                  <option key={test.labTestID} value={test.labTestID}>
                    {test.labTestID}
                  </option>
                ))}
              </select>

              {/* Sample Status */}
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded-md"
                placeholder="Sample Status"
                value={sampleStatus}
                onChange={(e) => setSampleStatus(e.target.value)}
              />
            </div>

            {/* Report URL */}
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-md mb-4"
              placeholder="Report File URL"
              value={reportUrl}
              onChange={(e) => setReportUrl(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientLabTestList;
