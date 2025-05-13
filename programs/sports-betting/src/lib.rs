use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("Bet1111111111111111111111111111111111111111");

#[program]
pub mod sports_betting {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        event_id: String,
        team_a: String,
        team_b: String,
        start_time: i64,
        initial_odds_a: u64,
        initial_odds_b: u64,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        event.admin = ctx.accounts.admin.key();
        event.event_id = event_id;
        event.team_a = team_a;
        event.team_b = team_b;
        event.start_time = start_time;
        event.odds_a = initial_odds_a;
        event.odds_b = initial_odds_b;
        event.is_resolved = false;
        event.winner = None;
        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        team: String,
    ) -> Result<()> {
        require!(
            !ctx.accounts.event.is_resolved,
            BettingError::EventAlreadyResolved
        );

        let transfer_ix = token::Transfer {
            from: ctx.accounts.better_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.better.to_account_info(),
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_ix,
            ),
            amount,
        )?;

        let bet = &mut ctx.accounts.bet;
        bet.better = ctx.accounts.better.key();
        bet.event = ctx.accounts.event.key();
        bet.amount = amount;
        bet.team = team;
        bet.claimed = false;

        Ok(())
    }

    pub fn resolve_event(
        ctx: Context<ResolveEvent>,
        winner: String,
    ) -> Result<()> {
        require!(
            !ctx.accounts.event.is_resolved,
            BettingError::EventAlreadyResolved
        );
        require!(
            ctx.accounts.admin.key() == ctx.accounts.event.admin,
            BettingError::Unauthorized
        );

        let event = &mut ctx.accounts.event;
        event.is_resolved = true;
        event.winner = Some(winner);

        Ok(())
    }

    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        let event = &ctx.accounts.event;
        let bet = &mut ctx.accounts.bet;

        require!(
            event.is_resolved,
            BettingError::EventNotResolved
        );
        require!(
            !bet.claimed,
            BettingError::RewardAlreadyClaimed
        );
        require!(
            bet.team == event.winner.clone().unwrap(),
            BettingError::NotAWinner
        );

        let seeds = &[
            b"vault",
            event.to_account_info().key.as_ref(),
            &[ctx.bumps.vault],
        ];
        let signer = &[&seeds[..]];

        let transfer_ix = token::Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.better_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_ix,
                signer,
            ),
            bet.amount.checked_mul(2).unwrap(),
        )?;

        bet.claimed = true;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(event_id: String)]
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 1 + 32,
        seeds = [b"event", event_id.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(
        init,
        payer = better,
        space = 8 + 32 + 32 + 8 + 32 + 1,
        seeds = [b"bet", event.key().as_ref(), better.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub better: Signer<'info>,
    #[account(mut)]
    pub better_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", event.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveEvent<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        seeds = [b"bet", event.key().as_ref(), better.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    pub better: Signer<'info>,
    #[account(mut)]
    pub better_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", event.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Event {
    pub admin: Pubkey,
    pub event_id: String,
    pub team_a: String,
    pub team_b: String,
    pub start_time: i64,
    pub odds_a: u64,
    pub odds_b: u64,
    pub is_resolved: bool,
    pub winner: Option<String>,
}

#[account]
pub struct Bet {
    pub better: Pubkey,
    pub event: Pubkey,
    pub amount: u64,
    pub team: String,
    pub claimed: bool,
}

#[error_code]
pub enum BettingError {
    #[msg("Event is already resolved")]
    EventAlreadyResolved,
    #[msg("Event is not resolved yet")]
    EventNotResolved,
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Reward already claimed")]
    RewardAlreadyClaimed,
    #[msg("Not a winner")]
    NotAWinner,
}