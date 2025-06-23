// import React from 'react';

// const AboutUs: React.FC = () => {
//   return (
//     <div
//       id="AboutUs"
//       className="relative bg-cover bg-center bg-no-repeat min-h-[450px] p-4 flex items-center justify-center"
//       style={{
//         backgroundImage:
//           "url('https://img.freepik.com/free-photo/health-still-life-with-copy-space_23-2148854034.jpg')",
//         backgroundSize: 'cover', // ensures full coverage
//         backgroundPosition: 'center', // centers image
//         backgroundRepeat: 'no-repeat',
//       }}
//     >
//       {/* Centered Heading */}
//       <h2 className="absolute top-8 left-1/2 transform -translate-x-1/2 text-black text-4xl text-center px-4 py-1 rounded-md">
//         About Us
//       </h2>

//       {/* Right Side Paragraph Box */}
//       <div className="ml-auto w-full md:w-[50%] bg-white mt-14 bg-opacity-80 rounded-lg px-6 py-3 text-gray-800 shadow-lg">
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
//           hover:from-[#007BFF] hover:to-[#004A99] text-white 
//           transition duration-150 ease-out hover:ease-in 
//           py-2 px-5 rounded-lg mt-4"
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
      className="relative bg-cover bg-center bg-no-repeat min-h-[450px] p-4 flex items-center justify-start mt-5" // ✅ moved content to right
      style={{
        backgroundImage:
          "url('https://t4.ftcdn.net/jpg/01/33/33/41/360_F_133334155_X23HzbJKawbIgXVaub4bPM8CjpkS5uMS.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl max-w-2xl shadow-xl ml-4 md:ml-16">
        {' '}
        {/* ← margin added */} {/* added margin-right */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#003366] mb-4">
          About Our Hospital
        </h2>
        <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
          Welcome to <strong>PreCare Hospital</strong>, your trusted destination
          for quality healthcare. Our expert medical team delivers personalized
          care with compassion. From preventive checkups to chronic care, we
          support your entire health journey using modern technology for
          seamless appointment booking and health management. Trust,
          transparency, and care define our mission to shape a healthier future.
        </p>
        <button className="bg-gradient-to-r from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white font-medium px-6 py-2 rounded-lg transition duration-200">
          Download App
        </button>
      </div>
    </div>
  );
};

export default AboutUs;

