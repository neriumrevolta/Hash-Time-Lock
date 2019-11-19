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

	waitMined(contract.deployInfo.transaction);

	//New contract
	async function callNewContract(args) {
		const newContract = await contract.call('new_contract', args, { amount: 1000000 });
		let res = newContract.decodedResult;
		console.log('...\nContract created! Info:\n', res.id);
	}

	//Get one status
	const callGetOneStatus = async args => {
		const getOneStatus = await contract.call('get_one_status', args);
		const res = getOneStatus.decodedResult;
		const statusArr = Object.keys(res);
		console.log('...\nContract status:', statusArr[0]);
	};

	//Get many status
	const callGetManyStatus = async args => {
		const getManyStatus = await contract.call('get_many_status', args);
		const res = getManyStatus.decodedResult;
		const statusArr = Object.values(res);
		console.log('chep ', statusArr[0]);
		console.log('...\nStatuses of all contracts:', formatGetManyStatus(statusArr));
	};

	const formatGetManyStatus = (arr) => {
		const res = arr.map(obj => Object.keys(obj)[0])
		return res.join(", ")
	}

	//Withdraw
	const callWithdraw = async args => {
		const withdraw = await contract.call('withdraw', args);
		const res = withdraw.decodedResult;
		console.log('...\nWithdrawing! Should return true if successful:', res);
	};

	//Refund
	const callRefund = async args => {
		const refund = await contract.call('refund', args);
		const res = refund.decodedResult;
		console.log('...\nRefunding! Should return true if successful:', res);
	};

	//TESTS
	//Mock arguments for each contract function
	let newContractArgs = {
		outputAmount: '5939679548',
		expiration: '1773653015196',
		hashLock: 'c506a97bdc819655ec213f698f2b6f86d53ede567f661ab4a077b1c95a17812b',
		receiver: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
		outputNetwork: 'TRX',
		outputAddress: '0x9cc7a534cf742cdb9ee16fbf6b5f48a09e485c52',
	};

	//contract is only for testing get_many_status, so hash_lock is absolutely random and withdraw wont work
	let newContractArgs2 = {
		outputAmount: '6939679548',
		expiration: '1873653015196',
		hashLock: 'c506a97bdc819655ec213f698f2b6f86d53ede567f661ab4a077b1c95a17812b',
		receiver: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
		outputNetwork: 'TRX',
		outputAddress: '0x9cc7a534cf742cdb9ee16fbf6b5f48a09e485c52',
	};

	let getOneStatusArgs = {
		id: '894b990456d1565816ee3e8d1f457d99bc6f5933801c56d989664e11b0ff7d48',
	};

	let getManyStatusArgs = {
		ids: [
			'894b990456d1565816ee3e8d1f457d99bc6f5933801c56d989664e11b0ff7d48',
			'bdaa3fb216fce4dcab71a6983b9e860436a488b1157e1de8712296e0d2daea0e',
		],
	};

	let withdrawArgs = {
		id: '894b990456d1565816ee3e8d1f457d99bc6f5933801c56d989664e11b0ff7d48',
		secret: '788c65827e4832ce029305ca90984a32f1daa1c7dcb50041d4762b7b22ed247d',
	};

	let refundArgs = {
		id: '894b990456d1565816ee3e8d1f457d99bc6f5933801c56d989664e11b0ff7d48',
	};

	//Testing all functions consecutively
	async function call() {
		//just a new contract

		// await callNewContract(Object.values(newContractArgs));
		// await callGetOneStatus(Object.values(getOneStatusArgs))

		//example withdraw workflow (+ testing get_many_status)

		await callNewContract(Object.values(newContractArgs));
		await callNewContract(Object.values(newContractArgs2));
		await callGetOneStatus(Object.values(getOneStatusArgs));
		await callWithdraw(Object.values(withdrawArgs));
		await callGetManyStatus(Object.values(getManyStatusArgs));

		// example refund workflow (NB: By default will give ERROR here because
		// new contract expiration time is not yet reached, works fine with adequate values)

		// await callNewContract(Object.values(newContractArgs));
		// await callGetOneStatus(Object.values(getOneStatusArgs));
		// await callRefund(Object.values(refundArgs));
		// await callGetOneStatus(Object.values(getOneStatusArgs));
	}

	call();
};
main();
