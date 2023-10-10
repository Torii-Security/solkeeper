use anchor_lang::prelude::*;

declare_id!("Ait72SouqcsR3GwpfNwQDeDzPQHLdoG1BvL7qiFb6xHe");

#[program]
pub mod audit_verify_sol {
    use super::*;
    pub const PLATFORM_CONFIG_SEED: &'static [u8; 8] = b"platform";

    pub fn initialize_audit(
        ctx: Context<Initialize>,
        audited_program_id: Pubkey,
        audit_date: i64,
        hash: [u8; 32],
    ) -> Result<()> {
        let audit_info = &mut ctx.accounts.audit_info;
        audit_info.audited_program_id = audited_program_id;
        audit_info.auditor = ctx.accounts.auditor.key();
        audit_info.audit_date = audit_date;
        audit_info.entry_creation_date = Clock::get().unwrap().unix_timestamp;
        audit_info.hash = hash;
        Ok(())
    }

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        escrow_amount: u64,
        fee: u64,
        timelock: i64,
        verifiers: [Pubkey; 5],
    ) -> Result<()> {
        let platform_config = &mut ctx.accounts.platform_config_info;
        platform_config.owner = ctx.accounts.owner.key();
        platform_config.escrow_amount = escrow_amount;
        platform_config.timelock = timelock;
        platform_config.verifiers = verifiers;
        platform_config.fee = fee;
        Ok(())
    }

    pub fn update_platform(
        ctx: Context<UpdatePlatform>,
        escrow_amount: u64,
        fee: u64,
        timelock: i64,
        verifiers: [Pubkey; 5],
        new_owner: Pubkey
    ) -> Result<()> {
        let platform_config = &mut ctx.accounts.platform_config_info;
        platform_config.owner = new_owner;
        platform_config.escrow_amount = escrow_amount;
        platform_config.timelock = timelock;
        platform_config.verifiers = verifiers;
        platform_config.fee = fee;
        Ok(())
    }
}

#[account]
#[derive(Default, InitSpace)]
pub struct AuditInfo {
    audited_program_id: Pubkey,
    auditor: Pubkey,
    audit_date: i64,
    entry_creation_date: i64,
    hash: [u8; 32],
}

#[account]
#[derive(Default, InitSpace)]
pub struct PlatformConfig {
    escrow_amount: u64,
    fee: u64,
    timelock: i64,
    verifiers: [Pubkey; 5],
    owner: Pubkey
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = auditor, space = 8 + AuditInfo::INIT_SPACE)]
    pub audit_info: Account<'info, AuditInfo>,
    #[account(mut)]
    pub auditor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init, 
        seeds = [PLATFORM_CONFIG_SEED], 
        payer = owner, 
        space = 8 + PlatformConfig::INIT_SPACE, 
        bump
    )]
    pub platform_config_info: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlatform<'info> {
    #[account(
        seeds = [PLATFORM_CONFIG_SEED],
        constraint = platform_config_info.owner == owner.key(),
        bump
    )]
    pub platform_config_info: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

