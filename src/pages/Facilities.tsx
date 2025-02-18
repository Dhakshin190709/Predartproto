import React, { useState, useEffect } from "react";
import axios from "axios";

const Facilities: React.FC = () => {
  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedFacilities, setSelectedFacilities] = useState<
    { id: string; name: string }[]
  >([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [labDetails, setLabDetails] = useState<any>(null);
  const labID = "bc4c719a-768e-4702-9ead-08dd49c3522e";
  const [activeArrow, setActiveArrow] = useState(null);

  const handleArrowClick = (arrow) => {
    setActiveArrow(arrow);
  };


  useEffect(() => {
    const fetchLabDetails = async () => {
      try {
        const response = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Laboratory/${labID}`
        );
  
        if (response.data && response.data.data) {
          const { labName, labCode, labType, labFacilities } = response.data.data;
  
          // Split labFacilities string into an array
          const facilitiesArray = labFacilities
            ? labFacilities.split(",").map((id) => id.trim())
            : [];
  
          console.log("Lab Name:", labName);
          console.log("Lab Code:", labCode);
          console.log("Lab Type:", labType);
          console.log("Lab Facilities:", facilitiesArray); // Now an array
  
          setLabDetails({
            ...response.data.data,
            labFacilities: facilitiesArray, // Store as an array
          });
        } else {
          console.error("Unexpected API response structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching lab details:", error);
      }
    };
  
    fetchLabDetails();
  }, []);
  
  
  

  // Fetch Facilities and Match Names
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const facilitiesRes = await axios.get(
          "https://predart003-001-site1.anytempurl.com/api/AppLOV?type=facilitiestype"
        );
  
        if (!facilitiesRes.data || !Array.isArray(facilitiesRes.data.data)) {
          throw new Error("Invalid facilities response");
        }
  
        console.log("Facilities API Response:", facilitiesRes.data.data); // Debugging
  
        // Create a Map of facility IDs to Names
        const facilityMap = new Map(
          facilitiesRes.data.data.map((f: any) => [f.appLOVID, f.name])
        );
  
        // Ensure labFacilities exist and map correctly
        let selectedFacilitiesData: { id: string; name: string }[] = [];
  
        if (labDetails?.labFacilities && Array.isArray(labDetails.labFacilities)) {
          selectedFacilitiesData = labDetails.labFacilities
            .map((id: string) => ({
              id,
              name: facilityMap.get(id) || "Unknown",
            }))
            .filter((item) => item.name !== "Unknown");
  
          console.log("Mapped Selected Facilities:", selectedFacilitiesData); // Debugging
        }
  
        setSelectedFacilities(selectedFacilitiesData);
  
        // Remove selected facilities from available facilities
        const availableFacilities = facilitiesRes.data.data
          .filter((f: any) => !selectedFacilitiesData.some((sf) => sf.id === f.appLOVID))
          .map((f: any) => ({ id: f.appLOVID, name: f.name }));
  
        console.log("Available Facilities (Left Box):", availableFacilities); // Debugging
        setFacilities(availableFacilities);
      } catch (error) {
        console.error("Error fetching facilities:", error);
      }
    };
  
    if (labDetails) {
      fetchFacilities();
    }
  }, [labDetails]);
  

  // Handle Checkbox Selection
  const handleCheckboxChange = (id: string) => {
    setChecked((prevChecked) => {
      const newChecked = new Set(prevChecked);
      newChecked.has(id) ? newChecked.delete(id) : newChecked.add(id);
      return newChecked;
    });
  };

  // Move to Selected Facilities
  const moveToSelected = () => {
    const selectedItems = facilities.filter((f) => checked.has(f.id));
    setSelectedFacilities([...selectedFacilities, ...selectedItems]);
    setFacilities(facilities.filter((f) => !checked.has(f.id)));
    setChecked(new Set());
  };

  // Move back to Available Facilities
  const moveToAvailable = () => {
    const returningItems = selectedFacilities.filter((f) =>
      checked.has(f.id)
    );
    setFacilities([...facilities, ...returningItems]);
    setSelectedFacilities(selectedFacilities.filter((f) => !checked.has(f.id)));
    setChecked(new Set());
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      alert("User not logged in. Please log in again.");
      return;
    }
  
    const payload = {
      laboratoryID: labID,
      tenantID: labDetails?.tenantID || "",
      hospitalID: labDetails?.hospitalID || "",
      labName: labDetails?.labName || "",
      labCode: labDetails?.labCode || "",
      labType: labDetails?.labType || "",
      labFacilities: selectedFacilities.map((f) => f.id).join(","), // Convert array to comma-separated string
      createdBy: userID,
    };
  
    try {
      await axios.put(
        "https://predart003-001-site1.anytempurl.com/api/Laboratory/Facilities",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
  
      alert("Lab Facilities Updated Successfully!");
    } catch (error) {
      console.error("Error updating lab facilities:", error);
      alert("Failed to update lab facilities. Please try again.");
    }
  };
  

  return (
    <form className="space-y-4" onSubmit={handleSave}>
      <h2 className="text-lg font-bold text-black-700 text-left">Facilities</h2>

      {/* Available Facilities */}
      <div className="flex items-center justify-center space-x-4">
      {/* Available Lab Facilities Box */}
      <div className="w-64 h-80 p-4 bg-white border border-blue-200 rounded-lg shadow-lg overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 text-center">
          Available Lab Facilities
        </h3>
        <ul className="space-y-2">
          {facilities.length > 0 ? (
            facilities.map((facility) => (
              <li key={facility.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checked.has(facility.id)}
                  onChange={() => handleCheckboxChange(facility.id)}
                  className="mr-2"
                />
                <p className="text-gray-600">{facility.name}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No lab facilities available
            </p>
          )}
        </ul>
      </div>

      {/* Arrows in the middle */}
      <div className="flex flex-col items-center space-y-4">
        <button
          type="button"
          onClick={() => {
            moveToSelected();
            handleArrowClick("right");
          }}
          disabled={checked.size === 0}
          className={`text-3xl p-2 border rounded-lg transition-colors ${
            activeArrow === "right" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
          }`}
        >
          &#8594;
        </button>
        <button
          type="button"
          onClick={() => {
            moveToAvailable();
            handleArrowClick("left");
          }}
          disabled={checked.size === 0}
          className={`text-3xl p-2 border rounded-lg transition-colors ${
            activeArrow === "left" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
          }`}
        >
          &#8592;
        </button>
      </div>

      {/* Selected Facilities Box */}
      <div className="w-64 h-80 p-4 bg-white border border-blue-200 rounded-lg shadow-lg overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 text-center">
          Selected Lab Facilities
        </h3>
        {selectedFacilities.length === 0 ? (
          <p className="text-gray-500 text-center">No selected facilities</p>
        ) : (
          <ul className="space-y-2">
            {selectedFacilities.map((facility) => (
              <li key={facility.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checked.has(facility.id)}
                  onChange={() => handleCheckboxChange(facility.id)}
                  className="mr-2"
                />
                <p className="text-gray-600">{facility.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>



      <button
        type="submit"
        className="mt-4 bg-primary text-white py-2 px-4 rounded-lg"
      >
        Save Facilities
      </button>
    </form>
  );
};

export default Facilities;
