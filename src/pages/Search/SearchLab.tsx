import React, { useEffect, useState } from 'react';
import {
  FaFlask,
  FaMicroscope,
  FaRadiation,
  FaPhoneAlt,
  FaDirections,
  FaMapMarkerAlt,
  FaVial,
  FaXRay,
} from 'react-icons/fa';
import CustomButton from '../../components/CustomButton';

const SearchLab: React.FC = () => {
  const [labs, setLabs] = useState<any[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleView = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  const [labTypes, setLabTypes] = useState<{ id: string; name: string }[]>([]);
  const [labFacilities, setLabFacilities] = useState<
    { id: string; name: string }[]
  >([]);
  const [labFacilitiesMap, setLabFacilitiesMap] = useState<{
    [key: string]: string;
  }>({});
  const [searchParams, setSearchParams] = useState({
    labName: '',
    testType: '',
    labFacilities: '',
    labCode: '',
  });

  const getLabIcon = (labType: string) => {
    switch (labType.toLowerCase()) {
      case 'pathology lab':
        return { icon: <FaMicroscope />, color: '#E67E22' }; // Orange
      case 'radiology lab':
        return { icon: <FaRadiation />, color: '#8E44AD' }; // Purple
      case 'biochemistry lab':
        return { icon: <FaVial />, color: '#27AE60' }; // Green
      case 'x-ray lab':
        return { icon: <FaXRay />, color: '#f43ae6' }; // Pink
      default:
        return { icon: <FaFlask />, color: '#007BFF' }; // Default Blue
    }
  };

  const [expanded, setExpanded] = useState({});

  // const toggleView = (index) => {
  //   setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  // };
  // Fetch AppLOV data and create a mapping (id → name)
  useEffect(() => {
    fetch(
      'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=facilitiestype',
    )
      .then((response) => response.json())
      .then((data) => {
        console.log('API Response:', data); // Debugging
        if (data && Array.isArray(data.data)) {
          const facilitiesList = data.data.map((facility: any) => ({
            id: facility.appLOVID,
            name: facility.name,
          }));
          setLabFacilities(facilitiesList);
        } else {
          console.error('Expected an array inside "data" but got:', data);
        }
      })
      .catch((error) => console.error('Error fetching AppLOV:', error));
  }, []);

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV?type=LabType')
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const typesList = data.data.map((lab: any) => ({
            id: lab.appLOVID,
            name: lab.name,
          }));
          setLabTypes(typesList);
        } else {
          console.error('Expected an array inside "data" but got:', data);
        }
      })
      .catch((error) => console.error('Error fetching Lab Types:', error));
  }, []);

  // Fetch Labs and replace labFacilities ID with the corresponding name
  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Laboratory')
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const updatedLabs = data.data.map((lab: any) => ({
            ...lab,
            labFacilities: lab.labFacilities
              .split(',') // If multiple facilities are stored as comma-separated IDs
              .map((id: string) => labFacilitiesMap[id.trim()] || id) // Replace ID with name
              .join(', '),
          }));
          setLabs(updatedLabs);
          setFilteredLabs(updatedLabs); // Initialize filteredLabs
        } else {
          console.error("Expected an array inside 'data' but got:", data);
        }
      })
      .catch((error) => console.error('Error fetching labs:', error));
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
        (searchParams.labName
          ? lab.labName
              .toLowerCase()
              .includes(searchParams.labName.toLowerCase())
          : true) &&
        (searchParams.testType
          ? lab.labType
              .toLowerCase()
              .includes(searchParams.testType.toLowerCase())
          : true) &&
        (searchParams.labFacilities
          ? lab.labFacilities
              .toLowerCase()
              .includes(searchParams.labFacilities.toLowerCase())
          : true) &&
        (searchParams.labCode
          ? lab.labCode
              .toLowerCase()
              .includes(searchParams.labCode.toLowerCase())
          : true)
      );
    });
    setFilteredLabs(filtered);
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Search Lab
      </h1>

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
          <select
            id="labType"
            name="labType"
            value={searchParams.labType}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">-- Select Lab Type --</option>
            {labTypes.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            id="labFacilities"
            name="labFacilities"
            value={searchParams.labFacilities}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                text-black outline-none focus:border-primary dark:border-form-strokedark
                dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">-- Select Lab Facility --</option>
            {labFacilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
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
         
       
          <CustomButton  onClick={handleSearch}>
      Search
    </CustomButton>
        </div>
      </form>
      <h1 className="text-2xl font-semibold text-black mt-4  mb-6">List of Lab's</h1>


     {/* Lab Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  {filteredLabs.length > 0 ? (
    filteredLabs.map((lab, index) => {
      const { icon, color } = getLabIcon(lab.labType);
      const isExpanded = expandedIndex === index;

      return (
        <div
          key={index}
          className="bg-white p-5 rounded-lg shadow border border-blue-400 relative transition hover:shadow-lg"
        >
          {/* Icon Badge - Top Left */}
          <div className="absolute top-0 left-0 bg-blue-300 w-10 h-10 rounded-br-lg rounded-tl-lg flex items-center justify-center">
            <span className="text-white text-xl">{icon}</span>
          </div>

          {/* Info Row */}
          <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 pl-12"> {/* pl-12 to avoid overlapping the icon */}
            {/* Lab Name + Code */}
            <h2 className="text-base font-bold text-gray-800">
              {lab.labName} ({lab.labCode})
            </h2>

            {/* Lab Type */}
            <p className="text-sm font-medium">
              {lab.labType}
            </p>

            {/* View More / Less */}
            <button
              onClick={() => toggleView(index)}
              className="text-blue-500 text-sm hover:underline"
            >
              {isExpanded ? "View Less" : "View More"}
            </button>
          </div>

          {/* Facilities Section */}
          {isExpanded && (
            <div className="mt-3 text-gray-600 text-sm font-medium text-center">
              {lab.labFacilities
                .split(",")
                .map((id) => {
                  const facility = labFacilities.find(
                    (f) => f.id.toString() === id.trim()
                  );
                  return facility ? facility.name : id;
                })
                .join(", ")}
            </div>
          )}
        </div>
      );
    })
  ) : (
    <p className="text-lg font-semibold text-gray-700">No labs found</p>
  )}
</div>



    </div>
  );
};

export default SearchLab;
