# Secure Exam System

## 1. Project Title

**Secure Exam System**

## 2. Project Description

Secure Exam System is a web-based examination management platform designed to simplify the process of conducting and managing online examinations.

The system provides separate access for users such as **Students** and **Question Setters**. Students can access examination-related resources, while question setters can upload and manage question papers.

The platform uses **Firebase** for authentication and database management and **Cloudinary** for storing and retrieving question paper files. The application is built using **Next.js and React** with TypeScript.

### Main Features

- User authentication and login
- Role-based access for different users
- Student dashboard
- Question setter dashboard
- Question paper upload
- Question paper listing
- Question paper viewing
- Question paper downloading
- Firebase Firestore database
- Cloudinary file storage
- Responsive web interface
- Cloud-based deployment support

---

## 3. Technologies and Tools Used

### Frontend

- **Next.js** – React framework for building the web application
- **React** – User interface development
- **TypeScript** – Type-safe application development
- **HTML5** – Page structure
- **CSS / Tailwind CSS** – Styling and responsive design

### Backend and Cloud Services

- **Firebase Authentication** – User authentication and login
- **Firebase Firestore** – Storing user and question paper information
- **Cloudinary** – Uploading and storing question paper PDF files
- **Render** – Cloud deployment and hosting

### Development Tools

- **Visual Studio Code** – Development environment
- **Node.js** – JavaScript runtime
- **npm** – Package and dependency management
- **Git** – Version control
- **GitHub** – Source code repository

---

## 4. System Requirements

Before running the project, install the following:

- Node.js 18 or later
- npm
- Git
- Visual Studio Code
- A modern web browser

The project also requires:

- A Firebase project
- Firebase Authentication enabled
- Firebase Firestore database
- A Cloudinary account for file storage

---

## 5. Installation and Setup

### Step 1: Clone the Repository

Clone the project from GitHub:

```bash
git clone https://github.com/YOUR-USERNAME/secure-exam-system.git
```

Move into the project directory:

```bash
cd secure-exam-system
```

---

### Step 2: Install Dependencies

Install all required packages using:

```bash
npm install
```

---

### Step 3: Configure Environment Variables

Create a file named:

```text
.env.local
```

in the root directory of the project.

Add the required Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

Add the required Cloudinary configuration used by the application:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

If additional environment variables are used in the project, add them to `.env.local` as required.

> **Security:** Do not upload `.env.local` to GitHub. Environment variables should be configured separately when deploying the application.

---

## 6. Run the Project Locally

Start the Next.js development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

Open the URL in a web browser.

---

## 7. Build the Project

To create a production build:

```bash
npm run build
```

If the build completes successfully, start the production server using:

```bash
npm start
```

The application can then be accessed through:

```text
http://localhost:3000
```

---

# 8. Project Structure

The major project structure is shown below:

```text
secure-exam-system/
│
├── app/
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── question-setter/
│   │   ├── page.tsx
│   │   │
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   │
│   │   └── question-papers/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   └── ...
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── lib/
│   ├── firebase.ts
│   └── getUserRole.ts
│
├── public/
│   └── ...
│
├── package.json
├── package-lock.json
├── next.config.*
├── tsconfig.json
├── .gitignore
├── .env.local
└── README.md
```

---

# 9. Modules and Their Purpose

## 9.1 Login Module

**Location:**

```text
app/login/page.tsx
```

### Purpose

Provides the login interface for users.

It communicates with Firebase Authentication to verify the user's credentials and provides access to the appropriate part of the application.

---

## 9.2 Dashboard Module

**Location:**

```text
app/dashboard/page.tsx
```

### Purpose

Provides the main dashboard after successful authentication.

The dashboard acts as the central navigation point for authenticated users.

---

## 9.3 Question Setter Module

**Location:**

```text
app/question-setter/page.tsx
```

### Purpose

Provides the interface for question setters.

Question setters can access question-paper-related operations from this module.

---

## 9.4 Question Paper Upload Module

**Location:**

```text
app/question-setter/upload/page.tsx
```

### Purpose

Allows authorized question setters to upload question paper files.

The module:

1. Accepts question paper information.
2. Selects the question paper file.
3. Uploads the file to Cloudinary.
4. Stores the corresponding question paper information in Firebase Firestore.

---

## 9.5 Question Paper Listing Module

**Location:**

```text
app/question-setter/question-papers/page.tsx
```

### Purpose

Displays the available question papers stored in the system.

Users can view the available question paper details and access the stored files.

---

## 9.6 Firebase Configuration Module

**Location:**

```text
lib/firebase.ts
```

### Purpose

Initializes and configures Firebase services used by the application.

It provides the application with access to services such as:

- Firebase Authentication
- Firebase Firestore

---

## 9.7 User Role Module

**Location:**

```text
lib/getUserRole.ts
```

### Purpose

Handles user-role information.

It helps the application determine the role of the authenticated user and control access to role-specific functionality.

---

## 9.8 API Modules

**Location:**

```text
app/api/
```

### Purpose

Contains server-side API routes used by the application for backend-related operations where required.

---

# 10. Application Workflow

The basic workflow of the system is:

```text
User
  |
  v
Login
  |
  v
Firebase Authentication
  |
  v
Role Verification
  |
  +----------------------+
  |                      |
  v                      v
Student/User        Question Setter
                         |
                         v
                  Upload Question Paper
                         |
                         v
                    Cloudinary
                         |
                         v
                  Store File URL
                         |
                         v
                    Firestore
                         |
                         v
                  Question Paper List
                         |
                  +------+------+
                  |             |
                  v             v
                 View        Download
```

---

# 11. Sample Input and Output

## 11.1 Sample Login Input

### Input

```text
Email:
student@example.com

Password:
********
```

### Output

```text
Login successful

Student Dashboard
```

---

## 11.2 Sample Question Paper Upload

### Input

```text
Title:
Data Structures Question Paper

Subject:
Data Structures

Year:
2026

Semester:
IV

File:
DS_Question_Paper.pdf
```

### Output

```text
Question paper uploaded successfully.

Title: Data Structures Question Paper
Subject: Data Structures
Year: 2026
Semester: IV
Status: Available
```

---

## 11.3 Sample Question Paper Listing

### Input

The user opens the Question Papers page.

### Output

```text
Data Structures Question Paper
Subject: Data Structures
Year: 2026
Semester: IV

[View] [Download]
```

---

## 11.4 Sample Download

### Input

```text
User clicks:
Download
```

### Output

```text
Question paper PDF is retrieved from Cloudinary
and downloaded/opened by the browser.
```

---

# 12. Database and File Storage

The system uses two main cloud services for application data and files.

### Firebase Firestore

Firestore stores structured information such as:

```text
Question Paper ID
Title
Subject
Year
Semester
File URL
Uploaded By
Created Date
```

### Cloudinary

Cloudinary stores the actual question paper files, such as:

```text
DS_Question_Paper.pdf
CN_Question_Paper.pdf
DBMS_Question_Paper.pdf
```

Firestore stores the corresponding Cloudinary file URL so that the application can retrieve the file when the user selects **View** or **Download**.

---

# 13. Security

The application uses Firebase Authentication to authenticate users.

Sensitive configuration values are maintained using environment variables.

The `.env.local` file should not be committed to GitHub.

Example:

```text
.env.local
```

should remain excluded through `.gitignore`.

---

# 14. Deployment

The project can be deployed using Render.

### Render Configuration

```text
Runtime:
Node

Branch:
master

Build Command:
npm install && npm run build

Start Command:
npm start
```

Environment variables required by the application should be added through the Render dashboard.

After successful deployment, Render provides a public URL through which the application can be accessed.

---

# 15. Future Enhancements

Possible future improvements include:

- Online examination and timed tests
- Automatic question paper generation
- Student examination history
- Automatic evaluation
- Result generation
- Admin dashboard
- Improved role-based permissions
- Question bank management
- Examination scheduling
- Notifications
- Performance analytics

---

# 16. Conclusion

Secure Exam System provides a cloud-based platform for managing examination-related activities and question papers.

By combining **Next.js, React, TypeScript, Firebase, Cloudinary, GitHub, and Render**, the system provides authentication, role-based functionality, question paper management, cloud file storage, and web-based access through a modern application architecture.