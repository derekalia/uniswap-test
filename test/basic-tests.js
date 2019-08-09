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

    //deploy factory
    let uniswapFactoryContract = await UniswapFactory.new(
      uniswapExchangeInstance.address
    );

    //check address
    const savedExchangeTemplate = await uniswapFactoryContract.exchangeTemplate();
    assert.equal(savedExchangeTemplate, uniswapExchangeInstance.address);

    //set up token exchange
    await uniswapFactoryContract.createExchange(tokenContract.address);

    //get token exchange address
    let exchangeAddress = await uniswapFactoryContract.getExchange(
      tokenContract.address
    );

    //mint 1500000000 tokens
    await tokenContract.mint(bob, 1500000000);

    //approve token for exchangeAddress
    await tokenContract.approve(exchangeAddress, 1500000000, { from: bob });

    //get block timestamp
    let block = await web3.eth.getBlockNumber();
    let blockInfo = await web3.eth.getBlock(block);
    console.log(blockInfo.timestamp);

    let tx = await uniswapExchangeInstance.addLiquidity(
      1000000000,
      1000000000,
      blockInfo.timestamp + 300,
      { value: 1000000000, from: bob }
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
