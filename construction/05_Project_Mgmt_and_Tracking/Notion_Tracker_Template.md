# Notion Contractor Tracking Dashboard (Shetue Duplex)

This template is designed to help you track the progress and payments for your painting contractor. You can copy these tables into your Notion workspace.

## 1. Project Overview Table
| Item | Details |
| :--- | :--- |
| **Contractor** | [Name] |
| **Start Date** | [Date] |
| **Deadline** | [Date] |
| **Total Area** | 5,400 sq. ft |
| **Total Budget** | [Amount] BDT |
| **Paid to Date** | [Sum of Payments] |
| **Remaining** | [Balance] |

---

## 2. Daily Progress Log (Database/Gallery)
*Use this to track quality and daily attendance.*

| Date | Phase | Status | Notes / Issues | Photo Link |
| :--- | :--- | :--- | :--- | :--- |
| 2026-04-12 | Surface Prep | Done | All cracks on GF filled | [Link] |
| 2026-04-13 | Primer (Exterior) | Ongoing | Rain slowed work | [Link] |

---

## 3. Financial Tracking (Database)
| Payment Date | Description | Amount (BDT) | Method | Proof (Image) |
| :--- | :--- | :--- | :--- | :--- |
| 2026-04-10 | 30% Advance | [Amount] | Bank Transfer | [Link] |
| TBD | 40% Mid-point | [Amount] | TBD | [Link] |
| TBD | 30% Final | [Amount] | TBD | [Link] |

---

## 4. Quality Checklist
- [ ] Surface is smooth (no visible cracks/holes before paint)
- [ ] No paint splashes on windows/floors
- [ ] Uniform color (no patches)
- [ ] Edges are clean (no bleeding)
- [ ] Paint dilution smells/looks correct (not watery)
- [ ] 12-month warranty certificate received from contractor

---

## 5. Penalty Calculator (Formula for Notion)
`if(DateDiff(ActualEnd, Deadline, "days") > 0, TotalContract * 0.01 * DateDiff(ActualEnd, Deadline, "days"), 0)`
