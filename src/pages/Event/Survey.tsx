import React, { useState, useEffect } from "react";

const Survey: React.FC = () => {
  const [answers, setAnswers] = useState<any>({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });
  const [selectedSurvey, setSelectedSurvey] = useState<string>("");

  const [open, setOpen] = useState<number | null>(null);
  const [mandatoryAnswered, setMandatoryAnswered] = useState({
    basic: false,
    advanced: false,
  });

  const handleChange = (question: string, value: string) => {
    setAnswers({ ...answers, [question]: value });
  };

  const handleSubmit = () => {
    alert("Survey submitted! Here are your responses: " + JSON.stringify(answers));
  };

  const toggleAccordion = (index: number) => {
    setOpen(open === index ? null : index);
  };

  const checkSectionCompletion = (section: string) => {
    let allAnswered = false;
    if (section === "basic") {
      allAnswered = [answers.question1, answers.question2, answers.question3].every(
        (answer) => answer !== ""
      );
    } else if (section === "advanced") {
      allAnswered = [answers.question4, answers.question5].every(
        (answer) => answer !== ""
      );
    }
    return allAnswered;
  };

  useEffect(() => {
    const basicSectionCompleted = checkSectionCompletion("basic");
    const advancedSectionCompleted = checkSectionCompletion("advanced");

    setMandatoryAnswered({
      basic: basicSectionCompleted,
      advanced: advancedSectionCompleted,
    });
  }, [answers]);

  return (
    <div className="flex flex-col bg-gray-100 px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Survey </h1>
 {/* Dropdown for survey selection */}
 <div className="mb-6">
       
        <select
          value={selectedSurvey}
          onChange={(e) => setSelectedSurvey(e.target.value)}
          className="w-[40%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="" disabled>
            -- Select an Survey --
          </option>
          <option value="healthcare">Healthcare Survey</option>
          <option value="customer-service">Customer Service Survey</option>
          <option value="product-feedback">Product Feedback Survey</option>
        </select>
      </div>
      {/* Basic Section */}
      <div className="w-full bg-white shadow-md rounded-lg p-6 mb-4">
        <div
          onClick={() => toggleAccordion(1)}
          className={`w-full text-left p-4 cursor-pointer rounded-lg ${
            open === 1 ? "bg-gray-200" : "bg-blue-100 text-black"
          }`}
        >
          {/* Basic Section: No mandatory marker */}
          {mandatoryAnswered.basic && <span className="text-green-500">✔️</span>} Basic Section
        </div>
        {open === 1 && (
          <div className="flex flex-col space-y-4 p-4 bg-gray-50">
            <div className="mb-4">
              <div className="flex justify-between">
                <span>
                  How would you rate the quality of the medical care you received?{" "}
                </span>
                {answers.question1 && <span className="text-green-500">✔️</span>}
              </div>
              {["Very Bad", "Bad", "Average", "Good", "Very Good"].map((option) => (
                <label
                  key={option}
                  className="block mb-2"  // Added block to ensure each radio button and label appear on a new line
                >
                  <input
                    type="radio"
                    name="question1"
                    value={option}
                    checked={answers.question1 === option}
                    onChange={() => handleChange("question1", option)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between">
                <span>
                  How satisfied are you with the doctor's explanation of your condition?{" "}
                </span>
                {answers.question2 && <span className="text-green-500">✔️</span>}
              </div>
              {["Very Bad", "Bad", "Average", "Good", "Very Good"].map((option) => (
                <label
                  key={option}
                  className="block mb-2"  // Added block to ensure each radio button and label appear on a new line
                >
                  <input
                    type="radio"
                    name="question2"
                    value={option}
                    checked={answers.question2 === option}
                    onChange={() => handleChange("question2", option)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between">
                <span>
                  How comfortable were you with the hospital's facilities?{" "}
                </span>
                {answers.question3 && <span className="text-green-500">✔️</span>}
              </div>
              {["Very Bad", "Bad", "Average", "Good", "Very Good"].map((option) => (
                <label
                  key={option}
                  className="block mb-2"  // Added block to ensure each radio button and label appear on a new line
                >
                  <input
                    type="radio"
                    name="question3"
                    value={option}
                    checked={answers.question3 === option}
                    onChange={() => handleChange("question3", option)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Section */}
      <div className="w-full bg-white shadow-md rounded-lg p-6 mb-4">
        <div
          onClick={() => toggleAccordion(2)}
          className={`w-full text-left p-4 cursor-pointer rounded-lg ${
            open === 2 ? "bg-gray-200" : "bg-blue-100 text-black"
          }`}
        >
          {/* Advanced Section: Mandatory marker */}
          {mandatoryAnswered.advanced && <span className="text-green-500">✔️</span>} Advanced Section{" "}
          <span className="text-red-500 font-bold">*</span>
        </div>
        {open === 2 && (
          <div className="flex flex-col space-y-4 p-4 bg-gray-50">
            <div className="mb-4">
              <div className="flex justify-between">
                <span>
                  How would you rate the responsiveness of the medical staff?{" "}
                  <span className="text-red-500 font-bold">*</span>
                </span>
                {answers.question4 && <span className="text-green-500">✔️</span>}
              </div>
              {["Very Bad", "Bad", "Average", "Good", "Very Good"].map((option) => (
                <label
                  key={option}
                  className="block mb-2"  // Added block to ensure each radio button and label appear on a new line
                >
                  <input
                    type="radio"
                    name="question4"
                    value={option}
                    checked={answers.question4 === option}
                    onChange={() => handleChange("question4", option)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between">
                <span>
                  How satisfied were you with the overall treatment during your visit?{" "}
                  <span className="text-red-500 font-bold">*</span>
                </span>
                {answers.question5 && <span className="text-green-500">✔️</span>}
              </div>
              {["Very Bad", "Bad", "Average", "Good", "Very Good"].map((option) => (
                <label
                  key={option}
                  className="block mb-2"  // Added block to ensure each radio button and label appear on a new line
                >
                  <input
                    type="radio"
                    name="question5"
                    value={option}
                    checked={answers.question5 === option}
                    onChange={() => handleChange("question5", option)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-8"> {/* Increased margin top */}
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
            hover:from-[#007BFF] hover:to-[#004A99]
            text-white transition duration-150 
            ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Survey;
