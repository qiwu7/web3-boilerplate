const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); // class constructor
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile_inbox')

let accounts;
let inbox;
const INITIAL_MESSAGE = "Hi There";

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode, arguments: [INITIAL_MESSAGE]})
    .send({from: accounts[0], gas: "1000000"})
});

describe("Inbox", () => {
  it("deploys a contract", () => {
    assert.ok(inbox.options.address);
  });

  it("has a default message", async() => {
    const message = await inbox.methods.message().call();
    assert.equal(message, INITIAL_MESSAGE);
  })

  it("can updte the message", async () => {
    const originalMessage = await inbox.methods.message().call();
    const expectedNewMessage = "Bye";
    await inbox.methods.setMessage(expectedNewMessage).send({from: accounts[1]});
    const actualNewMessage = await inbox.methods.message().call();
    assert.equal(actualNewMessage, expectedNewMessage);
    assert.notEqual(actualNewMessage, originalMessage);
  });
});
