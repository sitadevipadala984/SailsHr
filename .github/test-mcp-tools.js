// test-mcp-tools.js
const message = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {}
};

console.log(JSON.stringify(message));