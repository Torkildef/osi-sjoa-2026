import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { localInputToIso } from '$lib/time';
import type { Actions, PageServerLoad } from './$types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async () => {
	const { data } = await supabaseAdmin.from('accommodation').select('name').order('name');
	return { accommodationOptions: (data ?? []).map((a) => a.name as string) };
};

function clean(value: FormDataEntryValue | null): string {
	return typeof value === 'string' ? value.trim() : '';
}

export const actions: Actions = {
	signup: async ({ request }) => {
		const form = await request.formData();

		const name = clean(form.get('name'));
		const email = clean(form.get('email')).toLowerCase();
		const phone = clean(form.get('phone'));
		const accommodationPreference = clean(form.get('accommodation_preference'));
		const notes = clean(form.get('notes'));
		const canDrive = form.get('can_drive') === 'on';
		const departureLocation = clean(form.get('departure_location'));
		const departureTime = clean(form.get('departure_time'));
		const seatsRaw = clean(form.get('seats_total'));

		// Sendes tilbake så skjemaet kan fylles ut på nytt uten å miste det som er skrevet.
		const values = {
			name,
			email,
			phone,
			accommodation_preference: accommodationPreference,
			notes,
			can_drive: canDrive,
			departure_location: departureLocation,
			departure_time: departureTime,
			seats_total: seatsRaw
		};

		if (!name) return fail(400, { values, error: 'Skriv inn navnet ditt.' });
		if (!EMAIL.test(email)) return fail(400, { values, error: 'Skriv inn en gyldig e-postadresse.' });

		let seats = 0;
		if (canDrive) {
			if (!departureLocation)
				return fail(400, { values, error: 'Oppgi hvor du kjører fra når du melder deg som sjåfør.' });
			seats = Number.parseInt(seatsRaw, 10);
			if (!Number.isInteger(seats) || seats < 0 || seats > 8)
				return fail(400, { values, error: 'Antall ledige plasser må være et tall mellom 0 og 8.' });
		}

		const { data: existing, error: lookupError } = await supabaseAdmin
			.from('participants')
			.select('id, status')
			.eq('email', email)
			.maybeSingle();

		if (lookupError) return fail(500, { values, error: 'Klarte ikke å slå opp e-postadressen. Prøv igjen.' });

		// En tidligere avmeldt deltaker kan melde seg på igjen; ellers er e-posten opptatt.
		if (existing && existing.status !== 'cancelled')
			return fail(400, {
				values,
				error: 'Denne e-postadressen er allerede påmeldt. Bruk avmeldingsskjemaet under om du vil endre.'
			});

		const row = {
			name,
			email,
			phone: phone || null,
			status: 'confirmed' as const,
			accommodation_preference: accommodationPreference || null,
			notes: notes || null
		};

		const result = existing
			? await supabaseAdmin
					.from('participants')
					.update(row)
					.eq('id', existing.id)
					.select('id')
					.single()
			: await supabaseAdmin.from('participants').insert(row).select('id').single();

		if (result.error || !result.data)
			return fail(500, { values, error: 'Klarte ikke å lagre påmeldingen. Prøv igjen.' });

		const participantId = result.data.id as string;

		if (canDrive) {
			const { error: transportError } = await supabaseAdmin.from('transport').upsert(
				{
					driver_participant_id: participantId,
					departure_location: departureLocation,
					departure_time: localInputToIso(departureTime),
					seats_total: seats
				},
				{ onConflict: 'driver_participant_id' }
			);
			if (transportError)
				return fail(500, {
					values,
					error: 'Du er påmeldt, men bilen ble ikke lagret. Si fra til arrangørene.'
				});
		} else {
			// Melder man seg på uten å kunne kjøre, fjernes en eventuell bil fra sist.
			await supabaseAdmin.from('transport').delete().eq('driver_participant_id', participantId);
		}

		return { success: 'signup' as const, name };
	},

	withdraw: async ({ request }) => {
		const form = await request.formData();
		const email = clean(form.get('withdraw_email')).toLowerCase();

		if (!EMAIL.test(email))
			return fail(400, { withdrawError: 'Skriv inn e-postadressen du meldte deg på med.' });

		const { data: participant, error } = await supabaseAdmin
			.from('participants')
			.select('id, name')
			.eq('email', email)
			.maybeSingle();

		if (error) return fail(500, { withdrawError: 'Klarte ikke å slå opp påmeldingen. Prøv igjen.' });
		if (!participant)
			return fail(404, { withdrawError: 'Fant ingen påmelding på denne e-postadressen.' });

		const { error: updateError } = await supabaseAdmin
			.from('participants')
			.update({ status: 'cancelled' })
			.eq('id', participant.id);

		if (updateError) return fail(500, { withdrawError: 'Klarte ikke å melde deg av. Prøv igjen.' });

		// Frigjør plassene i bil og hytte så oversikten stemmer.
		await Promise.all([
			supabaseAdmin.from('transport').delete().eq('driver_participant_id', participant.id),
			supabaseAdmin.from('transport_passengers').delete().eq('participant_id', participant.id),
			supabaseAdmin.from('accommodation_assignments').delete().eq('participant_id', participant.id)
		]);

		return { success: 'withdraw' as const, name: participant.name as string };
	}
};
