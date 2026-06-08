#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _};
use soroban_sdk::{token, Address, Env};

#[test]
fn test_revenue_share() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    let usdc_id = env.register_stellar_asset_contract_v2(Address::generate(&env)).address();
    let usdc_client = token::StellarAssetClient::new(&env, &usdc_id);
    
    let equity_id = env.register_stellar_asset_contract_v2(Address::generate(&env)).address();
    let equity_client = token::StellarAssetClient::new(&env, &equity_id);

    let contract_id = env.register(LaroFundContract, ());
    let client = LaroFundContractClient::new(&env, &contract_id);

    client.init(&admin, &usdc_id, &equity_id, &100);

    // Setup initial equity: user1 has 60, user2 has 40. Total 100.
    equity_client.mint(&user1, &60);
    equity_client.mint(&user2, &40);

    // Setup admin with some USDC
    usdc_client.mint(&admin, &1000);

    // Distribute 100 USDC revenue
    client.distribute(&100);

    // Check claimable amounts
    let info1 = client.get_info(&Some(user1.clone()));
    assert_eq!(info1.2, 60); // 60% of 100

    let info2 = client.get_info(&Some(user2.clone()));
    assert_eq!(info2.2, 40); // 40% of 100

    // Claim
    let claimed1 = client.claim(&user1);
    assert_eq!(claimed1, 60);
    
    let claimed2 = client.claim(&user2);
    assert_eq!(claimed2, 40);

    // Distribute more revenue: 50 USDC
    client.distribute(&50);

    let info1_after = client.get_info(&Some(user1.clone()));
    assert_eq!(info1_after.2, 30); // 60% of 50

    let info2_after = client.get_info(&Some(user2.clone()));
    assert_eq!(info2_after.2, 20); // 40% of 50
}
