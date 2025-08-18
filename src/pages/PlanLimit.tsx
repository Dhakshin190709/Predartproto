import React, { useEffect, useState } from 'react';
import api from '../api/request';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import CustomButton from '../components/CustomButton';

interface PricePlan {
  pricePlanID: string;
  planName: string;
  planCode: string;
  isActive: boolean;
}

interface Feature {
  planFeatureID: string;
  featureName: string;
}

const PricePlanDropdown: React.FC = () => {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [existingLimits, setExistingLimits] = useState<{
    [key: string]: string;
  }>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [featureEntries, setFeatureEntries] = useState([
    { featureID: '', limit: '', isActive: true },
  ]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/PricePlan');
        if (response.data.success && Array.isArray(response.data.data)) {
          const activePlans = response.data.data.filter(
            (plan: PricePlan) => plan.isActive,
          );
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
          setFeatures(response.data.data);
        } else {
          setFeatures([]);
        }
      } catch (error) {
        console.error('Error fetching features:', error);
      }
    };

    fetchFeatures();
  }, []);

  useEffect(() => {
    const fetchPlanLimits = async () => {
      if (!selectedPlan) return;

      try {
        const response = await api.get(
          `/PlanLimit?PricePlanID=${selectedPlan}`,
        );
        if (response.data.success && Array.isArray(response.data.data)) {
          const planLimits = response.data.data;

          const limitMap: { [key: string]: string } = {};
          const formattedEntries = planLimits.map((limit: any) => {
            limitMap[limit.planFeatureID] = limit.planLimitID;
            return {
              featureID: limit.planFeatureID,
              limit: String(limit.limitValue),
              isActive: limit.isActive ?? true,
            };
          });

          setFeatureEntries(formattedEntries);
          setSelectedFeatures(planLimits.map((x: any) => x.planFeatureID));
          setExistingLimits(limitMap);
        } else {
          setFeatureEntries([{ featureID: '', limit: '', isActive: true }]);
          setExistingLimits({});
        }
      } catch (error) {
        console.error('Failed to fetch plan limits:', error);
        setFeatureEntries([{ featureID: '', limit: '', isActive: true }]);
        setExistingLimits({});
      }
    };

    fetchPlanLimits();
  }, [selectedPlan]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlan(event.target.value);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...featureEntries];
    updated[index].featureID = value;
    setFeatureEntries(updated);
    setErrors((prev) => ({ ...prev, [index]: '' }));
  };

  const handleLimitChange = (index: number, value: string) => {
    const updated = [...featureEntries];
    updated[index].limit = value;
    setFeatureEntries(updated);
    setErrors((prev) => ({ ...prev, [index]: '' }));
  };

  const handleToggleActive = async (index: number, newStatus: boolean) => {
  const updated = [...featureEntries];
  const entry = updated[index];

  const planLimitID = existingLimits[entry.featureID]; // get from your mapped state

  if (!planLimitID) {
    toast.error('Cannot update status for unsaved feature.');
    return;
  }

  const userID = sessionStorage.getItem('userID');
  const now = new Date().toISOString();

  try {
    const payload = {
      guidID: planLimitID,
      updatedBy: userID,
      updatedOn: now,
      isActive: newStatus,
    };

    const response = await api.put('/PlanLimit/UpdateStatus', payload);
    if (response.data.success) {
      updated[index].isActive = newStatus;
      setFeatureEntries(updated);
      toast.success(`Feature ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } else {
      toast.error('Failed to update status.');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    toast.error('Error updating active status.');
  }
};


  const handleAddFeature = () => {
    setFeatureEntries([
      ...featureEntries,
      { featureID: '', limit: '', isActive: true },
    ]);
  };

  const handleRemoveFeature = (index: number) => {
    const updated = [...featureEntries];
    updated.splice(index, 1);
    setFeatureEntries(updated);
  };

  const handleSave = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan.');
      return;
    }

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      toast.error('User ID is missing.');
      return;
    }

    const now = new Date().toISOString();

    const newPayload: any[] = [];
    const updatePayload: any[] = [];

    for (const entry of featureEntries) {
      const payload = {
        createdBy: userID,
        createdOn: now,
        updatedBy: userID,
        updatedOn: now,
        isActive: entry.isActive,
        pricePlanID: selectedPlan,
        planFeatureID: entry.featureID,
        limitValue: Number(entry.limit),
      };

      const planLimitID = existingLimits[entry.featureID];
      if (planLimitID) {
        updatePayload.push({ ...payload, planLimitID });
      } else {
        newPayload.push(payload);
      }
    }

    try {
      let created = false;
      let updated = false;

      if (newPayload.length > 0) {
        const postRes = await api.post('/PlanLimit', newPayload);
        if (postRes.data.success) created = true;
      }

      if (updatePayload.length > 0) {
        const putRes = await api.put('/PlanLimit', updatePayload);
        if (putRes.data.success) updated = true;
      }

      if (created && updated) {
        toast.success('Plan limits saved and updated successfully!');
      } else if (created) {
        toast.success('Plan limits saved successfully!');
      } else if (updated) {
        toast.success('Plan limits updated successfully!');
      } else {
        toast.info('No changes made.');
      }
    } catch (error) {
      console.error('Error saving/updating plan limits:', error);
      toast.error('Error saving/updating plan limits.');
    }
  };

  const selectedFeatureIDs = featureEntries.map((entry) => entry.featureID);

  return (
    <div>
      <h2 className="mb-9 text-2xl font-semibold text-black sm:text-2xl">
        Plan Limit
      </h2>

      {/* Plan Dropdown */}
      <select
        id="plan-select"
        value={selectedPlan}
        onChange={handleChange}
        className="w-full max-w-md rounded-lg border border-gray-300 py-3 px-4 text-black outline-none"
      >
        <option value="">-- Select a Plan --</option>
        {plans.map((plan) => (
          <option key={plan.pricePlanID} value={plan.pricePlanID}>
            {plan.planName}
          </option>
        ))}
      </select>

      {/* Features Section */}
      <div className="mt-6">
        <h1 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Select Plan Features
        </h1>

        <div className="space-y-4 max-w-md">
          {featureEntries.map((entry, index) => (
            <div className="grid grid-cols-[180px_1fr_auto] gap-4 items-start">
              {/* Feature Dropdown */}
              <select
                className="w-full rounded border border-gray-300 px-3 text-black py-2 outline-none"
                value={entry.featureID}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
              >
                <option value="">-- Select Feature --</option>
                {features.map((feature) => (
                  <option
                    key={feature.planFeatureID}
                    value={feature.planFeatureID}
                    disabled={
                      selectedFeatureIDs.includes(feature.planFeatureID) &&
                      feature.planFeatureID !== entry.featureID
                    }
                  >
                    {feature.featureName}
                  </option>
                ))}
              </select>

              {/* Limit Input */}
              <div className="flex flex-col">
                <input
                  type="number"
                  placeholder="Enter limit"
                  className="w-full rounded border border-gray-300 text-black px-3 py-2 outline-none"
                  value={entry.limit}
                  onChange={(e) => handleLimitChange(index, e.target.value)}
                />
                {errors[index] && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors[index]}
                  </span>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 mt-2">
  <span
    className={`text-sm font-medium ${
      entry.isActive ? 'text-green-600' : 'text-red-500'
    }`}
  >
    {entry.isActive ? 'Active' : 'Inactive'}
  </span>

  <button
    type="button"
    onClick={() => handleToggleActive(index, !entry.isActive)}
    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
      entry.isActive ? 'bg-green-500' : 'bg-red-500'
    }`}
  >
    <span
      className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
        entry.isActive ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
</div>

            </div>
          ))}

          {/* Add Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddFeature}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center text-xl shadow-md hover:scale-105 transition"
              title="Add Feature"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <CustomButton onClick={handleSave}>Save Plan Limits</CustomButton>
      </div>

      <ToastContainer />
    </div>
  );
};

export default PricePlanDropdown;
