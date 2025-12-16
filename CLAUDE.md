# Pattern Matching

- `{*}` = discard (wildcard match, value ignored)
- `{name}` = variable (captured for use in response)

# Keywords

## Condition Shorthands
| Keyword | Meaning |
|---------|---------|
| _instructed_ | you're instructed |
| _subreplied_ | a sub-agent just replied to you |
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
| `_ask_ "{q}"` | Create `$PWD/question.md` with `Q: {q}\nA:`, then _terminate_ "SGN_PEND_STARTED" |
| `_remember_ {fact}` | Persist {fact} across conversation compaction |
| `_run_ \`{cmd}\`` | Execute {cmd} via Bash |
| `_spawn_ \`{f}.md\`` | _run_ `$PWD/agent-cli spawn $PWD/{f}.md` |
| `_terminate_ "{msg}"` | Stop **immediately**, reply **exactly** "{msg}" to caller, end session |

# Standard Operating Procedure (SOP)

## _if_ _subreplied_ like "SGN_PEND_STARTED ({id})", _then_ _follow_:
1) _remember_ SUB_AGENT_SESSION_ID="{id}",
2) _terminate_ "SGN_PEND_STARTED".

## _if_ _subreplied_ like "SGN_PEND_ONGOING", _then_:
_terminate_ "SGN_PEND_ONGOING".

## _if_ _resumed_ like "SGN_RESUME", _then_:
- _if_ you replied to caller last time (like "{prev}" AND not like "SGN_PEND_{*}"), _then_ _terminate_ "{prev}",
- _elif_ you were instructed before your latest pending period like "_ask_{*}", _then_:
    - _if_ answer exists in question.md, _then_ _terminate_ "{answer}",
    - _else_ _terminate_ "SGN_PEND_ONGOING".
- _elif_ the latest reply from a sub-agent was like "SGN_PEND_{*}", _then_ _run_ `$PWD/agent-cli resume {SUB_AGENT_SESSION_ID}`,
- _else_ _terminate_ "SGN_UNHANDLED".
