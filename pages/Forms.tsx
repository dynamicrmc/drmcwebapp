import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormType } from '../types';
import { SERVICES as SERVICE_LIST } from '../constants';
import { Loader2, AlertCircle, Upload, Calendar, Clock, MapPin, Briefcase, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';

// Formspree Endpoints Mapping
const formEndpoints: Record<FormType, string> = {
  [FormType.BOOKING]: "https://formspree.io/f/xldyjpaw",
  [FormType.JOB]: "https://formspree.io/f/xyzqenln",
  [FormType.CONSULTANCY]: "https://formspree.io/f/xgvjanqr",
  [FormType.TRAINING]: "https://formspree.io/f/xgvjanjr"
};

// Moved Label component definition outside FormPage to avoid type errors and re-creation on render
const Label = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {children} <span className="text-red-500">*</span>
  </label>
);

const FormPage: React.FC<{ type: FormType }> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedService = location.state?.preSelectedService || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
    serviceInterest: preSelectedService,
    date: '',
    time: '',
    file: null as File | null,
    // Job Application Specific
    stateOfResidence: '',
    areaOfJobInterest: '',
    // Consultancy Specific
    consultancyArea: '',
    officeLocation: '',
    // Training Specific
    trainingArea: '',
    participantLocation: ''
  });

  const [fileError, setFileError] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 2 * 1024 * 1024; // 2MB

      // Validate file size
      if (selectedFile.size > maxSize) {
        setFileError('File size exceeds 2MB limit. Please upload a smaller file.');
        e.target.value = ''; // Reset input
        setFormData({ ...formData, file: null });
        return;
      }

      setFormData({ ...formData, file: selectedFile });
    } else {
      setFormData({ ...formData, file: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Validation for Job Application (File is now required)
    if (type === FormType.JOB) {
      if (!formData.file) {
        setFileError('Please upload your CV to proceed.');
        return;
      }
    }

    if (fileError) return;
    
    setStatus('submitting');
    
    const endpoint = formEndpoints[type];
    const data = new FormData();

    // Append standard fields
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('message', formData.message);
    
    if (formData.serviceInterest) {
      data.append('serviceInterest', formData.serviceInterest);
    }

    // Append Consultancy specific fields
    if (type === FormType.CONSULTANCY) {
      data.append('Area of Consultancy', formData.consultancyArea);
      data.append('Office Location/Address', formData.officeLocation);
      data.append('Preferred Date', formData.date);
      data.append('Preferred Time', formData.time);
    }

    // Append Job specific fields
    if (type === FormType.JOB) {
       data.append('State of Residence', formData.stateOfResidence);
       data.append('Area of Job Interest', formData.areaOfJobInterest);
       if (formData.file) {
         data.append('cv', formData.file);
       }
    }

    // Append Training specific fields
    if (type === FormType.TRAINING) {
      data.append('Desired Training Area', formData.trainingArea);
      data.append('Location/Address', formData.participantLocation);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        navigate('/thank-you', { state: { name: formData.fullName } });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      if (status !== 'error') {
         // status is handled by redirect if success, or set to error catch
      } else {
         setStatus('idle');
      }
    }
  };

  const getTitle = () => {
    switch (type) {
      case FormType.JOB: return 'Job Application';
      case FormType.CONSULTANCY: return 'Request Consultancy';
      case FormType.TRAINING: return 'Training Registration';
      case FormType.BOOKING: return 'Book a Service';
      default: return 'Contact Form';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case FormType.JOB: return 'Submit your details and CV to join our talent pool.';
      case FormType.CONSULTANCY: return 'Tell us about your organizational needs.';
      case FormType.TRAINING: return 'Register for our upcoming training sessions.';
      case FormType.BOOKING: return 'Schedule a service with our experts.';
      default: return 'We look forward to hearing from you.';
    }
  };

  return (
    <div className="pt-12 pb-24 bg-gray-50 min-h-screen">
      <SEO 
        title={getTitle()} 
        description={getSubtitle()}
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-secondary px-8 py-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">{getTitle()}</h1>
            <p className="text-gray-300">{getSubtitle()}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {status === 'error' && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <span>Something went wrong. Please try again.</span>
              </div>
            )}

            {/* Standard Fields */}
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email Address</Label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="+234..."
                  />
                </div>
              </div>
            </div>

            {/* JOB SPECIFIC FIELDS */}
            {type === FormType.JOB && (
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>State of Residence</Label>
                    <input
                      type="text"
                      name="stateOfResidence"
                      required
                      value={formData.stateOfResidence}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Lagos"
                    />
                  </div>
                  <div>
                    <Label>Area of Job Interest</Label>
                    <input
                      type="text"
                      name="areaOfJobInterest"
                      required
                      value={formData.areaOfJobInterest}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Accounting, HR"
                    />
                  </div>
                 </div>
              </div>
            )}

            {/* TRAINING SPECIFIC FIELDS */}
            {type === FormType.TRAINING && (
              <div className="space-y-4">
                  <div>
                    <Label>Desired Training Areas</Label>
                    <input
                      type="text"
                      name="trainingArea"
                      required
                      value={formData.trainingArea}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Leadership, Soft Skills"
                    />
                  </div>
                  <div>
                    <Label>Address/Location</Label>
                    <input
                      type="text"
                      name="participantLocation"
                      required
                      value={formData.participantLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Ikeja, Lagos"
                    />
                  </div>
              </div>
            )}

            {/* CONSULTANCY SPECIFIC FIELDS */}
            {type === FormType.CONSULTANCY && (
              <>
                <div className="space-y-4">
                   <div>
                      <Label>Area of Consultancy Needed</Label>
                      <input
                        type="text"
                        name="consultancyArea"
                        required
                        value={formData.consultancyArea}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="e.g. HR Restructuring"
                      />
                   </div>
                   <div>
                      <Label>Office Location/Address</Label>
                      <input
                        type="text"
                        name="officeLocation"
                        required
                        value={formData.officeLocation}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Your company address"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                       <Calendar size={16} className="text-primary"/> Preferred Date <span className="text-red-500">*</span>
                     </label>
                     <input 
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                       <Clock size={16} className="text-primary"/> Preferred Time <span className="text-red-500">*</span>
                     </label>
                     <input 
                        type="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                     />
                  </div>
                </div>
              </>
            )}

            {/* BOOKING SPECIFIC FIELDS */}
            {type === FormType.BOOKING && (
               <div>
                <Label>Service Required</Label>
                <select
                  name="serviceInterest"
                  value={formData.serviceInterest}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select a Service...</option>
                  {SERVICE_LIST.map(s => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Conditional File Upload (Required for Job) */}
            {type === FormType.JOB && (
              <div>
                <Label>Upload CV (Word Document)</Label>
                <div className={`border-2 border-dashed rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative ${fileError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                  <input
                    type="file"
                    name="file"
                    required
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                     <Upload size={32} className={`mb-2 ${fileError ? 'text-red-400' : 'text-gray-400'}`} />
                     {formData.file ? (
                        <p className="text-sm font-medium text-green-600">{formData.file.name}</p>
                     ) : (
                        <>
                          <p className={`text-sm font-medium ${fileError ? 'text-red-600' : 'text-gray-600'}`}>Click to upload CV</p>
                          <p className={`text-xs mt-1 ${fileError ? 'text-red-500' : 'text-gray-400'}`}>DOC or DOCX only (Max 2MB)</p>
                        </>
                     )}
                  </div>
                </div>
                {fileError && (
                  <p className="text-red-500 text-xs mt-1">{fileError}</p>
                )}
              </div>
            )}

            <div>
              <Label>Additional Message</Label>
              <textarea
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder={type === FormType.JOB ? "Tell us a bit about yourself..." : "How can we help you?"}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-200"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const JobForm = () => <FormPage type={FormType.JOB} />;
export const ConsultancyForm = () => <FormPage type={FormType.CONSULTANCY} />;
export const TrainingForm = () => <FormPage type={FormType.TRAINING} />;
export const BookingForm = () => <FormPage type={FormType.BOOKING} />;