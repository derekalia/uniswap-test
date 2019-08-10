const ERC20X = artifacts.require("ERC20X");
const UniswapDemo = artifacts.require("UniswapDemo");
const UniswapExchange = artifacts.require("UniswapExchange");
const UniswapFactory = artifacts.require("UniswapFactory");

contract("Uniswap Tests", async accounts => {
  const [bob, alice] = accounts;

  let factory;
  let uniswapExchangeInstance;
  let tokenContract;
  let token_exchange_address;

  it("setup contracts", async () => {
    //token contract
    tokenContract = await ERC20X.new();
    //token contract

    //deploy exchange
    uniswapExchangeInstance = await UniswapExchange.new();

    console.log("uniswapExchangeInstance.address");
    console.log(uniswapExchangeInstance.address);

    //deploy factory
    factory = await UniswapFactory.new();
    await factory.initializeFactory(uniswapExchangeInstance.address);

    //check address
    const savedExchangeTemplate = await factory.exchangeTemplate();
    assert.equal(savedExchangeTemplate, uniswapExchangeInstance.address);

    //create exchange
    await factory.createExchange(tokenContract.address);

    //get token exchange address
    let exchangeAddress = await factory.getExchange(tokenContract.address);
    console.log({ exchangeAddress });

    //mint 1500000000 tokens
    await tokenContract.mint(bob, 1500000000);

    //approve token for exchangeAddress
    await tokenContract.approve(exchangeAddress, 1500000000, { from: bob });

    //get block timestamp
    let block = await web3.eth.getBlockNumber();
    let blockInfo = await web3.eth.getBlock(block);
    console.log(blockInfo.timestamp);

    let token_exchange = await UniswapExchange.at(exchangeAddress);

    let t1 = (await token_exchange.decimals()) == 18;
    let t2 = (await token_exchange.totalSupply()) == 0;
    let t3 = (await token_exchange.tokenAddress()) == tokenContract.address;
    let t4 = (await token_exchange.factoryAddress()) == factory.address;
    let t5 = (await web3.eth.getBalance(token_exchange.address)) == 0;
    let t6 = (await token_exchange.balanceOf(token_exchange.address)) == 0;

    console.log({ t1, t2, t3, t4, t5, t6 });

    console.log("token_exchange.address");
    console.log(token_exchange.address);

    await token_exchange.addLiquidity(
      0,
      1000000000,
      blockInfo.timestamp + 300,
      { value: 5 * 10 ** 18, from: bob, gasLimit: 200000 }
    );

    //check tokens after
    let tokenCount = await tokenContract.balanceOf(token_exchange.address);
    assert.equal(
      Number(tokenCount.toString()) == 1000000000,
      true,
      "token value should be 1000000000"
    );

    token_exchange_address = token_exchange.address;

    assert.equal(
      (await factory.getToken(token_exchange.address)) == tokenContract.address,
      true,
      "should have same token address"
    );
    assert.equal(
      (await factory.tokenCount()) == 1,
      true,
      "token count should be 1"
    );
    assert.equal(
      (await factory.getTokenWithId(1)) == tokenContract.address,
      true,
      "get token id of 1 should be thee token address"
    );
  });

  it("setup uniswap demo", async () => {
    //launch uniswap demo

    let UniswapDemoInstance = await UniswapDemo.new(factory.address);

    let tokenCount0 = await tokenContract.balanceOf(alice);
    console.log(tokenCount0.toString());

    //run function //uint256 _amountEther, address _targetCurrency
    await UniswapDemoInstance.swapEtherToERC20(
      10000000,
      tokenContract.address,
      {
        from: alice,
        value: 10000000
      }
    );

    let tokenCount1 = await tokenContract.balanceOf(alice);
    console.log(tokenCount1.toString());
  });
});
