const ERC20X = artifacts.require("ERC20X");

const UniswapExchange = artifacts.require("UniswapExchange");
const UniswapFactory = artifacts.require("UniswapFactory");

contract("Uniswap Tests", async accounts => {
  const [bob, alice] = accounts;

  it("setup contracts", async () => {
    //token contract
    let tokenContract = await ERC20X.new();

    //deploy exchange
    let uniswapExchangeInstance = await UniswapExchange.new();

    console.log("uniswapExchangeInstance.address");
    console.log(uniswapExchangeInstance.address);

    //deploy factory
    let uniswapFactoryContract = await UniswapFactory.new(
      uniswapExchangeInstance.address
    );

    //check address
    const savedExchangeTemplate = await uniswapFactoryContract.exchangeTemplate();
    assert.equal(savedExchangeTemplate, uniswapExchangeInstance.address);

    //set up token exchange
    await uniswapFactoryContract.createExchange(tokenContract.address);

    console.log("tokenContract.address");
    console.log(tokenContract.address);

    //get token exchange address
    let exchangeAddress = await uniswapFactoryContract.getExchange(
      tokenContract.address
    );

    console.log({ exchangeAddress });

    //mint 1500000000 tokens
    await tokenContract.mint(bob, 1500000000);

    //approve token for exchangeAddress
    await tokenContract.approve(exchangeAddress, 1500000000, { from: bob });

    //get block timestamp
    let block = await web3.eth.getBlockNumber();
    let blockInfo = await web3.eth.getBlock(block);
    console.log(blockInfo.timestamp);

    let checkFactory = await uniswapExchangeInstance.factory();
    console.log({ checkFactory });

    let checkToken = await uniswapExchangeInstance.token();
    console.log({ checkToken });

    console.log({ exchangeAddress });

    let token_exchange = await UniswapExchange.at(exchangeAddress);

    console.log("token_exchange.address");
    console.log(token_exchange.address);

    let checkExchangeFactory = await token_exchange.factory();
    console.log({ checkExchangeFactory });

    let checkExchangeToken = await token_exchange.token();
    console.log({ checkExchangeToken });

    let tx = await token_exchange.addLiquidity(
      0,
      1000000000,
      blockInfo.timestamp + 300,
      { value: 5 * 10 ** 18, from: bob, gasLimit: 200000 }
    );

    console.log({ tx });

    let tokenCount = await uniswapFactoryContract.tokenCount();
    assert.equal(
      Number(tokenCount.toString()) == 1000000000,
      true,
      "token value should be 1000000000"
    );

    console.log("tokenCount: " + tokenCount.toString());
  });
});
