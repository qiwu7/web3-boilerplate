const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); // class constructor
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile_lottery')

let accounts;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({from: accounts[0], gas: "1000000"})
});

describe("Lottery", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });
});
