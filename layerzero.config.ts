import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'MyOFT',
}

const arbsepContract: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyOFT',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: arbsepContract,
        },
        {
            contract: sepoliaContract,
        },
    ],
    connections: [
        { // Sets the config on Arbitrum Sepolia
            from: arbsepContract,
            to: sepoliaContract,
            config: {},
        },
        { // Sets the config on Sepolia
            from: sepoliaContract,
            to: arbsepContract,
            config: {},
        },
    ],
}

export default config
