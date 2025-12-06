"use client"

import {isConnected, requestAccess, getNetwork, signTransaction } from "@stellar/freighter-api";
import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "sonner"

interface WalletContextType {
  walletAddress: string | null
  testnetBalance: string
  mainnetBalance: string
  network: string | null
  networkPassphrase: string | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  testnetBalance: "0",
  mainnetBalance: "0",
  network: null,
  networkPassphrase: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
})

export const useWallet = () => useContext(WalletContext)

interface WalletProviderProps {
  children: ReactNode
}

const fetchBalance = async (address: string, isTestnet: boolean): Promise<string> => {
  const url = isTestnet
    ? `https://horizon-testnet.stellar.org/accounts/${address}`
    : `https://horizon.stellar.org/accounts/${address}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const nativeBalance = data.balances.find(
      (b: any) => b.asset_type === "native"
    )
    return nativeBalance?.balance || "0"
  } catch (error) {
    console.error(`Failed to fetch ${isTestnet ? "testnet" : "mainnet"} balance:`, error)
    return "0"
  }
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [testnetBalance, setTestnetBalance] = useState("0")
  const [mainnetBalance, setMainnetBalance] = useState("0")
  const [network, setNetwork] = useState<string | null>(null)
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      const isAppConnected = await isConnected()
      if (!isAppConnected.isConnected) {
        alert("Please install the Freighter wallet extension.")
        return
      }

      const accessObj = await requestAccess()
      if (accessObj.error) {
        console.error("Access error:", accessObj.error)
        return
      }

      const { address } = accessObj
      setWalletAddress(address)

      const net = await getNetwork()
      if (!net.error) {
        setNetwork(net.network)
        setNetworkPassphrase(net.networkPassphrase)
      }

      // Fetch both balances manually
      const testBal = await fetchBalance(address, true)
      const mainBal = await fetchBalance(address, false)

      setTestnetBalance(testBal)
      setMainnetBalance(mainBal)

      toast.success("Wallet connected successfully!")
    } catch (err) {
      console.error("Failed to connect Freighter:", err)
      alert("Failed to connect to Freighter wallet.")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setTestnetBalance("0")
    setMainnetBalance("0")
    setNetwork(null)
    setNetworkPassphrase(null)
  }

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        testnetBalance,
        mainnetBalance,
        network,
        networkPassphrase,
        isConnecting,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
