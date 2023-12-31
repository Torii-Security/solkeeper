use anchor_lang::prelude::Clock;
use anchor_lang::AccountDeserialize;
use solana_program_test::*;

use solkeeper::{self, AuditorInfo};

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
pub const AUDIT_SEED: &'static [u8; 8] = b"audit123";

#[tokio::test]
async fn happy_flow() {
    let mut program = ProgramTest::new(
        "solkeeper",
        solkeeper::id(),
        // the entrypoint function is generated by the #[program] macro
        processor!(solkeeper::entry),
    );

    let auditor = Keypair::new();
    let owner = Keypair::new();

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

    let audited_program_id = Pubkey::new_unique();
    let audited_implementation = Pubkey::new_unique();

    let (platform_config_info, _) =
        Pubkey::find_program_address(&[PLATFORM_CONFIG_SEED], &solkeeper::id());

    let (auditor_info, _) =
        Pubkey::find_program_address(&[AUDITOR_SEED, auditor.pubkey().as_ref()], &solkeeper::id());

    let (audit_info, _) = Pubkey::find_program_address(
        &[
            AUDIT_SEED,
            audited_program_id.as_ref(),
            auditor_info.as_ref(),
            &0u64.to_le_bytes(),
        ],
        &solkeeper::id(),
    );

    let (fee_vault_info, fee_acc_bump) =
        Pubkey::find_program_address(&[FEE_VAULT], &solkeeper::id());

    let escrow_amount = 5_000_000_000; // 1 SOL
    let fee = 100_000_000; // 0.1 SOL
    let timelock = 5 * 86400; // 5 days
    let verifiers = [owner.pubkey(); 5];

    let (mut banks_client, payer_keypair, recent_blockhash) = program.start().await;

    let init = Instruction {
        program_id: solkeeper::id(),
        data: solkeeper::instruction::InitializePlatform {
            escrow_amount,
            fee,
            timelock,
            verifiers,
        }
        .data(),
        accounts: solkeeper::accounts::InitializePlatform {
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
        program_id: solkeeper::id(),
        data: solkeeper::instruction::InitializeAuditor { name, url }.data(),
        accounts: solkeeper::accounts::InitializeAuditor {
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
        program_id: solkeeper::id(),
        data: solkeeper::instruction::WithdrawFee { bump: fee_acc_bump }.data(),
        accounts: solkeeper::accounts::WithdrawFee {
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

    let modify_auditor_status = Instruction {
        program_id: solkeeper::id(),
        data: solkeeper::instruction::ModifyAuditorVerifyStatus { is_verified: true }.data(),
        accounts: solkeeper::accounts::ModifyAuditorVerifyStatus {
            platform_config_info,
            verifier: owner.pubkey(),
            auditor_info,
            auditor: auditor.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    };

    let mut init_tx = Transaction::new_with_payer(&[modify_auditor_status], Some(&owner.pubkey()));

    init_tx.partial_sign(&[&owner], recent_blockhash);

    banks_client.process_transaction(init_tx).await.unwrap();

    let auditor_account_data = banks_client
        .get_account(auditor_info)
        .await
        .unwrap()
        .unwrap();

    let auditor_deser = AuditorInfo::try_deserialize(&mut auditor_account_data.data.as_ref())
        .map_err(|_| BanksClientError::ClientError("Failed to deserialize account"))
        .unwrap();

    assert_eq!(auditor_deser.is_verified, true);

    let add_audit = Instruction {
        program_id: solkeeper::id(),
        data: solkeeper::instruction::AddAudit {
            audited_program_id,
            audited_implementation,
            audit_date: 1000000000000000,
            hash: [10; 32],
            audit_file_hash: [10; 32],
            audit_summary: String::from("LGTM"),
            audit_url: String::from("Link to file"),
        }
        .data(),
        accounts: solkeeper::accounts::AddAudit {
            audit_info,
            auditor_info,
            auditor: auditor.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    };

    let mut init_tx = Transaction::new_with_payer(&[add_audit], Some(&auditor.pubkey()));

    init_tx.partial_sign(&[&auditor], recent_blockhash);

    banks_client.process_transaction(init_tx).await.unwrap();
}
