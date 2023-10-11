export * from './AuditInfo'
export * from './AuditorInfo'
export * from './PlatformConfig'

import { AuditInfo } from './AuditInfo'
import { PlatformConfig } from './PlatformConfig'
import { AuditorInfo } from './AuditorInfo'

export const accountProviders = { AuditInfo, PlatformConfig, AuditorInfo }
