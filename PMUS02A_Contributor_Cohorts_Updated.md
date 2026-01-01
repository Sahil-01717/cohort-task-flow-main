# PMUS02A: Contributor Cohorts (Updated with Group-Based Conditioning)

## User Story

As a **Project Manager**, I want to **create and view contributor cohorts (filtered lists of users)** based on specific performance metrics and thresholds, so that I can quickly identify contributors who share similar performance characteristics- such as new users, low performers, or top performers- and take informed actions on them (e.g., limit task assignment, retrain, or promote).

---

## User Flow

### Cohort Creation (Custom Cohorts)

PM can create new cohorts using a guided modal (button at the top of the page).

**Steps in cohort creation:**

1. **Select Date Range** [same filter, as we have on the user performance table] 
    
    Defines the time window over which contributor metrics are aggregated (e.g., *Last 7 Days*, *Last 30 Days*, *Custom*).
    
    - **Fixed Ranges (e.g., Last 7 Days, Last 30 Days):**
        
        The system automatically determines the **FROM** and **TO** dates based on the current date.
        
        - Example: For *Last 7 Days*, the system uses today as the **TO** date and computes the **FROM** date as 7 days prior. Metrics are aggregated across this fixed rolling window.
    - **Custom Range:**
        
        Users manually select the **FROM** date and then choose either:
        
        - A specific **TO** date, or
        - **NOW**, which keeps the **TO** date dynamic.
        - When **NOW** is selected, the system continuously aggregates data from the selected **FROM** date up to the current day (whatever data that has been updated for today), updating daily as "NOW" advances.

2. **Select Step** - choose workflow step such as Maker, Reviewer, or QC.

3. **Select Metric(s)** - choose one or more metrics from the available metrics for the selected step (e.g., Tasks submitted, Tasks accepted, Tasks rejected, Tasks skipped, Average handling time, Review Acceptance Rate for Maker step, or QC Pass Rate for Reviewer step).

4. **Define Conditions** - add threshold rules using **Group-Based Conditioning Logic** (detailed below).

5. **Add Name & Description** – clearly describe what the cohort represents and its intended use.

6. **Save & Generate** – system evaluates all contributors and lists those matching the conditions.

---

## Group-Based Conditioning Logic

### What is Group-Based Conditioning?

Group-Based Conditioning is a visual, intuitive way to define complex logical conditions for cohort creation. Instead of using linear chains that can be ambiguous, conditions are organized into **groups** where:

- **Within a group**: All conditions share the same logical operator (AND or OR)
- **Between groups**: Groups are connected by a different operator (AND or OR)

This approach makes complex logic clear and eliminates ambiguity about how conditions are evaluated.

### Visual Structure

```
┌─ Group 1 (AND) ───────────────────────────────┐
│ Condition A: Tasks submitted > 10           │
│ Condition B: Review Acceptance Rate < 80%   │
└─────────────────────────────────────────────┘
            [AND] (group connector)
┌─ Group 2 (OR) ─────────────────────────────┐
│ Condition C: Tasks rejected > 90th percentile│
│ Condition D: Average handling time > 60 mins│
└─────────────────────────────────────────────┘
```

**Result:** `(A AND B) AND (C OR D)`

**Note:** Metrics shown are for Maker step. For Reviewer step, use "QC Pass Rate" instead of "Review Acceptance Rate".

### How It Works

1. **Create Groups**: PMs can create one or more condition groups
2. **Set Group Operator**: Each group has an operator (AND or OR) that applies to all conditions within it
3. **Add Conditions**: Multiple conditions can be added to each group
4. **Connect Groups**: Groups are connected using a group connector (AND or OR)
5. **Visual Preview**: System shows a preview of the final logic (e.g., "Group 1 (AND) AND Group 2 (OR)")

### Evaluation Logic

The system evaluates conditions in the following order:

1. **Within each group**: Evaluate all conditions using the group's operator
   - Group with AND: All conditions must be true
   - Group with OR: At least one condition must be true

2. **Between groups**: Evaluate group results using the group connector
   - Groups connected by AND: All groups must evaluate to true
   - Groups connected by OR: At least one group must evaluate to true

**Example:**
- Group 1 (AND): `(A AND B)` → Result1
- Group 2 (OR): `(C OR D)` → Result2
- Group Connector: AND
- Final: `Result1 AND Result2` = `(A AND B) AND (C OR D)`

---

## Benefits of Group-Based Conditioning

### 1. **Clarity & Transparency**
- Visual grouping makes the logic immediately obvious
- No ambiguity about evaluation order
- Preview text helps users understand the final condition

### 2. **Flexibility**
- Supports all use cases from simple to complex
- Can express any logical combination: `(A AND B) OR (C AND D)`, `(A OR B) AND C`, etc.

### 3. **Intuitive for Non-Technical Users**
- Matches how PMs think about conditions ("contributors who are slow AND have low quality")
- No need to understand operator precedence rules
- Progressive disclosure: Simple cases use one group, complex cases add more

### 4. **Error Prevention**
- Visual structure prevents common mistakes
- Clear separation between "within group" and "between groups" logic
- System validates and shows preview before saving

---

## Pros and Cons

### Pros ✅

1. **Eliminates Ambiguity**
   - No confusion about evaluation order (unlike linear chains)
   - Clear visual representation of logic structure

2. **Supports Complex Logic**
   - Can express nested conditions like `(A AND B) OR (C AND D)`
   - Handles all PRD use cases without limitations

3. **User-Friendly**
   - Intuitive visual grouping
   - Matches mental model of grouping related conditions
   - Preview helps users verify their logic

4. **Scalable**
   - Works well with 2-3 conditions (simple case)
   - Also handles 5+ conditions with multiple groups (complex case)

5. **Maintainable**
   - Easy to understand and modify existing cohorts
   - Clear structure makes debugging easier

### Cons ⚠️

1. **Slightly More Complex UI**
   - Requires understanding of groups vs. linear chains
   - More UI elements (group headers, connectors)

2. **Learning Curve**
   - Users need to understand the concept of groups
   - May be overkill for very simple cases (though simple cases still work with one group)

3. **More Clicks for Simple Cases**
   - For a simple "A AND B AND C" case, groups add slight overhead
   - However, this is minimal and the clarity benefit outweighs it

---

## Available Metrics by Step

### Maker Step Metrics
- **Tasks submitted** (Tasks Delivered)
- **Tasks accepted**
- **Tasks rejected**
- **Tasks skipped**
- **Average handling time**
- **Total time taken**
- **Review Acceptance Rate** (percentage of Maker tasks that passed all downstream steps)
- ❌ **QC Pass Rate** - Not applicable for Maker step

### Reviewer Step Metrics
- **Tasks submitted** (Tasks Delivered)
- **Tasks accepted**
- **Tasks rejected**
- **Tasks skipped**
- **Average handling time**
- **Total time taken**
- **QC Pass Rate** (percentage of reviewed tasks that passed Quality Check)
- ❌ **Review Acceptance Rate** - Not applicable for Reviewer step

### Quality Check Step Metrics
- **Tasks submitted** (Tasks Delivered)
- **Tasks accepted**
- **Tasks rejected**
- **Tasks skipped**
- **Average handling time**
- **Total time taken**
- ❌ **QC Pass Rate** - Not applicable for QC step
- ❌ **Review Acceptance Rate** - Not applicable for QC step

**Note:** When creating cohorts, the system will only show metrics that are applicable to the selected workflow step.

---

## Examples for Project Managers

### Example 1: Simple Case - All AND Conditions

**Use Case:** "Worst Performers - Low Quality (Maker Step)"

**PM's Mental Model:** "Makers who have submitted enough tasks AND have low review acceptance rate AND have high rejection rate"

**Group Structure:**
```
Group 1 (AND):
  - Tasks submitted >= 10
  - Review Acceptance Rate < 25th percentile (bottom 25%)
  - Tasks rejected > 90th percentile (top 10%)
```

**Result:** `(Tasks >= 10 AND Review Acceptance Rate < P25 AND Tasks Rejected > P90)`

**Why Groups Help:** Even though this is simple, the group structure makes it clear that ALL conditions must be met.

**Note:** This example is for Maker step. For Reviewer step, you would use "QC Pass Rate" instead of "Review Acceptance Rate".

---

### Example 2: Complex Case - Mixed Logic

**Use Case:** "At-Risk Reviewers - Quality Issues"

**PM's Mental Model:** "Reviewers who have submitted enough tasks AND (have low QC pass rate OR high number of rejected tasks)"

**Group Structure:**
```
Group 1 (AND):
  - Tasks submitted >= 5

Group 2 (OR):
  - QC Pass Rate < 10th percentile (bottom 10%)
  - Tasks rejected > 90th percentile (top 10%)

Groups connected by: AND
```

**Result:** `(Tasks >= 5) AND (QC Pass Rate < P10 OR Tasks Rejected > P90)`

**Why Groups Help:** This clearly shows that reviewers need minimum tasks AND at least one quality issue. Without groups, this would be ambiguous in a linear chain.

**Note:** This example is for Reviewer step. For Maker step, you would use "Review Acceptance Rate" instead of "QC Pass Rate".

---

### Example 3: Multiple Quality Signals

**Use Case:** "High Performers - Multiple Quality Indicators (Reviewer Step)"

**PM's Mental Model:** "Reviewers who have high QC pass rate AND low number of rejected tasks AND sufficient tasks submitted"

**Group Structure:**
```
Group 1 (AND):
  - QC Pass Rate > 95th percentile (top 5%)
  - Tasks rejected < 10th percentile (bottom 10%)
  - Tasks submitted >= 20
```

**Result:** `(QC Pass Rate > P95 AND Tasks Rejected < P10 AND Tasks >= 20)`

**Why Groups Help:** All conditions must be true - the group makes this explicit.

**Note:** This example is for Reviewer step. For Maker step, you would use "Review Acceptance Rate" instead of "QC Pass Rate".

---

### Example 4: Complex Multi-Group Logic

**Use Case:** "Worst Performers - Multiple Failure Modes (Maker Step)"

**PM's Mental Model:** "Makers who have (low review acceptance rate OR high number of rejected tasks) AND have submitted enough tasks to be significant"

**Group Structure:**
```
Group 1 (OR):
  - Review Acceptance Rate < 25th percentile (bottom 25%)
  - Tasks rejected > 95th percentile (top 5%)

Group 2 (AND):
  - Tasks submitted >= 10

Groups connected by: AND
```

**Result:** `(Review Acceptance Rate < P25 OR Tasks Rejected > P95) AND (Tasks >= 10)`

**Why Groups Help:** This clearly separates the quality issues (any one is enough) from the minimum task requirement (must be met).

**Note:** This example is for Maker step. For Reviewer step, you would use "QC Pass Rate" instead of "Review Acceptance Rate".

---

## Comparison with Linear Chain Approach

### Linear Chain Example

If we used a linear chain for Example 2:
```
Tasks >= 5 AND QC Pass Rate < P10 OR Tasks Rejected > P90
```

**Problem:** This is ambiguous! Does it mean:
- `(Tasks >= 5 AND QC Pass Rate < P10) OR (Tasks Rejected > P90)` ❌ Wrong!
- `(Tasks >= 5) AND (QC Pass Rate < P10 OR Tasks Rejected > P90)` ✅ Correct!

**With Groups:** The structure makes it clear: `(Tasks >= 5) AND (QC Pass Rate < P10 OR Tasks Rejected > P90)`

---

## Real-World PM Use Cases

### Use Case 1: "New Contributors Needing Support"

**Group Structure:**
```
Group 1 (AND):
  - Tasks submitted < 5
  - Date range: Last 30 days
```

**Action:** Increase QC sampling, send onboarding materials

---

### Use Case 2: "Inactive Contributors"

**Group Structure:**
```
Group 1 (AND):
  - Tasks submitted = 0
  - Date range: Last 7 days
```

**Action:** Send engagement email, consider removing from active roster

---

### Use Case 3: "Slow but Careful Workers (Reviewer Step)"

**Group Structure:**
```
Group 1 (AND):
  - Average handling time > 90th percentile (top 10%)
  - QC Pass Rate >= 50th percentile (above median)
```

**Action:** Provide efficiency training, but acknowledge quality

**Note:** For Maker step, use "Review Acceptance Rate" instead of "QC Pass Rate"

---

### Use Case 4: "Multiple Risk Factors (Maker Step)"

**Group Structure:**
```
Group 1 (OR):
  - Review Acceptance Rate < 10th percentile (bottom 10%)
  - Tasks rejected > 95th percentile (top 5%)
  - Tasks skipped > 20

Group 2 (AND):
  - Tasks submitted >= 5

Groups connected by: AND
```

**Action:** Flag for review, consider task limits or retraining

**Note:** This example is for Maker step. For Reviewer step, use "QC Pass Rate" instead of "Review Acceptance Rate"

---

## Technical Implementation Notes

### Data Structure

- **ConditionGroup**: Contains operator (AND/OR) and array of conditions
- **Group Connector**: Operator connecting groups (AND/OR)
- **CohortCondition**: Individual condition with metric, operator, value, percentile flag

### Evaluation Algorithm

```javascript
function evaluateCohort(contributor, conditionGroups, groupConnector) {
  // Evaluate each group
  const groupResults = conditionGroups.map(group => {
    const conditionResults = group.conditions.map(c => 
      evaluateCondition(contributor, c)
    );
    
    // Apply group operator
    return group.operator === 'AND' 
      ? conditionResults.every(r => r === true)
      : conditionResults.some(r => r === true);
  });
  
  // Apply group connector
  return groupConnector === 'AND'
    ? groupResults.every(r => r === true)
    : groupResults.some(r => r === true);
}
```

### Backward Compatibility

- Existing cohorts with linear conditions are automatically converted to a single group
- Old format: `[A, B, C]` with operators `[AND, OR]` → New format: Single group with conditions `[A, B, C]` and operator based on most common operator

---

## UI/UX Guidelines

### Visual Design

1. **Group Header**: Clearly labeled with group number and operator
2. **Group Boundaries**: Visual borders or background to show grouping
3. **Group Connector**: Prominent display between groups showing connection operator
4. **Preview**: Always visible preview of final logic

### User Guidance

1. **Tooltips**: Explain what "within group" vs "between groups" means
2. **Examples**: Show common patterns in help text
3. **Validation**: Real-time feedback on condition validity
4. **Preview**: Always show how the logic will be evaluated

### Progressive Disclosure

- **Simple Case**: One group, multiple conditions - intuitive
- **Complex Case**: Multiple groups - advanced users can create sophisticated logic
- **Default**: Start with one group to reduce cognitive load

---

## Summary

Group-Based Conditioning provides a **clear, flexible, and intuitive** way for Project Managers to define complex logical conditions for cohort creation. While it adds slight complexity compared to linear chains, the benefits of **clarity, flexibility, and error prevention** make it the preferred approach for supporting all use cases from simple to complex.

The visual grouping structure matches how PMs think about conditions ("these conditions together" vs "these conditions separately"), making it easier to create accurate cohorts that match their intent.

