
## Add Financing Page Under Resources

### Overview

Create a new public-facing Financing page at `/financing` that explains Truficient's partnership with Synchrony and the types of financing programs available, without listing specific rates or terms (which vary by promotion). The page will include all required Synchrony and federal (TILA/Reg Z) disclosures.

---

### Navigation Updates

| Location | Change |
|----------|--------|
| Header (Resources dropdown) | Add "Financing" link with CreditCard icon |
| Footer (Company column) | Add "Financing" link |

---

### Page Structure

```text
+----------------------------------------------------------+
|                      HERO SECTION                         |
|  "Flexible Financing Options"                            |
|  Make your comfort upgrade affordable                    |
|  [Synchrony Logo]                                        |
+----------------------------------------------------------+

+----------------------------------------------------------+
|                   WHY FINANCE?                            |
|  Grid of 4 benefits:                                     |
|  • Low Monthly Payments  • Quick Application             |
|  • Flexible Terms        • Promotional Options           |
+----------------------------------------------------------+

+----------------------------------------------------------+
|              FINANCING PROGRAMS OVERVIEW                  |
|  3 Program Type Cards (no specific rates):               |
|  • Deferred Interest (No Interest if Paid in Full)       |
|  • Reduced APR / Fixed Pay                               |
|  • Equal Pay / No Interest                               |
+----------------------------------------------------------+

+----------------------------------------------------------+
|                  HOW IT WORKS                             |
|  4-step process:                                         |
|  1. Get Your Estimate → 2. Apply for Financing          |
|  3. Instant Decision → 4. Start Your Project            |
+----------------------------------------------------------+

+----------------------------------------------------------+
|              IMPORTANT INFORMATION                        |
|  Deferred Interest Warning Box                           |
|  (Required Synchrony disclosure)                         |
+----------------------------------------------------------+

+----------------------------------------------------------+
|                    CTA SECTION                            |
|  "Ready to Get Started?"                                 |
|  [Get Your Estimate] [Talk to an Expert]                |
+----------------------------------------------------------+

+----------------------------------------------------------+
|           LEGAL DISCLOSURES (Footer Section)              |
|  All required Synchrony and federal disclosures          |
+----------------------------------------------------------+
```

---

### Required Synchrony Disclosures

Based on research of Synchrony requirements and TILA/Regulation Z:

#### 1. Primary Credit Disclosure (Always Required)
```
*Subject to credit approval. Minimum monthly payments required.
See store associate for details. Financing provided by Synchrony Bank.
```

#### 2. Equal Opportunity Disclosure
```
Synchrony Bank is an Equal Housing Lender.
Equal Opportunity Lender.
```

#### 3. Deferred Interest Warning (Required for "No Interest if Paid in Full" programs)
```
For deferred interest promotions: With this promotional financing offer,
interest accrues (adds up) on your account from the purchase date, but is
only charged if you do not pay off your promotional balance within the
defined promotional period. If you do not pay the promotional balance in
full by the end of the promotional period, all accrued interest will be
charged to your account.
```

#### 4. Fair Lending Statement
```
It is important that financing be offered to ALL customers to ensure
compliance with Fair Lending guidelines.
```

#### 5. Program Availability Notice
```
Promotional financing programs and terms are subject to change.
Specific promotional offers vary by installation type and are
presented during the estimate process. Not all applicants will qualify.
```

---

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Financing.tsx` | CREATE | New financing page |
| `src/App.tsx` | MODIFY | Add route for /financing |
| `src/components/layout/Header.tsx` | MODIFY | Add Financing to Resources dropdown |
| `src/components/layout/Footer.tsx` | MODIFY | Add Financing link to Company column |

---

### Page Component Structure

```typescript
// src/pages/Financing.tsx

const Financing = () => {
  usePageSEO();
  const { trackButtonClick } = useButtonTracking();

  const benefits = [
    { icon: DollarSign, title: "Low Monthly Payments", description: "..." },
    { icon: Clock, title: "Quick Application", description: "..." },
    { icon: Calendar, title: "Flexible Terms", description: "..." },
    { icon: Sparkles, title: "Promotional Options", description: "..." },
  ];

  const programTypes = [
    {
      title: "Deferred Interest",
      subtitle: "No Interest if Paid in Full",
      description: "Pay no interest if you pay the promotional balance...",
      icon: Percent,
    },
    {
      title: "Reduced APR",
      subtitle: "Fixed Monthly Payments",
      description: "Predictable payments at a reduced interest rate...",
      icon: TrendingDown,
    },
    {
      title: "Equal Pay",
      subtitle: "No Interest",
      description: "Fixed monthly payments with 0% APR...",
      icon: CheckCircle,
    },
  ];

  const steps = [
    { step: 1, title: "Get Your Estimate", description: "..." },
    { step: 2, title: "Apply for Financing", description: "..." },
    { step: 3, title: "Instant Decision", description: "..." },
    { step: 4, title: "Start Your Project", description: "..." },
  ];

  return (
    // Hero → Benefits Grid → Program Cards → How It Works → 
    // Important Info Box → CTA → Legal Disclosures
  );
};
```

---

### Styling Approach

- **Hero**: `bg-primary` with Synchrony partner badge
- **Benefits Grid**: 4-column responsive grid with icon cards
- **Program Cards**: 3-column grid, each with icon, title, and description
- **How It Works**: Numbered step cards with connecting visual
- **Warning Box**: Yellow/amber alert-style card for deferred interest warning
- **Disclosures**: Small text at bottom in muted style

---

### Mobile Responsiveness

| Section | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Benefits | 4 cols | 2 cols | 1 col |
| Programs | 3 cols | 2 cols | 1 col |
| Steps | 4 cols | 2 cols | 1 col (stacked) |

---

### Header Navigation Update

Add to Resources dropdown (after Equipment Library):

```tsx
<DropdownMenuItem asChild>
  <Link 
    to="/financing" 
    className="cursor-pointer flex items-center gap-2"
    onClick={() => handleTrackClick('Financing', 'Header - Main Nav', '/financing')}
  >
    <CreditCard className="w-4 h-4 text-secondary" />
    Financing
  </Link>
</DropdownMenuItem>
```

---

### Footer Update

Add to Company column links (after Blog, before Privacy Policy):

```tsx
<li>
  <Link to="/financing" className="hover:text-secondary transition-colors inline-block">
    Financing
  </Link>
</li>
```

---

### Route Addition

```tsx
// In App.tsx router config
{ path: "/financing", element: <Financing /> },
```

---

### Legal Compliance Summary

The page will include these federally-required and Synchrony-required disclosures:

1. Credit approval disclaimer
2. Minimum payment requirement
3. Synchrony Bank as lender
4. Equal opportunity/housing lender statement
5. Deferred interest explanation (for promotional programs)
6. No specific rates shown (rates vary by promotion and are disclosed during estimate)
7. Subject to change notice

---

### Key Design Decisions

1. **No specific rates listed** - Rates vary by promotion and installation type, shown during estimate process
2. **General program descriptions only** - Explains types of financing without committing to specific terms
3. **Prominent deferred interest warning** - Synchrony requires clear disclosure of how deferred interest works
4. **CTAs to estimators** - Drive traffic to estimate process where specific financing options are shown
5. **Synchrony branding** - Include "Powered by Synchrony" badge as required by partnership
