import { Request, Response } from "express";
import { 
  clusterApiUrl, 
  ComputeBudgetProgram, 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction 
} from "@solana/web3.js";
import { MEMO_PROGRAM_ID } from "@solana/actions";
import { getChatGPTResponse } from "../api.ts";

const connection = new Connection(clusterApiUrl('devnet'));
const API_URL = "https://4739-2607-fea8-460-8200-146e-92ad-d684-e65a.ngrok-free.app";

const DinoKingIcons = {
  default: "https://scarlet-chemical-krill-40.mypinata.cloud/ipfs/QmYSupbdcb52bCxzAW9EcxdGA25Na9a3G9CR1ziCBa5gAs/defaultKing.png",
  happy: "https://scarlet-chemical-krill-40.mypinata.cloud/ipfs/QmYSupbdcb52bCxzAW9EcxdGA25Na9a3G9CR1ziCBa5gAs/happyKing.png",
  angry: "https://scarlet-chemical-krill-40.mypinata.cloud/ipfs/QmYSupbdcb52bCxzAW9EcxdGA25Na9a3G9CR1ziCBa5gAs/angryKing.png"
};

const createTransactionMemo = async (pubkey: PublicKey) => {
  const transaction = new Transaction();
  transaction.feePayer = pubkey;

  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from("Hello World!", "utf8"),
      keys: [],
    })
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  });

  return serializedTransaction.toString('base64');
};

// Route Handlers
export const actionsJson = async (_req: Request, res: Response) => {
  console.log("Test detected");
  return res.status(200).send({
    rules: [
      { pathPattern: '/*', apiPath: '/api/actions/*' },
      { pathPattern: '/api/actions/**', apiPath: '/api/actions/**' },
    ]
  });
};

export const quest = async (req: Request, res: Response) => { //get request - initially action
  console.log("Quest1 detected");
  return res.status(200).send({
    icon: DinoKingIcons.default,
    title: "Dino King's Quest 1",
    description: "Hey there, average one! I'm looking for a GOOD joke. If you can tell me a very funny joke, I will reward you handsomely!",
    label: "Submit",
    links: {
      actions: [{
        href: `${API_URL}/api/actions/quest1Submission`,
        label: "Tell Dino King The Joke",
        parameters: [{ name: "joke", label: "Tell your joke!" }]
      }]
    }
  });
};

export const OPTIONS = quest;

export const quest1Submission = async (req: Request, res: Response) => { //post request - chained action
  console.log("Quest1Submission detected");
  const { account, params } = req.body;
  const pubkey = new PublicKey(account);

  try {
    const transaction = await createTransactionMemo(pubkey);
    const response = await getChatGPTResponse(params.joke);
    const { score, message } = JSON.parse(response.replace(/'/g, '"').replace(/(\w+):/g, '"$1":'));
    
    const nextHref = score > 70 
      ? `${API_URL}/api/actions/quest1Good/${score}/${message}`
      : `${API_URL}/api/actions/quest1Bad/${score}/${message}`;
    
    const payload = {
      transaction,
      message: "Transaction created successfully",
      links: { next: { type: "post", href: nextHref } }
    };
    
    return res.status(200).send(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Error creating transaction" });
  }
};

export const quest1Good = async (req: Request, res: Response) => {
  console.log("Quest1Good detected");
  const { score, message } = req.params;

  return res.status(200).send({
    icon: DinoKingIcons.happy,
    title: "Dino King Quest Complete",
    description: `I give that ${score}/100 - ${message}`,
    label: "Claim Reward",
    links: {
      actions: [{
        href: `${API_URL}/api/actions/claim`,
        label: "Claim your reward"
      }]
    }
  });
};

export const quest1Bad = async (req: Request, res: Response) => {
  console.log("Quest1Bad detected");
  const { score, message } = req.params;

  return res.status(200).send({
    icon: DinoKingIcons.angry,
    title: "Dino King Quest Failed",
    description: `I give that ${score}/100 - ${message}`,
    label: "Try Again",
    links: {
      actions: [{
        href: `${API_URL}/api/actions/quest1Submission`,
        label: "Tell Dino King Another Joke",
        parameters: [{ name: "joke", label: "Tell your joke!" }]
      }]
    }
  });
};
