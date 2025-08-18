import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Timing {
  Morning: { BF: boolean; AF: boolean };
  Afternoon: { BF: boolean; AF: boolean };
  Night: { BF: boolean; AF: boolean };
}

interface TabletInfo {
  id: number;
  tablet: string;
  tabletTimings: Timing;
  tabletDays: number;
  count: number;
}

interface TonicInfo {
  id: number;
  tonic: string;
  tonicTimings: Timing;
  tonicDays: number;
  ml: string;
}

const MedicalPrescription: React.FC = () => {
  const navigate = useNavigate();
  const [tabletInfo, setTabletInfo] = useState<TabletInfo[]>([
    {
      id: 1,
      tablet: 'Paracetamol',
      tabletTimings: {
        Morning: { BF: false, AF: false },
        Afternoon: { BF: false, AF: false },
        Night: { BF: false, AF: false },
      },
      tabletDays: 5,
      count: 10,
    },
  ]);

  const handleSubmit = () => {
    navigate('/prescription', {
      state: {
        entries: rows, // Passing the rows data to the PrescriptionAnswers page
      },
    });
  };

  const medicationOptions = {
    tablet: ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Losartan'],
    tonic: ['Vitamin C', 'Iron Syrup', 'Antacid'],
    injection: ['Insulin', 'Penicillin'],
    bandage: ['Cotton Bandage', 'Elastic Bandage'],
  };

  const [tonicInfo, setTonicInfo] = useState<TonicInfo[]>([
    {
      id: 1,
      tonic: '',
      tonicTimings: {
        Morning: { BF: false, AF: false },
        Afternoon: { BF: false, AF: false },
        Night: { BF: false, AF: false },
      },
      tonicDays: 0,
      ml: '',
    },
  ]);

  const location = useLocation();

  const calculateCount = (timings: Timing, days: number) => {
    const selectedTimings = Object.values(timings).reduce(
      (sum, time) => sum + (time.BF ? 1 : 0) + (time.AF ? 1 : 0),
      0,
    );
    return selectedTimings * days;
  };

  const [rows, setRows] = useState([
    {
      id: 1,
      type: '',
      name: '',
      timings: {
        Morning: { BF: false, AF: false },
        Afternoon: { BF: false, AF: false },
        Night: { BF: false, AF: false },
      },
      days: '',
      count: 0,
    },
  ]);

  // const handleViewAnswers = () => {
  //   navigate('/PrescriptionAnswers', {
  //     state: {
  //       tablets: tabletInfo,
  //       tonics: tonicInfo,
  //     },
  //   });
  // };
  const handleInputChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, [field]: value, ...(field === 'type' && { name: '' }) }
          : row,
      ),
    );
  };
  const handleCheckboxChange = (id, time, key, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              timings: {
                ...row.timings,
                [time]: { ...row.timings[time], [key]: value },
              },
            }
          : row,
      ),
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: '',
        name: '',
        timings: {
          Morning: { BF: false, AF: false },
          Afternoon: { BF: false, AF: false },
          Night: { BF: false, AF: false },
        },
        days: '',
        count: 0,
      },
    ]);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-gray-400 shadow-md">
        <div className="text-center font-semibold" style={{ color: '#bcc2be' }}>
          Patient Name: Priya | Date: 2024-12-05 | Appointment Date: 2024-12-08
        </div>
      </div>
      <br />
      <div className="flex mb-4">
        {/* Problem Input with 40% width */}
        <div className="w-2/5 mr-4">
          <input
            id="problem"
            type="text"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
      text-black outline-none focus:border-primary dark:border-form-strokedark
      dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter problem"
          />
        </div>

        {/* Description Input with remaining width */}
        <div className="w-3/5">
          <input
            id="description"
            type="text"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
      text-black outline-none focus:border-primary dark:border-form-strokedark
      dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter description"
          />
        </div>
      </div>

      <div className="space-y-6">
        {rows.map((row) => (
          <div
            key={row.id}
            className="border border-stroke rounded-lg p-4 shadow-md space-y-4 bg-gray-50"
          >
            {/* Main Row Container */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* First Dropdown: Type */}
              <div className="flex-shrink-0 w-[15%]">
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6
            text-black outline-none focus:border-primary"
                  value={row.type || ''}
                  onChange={(e) =>
                    handleInputChange(row.id, 'type', e.target.value)
                  }
                >
                  <option value="">Select Type</option>
                  <option value="tablet">Tablet</option>
                  <option value="tonic">Tonic</option>
                  <option value="injection">Injection</option>
                  <option value="bandage">Bandage</option>
                </select>
              </div>

              {/* Second Dropdown: Name */}
              <div className="flex-shrink-0 w-[35%]">
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6
            text-black outline-none focus:border-primary"
                  value={row.name || ''}
                  onChange={(e) =>
                    handleInputChange(row.id, 'name', e.target.value)
                  }
                >
                  <option value="">Select {row.type || 'Name'}</option>
                  {medicationOptions[row.type]?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timings (only show if type is not "bandage") */}
              {row.type !== 'bandage' && (
                <div className="flex flex-1 gap-4 w-[20%]">
                  {['Morning', 'Afternoon', 'Night'].map((time) => (
                    <div key={time} className="flex flex-col items-start w-1/3">
                      <label className="font-medium mb-1">{time}</label>
                      <div className="flex items-center gap-4">
                        {['BF', 'AF'].map((key) => (
                          <div key={key} className="flex flex-col items-center">
                            <span className="text-sm mb-1">{key}</span>
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              onChange={(e) =>
                                handleCheckboxChange(
                                  row.id,
                                  time,
                                  key,
                                  e.target.checked,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Days Input */}
              <div className="flex-shrink-0 w-[10%]">
                <input
                  type="number"
                  placeholder="Days"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6
            text-black outline-none focus:border-primary"
                  value={row.days || ''}
                  onChange={(e) =>
                    handleInputChange(row.id, 'days', e.target.value)
                  }
                />
              </div>

              {/* Count/ML Input */}
              <div className="flex-shrink-0 w-[10%]">
                {row.type === 'tonic' ? (
                  <input
                    type="text"
                    placeholder="ml"
                    className="w-full rounded-lg border border-stroke bg-gray-200 py-3 pl-4 pr-6
              text-black outline-none focus:border-primary"
                    value={row.count || ''}
                    onChange={(e) =>
                      handleInputChange(row.id, 'count', e.target.value)
                    }
                  />
                ) : (
                  <input
                    type="number"
                    placeholder="Count"
                    className="w-full rounded-lg border border-stroke bg-gray-200 py-3 pl-4 pr-6
              text-black outline-none focus:border-primary"
                    value={row.count || ''}
                    readOnly={
                      row.type === 'injection' || row.type === 'bandage'
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Row Button */}

        <div className="flex items-center justify-end gap-1">
          {/* Clickable Icon */}
          <div
            className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
            onClick={addRow}
          >
            +
          </div>

          {/* Non-clickable Text */}
          <span className="text-sm font-medium text-black-600">Add</span>
        </div>
      </div>

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
  );
};
export default MedicalPrescription;
