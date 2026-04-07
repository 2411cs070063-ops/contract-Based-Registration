// ABI generated from the LandRegistry smart contract (BlockChain/contracts/Register.sol)
// This tells web3.js how to communicate with the deployed contract.

const LandRegistryABI = [
  // ─── registerProperty ─────────────────────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "string", "name": "_propertyId",   "type": "string" },
      { "internalType": "string", "name": "_surveyNumber", "type": "string" },
      { "internalType": "string", "name": "_location",     "type": "string" },
      { "internalType": "uint256","name": "_area",         "type": "uint256" },
      { "internalType": "uint256","name": "_price",        "type": "uint256" }
    ],
    "name": "registerProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ─── transferProperty ─────────────────────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "string",  "name": "_propertyId",   "type": "string" },
      { "internalType": "address", "name": "_newOwner",     "type": "address" },
      { "internalType": "string",  "name": "_transferType", "type": "string" },
      { "internalType": "uint256", "name": "_price",        "type": "uint256" }
    ],
    "name": "transferProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ─── getProperty ──────────────────────────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "string", "name": "_propertyId", "type": "string" }
    ],
    "name": "getProperty",
    "outputs": [
      { "internalType": "string",  "name": "surveyNumber", "type": "string" },
      { "internalType": "string",  "name": "location",     "type": "string" },
      { "internalType": "uint256", "name": "area",         "type": "uint256" },
      { "internalType": "uint256", "name": "price",        "type": "uint256" },
      { "internalType": "address", "name": "owner",        "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ─── getOwnershipHistoryLength ────────────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "string", "name": "_propertyId", "type": "string" }
    ],
    "name": "getOwnershipHistoryLength",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ─── getOwnershipHistoryAt ────────────────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "string",  "name": "_propertyId", "type": "string" },
      { "internalType": "uint256", "name": "index",       "type": "uint256" }
    ],
    "name": "getOwnershipHistoryAt",
    "outputs": [
      { "internalType": "address", "name": "from",         "type": "address" },
      { "internalType": "address", "name": "to",           "type": "address" },
      { "internalType": "uint256", "name": "price",        "type": "uint256" },
      { "internalType": "string",  "name": "transferType", "type": "string" },
      { "internalType": "uint256", "name": "timestamp",    "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ─── Events ───────────────────────────────────────────────────────────────────
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "string",  "name": "propertyId",   "type": "string" },
      { "indexed": false, "internalType": "string",  "name": "surveyNumber", "type": "string" },
      { "indexed": false, "internalType": "string",  "name": "location",     "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "area",         "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "price",        "type": "uint256" },
      { "indexed": true,  "internalType": "address", "name": "owner",        "type": "address" }
    ],
    "name": "PropertyRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "string",  "name": "propertyId",   "type": "string" },
      { "indexed": true,  "internalType": "address", "name": "from",         "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "to",           "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "price",        "type": "uint256" },
      { "indexed": false, "internalType": "string",  "name": "transferType", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp",    "type": "uint256" }
    ],
    "name": "PropertyTransferred",
    "type": "event"
  }
];

export default LandRegistryABI;
