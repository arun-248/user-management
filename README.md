# 👥 User Management System

<div align="center">

[![Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white&style=for-the-badge)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite&logoColor=white&style=for-the-badge)](https://www.sqlite.org/)
[![Winston](https://img.shields.io/badge/Winston-Logger-000000?style=for-the-badge)](https://github.com/winstonjs/winston)

**🎯 A robust Node.js application providing RESTful API endpoints for comprehensive user management**

</div>

---

## 🌟 Project Highlights

> **Complete User Management Solution**: A production-ready Node.js application with RESTful APIs for creating, reading, updating, and deleting users, built with modern best practices and efficient database management.

**🎯 What makes this special:**
- **RESTful API design** with Express framework
- **SQLite database** for lightweight, efficient data storage
- **Advanced logging** with Winston and Morgan
- **UUID-based** unique identification
- **Modular architecture** for scalability and maintainability
- **Pre-seeded data** with manager accounts

---

## 🚀 Key Features

**🔐 Complete CRUD Operations**
* Create new users with validation
* Retrieve users with flexible filtering
* Update user information in bulk
* Delete users by ID or mobile number
* Manager-user relationship management

**📊 Database Management**
* SQLite integration with better-sqlite3
* Auto-created database structure
* Pre-seeded manager accounts
* Efficient data queries
* Transaction support

**📝 Advanced Logging**
* Winston logger for application logs
* Morgan for HTTP request logging
* Structured log format
* Error tracking and debugging
* Production-ready logging setup

**🏗️ Modular Architecture**
* Separation of concerns
* Reusable components
* Clean code structure
* Easy maintenance and scaling
* Route-based organization

---

## 📖 API Endpoints

### **1. 📝 Create User**
**POST** `/create_user`

Creates a new user in the system with full validation.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "mob_num": "+919876543210",
  "pan_num": "ABCDE1234F",
  "manager_id": "3f1c1a50-0c9c-4a7d-9f56-9a0e6b96b8ab"
}
```

**Features:**
* Auto-generates unique UUID
* Validates mobile number format
* Validates PAN number format
* Links user to manager

---

### **2. 🔍 Get Users**
**POST** `/get_users`

Retrieves users with optional filtering capabilities.

**Optional Filters:**
* `user_id` - Filter by specific user ID
* `mob_num` - Filter by mobile number
* `manager_id` - Get all users under a manager

**Request Body (Optional):**
```json
{
  "user_id": "uuid-here",
  "mob_num": "+919876543210",
  "manager_id": "uuid-here"
}
```

---

### **3. ✏️ Update User**
**POST** `/update_user`

Updates user information for single or multiple users.

**Request Body:**
```json
{
  "user_ids": ["uuid-1", "uuid-2"],
  "update_data": {
    "full_name": "Updated Name",
    "mob_num": "+919999999999"
  }
}
```

**Features:**
* Bulk update support
* Partial updates allowed
* Validation on update data

---

### **4. 🗑️ Delete User**
**POST** `/delete_user`

Deletes user by user ID or mobile number.

**Request Body (Option 1):**
```json
{
  "user_id": "uuid-here"
}
```

**Request Body (Option 2):**
```json
{
  "mob_num": "+919876543210"
}
```

---

## 🛠️ Technologies Used

### **Backend Framework**
- **Node.js** – JavaScript runtime environment
- **Express.js** – Fast, minimalist web framework
- **Nodemon** – Auto-restart during development

### **Database**
- **SQLite** – Lightweight, serverless database
- **better-sqlite3** – Fast synchronous SQLite3 binding
- **UUID** – Unique identifier generation

### **Logging & Monitoring**
- **Winston** – Versatile logging library
- **Morgan** – HTTP request logger middleware

### **Validation & Utilities**
- Custom validators for mobile and PAN numbers
- Modular helper functions
- Error handling middleware

---

## 📂 Project Structure

```
user-management/
│
├── src/
│   ├── app.js              # Express app setup & middleware
│   ├── server.js           # Server entry point
│   │
│   ├── db/
│   │   └── index.js        # SQLite database + seed managers
│   │
│   ├── routes/
│   │   └── users.js        # User management routes
│   │
│   └── utils/
│       ├── logger.js       # Winston logger configuration
│       └── validators.js   # Validation helper functions
│
├── data/
│   └── app.db              # SQLite database file (auto-created)
│
├── logs/                   # Application logs directory
│
├── package.json
├── package-lock.json
└── README.md
```

---

## 🚀 Setup & Installation

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn package manager

### **Installation Steps**

**1. Clone the Repository**
```bash
git clone <your-repo-url>
cd user-management
```

**2. Install Dependencies**
```bash
npm install
```

**3. Run the Application**
```bash
npx nodemon src/server.js
```

**4. Access the Server**
```
Server will start at: http://localhost:3000
```

---

## 🗄️ Database Information

### **Database Configuration**
* **Type**: SQLite
* **Location**: `data/app.db` (auto-created)
* **Library**: better-sqlite3
* **Initialization**: Automatic on first run

### **Pre-seeded Managers**
The database comes with 3 pre-configured manager accounts:

| Manager ID | Usage |
|------------|-------|
| `3f1c1a50-0c9c-4a7d-9f56-9a0e6b96b8ab` | Manager 1 |
| `a6e6b813-0b91-4e1b-8d2e-7cdd2fbd3b45` | Manager 2 |
| `5b2c9e6d-0f7a-4c13-9e6a-2d3c4b5a6e7f` | Manager 3 |

### **Database Schema**

**Users Table:**
```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  mob_num TEXT UNIQUE NOT NULL,
  pan_num TEXT UNIQUE NOT NULL,
  manager_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing the API

### **Using cURL**

**Create User:**
```bash
curl -X POST http://localhost:3000/create_user \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "mob_num": "+919876543210",
    "pan_num": "ABCDE1234F",
    "manager_id": "3f1c1a50-0c9c-4a7d-9f56-9a0e6b96b8ab"
  }'
```

**Get Users:**
```bash
curl -X POST http://localhost:3000/get_users \
  -H "Content-Type: application/json"
```

### **Using Postman**
1. Import the API endpoints
2. Set base URL to `http://localhost:3000`
3. Test each endpoint with sample data

---

## 🚀 Future Enhancements

<details>
<summary><strong>🎯 Short-term Goals</strong></summary>

- [ ] Add JWT authentication
- [ ] Input validation middleware
- [ ] Unit and integration tests
- [ ] API documentation with Swagger
- [ ] Environment variable configuration
- [ ] Rate limiting for API endpoints

</details>

<details>
<summary><strong>🌟 Long-term Vision</strong></summary>

- [ ] **PostgreSQL Migration**: Scale to production database
- [ ] **GraphQL API**: Alternative query interface
- [ ] **User Roles & Permissions**: RBAC implementation
- [ ] **Email Notifications**: User creation alerts
- [ ] **Audit Logging**: Track all changes
- [ ] **Docker Support**: Containerization for deployment
- [ ] **CI/CD Pipeline**: Automated testing and deployment

</details>

---

## 📝 Development Notes

### **Best Practices Implemented**
* ✅ Modular code structure
* ✅ Error handling middleware
* ✅ Input validation
* ✅ Logging for debugging
* ✅ RESTful API design
* ✅ Database connection management

### **Before Deployment**
* Remove `node_modules` folder
* Set up environment variables
* Configure production database
* Enable CORS if needed
* Set up proper error handling
* Implement authentication

---

## 🙏 Acknowledgments

- **Node.js Community**: For the robust runtime environment
- **Express.js Team**: For the excellent web framework
- **SQLite**: For lightweight database solution
- **Winston**: For comprehensive logging capabilities

---

## 🤝 Contributing

We welcome contributions! Feel free to:

### 🐛 **Reporting Issues**
- Use GitHub Issues for bug reports
- Include detailed reproduction steps
- Provide error logs and system information

### 💡 **Suggesting Features**
- Open a discussion for new features
- Explain the use case and benefits
- Consider backward compatibility

---

<div align="center">

## 📄 License

This project is open source and available for educational and commercial use.

```
Feel free to use, modify, and distribute
Open source and ready for collaboration
```

**👥 Built for efficient user management | 🚀 Powered by Node.js**

*Made with ❤️ by [Arun Chinthalapally](https://github.com/arun-248)*

</div>
