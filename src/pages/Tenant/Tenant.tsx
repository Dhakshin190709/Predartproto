import React, { useState } from 'react';
import './Tenant.css';
import { FaUserCircle, FaFlag } from 'react-icons/fa';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa'; 

function Tenant() {
  const [tenantName, setTenantName] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [trustworthiness, setTrustworthiness] = useState('');
  const [rating, setRating] = useState(0);
  const [editIndex, setEditIndex] = useState(null);

  // Initialize with six default entries
  const [tenants, setTenants] = useState([
    {
      tenantName: 'Tenant 1',
      tenantCode: 'T001',
      location: 'Location 1',
      isActive: true,
      trustworthiness: 'Perfect',
      rating: 5,
    },
    {
      tenantName: 'Tenant 2',
      tenantCode: 'T002',
      location: 'Location 2',
      isActive: false,
      trustworthiness: 'Sufficient',
      rating: 4,
    },
    {
      tenantName: 'Tenant 3',
      tenantCode: 'T003',
      location: 'Location 3',
      isActive: true,
      trustworthiness: 'Insufficient',
      rating: 3,
    },
    {
      tenantName: 'Tenant 4',
      tenantCode: 'T004',
      location: 'Location 4',
      isActive: false,
      trustworthiness: 'Perfect',
      rating: 5,
    },
    {
      tenantName: 'Tenant 5',
      tenantCode: 'T005',
      location: 'Location 5',
      isActive: true,
      trustworthiness: 'Sufficient',
      rating: 4,
    },
    {
      tenantName: 'Tenant 6',
      tenantCode: 'T006',
      location: 'Location 6',
      isActive: false,
      trustworthiness: 'Insufficient',
      rating: 2,
    },
  ]);

  const getFlagColor = (trustworthiness) => {
    switch (trustworthiness) {
      case 'Perfect':
        return 'green';
      case 'Sufficient':
        return 'blue';
      case 'Insufficient':
        return 'red';
      default:
        return '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tenantName || !tenantCode || !location || !trustworthiness) {
      alert('Please fill out all fields');
      return;
    }

    const newTenant = {
      tenantName,
      tenantCode,
      location,
      isActive,
      trustworthiness,
      rating,
    };

    if (editIndex !== null) {
      const updatedTenants = [...tenants];
      updatedTenants[editIndex] = newTenant;
      setTenants(updatedTenants);
      setEditIndex(null);
    } else {
      setTenants([...tenants, newTenant]);
    }

    setTenantName('');
    setTenantCode('');
    setLocation('');
    setIsActive(false);
    setTrustworthiness('');
    setRating(0);
  };

  const handleEdit = (index) => {
    const tenant = tenants[index];
    setTenantName(tenant.tenantName);
    setTenantCode(tenant.tenantCode);
    setLocation(tenant.location);
    setIsActive(tenant.isActive);
    setTrustworthiness(tenant.trustworthiness);
    setRating(tenant.rating);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedTenants = tenants.filter((_, i) => i !== index);
    setTenants(updatedTenants);
  };

  return (
    <div className="tenant-container">
      <div className="tenant-form-container">
        <form className="tenant-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Code"
            value={tenantCode}
            onChange={(e) => setTenantCode(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <label>
            Active
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
          </label>
          <select
            value={trustworthiness}
            onChange={(e) => setTrustworthiness(e.target.value)}
          >
            <option value="">Trustworthiness</option>
            <option value="Perfect">Perfect</option>
            <option value="Sufficient">Sufficient</option>
            <option value="Insufficient">Insufficient</option>
          </select>
          <input
            type="number"
            placeholder="Rating (1-5)"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            max="5"
            min="1"
          />
          <button type="submit">
            {editIndex !== null ? 'Update' : 'Save'}
          </button>
        </form>
      </div>

      <table className="tenant-table">
        <thead>
          <tr>
            <th>Tenant Name</th>
            <th>Code</th>
            <th>Location</th>
            <th>Status</th>
            <th>Trustworthiness</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant, index) => (
            <tr key={index}>
              <td>
                <div className="contact-container">
                  <FaUserCircle className="contact-icon" />
                  <span>{tenant.tenantName}</span>
                </div>
              </td>
              <td>{tenant.tenantCode}</td>
              {/* <td className="location">
    <span>{tenant.location}</span>
</td> */}

<td className="location">
            <span className="location-icon">
                <FaMapMarkerAlt />
            </span>
            <span>{tenant.location}</span>
        </td>


              <td>
                <span className={`status-pill ${tenant.isActive ? 'active' : 'inactive'}`}>
                  {tenant.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
  <div className="trustworthiness-container">
    <FaFlag className={`flag ${getFlagColor(tenant.trustworthiness)}`} />
    <span>{tenant.trustworthiness}</span>
  </div>
</td>

              <td className="rating">
                {'★'.repeat(tenant.rating)}
                {'☆'.repeat(5 - tenant.rating)}
              </td>
              <td>
                
                <button onClick={() => handleEdit(index)}>
                <FaEdit /> 
              </button>
                
                <button onClick={() => handleDelete(index)}>
                <FaTrash /> 
              </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tenant;
