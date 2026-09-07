import { privateFormColumns } from '$lib/config';
import type { Participant, TripData } from '$lib/types';

/**
 * Fjerner kontaktopplysninger før dataen sendes til den offentlige forsiden.
 *
 * Det holder ikke å la være å vise dem i malen: SvelteKit serialiserer hele
 * load-resultatet inn i HTML-en for hydrering, så alt vi returnerer herfra kan
 * leses i sidekilden av hvem som helst. Silingen må skje her, på serveren.
 */
function toPublic(participant: Participant): Participant {
	const answers = participant.form_answers;
	const safeAnswers = answers
		? Object.fromEntries(
				Object.entries(answers).filter(
					([column]) => !privateFormColumns.some((pattern) => pattern.test(column))
				)
			)
		: null;

	return {
		...participant,
		email: null,
		phone: null,
		notes: null,
		// form_key er e-postadressen i små bokstaver – den lekker like mye som feltet over.
		form_key: null,
		form_answers: safeAnswers
	};
}

export function toPublicTripData(data: TripData): TripData {
	return { ...data, participants: data.participants.map(toPublic) };
}
