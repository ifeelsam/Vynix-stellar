"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Copy, ExternalLink, Plus } from "lucide-react"
import { useWallet } from "./wallet-context"
import { usePathname } from "next/navigation"
import { cn, truncateAddress } from "@/lib/utils"
import { useProjectStore } from "@/store/useProjectStore"
import Link from "next/link"

interface WalletConnectionProps {
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
}

export default function WalletConnection({ isConnected, setIsConnected }: WalletConnectionProps) {
  const pathname = usePathname()
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
        {/* <div className="flex items-center">
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
        </div> */}

        <div className="flex items-center">
          {/* <div className="bg-gray-700 rounded-l-md px-3 py-2 text-sm text-gray-400">Testnet</div> */}
          <div className="rounded-full text-black  px-2 py-2 text-lg font-medium group"
          
          >{Number(testnetBalance).toFixed(0)} XLM</div>
        </div>

        {/* <div className="flex items-center">
          <div className="bg-gray-700 rounded-l-md px-3 py-2 text-sm text-gray-400">Mainnet</div>
          <div className="bg-gray-900 rounded-r-md px-3 py-2 text-sm font-mono">{mainnetBalance} XLM</div>
        </div> */}

        <div className="flex items-center">
          <div className="bg-gray-700 rounded-l-md px-3 py-2 text-sm text-gray-400" onClick={async()=>await mint()}>dasdada</div>
       </div>


                <Link href="/marketplace/create">
                  <Button
                    className={cn(
                      "rounded-full text-white bg-gradient-to-r from-[#6C63FF] to-[#5D51FF] dark:from-[#8075FF] dark:to-[#6C63FF] hover:from-[#5D51FF] hover:to-[#6C63FF] hover:scale-105 transition-transform",
                      pathname.includes("/marketplace/create") && "shadow-[0_0_15px_rgba(108,99,255,0.3)]",
                    )}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </Button>
                </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="rounded-full text-white bg-gradient-to-r from-[#6C63FF] to-[#5D51FF] dark:from-[#8075FF] dark:to-[#6C63FF] hover:from-[#5D51FF] hover:to-[#6C63FF] dark:hover:from-[#6C63FF] dark:hover:to-[#8075FF] px-8 py-6 text-lg font-medium group"
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}
