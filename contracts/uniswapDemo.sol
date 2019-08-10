pragma solidity ^0.5.2;

import './UniswapFactoryInterface.sol';
import './UniswapExchangeInterface.sol';

contract UniswapDemo {
    UniswapFactoryInterface internal factory;

    constructor (address _uniswapFactoryAddress) public payable {
        factory = UniswapFactoryInterface(_uniswapFactoryAddress);
    }

    function swapEtherToERC20(uint256 _amountEther, address _targetCurrency) public payable returns (uint256 amountReceived){        

        address exchangeAddress = factory.getExchange(_targetCurrency);
        UniswapExchangeInterface exchange = UniswapExchangeInterface(exchangeAddress);

        uint256 min_tokens = 1;
        uint256 deadline = now +300;

        amountReceived = exchange.ethToTokenSwapInput.value(_amountEther)(min_tokens, deadline);
        return amountReceived
    }
}