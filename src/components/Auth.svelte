<script>
  import { supabase } from '../lib/supabase.js';
  
  let { onAuthSuccess } = $props();
  
  let isLogin = $state(true);
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let loading = $state(false);
  let error = $state('');
  let success = $state('');
  let emailError = $state('');
  let passwordError = $state('');
  
  // Email validation
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Password validation
  function validatePassword(password) {
    return password.length >= 6;
  }
  
  // Real-time validation
  $effect(() => {
    if (email && !validateEmail(email)) {
      emailError = 'Please enter a valid email address';
    } else {
      emailError = '';
    }
    
    if (password && !validatePassword(password)) {
      passwordError = 'Password must be at least 6 characters long';
    } else {
      passwordError = '';
    }
  });
  
  async function handleAuth() {
    // Reset states
    error = '';
    success = '';
    emailError = '';
    passwordError = '';
    
    // Validation
    if (!email.trim() || !password.trim()) {
      error = 'Please fill in all fields';
      return;
    }
    
    if (!validateEmail(email)) {
      emailError = 'Please enter a valid email address';
      return;
    }
    
    if (!validatePassword(password)) {
      passwordError = 'Password must be at least 6 characters long';
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    loading = true;
    
    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        
        if (authError) {
          // Handle specific auth errors
          if (authError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (authError.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the confirmation link before signing in.');
          } else {
            throw authError;
          }
        }
        
        if (data.user) {
          success = 'Successfully signed in!';
          setTimeout(() => onAuthSuccess(data.user), 500);
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password
        });
        
        if (authError) {
          // Handle specific signup errors
          if (authError.message.includes('User already registered')) {
            throw new Error('An account with this email already exists. Please try signing in instead.');
          } else if (authError.message.includes('Password should be at least')) {
            throw new Error('Password is too weak. Please choose a stronger password.');
          } else {
            throw authError;
          }
        }
        
        if (data.user) {
          if (data.user.email_confirmed_at) {
            success = 'Account created successfully!';
            setTimeout(() => onAuthSuccess(data.user), 500);
          } else {
            success = 'Account created! Please check your email and click the confirmation link to activate your account.';
          }
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      error = err.message || 'An unexpected error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
  
  function toggleMode() {
    isLogin = !isLogin;
    error = '';
    success = '';
    emailError = '';
    passwordError = '';
    confirmPassword = '';
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleAuth();
    }
  }
</script>

<div class="auth-container">
  <div class="box">
    <h2 class="title is-4 has-text-centered">
      {isLogin ? 'Sign In' : 'Sign Up'}
    </h2>
    
    {#if error}
      <div class="notification is-danger is-light">
        <button class="delete" onclick={() => error = ''}></button>
        {error}
      </div>
    {/if}
    
    {#if success}
      <div class="notification is-success is-light">
        <button class="delete" onclick={() => success = ''}></button>
        {success}
      </div>
    {/if}
    
    <div class="field">
      <label class="label" for="auth-email">Email</label>
      <div class="control">
        <input
          id="auth-email"
          class="input {emailError ? 'is-danger' : ''}"
          type="email"
          placeholder="Enter your email"
          bind:value={email}
          onkeypress={handleKeyPress}
          disabled={loading}
        />
      </div>
      {#if emailError}
        <p class="help is-danger">{emailError}</p>
      {/if}
    </div>
    
    <div class="field">
      <label class="label" for="auth-password">Password</label>
      <div class="control">
        <input
          id="auth-password"
          class="input {passwordError ? 'is-danger' : ''}"
          type="password"
          placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
          bind:value={password}
          onkeypress={handleKeyPress}
          disabled={loading}
        />
      </div>
      {#if passwordError}
        <p class="help is-danger">{passwordError}</p>
      {/if}
    </div>
    
    {#if !isLogin}
      <div class="field">
        <label class="label" for="auth-confirm-password">Confirm Password</label>
        <div class="control">
          <input
            id="auth-confirm-password"
            class="input {confirmPassword && password !== confirmPassword ? 'is-danger' : ''}"
            type="password"
            placeholder="Confirm your password"
            bind:value={confirmPassword}
            onkeypress={handleKeyPress}
            disabled={loading}
          />
        </div>
        {#if confirmPassword && password !== confirmPassword}
          <p class="help is-danger">Passwords do not match</p>
        {/if}
      </div>
    {/if}
    
    <div class="field">
      <button
        class="button is-primary is-fullwidth"
        onclick={(e) => { e.preventDefault(); handleAuth(); }}
        disabled={loading || !!emailError || !!passwordError || (!isLogin && password !== confirmPassword)}
      >
        {#if loading}
          <span class="icon">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
          <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
        {:else}
          {isLogin ? 'Sign In' : 'Sign Up'}
        {/if}
      </button>
    </div>
    
    <div class="has-text-centered">
      <button
        class="button is-text"
        onclick={(e) => { e.preventDefault(); toggleMode(); }}
        disabled={loading}
      >
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
    
    {#if !isLogin}
      <div class="notification is-info is-light mt-4">
        <p class="is-size-7">
          By creating an account, you agree to our terms of service.
          You'll receive a confirmation email to verify your account.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .auth-container {
    max-width: 400px;
    margin: 2rem auto;
  }
  
  .input:focus {
    border-color: #485fc7;
    box-shadow: 0 0 0 0.125em rgba(72, 95, 199, 0.25);
  }
  
  .input.is-danger:focus {
    border-color: #f14668;
    box-shadow: 0 0 0 0.125em rgba(241, 70, 104, 0.25);
  }
  
  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .notification {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .help {
    margin-top: 0.25rem;
    font-size: 0.75rem;
  }
  
  .icon {
    margin-right: 0.5rem;
  }
</style>