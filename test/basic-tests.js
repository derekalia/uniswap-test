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

    assert.equal((await tokenExchange.decimals()) == 18, true,'should be 18 decimals')
    assert.equal((await tokenExchange.totalSupply()) == 0,true,'token supply should be 0')
    assert.equal((await  tokenExchange.tokenAddress()) == tokenContract.address,true,'token address should be the same')
    assert.equal((await tokenExchange.factoryAddress()) == factory.address,true,'factory address should be the same')
    assert.equal((await web3.eth.getBalance(tokenExchange.address)) == 0,true,'eth balance should be zero')
    assert.equal((await tokenExchange.balanceOf(tokenExchange.address)) == 0 ,true,'token balance should be zero')      

    //mint 1500000000 tokens
    await tokenContract.mint(bob, web3.utils.toWei("1.5"));

    //approve token for exchangeAddress
    await tokenContract.approve(tokenExchange.address, web3.utils.toWei("1.5"), { from: bob });

    //get block timestamp
    let blockInfo = await web3.eth.getBlock(await web3.eth.getBlockNumber());

    //add liquidity
    await tokenExchange.addLiquidity(
      0,
      web3.utils.toWei("1"),
      blockInfo.timestamp + 300,
      { value: web3.utils.toWei("1"), from: bob, gasLimit: 200000 }
    );

    //check tokens after
    let tokenCount = await tokenContract.balanceOf(tokenExchange.address);
    assert.equal(
      Number(tokenCount.toString()) == web3.utils.toWei("1"),
      true,
      "token value should be 1 eth"
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
    assert(checkTokenAddress==tokenContract.address, true, 'token address is the same')

    //mint tokens
    await tokenContract.mint(bob, web3.utils.toWei("0.1"));

    //approve token for 
    await tokenContract.approve(tokenExchange.address, web3.utils.toWei("0.1"), { from: bob });

    let tokenCount0 = await tokenContract.balanceOf(bob);

    //swap tokens for eth
    let tx = await UniswapDemoInstance.testTokenToEth(
      tokenContract.address,web3.utils.toWei("0.1"), { from: bob }
    );

    console.log({tx})

    let tokenCount1 = await tokenContract.balanceOf(bob);

    assert(tokenCount0 > tokenCount1, true, 'bob should have less tokens')  
  });
});
