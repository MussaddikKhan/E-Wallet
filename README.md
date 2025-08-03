
# 💸 E-Wallet Microservices System

A distributed microservices-based E-Wallet system built with Spring Boot, Apache Kafka, and MySQL. It allows secure wallet and bank transactions using JWT authentication and Kafka event-based communication.

---

## 🔧 Tech Stack

- Java 17, Spring Boot
- Spring Security + JWT
- Apache Kafka
- MySQL
- Maven
- REST APIs

---

## 📂 Microservices

| Service             | Port | Description                                |
|---------------------|------|--------------------------------------------|
| User Service        | 8081 | Manages signup, login, and authentication  |
| Wallet Service      | 8082 | Manages wallet creation and balance        |
| Bank Service        | 8083 | Handles bank accounts and fund updates     |
| Transaction Service | 8084 | Coordinates and tracks all transactions    |

---

## 🧳 Prerequisites

- Java 17+
- Maven
- MySQL
- Apache Kafka & Zookeeper

---

## ⚙️ Kafka Setup

Make sure Kafka and Zookeeper are running locally on `localhost:9092`.

Create the following topics (if `auto.create.topics.enable` is false):

```bash
bin/kafka-topics.sh --create --topic user-registration-topic --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic bank-to-wallet --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic wallet-to-person --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic update-txn-sender --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic update-txn-receiver --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic update-wallet-amount --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic update-bank-amount --bootstrap-server localhost:9092
```

---

## 🗄️ MySQL Setup

Create databases for each microservice:

```sql
CREATE DATABASE userdb;
CREATE DATABASE walletdb;
CREATE DATABASE bankdb;
CREATE DATABASE transactiondb;
```

Update `application.properties` for each service:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/userdb
spring.datasource.username=root
spring.datasource.password=your_password
spring.kafka.bootstrap-servers=localhost:9092
jwt.secret=your_secret_key
currency.api.key=your_api_key
```

---

## ▶️ How to Run

Start Zookeeper and Kafka first:

```bash
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka
bin/kafka-server-start.sh config/server.properties
```

Then run each microservice from its directory:

```bash
cd user-service && mvn spring-boot:run
cd wallet-service && mvn spring-boot:run
cd bank-service && mvn spring-boot:run
cd transaction-service && mvn spring-boot:run
```

---

## 🔐 JWT Authentication Flow

1. `POST /user/signup` – Registers a user and emits Kafka event.
2. `POST /user/login` – Authenticates and returns JWT.
3. For all secured endpoints, use:

```http
Authorization: Bearer <your_token>
```

---

## 🔁 Kafka Topics (Used for Asynchronous Events)

| Topic                  | Publisher         | Consumer           | Purpose                              |
|------------------------|-------------------|--------------------|--------------------------------------|
| user-registration-topic | User Service     | Wallet Service     | Create wallet after user signup      |
| bank-to-wallet         | Transaction       | Bank + Wallet      | Transfer funds to wallet             |
| wallet-to-person       | Transaction       | Wallet + Bank      | Wallet → Receiver bank account       |
| update-txn-sender      | Wallet/Bank       | Transaction        | Update sender transaction status     |
| update-txn-receiver    | Wallet/Bank       | Transaction        | Create credit entry for receiver     |
| update-wallet-amount   | Transaction       | Wallet             | Refund to sender’s wallet (on fail)  |
| update-bank-amount     | Transaction       | Bank               | Refund to sender’s bank (on fail)    |

---

## 📬 API Endpoints (Sample)

### 🔹 User Service
- `POST /user/signup`
- `POST /user/login`
- `GET /user/get/{phoneNumber}`

### 🔹 Wallet Service
- `GET /wallet/view/balance` – Requires JWT

### 🔹 Bank Service
- `POST /bank/add/money`
- `GET /bank/view/balance`

### 🔹 Transaction Service
- `POST /transaction/initiate`
- `GET /transaction/get`
- `GET /transaction/get/msg?txnId=`

---

## ✅ Features

- ✅ Kafka-based decoupled communication
- ✅ JWT-secured APIs
- ✅ Multi-currency support with live conversion
- ✅ Transaction logs for both sender and receiver
- ✅ Error handling and refund support

---

## 📌 Future Improvements

- Dockerize the full system
- Add retry & dead-letter Kafka topics
- Improve exception handling and logging
- Add role-based dashboards (Admin/User)

---

## 👨‍💻 Author

Made by Musaddik Khan 
For interview use and backend architecture practice.
