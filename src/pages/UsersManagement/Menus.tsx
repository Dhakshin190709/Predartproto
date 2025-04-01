import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from "axios";
import { Edit } from "lucide-react";
import CustomButton from '../../components/CustomButton';
interface RowData {
  sNo?: number; 
  Id:0;
  menuName: string;
  code: string;
  parentMenu: string;
  status: string;
  displayOrder: number; 
}

const BASE_URL = 'https://predart003-001-site1.anytempurl.com';
const Menus: React.FC = () => {
  const [selectedMenuName, setSelectedMenuName] = useState(""); // For filtering
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
 

const formRef = useRef<HTMLDivElement | null>(null);
  const [code, setCode] = useState(""); // For filtering
  const [selectedParentMenu, setSelectedParentMenu] = useState(""); // For filtering
  const [isActive, setIsActive] = useState(false); // Active filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(""); // For global search
  const [showForm, setShowForm] = useState(false); // Show form for adding/editing
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [menus, setMenus] = useState([]);
  const [menuName, setMenuName] = useState('');
   const [formMode, setFormMode] = useState(""); 
  const [displayOrder, setDisplayOrder] = useState(0); 
  const [status, setStatus] = useState(''); // Assume status is either 'Active' or 'Inactive'
  const [response, setResponse] = useState(null);
  const [parentMenu, setParentMenu] = useState(''); // For selected parent menu
  const [parentMenuList, setParentMenuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [menusFetched, setMenusFetched] = useState(false);
const [parentMenusFetched, setParentMenusFetched] = useState(false);
  // const [formData, setFormData] = useState<RowData>({
  //   Id: 0,
  //   menuName: '',
  //   code: '',
  //   parentMenu: '',
  //   status: 'Active',
  //   displayOrder:0,
  // });

  const [formData, setFormData] = useState({
    Id: 0,
    menuName: "",
    code: "",
    displayOrder: 0,
    selectedParentMenu: "",
    isActive: true,
  });
  

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  // Fetch all menus
 

const [isSubmitting, setIsSubmitting] = useState(false);

const handleSave = async (formData) => {
  if (isSubmitting) return; // Prevent duplicate submissions
  setIsSubmitting(true);
  resetForm();
  console.log("Submitting Menu Data:", formData);

  try {
    JSON.stringify(formData); // Ensure no circular references
  } catch (err) {
    console.error("Circular reference detected in formData", err);
    setIsSubmitting(false);
    return;
  }

  // Check if the menu already exists before saving
  const exists = await checkDuplicateMenu(formData.menuName, formData.code);
  if (exists) {
    console.error("Duplicate menu detected!");
    alert("A menu with this name or code already exists.");
    setIsSubmitting(false);
    return;
  }

  await createMenu(formData);
  setIsSubmitting(false);
};

const checkDuplicateMenu = async (menuName, code) => {
  try {
    const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/Menu`);
    if (!response.ok) throw new Error("Failed to fetch menu list");

    const menus = await response.json();
    return menus.some((menu) => menu.title === menuName || menu.code === code);
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return false;
  }
};

const createMenu = async ({ menuName, code, displayOrder, selectedParentMenu, isActive }) => {
  const menuData = {
    parentID: selectedParentMenu || null, // Ensure null if no parent
    title: menuName,
    code: code,
    order: Number(displayOrder) || 0, // Convert to number
    isActive: isActive ?? true, // Ensure true if undefined
  };

  try {
    const response = await fetch("https://predart003-001-site1.anytempurl.com/api/Menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menuData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create menu: ${response.status}`);
    }

    const data = await response.json();
    console.log("Menu Created Successfully:", data);
     // Reset form fields after successful submission
    resetForm();
  } catch (error) {
    console.error("Error creating menu:", error);
  }
};

  
  
  const fetchMenusAndParentMenus = async () => {
    if (menusFetched && parentMenusFetched) return; 
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/menu`);
      if (!response.ok) {
        throw new Error('Failed to fetch menus');
      }
  
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const menuTitleLookup = result.data.reduce((acc, item) => {
          acc[item.menuID] = item.title; // Map menuID to title
          return acc;
        }, {});
  
        const processedData = result.data.map((item) => ({
          ...item,
          menuID: item.menuID,
          menuName: item.title,
          parentMenu: item.parentID === null ? 'null' : menuTitleLookup[item.parentID] || 'Unknown',
          status: item.isActive ? 'Active' : 'Inactive',
          displayOrder: item.order,
        }));
  
        // Set state only if not already set
        if (!menusFetched) {
          setRowData(processedData);
          setMenusFetched(true); // Mark menus as fetched
        }
  
        if (!parentMenusFetched) {
          setParentMenuList(result.data);
          setParentMenusFetched(true); // Mark parent menus as fetched
        }
      } else {
        console.error('Unexpected response format:', result);
        setRowData([]);
        setParentMenuList([]);
      }
    } catch (error) {
      console.error('Error fetching menus and parent menus:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    fetchMenusAndParentMenus();
  }, []); 
  
  
  
  
  useEffect(() => {
    console.log("Menus fetched:", menusFetched);
    console.log("Parent menus fetched:", parentMenusFetched);
  }, [menusFetched, parentMenusFetched]);
  
 
  const applyGlobalSearch = (data: RowData[]) => {
    if (!quickSearchText.trim()) return data; 
    const lowerCaseSearch = quickSearchText.toLowerCase();
    return data.filter((row) =>
      [
        row.menuName,
        row.code,
        row.parentMenu,
        row.menuID?.toString(), // Include menuID in the search criteria
      ].some((field) => field?.toLowerCase().includes(lowerCaseSearch))
    );
  };
  
  // Update filtered data whenever quickSearchText or rowData changes
  useEffect(() => {
    setFilteredData(applyGlobalSearch(rowData));
  }, [quickSearchText, rowData]);
  
  // Column Definitions
  const columnDefs: ColDef<RowData, any>[] = [
    {
      headerName: 'S.No',
      valueGetter: 'node.rowIndex + 1',
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 80,
    },
    {
      headerName: 'MenuID',
      field: 'menuID',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      filter: true,
      flex: 2,
      hide: true,
      width: 300,
    },
    {
      headerName: 'Menu',
      field: 'menuName',
      headerClass: 'left-header',
      cellClass: 'text-left',
      sortable: true,
      filter: true,
      flex: 2,
      width: 300,
    },
    {
      headerName: 'Code',
      field: 'code',
      headerClass: 'center-header',
      cellClass: 'text-center',
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: 'Parent Menu',
      field: 'parentMenu',
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params) => {
        return params.value === 'null' ? 'null' : params.value;
      },
      sortable: true,
      filter: true,
      flex: 2,
      width: 250,
    },
    {
      headerName: 'Display Order',
      field: 'displayOrder',
      sortable: true,
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 120,
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 90,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => (
        <span
          onClick={() => toggleStatus(params)}
          className={`cursor-pointer font-bold ${
            params.value === 'Active' ? 'text-green-500' : 'text-red-400'
          } hover:underline`}
        >
          {params.value}
        </span>
      ),
    },
 

{
  headerName: "Edit",
  width: 80,
  cellClass: "text-center",
  headerClass: "center-header",
  cellRenderer: (params: any) => (
    <span
      onClick={() => handleEdit(params.data.displayOrder)}
      className="cursor-pointer flex justify-center mt-3 items-center"
    >
      <Edit size={18} className="text-blue-500 hover:scale-110 transition-transform" />
    </span>
  ),
},

    {
      headerName: 'Delete',
      hide:true,
      width: 80,
      cellClass: 'text-center',
      headerClass: 'center-header',
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params.data.menuID)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
    },
  ];
  
  // Form actions (unchanged)
  const handleAdd = () => {
    setShowForm(true);
    setFormMode("Add");
    resetForm(); 
  };
  
  const handleEdit = (displayOrder: number) => {
    const rowToEdit = rowData.find((row) => row.displayOrder === displayOrder);
    if (rowToEdit) {
      setFormData(rowToEdit); // Populate the form with selected row data
      setSelectedRow(rowToEdit); // Store the selected row
      setShowForm(true); // Show the form for editing
      setFormMode("Edit"); // Set form mode to "Edit"
  
      // Scroll to the form after updating the state
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // Delay to ensure form is visible before scrolling
    }
  };
  

  
  const handleCancel = () => {
    resetForm();
  };
  
  const resetForm = () => {
    setFormData({
      Id: 0,
      menuName: "",
      code: "",
      parentMenu: "",
      status: "Active",
      displayOrder: 0,
    }); // Reset form data
    setSelectedRow(null); // Clear selected row
  };
  

  const toggleStatus = async (params: any) => {
    const menuID = params.data.menuID; // Extract the menu ID
    const isActive = params.value !== 'Active'; // Toggle status
    const userID = sessionStorage.getItem("userID");

    if (!userID) {
        console.error("User ID not found in session storage.");
        alert("User not logged in. Please log in again.");
        return;
    }

    try {
        const response = await axios.patch(
            'https://predart003-001-site1.anytempurl.com/api/Menu',
            {
                guidID: menuID,
                updatedBy: userID,
                isActive: isActive,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.status === 200) {
            console.log('Status updated successfully');

            // Update AG Grid row data
            params.node.setData({ 
                ...params.data, 
                status: isActive ? 'Active' : 'Inactive' 
            });
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
};

  

  
  const handleDelete = (menuID: number) => {
    setDeleteRowId(menuID); // Store the ID of the row to delete
    setShowConfirmation(true); // Show confirmation dialog
  };
  
  const confirmDelete = async () => {
    try {
      // Make the DELETE request to the API
      const response = await axios.delete(`${BASE_URL}/api/Menu/${deleteRowId}`);
  
      if (response.status === 200) {
        // If the delete was successful, filter out the deleted item from the rowData
        const updatedData = rowData.filter((item) => item.menuID !== deleteRowId);
        setRowData(updatedData); // Update the table with the filtered data
        setFilteredData(updatedData); // Update the filtered data as well
      }
      setShowConfirmation(false); // Hide the confirmation dialog after successful delete
      setDeleteRowId(null); // Reset the deleteRowId
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };
  
  const cancelDelete = () => {
    setShowConfirmation(false); // Hide the confirmation dialog
    setDeleteRowId(null); // Clear the deleteRowId
  };
  
  
  const handleFilterSearch = () => {
    const filteredData = data.filter((menu) => {
      return (
        (selectedMenuName === "" || menu.menuName === selectedMenuName) &&
        (code === "" || menu.code === code) &&
        (selectedParentMenu === "" || menu.parentMenu === selectedParentMenu)
      );
    });
    setFilteredData(filteredData);
  };
  
  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  };
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // your logic here
  };
 // Handle Input Changes
 const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

const handleSubmit = () => {
  createMenu(formData, () => {
    setFormData({
      menuName: "",
      code: "",
      displayOrder: "",
      selectedParentMenu: null,
      isActive: true,
    });
    setShowForm(false); // Close form
  });
};


  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Menus</h2>

    
      {/* Table and Other Components */}
     

      {showForm && (
        <div 
        ref={formRef}  // Attach ref here
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none mt-4">
          <h3 className="text-xl font-semibold mb-4">
             {formMode === "Add" ? 'Add New Data' : 'Edit Data'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-center justify-between">
      <div className="space-y-4">
        {/* First Row: 3 Fields */}
        <div className="flex flex-wrap gap-4 mb-2">
          {/* Menu Name Input */}
          <input
            type="text"
            name="menuName"
            value={formData.menuName}
            onChange={handleChange}
            placeholder="Menu Name"
            className="w-60 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
            required
          />

          {/* Code Input */}
          <input
            type="text"
            name="code"
            maxLength={5}
            value={formData.code}
            onChange={handleChange}
            placeholder="Code"
            className="w-68 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
            required
          />

          {/* Display Order Input */}
          <input
            type="number"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleChange}
            placeholder="Display Order"
            className="w-68 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          />
        </div>

        {/* Second Row: 2 Fields */}
        <div className="flex flex-wrap gap-4 mb-2">
          {/* Parent Menu Dropdown */}
          <select
            name="selectedParentMenu"
            value={formData.selectedParentMenu}
            onChange={handleChange}
            className="w-60 rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
          >
            <option value="">Select Parent Menu</option>
            {menus.map((menu) => (
              <option key={menu.menuID} value={menu.menuID}>
                {menu.title}
              </option>
            ))}
          </select>

          {/* Active Checkbox */}
         {/* Show checkbox only in Edit mode */}
{formMode === "Edit" && (
  <label className="text-black flex items-center w-fit cursor-pointer">
    <input
      type="checkbox"
      name="isActive"
      checked={formData.isActive}
      onChange={handleChange}
      className="w-4 h-4 border-2 border-gray-400 rounded-md mr-2 focus:ring-2 focus:ring-blue-500 checked:bg-blue-600 checked:border-blue-600"
    />
    <span>Active</span>
  </label>
)}


          {/* Submit and Cancel Buttons */}
          <div className="flex gap-4 mt-2 ml-auto">
           


            <CustomButton type="submit" onClick={() => handleSave(formData)}>
            {formMode === "Add" ? "Save" : "Update"}
</CustomButton>

<CustomButton type="button" onClick={() => setShowForm(false)}>
  Cancel
</CustomButton>
          </div>
        </div>
      </div>
    </form>
        </div>
      )}
  





      <div className="mb-4 mt-4 flex flex-wrap gap-4 justify-between items-center">
  <div className="relative">
    <input
      type="text"
      placeholder="Search..."
      value={quickSearchText}
      onChange={(e) => setQuickSearchText(e.target.value)}
      className="sm:w-60 w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    <span className="absolute right-4 top-4">
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.5"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z" fill=""></path><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill=""></path></g></svg>
  </span>
  </div>
  
       

        <CustomButton onClick={handleAdd}>
        + Add
    </CustomButton>
      </div>



      {/* AgGrid Table */}
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        

<AgGridReact
  rowData={applyGlobalSearch(filteredData)}
  columnDefs={columnDefs}
  pagination={true}
  paginationPageSize={10} // ✅ Default page size
  paginationPageSizeSelector={[10, 20, 50, 100]} // ✅ Enable dropdown for page size
  domLayout="autoHeight"
  headerHeight={40}
  rowHeight={40}
  onGridReady={onGridReady}
/>

      </div>

      
     
      {/* Deletion Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
             


<CustomButton onClick={confirmDelete}>Yes, Delete</CustomButton>
<CustomButton  onClick={() => {
    cancelDelete();
    resetForm();
  }} className="bg-gray-300 text-black hover:bg-gray-400">
  Cancel
</CustomButton>

            </div>
          </div>
        </div>
      )}
        <style jsx>{`
        .center-header .ag-header-cell-label  {
          text-align: center;
          display: flex;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Menus;  
