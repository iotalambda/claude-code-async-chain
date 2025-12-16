#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

const PENDING_STARTED = "SGN_PENDING_STARTED";
const STILL_PENDING = "SGN_STILL_PENDING";
const RESUME_PROMPT = "SGN_RESUME";
const LOG_FILE = path.join(process.cwd(), "agent-cli.log");

function log(message: string): void {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

interface AgentResult {
  output: string;
  sessionId: string;
}

interface RunOptions {
  fork?: boolean;
}

async function runAgent(
  prompt: string,
  sessionId?: string,
  options: RunOptions = {}
): Promise<AgentResult> {
  const { fork = false } = options;
  log(`Running agent: prompt="${prompt}", sessionId=${sessionId ?? "new"}, fork=${fork}`);

  const response = query({
    prompt,
    options: {
      model: "claude-opus-4-5-20251101",
      cwd: process.cwd(),
      resume: sessionId,
      forkSession: fork,
      permissionMode: "bypassPermissions",
      settingSources: ["project"],
    },
  });

  let result = "";
  let newSessionId = sessionId ?? "";

  for await (const message of response) {
    log(
      `Message: type=${message.type}, subtype=${
        (message as SDKMessage & { subtype?: string }).subtype
      }`
    );

    if (message.type === "result") {
      if (message.subtype === "success") {
        result = message.result;
        newSessionId = message.session_id ?? newSessionId;
        log(`Success: result="${result}", sessionId=${newSessionId}`);
      } else {
        const errors =
          (message as SDKMessage & { errors?: string[] }).errors?.join(", ") ??
          "unknown";
        throw new Error(`Agent failed: ${errors}`);
      }
    }
  }

  return { output: result, sessionId: newSessionId };
}

function formatOutput(output: string, sessionId: string): string {
  // SGN_STILL_PENDING: pass through as-is, no session ID attached
  // This allows the caller to keep using the original (non-forked) session ID
  if (output.includes(STILL_PENDING)) {
    return STILL_PENDING;
  }
  // SGN_PENDING_STARTED: attach session ID (forked or original)
  // This establishes a new checkpoint
  if (output.includes(PENDING_STARTED) && sessionId) {
    return `${PENDING_STARTED} (${sessionId})`;
  }
  return output;
}

async function spawn(instructionFile: string): Promise<void> {
  const filePath = path.resolve(instructionFile);
  log(`=== SPAWN: ${filePath} ===`);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const prompt = `Read ${filePath} and follow its instructions.`;
  const { output, sessionId } = await runAgent(prompt);
  console.log(formatOutput(output, sessionId));
}

async function resume(sessionId: string): Promise<void> {
  log(`=== RESUME (fork): ${sessionId} ===`);

  // Always fork when resuming - this creates a disposable session
  // If still pending, the fork is orphaned and original session ID preserved
  // If progress is made, the forked session becomes the new checkpoint
  const { output, sessionId: forkedSessionId } = await runAgent(
    RESUME_PROMPT,
    sessionId,
    { fork: true }
  );
  console.log(formatOutput(output, forkedSessionId));
}

function printUsage(): void {
  console.log(`Usage:
  agent-cli spawn <file>            Spawn agent with instructions from file
  agent-cli resume <session-id>     Resume a pending session`);
}

async function main(): Promise<void> {
  const [command, arg] = process.argv.slice(2);
  log(`Started: ${process.argv.join(" ")}`);

  if (!command) {
    printUsage();
    process.exit(1);
  }

  switch (command) {
    case "spawn":
      if (!arg) {
        console.error("Error: Missing instruction file");
        process.exit(1);
      }
      await spawn(arg);
      break;

    case "resume":
      if (!arg) {
        console.error("Error: Missing session ID");
        process.exit(1);
      }
      await resume(arg);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  log(`Fatal: ${err.message}`);
  console.error("Error:", err);
  process.exit(1);
});
