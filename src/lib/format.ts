import { TRIP_TIMEZONE } from './time';

const dateTime = new Intl.DateTimeFormat('nb-NO', {
	timeZone: TRIP_TIMEZONE,
	weekday: 'short',
	day: 'numeric',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit'
});

const dateOnly = new Intl.DateTimeFormat('nb-NO', {
	timeZone: TRIP_TIMEZONE,
	day: 'numeric',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit'
});

export function formatDateTime(value: string | null): string {
	if (!value) return 'Tidspunkt ikke satt';
	return dateTime.format(new Date(value));
}

export function formatTimestamp(value: string): string {
	return dateOnly.format(new Date(value));
}

export { isoToLocalInput } from './time';
