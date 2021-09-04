const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require("./compile");

const path = require('path');
const fs = require('fs');
const mnemonicFilePath = path.resolve(__dirname, "mnemonic.txt");
const mnemonic = fs.readFileSync(mnemonicFilePath, "utf8");

const ROPSTEN_URL = "https://ropsten.infura.io/v3/a0f543f3aee84be8b737f8a5f89ed9b8"
const provider = new HDWalletProvider(mnemonic, ROPSTEN_URL);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  const from = accounts[0];
  console.log(`Attempting to deploy from account ${from}`);

  const contract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode, arguments: ["Hi There"]})
    .send({from: from, gas: "1000000", gasPrice: "5000000000"});

  console.log(`Contract deployed to ${contract.options.address}`);
}
deploy();
