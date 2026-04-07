import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWeb3, getContract, requestAccounts, isMetaMaskAvailable, shortenAddress } from '../blockchain/web3';

const Web3Context = createContext(null);

export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }) {
  const [account, setAccount]       = useState(null);    // connected wallet address
  const [contract, setContract]     = useState(null);    // LandRegistry contract instance
  const [web3, setWeb3]             = useState(null);    // web3 instance
  const [isConnected, setIsConnected] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  // ── Connect Wallet ──────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    setNetworkError(null);
    try {
      if (!isMetaMaskAvailable()) {
        setNetworkError('MetaMask not found. Please install it from https://metamask.io');
        return;
      }
      const accounts    = await requestAccounts();
      const web3Instance = getWeb3();
      const contractInstance = getContract(web3Instance);

      setWeb3(web3Instance);
      setContract(contractInstance);
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (err) {
      console.error('[Web3Context] connectWallet error:', err);
      setNetworkError(err.message || 'Failed to connect wallet');
    }
  }, []);

  // ── Reconnect on page reload if already authorized ──────────────────────────
  useEffect(() => {
    if (!isMetaMaskAvailable()) return;

    const tryAutoConnect = async () => {
      try {
        // eth_accounts does NOT prompt MetaMask — it only returns already-authorized accounts
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const web3Instance      = getWeb3();
          const contractInstance  = getContract(web3Instance);
          setWeb3(web3Instance);
          setContract(contractInstance);
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (err) {
        console.warn('[Web3Context] Auto-connect failed:', err);
      }
    };

    tryAutoConnect();

    // Listen for account changes (e.g. user switches account in MetaMask)
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsConnected(false);
      } else {
        setAccount(accounts[0]);
      }
    });

    // Listen for network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }, []);

  const value = {
    account,
    shortAccount: shortenAddress(account),
    contract,
    web3,
    isConnected,
    networkError,
    connectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
