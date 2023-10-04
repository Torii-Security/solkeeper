use anchor_lang::prelude::*;

declare_id!("ChUtZ8gRfjWvnN6WXCeqKACKk54Nu1fvLdwF567sjeXs");

#[program]
pub mod audit_verify_sol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
