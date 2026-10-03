---
name: gaza-market-project

description: General development rules and workflow for the Gaza Market project. Covers project analysis, planning, implementation, UI/UX, code quality, performance, security, offline support, testing, future backend development, public platform architecture, user dashboard, store-owner dashboard, admin dashboard, store-type configuration, bilingual RTL/LTR support, themes, and official icon usage with Lucide Icons.

---

# Gaza Market Project

## Project Overview

The project is **Gaza Market / سوق غزة**.

It is a community platform for displaying and comparing product prices, stores, businesses, locations, and services in Gaza.

The platform connects users with stores and businesses and allows users to discover:

- Products
- Prices
- Price comparisons
- Stores
- Businesses
- Locations
- Services
- Offers
- Other useful business information

The platform contains different types of businesses and places, including:

- Supermarkets
- Grocery stores
- Restaurants
- Cafes
- Workspaces
- Clothing stores
- Electronics stores
- Pharmacies
- Clinics
- Medical supplies
- Furniture stores
- Building materials
- Personal services
- Automotive businesses
- Agriculture and animal-related businesses
- Other businesses

The current frontend uses:

- HTML
- CSS
- JavaScript
- Bootstrap
- Lucide Icons

The future backend will use:

- PHP Laravel 13
- MySQL

---

# Current Project Stage

The project is currently in the **frontend development and testing stage**.

The following frontend areas have already been developed:

- Public platform
- User dashboard
- Store-owner/activity dashboard

The user dashboard frontend is considered completed.

The current development focus is now the **public Gaza Market platform itself**.

Backend development has not started yet.

Do not start backend development unless the user explicitly asks for it.

The current priority is:

**Analyze → Improve → Test → Optimize the public platform**

The public platform must be prepared so that it can later connect cleanly to the Laravel API without requiring unnecessary frontend restructuring.

---

# Main Project Areas

The project consists of several major areas:

## 1. Public Platform

The public-facing Gaza Market website used by visitors and users.

It includes functionality such as:

- Home page
- Price browsing
- Product prices
- Price comparison
- Store discovery
- Business discovery
- Locations and areas
- Search
- Filters
- Product information
- Store information
- User interactions
- Reports
- Price confirmations
- Points/rewards
- Language switching
- Theme switching
- Responsive mobile experience
- Offline/PWA functionality where applicable

This is the **current primary development focus**.

---

## 2. User Dashboard

The user dashboard allows platform users to manage their account and user-related functionality.

The frontend for this dashboard has already been completed.

Do not redesign or modify the user dashboard unless the user explicitly requests it.

Existing functionality must not be removed.

---

## 3. Store Owner Dashboard

The store-owner/activity dashboard is one shared dashboard architecture for all business types.

All business types use the same dashboard architecture.

The dashboard changes according to the selected business type through the central type configuration.

Do not create separate dashboards for every business type.

---

## 4. Admin Dashboard

The admin dashboard is used by platform administrators to manage the platform and business/activity requests.

Its architecture and functionality must be treated separately from the public platform and store-owner dashboard.

Do not modify the admin dashboard unless the requested task relates to it.

---

# Core Development Philosophy

This skill defines the general development rules for the entire Gaza Market project.

These rules apply to:

- Public platform
- User dashboard
- Store-owner dashboard
- Admin dashboard
- Shared components
- Frontend architecture
- Future backend integration

The main development workflow is:

**Understand → Inspect → Plan → Implement one stage → Test → Review → Ask for approval → Continue**

Do not skip these steps.

---

# Before Starting Any Task

Before making any changes:

1. Inspect the project.

2. Understand the overall project structure.

3. Identify which project area is being modified.

4. Understand the purpose of the requested feature.

5. Inspect the relevant existing files.

6. Understand existing functionality and dependencies.

7. Check whether the requested functionality already exists.

8. Identify files that need to be modified.

9. Identify files that need to be created.

10. Identify possible conflicts or side effects.

11. Create a clear implementation plan.

Do not start changing code before understanding the existing project and the files related to the task.

---

# Planning

Before implementation, provide a clear plan.

The plan should explain:

- What will be changed.
- Which files are involved.
- What will be created.
- What will be modified.
- What existing functionality will remain unchanged.
- The implementation stages.
- How the result will be tested.

Do not implement multiple major stages at once.

---

# One Stage at a Time

Work on one major stage at a time.

After completing a stage:

1. Explain what was completed.

2. Provide clear testing instructions.

3. Wait for the user to test it.

4. Review reported problems.

5. Fix confirmed problems.

6. Only continue to the next major stage after user approval.

Never automatically continue to the next major stage without approval.

---

# No Guessing

If anything important is unclear:

**Ask the user.**

Do not guess.

This applies especially to:

- Design
- User experience
- Business rules
- Data behavior
- File structure
- API behavior
- Dashboard behavior
- Platform behavior
- Images
- Product information
- Store information
- Permissions
- Pricing rules
- Points/rewards
- Navigation
- Requirements

If something can reasonably be interpreted in multiple ways, ask before implementing it.

---

# Problems and Errors

If a problem is discovered:

1. Tell the user about the problem first.

2. Explain the cause if it is clear.

3. Explain the possible solution.

4. Explain any risks or side effects.

5. Wait for approval when the solution changes existing behavior or architecture.

Do not silently hide important problems.

Do not silently remove functionality.

Do not silently change business rules.

---

# Scope Control

Only change what is requested.

Do not:

- Modify unrelated files.
- Refactor unrelated code.
- Redesign unrelated pages.
- Delete existing functionality.
- Replace working architecture without approval.
- Change business rules without approval.
- Change existing data behavior without approval.

Do not remove existing code unless:

- The user explicitly asks for it, or
- The user explicitly approves its removal.

---

# Public Platform Development

The public Gaza Market platform is currently the main development focus.

When working on the public platform, prioritize:

- Clear navigation
- Fast loading
- Simple UX
- Price discovery
- Product discovery
- Store discovery
- Location selection
- Search
- Filtering
- Price comparison
- User interactions
- Mobile usability
- Responsive design
- Accessibility
- Performance
- Offline support where applicable

The public platform must feel like a real production platform, not only a static frontend.

---

# Public Platform Architecture

The public platform should be organized around reusable functionality.

Examples include:

- Header
- Navigation
- Search
- Location selector
- Price cards
- Product cards
- Store cards
- Filters
- Categories
- Modals
- Alerts
- Empty states
- Loading states
- Confirmation states
- Report states
- Shared UI components

Reuse existing components whenever possible.

Do not duplicate the same functionality unnecessarily.

---

# Store and Business Architecture

The platform supports multiple business types.

Business-specific behavior should be driven by configuration where appropriate.

Do not hardcode one business type into shared platform components when the same component can support multiple types.

For example, do not create a shared component that assumes the business is always:

- A workspace
- A restaurant
- A cafe
- A pharmacy
- A grocery store

Business-specific information should come from the appropriate configuration or data source.

---

# Store Owner Dashboard Architecture

The store-owner dashboard is:

**ONE shared dashboard for ALL business types.**

Supported types may include:

- Workspace
- Restaurant
- Cafe
- Restaurant + Cafe
- Store
- Store sub-types
- Future business types

The architecture is:

```text
Shared Dashboard
       ↓
   Business Type
       ↓
Central Type Config
       ↓
Type-specific data
pages
features
fields
services
actions