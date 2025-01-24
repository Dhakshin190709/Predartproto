import React, { useEffect, useState } from 'react';

const RoleDropdownAndMenu = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);

  // Fetch Roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/Role');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setRoles(result.data); // Store role objects directly (including roleID)
        } else {
          console.error("API response format is incorrect for roles.");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  // Fetch Menus
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/menu');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          console.log(result.data); // Log the menu response to check field names
          setMenus(result.data); // Store menu objects directly
        } else {
          console.error("API response format is incorrect for menus.");
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };

    fetchMenus();
  }, []);

  // Fetch Permissions for the selected role
  useEffect(() => {
    if (selectedRole) {
      const fetchRolePermissions = async () => {
        const selectedRoleData = roles.find((role) => role.roleName === selectedRole);
        const roleID = selectedRoleData ? selectedRoleData.roleID : null;

        if (roleID) {
          try {
            const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/RoleMenuRights/Search/${roleID}`);
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
              const menuIDs = result.data.map(permission => permission.menuID);
              setSelectedMenus(menuIDs); // Set selected menu IDs based on permissions
            } else {
              console.error("API response format is incorrect for role permissions.");
            }
          } catch (error) {
            console.error("Error fetching role permissions:", error);
          }
        }
      };

      fetchRolePermissions();
    }
  }, [selectedRole, roles]);

  // Handle Role Selection
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  // Handle Checkbox Change
  const handleMenuChange = (menuID) => {
    setSelectedMenus((prevSelected) =>
      prevSelected.includes(menuID)
        ? prevSelected.filter((id) => id !== menuID)
        : [...prevSelected, menuID]
    );
  };

  // Save Button Click (POST request)
  const handleSave = async () => {
    if (!selectedRole) {
      alert("Please select a role before saving.");
      return;
    }

    if (selectedMenus.length === 0) {
      alert("Please select at least one menu.");
      return;
    }

    // Find the roleID based on the selected role (by matching roleName)
    const selectedRoleData = roles.find((role) => role.roleName === selectedRole);
    const roleID = selectedRoleData ? selectedRoleData.roleID : null;

    if (!roleID) {
      console.error("Role ID not found.");
      alert("Role ID not found.");
      return;
    }

    const payload = selectedMenus.map((menuID) => ({
      roleID,
      menuID,
    }));

    try {
      const response = await fetch('https://predart003-001-site1.anytempurl.com/api/RoleMenuRights/AssignRights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        alert("Permissions assigned successfully!");
      } else {
        alert("Failed to assign permissions.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("An error occurred while saving.");
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Role Dropdown */}
      <div className="mb-8">
                                                                                     
        <select
          id="roles"
          value={selectedRole}
          onChange={handleRoleChange}
          className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Select a Role</option>
          {roles.map((role) => (
            <option key={role.roleID} value={role.roleName}>
              {role.roleName}
            </option>
          ))}
        </select>
      </div>

      {/* Menu with Checkboxes */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Permissions</h2>
        <div className="grid grid-cols-2 gap-4">
          {menus.map((menu, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`menu-${menu.menuID}`}
                value={menu.menuID}
                checked={selectedMenus.includes(menu.menuID)}
                onChange={() => handleMenuChange(menu.menuID)}
                className="h-4 w-4 border-gray-300 rounded"
              />
              {/* Display the correct menu name */}
              <label htmlFor={`menu-${menu.menuID}`} className="text-gray-700">
                {menu.title || "Unnamed Menu"} {/* Make sure the correct field is used here */}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
      >
        Save
      </button>
    </div>
  );
};

export default RoleDropdownAndMenu;
