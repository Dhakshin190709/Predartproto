import { useState } from "react";
import { motion } from "framer-motion";
import React from "react";
const plans = [
  { name: "Elite", price: "$99/month", description: "Best for professionals who need advanced features and support." },
  { name: "Gold", price: "$79/month", description: "Great for growing businesses with essential premium features." },
  { name: "Silver", price: "$59/month", description: "Ideal for individuals looking for budget-friendly access." },
  { name: "Premium", price: "$49/month", description: "A balanced plan with good features at an affordable price." },
  { name: "Basic", price: "$29/month", description: "Entry-level plan with limited but essential features." },
];

export default function SubscriptionPage() {
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index + 2 < plans.length) setIndex(index + 2);
  };

  const prev = () => {
    if (index - 2 >= 0) setIndex(index - 2);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="flex gap-8 overflow-hidden">
        {plans.slice(index, index + 2).map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-80 p-6 text-center shadow-xl rounded-3xl border border-blue-100 bg-white hover:shadow-2xl transition-all"
          >
            <h2 className="text-2xl font-bold text-blue-600">{plan.name}</h2>
            <p className="text-xl text-gray-700 font-semibold mt-2">{plan.price}</p>
            <p className="text-gray-500 mt-4 text-sm">{plan.description}</p>
            <button
              onClick={() => alert(`Selected: ${plan.name}`)}
              className="mt-6 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition-all"
            >
              Choose Plan
            </button>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex gap-6">
        <button
          onClick={prev}
          disabled={index === 0}
          className={`px-6 py-3 rounded-lg text-white font-bold shadow-md transition-all ${index === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={index + 2 >= plans.length}
          className={`px-6 py-3 rounded-lg text-white font-bold shadow-md transition-all ${index + 2 >= plans.length ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}