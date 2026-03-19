# Shetue OS — Finance & Close Management System

## Overview

Shetue OS is a simple, template-based finance system built on Zoho Books for managing accounting, monthly close, and reporting across multiple business divisions.

## Core Components

* Zoho Books (Accounting)
* Google Sheets (Dashboard)
* GitHub (Structure & Version Control)

## Folder Structure

### /dashboard

Contains:

* Close Tracker
* KPI Dashboard

### /zoho

Contains:

* Chart of Accounts
* Opening Balance Templates
* Import-ready CSV files

### /reports

Contains:

* Monthly Close Format
* VAT Summary Format

### /docs

Contains:

* Process Guides
* Standard Operating Procedures

## Workflow

Zoho Books → Export Data → Google Sheets → Review → Store in GitHub

## Rules

* No real financial data stored in GitHub
* Only templates and structure
* One source of truth = Zoho Books

## Future Plan

* Automation scripts
* AI reporting
* WhatsApp alerts
* ## How to Use

1. Setup Zoho Books with Chart of Accounts
2. Input Opening Balance
3. Record daily transactions
4. Export reports (P&L, Balance Sheet)
5. Update Google Sheets dashboard
6. Track close progress using Close Tracker

## Monthly Close Process

* T+1: Cash & Bank Reconciliation
* T+2: Revenue & Expense Check
* T+3: Trial Balance Verification
* T+4: Report Generation
* T+5: Final Close

## System Rule

* Zoho Books = Source of Truth
* GitHub = Template + Structure only

