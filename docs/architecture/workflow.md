# PDS Workflow Architecture

## Source Order
1. CLAUDE.md
2. docs/product/vision.md
3. docs/product/*.md
4. docs/superpowers/plans/*.md
5. code and tests

## gstack Flow
`/office-hours -> /autoplan -> implementation -> /review -> /qa -> /ship`

## Practical Rule
- Update vision first if the product changes.
- Update or create a file under docs/product/ if one feature changes.
- If implementation starts without a plan, stop and create one under docs/superpowers/plans/.
