import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "../idl/betting";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";

const PROGRAM_ID = new PublicKey(
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);

export class BettingService {
  private program: Program;
  private provider: AnchorProvider;

  constructor(connection: Connection, wallet: WalletContextState) {
    this.provider = new AnchorProvider(
      connection,
      wallet as any, // Type assertion needed due to version mismatch
      AnchorProvider.defaultOptions()
    );
    this.program = new Program(IDL as any, PROGRAM_ID, this.provider);
  }

  async createEvent(
    teamA: string,
    teamB: string,
    startTime: Date,
    description: string,
    category: string
  ): Promise<string> {
    try {
      const eventAccount = Keypair.generate();
      await this.program.methods
        .createEvent(
          teamA,
          teamB,
          Math.floor(startTime.getTime() / 1000),
          description,
          category
        )
        .accounts({
          authority: this.provider.wallet.publicKey,
          event: eventAccount.publicKey,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([eventAccount])
        .rpc();

      return eventAccount.publicKey.toString();
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async updateEvent(
    eventAddress: string,
    updates: {
      name?: string;
      description?: string;
      startTime?: Date;
      oddsA?: number;
      oddsB?: number;
      status?: string;
    }
  ): Promise<void> {
    try {
      const eventPubkey = new PublicKey(eventAddress);
      await this.program.methods
        .updateEvent(
          updates.name || null,
          updates.description || null,
          updates.startTime
            ? Math.floor(updates.startTime.getTime() / 1000)
            : null,
          updates.oddsA ? new BN(updates.oddsA * 1e9) : null,
          updates.oddsB ? new BN(updates.oddsB * 1e9) : null,
          updates.status || null
        )
        .accounts({
          authority: this.provider.wallet.publicKey,
          event: eventPubkey,
        })
        .rpc();
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  async placeBet(
    eventAddress: string,
    amount: number,
    team: string
  ): Promise<string> {
    try {
      const eventPubkey = new PublicKey(eventAddress);
      const betAccount = Keypair.generate();

      // Get token accounts
      const userTokenAccount = await this.getTokenAccount(eventPubkey, true);
      const eventTokenAccount = await this.getTokenAccount(eventPubkey, false);

      await this.program.methods
        .placeBet(new BN(amount * 1e9), team)
        .accounts({
          authority: this.provider.wallet.publicKey,
          event: eventPubkey,
          bet: betAccount.publicKey,
          userTokenAccount,
          eventTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([betAccount])
        .rpc();

      return betAccount.publicKey.toString();
    } catch (error) {
      console.error("Error placing bet:", error);
      throw error;
    }
  }

  async settleEvent(eventAddress: string, winningTeam: string): Promise<void> {
    try {
      const eventPubkey = new PublicKey(eventAddress);
      await this.program.methods
        .settleEvent(winningTeam)
        .accounts({
          authority: this.provider.wallet.publicKey,
          event: eventPubkey,
        })
        .rpc();
    } catch (error) {
      console.error("Error settling event:", error);
      throw error;
    }
  }

  private async getTokenAccount(
    eventAddress: PublicKey,
    isUser: boolean
  ): Promise<PublicKey> {
    // Derive token account address from event address and user flag
    const seed = isUser ? "user_token" : "event_token";
    const [tokenAccount] = await PublicKey.findProgramAddress(
      [
        Buffer.from(seed),
        eventAddress.toBuffer(),
        this.provider.wallet.publicKey.toBuffer(),
      ],
      this.program.programId
    );
    return tokenAccount;
  }
}

export const useBettingService = () => {
  const wallet = useWallet();
  const connection = new Connection(
    process.env.VITE_RPC_URL || "http://localhost:8899"
  );

  if (!wallet.connected) {
    throw new Error("Wallet not connected");
  }

  return new BettingService(connection, wallet);
};
