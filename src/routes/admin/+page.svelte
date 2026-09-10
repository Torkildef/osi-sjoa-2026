<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let sending = $state(false);

	const when = new Intl.DateTimeFormat('nb-NO', {
		timeZone: 'Europe/Oslo',
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
</script>

<svelte:head>
	<title>Admin – {trip.title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page-head">
	<h1 class="headline-large">Admin</h1>
	{#if data.loggedIn}
		<form method="POST" action="?/logout" use:enhance>
			<button type="submit" class="btn btn-text btn-small">Logg ut</button>
		</form>
	{/if}
</div>

{#if !data.configured}
	<div class="empty">
		<Icon name="edit" size={36} />
		<div class="title-medium">Ikke satt opp ennå</div>
		<p class="body-medium">
			Legg inn <code>ADMIN_PASSWORD</code> og <code>GITHUB_TOKEN</code> som miljøvariabler i
			Vercel, så virker siden.
		</p>
	</div>
{:else if !data.loggedIn}
	<form method="POST" action="?/login" class="card admin-form" use:enhance>
		<label class="field">
			<span>Passord</span>
			<input type="password" name="password" autocomplete="current-password" required />
		</label>
		{#if form?.error}
			<p class="notice error"><Icon name="error" size={20} /> {form.error}</p>
		{/if}
		<button type="submit" class="btn btn-filled">Logg inn</button>
	</form>
{:else}
	<p class="body-medium on-surface-variant" style="margin-bottom: 1rem; max-width: 46rem">
		Skriv hva du vil ha endret på siden. Claude tar køen hver hele time, endrer datafilene
		direkte og lager pull request for alt annet. Er forslaget dumt eller farlig, sier den nei
		og forklarer hvorfor.
	</p>

	<form
		method="POST"
		action="?/submit"
		class="card admin-form"
		use:enhance={() => {
			sending = true;
			return async ({ update }) => {
				await update();
				sending = false;
			};
		}}
	>
		<label class="field">
			<span>Hvem er du?</span>
			<input type="text" name="name" maxlength="60" value={form?.name ?? ''} required />
		</label>
		<label class="field">
			<span>Hva skal gjøres?</span>
			<textarea
				name="prompt"
				rows="6"
				maxlength="2000"
				placeholder="F.eks. «Legg til at vi møtes ved bensinstasjonen på Otta kl. 19 lørdag»"
				required>{form?.ok ? '' : (form?.prompt ?? '')}</textarea
			>
		</label>
		{#if form?.error}
			<p class="notice error"><Icon name="error" size={20} /> {form.error}</p>
		{/if}
		{#if form?.ok && form.issue}
			<p class="notice info">
				<Icon name="checkCircle" size={20} />
				<span>
					Lagt i køen som
					<a href={form.issue.url} target="_blank" rel="noopener">#{form.issue.number}</a>.
					Claude tar den innen en time.
				</span>
			</p>
		{/if}
		<button type="submit" class="btn btn-filled" disabled={sending}>
			{sending ? 'Sender …' : 'Send til Claude'}
		</button>
	</form>

	<section class="block">
		<div class="section-head">
			<h2 class="title-large">Siste prompter</h2>
		</div>
		{#if data.listError}
			<p class="notice error"><Icon name="error" size={20} /> {data.listError}</p>
		{:else if data.recent.length === 0}
			<p class="body-medium on-surface-variant">Ingen ennå.</p>
		{:else}
			<ul class="list">
				{#each data.recent as issue (issue.number)}
					<li>
						<a class="list-item" href={issue.url} target="_blank" rel="noopener">
							<span class="leading">
								{#if issue.rejected}🚫{:else if issue.state === 'closed'}✅{:else}⏳{/if}
							</span>
							<span class="content">
								<span class="headline">{issue.title}</span>
								<span class="supporting">
									#{issue.number} · {when.format(new Date(issue.createdAt))} ·
									{issue.rejected ? 'Avvist' : issue.state === 'closed' ? 'Ferdig' : 'Venter'}
								</span>
							</span>
							<span class="trailing"><Icon name="openInNew" size={18} /></span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
