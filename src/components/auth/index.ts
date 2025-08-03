/**
 * Auth components barrel exports
 * Centralizes auth component exports for easier imports
 */

export { AuthGuard, GuestGuard, withAuthGuard, withGuestGuard } from './AuthGuard';
export { AuthStatus, UserProfile } from './AuthStatus';
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';

// Re-export auth context and hook for convenience
export { useAuth, AuthProvider, AuthContext } from '@/contexts/AuthContext';