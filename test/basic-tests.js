const ERC20X = artifacts.require("ERC20X");
const UniswapDemo = artifacts.require("UniswapDemo");
const UniswapExchange = artifacts.require("UniswapExchange");
const UniswapFactory = artifacts.require("UniswapFactory");

contract("Uniswap Tests", async accounts => {
  const [bob, alice] = accounts;

  let factory;
  let uniswapExchangeInstance;
  let tokenContract;
  let tokenExchange;

  it("setup contracts and add liquidity", async () => {
    //token contract
    tokenContract = await ERC20X.new();

    //deploy exchange
    uniswapExchangeInstance = await UniswapExchange.new();

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

    //create token exchange
    tokenExchange = await UniswapExchange.at(exchangeAddress);

    assert.equal(
      (await tokenExchange.decimals()) == 18,
      true,
      "should be 18 decimals"
    );
    assert.equal(
      (await tokenExchange.totalSupply()) == 0,
      true,
      "token supply should be 0"
    );
    assert.equal(
      (await tokenExchange.tokenAddress()) == tokenContract.address,
      true,
      "token address should be the same"
    );
    assert.equal(
      (await tokenExchange.factoryAddress()) == factory.address,
      true,
      "factory address should be the same"
    );
    assert.equal(
      (await web3.eth.getBalance(tokenExchange.address)) == 0,
      true,
      "eth balance should be zero"
    );
    assert.equal(
      (await tokenExchange.balanceOf(tokenExchange.address)) == 0,
      true,
      "token balance should be zero"
    );

    //mint 1500000000 tokens
    await tokenContract.mint(bob, web3.utils.toWei("1"));

    //approve token for exchangeAddress
    await tokenContract.approve(tokenExchange.address, web3.utils.toWei("1"), {
      from: bob
    });

    //get block timestamp
    let blockInfo = await web3.eth.getBlock(await web3.eth.getBlockNumber());

    //add liquidity
    await tokenExchange.addLiquidity(
      1,
      web3.utils.toWei("1"),
      blockInfo.timestamp + 300,
      { value: web3.utils.toWei("1"), from: bob, gasLimit: 200000 }
    );

    //check tokens after
    let tokenCount = await tokenContract.balanceOf(tokenExchange.address);
    assert.equal(
      tokenCount.toString() == web3.utils.toWei("1"),
      true,
      "token value should be 10*10*18"
    );

    //check tokens after
    let bobTokenCount = await tokenContract.balanceOf(bob);
    assert.equal(
      Number(bobTokenCount.toString()) == web3.utils.toWei("0"),
      true,
      "token value should be 0"
    );

    assert.equal(
      (await factory.getToken(tokenExchange.address)) == tokenContract.address,
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

    //check token address
    let checkTokenAddress = await UniswapDemoInstance.checkTokenAddress(
      tokenContract.address
    );
    assert(
      checkTokenAddress == tokenContract.address,
      true,
      "token address is the same"
    );

    //mint tokens
    await tokenContract.mint(bob, web3.utils.toWei("0.2"));

    //approve token for
    await tokenContract.approve(
      tokenExchange.address,
      web3.utils.toWei("0.1"),
      { from: bob }
    );
    await tokenContract.approve(
      UniswapDemoInstance.address,
      web3.utils.toWei("0.1"),
      { from: bob }
    );

    await tokenContract.transfer(
      UniswapDemoInstance.address,
      web3.utils.toWei("0.1"),
      { from: bob }
    );

    let bobsTokenBalance = await tokenContract.balanceOf(bob);

    console.log({ bob });
    console.log(UniswapDemoInstance.address);
    console.log("bobsTokenBalance " + bobsTokenBalance.toString());

    let tokenCountContract0 = await tokenContract.balanceOf(
      UniswapDemoInstance.address
    );
    console.log("UniswapDemoInstance " + tokenCountContract0.toString());

    let tokenCountContract1 = await tokenContract.balanceOf(
      tokenExchange.address
    );
    console.log("tokenExchange " + tokenCountContract1.toString());

    let ethInContract = await web3.eth.getBalance(tokenExchange.address);
    console.log("ethInContract " + ethInContract.toString());

    let bobEth0 = await web3.eth.getBalance(bob);
    console.log("bobEth0 " + bobEth0.toString());

    let blockInfo = await web3.eth.getBlock(await web3.eth.getBlockNumber());

    let min_tokens = 1;
    let deadline = blockInfo.timestamp + 3000;

    // # @dev User specifies exact input and minimum output.
    // # @param tokens_sold Amount of Tokens sold.
    // # @param min_eth Minimum ETH purchased.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output ETH.
    // # @return Amount of ETH bought.
    // @public
    // def tokenToEthTransferInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp, recipient: address) -> uint256(wei):

    await tokenExchange.tokenToEthTransferInput(
      10000000,
      1,
      deadline,
      UniswapDemoInstance.address,
      { from: bob }
    );

    //swap tokens for eth
    // let tx = await UniswapDemoInstance.testTokenToEth(
    //   tokenContract.address,web3.utils.toWei("0.1"), { from: bob }
    // );

    // console.log({tx})

    let tokenCount1 = await tokenContract.balanceOf(bob);
    console.log("token balance of bob " + tokenCount1.toString());

    let bobEth1 = await web3.eth.getBalance(bob);
    console.log("bobEth1 " + bobEth1.toString());

    let tokenBalanceOfDemoContract = await tokenContract.balanceOf(
      UniswapDemoInstance.address
    );
    console.log(
      "tokenBalanceOfDemoContract " + tokenBalanceOfDemoContract.toString()
    );

    let ethInContract1 = await web3.eth.getBalance(UniswapDemoInstance.address);
    console.log("ethInContract1 " + ethInContract1.toString());

    // assert(tokenCount0 > tokenCount1, true, 'bob should have less tokens')
  });
});
