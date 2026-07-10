# Product Requirements Document (PRD)
## Smart Expense Tracker with AI-Powered Bill Scanning

**Document Version:** 1.0
**Date:** July 8, 2026
**Status:** Draft

---

## 1. Overview

### 1.1 Purpose
The Smart Expense Tracker is a **multi-user web application** that helps individuals log, categorize, and visualize their daily expenses effortlessly. Each user has their own secure account and fully isolated data. Its core differentiator is an AI engine that reads uploaded invoices and bills, extracts the relevant details, and automatically creates expense entries — removing the need for manual data entry.

### 1.2 Problem Statement
Most people either avoid tracking expenses because manual entry is tedious, or abandon tracking apps after a few weeks. Users need a fast, low-friction way to capture spending (ideally by just snapping/uploading a bill) and a visually engaging way to understand where their money goes.

### 1.3 Goals & Objectives
- Support **multiple users** with individual, secure accounts and fully isolated personal data.
- Enable users to track expenses on a **daily basis** with minimal effort.
- Provide **pictorial charts and summaries** (daily/weekly/monthly) for spending insights.
- Let users **upload documents** (invoices, bills, receipts).
- Use **AI to parse uploaded documents**, extract key details, and **auto-create expense entries**.
- Provide an **AI-generated summary** of spending patterns.
- Deliver a **vibrant, colorful UI** that feels lively and engaging rather than clinical.

### 1.4 Success Metrics
| Metric | Target |
|---|---|
| Daily Active Users (DAU) logging at least 1 expense | 60% of registered users |
| % of expenses added via AI document upload (vs. manual) | 40%+ within 3 months |
| AI extraction accuracy (amount, date, vendor, category) | ≥ 90% |
| Average time to log an expense via upload | < 15 seconds |
| User retention (Day 30) | ≥ 35% |

---

## 2. Target Users
- Individuals who want a simple personal finance/expense tracker.
- Freelancers/small business owners tracking receipts for reimbursement or taxes.
- Users who dislike manual data entry and prefer snapping a photo of a bill.

### User Personas
1. **Busy Professional (Priya, 29)** – Wants to track daily spending without manually typing every transaction; prefers uploading a photo of the receipt.
2. **Freelancer (Arjun, 34)** – Needs to keep invoices organized for tax filing and client billing; wants categorized summaries.
3. **Budget-Conscious Student (Meera, 21)** – Wants a visually appealing, simple app to see where money goes each month.

---

## 3. Core Features

### 3.0 Multi-User Accounts & Authentication
The application must support many independent users, each with their own private, secure account.

- **Sign-up/Login:** Email + password and/or OAuth (Google/Apple) sign-in.
- **Data isolation:** Every user's expenses, documents, and reports are strictly private and visible only to them.
- **Profile settings:** Name, email, currency preference, default categories.
- **Session management:** Secure login sessions across devices (web + mobile browser), with logout/all-device-logout option.
- **Password recovery:** Standard forgot-password/reset flow.
- **(Phase 2) Shared/Family accounts:** Optional ability to invite another user (e.g., spouse) into a shared expense group with combined dashboards — kept separate from personal data by default, opt-in only.

**Acceptance Criteria:**
- A user can only ever view/edit their own expenses and documents (no cross-user data leakage).
- Sign-up, login, and password reset flows are fully functional and secure (hashed passwords, rate-limited login attempts).
- New users get a clean, empty dashboard with onboarding guidance (e.g., "Add your first expense" prompt).

---

### 3.1 Daily Expense Tracking
- Manual entry: amount, category, date, **payment mode**, notes.
- Quick-add widget/floating action button for fast logging.
- Recurring expense support (subscriptions, rent, EMIs).
- Daily/weekly/monthly view toggle.
- Multi-currency support (optional, phase 2).

**Acceptance Criteria:**
- User can add an expense in under 3 taps/clicks.
- Expenses are timestamped and editable/deletable.
- Data is saved in real time (no explicit "save" step lag).

#### Payment Mode Column
Every expense (manual or AI-extracted) must capture **how it was paid**, shown as a dedicated column in the expense list/table and available as a filter across charts and reports.

- **Supported payment modes:**
  - Cash
  - Bank Transfer / Net Banking
  - Credit Card (CC)
  - Debit Card
  - UPI
  - Digital Wallet (Paytm/GPay/PhonePe, etc.)
  - Cheque
  - Other (custom, user-defined)
- Each payment mode gets its own icon and color tag (consistent with the vibrant color system) for quick visual scanning in lists and charts.
- **Payment Mode** should be filterable and chartable — e.g., a breakdown chart showing "% of spend by payment mode" alongside the category breakdown.
- If a bank/credit card is added, allow an optional "last 4 digits" or nickname field (e.g., "HDFC CC •••• 4821") to distinguish between multiple cards/accounts.
- **AI auto-detection:** When parsing an uploaded invoice/bill, the AI should attempt to detect the payment mode from the document (e.g., "Paid via Credit Card ending 4821", "Cash Receipt") and pre-fill this field; user can confirm/edit like other extracted fields.

**Acceptance Criteria:**
- Payment mode is a required field for every expense entry (manual or AI-created).
- Expense History table displays Payment Mode as its own column.
- Dashboard supports a "Spend by Payment Mode" chart in addition to category charts.
- Users can filter expense history/reports by one or more payment modes.

---

### 3.2 Pictorial Charts & Summarization
- **Dashboard** with visual breakdown of spending:
  - Pie/Donut chart – spending by category.
  - Pie/Donut chart – spending by **payment mode** (Cash/Bank/CC/UPI/etc.).
  - Bar chart – daily/weekly/monthly spend comparison.
  - Line/Trend chart – spending trend over time.
  - Heatmap calendar – visualize high/low spend days.
- **Summary cards**: Total spent today/this week/this month, top category, biggest expense.
- Filter by date range, category, or payment method.
- Export summary as Excel/PDF (see Section 3.6 – Reports & Export).

**Acceptance Criteria:**
- Charts update in real time as new expenses are added.
- Charts are interactive (tap/hover to see exact values).
- Summary is understandable at a glance (under 5 seconds).

---

### 3.3 Document Upload (Invoices/Bills)
- Upload via:
  - File picker (PDF, JPG, PNG).
  - Camera capture (mobile web).
  - Drag-and-drop (desktop).
- Support multi-page PDF invoices.
- Store original document attached to the expense record for future reference.
- Document gallery/history view.

**Acceptance Criteria:**
- Supports files up to 10MB.
- Upload progress indicator shown.
- Uploaded document is viewable/downloadable later from the linked expense.

---

### 3.4 AI-Powered Parsing & Auto-Expense Creation (Powered by Google Gemini)
This is the standout feature of the product.

**Flow:**
1. User uploads a bill/invoice.
2. **Google Gemini** (multimodal AI) reads the document directly — handling OCR and structured data extraction in a single step (no separate OCR engine required, since Gemini natively processes images/PDFs).
3. System extracts:
   - Vendor/Merchant name
   - Total amount
   - Date of transaction
   - Itemized list (if available)
   - Suggested category (Food, Travel, Utilities, Shopping, etc.)
   - **Payment mode** (Cash, Bank Transfer, Credit Card, Debit Card, UPI, Wallet, Cheque)
4. AI auto-fills a draft expense entry.
5. User reviews and confirms (or edits) before it's saved — ensures accuracy while saving time.
6. Confirmed data is added to the expense list and reflected in charts instantly.

**AI Summary Feature (Gemini-generated):**
- Natural-language summary of spending, generated by prompting Gemini with the user's structured expense data: e.g., "You spent 18% more on dining out this week compared to last week."
- Weekly/monthly AI-generated insights and anomaly alerts (e.g., unusually high spend detected).

**Acceptance Criteria:**
- Extraction completes within 5–10 seconds per document.
- User always gets a review/edit step before data is finalized (no silent auto-save of unverified data).
- If AI cannot confidently extract a field, it is left blank for manual entry rather than guessing.
- Confidence score or highlighting shown for extracted fields (optional but recommended for trust).

---

### 3.5 Categorization & Tagging
- Default categories: Food, Travel, Shopping, Bills/Utilities, Health, Entertainment, Others.
- Custom category creation.
- AI-suggested category based on parsed vendor/item data.

---

### 3.6 Reports & Export
Users should be able to generate and export structured reports of their expenses for record-keeping, sharing, or tax/reimbursement purposes.

- **Report types:**
  - Daily / Weekly / Monthly / Custom date range report.
  - Filtered report (by category, payment mode, or tag).
  - Full transaction history export.
- **Export formats:**
  - **Excel (.xlsx):** Tabular export with columns — Date, Vendor, Amount, Category, Payment Mode, Notes, Linked Document. Suitable for further analysis (pivot tables, formulas).
  - **PDF:** Formatted, shareable report including summary cards, charts (category/payment-mode breakdown), and the itemized expense table — suitable for printing or emailing (e.g., to an accountant or for expense reimbursement).
  - **CSV** (lightweight option for import into other tools) — optional, low effort to add alongside Excel.
- **Attachments:** Option to bundle original uploaded invoice/bill documents along with the PDF report (e.g., as a zipped package) for audit/reimbursement purposes.
- **Delivery:** Download directly, or (Phase 2) email the report on a schedule (e.g., auto-email monthly report on the 1st of each month).

**Acceptance Criteria:**
- User can generate an Excel or PDF report for any selected date range/filter combination within 5 seconds for up to 12 months of data.
- Exported Excel file opens cleanly with proper column headers and number formatting (currency, dates).
- Exported PDF includes at least: summary totals, one chart, and the itemized table.
- Report generation works from both the Expense History screen and the Reports/Insights screen.

---

### 3.7 Notifications & Reminders (Phase 2)
- Daily reminder to log expenses if none added.
- Budget threshold alerts ("You've used 80% of your monthly food budget").

---

### 3.8 Full CRUD Support
The application must provide complete **Create, Read, Update, Delete (CRUD)** functionality across all core entities — not just add/view. This ensures users have full control over their data.

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| **Expense** | Add manually or via AI-parsed document | View single expense / list / filtered / searched | Edit any field (amount, category, date, payment mode, notes) | Delete single or bulk-delete (with confirmation) |
| **Document (Invoice/Bill)** | Upload new document | View/download document, view extracted data | Re-upload/replace document, edit extracted data before/after confirming | Delete document (with option to keep or remove the linked expense) |
| **Category/Tag** | Create custom category | View list of categories with usage count | Rename/edit color-icon of a category | Delete category (reassign or archive affected expenses) |
| **User Profile** | Create account (sign-up) | View profile/settings | Edit name, email, currency, password | Delete/deactivate account (with data export offered first) |
| **Report (saved/scheduled)** | Create a report configuration (filters/date range) | View saved reports list | Edit report filters/schedule | Delete saved report |

**Functional/Acceptance Criteria:**
- Every entity above must be creatable, viewable, editable, and deletable directly from the UI — no direct database access required.
- **Delete actions are always confirmed** via a confirmation dialog (e.g., "Are you sure you want to delete this expense? This cannot be undone.") to prevent accidental data loss.
- Deleting an expense should NOT automatically delete its linked document — user is asked whether to keep the document in the vault or remove it too.
- Edits to any entity are reflected instantly across dashboards, charts, and reports (no stale cached data).
- Soft-delete (recoverable within a grace period, e.g., 30-day trash/recycle bin) is recommended over hard-delete for expenses and documents, to protect against accidental loss.
- All CRUD operations are scoped to the authenticated user (per Section 3.0) — a user can only Create/Read/Update/Delete their own records.
- Backend exposes RESTful CRUD endpoints for each entity (e.g., `POST/GET/PUT/DELETE /expenses`, `/documents`, `/categories`), keeping frontend and future integrations consistent.

---

### 3.9 Settings
A dedicated **Settings** screen where users control their account, preferences, and app behavior.

- **Profile Settings**
  - Edit name, email, profile photo.
  - Change password.
  - Delete/deactivate account.
- **Preferences**
  - Default currency.
  - Date format (DD/MM/YYYY vs MM/DD/YYYY).
  - Default view (Daily/Weekly/Monthly) on dashboard load.
  - Theme options (e.g., choice of vibrant color accent themes, light/dark mode).
- **Categories & Payment Modes Management**
  - Add/edit/delete custom categories (icon + color).
  - Add/edit/delete/reorder payment modes and saved card/account labels (e.g., "HDFC CC ••••4821").
- **Notifications** (ties to Section 3.7)
  - Toggle daily reminder on/off, set reminder time.
  - Toggle budget threshold alerts on/off, set thresholds per category.
- **AI & Document Settings**
  - Toggle "auto-approve high-confidence AI extractions" vs. "always review before saving."
  - Manage stored documents (bulk view/delete from Document Vault).
- **Data & Privacy**
  - Export all my data (full account data export — expenses, documents, reports).
  - Manage connected login methods (Google/Apple/email).
  - View active sessions / logout of all devices.
- **(Phase 2) Budgets**
  - Set monthly budget per category, used to power alerts and a "budget vs. actual" view.
- **(Phase 2) Shared Account Management**
  - Manage invited members for shared/family expense groups (see Section 3.0).

**Acceptance Criteria:**
- All settings changes are saved immediately (or via clear Save button) and reflected app-wide without requiring re-login.
- Deleting/deactivating an account triggers a confirmation step and offers a data export first (per Section 3.8 delete-confirmation pattern).
- Settings screen is accessible from a persistent location in the navigation (e.g., profile icon/menu).

---

## 4. UI/UX Requirements

### 4.1 Visual Design Direction
- The interface should feel **vibrant, colorful, and energetic** — not a dull/clinical finance app.
- Use a **bright, high-contrast color palette** (e.g., coral, teal, sunny yellow, violet accents) rather than muted grayscale finance-app conventions.
- Category-based color coding (each expense category gets a distinct, vivid color used consistently across charts and lists) to make visual scanning intuitive.
- Playful iconography and smooth micro-animations (e.g., chart bars animating in, confetti on hitting savings goals).
- Clean typography with strong visual hierarchy so vibrancy doesn't compromise readability.

### 4.2 Key Screens
1. **Home/Dashboard** – Summary cards + charts + quick-add button.
2. **Add Expense** – Manual form + "Upload Document" option side by side.
3. **Document Upload/Review** – Upload → AI extraction preview → confirm.
4. **Expense History** – List/table view with filters and search.
5. **Reports/Insights** – Detailed charts, AI summary, export to Excel/PDF.
6. **Document Vault** – All uploaded invoices/bills in one place.
7. **Settings** – Profile, preferences, categories/payment modes, notifications, AI behavior, data & privacy (see Section 3.9).

### 4.3 Accessibility
- Maintain WCAG AA contrast ratios even within a vibrant palette.
- Charts must include text/number labels, not rely on color alone.

---

## 5. Technical Considerations

### 5.1 High-Level Architecture
- **Frontend:** Responsive web app (mobile + desktop).
- **Backend:** REST API with full CRUD endpoints for all entities (Expenses, Documents, Categories, Users, Reports — see Section 3.8), backed by a relational database (recommended for transactional data).
- **AI/OCR Layer:** **Google Gemini API** (multimodal model) used for document understanding — reads uploaded invoice/bill images or PDFs directly and returns structured JSON (vendor, amount, date, line items, category, payment mode) via a well-defined extraction prompt/schema. Also powers the natural-language spending summary feature (Section 3.4).
- **Storage:** Cloud object storage for uploaded documents (encrypted at rest).

### 5.2 Data Model (Simplified)
- **User** (id, name, email, password_hash / oauth_id, currency preference, created_at)
- **Expense** (id, **user_id [FK, enforced on every query]**, amount, category, date, payment_mode: enum [Cash, Bank Transfer, Credit Card, Debit Card, UPI, Wallet, Cheque, Other], payment_account_label: optional string e.g. "HDFC CC ••••4821", notes, source: manual/AI, linked_document_id)
- **Document** (id, **user_id [FK]**, file_url, upload_date, parsed_status, extracted_data_json)

> All queries and API endpoints must scope data by the authenticated `user_id` to guarantee strict data isolation between users.

### 5.3 Non-Functional Requirements
- **Multi-tenancy:** Architecture must support many concurrent independent users with strict data isolation (row-level scoping by `user_id`, no shared state between accounts unless explicitly opted into a shared group).
- **Security:** Encrypted storage for financial documents; secure authentication (OAuth/SSO or email+password with hashing).
- **Privacy:** Uploaded bills may contain sensitive personal data — must comply with data protection regulations (e.g., GDPR-equivalent).
- **Performance:** Dashboard should load within 2 seconds for up to 12 months of data.
- **Scalability:** Should handle growth from single-user to multi-device sync.

---

## 6. Assumptions & Constraints
- Users will have internet access to use AI parsing (cloud-based processing assumed).
- AI extraction accuracy depends on document quality (blurry photos may reduce accuracy — need a "retry/manual fallback" path).
- Initial version targets web (desktop + mobile browser); native apps are a future consideration.

---

## 7. Out of Scope (Phase 1)
- Bank account/card integration for auto-import of transactions.
- **Shared/family budgets** where multiple users collaboratively view and edit the *same* pool of expenses (Phase 1 supports multiple independent users, each with their own private data; shared/collaborative budgets are Phase 2 — see 3.0).
- Native mobile apps (iOS/Android).
- Investment or net-worth tracking.

---

## 8. Future Roadmap (Post-MVP)
- Bank/UPI integration for automatic transaction import.
- Budget goals with progress tracking.
- Shared/family expense tracking.
- Voice-based expense logging.
- Multi-language document support (leveraging Gemini's native multilingual understanding for non-English invoices/receipts).

---

## 9. Open Questions
- Should AI-parsed expenses require mandatory user confirmation, or allow "auto-approve" for high-confidence extractions?
- What is the target platform priority — mobile-first or desktop-first?
- Should there be a free vs. premium tier (e.g., limit on number of AI document scans per month)?

---

*End of Document*
