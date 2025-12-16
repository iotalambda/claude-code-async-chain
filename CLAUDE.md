# Condition pattern matching

## Discard pattern
"{*}" can be used for discards. E.g.:
```md
_if_ _instructed_ like "_ask_{*}", _then_ {some task}.
```
is the same as
```md
_if_ _instructed_ with an instruction that starts with the _ask_ keyword, _then_ {some task}.
```

## Variable pattern
"{some variable name}" can be used for variables. E.g.:
```md
_if_ user name is like "{first} {last}", _then_ _terminate_ "Hi, {first} {last}!".
```

# Keywords

## ask
_if_ _instructed_ like:
```md
_ask_ "{some question}"
```
, _then_ _follow_:
1) Create a file `$PWD/question.md` with content like:
    ```md
    Q: {some question}
    A:
    ```
2) _terminate_ "SGN_PENDING"

## follow
_if_ _instructed_ like:
```md
_follow_:
1) some task
2) some other task
...
```
, _then_ you should perform the tasks in the list one-by-one w/o parallelization.

## if..then, elif...then, else
The _if_, _then_, _elif_ and _else_ keywords are used for typical conditional logic. E.g.
```md
_if_ {1st condition}, _then_ do this if {1st condition} is true.
_elif_ {2nd condition}, _then_ _follow_:
1) perform these steps if
2) {2nd condition} is true.
_else_ otherwise do this.
```

## instructed
A condition short-hand for "you're instructed". E.g.:
```md
_if_ _instructed_ like "do your homework", _then_ do them.
```
is the same as
```md
_if_ you're instructed like "do your homework", _then_ do them.
```

## instructedpreviously
A condition short-hand for "you were before your session's first termination instructed".

```md
_if_ _instructedpreviously_ like "do your homework", _then_ check if I did them.
```
is the same as
```md
_if_ you were before your session's first termination instructed like "do your homework", _then_ check if I did them.
```

This assumes that your session has been terminated and resumed at least once.

## remember
_if_ _instructed_ like:
```md
_remember_ {some fact}
```
, _then_ you should remember {some fact} and it should not get lost when your conversation is compacted.

## repliedpreviously
_if_ _instructed_ like:
```md
_if_ _repliedpreviously_ (like "{prev reply}" AND not like "SGN_PENDING{*}"), _then_ _terminate_ "{prev reply}"
```
, _then_:
    - _if_ you replied previously to your caller with a msg that did not start with "SGN_PENDING", _then_ _terminate_ using that same previous reply as a msg again.

This assumes that your session has been terminated and resumed at least once.

## subreplied
_if_ _instructed_ like:
```md
_if_ _subreplied_ like "{sub-agent's reply msg}", _then_ {some task}.
```
, _then_:
    - _if_ a sub-agent you just spawned replied to you with a message like "{sub-agent's reply msg}", _then_ perform {some task}.

## subrepliedpreviously
_if_ _instructed_ like:
```md
_if_ _subrepliedpreviously_ like "{msg that a sub-agent replied previously}", _then_ {some task}.
```
, _then_:
    - _if_ right before your session's first termination _subreplied_ like "{msg that a sub-agent replied previously}", _then_ perform {some task}.

This assumes that your session has been terminated and resumed at least once.

## resumed
_if_ _instructed_ like:
```md
_if_ _resumed_ like "{caller's msg}", _then_ {some task}.
```
, _then_:
    - _if_ your caller resumed your previously terminated session with a message like "{caller's msg}", _then_ you should perform {some task}.

This assumes that your session has been terminated and resumed at least once.

## run
_if_ _instructed_ like:
```md
_run_ `{some command}`
```
, _then_ you should run command `{some command}` using the Bash tool.

## spawn
_if_ _instructed_ like:
```md
_spawn_ `{file name}.md`
```
, _then_ _run_ `$PWD/agent-cli spawn $PWD/{file name}.md`.

## terminate
_if_ _instructed_ like:
```md
_terminate_ "{some msg|SGN_SOME_SIGNAL}"
``` 
, _then_ you should stop **immediately** whatever you're doing, don't proceed any further in your instructions, but instead reply to your caller **exactly** with a message like "{some msg|SGN_SOME_SIGNAL}" (besides variable pattern matching or instructions between the curly braces, don't add anything extra to the message) and terminate your session.


# Standard Operating Procedure (SOP)

## _if_ _subreplied_ like "SGN_PENDING ({identifier})", _then_:
_follow_:
1) _remember_ sub-agent's session id is "{identifier}".
2) _terminate_ "SGN_PENDING".

## _if_ _resumed_ like "SGN_RESUME", _then_:
- _if_ _repliedpreviously_ (like "{prev}" AND not like "SGN_PENDING{*}"), _then_:
    - _terminate_ "{prev}".
- _elif_ _subrepliedpreviously_ like "SGN_PENDING ({identifier})", _then_:
    - _run_ `$PWD/agent-cli resume {identifier}`.
- _elif_ _instructedpreviously_ like "_ask_{*}", _then_:
    - _if_ the question file now contains an answer ("{answer}"), _then_:    
        - _terminate_ "{answer}".
    - _else_:
        - _terminate_ "SGN_PENDING".
- _else_:
    - _terminate_ "SGN_UNHANDLED".
