Live URl - https://ai-task-frontend-raghav.onrender.com

# 🚀 AI Task Processor


An advanced, asynchronous task processing system that demonstrates how to handle heavy computational tasks in the background without blocking the main application. Built with a distributed architecture using **React**, **Node.js**, **Python**, and **Redis**.



## 🌟 Key Features

* **Asynchronous Processing:** Tasks are offloaded to a background worker to keep the UI snappy.
* **Distributed Architecture:** Separate services for Frontend, Backend API, and Worker.
* **Real-time Status Tracking:** Monitor tasks as they move from `Pending` → `Running` → `Success`.
* **Secure Authentication:** JWT-based user login and registration system.
* **Scalable Worker Engine:** Python-based worker capable of handling complex operations.

## 🏗️ Architecture Detail

The system follows the **Producer-Consumer Pattern**:
1.  **Producer (Backend):** Express server receives tasks and pushes them into an **Upstash Redis** queue.
2.  **Broker (Redis):** Acts as a high-speed buffer for pending tasks.
3.  **Consumer (Worker):** A Python script that pulls tasks from the queue, processes them, and updates the **MongoDB** database.

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Axios
* **Backend:** Node.js, Express, JWT
* **Worker:** Python 3, PyMongo, Redis-py
* **Database:** MongoDB Atlas
* **Message Broker:** Upstash Redis
* **Hosting:** Render

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* MongoDB & Redis connection strings

### Local Setup

1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/raghav1902/AI-Task-processor.git
    cd AI-Task-processor
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    npm start
    ```

3.  **Worker Setup:**
    ```bash
    cd ../worker
    pip install -r requirements.txt
    python main.py
    ```

4.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

## 🔑 Environment Variables

Create a `.env` file in the relevant folders:

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB Connection String |
| `REDIS_URL` | Redis Connection URL (`rediss://` for SSL) |
| `JWT_SECRET` | Secret key for JWT |
| `VITE_API_BASE_URL` | Backend API URL |

## 📦 Supported Operations

* 🔠 **Uppercase:** Converts text to capital letters.
* 🔡 **Lowercase:** Converts text to small letters.
* 🔄 **Reverse:** Reverses the input string.
* 🔢 **Word Count:** Calculates total words.

---

## 👨‍💻 Author

**Raghav**

* **GitHub:** [@raghav1902](https://github.com/raghav1902)
