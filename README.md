# Shetue OS — Unified Enterprise Operating System
### Finance & Close Management System

🔗 **[Live System Report & Blueprint (Notion)](https://www.notion.so/Shetue-OS-Full-System-Report-Apr-2026-578f16179ee740b79f71001c44c9d575?source=copy_link)**

This repository acts as the central codebase and structural framework for **Shetue OS**, managing accounting, monthly close, and operational reporting across all business divisions.

## 📌 Overview & System Principles
* **Zoho Books** → Accounting & Source of Truth
* **Google Sheets** → Dashboard & Reporting Layer
* **GitHub** → System Structure, Templates & Version Control
* **Notion & n8n** → Automations & External Platform Sync

* ❌ **No real financial data stored in GitHub**
* ✅ Only templates, formats, and structure

---

## 🏗️ Architecture & Directory Layout

### 📊 `/dashboard`
*The frontend user interface connecting all databases.*
- **`/modules`**: Core database interfaces.
  - `/finance` (Zoho Books data integration, Daily KPI)
  - `/engineering` (Tender Tracker, Running Projects, Document Vault)
  - `/land` (Master Land Bank, Status Overview)
  - `/compliance` (Digital Access, License Vault)
  - `/tasks` (Task Manager, Global Tasks)
- **`/control_panels`**: Dedicated operational dashboards for specific business divisions.
  - `/cng`, `/lpg`, `/feed_mills`, `/pharmacy`, `/shetue_tech`

### 🔄 `/zoho`
*API scripts and logic for Zoho Books and Inventory.*
- Division tags mapping and Opening balance integration scripts
- Chart of Accounts, Import-ready CSV files
- FIFO logic checks

### 🧠 `/notion` & Automations
*Syncing scripts mapping Notion Databases to external platforms like Zoho.*
- n8n webhook payloads and Automated API syncs.

### 📝 `/docs`
*Centralized technical documentation and guides.*
- Google Drive Naming Standard enforcement rules.
- Bitwarden Password Vault management standards.
- SOPs (Standard Operating Procedures).

### 📈 `/reports`
*Automated reporting and data models.*
- Daily cash reconciliation logics.
- KPI summaries, Monthly Close Format, VAT Summary Format.

---

## 📅 Monthly Close Process
1. Setup Zoho Books with Chart of Accounts & Input Opening Balances.
2. Record daily transactions.
3. Export reports (P&L, Balance Sheet) & Update Google Sheets dashboard.
* **T+1** → Cash & Bank Reconciliation
* **T+2** → Revenue & Expense Check
* **T+3** → Trial Balance Verification
* **T+4** → Report Generation
* **T+5** → Final Close

---

## 🚀 Current Priority & Future Plan
- [ ] Build out the Control Panel Web Views in `/dashboard/control_panels`
- [ ] Prepare the `n8n` syncing scripts in `/notion`
- [ ] Upload Chart of Accounts template & Add Opening Balance CSV
- [ ] Create Close Tracker (Google Sheets)
- [ ] Document full SOP in `/docs`
- AI-based reporting & WhatsApp alert system
