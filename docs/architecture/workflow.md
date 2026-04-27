# PDS Workflow Architecture

## Source Order
1. CLAUDE.md
2. docs/product/vision.md
3. docs/product/*.md
4. docs/superpowers/plans/*.md
5. code and tests

This workflow doc and docs/process/feature-lifecycle.md define how those artifacts are used. If a plan goes stale or conflicts with the shared process docs, update the plan.

## gstack Flow
`/office-hours -> /autoplan -> implementation -> /review -> /qa -> /ship`

Treat validation steps as conditional where appropriate: always run the required project checks, and use UI-specific verification only when a UI exists.

## Practical Rule
- Update vision first if the product changes.
- Update or create a file under docs/product/ if one feature changes.
- If implementation starts without a plan, stop and create one under docs/superpowers/plans/.
- For architecture or risk-heavy work, run /plan-eng-review before implementation.
- Use /browse or /qa for browser verification when a UI exists.
