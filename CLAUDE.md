# Pattern Matching

- `{*}` = discard (wildcard match, value ignored)
- `{name}` = variable (captured for use in response)

# Keywords

## Condition Shorthands
| Keyword | Meaning |
|---------|---------|
| _instructed_ | you're instructed |
| _instructedpreviously_* | you were instructed before your first termination |
| _repliedpreviously_* | you replied to caller before your first termination |
| _subreplied_ | a sub-agent just replied to you |
| _subrepliedpreviously_* | a sub-agent replied before your first termination |
| _resumed_* | caller resumed your terminated session |

\* Assumes your session was terminated and resumed at least once.

## Control Flow
- `_if_ {cond}, _then_ {action}` — conditional
- `_elif_ {cond}, _then_ {action}` — else-if
- `_else_ {action}.` — fallback
- `_follow_: 1) ..., 2) ....` — sequential execution (no parallelization)

## Actions
| Keyword | Action |
|---------|--------|
| `_ask_ "{q}"` | Create `$PWD/question.md` with `Q: {q}\nA:`, then _terminate_ "SGN_PENDING_STARTED" |
| `_remember_ {fact}` | Persist {fact} across conversation compaction |
| `_run_ \`{cmd}\`` | Execute {cmd} via Bash |
| `_spawn_ \`{f}.md\`` | _run_ `$PWD/agent-cli spawn $PWD/{f}.md` |
| `_terminate_ "{msg}"` | Stop **immediately**, reply **exactly** "{msg}" to caller, end session |

# Standard Operating Procedure (SOP)

## _if_ _subreplied_ like "SGN_PENDING_STARTED ({id})", _then_ _follow_:
1) _remember_ SUB_AGENT_SESSION_ID="{id}",
2) _terminate_ "SGN_PENDING_STARTED".

## _if_ _subreplied_ like "SGN_STILL_PENDING", _then_:
_terminate_ "SGN_STILL_PENDING".

## _if_ _resumed_ like "SGN_RESUME", _then_:
- _if_ _repliedpreviously_ (like "{prev}" AND not like "SGN_PENDING_STARTED{*}" AND not like "SGN_STILL_PENDING"), _then_ _terminate_ "{prev}",
- _elif_ _subrepliedpreviously_ (like "SGN_PENDING_STARTED{*}" OR like "SGN_STILL_PENDING"), _then_ _run_ `$PWD/agent-cli resume {SUB_AGENT_SESSION_ID}`,
- _elif_ _instructedpreviously_ like "_ask_{*}", _then_:
    - _if_ answer exists in question.md, _then_ _terminate_ "{answer}",
    - _else_ _terminate_ "SGN_STILL_PENDING".
- _else_ _terminate_ "SGN_UNHANDLED".
