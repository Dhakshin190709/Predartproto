import React, { useEffect, useState } from 'react';
import api from '../api/request';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomButton from '../components/CustomButton';

interface Doctor {
  doctorID: string;
  doctorName: string;
}

const CheckInOut: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [status, setStatus] = useState<'none' | 'checkin' | 'checkout'>('none');
  const [isSaving, setIsSaving] = useState(false);
const [toastInProgress, setToastInProgress] = useState(false);
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const roleName = sessionStorage.getItem('roleName');
        const unitID = sessionStorage.getItem('unitID');
        const tenantID = sessionStorage.getItem('tenantID');

        let endpoint = '/Doctor';

        if (roleName === 'Reception' && unitID && tenantID) {
          endpoint = `/Doctor?hospitalId=${unitID}&tenantId=${tenantID}`;
        }

        const response = await api.get(endpoint);

        if (response.data?.success && Array.isArray(response.data.data)) {
          setDoctors(response.data.data);
        } else {
          toast.error('Invalid doctor data received.');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Error fetching doctors.');
      }
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true); // LOCK immediately

    const roleName = sessionStorage.getItem('roleName');
    const userId = sessionStorage.getItem('userID');
    const sessionDoctorID = sessionStorage.getItem('doctorID');

    const doctorGuid = roleName === 'Doctor' ? sessionDoctorID : selectedDoctor;

    
  if (!doctorGuid || status === 'none') {
    if (!toastInProgress) {
      setToastInProgress(true);
      toast.warn('Please select a doctor and a status.', {
        onClose: () => setToastInProgress(false),
      });
    }
    setIsSaving(false); // UNLOCK
    return;
  }

    const payload = {
      guidID: doctorGuid,
      updatedBy: userId,
      updatedOn: new Date().toISOString(),
      isActive: status === 'checkin',
    };

    try {
      const response = await api.post('/Doctor/DoctorCheckInOut', payload);
      if (response.data?.success) {
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.success(
          `Doctor ${status === 'checkin' ? 'checked in' : 'checked out'} successfully.`,
          {
            onClose: () => setToastInProgress(false),
          }
        );
      }

        // ✅ RESET fields on success
        if (roleName !== 'Doctor') {
          setSelectedDoctor(''); // Clear dropdown if not logged in as Doctor
        }
        setStatus('none'); // Reset status too
      } else {
         if (!toastInProgress) {
        setToastInProgress(true);
        toast.error('Failed to update doctor status.', {
          onClose: () => setToastInProgress(false),
        });
      }
      }
    } catch (error) {
      console.error('Submit error:', error);
     if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('Something went wrong while saving.', {
        onClose: () => setToastInProgress(false),
      });
    }
    } finally {
      setIsSaving(false); // Always unlock
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            Doctor Check-In / Out
          </h2>

          <div className="relative z-10 w-full">
            <select
              value={selectedDoctor}
              onChange={async (e) => {
                const selectedID = e.target.value;
                setSelectedDoctor(selectedID);

                const tenantID = sessionStorage.getItem('tenantID');
                const unitID = sessionStorage.getItem('unitID');
                const roleName = sessionStorage.getItem('roleName');

                if (!selectedID) {
                  setStatus('none');
                  return;
                }

                try {
                  let apiURL = '';

                  if (roleName === 'SuperAdmin') {
                    apiURL = `/Doctor/DoctorCheckInOut?doctorId=${selectedID}`;
                  } else if (roleName === 'Reception' && tenantID && unitID) {
                    apiURL = `/Doctor/DoctorCheckInOut?tenantId=${tenantID}&hospitalId=${unitID}&doctorId=${selectedID}`;
                  } else {
                    toast.error('Invalid role or missing session data.');
                    setStatus('none');
                    return;
                  }

                  const res = await api.get(apiURL);

                  if (res.data?.success && Array.isArray(res.data.data)) {
                    const doctor = res.data.data[0];
                    if (doctor) {
                      setStatus(doctor.checkInOut ? 'checkin' : 'checkout');
                    } else {
                      setStatus('none');
                    }
                  } else {
                    toast.error('Doctor status fetch failed.');
                    setStatus('none');
                  }
                } catch (error) {
                  console.error('Error fetching doctor status:', error);
                  toast.error('Error checking doctor status.');
                  setStatus('none');
                }
              }}
              className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary"
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc.doctorID} value={doc.doctorID}>
                  {doc.doctorName}
                </option>
              ))}
            </select>
          </div>

          {/* Segment-style Toggle */}
          <div className="flex justify-center mt-4">
            <div className="flex border border-blue-400 rounded-full overflow-hidden">
              <button
                onClick={() => selectedDoctor && setStatus('checkin')}
                disabled={!selectedDoctor}
                className={`px-6 py-2 text-sm font-semibold transition duration-200 ${
                  status === 'checkin'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-black'
                } ${!selectedDoctor && 'opacity-50 cursor-not-allowed'}`}
              >
                Check-In
              </button>
              <button
                onClick={() => selectedDoctor && setStatus('checkout')}
                disabled={!selectedDoctor}
                className={`px-6 py-2 text-sm font-semibold transition duration-200 ${
                  status === 'checkout'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-black'
                } ${!selectedDoctor && 'opacity-50 cursor-not-allowed'}`}
              >
                Check-Out
              </button>
            </div>
          </div>

          <CustomButton onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </CustomButton>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default CheckInOut;
