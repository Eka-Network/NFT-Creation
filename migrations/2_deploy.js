const ERC721PresetMinterPauserAutoId = artifacts.require("ERC721PresetMinterPauserAutoId");
var myArgs = process.argv.slice(6);

module.exports = async function(deployer) {
    await deployer.deploy(ERC721PresetMinterPauserAutoId, myArgs[0], myArgs[1], myArgs[2]);
    let info = await ERC721PresetMinterPauserAutoId.deployed();
    await info.mint(myArgs[3]);
    console.log('@#$%' + info.address);
};