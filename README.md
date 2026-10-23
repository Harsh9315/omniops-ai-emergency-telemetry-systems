# 🚨 OmniOps AI: Multi-Channel Emergency Detection & Smart Hospital Routing System

[![Java Version](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![React.js](https://img.shields.io/badge/Frontend-React.js-blueviolet.svg)](https://reactjs.org/)

**OmniOps AI** is a production-grade, real-time emergency telemetry and smart routing web application designed to combat "Golden Hour" delays in emergency medical services (EMS). The system bridges the gap between distress signals and rapid hospital allocation using modern web technologies, spatial routing algorithms, and event-driven architectures.

---

## ✨ Key Features

1. **Zero-Input Citizen PWA:** One-tap panic SOS button capturing precise HTML5 Geolocation coordinates (`Latitude & Longitude`) instantly without requiring app store installations.
2. **Enterprise Spring Boot Backend:** Multithreaded, secure, low-latency event ingestion pipeline with automated severity triage and unique tracking IDs.
3. **OSRM Spatial Routing Engine:** Dynamic shortest-path calculation mapping accident locations to the nearest medical facility, generating real-time distance metrics and precise ETA.
4. **Interactive Command Center:** Unified dashboard built with Leaflet.js featuring real-time red incident markers, route green-corridor visualization, and live ambulance fleet animation.
5. **Municipal Analytics & CSV Exporter:** Comprehensive event data logging with a single-click CSV report generator for urban safety and accident hotspot analysis.

---

## 🛠️ Tech Stack

* **Frontend & UI:** Progressive Web App (PWA), HTML5, CSS3, React.js
* **Backend:** Java 17, Spring Boot (`Spring Web`, `Spring WebSockets / STOMP`, `Spring Data JPA`)
* **Mapping & Visualization:** Leaflet.js Interactive Maps (Route Rendering & Fleet Animation Engine)
* **Routing & Spatial Algorithms:** OSRM (Open Source Routing Machine) Spatial Graph Routing
* **Database:** PostgreSQL (Relational Database with Spatial Indexing Support)
* **Telemetry & Protocols:** Real-time JSON Payloads, WebSocket Event-Driven Pipeline, Dynamic CSV Exporter

---

## 📂 Project Directory Structure

```text
omniops-ai-emergency-telemetry-system/
│
├── backend/               # Java Spring Boot Application (REST APIs, WebSockets, DB Models)
├── frontend/              # Progressive Web App & Command Center Dashboard (React / Leaflet)
└── README.md              # Project Documentation

🚀 Getting Started Locally
Prerequisites
Java 17 or higher installed

Node.js & npm installed

PostgreSQL installed and running

1. Backend Setup (Spring Boot)
Navigate to the backend directory:

Bash
cd backend
Configure your PostgreSQL database credentials in src/main/resources/application.properties:

Properties
spring.datasource.url=jdbc:postgresql://localhost:5432/omniops_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
Run the Spring Boot application:

Bash
mvn spring-boot:run
2. Frontend Setup (React.js)
Navigate to the frontend directory:

Bash
cd frontend
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run start
