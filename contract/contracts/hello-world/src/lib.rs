#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Bytes, String, Env, Vec};

#[contract]
pub struct SimpleNFT;

#[contracttype]
pub enum DataKey {
    Owner(i128),
    TokenCount,
    Approvals(i128),
}

#[contractimpl]
impl SimpleNFT {
    const SUPPLY: i128 = 100;
    const NAME: &'static str = "SimpleNFT";
    const SYMBOL: &'static str = "SNFT";
    const METADATA: &'static str = "https://ipfs.io/ipfs/YOUR_METADATA_HASH";
    const IMAGE: &'static str = "https://ipfs.io/ipfs/YOUR_IMAGE_HASH";

    pub fn owner_of(env: Env, token_id: i128) -> Address {
        env.storage().persistent().get(&DataKey::Owner(token_id)).unwrap_or_else(|| {
            Address::from_string_bytes(&Bytes::from_slice(&env, &[0; 32]))
        })
    }

    pub fn name(env: Env) -> String {
        String::from_str(&env, Self::NAME)
    }

    pub fn symbol(env: Env) -> String {
        String::from_str(&env, Self::SYMBOL)
    }

    pub fn token_uri(env: Env) -> String {
        String::from_str(&env, Self::METADATA)
    }

    pub fn token_image(env: Env) -> String {
        String::from_str(&env, Self::IMAGE)
    }

    pub fn mint(env: Env, to: Address) {
        let mut token_count: i128 = env.storage().persistent().get(&DataKey::TokenCount).unwrap_or(0);
        assert!(token_count < Self::SUPPLY, "Maximum token supply reached");
        token_count += 1;
        env.storage().persistent().set(&DataKey::TokenCount, &token_count);
        env.storage().persistent().set(&DataKey::Owner(token_count), &to);
        env.events().publish((symbol_short!("Mint"),), (to, token_count));
    }

    pub fn transfer(env: Env, owner: Address, to: Address, token_id: i128) {
        owner.require_auth();
        let actual_owner = Self::owner_of(env.clone(), token_id);
        if owner == actual_owner {
            env.storage().persistent().set(&DataKey::Owner(token_id), &to);
            env.storage().persistent().remove(&DataKey::Approvals(token_id));
            env.events().publish((symbol_short!("Transfer"),), (owner, to, token_id));
        } else {
            panic!("Not the token owner");
        }
    }
}
