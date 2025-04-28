import React, { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { BiChevronDown } from 'react-icons/bi';
import Dermatologist from './Dermatologist';
import Dentist from './Dentist';
import Pediatrician from './Pediatrician';

const specializations = [
  'Dermatologist',
  'Pediatrician',
  'Gynecologist/Obstetrician',
  'Dentist',
  'Cardiologist',
  'Neurologist',
  'Pulmonologist',
  'Gastroenterologist',
  'Nephrologist',
  'Endocrinologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Orthopedic Doctor',
  'Oncologist',
  'Psychiatrist',
  'Urologist',
  'Hematologist',
  'Radiologist',
  'Anesthesiologist',
];

const locations = ['Chennai', 'Bangalore', 'Mumbai', 'Delhi'];

const FindDoctor = () => {
  const [countries, setCountries] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(
    null,
  );
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState<string[]>([]);
  const [showSpecializationDropdown, setShowSpecializationDropdown] =
    useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // New state to track search input focus

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name')
      .then((response) => response.json())
      .then((data) =>
        setCountries(data.map((country: any) => country.name.common)),
      )
      .catch((error) => console.error('Error fetching countries:', error));
  }, []);

  const handleSpecialistSelection = (specialist: string) => {
    setSelectedSpecialist(specialist);
    setSearchTerm(specialist);
    setFilteredResults([]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredResults([]);
    } else {
      const results = specializations.filter((specialist) =>
        specialist.toLowerCase().includes(term.toLowerCase()),
      );
      setFilteredResults(results);
    }
  };

  return (
    <div id="FindDoctor" className=" px-4 pt-4">
      <div
        className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: "url('/doctor-bg.jpg')" }}
      >
        <div className="max-w-screen-xl pt-5 pb-20 py-20 ">
          <div className="container">
            <div className="max-w-screen-xl mx-auto">
              <div className="text-center mt-0 mb-5">
                <h2 className="text-black text-center text-4xl">
                  Find Doctors
                </h2>
                <p className="text-black mt-3 mb-10 text-center">
                  Your Health, Our Priority!
                </p>
              </div>

              <div className="flex items-center max-w-7xl mb-10 rounded-md w-full justify-center mx-auto">
                <div className="relative flex items-center pr-4 w-1/2 ">
                  <div
                    className={`flex items-center px-4 py-4 space-x-2 cursor-pointer border rounded-md w-full ${
                      openDropdown ? 'border-blue-800' : 'border-gray-300'
                    }`}
                    onClick={() => setOpenDropdown(!openDropdown)}
                  >
                    <FaMapMarkerAlt className="text-gray-500 text-xs" />
                    <span className="text-gray-700">{selectedLocation}</span>
                    <BiChevronDown size={20} />
                  </div>
                  {openDropdown && (
                    <ul className="absolute left-0 mt-2 bg-white shadow-lg max-h-60 overflow-y-auto w-[200px] z-10 rounded-md">
                      {[...locations, ...countries].map((loc) => (
                        <li
                          key={loc}
                          className="p-2 text-sm hover:bg-blue-600 hover:text-white cursor-pointer "
                          onClick={() => {
                            setSelectedLocation(loc);
                            setOpenDropdown(false);
                          }}
                        >
                          {loc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="h-12 w-[1px] bg-black-300"></div>

                <div className="relative w-1/2">
                  <div
                    className={`flex items-center p-2 shadow-sm rounded-md border w-full ${
                      isSearchFocused ? 'border-blue-800' : 'border-gray-300'
                    }`} // Dynamic border color based on focus
                  >
                    <FaSearch className="text-gray-500 ml-2 " />
                    <input
                      type="text"
                      placeholder="Search doctors, clinics, hospitals"
                      value={searchTerm}
                      onChange={handleSearch}
                      onFocus={() => setIsSearchFocused(true)} // Set focus state
                      onBlur={() => setIsSearchFocused(false)} // Set blur state
                      className="w-full px-3 py-2 outline-none text-gray-700 bg-transparent"
                    />
                  </div>
                  {filteredResults.length > 0 && (
                    <ul className="absolute mt-2 bg-white shadow-md w-full rounded-md max-h-60 overflow-y-auto z-10">
                      {filteredResults.map((item) => (
                        <li
                          key={item}
                          className="p-2 text-sm hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleSpecialistSelection(item)}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="w-full max-w-7xl bg-blue-200 text-black px-6 py-4 flex gap-25 items-center flex-wrap rounded-md">
                <span className="font-semibold">Popular searches:</span>
                {specializations.slice(0, 4).map((specialist) => (
                  <button
                    key={specialist}
                    onClick={() => handleSpecialistSelection(specialist)}
                    className="hover:underline focus:outline-none"
                  >
                    {specialist}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setShowSpecializationDropdown(!showSpecializationDropdown)
                  }
                  className="hover:underline focus:outline-none"
                >
                  Others
                </button>
              </div>

              {showSpecializationDropdown && (
                <div className="bg-white shadow-lg p-4 rounded-md w-full max-w-md mx-auto overflow-y-auto max-h-60 mt-2">
                  <h3 className="font-semibold mb-2">All Specializations:</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {specializations.map((spec) => (
                      <li
                        key={spec}
                        className="p-2 text-sm hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          handleSpecialistSelection(spec);
                          setShowSpecializationDropdown(false);
                        }}
                      >
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSpecialist === 'Dermatologist' && <Dermatologist />}
              {selectedSpecialist === 'Dentist' && <Dentist />}
              {selectedSpecialist === 'Pediatrician' && <Pediatrician />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDoctor;


