const { Universal: Ae } = require('@aeternity/aepp-sdk');
const program = require('commander');
const fs = require('fs');

function exec(infile, fn, args) {
	// if (!infile || !fn) {
	// 	program.outputHelp();
	// 	process.exit(1);
	// }

	const code = fs.readFileSync(infile, 'utf-8');

	Ae({ url: program.host, debug: program.debug, process })
		.then(ae => {
			return ae.contractCompile(code);
		})
		.then(bytecode => {
			console.log(`Obtained bytecode ${bytecode.bytecode}`);
			return bytecode.deploy({ initState: program.init });
		})
		.then(deployed => {
			console.log(`Contract deployed at ${deployed.address}`);
			return deployed.call(fn, { args: args.join(' ') });
		})
		.then(value => {
			console.log(`Execution result: ${value}`);
		})
		.catch(e => console.log(e.message));
}

exec("./contracts/HashTimeLock.aes")
