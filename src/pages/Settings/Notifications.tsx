import React, { useState } from "react";
import axios from "axios"; // Ensure axios is imported

const Notifications: React.FC = () => {
  const checkboxes = [
    "Email Notification",
    "Phone Notification",
    "SMS Notification",
    "App Notification",
    "Browser Notification",
    "Marketing Updates",
    "Security Alerts",
    "Account Updates",
    "Survey Requests",
    "Newsletter Subscription",
  ];

  // Initialize all preferences as false
  const [preferences, setPreferences] = useState(
    checkboxes.reduce((acc, label) => {
      acc[label.replace(/\s+/g, "")] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Handle checkbox state change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences((prevState) => ({
      ...prevState,
      [name]: checked, // Toggle the specific preference based on the checkbox clicked
    }));
  };

  const handlePreferencesSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const patientID = "12345"; // Example Patient ID (Replace with actual ID)
    const preferencesData = {
      patientID,
      ...preferences, // Spread preferences dynamically
      createdBy: "dd606a34-6e0a-4b0f-8cfd-8e9138267627", // Example creator ID
    };

    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Patient/SavePreferences",
        preferencesData
      );
      console.log("Preferences saved successfully:", response.data);
      alert("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handlePreferencesSubmit}>
      <h2 className="text-lg font-bold text-black-700 text-left">
        Preferences
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {checkboxes.map((label, index) => {
          const checkboxName = label.replace(/\s+/g, ""); // Remove spaces for consistency

          return (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name={checkboxName}
                checked={preferences[checkboxName] || false}
                onChange={handleCheckboxChange}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Save Preferences
      </button>
    </form>
  );
};

export default Notifications;
