use std::collections::HashMap;
use redis::{Client, Commands, RedisError};
use reqwest;
use serde_json::Value;
use std::time::Duration;
use solana_program::pubkey::Pubkey;
use spl_token::instruction as token_instruction;
use solana_program::instruction::Instruction;
use solana_program::system_instruction;

// Define an order with price and quantity
#[derive(Debug, Clone)]
struct Order {
    price: f64,
    quantity: f64,
}

// Define an orderbook for a single outcome token
#[derive(Debug)]
struct Orderbook {
    bids: Vec<Order>, // sorted by price (highest first)
    asks: Vec<Order>, // sorted by price (lowest first)
}

impl Orderbook {
    fn new() -> Self {
        Orderbook {
            bids: Vec::new(),
            asks: Vec::new(),
        }
    }

    fn add_bid(&mut self, price: f64, quantity: f64) {
        let order = Order { price, quantity };
        self.bids.push(order);
        // Sort bids in descending order of price
        self.bids.sort_by(|a, b| b.price.partial_cmp(&a.price).unwrap());
    }

    fn add_ask(&mut self, price: f64, quantity: f64) {
        let order = Order { price, quantity };
        self.asks.push(order);
        // Sort asks in ascending order of price
        self.asks.sort_by(|a, b| a.price.partial_cmp(&b.price).unwrap());
    }

    fn get_best_bid(&self) -> Option<&Order> {
        self.bids.first()
    }

    fn get_best_ask(&self) -> Option<&Order> {
        self.asks.first()
    }
}

// Define a market that holds orderbooks for each outcome token
#[derive(Debug)]
struct Market {
    orderbooks: HashMap<String, Orderbook>,
    redis_client: Client,
}

impl Market {
    fn new(redis_url: &str) -> Result<Self, RedisError> {
        let client = Client::open(redis_url)?;
        Ok(Market {
            orderbooks: HashMap::new(),
            redis_client,
        })
    }

    fn add_outcome(&mut self, outcome: String) {
        self.orderbooks.insert(outcome, Orderbook::new());
    }

    fn get_orderbook(&self, outcome: &str) -> Option<&Orderbook> {
        self.orderbooks.get(outcome)
    }

    fn get_orderbook_mut(&mut self, outcome: &str) -> Option<&mut Orderbook> {
        self.orderbooks.get_mut(outcome)
    }

    fn save_orderbook_to_redis(&self, outcome: &str) -> Result<(), RedisError> {
        if let Some(orderbook) = self.get_orderbook(outcome) {
            let mut conn = self.redis_client.get_connection()?;
            let key = format!("orderbook:{}", outcome);
            let value = format!("{:?}", orderbook);
            conn.set(&key, value)?;
        }
        Ok(())
    }

    fn publish_update(&self, outcome: &str) -> Result<(), RedisError> {
        let mut conn = self.redis_client.get_connection()?;
        let channel = "orderbook_updates";
        let message = format!("Update for outcome: {}", outcome);
        conn.publish(channel, message)?;
        Ok(())
    }
}

// Oracle integration for polling match data
async fn poll_match_data(match_id: &str) -> Result<Value, reqwest::Error> {
    let url = format!("https://api.example.com/matches/{}", match_id);
    let response = reqwest::get(&url).await?;
    let data = response.json::<Value>().await?;
    Ok(data)
}

// Function to check if a match has ended and trigger resolution
async fn check_match_status(match_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let data = poll_match_data(match_id).await?;
    if data["status"] == "ended" {
        println!("Match {} has ended. Triggering resolution.", match_id);
        // Here you would call the smart contract's resolve_event() function
    }
    Ok(())
}

// SPL token minting functionality
fn mint_spl_token(
    mint_authority: &Pubkey,
    token_account: &Pubkey,
    amount: u64,
) -> Instruction {
    token_instruction::mint_to(
        &spl_token::id(),
        mint_authority,
        token_account,
        mint_authority,
        &[],
        amount,
    )
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut market = Market::new("redis://127.0.0.1/")?;
    market.add_outcome("Team A Wins".to_string());
    market.add_outcome("Team B Wins".to_string());

    if let Some(orderbook) = market.get_orderbook_mut("Team A Wins") {
        orderbook.add_bid(1.5, 100.0);
        orderbook.add_ask(1.6, 50.0);
    }

    market.save_orderbook_to_redis("Team A Wins")?;
    market.publish_update("Team A Wins")?;

    if let Some(orderbook) = market.get_orderbook("Team A Wins") {
        println!("Best bid: {:?}", orderbook.get_best_bid());
        println!("Best ask: {:?}", orderbook.get_best_ask());
    }

    // Poll match data for a specific match
    let match_id = "12345";
    check_match_status(match_id).await?;

    // Example of minting SPL tokens
    let mint_authority = Pubkey::new_unique();
    let token_account = Pubkey::new_unique();
    let amount = 1000;
    let mint_instruction = mint_spl_token(&mint_authority, &token_account, amount);
    println!("Mint instruction: {:?}", mint_instruction);

    Ok(())
} 