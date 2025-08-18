import React from "react";

interface TimelineStep {
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
}

const HealthcareTimeline = () => {
  const timeline: TimelineStep[] = [
    {
      title: "Appointment Scheduled",
      description: "Appointment scheduled with Dr. Smith.",
      date: "Mon, 1st Jan '24",
      time: "10:00 AM",
      completed: true,
    },
    {
      title: "Consultation Completed",
      description: "Consultation completed. Follow-up lab tests recommended.",
      date: "Mon, 1st Jan '24",
      time: "11:00 AM",
      completed: true,
    },
    {
      title: "Lab Tests Ordered",
      description: "Blood test and X-ray ordered.",
      date: "Tue, 2nd Jan '24",
      time: "09:00 AM",
      completed: true,
    },
    {
      title: "Lab Tests Completed",
      description: "Lab tests completed. Reports uploaded to the portal.",
      date: "Tue, 2nd Jan '24",
      time: "02:00 PM",
      completed: true,
    },
    {
      title: "Prescription Issued",
      description: "Doctor issued a prescription for medications.",
      date: "Wed, 3rd Jan '24",
      time: "10:00 AM",
      completed: false,
    },
  ];

  return (
    <div className="bg-white min-h-screen p-6">
      <h1 className="text-2xl font-bold text-black-800 mb-6">Healthcare Timeline</h1>
      <div className="relative">
        {timeline.map((step, index) => (
          <div key={index} className="flex items-start relative">
            {/* Vertical Line */}
            <div className="relative flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-4 h-4 rounded-full z-10 ${
                  step.completed ? "bg-green-500" : "bg-green-200"
                }`}
              ></div>
              {/* Line */}
              {index < timeline.length - 1 && (
                <div
                  className={`w-[2px] ${
                    timeline[index].completed && timeline[index + 1].completed
                      ? "bg-green-500"
                      : "bg-green-200"
                  }`}
                  style={{
                    height: "4rem", // Increased height here
                    marginTop: "4px",
                  }}
                ></div>
              )}
            </div>

            {/* Step Content */}
            <div className="ml-6">
              <h3
                className={`text-lg font-semibold ${
                  step.completed ? "text-green-600" : "text-blue-400"
                }`}
              >
                {step.title}
              </h3>
              <p className="text-sm text-blue-500">{step.description}</p>
              <p className="text-sm text-blue-300">
                {step.date} - {step.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthcareTimeline;
