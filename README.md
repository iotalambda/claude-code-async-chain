# claude-code-async-chain

An example of a sub-agent chain spawning convention that supports interweaving asynchronous steps (e.g. human input) within the process.

## How to use

Start the process with `/cmd1-start`, answer the question in `question.md`, and resume the sub-agent chain with `/cmd2-resume`. If you attempt to resume before answering the question, no sub-agent will proceed further.

## Structure

The convention is defined in [CLAUDE.md](CLAUDE.md).

The spawning process and messaging between agents uses `SGN_*` special signal marker words in messages, which are handled by the custom logic in [agent-cli.ts](src/agent-cli.ts).

## Resuming

To be precise, sub-agent sessions are not *resumed* as is, but they are *[forked](https://platform.claude.com/docs/en/agent-sdk/sessions#forking-sessions)* on every `/cmd2-resume` invocation. This way each agent's token budget won't get consumed by signal messages if `/cmd2-resume` is e.g. polled periodically. But the term "resume" is still used in the agent-cli and CLAUDE.md in order not to confuse agents.

## Example flow

```
User                        A                        SA                       SSA                      SSSA
 │                          │                        │                        │                        │
 │ /cmd1-start              │                        │                        │                        │
 ├─────────────────────────>│ spawn ────────────────>│ spawn ────────────────>│ spawn ────────────────>│ creates question.md
 │                          │                        │                        │                        │
 │<── SGN_PEND_STARTED ──│<── SGN_PEND_STARTED │<── SGN_PEND_STARTED │<── SGN_PEND_STARTED │
 │                          │                        │                        │                        │
 │ /cmd2-resume             │                        │                        │                        │
 ├─────────────────────────>│ SGN_RESUME ───────────>│ SGN_RESUME ───────────>│ SGN_RESUME ───────────>│ no answer yet
 │                          │                        │                        │                        │
 │<─── SGN_PEND_ONGOING ───│<─── SGN_PEND_ONGOING ─│<─── SGN_PEND_ONGOING ─│<─── SGN_PEND_ONGOING ─│
 │                          │                        │                        │                        │
 │ writes answer            │                        │                        │                        │
 │                          │                        │                        │                        │
 │ /cmd2-resume             │                        │                        │                        │
 ├─────────────────────────>│ SGN_RESUME ───────────>│ SGN_RESUME ───────────>│ SGN_RESUME ───────────>│ answer found!
 │                          │                        │                        │                        │
 │<─────── "Jan 1st" ───────│<────── "Jan 1st" ──────│<────── "Jan 1st" ──────│<────── "Jan 1st" ──────│
 │                          │                        │                        │                        │
 │ /cmd2-resume             │                        │                        │                        │
 ├─────────────────────────>│ (already completed, returns previous reply)                              │
 │<─────── "Jan 1st" ───────│                        │                        │                        │
 │                          │                        │                        │                        │
```