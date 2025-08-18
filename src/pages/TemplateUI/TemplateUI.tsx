import React, { useState } from 'react';
import './TemplateUI.css';
import { FaEdit } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa'; 

function Tenant() {
    const [tenantName, setTenantName] = useState('');
    const [tenantCode, setTenantCode] = useState('');
    const [category, setCategory] = useState('');
    const [address, setAddress] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [tenants, setTenants] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Form validation
        if (!tenantName || !tenantCode || !category || !address) {
            alert("Please fill out all fields");
            return;
        }

        const newTenant = {
            tenantName,
            tenantCode,
            category,
            address,
            isActive,
        };

        if (editIndex !== null) {
            // Edit functionality
            const updatedTenants = [...tenants];
            updatedTenants[editIndex] = newTenant;
            setTenants(updatedTenants);
            setEditIndex(null);
        } else {
            // Add new tenant to the table
            setTenants([...tenants, newTenant]);
        }

        // Reset form fields
        setTenantName('');
        setTenantCode('');
        setCategory('');
        setAddress('');
        setIsActive(false);
    };

    const handleEdit = (index) => {
        const tenant = tenants[index];
        setTenantName(tenant.tenantName);
        setTenantCode(tenant.tenantCode);
        setCategory(tenant.category);
        setAddress(tenant.address);
        setIsActive(tenant.isActive);
        setEditIndex(index);
    };

    const handleDelete = (index) => {
        const updatedTenants = tenants.filter((_, i) => i !== index);
        setTenants(updatedTenants);
    };

    return (
        <div className="tenant-component-container">
            <aside className="tenant-sidebar">
                <ul>
                    <li>Home</li>
                    <li>Dashboard</li>
                    <li>Master</li>
                    <li>Booking</li>
                    <li>Doctor</li>
                    <li>Patient</li>
                    <li>Report</li>
                    <li>Promo</li>
                    <li>Settings</li>
                </ul>
            </aside>

            <div className="tenant-main-content">
                <header className="tenant-header">
                    <input
                        type="text"
                        placeholder="Search"
                        className="tenant-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="tenant-header-form">
                        <label>Tenant Name</label>
                        <input
                            type="text"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                        />
                        <label>Code</label>
                        <input
                            type="text"
                            value={tenantCode}
                            onChange={(e) => setTenantCode(e.target.value)}
                        />
                        <label>Active</label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                        />
                    </div>
                </header>

                <form className="tenant-form-content" onSubmit={handleSubmit}>
                    <div className="tenant-form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                        />
                    </div>

                    <div className="tenant-form-group">
                        <label>Code</label>
                        <input
                            type="text"
                            value={tenantCode}
                            onChange={(e) => setTenantCode(e.target.value)}
                        />
                    </div>

                    <div className="tenant-form-group">
                        <label>Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            <option value="Retail">Retail</option>
                            <option value="Food">Food</option>
                            <option value="Services">Services</option>
                        </select>
                    </div>

                    <div className="tenant-form-group">
                        <label>Address</label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="tenant-form-group tenant-checkbox-group">
                        <label>Active</label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                        />
                    </div>

                    <button type="submit" className="tenant-submit-btn">{editIndex !== null ? 'Update' : 'Save'}</button>
                    
                </form>

                <table className="tenant-data-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Category</th>
                            <th>Delete</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{tenant.tenantName}</td>
                                <td>{tenant.tenantCode}</td>
                                <td>{tenant.category}</td>
                                {/* <td>
                                    <button
                                        className="tenant-delete-btn"
                                        onClick={() => handleDelete(index)}
                                    >
                                        Delete
                                    </button>
                                </td> */}
                                <td>
                
                <button onClick={() => handleEdit(index)}>
                <FaEdit /> 
              </button>
                
                
              </td>
              <td>
              <button onClick={() => handleDelete(index)}>
                <FaTrash /> 
              </button>
              </td>
                                {/* <td>
                                    <button
                                        className="tenant-edit-btn"
                                        onClick={() => handleEdit(index)}
                                    >
                                        Edit
                                    </button>
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Tenant;
