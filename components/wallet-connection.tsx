"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Copy, ExternalLink } from "lucide-react"
import { useWallet } from "./wallet-context"
import { truncateAddress } from "@/lib/utils"
import { useProjectStore } from "@/store/useProjectStore"

interface WalletConnectionProps {
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
}

export default function WalletConnection({ isConnected, setIsConnected }: WalletConnectionProps) {
  const { connectWallet, disconnectWallet, walletAddress, testnetBalance, mainnetBalance } = useWallet()
  const [copied, setCopied] = useState(false)
const {mint} = useProjectStore();
  const handleConnect = async () => {
    await connectWallet()
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setIsConnected(false)
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="">
        <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <div className="bg-gray-700 rounded-l-md px-3 py-2 text-sm text-gray-400">Address</div>
          <div className="bg-gray-900 rounded-r-md px-3 py-2 text-sm font-mono flex items-center">
            {truncateAddress(walletAddress || "")}
            <button onClick={copyAddress} className="ml-2 text-gray-400 hover:text-white" aria-label="Copy address">
              {copied ? <span className="text-green-500 text-xs">Copied!</span> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-gray-400 hover:text-white"
              aria-label="View on explorer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="flex items-center">
          <div className="bg-gray-700 rounded-l-md px-3 py-2 text-sm text-gray-400">Testnet</div>
          <div className="bg-gray-900 rounded-r-md px-3 py-2 text-sm font-mono">{testnetBalance} XLM</div>
        </div>

        <div className="flex items-center">
          <div className="bg-gray-700 rounded-l-md px-3 py-2 text-sm text-gray-400">Mainnet</div>
          <div className="bg-gray-900 rounded-r-md px-3 py-2 text-sm font-mono">{mainnetBalance} XLM</div>
        </div>

        <div className="flex items-center">
          <div className="bg-gray-700 rounded-l-md px-3 py-2 text-sm text-gray-400" onClick={async()=>await mint()}>dasdada</div>
       </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="ml-auto text-gray-400 hover:text-white border-gray-700"
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}
