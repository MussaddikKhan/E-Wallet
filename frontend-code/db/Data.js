// // lib/data.js
// const now = new Date().toISOString();

// const users = [
//   {
//     id: "1",
//     name: "John Doe",
//     phoneNumber: "1234567890",
//     email: "john@example.com",
//     password: "$2a$10$sampleHashedPassword1",
//     countryCode: "+1",
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     id: "2",
//     name: "Jane Smith",
//     phoneNumber: "9876543210",
//     email: "jane@example.com",
//     password: "$2a$10$sampleHashedPassword2",
//     countryCode: "+91",
//     createdAt: now,
//     updatedAt: now
//   }
// ];

// const bankAccounts = [
//   {
//     id: "1",
//     userId: "1",
//     accountNumber: "123456789012",
//     bankName: "Global Bank",
//     balance: 1500,
//     currency: "USD",
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     id: "2",
//     userId: "2",
//     accountNumber: "987654321098",
//     bankName: "Indian Bank",
//     balance: 100000,
//     currency: "INR",
//     createdAt: now,
//     updatedAt: now
//   }
// ];

// const wallets = [
//   {
//     id: "1",
//     userId: "1",
//     balance: 500,
//     currency: "USD",
//     createdAt: now,
//     updatedAt: now
//   },
//   {
//     id: "2",
//     userId: "2",
//     balance: 2000,
//     currency: "INR",
//     createdAt: now,
//     updatedAt: now
//   }
// ];

// const transactions = [
//   {
//     id: "1",
//     senderId: "1",
//     receiverId: "2",
//     amount: 100,
//     fromCurrency: "USD",
//     toCurrency: "INR",
//     paymentMethod: "Wallet",
//     status: "completed",
//     createdAt: now,
//     updatedAt: now
//   }
// ];

// const currencyRates = [
//   {
//     id: 1,
//     baseCurrency: "USD",
//     targetCurrency: "INR",
//     exchangeRate: 83.5,
//     updatedAt: now
//   },
//   {
//     id: 2,
//     baseCurrency: "USD",
//     targetCurrency: "EUR",
//     exchangeRate: 0.93,
//     updatedAt: now
//   }
// ];

// function getBankAccountByUserId(userId) {
//   return bankAccounts.find(acc => acc.userId === userId);
// }

// function getWalletByUserId(userId) {
//   return wallets.find(wallet => wallet.userId === userId);
// }

// function getUserByUserEmail(email) {
//   return users.find(user => user.email === email);
// }

// // Export all together in one object
// export default {
//   users,
//   bankAccounts,
//   wallets,
//   transactions,
//   currencyRates,
//   getBankAccountByUserId,
//   getWalletByUserId,
//   getUserByUserEmail
// };

