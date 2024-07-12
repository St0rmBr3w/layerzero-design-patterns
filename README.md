<p align="center">
  <a href="https://layerzero.network">
    <img alt="LayerZero" style="width: 400px" src="https://docs.layerzero.network/img/LayerZero_Logo_White.svg"/>
  </a>
</p>

<p align="center">
  <a href="https://layerzero.network" style="color: #a77dff">Homepage</a> | <a href="https://docs.layerzero.network/" style="color: #a77dff">Docs</a> | <a href="https://layerzero.network/developers" style="color: #a77dff">Developers</a>
</p>

<h1 align="center">OApp Example</h1>

<p align="center">
  <a href="https://docs.layerzero.network/contracts/oapp" style="color: #a77dff">Quickstart</a> | <a href="https://docs.layerzero.network/contracts/oapp-configuration" style="color: #a77dff">Configuration</a> | <a href="https://docs.layerzero.network/contracts/options" style="color: #a77dff">Message Execution Options</a> | <a href="https://docs.layerzero.network/contracts/endpoint-addresses" style="color: #a77dff">Endpoint Addresses</a>
</p>

<p align="center">Template project for getting started with LayerZero's  <code>OApp</code> contract development.</p>

## 1) Developing Contracts

#### Installing dependencies

We recommend using `pnpm` as a package manager (but you can of course use a package manager of your choice):

```bash
pnpm install
```

#### Compiling your contracts

This project supports both `hardhat` and `forge` compilation. By default, the `compile` command will execute both:

```bash
pnpm compile
```

If you prefer one over the other, you can use the tooling-specific commands:

```bash
pnpm compile:forge
pnpm compile:hardhat
```

Or adjust the `package.json` to for example remove `forge` build:

```diff
- "compile": "$npm_execpath run compile:forge && $npm_execpath run compile:hardhat",
- "compile:forge": "forge build",
- "compile:hardhat": "hardhat compile",
+ "compile": "hardhat compile"
```

#### Running tests

Similarly to the contract compilation, we support both `hardhat` and `forge` tests. By default, the `test` command will execute both:

```bash
pnpm test
```

If you prefer one over the other, you can use the tooling-specific commands:

```bash
pnpm test:forge
pnpm test:hardhat
```

Or adjust the `package.json` to for example remove `hardhat` tests:

```diff
- "test": "$npm_execpath test:forge && $npm_execpath test:hardhat",
- "test:forge": "forge test",
- "test:hardhat": "$npm_execpath hardhat test"
+ "test": "forge test"
```

## 2) Deploying Contracts

Set up deployer wallet/account:

- Rename `.env.example` -> `.env`
- Choose your preferred means of setting up your deployer wallet/account:

```
MNEMONIC="test test test test test test test test test test test junk"
or...
PRIVATE_KEY="0xabc...def"
```

To deploy your contracts to your desired blockchains, run the following command in your project's folder:

```bash
npx hardhat lz:deploy
```

More information about available CLI arguments can be found using the `--help` flag:

```bash
npx hardhat lz:deploy --help
```

## Configuring Contracts

To setup your contract configurations, first run:

```bash
npx hardhat lz:oapp:config:init --oapp-config CONFIG_FILE_NAME --contract-name CONTRACT_NAME
```

This will create a new config file in the same working directory (`my-lz-oapp`) using the name supplied.

### EVM Configurations

Fill out your `layerzero.config.ts` with the contracts you want to connect. You can generate the default config file for your declared hardhat networks by running:

```bash
npx hardhat lz:oapp:config:init --contract-name [YOUR_CONTRACT_NAME] --oapp-config [CONFIG_NAME]
```

> [!NOTE]
> You may need to change the contract name if you're deploying multiple OApp contracts on different chains (e.g., OFT and OFT Adapter).

<br>

```typescript
const ethereumContract: OmniPointHardhat = {
    eid: EndpointId.ETHEREUM_V2_MAINNET,
    contractName: 'MyOFTAdapter',
}

const arbitrumContract: OmniPointHardhat = {
    eid: EndpointId.ARBITRUM_V2_MAINNET,
    contractName: 'MyOFT',
}
```

Then define the pathway you want to create from and to each contract:

```typescript
connections: [
    // ETH <--> ARB PATHWAY: START
    {
        from: ethereumContract,
        to: arbitrumContract,
    },
    {
        from: arbitrumContract,
        to: ethereumContract,
    },
    // ETH <--> ARB PATHWAY: END
]
```

Finally, define the config settings for each direction of the pathway:

```typescript
connections: [
    // ETH <--> ARB PATHWAY: START
    {
        from: ethereumContract,
        to: arbitrumContract,
        config: {
          sendLibrary: contractsConfig.ethereum.sendLib302,
          receiveLibraryConfig: {
              receiveLibrary: contractsConfig.ethereum.receiveLib302,
              gracePeriod: BigInt(0),
          },
          // Optional Receive Library Timeout for when the Old Receive Library Address will no longer be valid
          receiveLibraryTimeoutConfig: {
              lib: "0x0000000000000000000000000000000000000000",
              expiry: BigInt(0),
          },
          // Optional Send Configuration
          // @dev Controls how the `from` chain sends messages to the `to` chain.
          sendConfig: {
              executorConfig: {
              maxMessageSize: 10000,
              // The configured Executor address
              executor: contractsConfig.ethereum.executor,
              },
              ulnConfig: {
              // The number of block confirmations to wait on BSC before emitting the message from the source chain.
              confirmations: BigInt(15),
              // The address of the DVNs you will pay to verify a sent message on the source chain ).
              // The destination tx will wait until ALL `requiredDVNs` verify the message.
              requiredDVNs: [
                  contractsConfig.ethereum.horizenDVN, // Horizen
                  contractsConfig.ethereum.polyhedraDVN, // Polyhedra
                  contractsConfig.ethereum.animocaBlockdaemonDVN, // Animoca-Blockdaemon (only available on ETH <-> Arbitrum One)
                  contractsConfig.ethereum.lzDVN  // LayerZero Labs
              ],
              // The address of the DVNs you will pay to verify a sent message on the source chain ).
              // The destination tx will wait until the configured threshold of `optionalDVNs` verify a message.
              optionalDVNs: [],
              // The number of `optionalDVNs` that need to successfully verify the message for it to be considered Verified.
              optionalDVNThreshold: 0,
              },
          },
          // Optional Receive Configuration
          // @dev Controls how the `from` chain receives messages from the `to` chain.
          receiveConfig: {
              ulnConfig: {
              // The number of block confirmations to expect from the `to` chain.
              confirmations: BigInt(20),
              // The address of the DVNs your `receiveConfig` expects to receive verifications from on the `from` chain ).
              // The `from` chain's OApp will wait until the configured threshold of `requiredDVNs` verify the message.
              requiredDVNs: [
                  contractsConfig.ethereum.lzDVN, // LayerZero Labs DVN
                  contractsConfig.ethereum.animocaBlockdaemonDVN, // Blockdaemon-Animoca
                  contractsConfig.ethereum.horizenDVN, // Horizen Labs
                  contractsConfig.ethereum.polyhedraDVN // Polyhedra
              ],
              // The address of the `optionalDVNs` you expect to receive verifications from on the `from` chain ).
              // The destination tx will wait until the configured threshold of `optionalDVNs` verify the message.
              optionalDVNs: [],
              // The number of `optionalDVNs` that need to successfully verify the message for it to be considered Verified.
              optionalDVNThreshold: 0,
              },
          },
          // Optional Enforced Options Configuration
          // @dev Controls how much gas to use on the `to` chain, which the user pays for on the source `from` chain.
          enforcedOptions: [
              {
              msgType: 1,
              optionType: ExecutorOptionType.LZ_RECEIVE,
              gas: 65000,
              value: 0,
              },
              {
              msgType: 2,
              optionType: ExecutorOptionType.LZ_RECEIVE,
              gas: 65000,
              value: 0,
              },
              {
              msgType: 2,
              optionType: ExecutorOptionType.COMPOSE,
              index: 0,
              gas: 50000,
              value: 0,
              },
          ],
      }
    },
    {
        from: arbitrumContract,
        to: ethereumContract,
    },
    // ETH <--> ARB PATHWAY: END
]
```

To set these config settings, run:

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

By following these steps, you can focus more on creating innovative omnichain solutions and less on the complexities of cross-chain communication.

<br></br>

<p align="center">
  Join our community on <a href="https://discord-layerzero.netlify.app/discord" style="color: #a77dff">Discord</a> | Follow us on <a href="https://twitter.com/LayerZero_Labs" style="color: #a77dff">Twitter</a>
</p>
