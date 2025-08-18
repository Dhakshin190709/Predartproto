
import axios from "axios";
import api from "./api/request";

export const fetchHospitalAPI = () => {
  try {
    const masterLOVString = localStorage.getItem('masterLOV');

    if (!masterLOVString) {
      console.warn('No masterLOV found in localStorage.');
      return [];
    }

    const data = JSON.parse(masterLOVString);

    if (!data || !Array.isArray(data.data)) {
      console.warn('Invalid masterLOV structure.');
      return [];
    }

    return data.data
      .filter((item: { type: string }) => item.type === "Hospital")
      .map((item: { appLOVID: string; name: string }) => ({
        id: item.appLOVID,
        name: item.name,
      }));
  } catch (error) {
    console.error('Error reading Hospital data from localStorage:', error);
    return [];
  }
};

  
  //Fetch Tenant
 export const fetchTenants = async () => {
  try {
    const response = await api.get('/Tenant/TenantList');
    // Axios automatically parses JSON and returns the data
    // Adjust below depending on your API response structure
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching tenant data:", error);
    return [];
  }
};

  
  // Fetch specialization
  export const fetchSpecializations = (): { [key: string]: string } => {
  try {
    const masterLOVString = localStorage.getItem('masterLOV');

    if (!masterLOVString) {
      console.warn('No masterLOV found in localStorage.');
      return {};
    }

    const data = JSON.parse(masterLOVString);

    if (!data || !Array.isArray(data.data)) {
      console.warn('Invalid masterLOV structure.');
      return {};
    }

    return data.data
      .filter((item: { type: string }) => item.type === "Specializations")
      .reduce((acc: { [key: string]: string }, spec: any) => {
        acc[String(spec.appLOVID).trim()] = spec.name;
        return acc;
      }, {});
  } catch (error) {
    console.error("Error reading Specializations from localStorage:", error);
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
  

  
