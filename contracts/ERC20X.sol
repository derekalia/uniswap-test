pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";

contract ERC20X is ERC20Detailed, ERC20Burnable, ERC20Mintable  {
    constructor() public ERC20Detailed('TestToken', 'TT', 18){}
}