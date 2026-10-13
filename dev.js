const { spawn } = require("node:child_process");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const services = [
  { name: "server", cwd: "server" },
  { name: "client", cwd: "client" },
];

const children = services.map(({ name, cwd }) => {
  const env = name === "client" ? { ...process.env, HOST: "127.0.0.1" } : process.env;
  const child = spawn(npm, ["start"], { cwd, stdio: "inherit", shell: false, env });
  child.on("error", (error) => {
    console.error(`[${name}] ${error.message}`);
    shutdown(1);
  });
  child.on("exit", (code) => {
    if (!stopping && code !== 0) shutdown(code || 1);
  });
  return child;
});

let stopping = false;
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exitCode = code;
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
