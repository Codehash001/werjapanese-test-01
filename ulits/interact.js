const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('../scripts/whitelist.js')




import { config } from '../dapp.config'

const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)

const contract = require('../artifacts/contracts/WeRjapanese01.sol/WeRjapanese01.json')
const nftContract = new web3.eth.Contract(contract.abi, config.contractAddress)

// Calculate merkle root from the whitelist array
const leafNodes = whitelist.map((addr) => keccak256(addr))
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
const root = merkleTree.getRoot()


export const getTotalMinted = async () => {
  const totalMinted = await nftContract.methods.totalSupply().call()
  return totalMinted
}

export const getMaxSupply = async () => {
  const maxSupply = await nftContract.methods.maxSupply().call()
  return maxSupply
}

export const isPausedState = async () => {
  const paused = await nftContract.methods.paused().call()
  return paused
}

export const isPublicSaleState = async () => {
  const publicSale = await nftContract.methods.publicSale().call()
  return publicSale
}

export const isPreSaleState = async () => {
  const preSale = await nftContract.methods.preSale().call()
  return preSale
}

export const getPresalePrice = async () => {
    const PresalePrice = await nftContract.methods.wlcost().call()
    return PresalePrice
}
export const getPublicsalePrice = async () => {
    const PublicsalePrice = await nftContract.methods.cost().call()
    return PublicsalePrice
}
//Set up presale mint

export const presaleMint = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  const leaf = keccak256(window.ethereum.selectedAddress)
  const proof = merkleTree.getHexProof(leaf)

  // Verify Merkle Proof
  const isValid = merkleTree.verify(proof, leaf, root)

  if (!isValid) {
    return {
      success: false,
      status: '❌ Invalid Merkle Proof - You are not on the whitelist'
    }
  }
  
  const wallet =(window.ethereum.selectedAddress)
  const numberMinted = await nftContract.methods.numberMinted(wallet) .call()
  console.log('You have already minted : ' + numberMinted)
  console.log ('you are going to mint : ' + mintAmount)
  const AbleToMint = (config.presaleMaxMintAmount - numberMinted)

  if (AbleToMint <  mintAmount){
    return {
      success: false,
      status: '📌 You have already minted ' + numberMinted +' NFT/s ' +
       'You are able to mint only '+ AbleToMint +' more NFT/s ' 
    }
  }
  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )

  // Set up our Ethereum transaction
  const tx = {
    to: config.contractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.preSalePrice*mintAmount), 'ether')
    ).toString(16), // hex
    gas: String(300000 * mintAmount),
    data: nftContract.methods
      .presaleMint(mintAmount, proof)
      .encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    return {
      success: true,
      status: (
        <a href={`https://rinkeby.etherscan.io/tx/${txHash}`} target="_blank">
          <p>✅ Check out your transaction on Etherscan:</p>
          <p>{`https://rinkeby.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }
}

//Set up public sale mint

export const publicMint = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )
  const wallet =(window.ethereum.selectedAddress)
  const numberMinted = await nftContract.methods.numberMinted(wallet) .call()
  console.log('You have already minted : ' + numberMinted)
  console.log ('you are going to mint : ' + mintAmount)
  const AbleToMint = (config.maxMintAmount - numberMinted)

  if (AbleToMint <  mintAmount){
    return {
      success: false,
      status: '📌 You have already minted ' + numberMinted +' NFT/s ' +
       'You are able to mint only '+ AbleToMint +' more NFT/s ' 
    }
  }

  /*for (var Tokenid = 1; Tokenid <= 10; input ++)
  console.log('wal token ids are : '+ Tokenid)

  const owners = await nftContract.methods.ownerOf(Tokenid) .call()
  
  const allWlowners = owners // list of presale owners
  let target = wallet

  let WlmintedAmountBythisUser = 0
  for ( addresses of allWlowners){
    if (addresses == target) {
      WlmintedAmountBythisUser++ ;
    }
  };
  console.log ('Amount of current wallet that minted in wl :' + WlmintedAmountBythisUser)
  
  const ableToMint = config.maxMintAmount + WlmintedAmountBythisUser
    
    if (ableToMint <= numberMinted){
      return {
        success: false,
        status: 'You have already minted maximum amount'
      }
    }*/
  

  // Set up our Ethereum transaction
  const tx = {
    to: config.contractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.publicSalePrice*mintAmount), 'ether')
    ).toString(16), // hex
    gas: String(300000 * mintAmount),
    data: nftContract.methods.publicSaleMint(mintAmount).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    return {
      success: true,
      status: (
        <a href={`https://rinkeby.etherscan.io/tx/${txHash}`} target="_blank">
          <p>✅ Check out your transaction on Etherscan:</p>
          <p>{`https://rinkeby.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }
}
