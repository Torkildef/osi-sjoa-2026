import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

/**
 * Ett passord, ADMIN_PASSWORD i Vercel, brukt av både /admin og /runs.
 * Den som har det, får en signert cookie så det ikke må skrives hver gang.
 * Cookie-verdien er HMAC av en fast streng med passordet som nøkkel, så den
 * blir ugyldig hvis passordet byttes.
 */

export const passwordConfigured = () => Boolean(env.ADMIN_PASSWORD);

export const cookieToken = (scope: string) =>
	createHmac('sha256', env.ADMIN_PASSWORD ?? '').update(`sjoa-${scope}-v1`).digest('hex');

export function safeEqual(a: string, b: string): boolean {
	const x = Buffer.from(a);
	const y = Buffer.from(b);
	return x.length === y.length && timingSafeEqual(x, y);
}

export const passwordOk = (password: string) =>
	passwordConfigured() && password.length > 0 && safeEqual(password, env.ADMIN_PASSWORD ?? '');

export const cookieOk = (scope: string, cookie: string | undefined) =>
	passwordConfigured() && cookie !== undefined && safeEqual(cookie, cookieToken(scope));
