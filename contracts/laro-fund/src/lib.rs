#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    NothingToClaim = 5,
}

#[contracttype]
pub enum DataKey {
    Admin,
    UsdcAsset,
    EquityAsset,
    TotalRevenuePerShare,
    TotalShares,
    UserLastRevenueShare(Address),
}

#[contract]
pub struct LaroFundContract;

const PRECISION: i128 = 1_000_000_000;

#[contractimpl]
impl LaroFundContract {
    /// Initialize the contract with the admin, USDC asset, Game Equity asset, and total shares.
    pub fn init(env: Env, admin: Address, usdc_asset: Address, equity_asset: Address, total_shares: i128) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        if total_shares <= 0 {
            return Err(Error::InvalidAmount);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::UsdcAsset, &usdc_asset);
        env.storage().instance().set(&DataKey::EquityAsset, &equity_asset);
        env.storage().instance().set(&DataKey::TotalShares, &total_shares);
        env.storage().instance().set(&DataKey::TotalRevenuePerShare, &0i128);
        Ok(())
    }

    /// Developer distributes revenue (USDC) to the contract.
    pub fn distribute(env: Env, amount: i128) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();

        let usdc_asset: Address = env.storage().instance().get(&DataKey::UsdcAsset).unwrap();
        let total_shares: i128 = env.storage().instance().get(&DataKey::TotalShares).unwrap();
        
        let usdc_client = token::Client::new(&env, &usdc_asset);

        // Pull USDC from admin to this contract
        usdc_client.transfer(&admin, &env.current_contract_address(), &amount);

        // Calculate revenue per share
        let added_revenue_per_share = (amount * PRECISION) / total_shares;
        let current_total: i128 = env.storage().instance().get(&DataKey::TotalRevenuePerShare).unwrap_or(0);
        
        env.storage().instance().set(&DataKey::TotalRevenuePerShare, &(current_total + added_revenue_per_share));
        
        Ok(())
    }

    /// Backers claim their share of the revenue based on their equity token balance.
    pub fn claim(env: Env, user: Address) -> Result<i128, Error> {
        user.require_auth();

        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }

        let usdc_asset: Address = env.storage().instance().get(&DataKey::UsdcAsset).unwrap();
        let equity_asset: Address = env.storage().instance().get(&DataKey::EquityAsset).unwrap();
        let total_revenue_per_share: i128 = env.storage().instance().get(&DataKey::TotalRevenuePerShare).unwrap();

        let equity_client = token::Client::new(&env, &equity_asset);
        let user_balance = equity_client.balance(&user);

        if user_balance == 0 {
            return Err(Error::NothingToClaim);
        }

        let last_seen: i128 = env.storage().persistent().get(&DataKey::UserLastRevenueShare(user.clone())).unwrap_or(0);
        
        if total_revenue_per_share <= last_seen {
            return Err(Error::NothingToClaim);
        }

        let claimable = (user_balance * (total_revenue_per_share - last_seen)) / PRECISION;

        if claimable <= 0 {
            return Err(Error::NothingToClaim);
        }

        // Send USDC to user
        let usdc_client = token::Client::new(&env, &usdc_asset);
        usdc_client.transfer(&env.current_contract_address(), &user, &claimable);

        // Update last seen
        env.storage().persistent().set(&DataKey::UserLastRevenueShare(user), &total_revenue_per_share);

        Ok(claimable)
    }

    /// Read the current state for the UI.
    pub fn get_info(env: Env, user: Option<Address>) -> (i128, i128, i128) {
        let total_revenue_per_share: i128 = env.storage().instance().get(&DataKey::TotalRevenuePerShare).unwrap_or(0);
        let mut claimable = 0;
        let mut user_balance = 0;

        if let Some(u) = user {
            if let Some(equity_asset) = env.storage().instance().get::<DataKey, Address>(&DataKey::EquityAsset) {
                let equity_client = token::Client::new(&env, &equity_asset);
                user_balance = equity_client.balance(&u);
                
                let last_seen: i128 = env.storage().persistent().get(&DataKey::UserLastRevenueShare(u)).unwrap_or(0);
                if total_revenue_per_share > last_seen {
                    claimable = (user_balance * (total_revenue_per_share - last_seen)) / PRECISION;
                }
            }
        }

        (total_revenue_per_share, user_balance, claimable)
    }
}

mod test;
