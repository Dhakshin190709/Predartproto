import React, { useEffect, useState } from "react";
import { FaFlask, FaMicroscope, FaRadiation, FaPhoneAlt,FaDirections,FaMapMarkerAlt,FaVial, FaXRay } from "react-icons/fa";

const SearchLab: React.FC = () => {
  const [labs, setLabs] = useState<any[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<any[]>([]);
  const [labFacilitiesMap, setLabFacilitiesMap] = useState<{ [key: string]: string }>({});
  const [searchParams, setSearchParams] = useState({
    labName: "",
    testType: "",
    labFacilities: "",
    labCode: "",
  });
 

  const getLabIcon = (labType: string) => {
    switch (labType.toLowerCase()) {
      case "pathology lab":
        return { icon: <FaMicroscope />, color: "#E67E22" }; // Orange
      case "radiology lab":
        return { icon: <FaRadiation />, color: "#8E44AD" }; // Purple
      case "biochemistry lab":
        return { icon: <FaVial />, color: "#27AE60" }; // Green
      case "x-ray lab":
        return { icon: <FaXRay />, color: "#f43ae6" }; // Pink
      default:
        return { icon: <FaFlask />, color: "#007BFF" }; // Default Blue
    }
  };

 
    const [expanded, setExpanded] = useState({});
  
    const toggleView = (index) => {
      setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
    };
  // Fetch AppLOV data and create a mapping (id → name)
  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV?type=facilitiestype")
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const mapping: { [key: string]: string } = {};
          data.data.forEach((facility: any) => {
            mapping[facility.appLOVID] = facility.name; // Store mapping
          });
          setLabFacilitiesMap(mapping);
        } else {
          console.error('Expected an array inside "data" but got:', data);
        }
      })
      .catch((error) => console.error("Error fetching AppLOV:", error));
  }, []);

  // Fetch Labs and replace labFacilities ID with the corresponding name
  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/Laboratory")
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const updatedLabs = data.data.map((lab: any) => ({
            ...lab,
            labFacilities: lab.labFacilities
              .split(",") // If multiple facilities are stored as comma-separated IDs
              .map((id: string) => labFacilitiesMap[id.trim()] || id) // Replace ID with name
              .join(", "),
          }));
          setLabs(updatedLabs);
          setFilteredLabs(updatedLabs); // Initialize filteredLabs
        } else {
          console.error("Expected an array inside 'data' but got:", data);
        }
      })
      .catch((error) => console.error("Error fetching labs:", error));
  }, [labFacilitiesMap]); // Re-fetch labs when mapping is updated

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [id]: value }));
  };

  // Handle search
  const handleSearch = () => {
    const filtered = labs.filter((lab) => {
      return (
        (searchParams.labName ? lab.labName.toLowerCase().includes(searchParams.labName.toLowerCase()) : true) &&
        (searchParams.testType ? lab.labType.toLowerCase().includes(searchParams.testType.toLowerCase()) : true) &&
        (searchParams.labFacilities ? lab.labFacilities.toLowerCase().includes(searchParams.labFacilities.toLowerCase()) : true) &&
        (searchParams.labCode ? lab.labCode.toLowerCase().includes(searchParams.labCode.toLowerCase()) : true)
      );
    });
    setFilteredLabs(filtered);
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Lab</h1>

      {/* Search Form */}
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            id="labName"
            value={searchParams.labName}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Lab Name"
          />
        </div>
        <div>
          <input
            type="text"
            id="testType"
            value={searchParams.testType}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Test Type"
          />
        </div>
        <div>
          <input
            type="text"
            id="labFacilities"
            value={searchParams.labFacilities}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Lab Facilities"
          />
        </div>
        <div>
          <input
            type="text"
            id="labCode"
            value={searchParams.labCode}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Lab Code"
          />
        </div>

        {/* Search Button */}
        <div>
          <button
            type="button"
            onClick={handleSearch}
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
            hover:from-[#007BFF] hover:to-[#004A99]
            text-white transition duration-150 
            ease-out hover:ease-in py-2 px-5 rounded-lg"
          >
            Search
          </button>
        </div>
      </form>

      {/* Lab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {filteredLabs.length > 0 ? (
        filteredLabs.map((lab, index) => {
          const { icon, color } = getLabIcon(lab.labType);
          const isExpanded = expanded[index];

          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-100 
              transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              {/* Lab Header: Icon, Name, and Code */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl" style={{ color }}>{icon}</span>
                <h2 className="text-xl font-bold text-gray-800 flex-1 text-center">{lab.labName}</h2>
                <p className="text-md font-semibold" style={{ color: "#007BFF" }}>{lab.labCode}</p>
              </div>

              

              {/* Lab Type (Color-coded) */}
              <p className="text-md font-medium text-center mt-2" style={{ color }}>{lab.labType}</p>
{/* Lab Facilities (2 per line, comma-separated) */}
<p className="text-md text-gray-600 font-medium text-center mt-2">
            {lab.labFacilities
              .split(",")
              .map((facility, i, arr) => (i % 2 === 0 ? arr.slice(i, i + 2).join(", ") : ""))
              .filter(Boolean)
              .map((line, i) => (
                <span key={i}>
                  {line}
                  
                  <br />
                </span>
              ))}
          </p>
              {/* Address with View More / Less */}
              <div className="flex items-center justify-between text-gray-700 mt-2">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-red-500 mr-1" />
                  <span className="text-md">
                    {isExpanded ? "Anna Nagar, Chennai, Tamil Nadu - 600102" : "Anna Nagar, Chennai"}
                  </span>
                </div>
                <button
                  onClick={() => toggleView(index)}
                  className="text-blue-300 text-sm hover:underline"
                >
                  {isExpanded ? "View Less" : "View More"}
                </button>
              </div>

              {/* Directions Link */}
              <div className="flex items-center justify-between mt-2">
  
  <a href="#" className="text-green-500 flex items-center hover:underline">
    <FaDirections className="mr-1" /> Directions
  </a>

  {/* Contact Link */}
  <a href={`tel:${lab.contactNumber}`} className="text-blue-500 flex items-center hover:underline">
    <FaPhoneAlt className="mr-1" /> Contact
  </a>
</div>

            </div>
          );
        })
      ) : (
        <p>No labs found</p>
      )}
    </div>
    </div>
  );
};

export default SearchLab;
