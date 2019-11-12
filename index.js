const fs = require("fs");
const Universal = require("@aeternity/aepp-sdk").Universal;

const main = async () => {
    const client = await Universal({
        url: 'https://sdk-testnet.aepps.com/',
        internalUrl: 'https://sdk-testnet.aepps.com/',
        compilerUrl: 'https://compiler.aepps.com',
        keypair: {
            secretKey: 'fb65e4673da53618d7ef4d28d8a2b06f1bf52f979ac1a1e9cc47e90713c751356635f86662a34aa89f95eeddada748b3cb930634e8122f0b01997aea9d63d893',
            publicKey: 'ak_n1qctXxqgrWw46kBuTKSVDSCPixxomX5tWh42wFCspBUwcDJ8'
        }
    });

    let contractSource = fs.readFileSync('./contracts/HashTimeLock.aes', 'utf-8');
    const contract = await client.getContractInstance(contractSource);
    await contract.deploy();

    const result = await contract.methods.dummy_func(2);
    console.log(result)
};

main();