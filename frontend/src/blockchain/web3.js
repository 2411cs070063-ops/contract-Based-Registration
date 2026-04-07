import Web3 from 'web3';
import LandRegistryABI from './LandRegistryABI';

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT ADDRESS
// After deploying Register.sol on Remix IDE (https://remix.ethereum.org):
//   1. Compile the contract (Solidity compiler, version ^0.8.17)
//   2. Deploy to your chosen network (Injected Provider - MetaMask → Sepolia Testnet)
//   3. Copy the deployed contract address and paste it below.
// ─────────────────────────────────────────────────────────────────────────────
export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// ↑ Replace this with your deployed contract address ↑

/** Returns true if MetaMask (or any injected Ethereum provider) is available */
export const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/** Returns a Web3 instance connected to MetaMask */
export const getWeb3 = () => {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed. Please install it from https://metamask.io');
  }
  return new Web3(window.ethereum);
};

/** Returns the deployed LandRegistry contract instance */
export const getContract = (web3Instance) => {
  if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.warn(
      '[LandRegistry] ⚠️  Contract address is not set. ' +
      'Deploy the contract and update CONTRACT_ADDRESS in src/blockchain/web3.js'
    );
  }
  return new web3Instance.eth.Contract(LandRegistryABI, CONTRACT_ADDRESS);
};

/** Request MetaMask account access and return the array of accounts */
export const requestAccounts = async () => {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed.');
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts;
};

/** Shorten an Ethereum address for display: 0x1234...abcd */
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
