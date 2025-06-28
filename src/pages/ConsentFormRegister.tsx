import React, { useEffect, useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import { useNavigate, useLocation } from 'react-router-dom';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/request';

const ConsentFormEditor = () => {
  const emailEditorRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    tenantID: '',
    htmlContent: '',
  });
  const [tenantOptions, setTenantOptions] = useState([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

        if (template.design) {
          emailEditorRef.current?.editor.loadDesign(template.design);
        } else if (template.htmlContent) {
          // fallback design to show htmlContent as a block
          const fallbackDesign = {
            body: {
              rows: [
                {
                  columns: [
                    {
                      contents: [
                        {
                          type: 'html',
                          values: { html: template.htmlContent },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          };
          emailEditorRef.current?.editor.loadDesign(fallbackDesign);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error('Failed to load template');
      }
    };

    fetchTemplate();
  }, [location.search]);

  useEffect(() => {
    // Load tenant list
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

  const exportHtml = () => {
    const editor = emailEditorRef.current?.editor;
    if (!isEditorReady || !editor) {
      alert('Editor not ready');
      return;
    }

    editor.exportHtml(async (data: any) => {
      const htmlContent = data.html;
      const design = data.design;
      const userID = sessionStorage.getItem('userID');
      const timestamp = new Date().toISOString();

      const payload = {
        createdBy: userID,
        createdOn: timestamp,
        updatedBy: userID,
        updatedOn: timestamp,
        isActive: true,
        tenantID: formData.tenantID,
        title: formData.title,
        htmlContent,
        design,
      };

      try {
        const res = await api.post('/ConsentFormTemplate', payload);
        if (res.status === 200 || res.status === 201) {
          toast.success('Consentform Template saved!', { autoClose: 1000 });
          setTimeout(() => navigate('/ConsentForm'), 1000);
        } else {
          toast.error('Save failed.');
        }
      } catch (err) {
        console.error('Save error:', err);
        toast.error('Error saving template.');
      }
    });
  };

  return (
    <div className="p-4">
      <button
        className="mb-4 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg"
        onClick={() => navigate('/ConsentForm')}
      >
        &larr; Back
      </button>

      <h2 className="mb-6 text-2xl font-bold">Consent Form Register</h2>

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

        <input
          type="text"
          name="title"
          placeholder="Enter Title"
          value={formData.title}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <EmailEditor
        ref={emailEditorRef}
        onReady={() => {
          setIsEditorReady(true);
          console.log('Editor Ready');
        }}
      />

      <div className="mt-4">
        <button
          onClick={exportHtml}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Template
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ConsentFormEditor;
