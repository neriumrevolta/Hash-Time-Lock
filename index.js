"use strict";

// We'll need the main client module `Ae` in the `Universal` flavor from the SDK.
const { Universal: Ae } = require("@aeternity/aepp-sdk");
const program = require("commander");
const fs = require("fs");

function exec(infile, fn, args) {
  if (!infile || !fn) {
  	program.outputHelp();
  	process.exit(1);
  }

  const code = fs.readFileSync(infile, "utf-8");

  Ae({
    url: program.host,
    debug: program.debug,
    compilerUrl: program.compilerUrl,
    process
  })
    .then(ae => {
      return ae.contractCompile(code);
    })
    .then(bytecode => {
      console.log(`Obtained bytecode ${bytecode.bytecode}`);
      return bytecode.deploy({ initState: program.init });
    })
    .then(deployed => {
      console.log(`Contract deployed at ${deployed.address}`);
      return deployed.call(fn, { args: args.join(" ") });
    })
    .then(value => {
    	console.log(`Execution result: ${value}`);
    })
    .catch(e => console.log(e.message));
}

program
  .version("0.1.0")
  .arguments("<infile> <function> [args...]")
  .option("-i, --init [state]", "Arguments to contructor function")
  .option(
    "-H, --host [hostname]",
    "Node to connect to",
    "http://localhost:3001"
  )
  .option(
    "-C, --compilerUrl [compilerUrl]",
    "Compiler to connect to",
    "http://localhost:3080"
  )
  .option("--debug", "Switch on debugging")
  .action(exec)
  .parse(process.argv);

exec("./contracts/HashTimeLock.aes", "dummy_func", "2");
