export type ParticipantStatus = 'confirmed' | 'waitlist' | 'cancelled';

export type Participant = {
	id: string;
	name: string;
	/** Kan mangle: skjemaet har ikke nødvendigvis en e-postkolonne. */
	email: string | null;
	phone: string | null;
	status: ParticipantStatus;
	paid: boolean;
	accommodation_preference: string | null;
	notes: string | null;
	created_at: string;
	/** Nøkkelen raden har i regnearket. Null for deltakere lagt inn for hånd. */
	form_key: string | null;
	/** Hele skjemasvaret slik det står i regnearket, kolonnenavn som nøkkel. */
	form_answers: Record<string, string> | null;
	source: string;
};

export type FormSyncState = {
	last_synced_at: string | null;
	last_error: string | null;
	last_row_count: number | null;
	last_added: number | null;
	columns: string[] | null;
};

export type Transport = {
	id: string;
	driver_participant_id: string;
	departure_location: string;
	departure_time: string | null;
	seats_total: number;
	seats_available: number;
};

export type TransportPassenger = {
	transport_id: string;
	participant_id: string;
};

export type Accommodation = {
	id: string;
	name: string;
	capacity: number;
	capacity_available: number;
};

export type AccommodationAssignment = {
	accommodation_id: string;
	participant_id: string;
};

export type Announcement = {
	id: string;
	message: string;
	created_by: string | null;
	created_at: string;
};

/** Alt oversiktssiden og adminsiden trenger, hentet i én runde. */
export type TripData = {
	participants: Participant[];
	transport: Transport[];
	transportPassengers: TransportPassenger[];
	accommodation: Accommodation[];
	accommodationAssignments: AccommodationAssignment[];
	announcements: Announcement[];
	syncState: FormSyncState | null;
};

export const statusLabel: Record<ParticipantStatus, string> = {
	confirmed: 'Påmeldt',
	waitlist: 'Venteliste',
	cancelled: 'Avmeldt'
};
