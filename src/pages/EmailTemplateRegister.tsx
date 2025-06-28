import React, { useEffect, useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import CustomButton from '../components/CustomButton';
import { useNavigate } from 'react-router-dom';
import api from '../api/request';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useLocation } from 'react-router-dom';
const EmailTemplateEditor = () => {
  const emailEditorRef = useRef<any>(null);
  const navigate = useNavigate();
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 

const location = useLocation();

useEffect(() => {
  const query = new URLSearchParams(location.search);
  const templateID = query.get('id');

  if (!templateID) return;

  const fetchTemplate = async () => {
    const res = await api.get(`/EmailTemplate/${templateID}`);
    const template = res.data?.data ?? res.data;

    setFormData({
      name: template.name || '',
      subject: template.subject || '',
      tenantID: template.tenantID || '',
      hospitalID: template.hospitalID || '',
    });

    if (template.designJson) {
      emailEditorRef.current?.editor.loadDesign(template.designJson);
    } else {
      console.warn('No designJson available. Nothing to load.');
    }
  };

  fetchTemplate();
}, [location.search]);


  // ✅ make sure you call this inside your component

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
          toast.success('Email template saved successfully!', {
            autoClose: 1000, // ✅ 1 second
          });

          setTimeout(() => {
            navigate('/EmailTemplate');
          }, 1000);
        } else {
          toast.error('Failed to save template.');
        }
      } catch (err) {
        console.error('API Error:', err);
        toast.error('Something went wrong while saving the template.');
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
      .get(`/Hospital/HospitalsList?tenantId=${formData.tenantID}`)
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
      {/* Back Button */}
      <button
        className="mb-4 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg shadow-sm hover:bg-blue-100 transition duration-200"
        onClick={() => navigate('/EmailTemplate')}
      >
        &larr; Back
      </button>
      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        EmailTemplate
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
      <ToastContainer />
    </div>
  );
};

export default EmailTemplateEditor;
