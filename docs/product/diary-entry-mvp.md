# Diary Entry MVP

## User Story

As the user, I want to write today's entry, see previous entries, and update or remove an entry later.

## Required Capabilities

1. Create a diary entry with `title`, `content`, and `entryDate`.
2. View saved diary entries in reverse chronological order.
3. Open an existing entry, edit its `title`, `content`, or `entryDate`, and save the updated version.
4. Delete an existing entry only after an explicit confirmation step.

## Acceptance Criteria

- Empty title is rejected.
- Empty content is rejected.
- A saved entry appears without a manual refresh.
- Editing an entry persists the updated values.
- Deleting an entry removes it from the diary.

## Open Questions

- Draft autosave: no
- Tags: no
- Mood metadata: no
