# Group Number - 26
Campus Grievance Redressal & Maintenance Tracker

Overview

The Campus Grievance Redressal & Maintenance Tracker is a centralized platform designed to simplify complaint management within educational institutions.

Students can report maintenance issues and grievances, while administrators can assign responsibilities, monitor progress, enforce response timelines, and keep students informed until the issue is resolved.

The system improves accountability, transparency, and communication between students and campus departments.

---

Problem Statement

Campus complaints such as broken fans, leaking pipes, faulty Wi-Fi, damaged furniture, and electrical issues are often reported through WhatsApp groups, verbal communication, or emails.

These complaints frequently disappear because there is:

- No centralized complaint record
- No clear ownership
- No progress tracking
- No response timeline
- No accountability

As a result, students lose confidence in the reporting system, maintenance gets delayed, and small issues can develop into larger safety risks.

---

Proposed Solution

Our platform provides a digital complaint management system that allows students and administrators to efficiently manage campus issues.

The system includes:

- Complaint Registration
- Issue Categories
- File/Image Attachments
- Real-Time Status Tracking
- Department-wise Assignment
- Escalation Rules
- Service Level Timer (SLA)
- Notifications
- Complaint History
- Dashboard & Analytics

---

Roles

- **Student** — raises a grievance under one of four blocks: **Health, Maintenance, Academic, Personal**.
- **Admin** — manages one block and updates the status of grievances the Super Admin assigns to them.
- **Super Admin** — sees every grievance across every block and is the only one who can assign a raised query to the right admin. Super Admin accounts are provisioned by the system, not self-registered.

Features

Student

- Login/Register
- Raise New Complaint
- Upload Images/Documents
- Select Complaint Category
- Track Complaint Status
- View Complaint History

Admin

- View complaints assigned to their block
- Change Complaint Status
- Monitor SLA Timer
- Dashboard & Reports

Super Admin

- View All Complaints across every block
- Manage admin accounts (create new admins, one per block)
- Assign each raised query to the right admin
- Dashboard & Reports (org-wide)


Complaint Workflow:

Complaint Submitted

↓

Admin Receives Complaint

↓

Assigned to Department

↓

Issue In Progress

↓

Resolved

↓

Student Verification

↓

Complaint Closed

---

Tech Stack

Frontend

- React (Vite)
- React Context API
- Recharts
- Custom CSS (Light/Dark Theme)
- Vite Preview
  

Backend

- Flask (Python)
- Flask-JWT-Extended (JWT Authentication)
- Flask-CORS
- Werkzeug Security (Password Hashing)
- python-dotenv
 

Database

- SQLite

Future Scope

- AI-based complaint prioritization
- QR code complaint reporting
- Mobile Application
- Email & SMS Notifications
- Predictive Maintenance Analytics

---

Team Members

Team Lead -
Bhumika Das

Frontend-

Ankit Pathak
Sayan Bhowmik

Backend-

Kripa Mehndiratta
Akash Kumar Gautam

Documentation & GitHub-
Aerisha Saxena

Project research and management-
Bhumika Das


---
Project Goal-

To create a transparent, accountable, and efficient grievance management system that ensures every complaint is tracked from submission to resolution, improving communication and trust across the campus.

---

Made for Project Exhibition-I

