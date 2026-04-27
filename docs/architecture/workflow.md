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

This is a shorthand flow, and executable use still follows the conditional /plan-eng-review gate for architecture or risk-heavy work and /browse or /qa when a UI exists.

## Practical Rule
- Update vision first if the product changes.
- Update or create a file under docs/product/ if one feature changes.
- If implementation starts without a plan, stop, create or refresh the needed product docs, run /autoplan, and save the approved plan under docs/superpowers/plans/.
- For architecture or risk-heavy work, run /plan-eng-review before implementation.
- Use /browse or /qa for browser verification when a UI exists.
