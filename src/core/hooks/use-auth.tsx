
// DEPRECATED: This file conflicts with the main auth system
// The main auth system is in src/hooks/use-auth.tsx
// This file is kept for reference only - DO NOT USE

export const useAuth = () => {
  throw new Error('This auth hook is deprecated. Use the main auth system from src/hooks/use-auth.tsx');
};

export const AuthProvider = () => {
  throw new Error('This AuthProvider is deprecated. Use the main auth system from src/hooks/use-auth.tsx');
};
