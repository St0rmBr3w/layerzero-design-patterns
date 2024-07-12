import { task } from 'hardhat/config'
import { getEidForNetworkName } from '@layerzerolabs/devtools-evm-hardhat'
import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities';
import { SendParam } from "./utils/typeDefinitions";
import { Options } from '@layerzerolabs/lz-v2-utilities';

// send tokens from a contract on one network to another
task('lz:oft:send', 'Sends tokens from either OFT or OFTAdapter')
    .addParam('to', 'contract address on network B')
    .addParam('destination', 'name of network B')
    .addParam('amount', 'amount to transfer in token decimals')
    .setAction(async (taskArgs, { ethers, deployments }) => {

        const toAddress = taskArgs.to;
        const eidB = getEidForNetworkName(taskArgs.destination);

        // Get the contract factories
        const oftDeployment = await deployments.get('MyOFT');

        const [signer] = await ethers.getSigners();

        // Create contract instances
        const oftContract = new ethers.Contract(oftDeployment.address, oftDeployment.abi, signer);

        const decimals = await oftContract.decimals();
        const amount = ethers.utils.parseUnits(taskArgs.amount, decimals);
        let options = Options.newOptions().addExecutorLzReceiveOption(65000, 0).toBytes();

        // Now you can interact with the correct contract
        const oft = oftContract;

        const sendParam: SendParam = {
            dstEid: eidB,
            to: addressToBytes32(toAddress),
            amountLD: amount!,
            minAmountLD: amount!,
            extraOptions: options,
            composeMsg: ethers.utils.arrayify('0x'), // Assuming no composed message
            oftCmd: ethers.utils.arrayify('0x') // Assuming no OFT command is needed
        };
        // Get the quote for the send operation
        const feeQuote = await oft.quoteSend(sendParam, false);
        const nativeFee = feeQuote.nativeFee;

        console.log(
            `sending ${taskArgs.amount} token(s) to network ${taskArgs.destination} (${eidB})`
        )

        const r = await oft.send(
            sendParam, 
            { nativeFee: nativeFee, lzTokenFee: 0},
            signer.address,
            { value: nativeFee }
        );
        console.log(`Send tx initiated. See: https://layerzeroscan.com/tx/${r.hash}`)
    })

export default 'sendOFT'