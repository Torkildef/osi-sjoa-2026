<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { signupFormUrl, trip } from '$lib/config';
	import {
		borrowsGear,
		byDeparture,
		carFor,
		cars,
		confirmed,
		departureGroups,
		faq,
		fridaySeats,
		helmetSizes,
		open,
		people,
		returnNote,
		shortName,
		unconfirmed,
		type Person
	} from '$lib/participants';

	/** Hvilken deltaker som er åpnet i lista. */
	let selected = $state<number | null>(null);

	const signedUp = confirmed();
	const maybe = unconfirmed();
	const seats = fridaySeats();
	const friday = byDeparture('fredag');
	const borrowing = signedUp.filter(borrowsGear);
	const notBorrowing = signedUp.filter((p) => !borrowsGear(p) && p.kayak !== null);
	const helmets = helmetSizes();
	const showRack = cars.some((c) => c.roofRack !== null);

	const initials = (name: string) =>
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('');

	const departureLabel = (p: Person) => {
		const g = departureGroups.find((d) => d.id === p.departure)!;
		return g.time ? `${g.label} ${g.time}` : g.label;
	};

	const yesNo = (v: boolean | null) => (v === null ? 'Ukjent' : v ? 'Ja' : 'Nei');

	const licenceText = (p: Person) =>
		p.licence === 'manuell'
			? 'Ja, manuell'
			: p.licence === 'automat'
				? 'Ja, automat'
				: p.licence === 'ukjent'
					? 'Ukjent'
					: 'Ikke oppgitt';

	const gearText = (p: Person) => {
		if (p.kayak === null && p.vest === null) return 'Ukjent';
		const items = [p.kayak ? 'Kajakk' : null, p.vest ? 'Vest' : null, p.extraGear ?? null].filter(
			Boolean
		);
		return items.length > 0 ? items.join(', ') : 'Nei';
	};
</script>

{#snippet mark(value: boolean | null)}
	{#if value === true}
		<span class="mark yes" aria-label="Ja">✓</span>
	{:else if value === false}
		<span class="mark no" aria-label="Nei">✕</span>
	{:else}
		<span class="mark none" aria-label="Ukjent">–</span>
	{/if}
{/snippet}

<svelte:head>
	<title>Logistikk – {trip.title}</title>
</svelte:head>

<div class="page-head">
	<h1 class="headline-large">Logistikk</h1>
	<a class="btn btn-tonal btn-small" href={signupFormUrl} target="_blank" rel="noopener">
		Lenke til skjema
		<Icon name="openInNew" size={16} class="trailing" />
	</a>
</div>

<div class="stats">
	<div class="stat accent">
		<div class="value">{signedUp.length}</div>
		<div class="label"><Icon name="groups" size={16} /> Påmeldte{maybe.length ? ` · +${maybe.length} kanskje` : ''}</div>
	</div>
	<div class="stat">
		<div class="value">{cars.length}</div>
		<div class="label"><Icon name="directionsCar" size={16} /> Biler</div>
	</div>
	<div class="stat">
		<div class="value">{seats.seats}{seats.tight > seats.seats ? `–${seats.tight}` : ''}</div>
		<div class="label"><Icon name="person" size={16} /> Seter fredag 16:00</div>
	</div>
	<div class="stat">
		<div class="value">{borrowing.length}</div>
		<div class="label"><Icon name="kayaking" size={16} /> Låner kajakk og vest</div>
	</div>
</div>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="schedule" size={22} class="primary-text" /> Hvem drar når</h2>
	</div>
	<div class="grid wide">
		{#each departureGroups as group (group.id)}
			{@const members = byDeparture(group.id)}
			{#if members.length > 0}
				<div class="card" class:filled={group.id === 'fredag'}>
					<div class="card-head">
						<h3 class="title-medium">
							{group.label}{group.time ? ` ${group.time}` : ''}
						</h3>
						<span class="tag" class:primary={group.id === 'fredag'}>{members.length}</span>
					</div>
					<p class="body-small on-surface-variant" style="margin-bottom: 0.6rem">{group.note}</p>
					<div class="chip-row">
						{#each members as p (p.name)}
							<span class="chip tonal">{shortName(p)}</span>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
	<p class="notice" style="margin-top: 0.85rem">
		<Icon name="info" size={20} />
		<span>
			Fredag kl. 16 er det {seats.seats}{seats.tight > seats.seats ? `–${seats.tight}` : ''} seter til
			{friday.length} personer, så det ser ut til å holde. {returnNote}
			{#each people.filter((p) => p.earlyReturn) as p (p.name)}
				{shortName(p)} drar hjem {p.earlyReturn?.toLowerCase()}.
			{/each}
		</span>
	</p>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="directionsCar" size={22} class="primary-text" /> Biler</h2>
	</div>
	<div class="table-wrap">
		<table class="data">
			<thead>
				<tr>
					<th scope="col">Fører</th>
					<th scope="col" class="center">Seter</th>
					<th scope="col">Drar</th>
					<th scope="col" class="center">Hengerfeste</th>
					{#if showRack}<th scope="col" class="center">Takstativ</th>{/if}
					<th scope="col">Merknad</th>
				</tr>
			</thead>
			<tbody>
				{#each cars as car (car.driver)}
					{@const group = departureGroups.find((d) => d.id === car.departure)!}
					<tr>
						<td class="name">{car.driver}</td>
						<td class="center">{car.seats}{car.seatsTight ? ` (${car.seatsTight} trangt)` : ''}</td>
						<td>{group.label}{group.time ? ` ${group.time}` : ''}</td>
						<td class="center">{@render mark(car.towHitch)}</td>
						{#if showRack}<td class="center">{@render mark(car.roofRack)}</td>{/if}
						<td class="wrap">{car.note ?? ''}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td>{cars.length} biler</td>
					<td class="center">{cars.reduce((sum, c) => sum + c.seats, 0)}</td>
					<td></td>
					<td class="center">{cars.filter((c) => c.towHitch).length}</td>
					{#if showRack}<td class="center">{cars.filter((c) => c.roofRack).length}</td>{/if}
					<td></td>
				</tr>
			</tfoot>
		</table>
	</div>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="kayaking" size={22} class="primary-text" /> Utstyr</h2>
	</div>
	<p class="body-medium on-surface-variant" style="margin-bottom: 0.85rem">
		{borrowing.length} trenger å låne kajakk og vest. Hjelmer etter størrelse:
	</p>
	<div class="grid">
		{#each helmets as h (h.size)}
			<div class="card tight">
				<div class="card-head">
					<h3 class="title-medium">{h.size}</h3>
					<span class="tag primary">{h.names.length}</span>
				</div>
				<p class="body-small on-surface-variant">{h.names.join(', ')}</p>
			</div>
		{/each}
	</div>
	{#if notBorrowing.length > 0}
		<p class="footnote">
			Har eget utstyr: {notBorrowing.map(shortName).join(', ')}.
		</p>
	{/if}
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="groups" size={22} class="primary-text" /> Deltakere</h2>
		<span class="body-small on-surface-variant">Trykk på et navn for detaljer</span>
	</div>
	<ul class="list">
		{#each people as person, i (person.name)}
			{@const car = carFor(person)}
			<li>
				<button
					type="button"
					class="list-item"
					class:selected={selected === i}
					onclick={() => (selected = selected === i ? null : i)}
					aria-expanded={selected === i}
				>
					<span class="leading avatar">{initials(person.name)}</span>
					<span class="content">
						<span class="headline">{person.name}</span>
						<span class="supporting">{departureLabel(person)}</span>
					</span>
					<span class="trailing">
						{#if car}<span class="tag tertiary">Bil</span>{/if}
						{#if person.departure === 'uavklart'}<span class="tag warning">Kanskje</span>{/if}
						<Icon name="keyboardArrowDown" size={22} class="chevron" />
					</span>
				</button>
				{#if selected === i}
					<div class="person-details">
						<dl class="qa">
							<div>
								<dt>Avreise</dt>
								<dd>{departureLabel(person)}</dd>
							</div>
							<div>
								<dt>Bil</dt>
								<dd>
									{#if car}
										Ja · {car.seats} seter{car.driver === 'Torkild' ? ' (leiebil)' : ''}
									{:else if person.licence === 'ukjent'}
										Ukjent
									{:else}
										Nei
									{/if}
								</dd>
							</div>
							<div>
								<dt>Førerkort</dt>
								<dd>{licenceText(person)}</dd>
							</div>
							<div>
								<dt>Låner utstyr</dt>
								<dd>{gearText(person)}</dd>
							</div>
							{#if person.helmet}
								<div>
									<dt>Hjelmstørrelse</dt>
									<dd>{person.helmet}</dd>
								</div>
							{/if}
							{#if person.earlyReturn}
								<div>
									<dt>Drar hjem</dt>
									<dd>{person.earlyReturn}</dd>
								</div>
							{/if}
							{#if person.note}
								<div>
									<dt>Merknad</dt>
									<dd>{person.note}</dd>
								</div>
							{/if}
						</dl>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>

{#if open.length > 0}
	<section class="block">
		<div class="section-head">
			<h2 class="title-large"><Icon name="edit" size={22} class="primary-text" /> Uavklart</h2>
		</div>
		<ul class="list">
			{#each open as item (item)}
				<li class="list-item">
					<span class="leading">❓</span>
					<span class="content"><span class="supporting" style="font-size: 0.9rem">{item}</span></span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="info" size={22} class="primary-text" /> Ofte spurt</h2>
	</div>
	<div class="grid wide">
		{#each faq as item (item.q)}
			<div class="card">
				<h3 class="title-medium" style="margin-bottom: 0.3rem">{item.q}</h3>
				<p class="body-medium on-surface-variant">{item.a}</p>
			</div>
		{/each}
	</div>
</section>
