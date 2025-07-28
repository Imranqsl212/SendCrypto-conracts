import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV5R1, internal } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

const mnemonic = 'SEED PHRASE';

async function sendTon(address, amount) {
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV5R1.create({ publicKey: key.publicKey, workchain: 0 });
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });

  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();

  await walletContract.sendTransfer({
    secretKey: key.secretKey,
    seqno,
    messages: [
      internal({
        to: address,
        value: amount.toString(), // в TON, например "0.05"
        bounce: false,
        body: "Sent from Imran",
      }),
    ],
  });

  return new Promise(async (resolve) => {
    let current = seqno;
    while (current === seqno) {
      await new Promise((res) => setTimeout(res, 1500));
      current = await walletContract.getSeqno();
    }
    resolve(true);
  });
}
