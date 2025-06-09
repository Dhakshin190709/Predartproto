
// import React from 'react';

// const AboutUs: React.FC = () => {
//   return (
//     <div
//       id="AboutUs"
//       className="relative bg-cover bg-center bg-no-repeat min-h-[500px] p-6 flex items-center justify-center"
//       style={{
//         backgroundImage:
//           "url('https://img.freepik.com/free-photo/health-still-life-with-copy-space_23-2148854034.jpg?ga=GA1.1.1703934121.1744029578&semt=ais_items_boosted&w=740')",
//       }}
//     >
//       {/* Centered Heading */}

//       <h2 className="absolute top-10 left-1/2 transform -translate-x-1/2 text-black text-4xl mb-5 text-center px-6 py-2 rounded-md">
//         {' '}
//         About Us
//       </h2>

//       {/* Right Side Paragraph Box */}
//       <div className="ml-auto w-full md:w-[60%] bg-white bg-opacity-80 rounded-lg px-8 py-4 text-gray-800 shadow-lg">
//         <p className="text-base md:text-lg leading-relaxed">
//           PreCare Hospital is dedicated to bringing quality healthcare to every
//           corner of society. Our expert medical team ensures personalized care
//           for every patient. We leverage technology to simplify appointment
//           booking and health management. From preventive checkups to chronic
//           care, we support your entire health journey. Transparency, compassion,
//           and efficiency define our commitment. Join us in shaping a healthier,
//           happier future with PreCare.
//         </p>
//         <button
//           className="bg-gradient-to-b from-[#004A99] to-[#007BFF] 
//         hover:from-[#007BFF] hover:to-[#004A99] text-white 
//         transition duration-150 ease-out hover:ease-in 
//         py-2 px-5 rounded-lg mt-5"
//         >
//           Download App
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AboutUs;













import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div
      id="AboutUs"
      className="relative bg-cover bg-center bg-no-repeat min-h-[450px] p-4 flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-photo/health-still-life-with-copy-space_23-2148854034.jpg?ga=GA1.1.1703934121.1744029578&semt=ais_items_boosted&w=740')",
      }}
    >
      {/* Centered Heading */}
      <h2 className="absolute top-8 left-1/2 transform -translate-x-1/2 text-black text-4xl text-center px-4 py-1 rounded-md">
  About Us
</h2>


      {/* Right Side Paragraph Box */}
      <div className="ml-auto w-full md:w-[50%] bg-white mt-14 bg-opacity-80 rounded-lg px-6 py-3 text-gray-800 shadow-lg">
        <p className="text-base md:text-lg leading-relaxed">
          PreCare Hospital is dedicated to bringing quality healthcare to every
          corner of society. Our expert medical team ensures personalized care
          for every patient. We leverage technology to simplify appointment
          booking and health management. From preventive checkups to chronic
          care, we support your entire health journey. Transparency, compassion,
          and efficiency define our commitment. Join us in shaping a healthier,
          happier future with PreCare.
        </p>
        <button
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] 
          hover:from-[#007BFF] hover:to-[#004A99] text-white 
          transition duration-150 ease-out hover:ease-in 
          py-2 px-5 rounded-lg mt-4"
        >
          Download App
        </button>
      </div>
    </div>
  );
};

export default AboutUs;
