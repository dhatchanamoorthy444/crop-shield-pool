# Secure Password Reset with OTP

Implement a secure forgot password flow that requires OTP verification before allowing a password reset. This prevents unauthorized reset attempts and adds a layer of identity verification.

## User-facing changes
- **OTP Verification UI**: A new screen or modal to enter the 6-digit OTP sent to the user's email.
- **Enhanced Forgot Password Flow**: Users will now receive an OTP and must verify it before being redirected to the password reset page.
- **Improved Feedback**: Clear messages indicating that an OTP has been sent and whether the verification was successful.

## Technical details
- **Supabase Auth OTP**: Utilize `supabase.auth.signInWithOtp` with the `shouldCreateUser: false` option to send a secure verification code, or use `resetPasswordForEmail` combined with a custom OTP verification step if needed. *Correction*: Supabase `resetPasswordForEmail` sends a link. To use an OTP, we can use `supabase.auth.verifyOtp` with `type: 'recovery'`.
- **Database Tracking**: Use the existing `audit_logs` table to track OTP requests and verification attempts.
- **Frontend State Management**: Manage the "Verification Mode" in the `auth.tsx` route to switch between "Email Input" and "OTP Input".
- **Secure Redirect**: Ensure the final reset is only possible after a successful OTP verification session is established.

## Implementation Steps

### 1. Database & Security
- Add a new migration to create an `otp_verifications` table (optional, as Supabase Auth handles most of this, but useful for rate limiting reset attempts).
- Update RLS policies if necessary to allow anonymous OTP verification attempts (Supabase handles this internally).

### 2. Frontend: Auth Route Overhaul
- Modify `ForgotPasswordForm` in `src/routes/auth.tsx` to handle two states: `requesting` and `verifying`.
- Add a 6-digit input for the OTP.
- Implement `supabase.auth.verifyOtp({ email, token, type: 'recovery' })`.

### 3. Frontend: Reset Password Route
- Ensure `src/routes/reset-password.tsx` verifies that a valid recovery session exists before allowing the update.

### 4. Audit Logging
- Log `otp_requested` and `otp_verified` events to `audit_logs`.
