'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiArrowRight, FiEye, FiEyeOff, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useApi } from '@/context/AppContext';

// Country data with dial codes
const countries = [
  { name: '🇺🇸 United States', code: 'US', dialCode: '+1' },
  { name: '🇬🇧 United Kingdom', code: 'GB', dialCode: '+44' },
  { name: '🇮🇳 India', code: 'IN', dialCode: '+91' },
  { name: '🇯🇵 Japan', code: 'JP', dialCode: '+81' },
  { name: '🇨🇳 China', code: 'CN', dialCode: '+86' },
  { name: '🇫🇷 France', code: 'FR', dialCode: '+33' },
  { name: '🇩🇪 Germany', code: 'DE', dialCode: '+49' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, loading: apiLoading, error: apiError, clearError } = useApi();

  const [formData, setFormData] = useState({ 
    phone: '', 
    password: '' 
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to first country
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing phone number, validate it's numeric
    if (name === 'phone') {
      if (value === '' || /^[0-9]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    clearError();
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (formData.phone.length < 5) newErrors.phone = 'Phone number must be at least 5 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 5) newErrors.password = 'Password must be at least 5 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Combine country code and phone number
      const fullPhoneNumber = `${selectedCountry.dialCode}-${formData.phone}`;
      
      await login({
        username: fullPhoneNumber, // Or phone: fullPhoneNumber depending on your API
        password: formData.password
      });
      
      toast.success('Login successful! Redirecting...', {
        autoClose: 1500,
        pauseOnHover: false
      });
      
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      if (!error.message.includes('Incorrect username or password')) {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || apiLoading;

  return (
    <div className="min-h-screen flex items-center text-gray-900 justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
        style={{
          boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.2)'
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
          <div className="p-8 relative">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome Back
                  <motion.span 
                    animate={{ rotate: isHovered ? [0, 10, -10, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block ml-2"
                  >
                    👋
                  </motion.span>
                </h2>
              </motion.div>
              <p className="text-gray-600">Sign in to continue your journey</p>
            </div>

            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center"
                >
                  <div className="flex-1">{apiError}</div>
                  <button 
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600 ml-2"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Number Field with Country Code */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <div className="relative flex-1 max-w-[120px]">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <span>{selectedCountry.dialCode}</span>
                      <FiChevronDown className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showCountryDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto"
                        >
                          {countries.map((country) => (
                            <div
                              key={country.code}
                              className={`px-3 py-2 hover:bg-indigo-50 cursor-pointer flex items-center ${
                                selectedCountry.code === country.code ? 'bg-indigo-100' : ''
                              }`}
                              onClick={() => {
                                setSelectedCountry(country);
                                setShowCountryDropdown(false);
                              }}
                            >
                              <span className="mr-2">{country.dialCode}</span>
                              <span className="text-gray-600">{country.code}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Phone Number Input */}
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.phone 
                          ? 'border-red-500 focus:ring-red-300' 
                          : 'border-gray-300 focus:ring-indigo-300'
                      } focus:outline-none focus:ring-2 transition-all duration-200`}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {errors.phone && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.phone}
                  </motion.p>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Format: {selectedCountry.dialCode}-XXXXXXX
                </div>
              </motion.div>

              {/* Rest of your form remains the same */}
              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-300' 
                        : 'border-gray-300 focus:ring-indigo-300'
                    } focus:outline-none focus:ring-2 transition-all duration-200 pr-10`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div 
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isLoading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`w-full cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                    isLoading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="ml-2">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <motion.span
                        animate={{
                          x: isHovered ? [0, 4, 0] : 0
                        }}
                        transition={{
                          repeat: isHovered ? Infinity : 0,
                          duration: 1.5
                        }}
                      >
                        <FiArrowRight />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              className="mt-6 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/create-account')}
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                disabled={isLoading}
              >
                Create account
              </button>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div 
          className="bg-gray-50 px-8 py-4 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}