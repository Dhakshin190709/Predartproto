
import axios from "axios";
export const fetchHospitalAPI = async () => {
    try {
      const response = await fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
  
      console.log("Fetched Data:", data); // Log to check structure
  
      // Ensure the API returns `appLOVID` and `name`
      return data.data
        .filter((item: { type: string }) => item.type === "Hospital")
        .map((item: { appLOVID: string; name: string }) => ({
          id: item.appLOVID, // Ensure the correct property
          name: item.name,
        }));
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };
  
  //Fetch Tenant
  export const fetchTenants = async () => {
    try {
      const response = await fetch("https://predart003-001-site1.anytempurl.com/api/Tenant");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.data || data; // Adjust based on API structure
    } catch (error) {
      console.error("Error fetching tenant data:", error);
      return [];
    }
  };

  
  // Fetch specialization
  export const fetchSpecializations = async (): Promise<{ [key: string]: string }> => {
  try {
    const response = await fetch(
      "https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Specializations"
    );
    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      return data.data.reduce((acc: { [key: string]: string }, spec: any) => {
        acc[String(spec.appLOVID).trim()] = spec.name;
        return acc;
      }, {});
    }
    return {};
  } catch (error) {
    console.error("Error fetching Specializations:", error);
    return {};
  }
};

// Fetch Role

export const fetchRoles = async () => {
    try {
      const response = await fetch('https://predart003-001-site1.anytempurl.com/api/Role');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error("API response format is incorrect for roles.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      return [];
    }
  };
  
  // fetch menu
  export const fetchMenus = async () => {
    try {
      const response = await fetch('https://predart003-001-site1.anytempurl.com/api/menu');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error("API response format is incorrect for menus.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      return [];
    }
  };

  // fetch menurights based on the role

  export const fetchRolePermissions = async (roleID: string | null): Promise<number[]> => {
    if (!roleID) return [];
  
    try {
      const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/RoleMenuRights/Search/${roleID}`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map((permission: any) => permission.menuID);
      } else {
        console.error("API response format is incorrect for role permissions.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      return [];
    }
  };
  

  
