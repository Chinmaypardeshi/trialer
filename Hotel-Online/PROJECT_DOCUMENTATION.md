# Hotel Online Admin Dashboard

## What this project does

This project is a restaurant administration system for managing orders, menus, shops, and revenue analytics. It provides a Spring Boot backend with secured REST APIs and a React/Vite frontend for authenticated admin users to view dashboard insights, manage menu items/groups, handle orders, and export reports.

## Tech Stack

- Backend: Spring Boot 3.5.7, Spring Security, Spring Data JPA, MySQL, Maven
- Frontend: React 19, Vite, React Router 7, Axios
- Libraries: Lombok, Apache POI, OpenPDF
- Database: MySQL

## Key Features

- Secured admin authentication with Spring Security
- REST API endpoints for menu, menu group, and order management
- Role-based admin access control for `/api/admin/**`
- Order creation and order detail retrieval
- Menu and menu group CRUD operations
- Revenue analytics: daily, weekly, monthly, yearly, and custom date range
- Top groups and top menu item reporting
- Export dashboard/report data to Excel and PDF
- CORS configuration for React frontend integration

## Architecture

- `Backend/src/main/java/com/Chinmay/Hotel/Controller`: REST controllers for auth, orders, admin dashboard, analytics, menus, and menu groups
- `Backend/src/main/java/com/Chinmay/Hotel/Service`: business logic and service interfaces/implementations
- `Backend/src/main/java/com/Chinmay/Hotel/Repository`: JPA repositories for entities
- `Backend/src/main/java/com/Chinmay/Hotel/Entity`: domain models such as `Orders`, `OrderItems`, `Menu`, `MenuGroup`, `Shops`, `SystemUsers`
- `Backend/src/main/java/com/Chinmay/Hotel/config`: security configuration and CORS setup
- `Frontend/src`: React app with login page, protected admin layout, dashboard pages, order views, revenue analytics, and export pages

## Running the project

1. Start MySQL and configure connection in `Backend/src/main/resources/application.properties`
2. Run backend:
   - `cd Backend`
   - `./mvnw spring-boot:run`
3. Run frontend:
   - `cd Frontend`
   - `npm install`
   - `npm run dev`

## Notes

- Backend uses basic authentication and expects the frontend to send credentials via `Authorization` header
- Frontend stores the auth token in `localStorage` and sends it with Axios requests
- Dashboard endpoints are protected and require `ADMIN` role
