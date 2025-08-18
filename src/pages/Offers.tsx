import React, { useState } from 'react';

const CollapsibleSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div
      className={`w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary mb-4 transition-transform duration-300 ease-in-out ${isZoomed ? 'scale-105' : 'scale-100'}`}
    >
      <div
        className="flex justify-between items-center bg-gray-100 p-4 cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          toggleZoom();
        }}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <button className="text-xl">{isOpen ? '-' : '+'}</button>
      </div>
      {isOpen && <div className="p-4 bg-gray-50">{children}</div>}
    </div>
  );
};

const Offers = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Main Heading */}
      <h1 className="text-3xl font-bold mb-6 text-center">Offers</h1>

      {/* Collapsible Sections in Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Medicine Section with two specific offer boxes */}
        <div className="col-span-1">
          <CollapsibleSection title="Medicine">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">Painkiller Discount</h4>
                <div className="bg-green-200 text-green-800 p-2 rounded-lg">
                  15% Off
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">Vitamin Supplement Coupon</h4>
                <div className="bg-blue-200 text-blue-800 p-2 rounded-lg">
                  Coupon
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Lab Section with two specific offer boxes */}
        <div className="col-span-1">
          <CollapsibleSection title="Lab">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">Blood Test Discount</h4>
                <div className="bg-green-200 text-green-800 p-2 rounded-lg">
                  15% Off
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">MRI Scan Coupon</h4>
                <div className="bg-blue-200 text-blue-800 p-2 rounded-lg">
                  Coupon
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Payment Section with two specific offer boxes */}
        <div className="col-span-1">
          <CollapsibleSection title="Payment">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">Early Payment Discount</h4>
                <div className="bg-green-200 text-green-800 p-2 rounded-lg">
                  15% Off
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">Online Payment Coupon</h4>
                <div className="bg-blue-200 text-blue-800 p-2 rounded-lg">
                  Coupon
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Cosmetics Section with two specific offer boxes */}
        <div className="col-span-1">
          <CollapsibleSection title="Cosmetics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">Skin Care Discount</h4>
                <div className="bg-green-200 text-green-800 p-2 rounded-lg">
                  15% Off
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">Hair Care Coupon</h4>
                <div className="bg-blue-200 text-blue-800 p-2 rounded-lg">
                  Coupon
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

      </div>
    </div>
  );
};

export default Offers;
