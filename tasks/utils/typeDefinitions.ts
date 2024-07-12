// Assuming you are using ethers.js in your Hardhat project
import { BigNumberish, BytesLike } from "ethers"
/**
 * Represents token parameters for the OFT send() operation.
 */
export interface SendParam {
    dstEid: BigNumberish; // Destination endpoint ID, represented as a number.
    to: BytesLike; // Recipient address, represented as bytes.
    amountLD: BigNumberish; // Amount to send in local decimals.
    minAmountLD: BigNumberish; // Minimum amount to send in local decimals.
    extraOptions: BytesLike; // Additional options supplied by the caller to be used in the LayerZero message.
    composeMsg: BytesLike; // The composed message for the send() operation.
    oftCmd: BytesLike; // The OFT command to be executed, unused in default OFT implementations.
}
/**
 * Represents the messaging fee structure returned by the quoteSend function.
 */
export interface MessagingFee {
    nativeFee: BigNumberish; // The native fee.
    lzTokenFee: BigNumberish; // The lzToken fee.
}