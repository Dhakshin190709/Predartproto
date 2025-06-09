import React, { useState, useEffect } from 'react';
import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import Profile from '../images/icon/profile.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import axios from 'axios';
import hp from '../images/icon/hp.jpg';
import api from '../api/request';
interface Doctor {
  doctorName: string;
  specializationID: string;
}

interface Specialization {
  appLOVID: string;
  name: string;
}

const HospitalDetails = () => {
  const [reviewPage, setReviewPage] = useState(0);
  const reviewsPerPage = 2;
  const start = reviewPage * reviewsPerPage;
  const end = start + reviewsPerPage;
  const [hospitalName, setHospitalName] = useState('');
  const [reviews, setReviews] = useState([]);
  const [hospitalType, setHospitalType] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitalCode, setHospitalCode] = useState('');
const [hospitalAddresses, setHospitalAddresses] = useState([]);

  const [specializations, setSpecializations] = useState<
    Record<string, string>
  >({});
  const navigate = useNavigate();
  const location = useLocation();
  const hospitalIDFromRoute = location.state?.hospitalID;
  const [hospitalID, setHospitalID] = useState(hospitalIDFromRoute || '');
  const getReviewerName = (email: string) => email?.split('@')[0];
  const [overallRating, setOverallRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
    const totalStars = 5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    }

    if (hasHalf) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }

    while (stars.length < totalStars) {
      stars.push(
        <FaRegStar key={`empty-${stars.length}`} className="text-yellow-500" />,
      );
    }

    return stars;
  };
useEffect(() => {
    // Fetch reviews from API
    const fetchReviews = async () => {
       if (!hospitalID) return;
      try {
        // Use your Axios instance (api)
        const res = await api.get(`/Feedback?EntityId=${hospitalID}&EntityType=Hospital`);
        
        // Filter active reviews
        const activeReviews = res.data?.filter((item: any) => item.isActive);
        if (activeReviews) {
          setReviews(activeReviews); // Set active reviews to state
        }
      } catch (err) {
        console.error('Error fetching reviews:', err); // Handle errors
      }
    };

    fetchReviews(); // Call the fetch function

  }, []); 
 useEffect(() => {
  if (!hospitalID) return;

  const fetchHospitalDetails = async () => {
    try {
      const response = await api.get(`/Hospital/${hospitalID}`);
      const data = response.data?.data;
      if (data) {
        setHospitalName(data.hospitalName || '');
        setHospitalType(data.hospitalType || '');
        setHospitalCode(data.hospitalCode || '');
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
    }
  };

  fetchHospitalDetails();
}, [hospitalID]);

useEffect(() => {
  if (!hospitalID) return;

  const fetchHospitalAddress = async () => {
    try {
      const response = await api.get(`/Address/getaddress?id=${hospitalID}&Type=hospital`);
      const data = response.data?.data;
      if (Array.isArray(data)) {
        setHospitalAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching hospital address:', error);
    }
  };

  fetchHospitalAddress();
}, [hospitalID]);


 useEffect(() => {
  if (!hospitalID) return;

  const fetchDoctorsAndSpecializations = async () => {
    try {
      // ✅ Use hospitalID directly
      const doctorRes = await api.get(`/Doctor?hospitalId=${hospitalID}`);
      const doctorData = doctorRes.data?.data || [];

      // Limit to 5 doctors and extract needed fields
      const topFiveDoctors = doctorData.slice(0, 5).map((doc: any) => ({
        doctorName: doc.doctorName,
        specializationID: doc.specializationID,
      }));

      // Fetch specializations
      const specRes = await api.get(`/AppLOV?type=Specializations`);
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
}, [hospitalID]);

  useEffect(() => {
     if (!hospitalID) return;

    // Use the Axios instance for the API call
    api
      .get(`/Feedback/Rating?EntityId=${hospitalID}&EntityType=Hospital`)
      .then((response) => {
        setOverallRating(response.data); // Set the fetched data into state
      })
      .catch((err) => {
        console.error('Rating fetch error:', err); // Log the error if the request fails
      });
  }, []);

  return (
    <div className="p-4">
       {/* Profile Section */}
        <button
          className="text-blue-600 font-medium hover:underline"
          onClick={() => navigate('/search/hospital')}
        >
          &lt; Back
        </button>
      <h1 className="text-3xl p-10 font-semibold text-center text-black">
        Hospital Details
      </h1>
      <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gradient-to-br from-gray-100 to-white min-h-screen">
       
        <div className="flex bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
          <div className="w-1/4">
            <img
              src={hp}
              alt="hospitalImg"
              className="rounded-2xl w-full h-full object-cover border border-blue-300 shadow"
            />
          </div>
          <div className="w-3/4 pl-8 flex flex-col justify-center">
           <h2 className="text-4xl font-bold text-blue-400 mb-2">
  {hospitalName
    ? `${hospitalName} (${hospitalCode})`
    : 'Loading Hospital Name...'}
</h2>

            
            <p className="text-lg font-medium text-blue-600">
              {hospitalType || 'Loading Hospital Type...'}
            </p>

            {/* Overall Rating */}
            <div className="mt-2 flex items-center gap-3">
              <div className="flex">{renderStars(overallRating)}</div>
              <span className="text-gray-700 font-semibold text-sm">
                {overallRating.toFixed(2)} / 5
              </span>
            </div>

            <p className="text-gray-700 mt-3 leading-relaxed text-justify">
              It is a modern 200-bed hospital offering cutting-edge services in
              cardiology, orthopedics, oncology, and emergency care. We believe
              in compassionate care and world-class medical infrastructure.
            </p>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branches */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          
    {hospitalAddresses.map((addr, index) => (
      <div
        key={addr.addressID || index}
       
      >
        <h4 className="text-2xl font-bold text-blue-500 mb-4">
          {addr.addressType} Address
        </h4>
        <p className="text-gray-800 text-md leading-relaxed">
          {addr.address1}
          {addr.address2 ? `, ${addr.address2}` : ''}
          <br />
          {addr.city}, {addr.district}
          <br />
          {addr.state} - {addr.zipCode}
        </p>
      </div>
    ))}
 
          </div>

          {/* Top Doctors */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-bold text-blue-500 mb-4">
              Top Doctors
            </h3>
            <ul className="space-y-2 text-gray-800 list-decimal pl-6">
              {doctors.map((doctor, index) => (
                <li key={index}>
                  {doctor.doctorName} –{' '}
                  {specializations[doctor.specializationID] || 'Specialization'}
                </li>
              ))}
            </ul>
          </div>

          {/* Specialties */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-bold text-blue-500 mb-4">
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Cardiology',
                'Orthopedics',
                'Oncology',
                'Neurology',
                'Pediatrics',
                'Radiology',
              ].map((spec, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-bold text-blue-500 mb-4">
              Infrastructure
            </h3>
            <p className="text-gray-800">
              Modern ICU, digital diagnostics, modular OTs, robotic surgery,
              24/7 emergency, cafeteria, pharmacy & more.
            </p>
          </div>
        </div>

        {/* Patient Reviews Section */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-blue-200">
  <h3 className="text-2xl font-bold text-blue-500 mb-6 pl-4">Patient Reviews</h3>

  {reviews.length === 0 ? (
    <p className="text-gray-600 pl-4">No reviews available.</p>
  ) : (
    <div className="relative">
      {/* Arrow Left - moved outside and aligned with card container */}
      <button
        onClick={() => setReviewPage((prev) => prev - 1)}
        disabled={reviewPage === 0}
        className="absolute -left-6 top-1/2 -translate-y-1/2 bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-full shadow disabled:opacity-40 z-10"
      >
        <FaChevronLeft />
      </button>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 pr-4">
        {reviews.slice(start, end).map((rev) => (
          <div
            key={rev.feedbackID}
            className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-4 mb-3">
              <img
                src={Profile}
                alt="Reviewer"
                className="w-12 h-12 rounded-full border shadow"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {getReviewerName(rev.reviewerName)}
                </p>
                <div className="text-yellow-500 flex gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                  {[...Array(5 - rev.rating)].map((_, i) => (
                    <FaStar key={`empty-${i}`} className="text-gray-300" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {rev.comments}
            </p>
          </div>
        ))}
      </div>

      {/* Arrow Right */}
      <button
        onClick={() => setReviewPage((prev) => prev + 1)}
        disabled={end >= reviews.length}
        className="absolute -right-6 top-1/2 -translate-y-1/2 bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-full shadow disabled:opacity-40 z-10"
      >
        <FaChevronRight />
      </button>
    </div>
  )}
</div>


      </div>
    </div>
  );
};

export default HospitalDetails;
