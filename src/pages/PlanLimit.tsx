import React, { useEffect, useState } from 'react';
import api from '../api/request';

interface PricePlan {
  pricePlanID: string;
  planName: string;
  planCode: string;
  isActive: boolean;
}
interface Feature {
  featureID: string;
  featureName: string;
}

const PricePlanDropdown: React.FC = () => {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
const [features, setFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/PricePlan');
        if (response.data.success && Array.isArray(response.data.data)) {
          const activePlans = response.data.data.filter((plan: PricePlan) => plan.isActive);
          setPlans(activePlans);
        }
      } catch (error) {
        console.error('Failed to fetch price plans', error);
      }
    };

    fetchPlans();
  }, []);
 useEffect(() => {
  const fetchFeatures = async () => {
    try {
      const response = await api.get('/PlanFeature');
      if (response.data.success && Array.isArray(response.data.data)) {
        setFeatures(response.data.data); // ✅ Use the `data` array inside the response
      } else {
        setFeatures([]); // fallback if something goes wrong
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  fetchFeatures();
}, []);


  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlan(event.target.value);
  };
const handleCheckboxChange = (featureName) => {
    setSelectedFeatures((prevSelected) =>
      prevSelected.includes(featureName)
        ? prevSelected.filter((name) => name !== featureName)
        : [...prevSelected, featureName]
    );
  };
  return (
    <div>
    <h2 className="mb-9 text-2xl font-semibold text-black sm:text-2xl">
       Plan Limit
      </h2>
      <select id="plan-select" value={selectedPlan} onChange={handleChange}
       className="w-[40] rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input dark:text-white"
     
      
      >
        <option value="">-- Select a Plan --</option>
        {plans.map(plan => (
          <option key={plan.pricePlanID} value={plan.pricePlanID}>
            {plan.planName}
          </option>
        ))}
      </select>
        <div>
      <h1 className="mb-4 text-xl font-bold text-gray-800 mt-4 dark:text-white">
        Select Plan Features
      </h1>
      <div>
        {features.map((feature) => (
          <label key={feature.featureID} className="block">
            <input
              type="checkbox"
              checked={selectedFeatures.includes(feature.featureName)}
              onChange={() => handleCheckboxChange(feature.featureName)}
              className="mr-2"
            />
            {feature.featureName}
          </label>
        ))}
      </div>
    </div>
    </div>
  );
};

export default PricePlanDropdown;
