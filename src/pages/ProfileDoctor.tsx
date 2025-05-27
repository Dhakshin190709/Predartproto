import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  Calendar,
  IdCard,
  BadgeIndianRupee,
  GraduationCap,
  Stethoscope,
} from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Profile from '../images/icon/profile.svg';
import api from '../api/request';
interface DoctorProfileData {
  doctorID: string;
  tenantID: string;
  hospitalID: string;
  doctorName: string;
  doctorDateOfBirth: string;
  doctorEmail: string;
  doctorPhoneNumber: string;
  qualificationID: string;
  specializationID: string;
  genderID: string;
  aadhaarNumber: string;
  panNumber: string;
  createdBy: string;
  createdOn: string;
  updatedBy: string | null;
  updatedOn: string;
  isActive: boolean;
}
interface AppLOV {
  appLOVID: string;
  type: string;
  name: string;
}

interface DoctorEducation {
  educationID: string;
  doctorID: string;
  graduateID: string;
  degreeName: string;
  specializationID: string;
  location: string;
  universityName: string;
  startDate: string;
  endDate: string;
  isHighestEducation: boolean;
  isActive: boolean;
}
interface DoctorLanguage {
  languageID: string;
  languageMasterID: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}
type Experience = {
  employmentType: string;
  specializationID: string;
  hospitalName: string;
  joinDate: string;
  leaveDate: string;
};

interface DoctorSkill {
  skillMasterID: string;
  yearOfExperience: number;
  monthOfExperience: number;
  description: string;
}

interface DoctorAward {
  awardID: string;
  awardName: string;
  awardYear: number;
  description: string;
}

interface Review {
  id: number;
  name: string;
  date: string;
  rating: number;
  comment: string;
  image: string;
}
const DoctorProfilePage = () => {
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [educationList, setEducationList] = useState<DoctorEducation[]>([]);
  const [loading, setLoading] = useState(true);
  const [qualifications, setQualifications] = useState<AppLOV[]>([]);
  const [specializations, setSpecializations] = useState<AppLOV[]>([]);
  const [doctorLanguages, setDoctorLanguages] = useState<DoctorLanguage[]>([]);
  const [languageMaster, setLanguageMaster] = useState<AppLOV[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [awards, setAwards] = useState<DoctorAward[]>([]);
  const [skills, setSkills] = useState<DoctorSkill[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2;
  const navigate = useNavigate();
  const startIdx = currentPage * itemsPerPage;
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const location = useLocation();
  const doctorID = location.state?.doctorID;
  const [doctorData, setDoctorData] = useState(null);
  const nextPage = () => {
    if (startIdx + itemsPerPage < reviews.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  const [reviews, setReviews] = useState<Review[]>([]);

  const currentReviews = (reviews || []).slice(
    startIdx,
    startIdx + itemsPerPage,
  );
  const getQualificationName = (id: string) => {
    return qualifications.find((q) => q.appLOVID === id)?.name || 'N/A';
  };

  const getSpecializationName = (id: string) => {
    return specializations.find((s) => s.appLOVID === id)?.name || 'N/A';
  };

  const getLanguageName = (languageMasterID: string) => {
    return (
      languageMaster.find((lang) => lang.appLOVID === languageMasterID)?.name ||
      'Unknown'
    );
  };

  const getWorkTypeName = (id: string) => {
    const match = workTypes.find((item: any) => item.appLOVID === id);
    return match ? match.name : 'N/A';
  };

  useEffect(() => {
    api
      .get('/AppLOV?type=Worktype')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setWorkTypes(res.data.data); // Set only the array of data
        } else {
          console.warn('Invalid Worktype data received.');
        }
      })
      .catch((error) => {
        console.error('Failed to fetch work types:', error);
      });
  }, []);

  useEffect(() => {
    if (doctorID) {
      api
        .get(`/Doctor/GetDoctorAward?doctorId=${doctorID}`)
        .then((res) => {
          const data = res.data;
          console.log('Award API response:', data);

          if (
            data?.success &&
            Array.isArray(data.data) &&
            data.data.length > 0
          ) {
            setAwards(data.data);
            console.log('Awards set to state:', data.data);
          } else {
            console.warn('No awards found or response error.');
          }
        })
        .catch((err) => {
          console.error('Error fetching doctor awards:', err);
        });
    } else {
      console.warn('doctorId not found.');
    }
  }, [doctorID]);

  useEffect(() => {
    if (doctorID) {
      api
        .get(`/Doctor/GetLanguage?doctorId=${doctorID}`)
        .then((res) => {
          if (res.data.success) {
            setDoctorLanguages(res.data.data || []);
          }
        })
        .catch((err) => console.error('Error fetching doctor languages:', err));

      api
        .get(`/AppLOV?type=languageMaster`)
        .then((res) => {
          if (res.data.success) {
            setLanguageMaster(res.data.data || []);
          }
        })
        .catch((err) => console.error('Error fetching language master:', err));
    }
  }, [doctorID]);

  useEffect(() => {
    const fetchLOVs = async () => {
      try {
        const [qualRes, specRes] = await Promise.all([
          api.get('/AppLOV?type=Qualification'),
          api.get('/AppLOV?type=Specializations'),
        ]);
        setQualifications(qualRes.data.data || []);
        setSpecializations(specRes.data.data || []);
      } catch (err) {
        console.error('Error loading LOVs:', err);
      }
    };

    const fetchDoctorDetails = async () => {
      try {
        const [profileRes, eduRes] = await Promise.all([
          api.get(`/Doctor/${doctorID}`),
          api.get(`/Doctor/GetDoctorEducation?doctorId=${doctorID}`),
        ]);

        if (profileRes.data.success) {
          setProfile(profileRes.data.data);
        }

        if (eduRes.data.success) {
          setEducationList(eduRes.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching doctor profile or education:', err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorID) {
      fetchDoctorDetails();
      fetchLOVs();
    } else {
      console.warn('No doctorID in session storage');
      setLoading(false);
    }
  }, [doctorID]);

  useEffect(() => {
    if (!doctorID) {
      console.warn('No doctorID found in session storage.');
      setLoading(false);
      return;
    }

    const fetchProfile = api.get(`/Doctor/${doctorID}`);
    const fetchEducation = api.get(
      `/Doctor/GetDoctorEducation?doctorId=${doctorID}`,
    );

    Promise.all([fetchProfile, fetchEducation])
      .then(([profileRes, educationRes]) => {
        if (profileRes.data.success) {
          setProfile(profileRes.data.data);
        }

        if (
          educationRes.data.success &&
          Array.isArray(educationRes.data.data)
        ) {
          setEducationList(educationRes.data.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => setLoading(false));
  }, [doctorID]);

  useEffect(() => {
    if (!doctorID) {
      console.error('No doctorID found in session');
      return;
    }

    api
      .get(`/Doctor/GetDoctorExprience?doctorId=${doctorID}`)
      .then((response) => {
        if (response.data.success) {
          setExperience(response.data.data || []);
        } else {
          console.error('Failed to fetch doctor experience');
        }
      })
      .catch((error) => {
        console.error('Error fetching doctor experience:', error);
      });
  }, [doctorID]);

  useEffect(() => {
    if (!doctorID) {
      console.warn('doctorId not found in session storage.');
      return;
    }

    api
      .get(`/Doctor/GetDoctorSkill?doctorId=${doctorID}`)
      .then((res) => {
        console.log('API response:', res.data);
        const data = res.data;
        if (data.success && Array.isArray(data.data)) {
          const uniqueSkills: DoctorSkill[] = Array.from(
            new Map(
              data.data.map((item: DoctorSkill) => [
                (item.description || '').trim(),
                item,
              ]),
            ).values(),
          );

          const sortedSkills = uniqueSkills.sort((a, b) => {
            const aMonths = a.yearOfExperience * 12 + a.monthOfExperience;
            const bMonths = b.yearOfExperience * 12 + b.monthOfExperience;
            return bMonths - aMonths;
          });

          setSkills(sortedSkills);
        } else {
          console.warn('No skills found or error in response.');
        }
      })
      .catch((err) => console.error('Error fetching doctor skills:', err));
  }, [doctorID]);

  useEffect(() => {
    if (!doctorID) {
      console.warn('doctorId not found in session storage.');
      return;
    }

    const fetchDoctorRating = async () => {
      try {
        // Axios returns the response data in res.data directly
        const res = await api.get(
          `/Feedback/Rating?EntityId=${doctorID}&EntityType=Doctor`,
        );
        // Since API returns plain number as text, convert to float
        setAverageRating(parseFloat(res.data));
      } catch (error) {
        console.error('Failed to fetch doctor rating', error);
      }
    };

    if (doctorID) {
      fetchDoctorRating();
    }
  }, [doctorID]);

  useEffect(() => {
    if (!doctorID) {
      console.warn('doctorId not found in session storage.');
      return;
    }
    const fetchReviews = async () => {
      try {
        const response = await api.get<ApiResponse[]>(
          `/Feedback?EntityId=${doctorID}&EntityType=Doctor`,
        );

        const transformed = response.data.map((item) => ({
          id: item.feedbackID,
          name: item.reviewerName,
          comment: item.comments,
          date: new Date(item.createdOn).toLocaleDateString(),
          rating: item.rating,
        }));

        setReviews(transformed);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    fetchReviews();
  }, [doctorID]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold text-black mb-6">Doctor Details</h1>
      <div className="w-full p-6 bg-white text-gray-900 rounded-xl shadow-lg space-y-8">
        {/* Back Button */}
        <button
          className="text-blue-600 font-medium hover:underline mb-4"
          onClick={() => navigate('/search/doctors')}
        >
          &lt; Back
        </button>
        {loading ? (
          <div className="text-center text-gray-500">Loading profile...</div>
        ) : profile ? (
          <div className="space-y-8">
            {/* Profile Section */}

            <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl shadow-md border border-blue-300">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center md:items-start md:w-1/4">
                  <img
                    src={Profile}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border shadow"
                  />

                  {averageRating !== null && (
                    <div className="mt-4 text-center md:text-left">
                      <p className="text-lg text-yellow-600 font-semibold">
                        Overall Rating: {averageRating.toFixed(1)} / 5
                      </p>
                      <div className="text-xl text-yellow-500">
                        {'★'.repeat(Math.round(averageRating))}
                        {'☆'.repeat(5 - Math.round(averageRating))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider Line */}
                <div className="hidden md:block w-px bg-gray-300 mx-2" />

                {/* Profile Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-base text-gray-700">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <p className="text-lg">
                      <strong>Name:</strong> {profile.doctorName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-200" />
                    <p className="text-lg">
                      <strong>Email:</strong> {profile.doctorEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-200" />
                    <p className="text-lg">
                      <strong>Phone:</strong> {profile.doctorPhoneNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-200" />
                    <p className="text-lg">
                      <strong>Date of Birth:</strong>{' '}
                      {formatDate(profile.doctorDateOfBirth)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-gray-500" />
                    <p className="text-lg">
                      <strong>Qualification:</strong>{' '}
                      {getQualificationName(profile.qualificationID)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-gray-500" />
                    <p className="text-lg">
                      <strong>Specialization:</strong>{' '}
                      {getSpecializationName(profile.specializationID)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <IdCard className="w-5 h-5 text-gray-500" />
                    <p className="text-lg">
                      <strong>Aadhaar Number:</strong> {profile.aadhaarNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeIndianRupee className="w-5 h-5 text-gray-600" />
                    <p className="text-lg">
                      <strong>PAN Number:</strong> {profile.panNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Education Section */}

            <div className="bg-white shadow-md rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">
                Education Details
              </h3>

              {educationList.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full table-auto text-md text-gray-700">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-md tracking-wide">
                      <tr>
                        <th className="px-5 py-3 text-left">Qualification</th>
                        <th className="px-5 py-3 text-left">Specialization</th>
                        <th className="px-5 py-3 text-left">University</th>
                        <th className="px-5 py-3 text-left">Location</th>
                        <th className="px-5 py-3 text-left">Start Date</th>
                        <th className="px-5 py-3 text-left">End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(
                        new Map(
                          educationList.map((edu) => [
                            `${edu.graduateID}-${edu.specializationID}-${edu.universityName.toLowerCase().trim()}-${edu.startDate}-${edu.endDate}`,
                            edu,
                          ]),
                        ).values(),
                      ).map((edu) => (
                        <tr
                          key={edu.educationID}
                          className="border-t hover:bg-gray-50 transition duration-200"
                        >
                          <td className="px-5 py-3">
                            {getQualificationName(edu.graduateID)}
                          </td>
                          <td className="px-5 py-3">
                            {getSpecializationName(edu.specializationID)}
                          </td>
                          <td className="px-5 py-3">{edu.universityName}</td>
                          <td className="px-5 py-3">{edu.location}</td>
                          <td className="px-5 py-3">
                            {new Date(edu.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3">
                            {new Date(edu.endDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No education records found.
                </p>
              )}
            </div>

            {/* languages */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Languages Known */}
              <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">
                  Languages Known
                </h3>
                <div className="mt-2">
                  {doctorLanguages.length > 0 ? (
                    <div>
                      {doctorLanguages.map((lang) => (
                        <div
                          key={lang.languageID}
                          className="mb-4 flex items-center justify-start gap-6"
                        >
                          {/* Language Name */}
                          <p className="text-gray-800 text-md font-semibold">
                            {getLanguageName(lang.languageMasterID)}
                          </p>

                          {/* Read Ability */}
                          <span
                            className={`flex items-center ${
                              lang.read ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {lang.read ? '🟢 Read' : '🔴 Read'}
                          </span>

                          {/* Write Ability */}
                          <span
                            className={`flex items-center ${
                              lang.write ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {lang.write ? '🟢 Write' : '🔴 Write'}
                          </span>

                          {/* Speak Ability */}
                          <span
                            className={`flex items-center ${
                              lang.speak ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {lang.speak ? '🟢 Speak' : '🔴 Speak'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No language data available.
                    </p>
                  )}
                </div>
              </div>

              {/* Doctor Experience */}
              <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">
                  Experience
                </h3>
                {experience.length > 0 ? (
                  experience.map((exp) => (
                    <div key={exp.hospitalName} className="mb-6">
                      <h4 className="text-2xl font-semibold">
                        {exp.hospitalName}
                      </h4>

                      <div className="grid grid-cols-2 gap-x-6 mt-4">
                        {/* Specialization & Employment Type */}
                        <div className="flex flex-col">
                          <p className="text-lg text-gray-600 font-medium">
                            Specialization:{' '}
                            <span>
                              {getSpecializationName(exp.specializationID)}
                            </span>
                          </p>
                          <p className="text-lg text-gray-600 font-medium">
                            Employment Type:{' '}
                            <span>{getWorkTypeName(exp.employmentType)}</span>
                          </p>
                        </div>

                        {/* Join Date & Leave Date */}
                        <div className="flex flex-col">
                          <p className="text-lg text-gray-600 font-medium">
                            Join Date:{' '}
                            <span>
                              {new Date(exp.joinDate).toLocaleDateString()}
                            </span>
                          </p>
                          <p className="text-lg text-gray-600 font-medium">
                            Leave Date:{' '}
                            <span>
                              {new Date(exp.leaveDate).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No experience data available.
                  </p>
                )}
              </div>
            </div>

            {/* skills */}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Skills Section */}
              <div className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">
                  Skills
                </h3>
                {skills.length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-800 space-y-4 text-lg">
                    {skills.map((skill) => (
                      <li key={skill.skillMasterID}>
                        <div className="font-semibold">{skill.description}</div>
                        <div className="text-md text-gray-600">
                          Experience: {skill.yearOfExperience} year
                          {skill.yearOfExperience !== 1 ? 's' : ''},{' '}
                          {skill.monthOfExperience} month
                          {skill.monthOfExperience !== 1 ? 's' : ''}
                        </div>
                        <p className="text-md text-gray-600">
                          Specialization:{' '}
                          {getSpecializationName(skill.skillMasterID)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-md text-gray-500">
                    No skills found for this doctor.
                  </p>
                )}
              </div>

              {/* Awards Section */}
              <div className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">
                  Awards
                </h3>
                {awards.length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-800 space-y-4 text-lg">
                    {awards.map((award) => (
                      <li key={award.awardID}>
                        <div className="font-semibold">
                          {award.awardName} ({award.awardYear})
                        </div>
                        <p className="text-md text-gray-600">
                          {award.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-md text-gray-500">
                    No awards found for this doctor.
                  </p>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-8 bg-gray-100 py-8 px-4 rounded-xl">
              <h3 className="text-2xl font-bold text-center text-blue-600 mb-4">
                Our Patients Reviews
              </h3>
              <p className="text-center text-sm text-gray-600 mb-8">
                Number of Feedbacks {reviews.length}
              </p>

              <div className="flex justify-between items-center">
                {/* Previous Button */}
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="p-2 rounded-full bg-white shadow hover:bg-gray-200 disabled:opacity-50"
                >
                  ◀
                </button>

                {/* Testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow mx-4">
                  {currentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-6 rounded-lg shadow-lg"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={Profile}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex justify-between w-full items-center">
                          <div>
                            <h4 className="text-lg font-bold text-gray-800">
                              {review.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {review.date}
                            </p>
                          </div>
                          <div className="text-yellow-500 text-lg">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </div>
                        </div>
                      </div>
                      <p className="text-md text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={nextPage}
                  disabled={startIdx + itemsPerPage >= reviews.length}
                  className="p-2 rounded-full bg-white shadow hover:bg-gray-200 disabled:opacity-50"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">
            Doctor profile not found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfilePage;
