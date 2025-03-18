import React, { useState, useEffect } from "react";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: Record<string, any> | null;
  onSave: (updatedDetails: Record<string, any>) => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, details, onSave }) => {
  const [formData, setFormData] = useState<Record<string, any>>(details || {});

  useEffect(() => {
    if (details) setFormData(details);
  }, [details]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Reschedule Details</h2>

        <label className="block mb-2">
          Date:
          <input
            type="date"
            name="date"
            value={formData.date || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          Time:
          <input
            type="time"
            name="time"
            value={formData.time || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          Notes:
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
