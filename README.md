# 📅 eDoctorApp

---

eDoctorApp is an advanced scheduling application that allows users to book visits, doctors to manage their absences, and includes robust features for calendar-based organization. The project integrates multiple backend systems (Firebase, REST API, and JSON Server) to suit various deployment needs.
 ---
 
## ✨ Features
- 📝 **User Booking System**: Users can book appointments or visits seamlessly.
- 🩺 **Doctor Absence Management**: Doctors can add, update, and manage absences.
- 📆 **Calendar-based View**: Provides an interactive calendar for users and admins to visualize bookings and availability.
- 🔄 **Backend Flexibility**: 
    - Firebase for real-time database integration.
    - REST API (CRUD) for a robust backend using MongoDB.
    - JSON Server for quick local testing and development.

---

![Calendar Main Interface](screenshot/main.png)

---

## Setup Instructions

### Prerequisites
Ensure you have the following installed on your system:
- 🛠️ **Node.js**
- 🛠️ **Angular CLI**
- 🛠️ **JSON Server**
- 🛠️ **Firebase CLI** (optional, if using Firebase)

### Running the Backends

#### JSON Server

Run the JSON server with the provided `db.json`:
```bash
json-server --watch db.json
```

#### REST API Server
Pull the backend repository for the REST API and navigate to the folder. Then start the server:

```bash
npm run dev
```

### Running the Backends

- To use data from the JSON server:

```bash
ng serve
```

- To use the REST API backend, run:

```bash
ng serve --configuration=production
```

- To run the frontend with Firebase as the backend turn off the servers running on localhosts and run:

```bash
ng serve
```

---

## 📂 Project Structure

- src/: Contains the Angular frontend code.
- db.json: JSON Server data file for quick testing.
- REST API Repository: For the REST API backend, refer to the bacjend branch in this repository.

---

## 📜 License
This project is licensed under MIT License.


