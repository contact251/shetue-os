# 🧠 Shetue OS — Finance & Close Management System

## 📌 Overview

Shetue OS is a simple, template-based finance system built on **Zoho Books** to manage accounting, monthly close, and reporting across multiple business divisions.

---

## ⚙️ Core Components

* **Zoho Books** → Accounting (Source of Truth)
* **Google Sheets** → Dashboard & Analysis
* **GitHub** → Structure, Templates & Version Control

---
## 📁 Folder Structure

### `/dashboard`

* Close Tracker
* KPI Dashboard

### `/zoho`

* Chart of Accounts
* Opening Balance Templates
* Import-ready CSV files

### `/reports`

* Monthly Close Format
* VAT Summary Format

### `/docs`

* Process Guides
* Standard Operating Procedures (SOPs)

---

## 🔄 Workflow

Zoho Books → Export Data → Google Sheets → Review → Store in GitHub


---

## 📏 System Rules

* ❌ No real financial data stored in GitHub
* ✅ Only templates, formats, and structure
* 🎯 Single Source of Truth = **Zoho Books**

---

## 🧩 How to Use

1. Setup Zoho Books with Chart of Accounts
2. Input Opening Balances
3. Record daily transactions
4. Export reports (P&L, Balance Sheet)
5. Update Google Sheets dashboard
6. Track progress using Close Tracker

---

## 📅 Monthly Close Process

* **T+1** → Cash & Bank Reconciliation
* **T+2** → Revenue & Expense Check
* **T+3** → Trial Balance Verification
* **T+4** → Report Generation
* **T+5** → Final Close

---

## 🚀 Future Plan

* Automation scripts (n8n integration)
* AI-based reporting
* WhatsApp alert system

---

## 🧠 System Principle

* **Zoho Books = Data Source**
* **GitHub = System Structure**
* **Google Sheets = Reporting Layer**

---

## 📌 Status

🟡 In Setup Phase

---

## ✅ Next Steps

* [ ] Upload Chart of Accounts template
* [ ] Add Opening Balance CSV
* [ ] Create Close Tracker (Google Sheets)
* [ ] Document full SOP in `/docs`
