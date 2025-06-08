import { FiUser, FiPhone, FiMail, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function UserProfile({ user, expandedView = false }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={expandedView ? 'space-y-6' : 'space-y-4'}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl">
          <FiUser />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{user?.name}</h3>
          <p className="text-sm text-gray-500">
            Member since {new Date(user?.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-gray-700">
          <FiMail className="mr-3 text-gray-500" />
          <span>{user?.email}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <FiPhone className="mr-3 text-gray-500" />
          <span>{user?.countryCode} {user?.phoneNumber}</span>
        </div>
        {expandedView && (
          <div className="flex items-center text-gray-700">
            <FiCalendar className="mr-3 text-gray-500" />
            <span>Last updated: {new Date(user?.updatedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {expandedView && (
        <div className="pt-4 border-t border-gray-200">
          <button className="py-2 px-4 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition">
            Edit Profile
          </button>
        </div>
      )}
    </motion.div>
  );
}