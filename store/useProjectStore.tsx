import { create } from "zustand";
import { devtools } from "zustand/middleware";
import  {
    Keypair,
    Contract,
    rpc as StellarRpc,
    TransactionBuilder,
    Networks,
    BASE_FEE,
  } from "@stellar/stellar-sdk";

//   import {TransactionBuilder} from "stellar-sdk";


import {
    isConnected,
    getAddress,
    signAuthEntry,
    signTransaction,getNetworkDetails,
    addToken,
    signMessage,
  } from "@stellar/freighter-api";
  import * as StellarSdk from "@stellar/stellar-sdk";

interface ProjectState {
    isWalletConnected: boolean;
    setIsWalletConnected:  (state: boolean) => void;
    mint: () => Promise<void>;
    transfer: (owner:string, to:string, token_id:number) => Promise<void>;
}



export const useProjectStore = create<ProjectState>()(
    devtools(
      (set, get) => ({ 
        isWalletConnected: false,
        setIsWalletConnected:  (state) => set({ isWalletConnected: state }),
        mint: async()=>{
            const uri ="https://ipfs.io/ipfs/bafkreihftsqvo4wg6bgf7n5cs3664wb5bm6r3wrsq537h6xf4ut4nxqdoi";
            const RPC_URL = await getNetworkDetails();
            const server = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org/");
            
              const contractAddress = "CBY34XYJW3MBIPY3PK2FL7KSDT3GDPBEAFNPYSKNEAM2UAJGZOZ45H7P";
              const contract = new StellarSdk.Contract(contractAddress);
            
              const PUBLIC_ADDRESS =await getAddress();
              const sourceAccount = await server.getAccount(PUBLIC_ADDRESS.address);

              let builtTransaction = new TransactionBuilder(sourceAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET
              }).setNetworkPassphrase(StellarSdk.Networks.TESTNET)
              .setTimeout(60)
              .addOperation(
                contract.call(
                  "mint",
                  StellarSdk.nativeToScVal(PUBLIC_ADDRESS.address, { type: "address" }), // to
                //   StellarSdk.nativeToScVal(uri,{ type: "string" })
                ),
              ).build();

              let preparedTransaction = await server.prepareTransaction(builtTransaction);
              const transactionXdr = preparedTransaction.toXDR();
              const signedTransactionData = await signTransaction(transactionXdr,{
              
                networkPassphrase: StellarSdk.Networks.TESTNET,
                address:PUBLIC_ADDRESS.address
              });
              console.log(signedTransactionData.signerAddress, signedTransactionData.signedTxXdr);
              
              const parsedTx = StellarSdk.TransactionBuilder.fromXDR(signedTransactionData.signedTxXdr,StellarSdk.Networks.TESTNET);
              const signatureBuffer = parsedTx.signatures[0].signature();              
              const signatureBase64 = signatureBuffer.toString('base64');
              
              preparedTransaction.addSignature(signedTransactionData.signerAddress,signatureBase64);
              
              try {
                let sendResponse = await server.sendTransaction(preparedTransaction);
                console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);
            
                if (sendResponse.status === "PENDING") {
                  let getResponse = await server.getTransaction(sendResponse.hash);
                  // Poll `getTransaction` until the status is not "NOT_FOUND"
                  while (getResponse.status === "NOT_FOUND") {
                    console.log("Waiting for transaction confirmation...");
                    // See if the transaction is complete
                    getResponse = await server.getTransaction(sendResponse.hash);
                    // Wait one second
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                  }
            
                  console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);
            
                  if (getResponse.status === "SUCCESS") {
                    // Make sure the transaction's resultMetaXDR is not empty
                    if (!getResponse.resultMetaXdr) {
                      throw "Empty resultMetaXDR in getTransaction response";
                    }
                    // Find the return value from the contract and return it
                    let transactionMeta = getResponse.resultMetaXdr;
                    let returnValue = getResponse.returnValue;
                    console.log(`Transaction result: ${returnValue}`);
                  } else {
                    throw `Transaction failed: ${getResponse.resultXdr}`;
                  }
                } else {
                  throw sendResponse;
                }
              } catch (err) {
                // Catch and report any errors we've thrown
                console.log("Sending transaction failed");
                console.log(JSON.stringify(err));
              }

            
        },
        transfer: async(owner:string, to:string, token_id:number)=>{
            const uri ="https://ipfs.io/ipfs/bafkreihftsqvo4wg6bgf7n5cs3664wb5bm6r3wrsq537h6xf4ut4nxqdoi";
            const RPC_URL = await getNetworkDetails();
            const server = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org/");
            
              const contractAddress = "CBY34XYJW3MBIPY3PK2FL7KSDT3GDPBEAFNPYSKNEAM2UAJGZOZ45H7P";
              const contract = new StellarSdk.Contract(contractAddress);
            
              const PUBLIC_ADDRESS =await getAddress();
              const sourceAccount = await server.getAccount(PUBLIC_ADDRESS.address);

              let builtTransaction = new TransactionBuilder(sourceAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET
              }).setNetworkPassphrase(StellarSdk.Networks.TESTNET)
              .setTimeout(60)
              .addOperation(
                contract.call(
                  "transfer",
                  StellarSdk.nativeToScVal(owner, { type: "address" }), // owner
                  StellarSdk.nativeToScVal(to, { type: "address" }), // to
                //   StellarSdk.nativeToScVal(uri,{ type: "string" }),
                StellarSdk.nativeToScVal(token_id.toString(), { type: "i128" }), // token_id

                ),
              ).build();

              let preparedTransaction = await server.prepareTransaction(builtTransaction);
              const transactionXdr = preparedTransaction.toXDR();
              const signedTransactionData = await signTransaction(transactionXdr,{
              
                networkPassphrase: StellarSdk.Networks.TESTNET,
                address:PUBLIC_ADDRESS.address
              });
              console.log(signedTransactionData.signerAddress, signedTransactionData.signedTxXdr);
              
              const parsedTx = StellarSdk.TransactionBuilder.fromXDR(signedTransactionData.signedTxXdr,StellarSdk.Networks.TESTNET);
              const signatureBuffer = parsedTx.signatures[0].signature();              
              const signatureBase64 = signatureBuffer.toString('base64');
              
              preparedTransaction.addSignature(signedTransactionData.signerAddress,signatureBase64);
              
              try {
                let sendResponse = await server.sendTransaction(preparedTransaction);
                console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);
            
                if (sendResponse.status === "PENDING") {
                  let getResponse = await server.getTransaction(sendResponse.hash);
                  // Poll `getTransaction` until the status is not "NOT_FOUND"
                  while (getResponse.status === "NOT_FOUND") {
                    console.log("Waiting for transaction confirmation...");
                    // See if the transaction is complete
                    getResponse = await server.getTransaction(sendResponse.hash);
                    // Wait one second
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                  }
            
                  console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);
            
                  if (getResponse.status === "SUCCESS") {
                    // Make sure the transaction's resultMetaXDR is not empty
                    if (!getResponse.resultMetaXdr) {
                      throw "Empty resultMetaXDR in getTransaction response";
                    }
                    // Find the return value from the contract and return it
                    let transactionMeta = getResponse.resultMetaXdr;
                    let returnValue = getResponse.returnValue;
                    console.log(`Transaction result: ${returnValue}`);
                  } else {
                    throw `Transaction failed: ${getResponse.resultXdr}`;
                  }
                } else {
                  throw sendResponse;
                }
              } catch (err) {
                // Catch and report any errors we've thrown
                console.log("Sending transaction failed");
                console.log(JSON.stringify(err));
              }

        }
     }),
      {
        name: "Project Store",
        enabled: true,
      }
    )
  );