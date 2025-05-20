use std::collections::HashMap;
use redis::{Client, Commands, RedisError};
use reqwest;
use serde_json::Value;
use solana_program::pubkey::Pubkey;
use spl_token::instruction as token_instruction;
use solana_program::instruction::Instruction;
use serde::{Serialize, Deserialize};

// Define an order with price and quantity
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Order {
    price: f64,
    quantity: f64,
}

// Define an orderbook for a single outcome token
#[derive(Debug, Serialize, Deserialize)]
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
            redis_client: client,
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
            let value = serde_json::to_string(orderbook).unwrap();
            conn.set::<_, _, ()>(&key, value)?;
        }
        Ok(())
    }

    fn publish_update(&self, outcome: &str) -> Result<(), RedisError> {
        let mut conn = self.redis_client.get_connection()?;
        let channel = "orderbook_updates";
        let message = serde_json::to_string(&outcome).unwrap();
        conn.publish::<_, _, ()>(channel, message)?;
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
    ).expect("Failed to create mint instruction")
}

struct OrderbookEngine {
    redis_client: Client,
}

impl OrderbookEngine {
    fn new(redis_url: &str) -> Result<Self, RedisError> {
        let client = Client::open(redis_url)?;
        Ok(OrderbookEngine {
            redis_client: client,
        })
    }

    fn save_orderbook_to_redis(&self, outcome: &str) -> Result<(), RedisError> {
        let mut conn = self.redis_client.get_connection()?;
        let key = format!("orderbook:{}", outcome);
        let value = serde_json::to_string(&outcome).unwrap();
        conn.set::<_, _, ()>(&key, value)?;
        Ok(())
    }

    fn publish_update(&self, outcome: &str) -> Result<(), RedisError> {
        let mut conn = self.redis_client.get_connection()?;
        let channel = "orderbook_updates";
        let message = serde_json::to_string(&outcome).unwrap();
        conn.publish::<_, _, ()>(channel, message)?;
        Ok(())
    }
}

fn create_mint_to_instruction(
    mint_authority: &Pubkey,
    token_account: &Pubkey,
    mint: &Pubkey,
    amount: u64,
) -> Instruction {
    token_instruction::mint_to(
        &spl_token::id(),
        mint_authority,
        token_account,
        mint,
        &[],
        amount,
    ).expect("Failed to create mint instruction")
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let mut market = Market::new(&redis_url)?;
    
    // Add some test outcomes
    market.add_outcome("Team A Wins".to_string());
    market.add_outcome("Team B Wins".to_string());

    // Add some test orders
    if let Some(orderbook) = market.get_orderbook_mut("Team A Wins") {
        orderbook.add_bid(1.5, 100.0);
        orderbook.add_ask(1.6, 50.0);
    }

    // Save and publish updates
    market.save_orderbook_to_redis("Team A Wins")?;
    market.publish_update("Team A Wins")?;

    println!("Orderbook engine started");
    Ok(())
} 