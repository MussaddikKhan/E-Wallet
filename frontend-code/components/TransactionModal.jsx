'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionModal({ isOpen, onClose, onSubmit, type, walletId, bankAccountId }) {
  const [amount, setAmount] = useState('');
  const [recipientWalletId, setRecipientWalletId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    let transactionData = { amount: parseFloat(amount) };
    if (type === 'walletToWallet') {
      transactionData.recipientWalletId = recipientWalletId;
    }
    
    onSubmit(transactionData);
    setLoading(false);
  };

  const getTitle = () => {
    switch (type) {
      case 'walletToWallet': return 'Send to Wallet';
      case 'bankToWallet': return 'Transfer from Bank to Wallet';
      case 'walletToBank': return 'Transfer from Wallet to Bank';
      default: return 'Transaction';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{getTitle()}</h2>
              
              <form onSubmit={handleSubmit}>
                {type === 'walletToWallet' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Recipient Wallet ID</label>
                    <input
                      type="text"
                      value={recipientWalletId}
                      onChange={(e) => setRecipientWalletId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}