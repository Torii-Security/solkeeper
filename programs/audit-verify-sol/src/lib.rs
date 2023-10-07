use anchor_lang::prelude::*;

declare_id!("Ait72SouqcsR3GwpfNwQDeDzPQHLdoG1BvL7qiFb6xHe");

#[program]
pub mod audit_verify_sol {
    use super::*;

    pub fn initialize(
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

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = auditor, space = 8 + AuditInfo::INIT_SPACE)]
    pub audit_info: Account<'info, AuditInfo>,
    #[account(mut)]
    pub auditor: Signer<'info>,
    pub system_program: Program<'info, System>,
}
