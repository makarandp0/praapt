# Praapt - Food Assistance Program

## Overview

Praapt is a system for a nonprofit organization that provides food assistance to beneficiaries through partnered restaurants. The system uses face recognition for secure, dignified authentication at vendor kiosks.

## Actors

### Administrators
- Nonprofit staff with elevated privileges
- Responsibilities:
  - Sign up and manage volunteers
  - Sign up and manage donors
  - Oversee overall program operations
  - View reports and analytics

### Donors
- Individuals or organizations providing financial support
- Capabilities:
  - Specify number of meals they want to fund
  - Set criteria for how their donation is used:
    - Demographics (e.g., women, children, elderly)
    - Geographic (e.g., specific city, region)
    - Vendor type (e.g., vegetarian only)
  - View impact reports (meals funded, beneficiaries helped)

### Volunteers
- Staff members associated with the nonprofit
- Responsibilities:
  - Recruit and onboard vendors (restaurants)
  - Qualify and register customers (beneficiaries)
  - Register beneficiary face images during signup

### Vendors
- Restaurants partnered with the nonprofit
- Responsibilities:
  - Provide meals to authenticated beneficiaries
  - Manage their menu (future feature)
  - Process transactions at their kiosk

### Customers (Beneficiaries)
- Individuals qualified to receive food assistance
- Interaction:
  - Get registered by a volunteer (one-time)
  - Visit vendor restaurants
  - Authenticate via face recognition at kiosk
  - Select meal from menu

### Organization (Nonprofit)
- Oversees the program
- Pays vendors for meals provided to beneficiaries
- Manages donor funds and allocation

---

## Workflows

### 1. Customer Registration (Volunteer-facing)

**Performed by:** Volunteer
**Location:** Registration site or nonprofit office

**Data Captured:**
| Field | Description | Required |
|-------|-------------|----------|
| Name | Full name of beneficiary | Yes |
| Aadhaar (last 4) | Last 4 digits of Aadhaar card | Yes |
| Face Photo | Captured via camera for face recognition | Yes |

**Future Fields (TBD):**
- Phone number
- Address
- Eligibility period (start/end dates)
- Meal allowance/limits
- Notes from volunteer

### 2. Kiosk Authentication (Customer-facing)

**Performed by:** Customer (Beneficiary)
**Location:** Vendor restaurant kiosk

**Flow:**
1. Customer approaches kiosk
2. Customer shows face to camera
3. System performs face recognition
4. If match found → Customer authenticated
5. If no match → Show error, suggest contacting volunteer

### 3. Meal Selection & Transaction

**Performed by:** Customer (after authentication)
**Location:** Vendor restaurant kiosk

**Flow:**
1. Display available menu items
2. Customer selects meal
3. Transaction recorded in system
4. Customer receives meal
5. Nonprofit pays vendor (settlement process TBD)

---

## Transaction Rules (Future)

| Rule | Description | Status |
|------|-------------|--------|
| Daily limit | Max 1 meal per day per beneficiary | Planned |
| Meal value cap | Max amount per meal (e.g., Rs. 100) | Planned |
| Vendor-specific limits | Different limits per vendor | TBD |
| Eligibility period | Beneficiary can only use during valid period | Planned |

---

## Vendor Features (Future)

- **Menu Management:** Vendors can add/update/remove menu items
- **Pricing:** Set prices for items (within org guidelines)
- **Availability:** Mark items as available/unavailable
- **Transaction History:** View past transactions at their location

---

## Donor Features (Future)

### Donation Setup
- **Meal Count:** Specify number of meals to fund (e.g., "I want to fund 100 meals")
- **Amount-based:** Alternatively, specify amount and system calculates meals

### Allocation Criteria
Donors can optionally restrict how their donation is used:

| Criteria | Examples |
|----------|----------|
| Demographics | Women only, children, elderly, families |
| Geographic | Specific city, district, or region |
| Vendor type | Vegetarian restaurants only |
| Time-based | Festival meals, weekend meals |

### Impact Dashboard
- Meals funded from their donation
- Beneficiaries helped
- Vendors supported
- Geographic distribution of impact
- Remaining balance / meals left

### Recognition (Optional)
- Anonymous vs. named donations
- Public recognition on impact reports

---

## Payments & Settlements

### Vendor Bank Account Registration
- Vendors must register bank account details during onboarding
- Required fields:
  - Account holder name
  - Bank name
  - Account number
  - IFSC code
- Verification process (TBD): Penny drop or manual verification

### Daily Settlement Process
1. End of day: System calculates total amount owed to each vendor
2. Generates settlement report per vendor
3. Initiates bank transfer to vendor accounts
4. Records transaction reference for reconciliation

### Settlement Details
| Aspect | Description |
|--------|-------------|
| Frequency | Daily (end of day) |
| Calculation | Sum of all meal transactions for the day |
| Currency | INR |
| Transfer method | Bank transfer (UPI/NEFT/IMPS - TBD) |

### Financial Records
- Transaction-level records (each meal)
- Daily settlement summaries per vendor
- Bank transfer confirmations
- Reconciliation reports

### Security Considerations
- Bank account data encryption
- Audit trail for all financial transactions
- Dual approval for large settlements (TBD threshold)
- PCI compliance considerations

---

## Technical Architecture

### Face Recognition
- Face images captured during registration
- Face matching at kiosk for authentication
- Confidence threshold for match acceptance

### Data Storage
- Beneficiary profiles (name, aadhaar last 4, face embedding)
- Vendor profiles and menus
- Transaction records

### Security Considerations
- Face images stored securely
- Aadhaar data (even last 4 digits) requires careful handling
- Transaction audit trail

---

## Roles & Permissions Summary

| Feature | Developer | Admin | Volunteer | Vendor | Donor | Customer |
|---------|-----------|-------|-----------|--------|-------|----------|
| Manage volunteers | Yes | Yes | No | No | No | No |
| Manage donors | Yes | Yes | No | No | No | No |
| Register beneficiaries | Yes | Yes | Yes | No | No | No |
| View all beneficiaries | Yes | Yes | Yes | No | No | No |
| Manage vendors | Yes | Yes | Yes | No | No | No |
| Update menu | Yes | Yes | No | Yes (own) | No | No |
| View all transactions | Yes | Yes | Limited | Own | No | No |
| Set donation criteria | Yes | Yes | No | No | Yes (own) | No |
| View impact reports | Yes | Yes | Yes | Own | Yes (own) | No |
| Register bank account | Yes | Yes | No | Yes (own) | No | No |
| View settlements | Yes | Yes | No | Own | No | No |
| Initiate settlements | Yes | Yes | No | No | No | No |
| Kiosk authentication | - | - | - | - | - | Yes |

---

## Open Questions

1. ~~**Settlement process:** How/when does nonprofit pay vendors?~~ → Daily bank transfer
2. **Offline support:** What if kiosk loses internet connectivity?
3. **Disputes:** How to handle failed authentications or transaction disputes?
4. **Multi-vendor:** Can a beneficiary use multiple vendors in a day?
5. **Family accounts:** Can one registration cover a family?
6. **Fund allocation:** How are donor funds matched to transactions? FIFO? Proportional?
7. **Overlapping criteria:** What if a transaction matches multiple donors' criteria?
8. **Donor onboarding:** Self-service signup or admin-only?
9. **Payment gateway:** Which service for bank transfers? (Razorpay, Cashfree, etc.)
10. **Failed transfers:** Retry policy for failed bank transfers?
11. **Bank account verification:** Penny drop or manual verification?
12. **Settlement disputes:** Process for vendor to dispute settlement amount?

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-03 | Initial requirements document created |
| 2026-02-03 | Added Administrators and Donors as actors |
| 2026-02-03 | Added Payments & Settlements section |
