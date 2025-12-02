import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia, mainnet, polygon } from 'wagmi/chains'

// 1. Get projectId from https://cloud.reown.com
const projectId = '9b6649ff83c31e90df10e7f2e5d13a85'

// 2. Set the chains
export const chains = [sepolia, mainnet, polygon]

// 3. Create a metadata object - optional
const metadata = {
  name: 'Staking DApp',
  description: 'Decentralized Staking Application',
  url: 'https://staking-dapp.reown.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 4. Set up the WagmiAdapter (config - optional)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  chains,
  projectId,
  networks: chains
})

export const config = wagmiAdapter.wagmiConfig

// 5. Create modal
export const appkit = createAppKit({
  adapters: [wagmiAdapter],
  chains,
  projectId,
  metadata,
  ssr: true,
  features: {
    analytics: true
  },
  themeMode: 'light'
})