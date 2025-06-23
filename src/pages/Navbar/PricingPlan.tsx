// import React, { useRef, useState, useEffect } from 'react';
// import { FaUser, FaHome, FaBuilding } from 'react-icons/fa';
// import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
// import api from '../../api/request';

// type PricePlan = {
//   pricePlanID: string;
//   planName: string;
//   planDescription: string;
//   monthlyPrice: number;
//   quarterlyPrice: number;
//   halfyearlyPrice: number;
//   yearlyPrice: number;
// };

// const iconMap: { [key: string]: JSX.Element } = {
//   Free: <FaUser className="text-green-600 text-2xl" />,
//   Basic: <FaHome className="text-blue-600 text-2xl" />,
//   Premium: <FaBuilding className="text-purple-600 text-2xl" />,
//   Advanced: <FaBuilding className="text-orange-600 text-2xl" />,
//   Enterpise: <FaBuilding className="text-red-600 text-2xl" />,
// };

// const PricingPlan: React.FC = () => {
//   const [plans, setPlans] = useState<PricePlan[]>([]);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [scrollIndex, setScrollIndex] = useState(0);

//   const itemsPerView = 3;
//   const maxIndex = Math.ceil(plans.length / itemsPerView) - 1;

//   useEffect(() => {
//     api
//       .get('/PricePlan')
//       .then((res) => {
//         if (res.data.success) {
//           setPlans(res.data.data);
//         }
//       })
//       .catch((err) => {
//         console.error('Failed to fetch plans:', err);
//       });
//   }, []);

//   const scrollToIndex = (index: number) => {
//     if (scrollRef.current) {
//       const containerWidth = scrollRef.current.offsetWidth;
//       scrollRef.current.scrollTo({
//         left: index * containerWidth,
//         behavior: 'smooth',
//       });
//     }
//     setScrollIndex(index);
//   };

//   return (
//     <div id="PricingPlan" className="min-h-[600px] bg-[#ededed] px-4 py-10">
//       <h2 className="text-black text-center text-4xl mt-10">Pricing Plan</h2>
//       <p className="text-black mt-3 mb-10 text-center">
//         💡 Affordable Care. Trusted Plans. Choose what suits you best.
//       </p>

//       <div className="relative overflow-hidden max-w-7xl mx-auto">
//         {scrollIndex > 0 && (
//           <button
//             onClick={() => scrollToIndex(scrollIndex - 1)}
//             className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
//           >
//             <MdChevronLeft size={24} />
//           </button>
//         )}

//         <div
//           ref={scrollRef}
//           className="flex transition-all duration-500 snap-x snap-mandatory overflow-x-auto hide-scrollbar"
//         >
//           {plans.map((plan, idx) => (
//             <div
//               key={plan.pricePlanID}
//               className="flex-shrink-0 w-[300px] snap-start px-2"
//             >
//               <div className="group rounded-2xl shadow-md p-5 flex flex-col justify-between bg-white border border-transparent transition-all duration-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:scale-105">
//                 <div className="flex items-center gap-2 mb-3">
//                   {iconMap[plan.planName] || (
//                     <FaUser className="text-gray-600 text-2xl" />
//                   )}
//                   <h3 className="text-xl font-bold">{plan.planName} Plan</h3>
//                 </div>

//                 <p className="text-2xl font-bold mb-3">
//                   ₹{plan.monthlyPrice}
//                   <span className="text-sm font-medium"> /monthly</span>
//                 </p>

//                 <ul className="space-y-2 text-sm mb-3">
//                   <li className="flex items-start">
//                     <span className="text-green-400 mr-2">✓</span>
//                     <span>Quarterly: ₹{plan.quarterlyPrice}</span>
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-green-400 mr-2">✓</span>
//                     <span>Half-Yearly: ₹{plan.halfyearlyPrice}</span>
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-green-400 mr-2">✓</span>
//                     <span>Yearly: ₹{plan.yearlyPrice}</span>
//                   </li>
//                 </ul>

//                 <div className="text-sm italic bg-blue-50 text-gray-700 p-2 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
//                   {plan.planDescription}
//                 </div>

//                 <button className="mt-4 w-full py-2 rounded-xl font-semibold bg-blue-600 text-white group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors duration-300">
//                   Choose Plan
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {scrollIndex < maxIndex && (
//           <button
//             onClick={() => scrollToIndex(scrollIndex + 1)}
//             className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
//           >
//             <MdChevronRight size={24} />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PricingPlan;


























// import React, { useRef, useState, useEffect } from 'react';
// import { FaUser, FaHome, FaBuilding } from 'react-icons/fa';
// import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
// import api from '../../api/request';

// type PricePlan = {
//   pricePlanID: string;
//   planName: string;
//   planDescription: string;
//   monthlyPrice: number;
//   quarterlyPrice: number;
//   halfyearlyPrice: number;
//   yearlyPrice: number;
// };

// const iconMap: { [key: string]: JSX.Element } = {
//   Free: <FaUser className="text-green-600 text-2xl" />,
//   Basic: <FaHome className="text-blue-600 text-2xl" />,
//   Premium: <FaBuilding className="text-purple-600 text-2xl" />,
//   Advanced: <FaBuilding className="text-orange-600 text-2xl" />,
//   Enterpise: <FaBuilding className="text-red-600 text-2xl" />,
// };

// const PricingPlan: React.FC = () => {
//   const [plans, setPlans] = useState<PricePlan[]>([]);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [scrollIndex, setScrollIndex] = useState(0);

//   const itemsPerView = 3;
//   const cardWidth = 320; // each card width including padding/margin
//   const gap = 16; // tailwind px-2 = 0.5rem = 8px on both sides

//   useEffect(() => {
//     api
//       .get('/PricePlan')
//       .then((res) => {
//         if (res.data.success) {
//           setPlans(res.data.data);
//         }
//       })
//       .catch((err) => {
//         console.error('Failed to fetch plans:', err);
//       });
//   }, []);

//   const scrollToIndex = (index: number) => {
//     if (scrollRef.current) {
//       const scrollAmount = (cardWidth + gap) * itemsPerView * index;
//       scrollRef.current.scrollTo({
//         left: scrollAmount,
//         behavior: 'smooth',
//       });
//     }
//     setScrollIndex(index);
//   };

//   const maxIndex = Math.ceil(plans.length / itemsPerView) - 1;

//   return (
//     <div id="PricingPlan" className="min-h-[600px] bg-[#ededed] px-4 py-10">
//       <h2 className="text-black text-center text-4xl mt-10">Pricing Plan</h2>
//       <p className="text-black mt-3 mb-10 text-center">
//         💡 Affordable Care. Trusted Plans. Choose what suits you best.
//       </p>

//       <div className="relative w-[1110px] mx-auto overflow-hidden">
//         {scrollIndex > 0 && (
//           <button
//             onClick={() => scrollToIndex(scrollIndex - 1)}
//             className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
//           >
//             <MdChevronLeft size={24} />
//           </button>
//         )}

//         <div
//           ref={scrollRef}
//           className="flex gap-4 overflow-hidden scroll-smooth"
//         >
//           {plans.map((plan, idx) => (
//             <div
//               key={plan.pricePlanID}
//               className="flex-shrink-0 w-[350px] px-2"
//             >
//               <div className="group rounded-2xl shadow-md p-6 min-h-[440px] flex flex-col justify-between bg-white border border-transparent transition-all duration-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:scale-105">
//                 <div className="flex items-center gap-2 mb-3">
//                   {iconMap[plan.planName] || (
//                     <FaUser className="text-gray-600 text-2xl" />
//                   )}
//                   <h3 className="text-xl font-bold">{plan.planName} Plan</h3>
//                 </div>

//                 <p className="text-2xl font-bold mb-3">
//                   ₹{plan.monthlyPrice}
//                   <span className="text-sm font-medium"> /monthly</span>
//                 </p>

//                 <ul className="space-y-2 text-[18px] mb-3">
//                   <li className="flex items-start">
//                     <span className="text-green-400 mr-2">✓</span>
//                     <span>Quarterly: ₹{plan.quarterlyPrice}</span>
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-green-400 mr-2">✓</span>
//                     <span>Half-Yearly: ₹{plan.halfyearlyPrice}</span>
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-green-400 mr-2">✓</span>
//                     <span>Yearly: ₹{plan.yearlyPrice}</span>
//                   </li>
//                 </ul>

//                 <div className="text-[16px] italic bg-blue-50 text-gray-700 p-2 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
//                   {plan.planDescription}
//                 </div>

//                 <button className="mt-4 w-full py-2 rounded-xl font-semibold bg-blue-600 text-white group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors duration-300">
//                   Choose Plan
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {scrollIndex < maxIndex && (
//           <button
//             onClick={() => scrollToIndex(scrollIndex + 1)}
//             className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
//           >
//             <MdChevronRight size={24} />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PricingPlan;

























import React, { useRef, useState, useEffect } from 'react';
import { FaUser, FaHome, FaBuilding } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import api from '../../api/request';

type PlanLimit = {
  featureName: string;
  limitValue: number;
};

type PricePlan = {
  pricePlanID: string;
  planName: string;
  planDescription: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  halfyearlyPrice: number;
  yearlyPrice: number;
  limits: PlanLimit[];
};

const iconMap: { [key: string]: JSX.Element } = {
  Free: <FaUser className="text-green-600 text-2xl" />,
  Basic: <FaHome className="text-blue-600 text-2xl" />,
  Premium: <FaBuilding className="text-purple-600 text-2xl" />,
  Advanced: <FaBuilding className="text-orange-600 text-2xl" />,
  Enterpise: <FaBuilding className="text-red-600 text-2xl" />,
};

const PricingPlan: React.FC = () => {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  const itemsPerView = 3;
  const cardWidth = 350;
  const gap = 16;

  useEffect(() => {
    api
      .get('/PricePlan/PlanDetails')
      .then((res) => {
        if (res.data.success) {
          setPlans(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch plan details:', err);
      });
  }, []);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const scrollAmount = (cardWidth + gap) * itemsPerView * index;
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
    setScrollIndex(index);
  };

  const maxIndex = Math.ceil(plans.length / itemsPerView) - 1;

  return (
    <div id="PricingPlan" className="min-h-[600px] bg-[#ededed] px-4 py-10">
      <h2 className="text-black text-center text-4xl mt-10">Pricing Plan</h2>
      <p className="text-black mt-3 mb-10 text-center">
        💡 Affordable Care. Trusted Plans. Choose what suits you best.
      </p>

      <div className="relative w-[1080px] mx-auto overflow-hidden">
        {scrollIndex > 0 && (
          <button
            onClick={() => scrollToIndex(scrollIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
          >
            <MdChevronLeft size={24} />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-hidden scroll-smooth"
        >
          {plans.map((plan) => (
            <div
              key={plan.pricePlanID}
              className="flex-shrink-0 w-[350px] px-2 h-[620px]"
            >
              <div className="group rounded-2xl shadow-md p-6 h-full min-h-[620px] flex flex-col justify-between bg-white border border-transparent transition-all duration-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:scale-105">
                {/* Top Section */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {iconMap[plan.planName] || (
                      <FaUser className="text-gray-600 text-2xl" />
                    )}
                    <h3 className="text-xl font-bold">{plan.planName} Plan</h3>
                  </div>

                  <p className="text-2xl font-bold">
                    ₹{plan.monthlyPrice}
                    <span className="text-sm font-medium"> /monthly</span>
                  </p>

                  <ul className="space-y-2 text-[17px] mt-2 mb-4">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Quarterly: ₹{plan.quarterlyPrice}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Half-Yearly: ₹{plan.halfyearlyPrice}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Yearly: ₹{plan.yearlyPrice}</span>
                    </li>
                  </ul>

                  {/* Included Features */}
                  {plan.limits?.length > 0 && (
                    <div className="bg-blue-50 text-gray-800 rounded-lg p-3 text-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <p className="font-semibold mb-2">Included Features:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.limits.map((limit, index) => (
                          <li key={index}>
                            {limit.featureName}: {limit.limitValue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Section */}
                <div>
                  <div className="text-[16px] italic bg-blue-100 text-gray-800 p-3 rounded-md mt-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    {plan.planDescription}
                  </div>

                  <button className="mt-4 w-full py-2 rounded-xl font-semibold bg-blue-600 text-white group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors duration-300">
                    Choose Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {scrollIndex < maxIndex && (
          <button
            onClick={() => scrollToIndex(scrollIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
          >
            <MdChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PricingPlan;
