

## Searchable Customer Selector for Job Form

### Problem
The current customer dropdown in the Job Form uses a basic `Select` component. It doesn't support typing to search, and names aren't sorted alphabetically when you start looking through them (company names and personal names are mixed without consistent ordering).

### Solution
Replace the basic `Select` with a searchable **Combobox** using the existing `Popover` + `Command` components (already in the project). This gives you:

- A text input where you can type to search by full name (first + last) or company name
- Results filtered as you type, matching against the combined name
- Names sorted alphabetically (last name first for individuals, company name for businesses)

### What Changes

**File: `src/components/admin/jobs/JobFormDialog.tsx`**

1. Replace the `Select` import with `Popover`, `PopoverTrigger`, `PopoverContent` and `Command`, `CommandInput`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandList` imports
2. Sort customers alphabetically by their display name before rendering
3. Replace the Customer `Select` with a Combobox pattern:
   - A button trigger showing the selected customer name (or "Search customers...")
   - A popover with a search input that filters the customer list by typing any part of the name
   - Clicking a result selects that customer and closes the popover
4. The search will match against the full combined name (e.g., typing "emily" or "summers" both find "Emily Summers")

### Technical Details

The Combobox will use the existing `cmdk` library (already installed) via the project's `Command` UI components. The pattern:

```
Popover
  PopoverTrigger -> Button showing selected name
  PopoverContent
    Command
      CommandInput (type-to-search)
      CommandList
        CommandEmpty ("No customers found")
        CommandGroup
          CommandItem (for each customer, filtered by cmdk)
```

Sorting logic: customers sorted by `getCustomerName()` output using `localeCompare` for proper alphabetical ordering.
