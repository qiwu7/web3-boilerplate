pragma solidity ^0.4.26;

contract Lottery {
    address public manager;
    address[] public players; 
    
    constructor() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > 0.01 ether);
        players.push(msg.sender);
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        address winner = players[index];
        winner.transfer(this.balance);
        // reset
        players = new address[](0);
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
}