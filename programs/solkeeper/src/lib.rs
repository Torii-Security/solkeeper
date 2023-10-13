use anchor_lang::prelude::*;

declare_id!("Cg96DsFYhhd9drE77seUS3Tqg1t8GvEFwt4mACJ1SMvj");

#[program]
pub mod solkeeper {
    use super::*;
    pub const PLATFORM_CONFIG_SEED: &'static [u8; 8] = b"platform";
    pub const AUDITOR_SEED: &'static [u8; 8] = b"auditors";
    pub const FEE_VAULT: &'static [u8; 8] = b"feevault";
    pub const AUDIT_SEED: &'static [u8; 8] = b"audit123";

    
    #[error_code]
    pub enum Errors {
        #[msg("Max name length is 255")]
        NameTooLarge,
        #[msg("Max url length is 255")]
        UrlTooLarge,
        #[msg("Max summary length is 255")]
        SummaryTooLarge,
        #[msg("Insufficient Balance")]
        InsufficientBalance,
        #[msg("Too early to deactivate")]
        TooEarly,
        #[msg("Overflow")]
        Overflow
    }

    pub fn add_audit(
        ctx: Context<AddAudit>,
        audited_program_id: Pubkey, 
        audited_implementation: Pubkey,
        audit_date: i64,
        hash: [u8; 32],
        audit_file_hash: [u8; 32],
        audit_summary: String,
        audit_url: String
    ) -> Result<()> {
        let audit_info = &mut ctx.accounts.audit_info;
        let auditor_info = &mut ctx.accounts.auditor_info;

        require!(audit_summary.len() < 255, Errors::SummaryTooLarge);
        require!(audit_url.len() < 255, Errors::UrlTooLarge);

        audit_info.audited_program_id = audited_program_id;
        audit_info.audited_implementation = audited_implementation;
        audit_info.auditor = auditor_info.key();
        audit_info.audit_date = audit_date;
        audit_info.audit_url = audit_url;
        audit_info.audit_summary = audit_summary;
        audit_info.audit_file_hash = audit_file_hash;
        audit_info.hash = hash;
        auditor_info.counter = auditor_info.counter + 1;
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

    pub fn withdraw_fee(
        ctx: Context<WithdrawFee>,
        bump: u8
    ) -> Result<()> {
        let fee_vault_info = &mut ctx.accounts.fee_vault_info;
        let receiver = &mut ctx.accounts.receiver;

        let withdraw_fee_instruction = anchor_lang::solana_program::system_instruction::transfer(&fee_vault_info.key(), &receiver.key, fee_vault_info.lamports());
        anchor_lang::solana_program::program::invoke_signed(
            &withdraw_fee_instruction,
            &[
                fee_vault_info.to_account_info(),
                receiver.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&[FEE_VAULT, &[bump]]]
        )?;

        Ok(())
    }

    pub fn initialize_auditor(
        ctx: Context<InitializeAuditor>,
        name: String,
        url: String,
    ) -> Result<()> {
        let platform_config = &mut ctx.accounts.platform_config_info;
        let auditor_info = &mut ctx.accounts.auditor_info;
        let fee_vault_info = &mut ctx.accounts.fee_vault_info;
        let auditor = &mut ctx.accounts.auditor;

        let amount_to_transfer = platform_config.escrow_amount.checked_add(platform_config.fee).expect(&Errors::Overflow.to_string());

        require!(name.len() < 255, Errors::NameTooLarge);
        require!(url.len() < 255, Errors::UrlTooLarge);
        require!(auditor.lamports() > amount_to_transfer, Errors::InsufficientBalance);

        // Transfer escrow
        let transfer_escrow_instruction = anchor_lang::solana_program::system_instruction::transfer(auditor.key, &platform_config.key(), platform_config.escrow_amount);
        anchor_lang::solana_program::program::invoke(
            &transfer_escrow_instruction,
            &[
                auditor.to_account_info(),
                platform_config.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ]
        )?;

        let transfer_fee_instruction = anchor_lang::solana_program::system_instruction::transfer(auditor.key, &fee_vault_info.key(), platform_config.fee);
        anchor_lang::solana_program::program::invoke(
            &transfer_fee_instruction,
            &[
                auditor.to_account_info(),
                fee_vault_info.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ]
        )?;

        auditor_info.owner = ctx.accounts.auditor.key();
        auditor_info.escrow_amount = platform_config.escrow_amount;
        auditor_info.registration_time = Clock::get()?.unix_timestamp;
        auditor_info.name = name;
        auditor_info.url = url;
        auditor_info.is_active = true;
        auditor_info.is_verified = false;
        auditor_info.counter = 0;
        Ok(())
    }

    pub fn deactivate_auditor(
        ctx: Context<DeactivateAuditor>,
        bump: u8
    ) -> Result<()> {
        let platform_config = &mut ctx.accounts.platform_config_info;
        let auditor_info = &mut ctx.accounts.auditor_info;
        let auditor = &mut ctx.accounts.auditor;

        let amount_to_transfer =  auditor_info.escrow_amount;
        let time_now = Clock::get()?.unix_timestamp;
        let registration_time = auditor_info.registration_time;
        let timelock = platform_config.timelock;
        
        // Validate that timelock passes
        require!(registration_time.checked_add(timelock).expect(&Errors::Overflow.to_string()) < time_now, Errors::TooEarly);

        // Transfer escrow
        let transfer_escrow_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &platform_config.key(), 
            auditor.key, 
            amount_to_transfer
        );
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_escrow_instruction,
            &[
                platform_config.to_account_info(),
                auditor.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&[PLATFORM_CONFIG_SEED, &[bump]]]
        )?;
        auditor_info.is_active = false;
        Ok(())
    }

    pub fn modify_auditor_verify_status(
        ctx: Context<ModifyAuditorVerifyStatus>,
        is_verified: bool
    ) -> Result<()> {
        let auditor_info = &mut ctx.accounts.auditor_info;
        auditor_info.is_verified = is_verified;
        Ok(())
    }
    
}

#[account]
#[derive(Default)]
pub struct AuditInfo {
    audited_program_id: Pubkey, //32
    audited_implementation: Pubkey, //32
    auditor: Pubkey, // 32
    audit_date: i64, // 8
    hash: [u8; 32], //32
    audit_url: String, //255
    audit_summary: String, //255
    audit_file_hash: [u8; 32], //32
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

#[account]
#[derive(Default)]
pub struct AuditorInfo {
    name: String,
    url: String,
    owner: Pubkey,
    registration_time: i64,
    escrow_amount: u64,
    counter: u64,
    pub is_verified: bool,
    is_active: bool
}

#[derive(Accounts)]
#[instruction(audited_program_id: Pubkey, audited_implementation: Pubkey)]
pub struct AddAudit<'info> {
    #[account(
        init, 
        seeds = [
                    AUDIT_SEED, 
                    audited_program_id.as_ref(), 
                    auditor_info.key().as_ref(),
                    &auditor_info.counter.to_le_bytes()
                ], 
        payer = auditor, 
        space = 8 + 32 + 32 + 8 + 32 + 255 + 255 + 32 + 8,
        bump
    )]
    pub audit_info: Account<'info, AuditInfo>,
    #[account(
        seeds = [AUDITOR_SEED, auditor.key().as_ref()], 
        constraint = auditor_info.is_active,
        bump
    )]
    pub auditor_info: Account<'info, AuditorInfo>,
    #[account(mut)]
    pub auditor: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct InitializeAuditor<'info> {
    #[account(
        init, 
        seeds = [AUDITOR_SEED, auditor.key().as_ref()], 
        payer = auditor, 
        space = 8 + std::mem::size_of::<AuditorInfo>() + 8,
        bump
    )]
    pub auditor_info: Account<'info, AuditorInfo>,
    #[account(mut)]
    pub auditor: Signer<'info>,
    /// CHECK: Verified by PDA
    #[account(
        mut,
        seeds = [FEE_VAULT], 
        bump
    )]
    pub fee_vault_info: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [PLATFORM_CONFIG_SEED],
        bump
    )]
    pub platform_config_info: Account<'info, PlatformConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeactivateAuditor<'info> {
    #[account(
        seeds = [AUDITOR_SEED, auditor.key().as_ref()], 
        constraint = auditor_info.is_active,
        bump
    )]
    pub auditor_info: Account<'info, AuditorInfo>,
    #[account(mut)]
    pub auditor: Signer<'info>,
    #[account(
        mut,
        seeds = [PLATFORM_CONFIG_SEED],
        bump
    )]
    pub platform_config_info: Account<'info, PlatformConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ModifyAuditorVerifyStatus<'info> {
    #[account(
        mut,
        seeds = [AUDITOR_SEED, auditor.key().as_ref()], 
        bump
    )]
    pub auditor_info: Account<'info, AuditorInfo>,
     /// CHECK: Verified by PDA
    #[account(mut)]
    pub auditor: AccountInfo<'info>,
    #[account(
        seeds = [PLATFORM_CONFIG_SEED],
        constraint = platform_config_info.verifiers.iter().any(|x| *x == verifier.key()),
        bump
    )]
    pub platform_config_info: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub verifier: Signer<'info>,
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

#[derive(Accounts)]
pub struct WithdrawFee<'info> {
    #[account(
        seeds = [PLATFORM_CONFIG_SEED],
        constraint = platform_config_info.owner == owner.key(),
        bump
    )]
    pub platform_config_info: Account<'info, PlatformConfig>,
    /// CHECK: Verified by PDA
    #[account(
        mut,
        seeds = [FEE_VAULT], 
        bump
    )]
    pub fee_vault_info: AccountInfo<'info>,
     /// CHECK: Any receiver, protected as only admin can call
    #[account(mut)]
    pub receiver: AccountInfo<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

