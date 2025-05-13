import React, { useState ,useEffect} from 'react';
import { FaStar } from 'react-icons/fa';
import Profile from '../images/icon/profile.svg';

import axios from 'axios';
import hp from '../images/icon/hp.jpg';
interface Doctor {
  doctorName: string;
  specializationID: string;
}

interface Specialization {
  appLOVID: string;
  name: string;
}
const reviews = [
  {
    name: 'John D.',
    rating: 5,
    review: 'Excellent care and friendly staff. Dr. Morgan is the best!',
    image: 'https://via.placeholder.com/50',
  },
  {
    name: 'Maria K.',
    rating: 4,
    review: 'Very clean and professional service, though waiting time was a bit long.',
    image: 'https://via.placeholder.com/50',
  },
  {
    name: 'Suresh R.',
    rating: 5,
    review: 'Had my surgery done here. Great doctors and follow-up.',
    image: 'https://via.placeholder.com/50',
  },
  {
    name: 'Leena M.',
    rating: 4,
    review: 'Staff was polite and helpful. Great pediatric care.',
    image: 'https://via.placeholder.com/50',
  },
];

const HospitalDetails = () => {
  const [reviewPage, setReviewPage] = useState(0);
  const reviewsPerPage = 2;
  const start = reviewPage * reviewsPerPage;
  const end = start + reviewsPerPage;
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Record<string, string>>({});

    useEffect(() => {
    const fetchHospitalDetails = async () => {
      const unitID = sessionStorage.getItem('unitID'); // Ensure unitID is stored in sessionStorage
      if (!unitID) return;

      try {
        const response = await axios.get(`https://predart003-001-site1.anytempurl.com/api/Hospital/${unitID}`);
        const data = response.data?.data;
        if (data) {
          setHospitalName(data.hospitalName || '');
          setHospitalType(data.hospitalType || '');
        }
      } catch (error) {
        console.error('Error fetching hospital details:', error);
      }
    };

    fetchHospitalDetails();
  }, []);

 useEffect(() => {
    const unitID = sessionStorage.getItem('unitID');
    if (!unitID) return;

    const fetchDoctorsAndSpecializations = async () => {
      try {
        // Fetch doctors
        const doctorRes = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor?hospitalId=${unitID}`
        );
        const doctorData = doctorRes.data?.data || [];

        // Limit to 5 doctors and extract only needed fields
        const topFiveDoctors = doctorData.slice(0, 5).map((doc: any) => ({
          doctorName: doc.doctorName,
          specializationID: doc.specializationID,
        }));

        // Fetch specializations
        const specRes = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Specializations`
        );
        const specData = specRes.data?.data || [];

        // Map specializationID to name
        const specMap: Record<string, string> = {};
        specData.forEach((spec: Specialization) => {
          specMap[spec.appLOVID] = spec.name;
        });

        setDoctors(topFiveDoctors);
        setSpecializations(specMap);
      } catch (error) {
        console.error('Error fetching doctor or specialization data:', error);
      }
    };

    fetchDoctorsAndSpecializations();
  }, []);

  return (
    <div className="p-4">
    <h1 className="text-3xl p-10 font-semibold text-black">
      Hospital Details
    </h1>
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gradient-to-br from-gray-100 to-white min-h-screen">
      {/* Profile Section */}
      <div className="flex bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
        <div className="w-1/4">
          

          <img
          src={hp}
          alt="hospitalImg"
          className="rounded-2xl w-full h-full object-cover border border-blue-300 shadow"
        />
        </div>
         <div className="w-3/4 pl-8 flex flex-col justify-center">
      <h2 className="text-4xl font-extrabold text-blue-800 mb-2">
        {hospitalName || 'Loading Hospital Name...'}
      </h2>
      <p className="text-lg font-medium text-blue-600">
        {hospitalType || 'Loading Hospital Type...'}
      </p>
      <p className="text-gray-700 mt-3 leading-relaxed text-justify">
        It is a modern 200-bed hospital offering cutting-edge services in cardiology,
        orthopedics, oncology, and emergency care. We believe in compassionate care
        and world-class medical infrastructure.
      </p>
    </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branches */}
        <div className="bg-green-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-bold text-green-700 mb-4">🏥 Hospital Branches</h3>
          <ul className="space-y-2 text-gray-800 list-disc pl-6">
            <li>Main: 123 Health Street, NY</li>
            <li>Brooklyn Branch: 45 Wellness Ave</li>
            <li>Queens Branch: 98 Care Drive</li>
          </ul>
        </div>

        {/* Top Doctors */}
        <div className="bg-purple-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-2xl font-bold text-purple-700 mb-4">👨‍⚕️ Top Doctors</h3>
      <ul className="space-y-2 text-gray-800 list-decimal pl-6">
        {doctors.map((doctor, index) => (
          <li key={index}>
            {doctor.doctorName} – {specializations[doctor.specializationID] || 'Specialization'}
          </li>
        ))}
      </ul>
    </div>

        {/* Specialties */}
        <div className="bg-yellow-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-bold text-yellow-700 mb-4">🩺 Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {["Cardiology", "Orthopedics", "Oncology", "Neurology", "Pediatrics", "Radiology"].map((spec, i) => (
              <span key={i} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium shadow">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-indigo-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-bold text-indigo-700 mb-4">🏗️ Infrastructure</h3>
          <p className="text-gray-800">
            Modern ICU, digital diagnostics, modular OTs, robotic surgery, 24/7 emergency, cafeteria, pharmacy & more.
          </p>
        </div>
      </div>

      {/* Patient Reviews Section */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-red-200">
        <h3 className="text-3xl font-bold text-red-700 mb-6">📝 Patient Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.slice(start, end).map((rev, index) => (
            <div key={index} className="bg-red-50 border border-red-100 rounded-xl p-4 shadow hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-3">
                <img src={Profile} alt="Reviewer" className="w-12 h-12 rounded-full border shadow" />
                <div>
                  <p className="font-semibold text-gray-900">{rev.name}</p>
                  <div className="text-yellow-500 flex gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{rev.review}</p>
            </div>
          ))}
        </div>

        {/* Review Pagination */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            disabled={reviewPage === 0}
            onClick={() => setReviewPage((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-40"
          >
            Back
          </button>
          <button
            disabled={end >= reviews.length}
            onClick={() => setReviewPage((prev) => prev + 1)}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default HospitalDetails;
