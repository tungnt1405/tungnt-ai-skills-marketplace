---
name: api-design
description: Use only after using-tungnt-ai-skills has selected a process workflow, as a supporting domain lens inside brainstorming, planning, execution, or review
---

# API Design

## Overview

Design the contract before implementation. A good API is resource-oriented, predictable, retryable, diagnosable, and stable over time; every observable behavior can become a customer dependency.

Use stricter local API standards first.

## When to Use

- Creating or changing REST/HTTP endpoints or public service contracts.
- Defining request, response, error, pagination, filtering, sorting, or SDK-facing schemas.
- Planning versioning, deprecation, idempotency, retries, long-running operations, or compatibility.
- Reviewing an API for breaking changes or inconsistent behavior.

Do not use for private helpers unless they cross a team, package, process, or deployment boundary.

## Domain Workflow Trigger

This is a domain skill for API contract design. It supplies API design judgment inside the selected process workflow; it does not choose or replace `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, or review skills.

Invoke this skill during a workflow only when the work involves designing, creating, updating, or reviewing REST/HTTP API contracts:

- During `brainstorming`, use it when the user asks to create or change an API, endpoint, request schema, response schema, error semantics, pagination, filtering, sorting, versioning, idempotency, retry behavior, or compatibility behavior.
- During `writing-plans`, use it when an approved spec includes API contract behavior that must become TDD tasks and failing tests.
- During execution, use it as a constraint when a plan task implements or changes API contract behavior; if implementation reveals a contract gap, stop and revise the spec or plan instead of inventing behavior in code.
- During review, use it as an API lens when the diff changes endpoints, schemas, errors, pagination, retries, idempotency, versioning, validation, or compatibility.

Do not invoke this skill for generic backend logic, private helpers, database-only changes, UI-only work, or implementation tasks that do not expose or change an API contract.

## TDD Trigger Coverage

These are the RED scenarios this skill must prevent:

| Trigger | Baseline failure | Skill counter |
| --- | --- | --- |
| "Just add a simple CRUD API quickly" | Verb URLs, handler-first design, no pagination | Contract-first resources, method semantics, list rules |
| "Ship now, document errors later" | Raw exceptions or mixed error shapes | One structured error shape and stable machine codes |
| "We can change this field; only our app uses it" | Breaking field/type/requiredness changes | Additive evolution and compatibility review |
| "POST is fine; clients can retry manually" | Duplicate side effects on retries | Idempotency/repeatability requirement |
| "Third-party API already validates this" | Untrusted external data enters logic | Boundary validation for all external input |

## Core Pattern

| Concern | Rule |
| --- | --- |
| Resources | Use clear plural nouns and readable URLs; avoid verb paths like `/createTask`. |
| Contract | Define typed request, response, and error schemas before handlers. |
| Methods | `GET` reads, `PATCH` partially updates, `PUT` replaces, `POST` creates service-named resources or actions, `DELETE` removes. |
| Retries | Make all operations retry-safe; use repeatability keys or equivalent for risky `POST` operations. |
| Lists | Add pagination from v1. Filtering and sorting must compose with every page and `nextLink`. |
| Validation | Validate path params, query params, headers, JSON bodies, and third-party responses at the boundary. |
| Errors | Return one structured shape everywhere. Top-level machine-readable error codes are contract. |
| Evolution | Add optional fields or extensible enum values; do not remove fields, change meaning/type, or make optional data required. |
| Concurrency | Use ETag/If-Match or equivalent version checks when updates can conflict. |
| Async work | Return `202 Accepted` with a status monitor URL; the monitor supports `GET`, status, and `retry-after` while incomplete. |

## Example

```http
GET /tasks?pageSize=50&continuationToken=abc&filter=status eq 'open'&orderby=createdAt desc
200 OK
{
  "value": [{ "id": "task_123", "title": "Review contract", "status": "open", "etag": "\"67ab43\"" }],
  "nextLink": "/tasks?pageSize=50&continuationToken=def&filter=status eq 'open'&orderby=createdAt desc"
}

PATCH /tasks/task_123
If-Match: "67ab43"
Content-Type: application/merge-patch+json
{ "title": "Review API contract" }

400 Bad Request
x-ms-error-code: InvalidTaskTitle
{ "error": { "code": "InvalidTaskTitle", "message": "Task title must be 1-120 characters.", "target": "title" } }
```

Why this works: the list is bounded, filters and sort order survive into `nextLink`, IDs are opaque strings, `PATCH` is partial, concurrency is explicit, and clients branch on stable error codes instead of parsing text.

## Compatibility Review

Before shipping, answer:

- What observable behavior might clients already depend on?
- Can existing clients adopt the new service or SDK version without code changes?
- Are new fields optional and safe for old clients to ignore?
- Are enum-like strings extensible, or will unknown values break generated clients?
- Is every retry path safe from duplicate side effects?

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Starting from handler code | Write the endpoint contract first. |
| Returning raw exceptions | Map to the shared error shape and stable codes. |
| Using `POST` because it is convenient | Use resource semantics; make `POST` repeatable when needed. |
| Adding required fields after v1 | Add optional fields, defaults, or a new operation. |

## Red Flags

- Verb-first URLs, inconsistent path casing, or unclear resource names.
- List endpoints without pagination.
- Different success or error shapes across endpoints.
- External input or third-party responses used without validation.
- Removed fields, reinterpreted fields, narrowed enum values, or new required data.
- No idempotency, versioning, deprecation, or migration plan.

## Source Notes

Based on Microsoft REST API Guidelines, especially the current Azure REST API Guidelines and Considerations for Service Design, plus Addy Osmani's `api-and-interface-design` skill.
