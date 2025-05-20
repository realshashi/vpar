use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

mod utils;
use utils::create_token;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod betting {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        team_a: String,
        team_b: String,
        start_time: i64,
        odds_a: u64,
        odds_b: u64,
        description: String,
        category: String,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        event.authority = ctx.accounts.authority.key();
        event.team_a = team_a;
        event.team_b = team_b;
        event.start_time = start_time;
        event.odds_a = odds_a;
        event.odds_b = odds_b;
        event.description = description;
        event.category = category;
        event.status = "upcoming".to_string();
        event.created_at = Clock::get()?.unix_timestamp;

        // Create tokens for both teams
        let team_a_token = create_token(
            ctx.accounts.authority.to_account_info(),
            &format!("{} Token", team_a),
            &format!("{}", team_a.chars().take(3).collect::<String>().to_uppercase()),
            9,
            1_000_000_000,
        )?;

        let team_b_token = create_token(
            ctx.accounts.authority.to_account_info(),
            &format!("{} Token", team_b),
            &format!("{}", team_b.chars().take(3).collect::<String>().to_uppercase()),
            9,
            1_000_000_000,
        )?;

        event.token_a = team_a_token;
        event.token_b = team_b_token;

        Ok(())
    }

    pub fn update_event(
        ctx: Context<UpdateEvent>,
        name: Option<String>,
        description: Option<String>,
        start_time: Option<i64>,
        odds_a: Option<u64>,
        odds_b: Option<u64>,
        status: Option<String>,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        require!(
            event.authority == ctx.accounts.authority.key(),
            BettingError::Unauthorized
        );

        if let Some(name) = name {
            event.name = name;
        }
        if let Some(description) = description {
            event.description = description;
        }
        if let Some(start_time) = start_time {
            event.start_time = start_time;
        }
        if let Some(odds_a) = odds_a {
            event.odds_a = odds_a;
        }
        if let Some(odds_b) = odds_b {
            event.odds_b = odds_b;
        }
        if let Some(status) = status {
            event.status = status;
        }

        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        team: String,
    ) -> Result<()> {
        let event = &ctx.accounts.event;
        require!(
            event.status == "upcoming" || event.status == "live",
            BettingError::EventNotActive
        );

        let bet = &mut ctx.accounts.bet;
        bet.authority = ctx.accounts.authority.key();
        bet.event = event.key();
        bet.amount = amount;
        bet.team = team;
        bet.created_at = Clock::get()?.unix_timestamp;

        // Transfer tokens from user to event
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.event_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        Ok(())
    }

    pub fn settle_event(
        ctx: Context<SettleEvent>,
        winning_team: String,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        require!(
            event.authority == ctx.accounts.authority.key(),
            BettingError::Unauthorized
        );
        require!(
            event.status == "live",
            BettingError::EventNotActive
        );

        event.status = "completed".to_string();
        event.winning_team = Some(winning_team);

        // Distribute winnings to bettors
        // TODO: Implement distribution logic

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = Event::LEN
    )]
    pub event: Account<'info, Event>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateEvent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub event: Account<'info, Event>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(
        init,
        payer = authority,
        space = Bet::LEN
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub event_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SettleEvent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub event: Account<'info, Event>,
}

#[account]
pub struct Event {
    pub authority: Pubkey,
    pub name: String,
    pub team_a: String,
    pub team_b: String,
    pub start_time: i64,
    pub odds_a: u64,
    pub odds_b: u64,
    pub description: String,
    pub category: String,
    pub status: String,
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub winning_team: Option<String>,
    pub created_at: i64,
}

#[account]
pub struct Bet {
    pub authority: Pubkey,
    pub event: Pubkey,
    pub amount: u64,
    pub team: String,
    pub created_at: i64,
}

impl Event {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        100 + // name
        100 + // team_a
        100 + // team_b
        8 + // start_time
        8 + // odds_a
        8 + // odds_b
        500 + // description
        50 + // category
        50 + // status
        32 + // token_a
        32 + // token_b
        1 + 100 + // winning_team (Option<String>)
        8; // created_at
}

impl Bet {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // event
        8 + // amount
        100 + // team
        8; // created_at
}

#[error_code]
pub enum BettingError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Event is not active")]
    EventNotActive,
} 