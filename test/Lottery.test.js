const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); // class constructor
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile_lottery')

let accounts;
let manager;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Get the manager/creator account
  manager = accounts[0];

  // Use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({from: manager, gas: "1000000"})
});

describe("Lottery", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether")
    });

    const players = await lottery.methods.getPlayers().call({
      from: manager
    });

    assert.equal(players[0], accounts[0]);
    assert.equal(players.length, 1);
  });

  it("allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether")
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.03", "ether")
    });
    await lottery.methods.enter().send({
      from: accounts[3],
      value: web3.utils.toWei("0.04", "ether")
    });

    const players = await lottery.methods.getPlayers().call({
      from: manager
    });

    assert.equal(players[0], accounts[0]);
    assert.equal(players[1], accounts[1]);
    assert.equal(players[2], accounts[3]);
    assert.equal(players.length, 3);
  });

  it("requires a minimum amount to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: account[0],
        value: 10
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("only manager can call pickWinner", async() => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch(err) {
      assert(err);
    }
  });

  it("sends money to th winner and rests the palyers array", async() => {
    // only 1 player to simple testing
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether")
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({
      from: manager
    });

    const finalBalnce = await web3.eth.getBalance(accounts[0]);
    const diff = finalBalnce - initialBalance;
    assert(diff > web3.utils.toWei("1.99", "ether"));
    assert(diff < web3.utils.toWei("2", "ether"));

    const players = await lottery.methods.getPlayers().call({
      from: manager
    });
    assert.equal(players.length, 0);

    const contractBalance = await web3.eth.getBalance(lottery._address);
    assert.equal(contractBalance, 0);
  });
});
