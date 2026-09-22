---
name: gaza-market-project
description: General development rules and workflow for the Gaza Market project. Covers project analysis, planning, implementation, UI design, code quality, performance, security, offline support, testing, future backend development, dashboard architecture, store-type configuration, and official icon usage with Lucide Icons. The official dashboard design references are the nine provided images.
---

# Gaza Market Project

## Project Overview

The project is **Gaza Market / سوق غزة**.

It is a platform for displaying product prices in Gaza and comparing prices between different locations and stores.

The platform contains different types of stores and places, including:

- Supermarkets
- Restaurants
- Cafes
- Workspaces
- Other businesses and places

The current frontend uses:

- HTML
- CSS
- JavaScript
- Bootstrap
- Lucide Icons

The future backend will use:

- PHP Laravel 13

The current focus is completing the user and store-owner dashboard (frontend only). Backend work starts later, when the user asks for it.

Each store has its own dashboard access, but all store types use **ONE shared dashboard architecture**.

---

# Core Development Philosophy

This skill defines the general development rules for the entire Gaza Market project.

These rules apply to all parts of the project, not only the dashboard.

The main development workflow is:

**Understand → Inspect → Plan → Implement one stage → Test → Review → Ask for approval → Continue**

Do not skip these steps.

---

# Before Starting Any Task

Before making any changes:

1. Inspect the project.
2. Understand the overall project structure.
3. Understand the purpose of the platform.
4. Understand the relevant existing functionality.
5. Inspect the files related to the requested task.
6. Understand how existing components and features work.
7. Identify the files that need to be modified.
8. Identify any files that need to be created.
9. Identify possible problems or conflicts.
10. Create a clear step-by-step plan.

Do not start changing code before understanding the existing project and the files related to the task.

---

# Planning

Before implementation, provide a clear plan.

The plan should explain:

- What will be changed.
- Which files are involved.
- What will be created.
- What will be modified.
- What the implementation stages are.
- How the result will be tested.

Do not implement multiple major stages at once.

---

# One Stage at a Time

Work on one stage at a time.

After completing a stage:

1. Explain what was completed.
2. Provide clear testing instructions.
3. Wait for the user to test it.
4. Review any reported problems.
5. Only continue after the user's approval.

Never automatically continue to the next major stage without approval.

---

# No Guessing

If anything is unclear:

**Ask the user.**

Do not guess.

This applies especially to:

- Design
- User experience
- Existing functionality
- Business rules
- Data behavior
- File structure
- API behavior
- Dashboard behavior
- Images
- Requirements

If something can be interpreted in multiple ways, ask before implementing it.

---

# Problems and Errors

If a problem is discovered:

1. Tell the user about the problem first.
2. Explain what caused it if it is clear.
3. Explain the possible solution.
4. Wait for approval when the solution requires changing existing behavior or structure.

Do not silently hide problems.

Do not silently work around important problems.

---

# Scope Control

Only change what is requested.

Do not modify unrelated files.

Do not refactor unrelated code.

Do not redesign unrelated parts of the project.

Do not delete existing functionality.

Do not remove existing code unless the user explicitly asks for it or explicitly approves its removal.

---

# Official Design References

The following nine images are the official visual references for the Gaza Market dashboard.

These images define the intended dashboard design.

Claude must use these images as the primary visual reference when implementing or modifying the dashboard.

The design should follow the references in:

- Layout
- Structure
- Element positioning
- Spacing
- Cards
- Sidebar
- Navigation
- Buttons
- Forms
- Tables
- Dashboard sections
- Visual hierarchy
- General appearance

Do not invent a completely different design.

If any part of an image is unclear, ask the user before implementation.

## Design Reference Images

1. https://ibb.co/tMjyZFCj
2. https://ibb.co/cKGkTnhK
3. https://ibb.co/RG0Q329L
4. https://ibb.co/zVNLFMG7
5. https://ibb.co/NXJZ6Zs
6. https://ibb.co/pjWWYkG6
7. https://ibb.co/rG3WVtsn
8. https://ibb.co/DfJL9HD5
9. https://ibb.co/SwZkgTs2

These references are the official design source for the dashboard.

Do not replace their visual direction with an unrelated design.

---

# Icon Library

The official icon library for the Gaza Market project is:

https://lucide.dev/

Claude must use **Lucide Icons** for interface icons throughout the project.

## Icon Rules

Use Lucide Icons for:

- Sidebar icons
- Navigation icons
- Header icons
- Buttons
- Action buttons
- Search icons
- Filter icons
- Form icons
- Dashboard cards
- Tables
- Dropdowns
- Modals
- Alerts
- Empty states
- Store and product actions
- Edit / Delete / Add / View actions
- Menu and UI controls

Do not use other icon libraries unless the user explicitly requests it.

Do not mix multiple icon libraries in the same project.

Prefer Lucide icons that closely match the meaning of the action or element.

Use the official Lucide icon names and syntax from:

https://lucide.dev/

Before using an icon, check whether an appropriate Lucide icon already exists.

Keep icon usage visually consistent across the project.

Do not replace existing project icons unnecessarily unless the task specifically requires changing them.

Icons must support:

- Arabic RTL
- English LTR
- Light Mode
- Dark Mode
- Responsive layouts

Do not use emoji as UI icons.

Do not create custom SVG icons when an appropriate Lucide icon already exists.

If a required icon does not exist in Lucide, tell the user before choosing another icon library or creating a custom icon.

---

# User Experience

User experience is a high priority.

Interfaces should be:

- Clear
- Simple
- Organized
- Consistent
- Easy to understand
- Fast
- Responsive
- Suitable for Arabic users
- Suitable for English users

Avoid unnecessary complexity.

Avoid unnecessary UI elements.

Do not add features that were not requested.

---

# Language Support

The project supports:

- Arabic
- English

The project supports:

- RTL
- LTR

Any new interface or feature must preserve both languages and both directions.

Do not create an interface that only works correctly in one language.

Check layouts for:

- Arabic text
- English text
- RTL
- LTR
- Different text lengths

---

# Theme Support

The project supports:

- Light Mode
- Dark Mode

Any UI modification must preserve both modes.

Do not introduce styles that only work correctly in Light Mode or only in Dark Mode.

---

# Existing Project Structure

Respect the existing project structure.

Before creating a new component, file, or structure:

1. Check whether an existing component already provides the required functionality.
2. Check whether a similar component already exists.
3. Reuse existing structures when appropriate.
4. Avoid unnecessary duplication.

Do not reorganize the project without a clear reason.

---

# Components and Reusability

Pay attention to shared components and reusable elements.

Examples include:

- Navigation
- Sidebar
- Header
- Footer
- Cards
- Buttons
- Forms
- Modals
- Alerts
- Tables
- Filters
- Common UI elements

If the same code or UI structure is repeated:

1. Tell the user that duplication exists.
2. Explain the duplication briefly.
3. Suggest a reusable solution.
4. Wait for approval before changing the project structure.

Do not automatically refactor the architecture.

---

# Dashboard Architecture

The Gaza Market dashboard is **ONE shared dashboard for ALL store types**.

Supported store types may include:

- Workspace
- Restaurant
- Cafe
- Restaurant + Cafe
- Store
- Store with sub-types
- Other store types added in the future

All store types use the same dashboard layout and overall UI structure.

The dashboard must not be duplicated into separate dashboards for each store type.

The layout, navigation structure, visual design, and shared components remain consistent.

Only the following may change based on the store type:

- Data
- Pages
- Features
- Fields
- Services
- Store-specific actions
- Store-specific settings
- Store-specific dashboard content

---

## Shared Dashboard Rule

Do not create separate dashboards such as:

- WorkspaceDashboard
- RestaurantDashboard
- CafeDashboard
- StoreDashboard

unless the user explicitly requests a completely different dashboard architecture.

The preferred architecture is:

```text
Shared Dashboard
        ↓
   Store Type
        ↓
 Central Type Config
        ↓
Type-specific data, pages, features and fields
```

---

## Type Rules

- Never hardcode workspace-only text or features (such as "مساحتي", "باقة المساحة", subscribers, seats, hourly prices) inside shared components.
- Workspace-specific pages and fields belong to the Workspace type only.
- Build type-specific content from one central type config, not from copied pages.
- Until the backend exists, the frontend reads the store type from a temporary source (for example localStorage). Later it will come from the API.
- Existing workspace-only code is treated as Workspace-type features. Migrating it into the type config is allowed only in approved stages, and existing functionality must not be deleted.
- Packages and plans may also depend on the store type. Ask the user before changing the packages page for a new type.

---

## Store Types (from the add-store page)

The add-store page has 4 steps: **Type → Details → Contact → Review**.

Step 1 offers 5 main types:

| Type | Description shown on the page |
|------|-------------------------------|
| مساحة عمل (Workspace) | مساحة عمل مشتركة أو مكتب |
| مطعم (Restaurant) | وجبات رئيسية |
| كافيه (Cafe) | مشروبات وحلويات |
| مطعم وكافيه (Restaurant + Cafe) | يقدم طعاماً ومشروبات معاً |
| متجر (Store) | ملابس، إلكترونيات، أدوات... |

When the type is **Store**, the owner also picks a sub-type from these categories:

- **مواد غذائية وبقالة:** بقالة عامة، سوبرماركت، خضار وفواكه، لحوم، أسماك، مخبز، حلويات ومعجنات، بهارات وأعشاب
- **صحة وصيدليات:** صيدلية، عيادة وطب، مستلزمات طبية، بصريات
- **ملابس وأزياء:** ملابس رجالي، ملابس نسائية، ملابس أطفال، أحذية، إكسسوارات، خياطة
- **منزل وأثاث:** أثاث منزلي، مفروشات وستائر، أدوات منزلية، كهربائيات وأجهزة منزلية، مواد تنظيف، أدوات صحية
- **إلكترونيات وتقنية:** موبايل وإكسسوارات، كمبيوتر ولابتوب، إلكترونيات، طاقة شمسية، تصليح وصيانة
- **بناء ومواد:** مواد بناء، حديد وألمنيوم، دهانات وديكور، خشب، سيراميك وبلاط
- **تعليم وثقافة:** مكتبة وقرطاسية، ألعاب أطفال، أدوات فن ورسم
- **خدمات شخصية:** صالون رجالي، صالون نسائي، مغسلة، تصوير
- **سيارات:** قطع غيار، كراج وخدمة، إطارات
- **زراعة وحيوانات:** بيطري، أعلاف ومستلزمات، أدوات زراعية
- **أخرى:** متنوع، أخرى

This list comes from the add-store page. If the page changes, update this list and the central type config together.

Which pages and fields each type shows in the dashboard is decided by the user. Do not guess them. Ask first.

---

## Registration Flow (backend, to be built later)

1. The owner submits the add-store form (type, details, contact, review).
2. The request is saved as "pending" together with its type (and sub-type for stores).
3. The platform admin reviews it in a separate admin dashboard and approves or rejects it.
4. On approval, the store account is created and the owner receives a secure, signed, expiring activation link to reach their dashboard.

Do not start backend work until the user asks for it.

---

# Code Rules

Code must be:

- Clean
- Organized
- Maintainable
- Scalable
- Readable
- Consistent with the existing project

Preserve the existing coding style.

Preserve existing naming conventions.

Preserve existing file organization.

Do not unnecessarily rewrite working code.

---

# Complete Files

Whenever modifying a file, provide the complete file.

The file must be ready to replace directly.

Do not provide incomplete code.

Do not use placeholders such as "..." or "// rest of the code".