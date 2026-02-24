import { signToken, verifyToken, extractToken } from './auth-utils';
import type { JwtPayload } from './types';

describe('auth-utils', () => {
  const mockPayload: JwtPayload = {
    login: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
  };

  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      const token = signToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should create different tokens for different payloads', () => {
      const token1 = signToken(mockPayload);
      const token2 = signToken({ ...mockPayload, login: 'different' });
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = signToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.login).toBe(mockPayload.login);
      expect(decoded?.name).toBe(mockPayload.name);
      expect(decoded?.email).toBe(mockPayload.email);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here');
      
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const decoded = verifyToken('not-even-a-jwt');
      
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = verifyToken('');
      
      expect(decoded).toBeNull();
    });
  });

  describe('extractToken', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'abc123xyz';
      const authHeader = `Bearer ${token}`;
      
      const extracted = extractToken(authHeader);
      
      expect(extracted).toBe(token);
    });

    it('should return null for undefined header', () => {
      const extracted = extractToken(undefined);
      
      expect(extracted).toBeNull();
    });

    it('should return null for empty header', () => {
      const extracted = extractToken('');
      
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const extracted = extractToken('abc123xyz');
      
      expect(extracted).toBeNull();
    });

    it('should return null for header with wrong prefix', () => {
      const extracted = extractToken('Basic abc123xyz');
      
      expect(extracted).toBeNull();
    });

    it('should handle Bearer with no token', () => {
      const extracted = extractToken('Bearer ');
      
      expect(extracted).toBe('');
    });
  });

  describe('integration: sign and verify', () => {
    it('should sign and then verify a token successfully', () => {
      const token = signToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded).toEqual(expect.objectContaining(mockPayload));
    });
  });
});
