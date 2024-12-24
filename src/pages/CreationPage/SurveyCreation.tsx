import React, { useState } from "react";

const SurveyCreation = () => {
  const [formData, setFormData] = useState({
    surveyName: "",
    hostName: "",
    organizationName: "",
    hostEmail: "",
    hostMobile: "",
  });

  const [domainInputVisible, setDomainInputVisible] = useState(false);
  const [questionInputVisible, setQuestionInputVisible] = useState(false);

  const [domainTitle, setDomainTitle] = useState("");
  const [domains, setDomains] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  const [questionName, setQuestionName] = useState(""); // State for question name
  const [optionInput, setOptionInput] = useState("");
  const [currentOptions, setCurrentOptions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  const handleDomainSave = () => {
    if (domainTitle.trim()) {
      setDomains([...domains, domainTitle]);
      setDomainTitle("");
      setDomainInputVisible(false);
    }
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setCurrentOptions([...currentOptions, optionInput]);
      setOptionInput("");
    }
  };

  const handleQuestionSave = () => {
    if (selectedDomain && questionName.trim() && currentOptions.length > 0) {
      const newQuestion = {
        domain: selectedDomain,
        question: questionName,
        options: currentOptions,
      };
      setQuestions([...questions, newQuestion]);
      setQuestionName(""); // Reset question name
      setCurrentOptions([]); // Reset options
      setSelectedDomain(""); // Reset selected domain
      setQuestionInputVisible(false); // Hide question section
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Survey Creation</h1>

      {/* Survey Details */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="surveyName"
            value={formData.surveyName}
            onChange={handleChange}
            placeholder="Survey Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            name="hostName"
            value={formData.hostName}
            onChange={handleChange}
            placeholder="Host Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Organization Name"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="email"
            name="hostEmail"
            value={formData.hostEmail}
            onChange={handleChange}
            placeholder="Host Email"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="tel"
            name="hostMobile"
            value={formData.hostMobile}
            onChange={handleChange}
            placeholder="Host Mobile"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Save
        </button>
      </form>

      {/* Add Domain and Questions Buttons */}
      <div className="mt-6 space-x-4">
        <button
          onClick={() => setDomainInputVisible(true)}
          className="bg-gray-200 py-2 px-4 rounded-lg"
        >
          Add Domain
        </button>
        <button
          onClick={() => setQuestionInputVisible(true)}
          className="bg-gray-200 py-2 px-4 rounded-lg"
        >
          Add Questions
        </button>
      </div>

      {/* Add Domain Section */}
      {domainInputVisible && (
        <div className="mt-4 flex items-center space-x-4">
          <input
            type="text"
            value={domainTitle}
            onChange={(e) => setDomainTitle(e.target.value)}
            placeholder="Domain Title"
            className="w-full max-w-[60%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input
              dark:text-white dark:focus:border-primary"
          />
          <button
            onClick={handleDomainSave}
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
          >
            Save Domain
          </button>
        </div>
      )}

      {/* Add Questions Section */}
      {questionInputVisible && (
        <div className="mt-4">
          {/* Select Domain Dropdown */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full max-w-[60%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input
              dark:text-white dark:focus:border-primary"
          >
            <option value="" disabled>
              Select Domain
            </option>
            {domains.map((domain, idx) => (
              <option key={idx} value={domain}>
                {domain}
              </option>
            ))}
          </select>

          {/* Question Name Input */}
          <div className="mt-4">
            <input
              type="text"
              value={questionName}
              onChange={(e) => setQuestionName(e.target.value)}
              placeholder="Enter Question Name"
              className="w-full max-w-[60%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input
                dark:text-white dark:focus:border-primary"
            />
          </div>

          {/* Render Current Options */}
          <div className="space-y-2 mt-4">
            {currentOptions.map((option, idx) => (
              <div key={idx} className="flex items-center">
                <input
                  type="radio"
                  name={`option-${idx}`}
                  className="form-radio mr-2"
                />
                <span>{option}</span>
              </div>
            ))}
          </div>

          {/* Option Input and Action Buttons */}
          <div className="flex items-center space-x-4 mt-4">
            <input
              type="text"
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              placeholder="Add Option"
              className="w-full max-w-[60%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input
                dark:text-white dark:focus:border-primary"
            />
            <button
              onClick={addOption}
            className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer
       bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
            >
              <span className="text-2xl">+</span> {/* Add Option button */}
            </button>
            <button
              onClick={handleQuestionSave}
              className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]
                text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
            >
              Save Question
            </button>
          </div>
        </div>
      )}

      {/* Render Domains and Questions */}
      <div className="mt-6">
        {domains.map((domain, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-lg font-bold">{`Domain: ${domain}`}</h2>
            {questions
              .filter((q) => q.domain === domain)
              .map((q, qIdx) => (
                <div key={qIdx} className="ml-6">
                  <p className="font-semibold">Question: {q.question}</p>
                  <ul>
                    {q.options.map((opt, optIdx) => (
                      <li key={optIdx} className="ml-6 flex items-center">
                        <input
                          type="radio"
                          name={`question-${idx}-${qIdx}`}
                          value={opt}
                          className="form-radio mr-2"
                        />
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyCreation;
