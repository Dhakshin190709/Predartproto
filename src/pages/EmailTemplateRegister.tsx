import React, { useEffect, useState } from 'react';
import CustomButton from '../components/CustomButton';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/request';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmailTemplateEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const templateID = query.get('id');
  const isEditMode = !!templateID;
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    tenantID: '',
    hospitalID: '',
    htmlContent: '', // ✅ Add plain HTML content
  });

  const [tenantOptions, setTenantOptions] = useState([]);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!templateID) return;

    const fetchTemplate = async () => {
      const res = await api.get(`/EmailTemplate/${templateID}`);
      const template = res.data?.data ?? res.data;

      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        tenantID: template.tenantID || '',
        hospitalID: template.hospitalID || '',
        htmlContent: template.body || '',
      });
    };

    fetchTemplate();
  }, [templateID]);

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

  const exportHtml = async () => {
    if (!validateForm()) return;

    const userID = sessionStorage.getItem('userID');
    const timestamp = new Date().toISOString();

    const query = new URLSearchParams(location.search);
    const templateID = query.get('id');
    const isEditMode = !!templateID;
    const payload = {
      emailTemplatesID: templateID || undefined, // for PUT
      createdBy: userID,
      createdOn: timestamp,
      updatedBy: userID,
      updatedOn: timestamp,
      isActive: true,
      tenantID: formData.tenantID,
      hospitalID: formData.hospitalID,
      name: formData.name,
      subject: formData.subject,
      body: formData.htmlContent, // ✅ plain HTML
      isHtml: true,
    };

    try {
      let res;
      if (templateID) {
        res = await api.put('/EmailTemplate', payload);
      } else {
        res = await api.post('/EmailTemplate', payload);
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(`Email Template ${templateID ? 'updated' : 'saved'}!`, {
          autoClose: 1000,
        });
        setTimeout(() => navigate('/EmailTemplate'), 1000);
      } else {
        toast.error('Save failed.');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Error saving template.');
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors: Record<string, string> = {};

    const allowedRegex = /^[A-Za-z0-9\s#{}\-\$&–:\/]+$/;

    const emojiRegex = /[\u{1F600}-\u{1F6FF}]/u;
    const repeatedCharRegex = /(.)\1{2,}/;

    if (!formData.tenantID) {
      errors.tenantID = 'Tenant is required.';
      isValid = false;
    }

    if (!formData.hospitalID) {
      errors.hospitalID = 'Hospital is required.';
      isValid = false;
    }

    const name = formData.name.trim();
    if (!name) {
      errors.name = 'Template Name is required.';
      isValid = false;
    } else if (!allowedRegex.test(name)) {
      errors.name = 'Invalid characters in name.';
      isValid = false;
    } else if (emojiRegex.test(name)) {
      errors.name = 'Name cannot contain emojis.';
      isValid = false;
    } else if (repeatedCharRegex.test(name)) {
      errors.name = 'Name cannot have repeated characters.';
      isValid = false;
    }

    const subject = formData.subject.trim();
    if (!subject) {
      errors.subject = 'Subject is required.';
      isValid = false;
    } else if (!allowedRegex.test(subject)) {
      errors.subject =
        'Subject can only contain letters, numbers, spaces, {}, ., ,, -, $, &, :, –';
      isValid = false;
    } else if (emojiRegex.test(subject)) {
      errors.subject = 'Subject cannot contain emojis.';
      isValid = false;
    } else if (repeatedCharRegex.test(subject)) {
      errors.subject = 'Subject cannot have repeated characters.';
      isValid = false;
    }
    // ✅ Require HTML content
    if (!formData.htmlContent.trim()) {
      errors.htmlContent = 'HTML content is required.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  return (
    <div className="p-4">
      <button
        className="mb-4 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg shadow-sm"
        onClick={() => navigate('/EmailTemplate')}
      >
        &larr; Back
      </button>

      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Email Template
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
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

          {formErrors.tenantID && (
            <p className="text-red-500 text-sm mt-1">{formErrors.tenantID}</p>
          )}
        </div>

        <div>
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
          {formErrors.hospitalID && (
            <p className="text-red-500 text-sm mt-1">{formErrors.hospitalID}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="name"
            placeholder="Template Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          />
          {formErrors.subject && (
            <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
          )}
        </div>
      </div>

      <div className="flex h-[70vh] border">
        {/* Left: Preview */}
        <div className="w-1/2 p-4 overflow-auto border-r">
          <h3 className="font-semibold mb-2 text-black">Live Preview</h3>
          <div
            className="border p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
          ></div>
        </div>

        {/* Right: HTML Editor */}
        <div className="w-1/2 p-4">
          <h3 className="font-semibold mb-2 text-black">HTML Editor</h3>
          <textarea
            name="htmlContent"
            value={formData.htmlContent}
            onChange={handleChange}
            className="w-full h-[55vh] border p-2 font-mono"
          />
          {formErrors.htmlContent && (
            <p className="text-red-500 text-sm">{formErrors.htmlContent}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <CustomButton onClick={exportHtml}>Save Template</CustomButton>
      </div>

      <ToastContainer />
    </div>
  );
};

export default EmailTemplateEditor;
