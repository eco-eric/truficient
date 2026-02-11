

# Swap Team Assignments

Move Tony Reyes to One Piece Mechanical and move Carlos, Sheyla, and Wilson to Install Team Truficient.

## Data Changes (4 UPDATE statements)

Using the assignment IDs from the database:

| Person | Current Team | New Team |
|---|---|---|
| Tony Reyes | Install Team Truficient | One Piece Mechanical |
| Carlos Alonzo | One Piece Mechanical | Install Team Truficient |
| Sheyla Rios | One Piece Mechanical | Install Team Truficient |
| Wilson Espinal | One Piece Mechanical | Install Team Truficient |

## Technical Details

Update the `team_id` on each `crm_team_assignments` row:

- **Tony Reyes** (assignment `97465285`): set `team_id` to One Piece Mechanical (`f572c179`)
- **Carlos Alonzo** (assignment `7c59f3d8`): set `team_id` to Install Team Truficient (`84083b22`)
- **Sheyla Rios** (assignment `8a466154`): set `team_id` to Install Team Truficient (`84083b22`)
- **Wilson Espinal** (assignment `ddeaa5ec`): set `team_id` to Install Team Truficient (`84083b22`)

Also update the `role` field on each assignment so Tony becomes "lead" on One Piece Mechanical and Carlos becomes "lead" on Install Team Truficient (preserving their lead roles, just on the correct teams).

No code or schema changes needed -- data-only fix.

