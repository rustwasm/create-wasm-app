#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");

let folderName = '.';

if (process.argv.length >= 3) {
  folderName = process.argv[2];
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
}

const clone = spawn("git", ["clone", "https://github.com/rustwasm/create-wasm-app.git", folderName]);

let errorMessage = '';
clone.stderr.on('data',data=>{
    errorMessage+=data;
});

clone.on("close", code => {
  if (code !== 0) {
    console.error("cloning the template failed!");
    errorMessage = errorMessage.replace('\n','\n    ');
    console.log(`git output:\n    ${errorMessage}`)
    process.exit(code);
  } else {
    console.log("🦀 Rust + 🕸 Wasm = ❤");
  }
});
