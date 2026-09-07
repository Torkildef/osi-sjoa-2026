import { fail, redirect } from '@sveltejs/kit';
import { TRIP_DATA_KEY, loadTripData } from '$lib/data';
import { endSession, isLoggedIn, isValidPassword, startSession } from '$lib/server/auth';
import { syncIfStale, syncNow } from '$lib/server/formSync';
import { supabaseAdmin } from '$lib/server/supabase';
import { localInputToIso } from '$lib/time';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

export const load: PageServerLoad = async ({ cookies, depends }) => {
	depends(TRIP_DATA_KEY);
	if (!isLoggedIn(cookies)) return { loggedIn: false as const };
	await syncIfStale();
	return { loggedIn: true as const, trip: await loadTripData(supabaseAdmin) };
};

/** Alle handlinger utenom innlogging krever gyldig informasjonskapsel. */
function requireAdmin({ cookies }: RequestEvent) {
	if (!isLoggedIn(cookies)) redirect(303, '/admin');
}

function clean(form: FormData, key: string): string {
	const value = form.get(key);
	return typeof value === 'string' ? value.trim() : '';
}

/** Innpakning som gjør en Supabase-feil om til en feilmelding i skjemaet. */
async function run(promise: PromiseLike<{ error: { message: string } | null }>, message: string) {
	const { error } = await promise;
	if (error) return fail(500, { error: `${message} (${error.message})` });
	return { ok: true as const };
}

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const password = clean(await request.formData(), 'password');
		if (!isValidPassword(password)) return fail(401, { loginError: 'Feil passord.' });
		startSession(cookies);
		return { ok: true as const };
	},

	logout: async ({ cookies }) => {
		endSession(cookies);
		redirect(303, '/admin');
	},

	syncForm: async (event) => {
		requireAdmin(event);
		const result = await syncNow();
		if (result.status === 'error') return fail(502, { error: `Synk feilet: ${result.message}` });
		if (result.status === 'skipped') return fail(400, { error: result.message });
		return {
			ok: true as const,
			syncMessage: `${result.message} ${result.added} nye, ${result.updated} oppdatert.`
		};
	},

	togglePaid: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		return run(
			supabaseAdmin
				.from('participants')
				.update({ paid: form.get('paid') === 'true' })
				.eq('id', clean(form, 'participant_id')),
			'Klarte ikke å oppdatere betalingsstatus.'
		);
	},

	setStatus: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const status = clean(form, 'status');
		if (!['confirmed', 'waitlist', 'cancelled'].includes(status))
			return fail(400, { error: 'Ugyldig status.' });
		return run(
			supabaseAdmin.from('participants').update({ status }).eq('id', clean(form, 'participant_id')),
			'Klarte ikke å oppdatere status.'
		);
	},

	saveTransport: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const seats = Number.parseInt(clean(form, 'seats_total'), 10);
		if (!Number.isInteger(seats) || seats < 0)
			return fail(400, { error: 'Antall plasser må være null eller mer.' });
		const departureTime = clean(form, 'departure_time');
		return run(
			supabaseAdmin
				.from('transport')
				.update({
					departure_location: clean(form, 'departure_location'),
					departure_time: localInputToIso(departureTime),
					seats_total: seats
				})
				.eq('id', clean(form, 'transport_id')),
			'Klarte ikke å lagre bilen.'
		);
	},

	addTransport: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const driver = clean(form, 'driver_participant_id');
		const location = clean(form, 'departure_location');
		if (!driver || !location) return fail(400, { error: 'Velg sjåfør og oppgi avreisested.' });
		const seats = Number.parseInt(clean(form, 'seats_total'), 10);
		return run(
			supabaseAdmin.from('transport').insert({
				driver_participant_id: driver,
				departure_location: location,
				seats_total: Number.isInteger(seats) && seats >= 0 ? seats : 0
			}),
			'Klarte ikke å legge til bilen.'
		);
	},

	deleteTransport: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		return run(
			supabaseAdmin.from('transport').delete().eq('id', clean(form, 'transport_id')),
			'Klarte ikke å slette bilen.'
		);
	},

	addPassenger: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const participantId = clean(form, 'participant_id');
		if (!participantId) return fail(400, { error: 'Velg en deltaker.' });
		// En deltaker kan bare sitte i én bil, så vi rydder bort en eventuell tidligere plass.
		await supabaseAdmin.from('transport_passengers').delete().eq('participant_id', participantId);
		return run(
			supabaseAdmin
				.from('transport_passengers')
				.insert({ transport_id: clean(form, 'transport_id'), participant_id: participantId }),
			'Klarte ikke å legge til passasjeren.'
		);
	},

	removePassenger: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		return run(
			supabaseAdmin
				.from('transport_passengers')
				.delete()
				.eq('participant_id', clean(form, 'participant_id')),
			'Klarte ikke å fjerne passasjeren.'
		);
	},

	saveAccommodation: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const capacity = Number.parseInt(clean(form, 'capacity'), 10);
		const name = clean(form, 'name');
		if (!name) return fail(400, { error: 'Overnattingen må ha et navn.' });
		if (!Number.isInteger(capacity) || capacity < 0)
			return fail(400, { error: 'Kapasitet må være null eller mer.' });
		const id = clean(form, 'accommodation_id');
		return run(
			id
				? supabaseAdmin.from('accommodation').update({ name, capacity }).eq('id', id)
				: supabaseAdmin.from('accommodation').insert({ name, capacity }),
			'Klarte ikke å lagre overnattingen.'
		);
	},

	deleteAccommodation: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		return run(
			supabaseAdmin.from('accommodation').delete().eq('id', clean(form, 'accommodation_id')),
			'Klarte ikke å slette overnattingen.'
		);
	},

	addResident: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const participantId = clean(form, 'participant_id');
		if (!participantId) return fail(400, { error: 'Velg en deltaker.' });
		await supabaseAdmin
			.from('accommodation_assignments')
			.delete()
			.eq('participant_id', participantId);
		return run(
			supabaseAdmin.from('accommodation_assignments').insert({
				accommodation_id: clean(form, 'accommodation_id'),
				participant_id: participantId
			}),
			'Klarte ikke å tildele plassen.'
		);
	},

	removeResident: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		return run(
			supabaseAdmin
				.from('accommodation_assignments')
				.delete()
				.eq('participant_id', clean(form, 'participant_id')),
			'Klarte ikke å fjerne tildelingen.'
		);
	},

	addAnnouncement: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const message = clean(form, 'message');
		if (!message) return fail(400, { error: 'Skriv en melding først.' });
		return run(
			supabaseAdmin
				.from('announcements')
				.insert({ message, created_by: clean(form, 'created_by') || null }),
			'Klarte ikke å legge ut kunngjøringen.'
		);
	},

	deleteAnnouncement: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		return run(
			supabaseAdmin.from('announcements').delete().eq('id', clean(form, 'announcement_id')),
			'Klarte ikke å slette kunngjøringen.'
		);
	}
};
