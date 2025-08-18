import React, { useRef, useState, useEffect } from 'react';
import { PiDropHalfBold } from 'react-icons/pi';
import { FaHandHoldingMedical, FaStethoscope } from 'react-icons/fa';
import { TbCircle } from 'react-icons/tb';
import { GiHeartOrgan } from 'react-icons/gi';
import { MdBloodtype } from 'react-icons/md';
import { RiMentalHealthFill } from 'react-icons/ri';
import { BiSolidInjection } from 'react-icons/bi';

interface LabCardProps {
  title: string;
  testsIncluded: string;
  price: number;
  originalPrice: number;
  discount: string;
  memberPrice?: number;
  icon: React.ReactNode;
}

const LabCard: React.FC<LabCardProps> = ({
  title,
  testsIncluded,
  price,
  originalPrice,
  discount,
  memberPrice,
  icon,
}) => (
  <div className="flex-shrink-0 w-1/3 px-2">
    <div className="border border-blue-300 rounded-xl p-4 bg-white space-y-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 flex items-center justify-center rounded-md bg-blue-50 text-blue-500 text-3xl">
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-900">{testsIncluded}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
        ₹{price}
        <span className="line-through text-gray-400 text-sm font-normal">
          ₹{originalPrice}
        </span>
        <span className="text-green-600 text-sm font-medium">
          {discount} off
        </span>
      </div>

      {memberPrice && (
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-orange-700 font-medium bg-orange-100 px-2 py-1 rounded-md w-fit gap-1">
            <TbCircle className="text-orange-600 text-base" />
            Member price ₹{memberPrice}
          </div>
          <button className="bg-blue-600 text-white font-medium rounded-md px-6 py-1.5 hover:bg-blue-500">
            Add
          </button>
        </div>
      )}
    </div>
  </div>
);

const labTests = [
  {
    title: 'CBC Test (Complete Blood Count)',
    testsIncluded: '30 Tests Included',
    price: 478,
    originalPrice: 637,
    discount: '25%',
    memberPrice: 382,
    icon: <PiDropHalfBold size={30} />,
  },
  {
    title: 'HbA1c Test (Hemoglobin A1c)',
    testsIncluded: '3 Tests Included',
    price: 763,
    originalPrice: 1017,
    discount: '25%',
    memberPrice: 610,
    icon: <FaHandHoldingMedical size={40} />,
  },
  {
    title: 'Full Body Checkup',
    testsIncluded: '75 Tests Included',
    price: 1299,
    originalPrice: 1799,
    discount: '28%',
    memberPrice: 999,
    icon: <FaStethoscope size={35} />,
  },
  {
    title: 'Heart Health Package',
    testsIncluded: '8 Tests Included',
    price: 899,
    originalPrice: 1200,
    discount: '25%',
    memberPrice: 749,
    icon: <GiHeartOrgan size={35} />,
  },
  {
    title: 'Thyroid Test',
    testsIncluded: '3 Tests Included',
    price: 299,
    originalPrice: 400,
    discount: '25%',
    memberPrice: 225,
    icon: <MdBloodtype size={35} />,
  },
  {
    title: 'Mental Wellness Package',
    testsIncluded: '5 Tests Included',
    price: 559,
    originalPrice: 749,
    discount: '25%',
    memberPrice: 419,
    icon: <RiMentalHealthFill size={35} />,
  },
  {
    title: 'Vitamin D Test',
    testsIncluded: '1 Test Included',
    price: 649,
    originalPrice: 899,
    discount: '28%',
    memberPrice: 499,
    icon: <BiSolidInjection size={35} />,
  },
];

const LabTest = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  const totalItems = labTests.length;
  const itemsPerView = 3;
  const maxIndex = Math.ceil(totalItems / itemsPerView) - 1;

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth',
      });
    }
    setScrollIndex(index);
  };

  return (
    <div id="LabTest" className="p-6 space-y-6 max-w-7xl mx-auto py-20">
      <h1 className="text-black text-center text-4xl">Lab Tests</h1>
      <p className="text-black mt-3 mb-5 text-center">
        Accurate Diagnostics, Reliable Results!
      </p>

      <h2 className="p-3 text-xl font-semibold text-gray-900">
        Top Booked Searches
      </h2>

      <div className="relative overflow-hidden">
        {scrollIndex > 0 && (
          <button
            onClick={() => scrollToIndex(scrollIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
          >
            &lt;
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex transition-all duration-500"
          style={{
            scrollBehavior: 'smooth',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {labTests.map((test, idx) => (
            <LabCard key={idx} {...test} />
          ))}
        </div>

        {scrollIndex < maxIndex && (
          <button
            onClick={() => scrollToIndex(scrollIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-blue-100"
          >
            &gt;
          </button>
        )}
      </div>
    </div>
  );
};

export default LabTest;
