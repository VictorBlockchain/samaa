export type DynamicConfig = {
  environmentId?: string
}

// Mirrors app/lib/dynamic-config to support imports from `@/lib/dynamic-config`.
export const dynamicConfig: DynamicConfig = {
  environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
}