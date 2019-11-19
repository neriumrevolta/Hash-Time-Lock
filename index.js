const fs = require('fs');
const Universal = require('@aeternity/aepp-sdk').Universal;

const main = async () => {
	const client = await Universal({
		url: 'https://sdk-testnet.aepps.com/',
		internalUrl: 'https://sdk-testnet.aepps.com/',
		compilerUrl: 'https://compiler.aepps.com',
		keypair: {
			secretKey:
				'fb65e4673da53618d7ef4d28d8a2b06f1bf52f979ac1a1e9cc47e90713c751356635f86662a34aa89f95eeddada748b3cb930634e8122f0b01997aea9d63d893',
			publicKey: 'ak_n1qctXxqgrWw46kBuTKSVDSCPixxomX5tWh42wFCspBUwcDJ8',
		},
	});

	let contractSource = fs.readFileSync('./contracts/HashTimeLock.aes', 'utf-8');
	const contract = await client.getContractInstance(contractSource);
	await contract.deploy();

	async function waitMined(txHash) {
		return new Promise(async resolve => {
			client.poll(txHash).then(async _ => {
				client.getTxInfo(txHash).then(async info => {
					console.log(`\nTransaction ${txHash} mined!\nStatus: ${info.returnType}`);
					resolve();
				});
			});
		});
	}

	await waitMined(contract.deployInfo.transaction);

	//New contract
	async function callNewContract(args) {
		const newContract = await contract.call('new_contract', args, { amount: 1000000 });
		console.log('...\nContract created! Info:\n', newContract.decodedResult);
	}

	//Get one status
	const callGetOneStatus = async args => {
		const getOneStatus = await contract.call('get_one_status', args);
		console.log('...\nContract status:', Object.keys(getOneStatus.decodedResult)[0]);
	};

	//Withdraw
	const callWithdraw = async args => {
		const withdraw = await contract.call('withdraw', args);
		console.log('...\nWithdrawing! Should return true if successful:', withdraw.decodedResult);
	};

	//Mock arguments for each contract function
	let newContractArgs = {
		outputAmount: '5939679548',
		expiration: '1773653015196',
		hashLock: '000102030405060708090a0b0c0d0e0f000102030405060708090a0b0c0d0e0f',
		receiver: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
		outputNetwork: 'TRX',
		outputAddress: '0x9cc7a534cf742cdb9ee16fbf6b5f48a09e485c52',
	};

	let getOneStatusArgs = {
		id: '688c65827e4832ce029305ca90984a32f1daa1c7dcb50041d4762b7b22ed247d',
	};

	let withdrawArgs = {
		id: '688c65827e4832ce029305ca90984a32f1daa1c7dcb50041d4762b7b22ed247d',
		secret: '788c65827e4832ce029305ca90984a32f1daa1c7dcb50041d4762b7b22ed247d',
	};

	//Testing all functions consecutively
	async function call() {
		await callNewContract(Object.values(newContractArgs));
		await callGetOneStatus(Object.values(getOneStatusArgs));
		await callWithdraw(Object.values(withdrawArgs));
		await callGetOneStatus(Object.values(getOneStatusArgs));
	}

	call();
};
main();
