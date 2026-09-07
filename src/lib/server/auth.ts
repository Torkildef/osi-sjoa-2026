import { createHash, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';
import { dev } from '$app/environment';

const COOKIE = 'sjoa_admin';
const MAX_AGE = 60 * 60 * 12; // 12 timer

/**
 * Informasjonskapselen inneholder et hashet avtrykk av passordet, ikke passordet selv.
 * Uten passordet kan verdien ikke gjettes, og den blir ugyldig så snart passordet byttes.
 */
function sessionToken(): string {
	return createHash('sha256').update(`sjoa-admin:${ADMIN_PASSWORD}`).digest('hex');
}

function safeEquals(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

export function isValidPassword(candidate: string): boolean {
	return ADMIN_PASSWORD.length > 0 && safeEquals(candidate, ADMIN_PASSWORD);
}

export function startSession(cookies: Cookies): void {
	cookies.set(COOKIE, sessionToken(), {
		path: '/admin',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: MAX_AGE
	});
}

export function endSession(cookies: Cookies): void {
	cookies.delete(COOKIE, { path: '/admin' });
}

export function isLoggedIn(cookies: Cookies): boolean {
	const value = cookies.get(COOKIE);
	return !!value && safeEquals(value, sessionToken());
}
