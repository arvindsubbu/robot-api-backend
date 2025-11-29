# 🤖 Robot Fleet Management API  
A Node.js + Express + MongoDB backend for registering robots, updating robot status, and storing structured event logs.  
Includes API-key authentication, clean REST endpoints, log source tagging, and robust error handling.

---

## 🚀 Features

### Core
- Register robots
- List robots (pagination)
- Get robot details
- Update robot status (battery, mode, location, error)
- Create manual/system/operator logs
- Fetch robot logs (pagination)

### Bonus (Implemented)
- ✔ API Key authentication  
- ✔ Log source tagging (`robot`, `manual`, `system`, `operator`)  
- ✔ Structured logs (`meta` objects)
- ✔ Error & 404 handling
- ✔ Clean project structure

---

## 🛠 Tech Stack
- Node.js  
- Express.js  
- MongoDB Atlas (Mongoose)  
- dotenv  
- Postman (for testing)

---

# ⚙️ **How to Run the Backend**

### **1. Clone the repository**
```bash
git clone <your-repo-url>
cd robot-api-backend
```

### **2. Install dependencies**
```bash
npm install
```

### **3. Create `.env` file**
Create a file named `.env` in the project root:

```
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/robots
```

(Use your actual MongoDB connection string.)

### **4. Start the server**
For normal start:
```bash
node src/server.js
```

For development (auto-restart on save):
```bash
npx nodemon src/server.js
```

### **5. Verify connection**
You should see:
```
MongoDB connected
Server listening on port 3000
```

---

## 📁 Folder Structure

```
robot-api-backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── robots.js
│   │   └── logs.js
│   ├── controllers/
│   │   ├── robotsController.js
│   │   └── logsController.js
│   ├── models/
│   │   ├── Robot.js
│   │   └── Log.js
│   ├── middlewares/
│   │   ├── robotAuth.js
│   │   └── errorHandler.js
│   └── validators/ (optional)
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# 🔐 Authentication (API Key)

Robots authenticate using a unique API key generated during **registration**.

### Required header for protected endpoints:
```
x-api-key: <apiKey>
```

### Protected endpoint:
- `PATCH /robots/:id/status`

### Flow:
1. Robot registers → API key returned  
2. Robot stores this key  
3. Robot must send this key on every status update  
4. `robotAuth` middleware validates it  

---

# 🧪 API Endpoints

---

## ➤ 1. Register Robot  
**POST `/robots`**

**Body**
```json
{
  "id": "RBT001",
  "name": "Alpha",
  "type": "AMR"
}
```

**Response**
```json
{
  "message": "Robot registered successfully",
  "robot": { ... },
  "apiKey": "generated-api-key"
}
```

---

## ➤ 2. List Robots  
**GET `/robots?page=1&limit=20`**

Returns:
```json
{
  "meta": { "total": 1, "page": 1, "limit": 20, "pages": 1 },
  "data": [ {...} ]
}
```

---

## ➤ 3. Get Robot Details  
**GET `/robots/:id`**

---

## ➤ 4. Update Robot Status (Requires API Key)  
**PATCH `/robots/:id/status`**

**Headers**
```
x-api-key: <apiKey>
```

**Body**
```json
{
  "battery": 85,
  "mode": "active",
  "location": { "x": 10, "y": 20 }
}
```

**Response**
```json
{ "message": "Status updated" }
```

This also creates an automatic robot log:
- `source: "robot"`
- `level: "info"` or `"error"`
- `meta` includes structured fields

---

## ➤ 5. Create Manual/System/Operator Log  
**POST `/robots/:id/logs`**

**Body**
```json
{
  "message": "Maintenance completed",
  "level": "info",
  "source": "operator",
  "meta": { "ticket": "T-123" }
}
```

**Response**
```json
{ "message": "Log created", "log": { ... } }
```

🚫 Clients **cannot** send `"source":"robot"`  
Only robots via PATCH status can create robot logs.

---

## ➤ 6. Get Logs  
**GET `/robots/:id/logs?page=1&limit=20`**

**Response**
```json
{
  "meta": { "total": 3, "page": 1, "limit": 20 },
  "data": [
    { "message": "Status update...", "source": "robot" },
    { "message": "Maintenance completed", "source": "operator" }
  ]
}
```

---

# 🧷 `.env.example`
Add this file to your repo:
```
PORT=3000
MONGO_URI=your-mongo-uri-here
```

---

# 🐛 Error Handling
Includes:
- Global error handler  
- 404 route handler  
- Validation and authorization errors  

All return clean JSON responses.

---

# 🧪 Testing with Postman

### Basic test flow:
1. **POST /robots** → robot registers  
   - Copy returned `apiKey`
2. **PATCH /robots/:id/status**  
   - Add header:  
     ```
     x-api-key: <apiKey>
     ```
3. **GET /robots/:id/logs**  
4. **POST /robots/:id/logs** (manual log)  
5. Negative tests:  
   - Missing API key → `401`  
   - Wrong API key → `401`  
   - `"source":"robot"` in POST logs → `403`

---



