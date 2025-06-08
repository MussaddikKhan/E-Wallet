'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiUser, FiPhone, FiMail, FiLock, FiArrowRight, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '@/context/AppContext';

const countryCodes = [
  { code: '+1', name: '🇺🇸 US' },
  { code: '+44', name: '🇬🇧 UK' },
  { code: '+91', name: '🇮🇳 IN' },
  { code: '+81', name: '🇯🇵 JP' },
  { code: '+86', name: '🇨🇳 CN' },
  { code: '+33', name: '🇫🇷 FR' },
  { code: '+49', name: '🇩🇪 DE' },
];

const passwordRequirements = [
  { id: 1, text: 'At least 6 characters', validator: (pw) => pw.length >= 6 },
  { id: 2, text: 'Contains a number', validator: (pw) => /\d/.test(pw) },
  { id: 3, text: 'Contains a special character', validator: (pw) => /[!@#$%^&*]/.test(pw) },
];

export default function CreateAccount() {
  const router = useRouter();
  const { register, loading, error, clearError } = useApi();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Floating animation for decorative elements
  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters';

    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^[0-9]{7,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number (7-15 digits)';
    }

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: `${formData.countryCode}-${formData.phoneNumber}`,
        password: formData.password,
      };

      await register(userData);
      
      setShowSuccess(true);
      setTimeout(() => {
        toast.success('Account created successfully! Redirecting...');
        router.push('/login');
      }, 1500);
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check password requirements
  const checkPasswordRequirements = () => {
    return passwordRequirements.map(req => ({
      ...req,
      fulfilled: req.validator(formData.password)
    }));
  };

  const isLoading = isSubmitting || loading;
  const fullPhoneNumber = formData.countryCode + formData.phoneNumber;

  return (
    <div className="min-h-screen text-gray-900 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-20 left-10 w-40 h-40 bg-purple-100 rounded-full opacity-20 blur-xl"
        animate={floatingAnimation}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-60 h-60 bg-indigo-100 rounded-full opacity-20 blur-xl"
        animate={{
          ...floatingAnimation,
          y: [0, -20, 0],
          transition: { ...floatingAnimation.transition, duration: 10 }
        }}
      />
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <AnimatePresence>
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center"
            >
              <div className="mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FiCheck className="text-green-500 text-4xl" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
                <p className="text-gray-600">Your account has been created successfully</p>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: 'linear' }}
                  className="h-full bg-green-500"
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
            >
              {/* Progress steps */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-2xl font-bold">Create Account</h1>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    Step {currentStep} of 3
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div 
                      key={step}
                      className={`h-1 flex-1 rounded-full ${currentStep >= step ? 'bg-white' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                      <p className="text-gray-500 mb-4">Let's start with your basic details</p>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                          <FiUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`pl-10 w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
                            placeholder="John Doe"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="flex gap-2">
                          <select
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={handleChange}
                            className="w-1/3 px-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none"
                            disabled={isLoading}
                          >
                            {countryCodes.map(c => (
                              <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                          </select>
                          <div className="relative w-2/3">
                            <FiPhone className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              className={`pl-10 w-full px-4 py-3 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
                              placeholder="9876543210"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>}
                        <p className="text-xs text-gray-500 mt-1">We'll send a verification code to {fullPhoneNumber}</p>
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          disabled={!formData.name || !formData.phoneNumber || isLoading}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                          Continue <FiArrowRight />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
                      <p className="text-gray-500 mb-4">Set up your login credentials</p>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                          <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`pl-10 w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
                            placeholder="you@example.com"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                          <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setPasswordFocus(true)}
                            onBlur={() => setTimeout(() => setPasswordFocus(false), 200)}
                            className={`pl-10 w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
                            placeholder="Create a password"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                      </div>

                      <AnimatePresence>
                        {(passwordFocus || formData.password) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">PASSWORD REQUIREMENTS</h4>
                            <ul className="space-y-1">
                              {checkPasswordRequirements().map(req => (
                                <li key={req.id} className="flex items-center">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${req.fulfilled ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                    {req.fulfilled && <FiCheck className="text-xs" />}
                                  </span>
                                  <span className={`text-xs ${req.fulfilled ? 'text-gray-700' : 'text-gray-500'}`}>
                                    {req.text}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition"
                          disabled={isLoading}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          disabled={!formData.email || !formData.password || isLoading}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                          Continue <FiArrowRight />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-semibold text-gray-900">Review Information</h2>
                      <p className="text-gray-500 mb-4">Please confirm your details before creating your account</p>
                      
                      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Full Name:</span>
                          <span className="font-medium">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone:</span>
                          <span className="font-medium">{fullPhoneNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-medium">{formData.email}</span>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 mr-2"
                          required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                        </label>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition"
                          disabled={isLoading}
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                              Creating...
                            </>
                          ) : (
                            'Create Account'
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => router.push('/login')}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                      disabled={isLoading}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}