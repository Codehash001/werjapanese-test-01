const hre = require('hardhat')

const _initBaseURI='ipfs://QmRTxCyomUV4GeyDy54Cq26HBr1AKge7geX8QSjVLyHJZC/'
//const proxyRegistryAddressRinkeby = '0xf57b2c51ded3a29e6891aba85459d600256cf317'
//const proxyRegistryAddressMainnet = '0xa5409ec958c83c3f309868babaca7c86dcb077c1'

async function main() {

  // Deploy the contract
  const weRjapanese01 = await hre.ethers.getContractFactory('WeRjapanese01')
  const WeRjapanese01 = await weRjapanese01.deploy(
    _initBaseURI)
await WeRjapanese01.deployed()

  console.log('WeRjapanese01 deployed to:', WeRjapanese01.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })