import { env } from '$env/dynamic/private';

/**
 * Tynn klient mot GitHubs REST-API, brukt av /admin til å legge prompter i kø
 * som issues. Tokenet ligger i Vercel og når aldri nettleseren.
 *
 * Tokenet skal være «fine-grained», begrenset til dette repoet, med
 * Issues: Read and write. Ikke noe mer.
 */

export const PROMPT_LABEL = 'prompt';
export const REJECTED_LABEL = 'avvist';

export type PromptIssue = {
	number: number;
	title: string;
	url: string;
	createdAt: string;
	state: 'open' | 'closed';
	rejected: boolean;
};

const repo = () => env.GITHUB_REPO || 'Torkildef/osi-sjoa-2026';

export const githubConfigured = () => Boolean(env.GITHUB_TOKEN);

async function api(path: string, init: RequestInit = {}): Promise<Response> {
	return fetch(`https://api.github.com/repos/${repo()}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${env.GITHUB_TOKEN}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			'Content-Type': 'application/json',
			...(init.headers ?? {})
		},
		signal: AbortSignal.timeout(15_000)
	});
}

/** Merkelappen må finnes før et issue kan få den. Finnes den, svarer GitHub 422. */
async function ensureLabel(name: string, color: string, description: string) {
	const res = await api('/labels', {
		method: 'POST',
		body: JSON.stringify({ name, color, description })
	});
	if (!res.ok && res.status !== 422) {
		throw new Error(`Klarte ikke å opprette merkelappen «${name}»: ${res.status}`);
	}
}

/** Oppretter et issue med prompten. Returnerer nummer og lenke. */
export async function createPromptIssue(
	name: string,
	prompt: string
): Promise<{ number: number; url: string }> {
	await ensureLabel(PROMPT_LABEL, '0e8a16', 'Prompt fra /admin, tas av Claude');
	await ensureLabel(REJECTED_LABEL, 'b60205', 'Avvist av Claude – se kommentaren');

	const firstLine = prompt.split('\n').find((l) => l.trim()) ?? prompt;
	const title = firstLine.length > 70 ? `${firstLine.slice(0, 67).trim()}…` : firstLine.trim();

	const res = await api('/issues', {
		method: 'POST',
		body: JSON.stringify({
			title,
			labels: [PROMPT_LABEL],
			body: [
				`**Fra:** ${name}`,
				`**Sendt:** ${new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' })}`,
				'',
				'## Prompt',
				'',
				prompt,
				'',
				'---',
				'_Sendt inn via /admin. Claude tar den ved neste kjøring._'
			].join('\n')
		})
	});
	if (!res.ok) throw new Error(`GitHub svarte ${res.status} da issuet skulle opprettes.`);
	const data = (await res.json()) as { number: number; html_url: string };
	return { number: data.number, url: data.html_url };
}

/** De siste promptene, nyeste først. */
export async function listPromptIssues(limit = 10): Promise<PromptIssue[]> {
	const res = await api(
		`/issues?labels=${PROMPT_LABEL}&state=all&sort=created&direction=desc&per_page=${limit}`
	);
	if (!res.ok) throw new Error(`GitHub svarte ${res.status} da promptene skulle hentes.`);
	const data = (await res.json()) as {
		number: number;
		title: string;
		html_url: string;
		created_at: string;
		state: 'open' | 'closed';
		labels: { name: string }[];
		pull_request?: unknown;
	}[];
	return data
		.filter((i) => !i.pull_request)
		.map((i) => ({
			number: i.number,
			title: i.title,
			url: i.html_url,
			createdAt: i.created_at,
			state: i.state,
			rejected: i.labels.some((l) => l.name === REJECTED_LABEL)
		}));
}

/** Hvor mange prompter som er sendt inn den siste timen – bremsen mot spam. */
export async function promptsLastHour(): Promise<number> {
	const since = new Date(Date.now() - 3600_000);
	const issues = await listPromptIssues(30);
	return issues.filter((i) => new Date(i.createdAt) > since).length;
}
