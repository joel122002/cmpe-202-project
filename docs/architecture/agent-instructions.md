# Instructions for Coding Agents

Use this file when assigning implementation work to an automated coding agent.

## Prompt template

```text
You are implementing the <MODULE> module in the vacation-rental MVP.

Read these files first:
- docs/architecture/README.md
- docs/architecture/contracts.md
- docs/architecture/modules/<MODULE>.md

Scope:
- Change only the module and directly necessary app wiring.
- Do not add functionality outside the documented MVP.
- Do not change public contracts without updating the contract markdown.
- Preserve unrelated work already present in the repository.

Required output:
- implementation;
- migrations if needed;
- unit tests;
- integration tests for the module's critical API flow;
- a concise summary of changed files and test commands.
```

## Agent behavior rules

- Inspect the repository before creating files.
- Use the existing language, framework, formatting, and test conventions.
- Do not introduce a new framework or dependency unless required and documented.
- Do not create a second implementation of an existing module.
- Do not access another module's repository or private data model directly.
- Treat API paths, field names, status values, and error codes in `contracts/` as stable.
- Add tests for every acceptance rule in the relevant module document.
- If a requirement is ambiguous, choose the smallest behavior consistent with this architecture and document the assumption in the pull request.
- If a requested change conflicts with this architecture, report the conflict before making broad changes.
