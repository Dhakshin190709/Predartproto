import React, { useEffect, useState, ChangeEvent } from 'react';

interface Role {
  roleID: string;
  roleName: string;
}

interface Menu {
  menuID: string;
  title: string;
  parentID: string | null;
}

const RoleDropdownAndMenu: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/Role');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setRoles(result.data);
        } else {
          console.error("API response format is incorrect for roles.");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/menu');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setMenus(result.data);
        } else {
          console.error("API response format is incorrect for menus.");
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };
    fetchMenus();
  }, []);

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
              const menuIDs = result.data.map((permission: any) => permission.menuID);
              setSelectedMenus(menuIDs);
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

  const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  const handleMainMenuChange = (menuID: string, isChecked: boolean) => {
    setSelectedMenus((prevSelected) => {
      let newSelected = [...prevSelected];
      if (isChecked) {
        if (!newSelected.includes(menuID)) newSelected.push(menuID);
        menus.filter((menu) => menu.parentID === menuID).forEach((subMenu) => {
          if (!newSelected.includes(subMenu.menuID)) newSelected.push(subMenu.menuID);
        });
      } else {
        newSelected = newSelected.filter(id => id !== menuID);
        menus.filter((menu) => menu.parentID === menuID).forEach((subMenu) => {
          newSelected = newSelected.filter(id => id !== subMenu.menuID);
        });
      }
      return newSelected;
    });
  };

  const handleSubMenuChange = (subMenuID: string, mainMenuID: string, isChecked: boolean) => {
    setSelectedMenus((prevSelected) => {
      let newSelected = [...prevSelected];
      if (isChecked) {
        if (!newSelected.includes(subMenuID)) newSelected.push(subMenuID);
      } else {
        newSelected = newSelected.filter(id => id !== subMenuID);
      }
      const subMenus = menus.filter(menu => menu.parentID === mainMenuID);
      const anyChecked = subMenus.some(subMenu => newSelected.includes(subMenu.menuID));
      if (anyChecked) {
        if (!newSelected.includes(mainMenuID)) newSelected.push(mainMenuID);
      } else {
        newSelected = newSelected.filter(id => id !== mainMenuID);
      }
      return newSelected;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) {
      alert("Please select a role before saving.");
      return;
    }
    if (selectedMenus.length === 0) {
      alert("Please select at least one menu.");
      return;
    }
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
        headers: { 'Content-Type': 'application/json' },
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

  const groupedMenus = menus.reduce((acc, menu) => {
    if (!menu.parentID) {
      acc.mainMenus.push(menu);
    } else {
      acc.subMenus[menu.parentID] = acc.subMenus[menu.parentID] || [];
      acc.subMenus[menu.parentID].push(menu);
    }
    return acc;
  }, { mainMenus: [] as Menu[], subMenus: {} as { [key: string]: Menu[] } });

  return (
    <div className="p-6 bg-white min-h-screen">
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
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Permissions</h2>
        <div className="flex flex-col gap-4">
          {groupedMenus.mainMenus.map((menu) => (
            <div key={menu.menuID} className={`${groupedMenus.subMenus[menu.menuID] ? '' : 'mb-2'}`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`menu-${menu.menuID}`}
                  value={menu.menuID}
                  checked={selectedMenus.includes(menu.menuID)}
                  onChange={(e) => handleMainMenuChange(menu.menuID, e.target.checked)}
                  className="h-4 w-4 border-gray-300 rounded bg-yellow-200"
                />
                <label htmlFor={`menu-${menu.menuID}`} className="text-gray-700 font-bold">
                  {menu.title || "Unnamed Menu"}
                </label>
              </div>
              {groupedMenus.subMenus[menu.menuID]?.map((submenu) => (
                <div key={submenu.menuID} className="pl-6 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`menu-${submenu.menuID}`}
                    value={submenu.menuID}
                    checked={selectedMenus.includes(submenu.menuID)}
                    onChange={(e) => handleSubMenuChange(submenu.menuID, menu.menuID, e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <label htmlFor={`menu-${submenu.menuID}`} className="text-gray-700">
                    {submenu.title || "Unnamed Submenu"}
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handleSave}
        className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
        hover:from-[#007BFF] hover:to-[#004A99]
        text-white transition duration-150 
        ease-out hover:ease-in py-2 px-5 rounded-lg"
      >
        Save
      </button>
    </div>
  );
};

export default RoleDropdownAndMenu;
