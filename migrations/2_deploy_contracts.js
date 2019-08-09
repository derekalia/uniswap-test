var ERC20X = artifacts.require("./ERC20X.sol");

module.exports = function(deployer) {  
    deployer.deploy(ERC20X);

};
