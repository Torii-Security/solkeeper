use solana_program_test::*;

use audit_verify_sol;

use anchor_client::anchor_lang::{InstructionData, ToAccountMetas};
use anchor_client::solana_sdk::{
    account::Account,
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    system_program,
    transaction::Transaction,
};

pub const PLATFORM_CONFIG_SEED: &'static [u8; 8] = b"platform";
pub const AUDITOR_SEED: &'static [u8; 8] = b"auditors";
pub const FEE_VAULT: &'static [u8; 8] = b"feevault";

#[tokio::test]
async fn happy_flow() {
    let mut program = ProgramTest::new(
        "audit_verify_sol",
        audit_verify_sol::id(),
        // the entrypoint function is generated by the #[program] macro
        processor!(audit_verify_sol::entry),
    );

    let auditor = Keypair::new();
    let owner = Keypair::new();
    let audit_info_acc = Keypair::new();

    program.add_account(
        auditor.pubkey(),
        Account {
            lamports: 100_000_000_000,
            ..Account::default()
        },
    );

    program.add_account(
        owner.pubkey(),
        Account {
            lamports: 1_000_000_000,
            ..Account::default()
        },
    );

    let (platform_config_info, _) =
        Pubkey::find_program_address(&[PLATFORM_CONFIG_SEED], &audit_verify_sol::id());

    let (auditor_info, _) = Pubkey::find_program_address(
        &[AUDITOR_SEED, auditor.pubkey().as_ref()],
        &audit_verify_sol::id(),
    );

    let (fee_vault_info, fee_acc_bump) =
        Pubkey::find_program_address(&[FEE_VAULT], &audit_verify_sol::id());

    let escrow_amount = 5_000_000_000; // 1 SOL
    let fee = 100_000_000; // 0.1 SOL
    let timelock = 5 * 86400; // 5 days
    let verifiers = [owner.pubkey(); 5];

    let (mut banks_client, payer_keypair, recent_blockhash) = program.start().await;

    let init = Instruction {
        program_id: audit_verify_sol::id(),
        data: audit_verify_sol::instruction::InitializePlatform {
            escrow_amount,
            fee,
            timelock,
            verifiers,
        }
        .data(),
        accounts: audit_verify_sol::accounts::InitializePlatform {
            platform_config_info,
            owner: owner.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    };

    let mut init_tx = Transaction::new_with_payer(&[init], Some(&owner.pubkey()));

    init_tx.partial_sign(&[&owner], recent_blockhash);

    banks_client.process_transaction(init_tx).await.unwrap();

    let name: String = String::from("Torii");
    let url: String = String::from("https://torii.wtf");

    let init_auditor = Instruction {
        program_id: audit_verify_sol::id(),
        data: audit_verify_sol::instruction::InitializeAuditor { name, url }.data(),
        accounts: audit_verify_sol::accounts::InitializeAuditor {
            platform_config_info,
            auditor_info,
            fee_vault_info,
            auditor: auditor.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    };

    let mut init_tx = Transaction::new_with_payer(&[init_auditor], Some(&auditor.pubkey()));

    init_tx.partial_sign(&[&auditor], recent_blockhash);

    banks_client.process_transaction(init_tx).await.unwrap();

    let withdraw_fee = Instruction {
        program_id: audit_verify_sol::id(),
        data: audit_verify_sol::instruction::WithdrawFee { bump: fee_acc_bump }.data(),
        accounts: audit_verify_sol::accounts::WithdrawFee {
            platform_config_info,
            fee_vault_info,
            owner: owner.pubkey(),
            receiver: owner.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    };

    let mut init_tx = Transaction::new_with_payer(&[withdraw_fee], Some(&owner.pubkey()));

    init_tx.partial_sign(&[&owner], recent_blockhash);

    banks_client.process_transaction(init_tx).await.unwrap();
}
