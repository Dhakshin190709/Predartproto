
import axios from "axios";
import api from "./api/request";
export const fetchHospitalAPI = async () => {
  try {
    const response = await api.get('/AppLOV');
    const data = response.data;

    console.log("Fetched Data:", data); // Log to check structure

    return data.data
      .filter((item: { type: string }) => item.type === "Hospital")
      .map((item: { appLOVID: string; name: string }) => ({
        id: item.appLOVID,
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
    const response = await api.get('/Tenant');
    // Axios automatically parses JSON and returns the data
    // Adjust below depending on your API response structure
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching tenant data:", error);
    return [];
  }
};

  
  // Fetch specialization
  export const fetchSpecializations = async (): Promise<{ [key: string]: string }> => {
  try {
    const response = await api.get('/AppLOV', {
      params: { type: 'Specializations' },
    });
    const data = response.data;

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
    const response = await api.get('/Role');
    const result = response.data;

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
    const response = await api.get('/menu');
    const result = response.data;

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
    const response = await api.get(`/RoleMenuRights/Search/${roleID}`);
    const result = response.data;

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
  

  
