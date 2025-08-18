import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const MAX_COMMENT_LENGTH = 500;
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api/request';
const FeedbackSection = ({
  title,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
}: {
  title: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  comment: string;
  onCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">{title}</h3>
      <div className="mb-3">
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => onRatingChange(r)}
            className={`text-2xl mx-1 transition ${
              rating >= r ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        maxLength={MAX_COMMENT_LENGTH}
        placeholder="Write your feedback here"
        value={comment}
        onChange={onCommentChange}
        className="w-full h-28 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
      />
      <div className="text-right text-sm text-gray-500">
        {comment.length}/{MAX_COMMENT_LENGTH}
      </div>
    </div>
  );
};

const Feedback: React.FC = () => {
  const [roleName, setRoleName] = useState<string | null>(null);
  const [hospitalRating, setHospitalRating] = useState(0);
  const [doctorRating, setDoctorRating] = useState(0);
  const [appRating, setAppRating] = useState(0);
  const location = useLocation();
  const { hospitalID, hospitalName, doctorID, doctorName } =
    location.state || {};
  const [hospitalComment, setHospitalComment] = useState('');
  const [doctorComment, setDoctorComment] = useState('');
  const [appComment, setAppComment] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const storedRole = sessionStorage.getItem('roleName');
    setRoleName(storedRole);
  }, []);

  const isPatient = roleName === 'Patient';

  const isSubmitDisabled = isPatient
    ? !hospitalRating &&
      !doctorRating &&
      !appRating &&
      !hospitalComment &&
      !doctorComment &&
      !appComment
    : !appRating && !appComment;



const handleSubmit = async () => {
  const userName = sessionStorage.getItem('username') || 'Anonymous';
  const userID = sessionStorage.getItem('userID') || '00000000-0000-0000-0000-000000000000';

  const feedbackData: any[] = [];

  if (isPatient && hospitalRating > 0) {
    feedbackData.push({
      reviewerName: userName,
      entityType: 'Hospital',
      entityID: hospitalID,
      rating: hospitalRating,
      comments: hospitalComment,
      createdBy: userID,
      updatedBy: userID,
      isActive: true
    });
  }

  if (isPatient && doctorRating > 0) {
    feedbackData.push({
      reviewerName: userName,
      entityType: 'Doctor',
      entityID: doctorID,
      rating: doctorRating,
      comments: doctorComment,
      createdBy: userID,
      updatedBy: userID,
      isActive: true
    });
  }

  if (appRating > 0) {
    feedbackData.push({
      reviewerName: userName,
      entityType: 'CarePointPro',
      entityID: null,
      rating: appRating,
      comments: appComment,
      createdBy: userID,
      updatedBy: userID,
      isActive: true
    });
  }

  try {
     const response = await api.post('/Feedback', feedbackData);

 if (typeof response.data === 'string' && response.data.toLowerCase().includes('success')) {
      toast.success('Feedback submitted successfully!');
    } else {
      toast.success('Feedback saved.');
    }

  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    toast.error('Something went wrong. Please try again.');
  }
};




  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <button
          className="text-blue-600 font-medium hover:underline mb-4"
          onClick={() => navigate('/search/appointment')}
        >
          &lt; Back
        </button>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Share your feedback
        </h2>
        <p className="text-gray-600 mb-8">
          We value your feedback. Share your thoughts with us on how we can
          improve our app to better suit your needs.
        </p>

        {isPatient && (
          <FeedbackSection
            title={`Hospital: ${hospitalName || 'N/A'}`}
            rating={hospitalRating}
            onRatingChange={setHospitalRating}
            comment={hospitalComment}
            onCommentChange={(e) => setHospitalComment(e.target.value)}
          />
        )}

        {isPatient && (
          <FeedbackSection
            title={`Doctor: ${doctorName || 'N/A'}`}
            rating={doctorRating}
            onRatingChange={setDoctorRating}
            comment={doctorComment}
            onCommentChange={(e) => setDoctorComment(e.target.value)}
          />
        )}

        <FeedbackSection
  title="CarePointPro Application"
  rating={appRating}
  onRatingChange={setAppRating}
  comment={appComment}
  onCommentChange={(e) => setAppComment(e.target.value)}
/>

        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full py-3 rounded-full text-white font-semibold text-lg transition ${
            isSubmitDisabled
              ? 'bg-blue-200 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Submit
        </button>
      </div>
       <ToastContainer position='top-right' autoClose={3000} />
    </div>
  );
};

export default Feedback;
