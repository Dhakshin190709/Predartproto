import React, { useEffect, useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import CustomButton from '../components/CustomButton';
import api from '../api/request';

const EmailTemplateEditor = () => {
  const emailEditorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false); // <-- Track load

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    tenantID: '',
    hospitalID: '',
  });

  const [tenantOptions, setTenantOptions] = useState([]);
  const [hospitalOptions, setHospitalOptions] = useState([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const exportHtml = () => {
  const editorInstance = emailEditorRef.current?.editor;

  if (!isEditorReady || !editorInstance) {
    alert('Email editor is not ready yet.');
    console.log('Editor Not Ready:', emailEditorRef.current);
    return;
  }

  editorInstance.exportHtml(async (data: any) => {
    const htmlContent = data.html;

    console.log('Generated HTML:', htmlContent);

    const userID = sessionStorage.getItem('userID');
    const timestamp = new Date().toISOString();

    const payload = {
      createdBy: userID,
      createdOn: timestamp,
      updatedBy: userID,
      updatedOn: timestamp,
      isActive: true,
      tenantID: formData.tenantID,
      hospitalID: formData.hospitalID,
      name: formData.name,
      subject: formData.subject,
      body: htmlContent,
      isHtml: true,
    };

    try {
      const response = await api.post('/EmailTemplate', payload);
      if (response.status === 200 || response.status === 201) {
        alert('Email template saved successfully!');
      } else {
        alert('Failed to save template.');
      }
    } catch (err) {
      console.error('API Error:', err);
      alert('Something went wrong while saving the template.');
    }
  });
};

  useEffect(() => {
    api
      .get('/Tenant')
      .then((res) => {
        if (res.data?.success) {
          const activeTenants = res.data.data.filter((t: any) => t.isActive);
          setTenantOptions(activeTenants);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch tenants:', err);
      });
  }, []);

  useEffect(() => {
    if (!formData.tenantID) {
      setHospitalOptions([]);
      return;
    }

    api
      .get(`/Hospital/List?tenantId=${formData.tenantID}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setHospitalOptions(res.data);
        } else {
          setHospitalOptions([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch hospitals:', err);
      });
  }, [formData.tenantID]);

  return (
    <div className="p-4">
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Email Template
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <select
          name="tenantID"
          value={formData.tenantID}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select Tenant</option>
          {tenantOptions.map((tenant: any) => (
            <option key={tenant.tenantID} value={tenant.tenantID}>
              {tenant.tenantName}
            </option>
          ))}
        </select>

        <select
          name="hospitalID"
          value={formData.hospitalID}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select Hospital</option>
          {hospitalOptions.map((hosp: any) => (
            <option key={hosp.hospitalID} value={hosp.hospitalID}>
              {hosp.hospitalName}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="name"
          placeholder="Template Name"
          value={formData.name}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        />

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

     <EmailEditor
  ref={emailEditorRef}
  onReady={() => {
    setIsEditorReady(true);
    console.log('Editor Ready!');
  }}
/>


      <div className="mt-4">
        <CustomButton onClick={exportHtml}>Save Template</CustomButton>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
