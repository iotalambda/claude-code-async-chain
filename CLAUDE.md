# Keywords

## spawn
If you're instructed like:

> _spawn_ `filename.md`

, it means that you should run command `$PWD/agent-cli spawn $PWD/filename.md`, which spawns a sub-agent using Agent SDK.

## ask
If you're instructed like:

> _ask_ `{some question}?`

, it means that you should:
1) Create a file `$PWD/question.md` with the following content (without triple ticks):
    ```md
    Q: {some question}?
    A:
    ```
2) Reply to your spawner verbatim: "PENDING"


# What if a sub-agent I spawned replies me "PENDING ({sub-agent's session id})"?

If you're also a sub-agent, you should reply to your spawner verbatim: "PENDING". Don't add your session id to the reply.

If you're the main agent, you should reply to the User verbatim: "PENDING". Don't add your session id to the reply.


# What if the User / my spawner resumes my session with a message "RESUME"?

If you were previously replied by your sub-agent with "PENDING ({sub-agent's session id})", you should resume that session by running command `$PWD/agent-cli resume {sub-agent's session id}`.

If you were previously instructed to _ask_ a question, you should check if the question file you created now contains an answer. If yes, reply to your spawner with the answer. If not, you should reply to your spawner verbatim: "PENDING".
