import React, { useState, useEffect, useRef } from 'react';  
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import CustomButton from '../../components/CustomButton';

interface RowData {
  appLOVID: number;
  name: string;
  code: string;
  type: string;
  isActive: string;
}


const LovMasters: React.FC = () => {
  // Type filter for UI
  const [type, setType] = useState<string>('');
  const [Name, setName] = useState('');
  const [code, setCode] = useState(''); // Code filter for UI
  const [isActive, setIsActive] = useState(false); // Active filter for UI
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [quickSearchText, setQuickSearchText] = useState(""); // For global search
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RowData>({
    appLOVID: 0,
    name: '',
    code: '',
    type: '', 
    isActive: 'Active',
  });

  // Sample data
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  // Function to send data to API
  const postDataToApi = async () => {
    console.log('POST request initiated');  // Log to see when the POST request is triggered
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      const payload = {
        type: formData.type,
        name: formData.name,
        code: formData.code,
        isActive: true,
      };
  
      const response = await fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);  // Ensure this is only logged once
        alert('Data added successfully!');
        fetchData();
      } else {
        console.error('Failed to add data:', response.statusText);
      }
    } catch (error) {
      console.error('Error occurred while adding data:', error);
    } finally {
      setIsSubmitting(false);  // Re-enable button after completion
    }
  };
  
  

  useEffect(() => {
    console.log('Component mounted');
    fetchData(); // Only fetch once on mount
  }, []);

  // Fetch data function
  const fetchData = async () => {
    try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV');
        if (response.ok) {
            const responseData = await response.json();
            console.log("Fetched data:", responseData); // Inspect the data structure
            
            // Ensure 'data' exists and is an array
            if (responseData.success && Array.isArray(responseData.data)) {
                const formattedData = responseData.data.map((item: any) => ({
                    ...item,
                    isActive: item.isActive || 'Inactive', // Default value for isActive
                }));
                setRowData(formattedData);
                setFilteredData(formattedData);
            } else {
                console.error("API response 'data' is not an array or missing:", responseData);
            }
        } else {
            console.error('Failed to fetch data:', response.statusText);
        }
    } catch (error) {
        console.error('Error occurred while fetching data:', error);
    }
};

  
  
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // Prevent page reload on form submission
  console.log('Form submission triggered');

  if (formData.appLOVID === 0) {
    await postDataToApi(); // Call the function to handle the POST request
  } else {
    // Prepare the payload for the PUT request
    const payload = {
      appLOVID: formData.appLOVID,
      type: formData.type,
      name: formData.name,
      code: formData.code,
      isActive: formData.isActive === 'Active', // Boolean value for isActive
    };

    console.log('PUT Payload:', payload); // Log payload for debugging

    try {
      const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/AppLOV`, {
        method: 'PUT', // PUT for updating existing data
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status); // Log response status for debugging

      if (response.ok) {
        const updatedData = await response.json();
        console.log('Data updated successfully:', updatedData);

        // Update the grid with the new data
        const updatedRowData = rowData.map(item =>
          item.appLOVID === formData.appLOVID ? { ...item, ...payload } : item
        );
        setRowData(updatedRowData);
        setFilteredData(updatedRowData); // Ensure the filtered data is updated

        // Reset form and close it after successful update
        setFormData({
          appLOVID: 0,
          name: '',
          code: '',
          type: '',
          isActive: 'Active',
        });
        setShowForm(false); // Hide the form after submission
      } else {
        const errorData = await response.json();
        console.error('Failed to update data:', errorData);
        alert('Failed to update data. Please try again.');
      }
    } catch (error) {
      console.error('Error occurred while updating data:', error);
      alert('Error occurred while updating data. Please check your connection and try again.');
    }
  }
};


  
  
  

  // Column Definitions for AG Grid
  const columnDefs: ColDef[] = [
    { 
      headerName: "appLOVID", 
      field: "appLOVID", 
      sortable: true, 
      filter: true,
      width: 150, 
      hide: true,
    },
    { 
      headerName: "S.No", 
      field: "S.No", 
      headerClass: 'center-header',
      cellClass: 'text-center', 
      sortable: true, 
      valueGetter: "node.rowIndex + 1",
      filter: true,
      flex: 1,
      width: 80 // Reduced width
    },
    { 
      headerName: 'Type', 
      field: 'type', 
      flex: 2,  // Increased flex to make it take more space
      sortable: true, 
      filter: true, 
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 250  // Increased width
    },
    { 
      headerName: 'Name', 
      field: 'name', 
      flex: 2,  // Increased flex to make it take more space
      sortable: true, 
      filter: true, 
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 300  // Increased width
    },
    { 
      headerName: 'Code', 
      field: 'code', 
      flex: 1, 
      sortable: true, 
      filter: true, 
      headerClass: 'center-header',
      cellClass: 'text-center',
      width: 100 // Reduced width
    },
   
    {
      headerName: 'Status',
      field: 'isActive',
      flex: 0.8,
      width: 100,  // Reduced width

      headerClass: 'center-header',
      cellClass: 'text-center',
      cellRenderer: (params: any) => {
        const status = params.value ? 'Active' : 'Inactive'; // Display 'Active' if true, 'Inactive' if false
        return (
          <span
            onClick={() => toggleStatus(params)}
            className={`cursor-pointer font-bold ${params.value ? 'text-green-500' : 'text-red-400'} hover:underline`}
          >
            {status}
          </span>
        );
      }
    },
    {
      headerName: 'Edit',
      field: 'edit',
      flex: 0.8,
      width: 80,
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleEdit(params)}
          className="cursor-pointer text-blue-500 font-bold"
        >
          Edit
        </span>
      ),
    },
    {
      headerName: 'Delete',
      field: 'delete',
      flex: 0.8,
      width: 80,  // Reduced width
      headerClass: 'center-header',
      cellClass: 'text-center',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => (
        <span
          onClick={() => handleDelete(params)}
          className="cursor-pointer text-red-600 font-bold hover:text-red-800"
        >
          x
        </span>
      ),
    },
  ];
  

  // Toggles the isActive of a row between Active/Inactive
  const toggleStatus = (params: any) => {
    // Toggle isActive between true and false
    const updatedData = rowData.map(item =>
      item.appLOVID === params.data.appLOVID
        ? { ...item, isActive: !item.isActive } // Toggle the boolean value
        : item
    );
    setRowData(updatedData);
    setFilteredData(updatedData); // Ensure filtered data is updated as well
  };

  // Handles the delete button click
  // Trigger deletion and show confirmation
const handleDelete = (params: any) => {
  setDeleteRowId(params.data.appLOVID);

  setShowConfirmation(true); // Show the confirmation message box
};

// Confirm the deletion and update data
const confirmDelete = async () => {
  if (deleteRowId !== null) {
    try {
      // Send a DELETE request to the API
      const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/AppLOV/${deleteRowId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Row deleted successfully');
        
        // After successful deletion, filter out the deleted row from rowData
        const updatedData = rowData.filter((item: any) => item.appLOVID !== deleteRowId);
        setRowData(updatedData);  // Update state with the new data without the deleted row
        setFilteredData(updatedData); // Update filtered data as well if used
      } else {
        console.error('Failed to delete row:', response.statusText);
      }
    } catch (error) {
      console.error('Error occurred while deleting row:', error);
    } finally {
      setShowConfirmation(false); // Hide confirmation dialog
      setDeleteRowId(null); // Reset the delete row ID
    }
  }
};

// Cancel the deletion
const cancelDelete = () => {
  setShowConfirmation(false); // Hide the confirmation dialog
  setDeleteRowId(null); // Reset the delete row ID
};


  const handleEdit = (params: any) => {
    setFormData(params.data); // Set the data of the row to the form
    setShowForm(true); // Show the form for editing
  };

   

  // Filters the rows based on Type, Code, and Active isActive
  const handleFilterSearch = () => {
    if (isActive) {
      console.log('Active filter applied, but not updating table data');
      return;
    }
    const filtered = rowData.filter(item =>
      (type ? item.name.toLowerCase().includes(type.toLowerCase()) : true) &&
      (code ? item.code.toLowerCase().includes(code.toLowerCase()) : true) &&
      (isActive ? item.isActive === 'Active' : true)
    );
    setRowData(filtered);
    setFilteredData(filtered); // Reset filtered data
  };
  
  // Apply the global search filter to the data
  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.name.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.code.toLowerCase().includes(quickSearchText.toLowerCase()) 
     
    );
  };
  const onGridReady = (params: any) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit(); // Ensure columns fit the grid width
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">Lov Masters</h2>

      {/* Filters Section (Type, Code, Active) */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {/* Type Filter */}
        <select
  value={type}
  onChange={(e) => setType(e.target.value)}
  className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
>
  <option value="">Select Type</option>
  <option value="Blood Group">Bloodgroup</option>
 
  <option value="Gender">Gender</option>
  <option value="Address Type">Address</option>
 
  <option value="Specializations">Specifications</option>
  <option value="Qualification">Qualification</option>
  <option value="Hospital Type">Hospital</option>
  <option value="Worktype">Worktype</option>
  <option value="Relationship">Relationship</option> 
  <option value="DocumentType">DocumentType</option> 
  <option value="LanguageMaster">LanguageMaster</option> 
  <option value="LabType">LabType</option> 
  <option value="FacilitiesType">FacilitiesType</option> 
 
</select>


        {/* Name Filter */}
        <input
          type="text"
          placeholder="Name"
          value={Name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        {/* Code Filter */}
        <input
          type="text"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-fit rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        {/* Active Status Checkbox */}
        <label className="text-black dark:text-black flex items-center w-fit cursor-pointer">
  <input
    type="checkbox"
    checked={isActive}
    onChange={(e) => setIsActive(e.target.checked)}
    className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-md relative mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-gradient-to-b checked:from-[#004A99] checked:to-[#007BFF] checked:border-[#007BFF] checked:after:content-['✔️'] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white"
  />
  <span>Active</span>
</label>



        {/* Search Button */}
       
        <CustomButton onClick={handleFilterSearch}>Search</CustomButton>
        
      </div>

      <hr className="border-t-2 border-stroke bg-transparent my-6" />

      {/* Conditional Form for Adding or Editing Rows */}
      {showForm && (
  <div className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
    <h3 className="text-xl font-semibold mb-4">{formData.appLOVID === 0 ? 'Add New Data' : 'Edit Data'}</h3> {/* Conditional Title */}
    <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex gap-4">

         {/* Type Dropdown */}
        <select
  value={formData.type}
  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
  className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
>
  <option value="">Select Type</option>
  <option value="Bloodgroup">Bloodgroup</option>
 
  <option value="Gender">Gender</option>
  <option value="Address">Address</option>
 
  <option value="Specializations">Specifications</option>
  <option value="Qualification">Qualification</option>
  <option value="Hospital">Hospital</option>
  <option value="Worktype">Worktype</option>
  <option value="Relationship">Relationship</option>
  <option value="DocumentType">DocumentType</option> 
  <option value="LanguageMaster">LanguageMaster</option> 
  <option value="LabType">LabType</option> 
  <option value="FacilitiesType">FacilitiesType</option> 
 
</select>


        {/* Name Input */}
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        {/* Code Input */}
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="Code"
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        {/* Status Dropdown */}
        <select
          value={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
          className="w-48 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

       
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="mt-4 flex gap-4">
      <CustomButton type="submit" onClick={postDataToApi}>
  {formData.appLOVID === 0 ? "Add" : "Update"}
</CustomButton>

<CustomButton type="button" onClick={() => setShowForm(false)}>
  Cancel
</CustomButton>

      </div>
    </form>
  </div>
)}


      {/* Global Search and Add Button in the Same Row */}
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
  
    <div className="mb-4"> {/* Fixed div closing here */}
    

      <CustomButton onClick={() => setShowForm(true)}>
      + Add
    </CustomButton>
       </div> {/* Added closing div here */}
       </div> 
       
      {/* Table Component */}
      <div
        className="ag-theme-alpine mt-6 w-fit"
        style={{ height: '400px', width: '100%' }}
      >
        <AgGridReact
     rowData={rowData} 
         columnDefs={columnDefs}
         pagination={true}
         paginationPageSize={10}
         domLayout="autoHeight"
         headerHeight={40} // Adjust header height
         rowHeight={40} // Adjust row height
         onGridReady={onGridReady}
        />
      </div>
      {/* Conditional Confirmation Message Box */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this row?</p>
            <div className="flex gap-4 mt-4">
            <CustomButton onClick={confirmDelete}>Yes, Delete</CustomButton>
<CustomButton onClick={cancelDelete} className="bg-gray-300 text-black hover:bg-gray-400">
  Cancel
</CustomButton>

            </div>
          </div>
        </div>
      )}
  <style jsx>{`
      .center-header .ag-header-cell-label {
        text-align: center;
        display: flex;
        justify-content: center;
        font-weight: bold;
      }
    `}</style>
      
    </div>
  );
};

export default LovMasters;
