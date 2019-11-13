const fs = require("fs");
const Universal = require("@aeternity/aepp-sdk").Universal;

const main = async () => {
  const client = await Universal({
    url: "https://sdk-testnet.aepps.com/",
    internalUrl: "https://sdk-testnet.aepps.com/",
    compilerUrl: "https://compiler.aepps.com",
    keypair: {
      secretKey:
        "fb65e4673da53618d7ef4d28d8a2b06f1bf52f979ac1a1e9cc47e90713c751356635f86662a34aa89f95eeddada748b3cb930634e8122f0b01997aea9d63d893",
      publicKey: "ak_n1qctXxqgrWw46kBuTKSVDSCPixxomX5tWh42wFCspBUwcDJ8"
    }
  });

  let contractSource = fs.readFileSync("./contracts/HashTimeLock.aes", "utf-8");
  const contract = await client.getContractInstance(contractSource);
  await contract.deploy();

//   const result = await contract.call(
//     "dummy_func",
//     [
//       "000102030405060708090a0b0c0d0e0f000102030405060708090a0b0c0d0e0f",
//       "000202030405060708090a0b0c0d0e0f000102030405060708090a0b0c0d0e0f"
//     ],
//     { amount: 1000000 }
//   );
//   console.log(result.decodedResult);

    const result = await contract.call(
      "new_contract",
      [
        "5939679548",
        "1773653015196",
        "000102030405060708090a0b0c0d0e0f000102030405060708090a0b0c0d0e0f",
        "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU",
        "TRX",
        "0x9cc7a534cf742cdb9ee16fbf6b5f48a09e485c52"
      ],
      { amount: 1000000 }
    );
    console.log(result.decodedResult);
};

main();
