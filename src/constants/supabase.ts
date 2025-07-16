export const SUPABASE_CONFIG = {
  url:
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://cihuylmusthumxpuexrl.supabase.co",
  anonKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjkxMTEsImV4cCI6MjA2ODE0NTExMX0.x8hRnjkgiqDtrninQ44hn76bkHwTRLjNsiQRh4x-fPU",
  serviceRoleKey:
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ",
  projectId: "cihuylmusthumxpuexrl",
} as const;

export const TABLES = {
  RECEIPTS: "receipts",
  USERS: "users",
  CATEGORIES: "categories",
  STORES: "stores",
  ITEMS: "items",
} as const;
