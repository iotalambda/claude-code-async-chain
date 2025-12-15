# claude-code-async-chain

An example of agent chaining with asynchronous human interaction using the Claude Agent SDK.

Agents can spawn sub-agents and wait for their results. When an agent needs external input (like a human answer), it returns `PENDING` with a session ID. The entire chain pauses and can be resumed later.

## Flow

```
agent-cli spawn ins1-a.md
    → Agent 1 spawns Agent 2
        → Agent 2 spawns Agent 3
            → Agent 3 spawns Agent 4
                → Agent 4 asks "When is your birthday?"
                ← PENDING (session-4)
            ← PENDING (session-3)
        ← PENDING (session-2)
    ← PENDING (session-1)

[Human answers asynchronously in question.md]

agent-cli resume session-1
    → RESUME → Agent 1 runs: agent-cli resume session-2
        → RESUME → Agent 2 runs: agent-cli resume session-3
            → RESUME → Agent 3 runs: agent-cli resume session-4
                → RESUME → Agent 4 reads answer
                ← "January 1st"
            ← "January 1st"
        ← "January 1st"
    ← "January 1st"
```
