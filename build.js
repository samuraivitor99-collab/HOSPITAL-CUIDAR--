// Gera index.html: compila src/app.ts e injeta o JavaScript em src/template.html.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const tsc = path.join(dir, "node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc");

execFileSync(tsc, ["--project", dir], { stdio: "inherit" });

const js = fs.readFileSync(path.join(dir, "build", "app.js"), "utf8");
if (js.includes("</script>")) throw new Error("O JavaScript gerado fecha a tag script.");

const html = fs.readFileSync(path.join(dir, "src", "template.html"), "utf8").replace("/*APP*/", () => js);
fs.writeFileSync(path.join(dir, "index.html"), html);
console.log("index.html gerado com " + html.length + " caracteres.");
