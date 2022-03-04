const { raw } = require('body-parser')
const ethers = require('ethers')
const srcDir = require('find-config')('src')
//const { NonceManager } = require('@ethersproject/experimental')
const sleep = require('util').promisify(setTimeout)
const { readMnemonic } = require(srcDir + '/keyman')
const db = require(srcDir + '/db')
const fetch = require('node-fetch')

require('dotenv').config({ path: require('find-config')('.env') })

//const vaultAddr = '0x106899D511D0069BA1E80E22a979EE382Ee06B90' //rinkeby
const vaultAddr = '0x0866f2af4cf0b601A1a2c4eBD56CBB954a1cF004' //mainnet
const vaultAbi = [{"inputs":[{"internalType":"address","name":"_nftAddress","type":"address"},{"internalType":"address","name":"_erc20Address","type":"address"},{"internalType":"address","name":"_bridgeAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bridgeAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"calcBridgeRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"calcRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"daoAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"daoInitialized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"erc20Addr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"expiration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getConsonants","outputs":[{"internalType":"string[3]","name":"","type":"string[3]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getConsonantsIndex","outputs":[{"internalType":"uint8[3]","name":"","type":"uint8[3]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getGenes","outputs":[{"internalType":"uint8[8]","name":"","type":"uint8[8]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_daoAddress","type":"address"}],"name":"initializeDao","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastBlocks","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nftAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_bool","type":"bool"}],"name":"setAllowTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_bridgeAddress","type":"address"}],"name":"setBridgeAddr","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_bridgeAddress","type":"address"}],"name":"setBridgeAddrByDao","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_daoAddress","type":"address"}],"name":"setDaoAddr","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_erc20Address","type":"address"}],"name":"setErc20Addr","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_erc20Address","type":"address"}],"name":"setErc20AddrByDao","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_expiration","type":"uint256"}],"name":"setExpiration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_rate","type":"uint256"}],"name":"setRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"}],"name":"stake","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_count","type":"uint256"}],"name":"stakeByCount","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"tokensOf","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"totalClaims","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"transferAllowed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]

const mirrorAddr = '0x27A3e1e71B6f4C8f388e55C01c8Bb49139492071' //mumbai testnet & mainnet
const mirrorAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"},{"internalType":"address[]","name":"_addrs","type":"address[]"}],"name":"add","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_addr","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"_froms","type":"address[]"},{"internalType":"address[]","name":"_tos","type":"address[]"},{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"}],"name":"bulkTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getConsonants","outputs":[{"internalType":"string[3]","name":"","type":"string[3]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getConsonantsIndex","outputs":[{"internalType":"uint8[3]","name":"","type":"uint8[3]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getGenes","outputs":[{"internalType":"uint8[8]","name":"","type":"uint8[8]"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"}],"name":"remove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_addr","type":"address"}],"name":"tokensOf","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"}]

//const vaultNetwork = 'rinkeby'
const vaultNetwork = 'mainnet'
const mirrorNetwork = 'matic' //Polygon mainnet
//const mirrorNetwork = 'maticmum' //Polygon testnet
const infuraId =  process.env.INFURA_API_KEY
const alchemyId = process.env.ALCHEMY_API_KEY

const defaultPath = "m/44'/60'/0'/0/0"
const currentPath = "m/44'/60'/0'/0/1"


let vaultProvider
let vaultWallet
let vaultContract

let mirrorProvider
let mirrorWallet
let mirrorContract


//let vaultStart = 9589355 //rinkeby
//let vaultStart = 13555663 //mainnet 

let deployedBlock = {
  'vault': 13555663,  //mainnet
  'mirror': 13555663  //mumbai
}

const getContract = async () => {
  vaultProvider = new ethers.providers.InfuraProvider.getWebSocketProvider(vaultNetwork, infuraId)
  //provider = new ethers.providers.InfuraProvider(network, infuraId)
  let  rawWallet = ethers.Wallet.fromMnemonic(readMnemonic(), currentPath)
  vaultWallet = rawWallet.connect(vaultProvider)
  vaultContract = new ethers.Contract(vaultAddr, vaultAbi, vaultWallet)
  mirrorProvider = new ethers.providers.AlchemyProvider(mirrorNetwork, alchemyId);
  //mirrorProvider = new ethers.providers.AlchemyProvider.getWebSocketProvider(mirrorNetwork, alchemyId)
  mirrorWallet = rawWallet.connect(mirrorProvider)
  mirrorContract = new ethers.Contract(mirrorAddr, mirrorAbi, mirrorWallet)
  return vaultProvider, vaultWallet, vaultContract, mirrorProvider, mirrorWallet, mirrorContract
}

(async () => {
  try {
    await getContract()
  } catch (err) {
  }
})();

const download = async (target) => {
  //target = 'vault' or 'mirror'
  let provider   
  let contract 

  let startBlock = db.get(target + '-last-block')
  if (!startBlock) startBlock = deployedBlock[target]
  if (target == 'vault') {
    provider = vaultProvider
    contract = vaultContract
  } else {
    provider = mirrorProvider
    contract = mirrorContract
  }
  let endBlock = await provider.getBlockNumber()
  let allTokens = db.get(target + '-allTokens') || {}
  let records = await contract.queryFilter('Transfer', startBlock, endBlock)

  records.forEach((r, i) => {
    let tokenId = r.args.tokenId.toNumber()
    let from = r.args.from
    let to = r.args.to
    let tokenKey = target + '-token-' + tokenId
    let addressKey = target + '-address-' + to
    let addressKeyFrom = target + '-address-' + from
    let currentSetTo = new Set(db.get(addressKey) || [])
    let currentSetFrom = new Set(db.get(addressKeyFrom) || [])

    if (from == '0x0000000000000000000000000000000000000000') {
      db.put(tokenKey, to)
      currentSetTo.add(tokenId)
      db.put(addressKey, Array.from(currentSetTo.values()).sort())
      allTokens[tokenId] = to
    } else if (to == '0x0000000000000000000000000000000000000000') {
      db.put(tokenKey, to)
      currentSetTo.delete(tokenId)
      db.put(addressKey, Array.from(currentSetTo.values()).sort())
      delete allTokens[tokenId]
    } else {
      db.put(tokenKey, to)
      currentSetTo.add(tokenId)
      currentSetFrom.delete(tokenId)
      db.put(addressKey, Array.from(currentSetTo.values()).sort())
      db.put(addressKeyFrom, Array.from(currentSetFrom.values()).sort())
      allTokens[tokenId] = to      
    }
    console.log('finished ' + i)
  })
  db.put(target + '-allTokens', allTokens)
  db.put(target + '-last-block', endBlock)
}

const getArraySet = (target, start, end) => {
  let allList = Object.entries(target)
  if (!end) end = allList.length
  let tokendIds = []
  let addrs = []
  for (let i=start; i < end; i++) {
    tokendIds.push(allList[i][0])
    addrs.push(allList[i][1])
  }
  return { tokendIds, addrs }
}

const uploadMirror = async (start, end) => {
  //until synced, no updates on vault data requred
  if(!start) start = (await mirrorContract.totalSupply()).toNumber()
  if(!end) {
    let allTokens = db.get('vault-allTokens')
    end = Object.keys(allTokens).length
  }
  let batch = 200
  for (let i = start; i < end; i += batch) {
    let batchEnd = i + batch
    if (batchEnd > end) batchEnd = end
    let vaultTokens = db.get('vault-allTokens')
    let { tokendIds, addrs } = getArraySet(vaultTokens, i, batchEnd)
    await mirrorContract.add(tokendIds, addrs)
    console.log('finished...' + batchEnd)
  }
}

const getHash = (target) => {
  let allTokens = db.get(target +'-allTokens')
  return ethers.utils.id(JSON.stringify(allTokens))
}

const diff = () => {
  adds = {}
  transfers = {}
  removes = []
  let vaultTokens = db.get('vault-allTokens')
  let vaultList = Object.entries(vaultTokens)
  let MirrorTokens = db.get('mirror-allTokens')
  for(let i=0; i<vaultList.length; i++) {
    let tokenId = vaultList[i][0]
    if(vaultList[i][1] != MirrorTokens[tokenId]) {
      if(MirrorTokens[tokenId]) {
        transfers[tokenId] = [MirrorTokens[tokenId], vaultList[i][1]]
      } else {
        adds[tokenId] = vaultList[i][1]
      }
    }
    delete MirrorTokens[tokenId]
  }
  removes = Object.keys(MirrorTokens)
  return { adds, transfers, removes }
}

const getGasData = async () => {
  let r = await fetch('https://gasstation-mainnet.matic.network/v2')
  let gasData = await r.json()
  let maxPriorityFeePerGas = ethers.utils.parseUnits(parseInt(gasData.fast.maxPriorityFee + 3).toString(), "gwei")
  let maxFeePerGas = ethers.utils.parseUnits(parseInt(gasData.fast.maxFee + 30).toString(), "gwei")
  return {maxPriorityFeePerGas, maxFeePerGas}
}

const resync = async (nonceReset) => {
  let nonce = await mirrorWallet.getTransactionCount()
  let { adds, transfers, removes } = diff()
  //adds
  let end = Object.keys(adds).length 
  if(end > 0) {
    let batch = 100
    for (let i = 0; i < end; i += batch) {
      let batchEnd = i + batch
      if (batchEnd > end) batchEnd = end
      //let vaultTokens = db.get('vault-allTokens')
      let { tokendIds, addrs } = getArraySet(adds, i, batchEnd)
      let gasData = await getGasData()
      let maxPriorityFeePerGas = gasData.maxPriorityFeePerGas
      let maxFeePerGas = gasData.maxFeePerGas
      let options
      if(nonceReset) {
        options = { maxPriorityFeePerGas, maxFeePerGas, nonce }
      } else {
        options = { maxPriorityFeePerGas, maxFeePerGas }
      }
      let tx = await mirrorContract.add(tokendIds, addrs, options)
      nonce += 1
      console.log('adds... ' + batchEnd)
      console.log(tx)
    }
  }
  //transfers
  let transferIds = Object.keys(transfers)
  if(transferIds.length > 0) {
    let values = Object.values(transfers)
    let froms = []
    let tos = []
    for (let j=0; j < values.length; j++) {
      froms.push(values[j][0])
      tos.push(values[j][1])
    }
    let gasData = await getGasData()
    let maxPriorityFeePerGas = gasData.maxPriorityFeePerGas
    let maxFeePerGas = gasData.maxFeePerGas
    let options
    if(nonceReset) {
      options = { maxPriorityFeePerGas, maxFeePerGas, nonce }
    } else {
      options = { maxPriorityFeePerGas, maxFeePerGas }
    }
    let tx = await mirrorContract.bulkTransfer(froms, tos, transferIds, options)
    nonce += 1
    console.log('transfers...')
    console.log(tx)
  }    
  //removes
  if (removes.length > 0) {
    let gasData = await getGasData()
    let maxPriorityFeePerGas = gasData.maxPriorityFeePerGas
    let maxFeePerGas = gasData.maxFeePerGas
    let options
    if(nonceReset) {
      options = { maxPriorityFeePerGas, maxFeePerGas, nonce }
    } else {
      options = { maxPriorityFeePerGas, maxFeePerGas }
    }

    let tx = await mirrorContract.remove(removes, options)
    console.log('removes...')
    console.log(tx)
  }
  await download('mirror')  
}

const resetNonce = async (maxNonce) => {
  let nonce = await mirrorWallet.getTransactionCount()
  let gasData = await getGasData()
  let maxPriorityFeePerGas = gasData.maxPriorityFeePerGas
  let maxFeePerGas = gasData.maxFeePerGas

  for (let i = nonce; i <= maxNonce; i++) {
    let tx = {
      nonce: i,
      to: ethers.constants.AddressZero,
      data: '0x',
      maxPriorityFeePerGas,
      maxFeePerGas
    };     
    let receipt = await mirrorWallet.sendTransaction(tx);    
    console.log(receipt);
  }
} 


module.exports = { download, getHash, vaultProvider, vaultWallet, vaultContract, mirrorProvider, mirrorWallet, mirrorContract }