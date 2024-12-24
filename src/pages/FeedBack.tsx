import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const FeedbackPage: React.FC = () => {
  const [ratingQ1, setRatingQ1] = useState<number>(0);
  const [ratingQ2, setRatingQ2] = useState<number>(0);
  const [suggestionQ1, setSuggestionQ1] = useState<string>('');
  const [suggestionQ2, setSuggestionQ2] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleRating = (question: number, index: number) => {
    if (question === 1) setRatingQ1(index + 1);
    if (question === 2) setRatingQ2(index + 1);
  };

  const handleSuggestionChange = (question: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (question === 1) setSuggestionQ1(event.target.value);
    if (question === 2) setSuggestionQ2(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you can handle the feedback submission (e.g., send to an API)
    setSubmitted(true);
  };

  return (
    <div className="feedback-page p-4 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      {submitted ? (
        <div className="thank-you-message text-center">
          <h2 className="text-2xl font-semibold mb-4">Thank you for your feedback!</h2>
          <p>Your feedback has been submitted successfully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-6 text-center">Feedback</h2>

          {/* Q1 */}
          <div className="question mb-6">
            <p className="text-lg font-medium mb-2">Q1: How would you rate the overall user experience?</p>
            {/* Rating Section for Q1 */}
            <div className="rating mb-4 flex gap-2">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`cursor-pointer ${index < ratingQ1 ? 'text-yellow-400' : 'text-gray-100'}`}
                  onClick={() => handleRating(1, index)}
                  size={24}
                />
              ))}
            </div>
            {/* Suggestions for Q1 */}
            <textarea
              value={suggestionQ1}
              onChange={(e) => handleSuggestionChange(1, e)}
              rows={4}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Any additional feedback or suggestions for improving user experience?"
            />
          </div>

          {/* Q2 */}
          <div className="question mb-6">
            <p className="text-lg font-medium mb-2">Q2: How satisfied are you with the product features?</p>
            {/* Rating Section for Q2 */}
            <div className="rating mb-4 flex gap-2">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`cursor-pointer ${index < ratingQ2 ? 'text-yellow-400' : 'text-gray-100'}`}
                  onClick={() => handleRating(2, index)}
                  size={24}
                />
              ))}
            </div>
            {/* Suggestions for Q2 */}
            <textarea
              value={suggestionQ2}
              onChange={(e) => handleSuggestionChange(2, e)}
              rows={4}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Any additional feedback or suggestions for improving product features?"
            />
          </div>

          {/* Submit Button */}
          <div className="submit-btn text-center">
            <button
              type="submit"
              className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                  hover:from-[#007BFF] hover:to-[#004A99]
                  text-white transition duration-150 
                  ease-out hover:ease-in py-2 px-5 rounded-lg"
              disabled={ratingQ1 === 0 || ratingQ2 === 0}
            >
              Submit Feedback
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FeedbackPage;
