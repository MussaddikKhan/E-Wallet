import { FiCreditCard, FiRefreshCw, FiEdit, FiPlus, FiMinus } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function BankDetails({ bankAccount, expandedView = false }) {
  if (!bankAccount) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-sm ${expandedView ? 'p-8' : 'p-6'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <FiCreditCard className="mr-2 text-indigo-600" />
            Bank Account
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          No bank account linked yet
        </div>
        <button className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
          Link Bank Account
        </button>
      </motion.div>
    );
  }
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`bg-white rounded-xl shadow-sm ${expandedView ? 'p-8' : 'p-6'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <FiCreditCard className="mr-2 text-indigo-600" />
          Bank Account
        </h2>
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-indigo-600 p-1">
            <FiRefreshCw size={18} />
          </button>
          {expandedView && (
            <button className="text-gray-500 hover:text-indigo-600 p-1">
              <FiEdit size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-4 text-white">
          <p className="text-sm opacity-80">Account Number</p>
          <p className="text-xl font-bold tracking-wider">
            {bankAccount?.accountNumber}
          </p>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-right">
              <p className="text-xs opacity-80">Balance</p>
              <p className="font-medium">
                {bankAccount?.balance.toLocaleString()} {bankAccount?.currency}
              </p>
            </div>
          </div>
        </div>
        
        {expandedView ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Account Details</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-950">
                    <span className="text-gray-900">Account Type:</span> Savings
                  </p>
                  <p className="text-sm text-gray-950">
                    <span className="text-gray-900">Opened On:</span> {new Date(bankAccount?.createdOn).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-950">
                    <span className="text-gray-900">Last Updated:</span> {new Date(bankAccount?.updatedOn).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100">
                    <FiPlus className="mr-1" /> Deposit
                  </button>
                  <button className="flex items-center justify-center p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100">
                    <FiMinus className="mr-1" /> Withdraw
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button className="py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
                View Transaction History
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button className="py-2 px-4 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition">
              Withdraw
            </button>
            <button className="py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
              Deposit
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}