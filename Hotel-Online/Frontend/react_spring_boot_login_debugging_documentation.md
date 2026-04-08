# Debugging Login Issue (React + Spring Boot – Basic Auth)

## Overview

This document explains the complete debugging process followed to resolve a login and authorization issue in a **React + Spring Boot** application using **Basic Authentication**. The focus is not only on the fix, but on *how the issue was systematically identified*, isolated, and resolved.

This documentation can be used as:
- Project documentation
- A learning reference
- An explanation during interviews or reviews

---

## Problem Statement

- Backend API works correctly when tested using `curl`
- React login UI shows **“Invalid credentials”**
- No API request visible in the browser **Network tab**
- No meaningful error shown in the browser console

This created confusion about whether the issue was in:
- Spring Security
- Authentication logic
- CORS
- React frontend

---

## Step 1: Verify Backend Independently

### Action

The backend API was tested directly using `curl`:

```bash
curl -u SAMARTH:123@Samarth "http://localhost:8080/api/admin/dashboard?fromDate=2025-01-01&toDate=2026-12-31"
```

### Response

```json
{
  "fromDate": "2025-01-01",
  "toDate": "2026-12-31",
  "paidOrders": 1,
  "activeOrders": 1,
  "cancelledOrders": 1,
  "totalRevenue": 181.67
}
```

### Conclusion

- Authentication works
- Credentials are valid
- Spring Security configuration is correct
- Role (`ADMIN`) is correctly assigned
- API endpoint is reachable and functional

**Backend is confirmed correct and should not be modified.**

---

## Step 2: Inspect Browser Network Tab

### Expected Behavior

A request similar to:

```
GET /api/admin/dashboard → 200 OK or 401 Unauthorized
```

### Actual Behavior

Only static asset requests were visible:

```
Login.jsx?t=xxxxx → 200 (script)
```

- No request sent to `localhost:8080`
- No API call visible

### Conclusion

The request was **never sent from the frontend**.

This rules out:
- CORS issues
- Spring Security issues
- Invalid credentials

The problem exists **entirely inside React code**.

---

## Step 3: Confirm Button Click and Function Execution

### Action

A console log was added inside the login handler:

```js
console.log('Login button clicked')
```

### Result

The console showed:

```
Login button clicked
```

### Conclusion

- Button is wired correctly
- `handleLogin()` function is executed
- The failure happens *inside* the function

---

## Step 4: Identify Silent JavaScript Failure

### Observation

- `catch` block executes immediately
- No network request is made
- No visible JavaScript error

### Interpretation

This usually indicates a **runtime JavaScript error before the HTTP request**, such as:
- Undefined variable
- Missing import
- Incorrect reference

Because the error occurs inside a `try` block, it fails silently and jumps directly to `catch`.

---

## Step 5: Inspect API Call Code

### Code Used

```js
const response = await api.get('/api/admin/dashboard?...')
```

### Key Question

> Where is `api` defined?

### Finding

The Axios instance was **not imported** in the file:

```js
import api from '../api/axios'
```

### Effect of This Bug

- `api` was `undefined`
- JavaScript threw a runtime error
- Execution jumped directly to `catch`
- No HTTP request was sent
- UI incorrectly showed “Invalid credentials”

---

## Step 6: Fix the Root Cause

### Fix Applied

Added the missing import:

```js
import api from '../api/axios'
```

### Axios Instance Configuration

The Axios instance already had:
- `baseURL`
- Authorization header (Basic Auth)
- Interceptors

No backend changes were required.

---

## Step 7: Verify After Fix

### Browser Network Tab

```
GET http://localhost:8080/api/admin/dashboard → 200 OK
```

### Request Headers

```
Authorization: Basic <base64(username:password)>
```

### Console Output

```
Dashboard data received successfully
```

### UI Result

- Login successful
- Dashboard data displayed correctly

---

## Root Cause Summary

| Layer           | Status        |
|-----------------|---------------|
| Backend API     | ✅ Correct     |
| Spring Security | ✅ Correct     |
| CORS            | ✅ Correct     |
| React Logic     | ❌ Bug found   |
| Axios Client    | ✅ Correct     |

### Actual Root Cause

> The Axios instance (`api`) was undefined due to a missing import, causing a silent frontend failure before the HTTP request was sent.

---

## Key Learnings

1. Always verify the backend independently using `curl` or Postman
2. If no request appears in the Network tab, the issue is in frontend JavaScript
3. Console logs help narrow execution flow
4. Missing imports can silently break async logic
5. Do not assume authentication errors always originate from the backend

---

## One-Line Takeaway

> The login failure was caused by a missing Axios instance import in React, which prevented the API request from being sent and incorrectly triggered the authentication error handler.

---

## Notes for Future Improvements

- Add centralized error handling in Axios
- Improve UI error messages to distinguish frontend vs backend errors
- Use protected routes (e.g., `AdminRoute`)
- Move authentication logic into a dedicated service (`authService.js`)



24-02-2026 

✅ Authentication (Basic Auth)
✅ Centralized Axios config
✅ Auto-attach auth header
✅ Auto logout on 401
✅ Protected routes
✅ Admin layout shell
✅ Admin dashboard data flow
✅ Clean routing base

This is real platform-level architecture, not tutorial junk.

FILE-BY-FILE BREAKDOWN (WHAT EACH ONE DOES)
1️⃣ api/axios.js — HTTP CORE (VERY IMPORTANT)

This file is the heart of frontend ↔ backend communication.

What it does:
✅ Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
})


All API calls go to Spring Boot

You never repeat base URL again

✅ Request Interceptor
api.interceptors.request.use(...)


What happens before every request:

Reads auth from localStorage

Automatically adds:

Authorization: Basic xxxx


👉 Result:
You never manually add headers again.

✅ Response Interceptor
if (error.response.status === 401)


What happens if backend rejects you:

Clears auth

Redirects to /login

👉 Result:

Expired / invalid login = auto logout

No broken UI

No manual checks everywhere

🔥 This is enterprise-grade behavior.

2️⃣ ProtectedRoute.jsx — FRONTEND GATEKEEPER
if (!auth) return <Navigate to="/login" />

What it does:

Checks: “Is admin logged in?”

If NO → redirect to login

If YES → allow page render

👉 This protects routes before API is even called

3️⃣ AdminLayout.jsx — ADMIN SHELL

This is your platform container.

What it provides:

Admin header

Logout button

Common layout for all admin pages

<Outlet /> → renders current admin page

<Outlet />


👉 This means:

Dashboard

Orders

Settings
will all live inside the same admin shell

⚠️ Right now it’s not wired in App.js yet — structure is ready.

4️⃣ AdminDashboard.jsx — REAL DATA PAGE
What happens here:
🔹 On page load:
useEffect(() => fetchDashboard(), [])

🔹 Calls backend:
/api/admin/dashboard

🔹 Axios automatically:

Adds auth header

Handles 401

Parses JSON

🔹 Saves data in state:
setData(res.data)

🔹 Renders real backend values:

Paid orders

Active orders

Revenue

👉 This proves:
✅ Auth works
✅ Backend works
✅ Axios works
✅ Routing works

This is end-to-end success.

5️⃣ Login.jsx — ENTRY POINT
Login flow:

User enters username/password

You create:

Basic base64(username:password)


Save it once:

localStorage.setItem('auth')


Make a test API call

If success → navigate to dashboard

If fail → clear auth + show error

👉 Clean, minimal, effective.

6️⃣ App.js — ROUTING BRAIN

Current routes:

/           → /login
/login      → Login page
/admin/*    → Protected
/admin/dashboard → Dashboard

Important note (future fix):

Right now you directly render AdminDashboard inside ProtectedRoute.
Later you will wrap AdminLayout here.

But for now it works, which is fine.

7️⃣ main.js — BOOTSTRAP

React app starts

Router enabled

App rendered

Nothing special — this is correct.

WHY THIS ARCHITECTURE IS GOOD

✔ Auth logic is centralized
✔ Axios logic is centralized
✔ Logout handled globally
✔ Routes are protected properly
✔ Backend restarts don’t log you out (Basic Auth)
✔ Ready to scale (orders, menu, users)

This is not beginner code anymore.

CURRENT STATUS (VERY CLEAR)

🟢 Admin Dashboard → DONE
🟢 Auth system → DONE
🟢 Platform base → DONE
