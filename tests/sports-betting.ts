import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SportsBetting } from "../target/types/sports_betting";
import { expect } from "chai";

describe("sports-betting", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SportsBetting as Program<SportsBetting>;

  it("Creates an event", async () => {
    const eventId = "EVENT_1";
    const [eventPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("event"), Buffer.from(eventId)],
      program.programId
    );

    await program.methods
      .createEvent(
        eventId,
        "Team A",
        "Team B",
        new anchor.BN(Date.now() / 1000),
        new anchor.BN(150),
        new anchor.BN(180)
      )
      .accounts({
        event: eventPda,
        admin: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const event = await program.account.event.fetch(eventPda);
    expect(event.teamA).to.equal("Team A");
    expect(event.teamB).to.equal("Team B");
    expect(event.isResolved).to.equal(false);
  });
});