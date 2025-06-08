import { FiDollarSign, FiRefreshCw, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function WalletDetails({ wallet, expandedView = false }) {
  if (!wallet) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-sm ${expandedView ? 'p-8' : 'p-6'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <FiDollarSign className="mr-2 text-indigo-600" />
            Wallet
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          Wallet not initialized yet
        </div>
        <button className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
          Create Wallet
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm ${expandedView ? 'p-8' : 'p-6'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <FiDollarSign className="mr-2 text-indigo-600" />
          Wallet Balance
        </h2>
        <button className="text-gray-500 hover:text-indigo-600">
          <FiRefreshCw />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-900">Available Balance</p>
          <p className="text-2xl font-bold text-indigo-700">
            {wallet?.balance.toLocaleString()} {wallet?.currency}
          </p>
        </div>
        
        {expandedView ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-950">Total Received</p>
                    <p className="font-medium text-gray-700">1,250 {wallet?.currency}</p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <FiArrowDown />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-950">Total Sent</p>
                    <p className="font-medium text-gray-700">750 {wallet?.currency}</p>
                  </div>
                  <div className="p-2 rounded-full bg-red-100 text-red-600">
                    <FiArrowUp />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
                View Transaction History
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-900">Total Received</p>
              <p className="font-medium text-gray-800">1,250 {wallet?.currency}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-900">Total Sent</p>
              <p className="font-medium text-gray-800">750 {wallet?.currency}</p>
            </div>
          </div>
        )}
        
        <button className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
          Add Funds
        </button>
      </div>
    </motion.div>
  );
}
