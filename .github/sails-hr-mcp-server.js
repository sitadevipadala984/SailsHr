#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { execSync, spawn } from "child_process";
import https from "https";
import { readFileSync } from "fs";
import path from "path";

class SailsHrAutomationServer {
  constructor() {
    this.server = new Server(
      {
        name: "sails-hr-automation-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create_feature_branch",
            description: "Create a new feature branch with proper naming convention",
            inputSchema: {
              type: "object",
              properties: {
                ticketId: { type: "string", description: "Ticket ID (e.g., TICKET-123)" },
                description: { type: "string", description: "Short description for branch name" },
                type: { type: "string", enum: ["feature", "bugfix", "refactor"], default: "feature" }
              },
              required: ["ticketId", "description"]
            }
          },
          {
            name: "implement_ticket",
            description: "Implement code changes for a ticket",
            inputSchema: {
              type: "object",
              properties: {
                ticketDescription: { type: "string", description: "Full ticket description" },
                files: { type: "array", items: { type: "string" }, description: "Files to modify" }
              },
              required: ["ticketDescription"]
            }
          },
          {
            name: "run_lint_and_build",
            description: "Run linting and build verification",
            inputSchema: {
              type: "object",
              properties: {
                packagePath: { type: "string", default: "apps/frontend" }
              }
            }
          },
          {
            name: "commit_changes",
            description: "Commit changes with conventional commit format",
            inputSchema: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["feat", "fix", "refactor", "chore"] },
                scope: { type: "string" },
                description: { type: "string" },
                ticketId: { type: "string" }
              },
              required: ["type", "description", "ticketId"]
            }
          },
          {
            name: "push_branch",
            description: "Push feature branch to remote",
            inputSchema: {
              type: "object",
              properties: {
                branchName: { type: "string" }
              },
              required: ["branchName"]
            }
          },
          {
            name: "create_pull_request",
            description: "Create a pull request on GitHub",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string" },
                body: { type: "string" },
                head: { type: "string" },
                base: { type: "string", default: "main" },
                owner: { type: "string", default: "sitadevipadala984" },
                repo: { type: "string", default: "SailsHr" }
              },
              required: ["title", "body", "head"]
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "create_feature_branch":
            return await this.createFeatureBranch(args);
          case "implement_ticket":
            return await this.implementTicket(args);
          case "run_lint_and_build":
            return await this.runLintAndBuild(args);
          case "commit_changes":
            return await this.commitChanges(args);
          case "push_branch":
            return await this.pushBranch(args);
          case "create_pull_request":
            return await this.createPullRequest(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true
        };
      }
    });
  }

  async createFeatureBranch(args) {
    const { ticketId, description, type = "feature" } = args;
    const branchName = `${type}/${ticketId}-${description.toLowerCase().replace(/\s+/g, '-')}`;

    try {
      // Create and switch to new branch
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });

      return {
        content: [{ type: "text", text: `✅ Created and switched to branch: ${branchName}` }]
      };
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  async implementTicket(args) {
    // This would be handled by Copilot's code generation
    // For now, just acknowledge
    return {
      content: [{ type: "text", text: "✅ Ticket implementation ready. Copilot will modify the necessary files." }]
    };
  }

  async runLintAndBuild(args) {
    const { packagePath = "apps/frontend" } = args;

    try {
      // Run lint
      execSync(`cd ${packagePath} && npm run lint`, { stdio: 'inherit' });

      // Run build
      execSync(`cd ${packagePath} && npm run build`, { stdio: 'inherit' });

      return {
        content: [{ type: "text", text: "✅ Lint and build passed successfully" }]
      };
    } catch (error) {
      throw new Error(`Lint/build failed: ${error.message}`);
    }
  }

  async commitChanges(args) {
    const { type, scope, description, ticketId } = args;
    const commitMessage = scope
      ? `${type}(${scope}): ${description}\n\nCloses ${ticketId}`
      : `${type}: ${description}\n\nCloses ${ticketId}`;

    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

      return {
        content: [{ type: "text", text: `✅ Committed changes: ${commitMessage.split('\n')[0]}` }]
      };
    } catch (error) {
      throw new Error(`Failed to commit: ${error.message}`);
    }
  }

  async pushBranch(args) {
    const { branchName } = args;

    try {
      execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });

      return {
        content: [{ type: "text", text: `✅ Pushed branch ${branchName} to remote` }]
      };
    } catch (error) {
      throw new Error(`Failed to push branch: ${error.message}`);
    }
  }

  async createPullRequest(args) {
    const { title, body, head, base = "main", owner = "sitadevipadala984", repo = "SailsHr" } = args;
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable not set");
    }

    const prData = {
      title,
      body,
      head,
      base,
      draft: false
    };

    return new Promise((resolve, reject) => {
      const options = {
        hostname: "api.github.com",
        port: 443,
        path: `/repos/${owner}/${repo}/pulls`,
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "SailsHr-MCP-Server",
          "X-GitHub-Api-Version": "2022-11-28",
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        }
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({
                content: [{
                  type: "text",
                  text: `✅ Pull Request Created!\n📋 PR #${response.number}\n🔗 ${response.html_url}\n📝 ${response.title}`
                }]
              });
            } else {
              reject(new Error(`GitHub API error (${res.statusCode}): ${response.message || data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse GitHub response: ${error.message}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.write(JSON.stringify(prData));
      req.end();
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("SailsHr Automation MCP Server started");
  }
}

// Start the server
const server = new SailsHrAutomationServer();
server.start().catch(console.error);
