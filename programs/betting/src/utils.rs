use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

pub fn create_token(
    authority: AccountInfo,
    name: &str,
    symbol: &str,
    decimals: u8,
    initial_supply: u64,
) -> Result<Pubkey> {
    // Create mint account
    let mint_account = Keypair::new();
    let mint_rent = Rent::get()?.minimum_balance(Mint::LEN);
    
    let create_mint_ix = anchor_lang::solana_program::system_instruction::create_account(
        &authority.key(),
        &mint_account.pubkey(),
        mint_rent,
        Mint::LEN as u64,
        &token::ID,
    );

    // Initialize mint
    let init_mint_ix = token::instruction::initialize_mint(
        &token::ID,
        &mint_account.pubkey(),
        &authority.key(),
        Some(&authority.key()),
        decimals,
    )?;

    // Create token account for authority
    let token_account = Keypair::new();
    let token_rent = Rent::get()?.minimum_balance(TokenAccount::LEN);
    
    let create_token_ix = anchor_lang::solana_program::system_instruction::create_account(
        &authority.key(),
        &token_account.pubkey(),
        token_rent,
        TokenAccount::LEN as u64,
        &token::ID,
    );

    // Initialize token account
    let init_token_ix = token::instruction::initialize_account(
        &token::ID,
        &token_account.pubkey(),
        &mint_account.pubkey(),
        &authority.key(),
    )?;

    // Mint initial supply
    let mint_to_ix = token::instruction::mint_to(
        &token::ID,
        &mint_account.pubkey(),
        &token_account.pubkey(),
        &authority.key(),
        &[],
        initial_supply,
    )?;

    // Execute instructions
    let instructions = vec![
        create_mint_ix,
        init_mint_ix,
        create_token_ix,
        init_token_ix,
        mint_to_ix,
    ];

    for ix in instructions {
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                authority.clone(),
                mint_account.to_account_info(),
                token_account.to_account_info(),
            ],
        )?;
    }

    Ok(mint_account.pubkey())
} 