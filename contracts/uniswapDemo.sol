pragma solidity ^0.5.2;

import './UniswapFactoryInterface.sol';
import './UniswapExchangeInterface.sol';

contract UniswapDemo {
    UniswapFactoryInterface internal factory;

    constructor (address _uniswapFactoryAddress) public  {
        factory = UniswapFactoryInterface(_uniswapFactoryAddress);
    }

    function swapEtherToERC20(uint256 _amountEther, address _targetCurrency) public payable returns (uint256 amountReceived_){        

        address exchangeAddress = factory.getExchange(_targetCurrency);
        UniswapExchangeInterface exchange = UniswapExchangeInterface(exchangeAddress);

        uint256 min_tokens = 1; // TODO: implement this correctly, see "sell order" logic in docs
        uint256 deadline = now + 300; // this is the value in the docs; used so nodes can't hold off on unsigned txs and wait for optimal times to sell/arbitrage
       
        amountReceived_ = exchange.ethToTokenTransferInput.value(_amountEther)(min_tokens, deadline, address(this));
        
    }

    function checkTokenAddress(address _targetCurrency) public view returns (address){        
        address exchangeAddress = factory.getExchange(_targetCurrency);
        UniswapExchangeInterface exchange = UniswapExchangeInterface(exchangeAddress);
        return exchange.tokenAddress();
    }

    function testTokenToEth(address _targetCurrency,uint256 tokens_sold) public payable returns (uint256){        
    
        address exchangeAddress = factory.getExchange(_targetCurrency);
        UniswapExchangeInterface exchange = UniswapExchangeInterface(exchangeAddress);
        
        uint256 min_tokens = 1;
        uint256 deadline = now + 3000;        

        uint256 amountReceived_ = exchange.tokenToEthTransferInput(tokens_sold, min_tokens, deadline, address(this));
        return amountReceived_;
    }
}