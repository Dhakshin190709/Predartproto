import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/request';
import CustomButton from '../components/CustomButton';

const ConsentFormEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    tenantID: '',
    htmlContent: '',
  });
  const [tenantOptions, setTenantOptions] = useState([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const templateID = query.get('id');
    if (!templateID) return;

    const fetchTemplate = async () => {
      try {
        const res = await api.get(`/ConsentFormTemplate/${templateID}`);
        const template = res.data?.data;

        console.log('Fetched Template:', template);

        setFormData({
          title: template.title,
          tenantID: template.tenantID,
          htmlContent: template.htmlContent || '',
        });
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error('Failed to load template');
      }
    };

    fetchTemplate();
  }, [location.search]);

  useEffect(() => {
    api
      .get('/Tenant')
      .then((res) => {
        const activeTenants = res.data.data.filter((t: any) => t.isActive);
        setTenantOptions(activeTenants);
      })
      .catch((err) => {
        console.error('Tenant fetch error:', err);
        toast.error('Failed to load tenants');
      });
  }, []);

  const exportHtml = async () => {
    if (!validateForm()) return;

    const userID = sessionStorage.getItem('userID');
    const timestamp = new Date().toISOString();

    // Get templateID from URL
    const query = new URLSearchParams(location.search);
    const templateID = query.get('id');

    const payload = {
      consentFormTemplateID: templateID || undefined, // Required for PUT
      createdBy: userID,
      createdOn: timestamp,
      updatedBy: userID,
      updatedOn: timestamp,
      isActive: true,
      tenantID: formData.tenantID,
      title: formData.title,
      htmlContent: formData.htmlContent,
    };

    try {
      let res;

      if (templateID) {
        // ✅ Use PUT — baseURL covers domain
        res = await api.put(`/ConsentFormTemplate`, payload);
      } else {
        // ✅ Use POST — baseURL covers domain
        res = await api.post(`/ConsentFormTemplate`, payload);
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(
          `Consent Form Template ${templateID ? 'updated' : 'saved'}!`,
          { autoClose: 1000 },
        );
        setTimeout(() => navigate('/ConsentForm'), 1000);
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

    const allowedRegex = /^[A-Za-z0-9\s#{}\-\$&]+$/;
    const emojiRegex = /[\u{1F600}-\u{1F6FF}]/u;
    const repeatedCharRegex = /(.)\1{2,}/;

    if (!formData.tenantID) {
      errors.tenantID = 'Tenant is required.';
      isValid = false;
    }

    const title = formData.title?.trim() || '';
    if (!title) {
      errors.title = 'Title is required.';
      isValid = false;
    } else if (!allowedRegex.test(title)) {
      errors.title =
        'Title can only contain letters, numbers, spaces, and # {} - $ &';
      isValid = false;
    } else if (emojiRegex.test(title)) {
      errors.title = 'Title cannot contain emojis.';
      isValid = false;
    } else if (repeatedCharRegex.test(title)) {
      errors.title = 'Title cannot have repeated characters.';
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
        className="mb-4 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg"
        onClick={() => navigate('/ConsentForm')}
      >
        &larr; Back
      </button>

      <h2 className="mb-9 text-2xl font-bold text-black sm:text-3xl">
        Consent Form Register
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
          <input
            type="text"
            name="title"
            placeholder="Enter Title"
            value={formData.title}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          />
          {formErrors.title && (
            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
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
            <p className="text-red-500 text-sm mt-1">
              {formErrors.htmlContent}
            </p>
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

export default ConsentFormEditor;
