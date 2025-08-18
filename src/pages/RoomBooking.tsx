import React, { useState } from "react";
import { FaSnowflake , FaSun } from "react-icons/fa";

interface Room {
  id: number;
  roomNumber: string;
  status: "Available" | "Occupied";
  acType: "AC" | "Non-AC";
  patientName?: string;
  admissionId?: string;
  attenderName?: string;
  doctorName?: string;
  specialization?: string;
  dateOfJoining?: string;
}

interface RoomCategory {
  id: number;
  name: string;
  sections: RoomSection[];
}

interface RoomSection {
  id: number;
  name: string;
  rooms: Room[];
}

const HospitalRoomBooking: React.FC = () => {
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([
    {
      id: 1,
      name: "General Room",
      sections: Array.from({ length: 3 }, (_, sectionIndex) => ({
        id: sectionIndex + 1,
        name: `G-${sectionIndex + 1}`,
        rooms: Array.from({ length: 10 }, (_, roomIndex) => ({
          id: roomIndex + 1,
          roomNumber: `G-${sectionIndex + 1}-${roomIndex + 1}`,
          status: roomIndex < 5 ? "Available" : "Occupied",
          
          acType: roomIndex % 2 === 0 ? "AC" : "Non-AC", 
          ...(roomIndex >= 5 && {
            patientName: `Patient ${roomIndex + 1}`,
            admissionId: `ADM${roomIndex + 1}`,
            doctorName: `Doctor ${roomIndex + 1}`,
            specialization: `Specialization ${roomIndex + 1}`,
          }),
        })),
      })),
    },
    {
      id: 2,
      name: "Special Room",
      sections: Array.from({ length: 3 }, (_, sectionIndex) => ({
        id: sectionIndex + 1,
        name: `S-${sectionIndex + 1}`,
        rooms: Array.from({ length: 10 }, (_, roomIndex) => ({
          id: roomIndex + 1,
          roomNumber: `S-${sectionIndex + 1}-${roomIndex + 1}`,
          status: roomIndex < 6 ? "Available" : "Occupied",
          
          acType: roomIndex % 2 === 0 ? "AC" : "Non-AC", 
          ...(roomIndex >= 6 && {
            patientName: `Patient ${roomIndex + 1}`,
            admissionId: `ADM${roomIndex + 11}`,
            doctorName: `Doctor ${roomIndex + 1}`,
            specialization: `Specialization ${roomIndex + 1}`,
          }),
        })),
      })),
    },
    {
      id: 3,
      name: "VIP Room",
      sections: Array.from({ length: 3 }, (_, sectionIndex) => ({
        id: sectionIndex + 1,
        name: `VIP-${sectionIndex + 1}`,
        rooms: Array.from({ length: 10 }, (_, roomIndex) => ({
          id: roomIndex + 1,
          roomNumber: `VIP-${sectionIndex + 1}-${roomIndex + 1}`,
          status: roomIndex < 7 ? "Available" : "Occupied",
          
          acType: roomIndex % 2 === 0 ? "AC" : "Non-AC", 
          ...(roomIndex >= 7 && {
            patientName: `Patient ${roomIndex + 1}`,
            admissionId: `ADM${roomIndex + 21}`,
            doctorName: `Doctor ${roomIndex + 1}`,
            specialization: `Specialization ${roomIndex + 1}`,
          }),
        })),
      })),
    },
  ]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [searchRoomNumber, setSearchRoomNumber] = useState<string>("");
  const [searchPatientName, setSearchPatientName] = useState<string>("");
  const [searchAdmissionId, setSearchAdmissionId] = useState<string>("");
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);

  // Handler to update room details
  const handleRoomSubmit = (updatedRoom: Room) => {
    setRoomCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        sections: category.sections.map((section) => ({
          ...section,
          rooms: section.rooms.map((room) =>
            room.roomNumber === updatedRoom.roomNumber ? updatedRoom : room
          ),
        })),
      }))
    );
    setSelectedRoom(null); // Close the modal
  };

  const filteredRooms = roomCategories
    .find((cat) => cat.id === activeCategory)
    ?.sections.find((sec) => sec.id === activeSection)
    ?.rooms.filter((room) => {
      const matchesRoomNumber =
        !searchRoomNumber || room.roomNumber.includes(searchRoomNumber);
      const matchesPatientName =
        !searchPatientName ||
        (room.patientName &&
          room.patientName.toLowerCase().includes(searchPatientName.toLowerCase()));
      const matchesAdmissionId =
        !searchAdmissionId ||
        (room.admissionId &&
          room.admissionId.toLowerCase().includes(searchAdmissionId.toLowerCase()));
      const matchesAvailability = !availableOnly || room.status === "Available";

      return (
        matchesRoomNumber && matchesPatientName && matchesAdmissionId && matchesAvailability
      );
    });

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="mb-4 flex items-center space-x-4">
        {/* Category Dropdown */}
        <select
          value={activeCategory}
          onChange={(e) => {
            setActiveCategory(Number(e.target.value));
            setActiveSection(null); // Reset section selection
          }}
          className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          {roomCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {activeCategory && (
          <select
            value={activeSection || ""}
            onChange={(e) => setActiveSection(Number(e.target.value))}
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="" disabled>
              Select Section
            </option>
            {roomCategories
              .find((cat) => cat.id === activeCategory)
              ?.sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
          </select>
        )}

        {/* Search Inputs */}
        <input
          type="text"
          placeholder="Search Room Number"
          value={searchRoomNumber}
          onChange={(e) => setSearchRoomNumber(e.target.value)}
          className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <input
          type="text"
          placeholder="Search Patient Name"
          value={searchPatientName}
          onChange={(e) => setSearchPatientName(e.target.value)}
          className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <input
          type="text"
          placeholder="Search Admission ID"
          value={searchAdmissionId}
          onChange={(e) => setSearchAdmissionId(e.target.value)}
          className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={() => setAvailableOnly(!availableOnly)}
            className="form-checkbox text-primary"
          />
          <span>Available Rooms Only</span>
        </label>
      </div>

      
      {/* Room Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredRooms?.map((room) => (
          <div
            key={room.id}
            onClick={() => room.status === "Available" && setSelectedRoom(room)}
            className={`p-4 rounded-lg shadow-lg relative text-center group cursor-pointer ${
              room.status === "Available"
                ? "bg-green-100 hover:bg-green-200"
                : "bg-red-100 cursor-not-allowed"
            }`}
          >
            <div className="font-semibold flex items-center justify-center space-x-2">
              <span>{room.roomNumber}</span>
              {room.acType === "AC" ? (
                <FaSnowflake  className="text-blue-500 text-2xl" title="AC Room" />
              ) : (
                <FaSun className="text-yellow-500 text-2xl" title="Non-AC Room" />
              )}
            </div>
            <div className="text-sm">
              {room.status === "Occupied" ? "Occupied" : "Available"}
            </div>
            {room.status === "Occupied" && room.patientName && (
  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 bg-black text-white text-sm p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
    <p>
      <strong>Patient:</strong> {room.patientName}
    </p>
    <p>
      <strong>Admission ID:</strong> {room.admissionId}
    </p>
    {room.doctorName && (
      <p>
        <strong>Doctor:</strong> {room.doctorName}
      </p>
    )}
    {room.specialization && (
      <p>
        <strong>Specialization:</strong> {room.specialization}
      </p>
    )}
  </div>
)}

          </div>
        ))}
      </div>

      {/* Modal for Patient Information */}
      {selectedRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-lg font-semibold mb-4">Admission Detail</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedRoom: Room = {
                  ...selectedRoom,
                  status: "Occupied",
                  patientName: formData.get("patientName") as string,
                  admissionId: formData.get("admissionId") as string,
                  attenderName: formData.get("attenderName") as string,
                  doctorName: formData.get("doctorName") as string,
                  specialization: formData.get("specialization") as string,
                  dateOfJoining: formData.get("dateOfJoining") as string,
                };
                handleRoomSubmit(updatedRoom);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    name="patientName"
                    required
                    placeholder="Enter Patient Name"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    name="admissionId"
                    required
                    placeholder="Enter Admission ID"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    name="attenderName"
                    required
                    placeholder="Enter Attender Name"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    name="doctorName"
                    required
                    placeholder="Enter Doctor Name"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    name="specialization"
                    required
                    placeholder="Enter Specialization"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    name="dateOfJoining"
                    required
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg"
                >
                  Add Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalRoomBooking;
