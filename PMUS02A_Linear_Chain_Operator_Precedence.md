# PMUS02A: Real-World Use Cases with Linear Chain + Operator Precedence

## Overview

This document shows how the same real-world PM use cases would be expressed using **linear chain conditions with operator precedence** (AND evaluated before OR) instead of the group-based approach.

## Operator Precedence Rules

**Standard Boolean Logic:**
- **AND** has higher precedence than **OR** (like multiplication before addition)
- Evaluation order: All AND operations first, then OR operations
- Parentheses can be used to override precedence, but in a linear chain UI, we rely on implicit precedence

**Example:**
```
A AND B OR C AND D
```
**Evaluates as:** `(A AND B) OR (C AND D)`

---

## Real-World PM Use Cases (Linear Chain Approach)

### Use Case 1: "New Contributors Needing Support"

**PM's Intent:** "Contributors who have submitted fewer than 5 tasks in the last 30 days"

**Linear Chain:**
```
Tasks submitted < 5 AND Date range = Last 30 days
```

**Evaluation with Precedence:**
- `(Tasks < 5 AND Date range = Last 30 days)`
- Both conditions must be true

**Result:** ✅ Clear and unambiguous - simple AND chain

**Action:** Increase QC sampling, send onboarding materials

**Note:** This simple case works well with linear chains.

---

### Use Case 2: "Inactive Contributors"

**PM's Intent:** "Contributors who have submitted zero tasks in the last 7 days"

**Linear Chain:**
```
Tasks submitted = 0 AND Date range = Last 7 days
```

**Evaluation with Precedence:**
- `(Tasks = 0 AND Date range = Last 7 days)`
- Both conditions must be true

**Result:** ✅ Clear and unambiguous - simple AND chain

**Action:** Send engagement email, consider removing from active roster

**Note:** This simple case works well with linear chains.

---

### Use Case 3: "Slow but Careful Workers (Reviewer Step)"

**PM's Intent:** "Reviewers who have high average handling time AND good QC pass rate"

**Linear Chain:**
```
Average handling time > 90th percentile AND QC Pass Rate >= 50th percentile
```

**Evaluation with Precedence:**
- `(AHT > P90 AND QC Pass Rate >= P50)`
- Both conditions must be true

**Result:** ✅ Clear and unambiguous - simple AND chain

**Action:** Provide efficiency training, but acknowledge quality

**Note:** For Maker step, use "Review Acceptance Rate" instead of "QC Pass Rate"

---

### Use Case 4: "Worst Performers - Low Quality (Maker Step)"

**PM's Intent:** "Makers who have submitted enough tasks AND have low review acceptance rate AND have high rejection rate"

**Linear Chain:**
```
Tasks submitted >= 10 AND Review Acceptance Rate < 25th percentile AND Tasks rejected > 90th percentile
```

**Evaluation with Precedence:**
- `(Tasks >= 10 AND Review Acceptance Rate < P25 AND Tasks Rejected > P90)`
- All three conditions must be true

**Result:** ✅ Clear and unambiguous - all AND operations

**Action:** Flag for review, consider task limits or retraining

**Note:** This example is for Maker step. For Reviewer step, use "QC Pass Rate" instead of "Review Acceptance Rate"

---

### Use Case 5: "At-Risk Reviewers - Quality Issues"

**PM's Intent:** "Reviewers who have submitted enough tasks AND (have low QC pass rate OR high number of rejected tasks)"

**Linear Chain:**
```
Tasks submitted >= 5 AND QC Pass Rate < 10th percentile OR Tasks rejected > 90th percentile
```

**Evaluation with Precedence:**
- Step 1: Evaluate AND operations first
  - `(Tasks >= 5 AND QC Pass Rate < P10)` → Result1
- Step 2: Evaluate OR operations
  - `Result1 OR Tasks Rejected > P90`
- **Final:** `(Tasks >= 5 AND QC Pass Rate < P10) OR Tasks Rejected > P90`

**Problem:** ❌ This is **WRONG**! 

The PM's intent was: `(Tasks >= 5) AND (QC Pass Rate < P10 OR Tasks Rejected > P90)`

But with operator precedence, it evaluates as: `(Tasks >= 5 AND QC Pass Rate < P10) OR Tasks Rejected > P90`

**What this means:**
- A reviewer with `Tasks = 3, QC Pass Rate = 5%, Tasks Rejected = 95th percentile` would be included
- But the PM wanted minimum 5 tasks as a requirement!

**Result:** ❌ Ambiguous and doesn't match PM intent

**Action:** Flag for review, consider task limits or retraining

**Note:** This is a critical case where linear chains with precedence fail to express the intended logic.

---

### Use Case 6: "Multiple Risk Factors (Maker Step)"

**PM's Intent:** "Makers who have (low review acceptance rate OR high rejected tasks OR many skipped tasks) AND have submitted enough tasks to be significant"

**Linear Chain:**
```
Review Acceptance Rate < 10th percentile OR Tasks rejected > 95th percentile OR Tasks skipped > 20 AND Tasks submitted >= 5
```

**Evaluation with Precedence:**
- Step 1: Evaluate AND operations first
  - `(Tasks Skipped > 20 AND Tasks >= 5)` → Result1
- Step 2: Evaluate OR operations
  - `Review Acceptance Rate < P10 OR Tasks Rejected > P95 OR Result1`
- **Final:** `Review Acceptance Rate < P10 OR Tasks Rejected > P95 OR (Tasks Skipped > 20 AND Tasks >= 5)`

**Problem:** ❌ This is **WRONG**!

The PM's intent was: `(Review Acceptance Rate < P10 OR Tasks Rejected > P95 OR Tasks Skipped > 20) AND Tasks >= 5`

But with operator precedence, it evaluates as: `Review Acceptance Rate < P10 OR Tasks Rejected > P95 OR (Tasks Skipped > 20 AND Tasks >= 5)`

**What this means:**
- A maker with `Review Acceptance Rate = 5%, Tasks = 2` would be included (no minimum task requirement!)
- A maker with `Tasks Rejected = 98th percentile, Tasks = 1` would be included (no minimum task requirement!)
- Only makers with high skipped tasks need the minimum task requirement

**Result:** ❌ Ambiguous and doesn't match PM intent

**Action:** Flag for review, consider task limits or retraining

**Note:** This is another critical case where linear chains with precedence fail.

---

### Use Case 7: "High Performers - Multiple Quality Indicators (Reviewer Step)"

**PM's Intent:** "Reviewers who have high QC pass rate AND low rejection rate AND sufficient tasks"

**Linear Chain:**
```
QC Pass Rate > 95th percentile AND Tasks rejected < 10th percentile AND Tasks submitted >= 20
```

**Evaluation with Precedence:**
- `(QC Pass Rate > P95 AND Tasks Rejected < P10 AND Tasks >= 20)`
- All three conditions must be true

**Result:** ✅ Clear and unambiguous - all AND operations

**Action:** Reduce QC sampling, consider promotion

**Note:** This example is for Reviewer step. For Maker step, use "Review Acceptance Rate" instead of "QC Pass Rate"

---

### Use Case 8: "Worst Performers - Multiple Failure Modes (Maker Step)"

**PM's Intent:** "Makers who have (low review acceptance rate OR high rejected tasks) AND have submitted enough tasks to be significant"

**Linear Chain:**
```
Review Acceptance Rate < 25th percentile OR Tasks rejected > 95th percentile AND Tasks submitted >= 10
```

**Evaluation with Precedence:**
- Step 1: Evaluate AND operations first
  - `(Tasks Rejected > P95 AND Tasks >= 10)` → Result1
- Step 2: Evaluate OR operations
  - `Review Acceptance Rate < P25 OR Result1`
- **Final:** `Review Acceptance Rate < P25 OR (Tasks Rejected > P95 AND Tasks >= 10)`

**Problem:** ❌ This is **WRONG**!

The PM's intent was: `(Review Acceptance Rate < P25 OR Tasks Rejected > P95) AND Tasks >= 10`

But with operator precedence, it evaluates as: `Review Acceptance Rate < P25 OR (Tasks Rejected > P95 AND Tasks >= 10)`

**What this means:**
- A maker with `Review Acceptance Rate = 20%, Tasks = 2` would be included (no minimum task requirement!)
- Only makers with high rejected tasks need the minimum task requirement

**Result:** ❌ Ambiguous and doesn't match PM intent

**Action:** Flag for review, consider disabling

**Note:** This is another critical case where linear chains with precedence fail.

---

## Summary of Issues with Linear Chain + Operator Precedence

### Cases That Work ✅

1. **All AND conditions** - Clear and unambiguous
   - Example: `A AND B AND C` → `(A AND B AND C)`

2. **All OR conditions** - Clear and unambiguous
   - Example: `A OR B OR C` → `(A OR B OR C)`

3. **Simple patterns** - When AND operations naturally group together
   - Example: `A AND B OR C AND D` → `(A AND B) OR (C AND D)` ✅ (if this matches intent)

### Cases That Fail ❌

1. **Mixed logic requiring minimum requirements** - When you need `(A OR B) AND C`
   - Linear chain: `A OR B AND C` evaluates as `A OR (B AND C)` ❌
   - PM intent: `(A OR B) AND C` ✅

2. **Complex nested conditions** - When logic doesn't align with precedence
   - Example: `Tasks >= 5 AND (QC < P10 OR Rejected > P90)` cannot be expressed clearly

3. **User confusion** - PMs may not understand operator precedence
   - Non-technical users expect left-to-right evaluation
   - Precedence rules are not intuitive

---

## Comparison: Linear Chain vs Group-Based

| Use Case | Linear Chain Result | PM Intent | Match? |
|----------|-------------------|-----------|--------|
| Use Case 1 (New Contributors) | `(Tasks < 5 AND Date = 30d)` | `(Tasks < 5 AND Date = 30d)` | ✅ |
| Use Case 2 (Inactive) | `(Tasks = 0 AND Date = 7d)` | `(Tasks = 0 AND Date = 7d)` | ✅ |
| Use Case 3 (Slow but Careful) | `(AHT > P90 AND QC >= P50)` | `(AHT > P90 AND QC >= P50)` | ✅ |
| Use Case 4 (Worst Performers) | `(Tasks >= 10 AND Rate < P25 AND Rejected > P90)` | `(Tasks >= 10 AND Rate < P25 AND Rejected > P90)` | ✅ |
| Use Case 5 (At-Risk Reviewers) | `(Tasks >= 5 AND QC < P10) OR Rejected > P90` | `(Tasks >= 5) AND (QC < P10 OR Rejected > P90)` | ❌ |
| Use Case 6 (Multiple Risk) | `Rate < P10 OR Rejected > P95 OR (Skipped > 20 AND Tasks >= 5)` | `(Rate < P10 OR Rejected > P95 OR Skipped > 20) AND Tasks >= 5` | ❌ |
| Use Case 7 (High Performers) | `(QC > P95 AND Rejected < P10 AND Tasks >= 20)` | `(QC > P95 AND Rejected < P10 AND Tasks >= 20)` | ✅ |
| Use Case 8 (Multiple Failure) | `Rate < P25 OR (Rejected > P95 AND Tasks >= 10)` | `(Rate < P25 OR Rejected > P95) AND Tasks >= 10` | ❌ |

**Success Rate:** 5 out of 8 use cases (62.5%) work correctly with linear chains + operator precedence.

---

## Key Takeaways

### When Linear Chains Work
- ✅ Simple AND chains: `A AND B AND C`
- ✅ Simple OR chains: `A OR B OR C`
- ✅ Patterns that naturally align with precedence: `A AND B OR C AND D` (if intent matches)

### When Linear Chains Fail
- ❌ Mixed logic requiring minimum requirements: `(A OR B) AND C`
- ❌ Complex nested conditions that don't align with precedence
- ❌ Any case where PM intent doesn't match standard precedence rules

### Why Group-Based is Better
1. **100% accuracy** - Expresses all use cases correctly
2. **No ambiguity** - Visual structure makes intent clear
3. **User-friendly** - No need to understand operator precedence
4. **Flexible** - Supports any logical combination

---

## Conclusion

While linear chains with operator precedence work for **simple cases** (all AND or all OR), they **fail for 37.5% of real-world use cases** that require mixed logic with minimum requirements.

The group-based approach ensures **100% accuracy** and **eliminates ambiguity**, making it the preferred solution for supporting all PM use cases from simple to complex.

