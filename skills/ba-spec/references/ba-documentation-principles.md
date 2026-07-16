# BA Documentation Principles

Apply these Business Analyst practices when producing a feature spec.

## 1. Requirement classification

Separate the following:

| Type | Meaning | Example |
|---|---|---|
| Business goal | Why the feature exists | Reduce the time needed to process requests. |
| Stakeholder requirement | What stakeholder needs | The approver needs to verify the request details before approval. |
| Functional requirement | What the system shall do | The system must allow the requester to create a request. |
| Business rule | Constraint or decision logic | A request may move to the approval step only after all required reviews have been completed. |
| Data requirement | Business data needed | ID number, full name, document type, attached file. |
| Validation rule | Input/action constraint | A rejection reason is required when rejecting. |
| Permission rule | Who can do what | The approver may approve the request for processing. |
| NFR | Quality expectation at BA level | Approval actions must produce an audit log. |
| Transition/change requirement | Needed for upgrade/migration | Existing request data must retain its current state. |

## 2. Elicitation discipline

When input is incomplete:

- Ask only blocking questions first.
- Do not ask more than 10 questions in one turn.
- If the user asks for best-effort output, proceed and mark gaps.

## 3. Workflow modelling

For every workflow, capture:

- Trigger.
- Actor.
- User action.
- System response.
- Resulting state.
- Alternative flow.
- Exception/error flow.

## 4. Business rule modelling

A business rule must be:

- Atomic.
- Testable.
- Source-tagged.
- Not mixed with implementation.

Example:

```text
BR-001: A request may move to the approval step only after all required reviews have been completed. [INFERRED]
```

If this is not explicitly provided, add an open question.

## 5. State modelling

Define:

- State name.
- Meaning.
- Entry trigger.
- Exit trigger.
- Actor.
- Terminal or not.

Never invent state names as confirmed facts. If state names are inferred, tag them `[INFERRED]` or `[ASSUMPTION]`.

## 6. Acceptance criteria

Acceptance criteria must be testable.

Use checklist for simple requirements.
Use Gherkin for decision-heavy flows:

```gherkin
Scenario: Approver approves a request
  Given the request has been saved by the requester with all required fields completed
  When the approver chooses to approve the request
  Then the system moves the request to the processing step
```

## 7. Traceability

Map each important source/goal to requirements, business rules, acceptance criteria, and QA focus.

Do not leave high-priority requirements untraced.

## 8. UI elements: catalog selects, never guess buttons

When documenting UI from screenshots or descriptions:

- **Select / dropdown:** record the visible option catalog (the list of values). If the full catalog is not visible, write down what is seen and raise a `UIQ-###` asking for the complete catalog. Do not fabricate options.
- **Buttons / icons / controls with unclear purpose:** do not infer behavior. List them as `UIQ-###` UI open questions and ask.
- Collect all `UIQ-###` items into a dedicated "UI Open Questions" section (separate from business `Q-###`), each with the screen, the element, what is seen, and what must be clarified.

Guessing a select catalog or a button's action is a defect. When unsure, ask via `UIQ-###`.
