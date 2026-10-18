-- The browser registry remains available for session checks and optional admin sign-out,
-- but a student may register any number of browsers after OTP or PIN authentication.
comment on table public.hs_student_devices is
  'Server-only list of browsers registered for a student after parent email OTP or student PIN authentication. No per-student browser count limit. Stores only a hash of a random browser id.';
