import { AppError, ErrorCode } from '../../core/errors/AppError';
import {
  generateToken,
  hashPassword,
  comparePasswords,
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../../core/utils/jwt';
import {
  generateOTP,
  storeOTP,
  verifyOTPCode,
  storePendingRegistration,
  getPendingRegistration,
  clearPendingRegistration,
} from '../../core/utils/otp';
import { validatePassword } from '../../core/utils/validation';
import { sendEmail } from '../../config/mail';
import { env } from '../../config/env';
import { logSecurityEvent } from '../../config/logger';
import { authRepository } from './auth.repository';

// ─── Email helper ─────────────────────────────────────────────────────────────

async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Votre code de vérification — ${env.companyName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;padding:24px;
                  border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="margin:0 0 12px;color:#111827">${env.companyName}</h2>
        <p style="color:#374151">
          Utilisez ce code pour vérifier votre adresse email.
          Il expire dans <strong>5 minutes</strong>.
        </p>
        <div style="margin:20px 0;padding:20px;background:#f3f4f6;
                    border-radius:6px;text-align:center">
          <span style="font-size:32px;font-weight:700;
                       letter-spacing:10px;color:#111827">${otp}</span>
        </div>
        <p style="font-size:12px;color:#9ca3af">
          Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
        </p>
      </div>
    `,
  });
}

// ─── AuthService ──────────────────────────────────────────────────────────────

export class AuthService {
  async register(email: string, password: string) {
    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new AppError('Invalid email format.', ErrorCode.BAD_USER_INPUT);
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.isValid) {
      throw new AppError(pwCheck.errors[0], ErrorCode.BAD_USER_INPUT);
    }

    const existing = await authRepository.findByEmail(normalized);
    if (existing) {
      throw new AppError('An account with this email already exists.', ErrorCode.ALREADY_EXISTS);
    }

    const hashed = await hashPassword(password);
    await storePendingRegistration(normalized, '', hashed);

    const otp = generateOTP();
    await storeOTP(normalized, otp);
    await sendOtpEmail(normalized, otp);

    return { message: 'Please check your email for the verification code.', email: normalized };
  }

  async verifyOTP(email: string, otp: string) {
    const normalized = email.trim().toLowerCase();
    const result = await verifyOTPCode(normalized, otp);

    if (!result.valid) {
      throw new AppError(result.message, ErrorCode.UNAUTHENTICATED);
    }

    let user = await authRepository.findByEmail(normalized);

    if (!user) {
      const pending = await getPendingRegistration(normalized);
      if (!pending) {
        throw new AppError('Registration expired. Please register again.', ErrorCode.BAD_USER_INPUT);
      }
      user = await authRepository.createUser({
        email:         normalized,
        password:      pending.password,
        emailVerified: true,
      });
      await clearPendingRegistration(normalized);
      logSecurityEvent.registrationSuccess({ userId: user.id, email: user.email });
    } else {
      await authRepository.setEmailVerified(user.id);
    }

    return { success: true, message: 'Email verified successfully.' };
  }

  async resendOTP(email: string) {
    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new AppError('Invalid email format.', ErrorCode.BAD_USER_INPUT);
    }

    const otp = generateOTP();
    const { expiresAt } = await storeOTP(normalized, otp);
    await sendOtpEmail(normalized, otp);

    return { success: true, message: 'Verification code sent.', expiresAt };
  }

  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(normalized);

    if (!user?.password) {
      logSecurityEvent.loginFailure({ email: normalized, attemptCount: 1 });
      throw new AppError('Invalid credentials.', ErrorCode.UNAUTHENTICATED);
    }

    if (!user.emailVerified) {
      throw new AppError('Please verify your email before logging in.', ErrorCode.UNAUTHENTICATED);
    }

    const valid = await comparePasswords(password, user.password);
    if (!valid) {
      logSecurityEvent.loginFailure({ email: normalized, attemptCount: 1 });
      throw new AppError('Invalid credentials.', ErrorCode.UNAUTHENTICATED);
    }

    logSecurityEvent.loginSuccess({ userId: user.id, email: user.email });
    const accessToken  = generateToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id, user.role);
    return { accessToken, refreshToken, user };
  }

  async refreshTokens(oldRefreshToken: string) {
    const { userId, role, newRefreshToken } = await rotateRefreshToken(oldRefreshToken);
    return { accessToken: generateToken(userId, role), refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await revokeRefreshToken(refreshToken);
    return true;
  }
}

export const authService = new AuthService();
