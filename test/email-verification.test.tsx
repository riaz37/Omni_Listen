import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockPush = vi.fn()
const mockLogin = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null, login: mockLogin, refreshUser: vi.fn(), loading: false, isLoggingOut: false }),
}))

const mockVerifyEmail = vi.fn()
const mockResendVerification = vi.fn()
const mockEmailRegister = vi.fn()

vi.mock('@/lib/api', () => ({
  authAPI: {
    emailRegister: mockEmailRegister,
    resendVerification: mockResendVerification,
    verifyEmail: mockVerifyEmail,
  },
  calendarAPI: { getAuthUrl: vi.fn() },
}))

const toastSuccess = vi.fn()
const toastError = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: toastSuccess, error: toastError },
}))

vi.mock('@/components/FeatureHighlights', () => ({ default: () => null }))
vi.mock('@/components/LoadingScreen', () => ({ default: () => null }))
vi.mock('@/components/CalendarConnectModal', () => ({ default: () => null }))
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// ── Signin tests ──────────────────────────────────────────────────────────

describe('SignInPage — ?verified=true toast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { search: '?verified=true', pathname: '/signin', href: 'http://localhost/signin?verified=true' },
      writable: true,
    })
    window.history.replaceState = vi.fn()
  })

  it('shows success toast when ?verified=true is in the URL', async () => {
    const { default: SignInPage } = await import('@/app/signin/page')
    render(<SignInPage />)
    expect(toastSuccess).toHaveBeenCalledWith('Email verified! Sign in to continue.')
  })

  it('clears the ?verified param from the URL after showing toast', async () => {
    const { default: SignInPage } = await import('@/app/signin/page')
    render(<SignInPage />)
    expect(window.history.replaceState).toHaveBeenCalledWith({}, '', '/signin')
  })
})

// ── VerifyEmailContent tests ──────────────────────────────────────────────

describe('VerifyEmailContent — success redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams('token=abc123')
    mockVerifyEmail.mockResolvedValue({ verified: true })
    Object.defineProperty(window, 'location', {
      value: { search: '?token=abc123', pathname: '/verify-email', href: 'http://localhost/verify-email?token=abc123' },
      writable: true,
    })
  })

  it('redirects to /signin?verified=true on successful verification', async () => {
    const { default: VerifyEmailContent } = await import('@/app/verify-email/VerifyEmailContent')
    render(<VerifyEmailContent />)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin?verified=true')
    })
  })


})

describe('VerifyEmailContent — error state with resend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams('token=badtoken')
    mockVerifyEmail.mockRejectedValue({ response: { data: { detail: 'Invalid or expired verification token' } } })
    Object.defineProperty(window, 'location', {
      value: { search: '?token=badtoken', pathname: '/verify-email', href: 'http://localhost/verify-email?token=badtoken' },
      writable: true,
    })
  })

  it('shows a resend email input and button in the error state', async () => {
    const { default: VerifyEmailContent } = await import('@/app/verify-email/VerifyEmailContent')
    render(<VerifyEmailContent />)
    await waitFor(() => screen.getByText('Verification Failed'))
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resend verification/i })).toBeInTheDocument()
  })

  it('calls resendVerification with the entered email', async () => {
    mockResendVerification.mockResolvedValue({ message: 'sent' })
    const { default: VerifyEmailContent } = await import('@/app/verify-email/VerifyEmailContent')
    render(<VerifyEmailContent />)
    await waitFor(() => screen.getByText('Verification Failed'))
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /resend verification/i }))
    await waitFor(() => expect(mockResendVerification).toHaveBeenCalledWith('test@example.com'))
  })
})

// ── SignUpPage tests ──────────────────────────────────────────────────────

describe('SignUpPage — email verification gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    Object.defineProperty(window, 'location', {
      value: { search: '', pathname: '/signup', href: 'http://localhost/signup' },
      writable: true,
    })
  })

  const fillAndSubmit = async () => {
    const { default: SignUpPage } = await import('@/app/signup/page')
    render(<SignUpPage />)
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), { target: { value: 'Password1' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'Password1' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
  }

  it('shows check-email state when email_verified is false', async () => {
    mockEmailRegister.mockResolvedValue({
      access_token: 'tok', refresh_token: 'ref',
      user: { email: 'test@example.com', email_verified: false, name: 'Test User', id: 1, picture: '', calendar_connected: false },
    })
    await fillAndSubmit()
    await waitFor(() => screen.getByText(/check your email/i))
  })

  it('shows the registered email address in the check-email state', async () => {
    mockEmailRegister.mockResolvedValue({
      access_token: 'tok', refresh_token: 'ref',
      user: { email: 'test@example.com', email_verified: false, name: 'Test User', id: 1, picture: '', calendar_connected: false },
    })
    await fillAndSubmit()
    await waitFor(() => screen.getByText(/test@example.com/))
  })

  it('calls login and redirects when email_verified is true', async () => {
    mockEmailRegister.mockResolvedValue({
      access_token: 'tok', refresh_token: 'ref',
      user: { email: 'test@example.com', email_verified: true, name: 'Test User', id: 1, picture: '', calendar_connected: true },
    })
    await fillAndSubmit()
    await waitFor(() => expect(mockLogin).toHaveBeenCalled())
  })

  it('shows a resend button in the check-email state', async () => {
    mockEmailRegister.mockResolvedValue({
      access_token: 'tok', refresh_token: 'ref',
      user: { email: 'test@example.com', email_verified: false, name: 'Test User', id: 1, picture: '', calendar_connected: false },
    })
    await fillAndSubmit()
    await waitFor(() => screen.getByText(/check your email/i))
    expect(screen.getByRole('button', { name: /resend email/i })).toBeInTheDocument()
  })
})
