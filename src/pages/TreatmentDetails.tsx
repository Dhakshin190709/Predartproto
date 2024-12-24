import React, { useState } from 'react';

const AccordionSection = ({ title, children, isOpen, onClick }: { title: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
  return (
    <div
      className={`w-full rounded-lg border border-stroke bg-transparent py-4 pl-4 pr-8
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary mb-4 transition-transform duration-300 ease-in-out`}
    >
      <div
        className={`flex justify-between items-center p-4 cursor-pointer ${
          isOpen ? 'bg-blue-300 text-white' : 'bg-gray-100'
        }`} // Conditional background color
        onClick={onClick}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <button className="text-xl">{isOpen ? '-' : '+'}</button>
      </div>
      {isOpen && <div className="p-4 bg-gray-50">{children}</div>}
    </div>
  );
};

const TreatmentDetails = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleToggle = (section: string) => {
    setOpenSection(openSection === section ? null : section); // Toggle the section or close it if already open
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Main Heading */}
      <h1 className="text-3xl font-bold mb-6 text-center">Patient Treatment Details</h1>

      {/* Accordion Sections (stacked vertically) */}
      <AccordionSection
        title="Basic Info"
        isOpen={openSection === 'basicInfo'}
        onClick={() => handleToggle('basicInfo')}
      >
        <p>Patient Name: John Doe</p>
        <p>Age: 45</p>
        <p>Gender: Male</p>
      </AccordionSection>

      <AccordionSection
        title="Appointment Details"
        isOpen={openSection === 'appointmentDetails'}
        onClick={() => handleToggle('appointmentDetails')}
      >
        <p>Appointment Number: 12345</p>
        <p>Date: 2024-12-12</p>
        <p>Doctor: Dr. Smith</p>
      </AccordionSection>

      <AccordionSection
        title="Medical History"
        isOpen={openSection === 'medicalHistory'}
        onClick={() => handleToggle('medicalHistory')}
      >
        <p>Previous Conditions: Hypertension</p>
        <p>Allergies: Penicillin</p>
      </AccordionSection>

      <AccordionSection
        title="Prescription Details"
        isOpen={openSection === 'prescriptionDetails'}
        onClick={() => handleToggle('prescriptionDetails')}
      >
        <p>Medication 1: Paracetamol 500mg - 3x/day</p>
        <p>Medication 2: Amoxicillin 250mg - 2x/day</p>
      </AccordionSection>

      <AccordionSection
        title="Treatment & Diet Plan"
        isOpen={openSection === 'treatmentDietPlan'}
        onClick={() => handleToggle('treatmentDietPlan')}
      >
        <p>Treatment: Physical Therapy for 2 weeks</p>
        <p>Diet: Low-sodium, low-fat diet</p>
      </AccordionSection>

      {/* New Payment Details Section */}
      <AccordionSection
        title="Payment Details"
        isOpen={openSection === 'paymentDetails'}
        onClick={() => handleToggle('paymentDetails')}
      >
        <p>Payment Status: Paid</p>
        <p>Amount: $200</p>
        <p>Payment Method: Credit Card</p>
      </AccordionSection>
    </div>
  );
};

export default TreatmentDetails;
