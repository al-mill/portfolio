import wildshoot from './assets/wildshoot.svg';
import whatsbrewing from './assets/whatsbrewing.jpg';
import hungrydev from './assets/hungrydev.svg';

export const links = {
	github: 'https://github.com/al-mill',
	linkedin: 'https://www.linkedin.com/in/alexannmill/',
	resume:
		'https://docs.google.com/document/d/e/2PACX-1vRcPQM5MEqFcaweZ-DP_fYSzJ5wnkDl-6fEeZ_799kjUNDDl5vtxjbKhxrKKBSn8Qh_og_QoCu36QBs/pub',
	contactForm: 'https://public.herotofu.com/v1/ca7790a0-7e6a-11ed-b38f-a1ed22f366b1',
};

export type Skill = { name: string; level: number };

export type Station = {
	id: string;
	freq: number;
	label: string;
	tagline: string;
	skills: Skill[];
};

// Frequencies sit on the 88–108 FM dial; level is a 1–10 self-rating driving the VU meter.
export const stations: Station[] = [
	{
		id: 'frontend',
		freq: 90.1,
		label: 'Front-end FM',
		tagline: 'Interfaces that feel as good as they look: fast, accessible, on-brand.',
		skills: [
			{ name: 'React', level: 10 },
			{ name: 'Next.js', level: 10 },
			{ name: 'TypeScript', level: 10 },
			{ name: 'Tailwind CSS', level: 8 },
			{ name: 'Vue', level: 8 },
			{ name: 'Nuxt', level: 7 },
			{ name: 'Core Web Vitals', level: 8 },
		],
	},
	{
		id: 'backend',
		freq: 94.7,
		label: 'Back-end Boogie',
		tagline: 'APIs and services that stay up when the traffic spikes.',
		skills: [
			{ name: 'Node.js', level: 10 },
			{ name: 'Nitro / h3', level: 8 },
			{ name: 'Express', level: 8 },
			{ name: 'Python / Flask', level: 4 },
			{ name: 'Ruby on Rails', level: 3 },
			{ name: 'REST & SDK design', level: 10 },
		],
	},
	{
		id: 'data',
		freq: 99.3,
		label: 'Data Disco',
		tagline: 'Schemas, search and SQL that answer the question behind the question.',
		skills: [
			{ name: 'PostgreSQL', level: 8 },
			{ name: 'SQL', level: 10 },
			{ name: 'OpenSearch', level: 6 },
			{ name: 'BigQuery', level: 8 },
			{ name: 'Migrations', level: 6 },
			{ name: 'MongoDB', level: 6 },
		],
	},
	{
		id: 'cloud',
		freq: 103.5,
		label: 'Cloud Nine',
		tagline: 'Edge to origin: infrastructure as code, deployed with confidence.',
		skills: [
			{ name: 'AWS / CDK', level: 8 },
			{ name: 'Cloudflare', level: 8 },
			{ name: 'GDPR', level: 6 },
			{ name: 'Docker', level: 8 },
			{ name: 'Datadog', level: 8 },
		],
	},
	{
		id: 'craft',
		freq: 106.9,
		label: 'The Craft',
		tagline: 'How the work gets done: tested, reviewed and shipped as a team.',
		skills: [
			{ name: 'pnpm / nx monorepos', level: 8 },
			{ name: 'Playwright & Jest', level: 8 },
			{ name: 'CI/CD', level: 8 },
			{ name: 'Git', level: 10 },
			{ name: 'Agile', level: 8 },
		],
	},
];

export type AdTechPillar = { title: string; body: string; tags: string[] };

export const adTechPillars: AdTechPillar[] = [
	{
		title: 'Header bidding',
		body: 'Prebid.js wrappers, bidder adapters, timeouts and price granularity tuned for yield without tanking page speed.',
		tags: ['Prebid.js', 'Assertive Yield', 'Prebid Server', 'OpenRTB', 'Amazon TAM', 'Price buckets', 'Lazy load & refresh'],
	},
	{
		title: 'Ad serving',
		body: 'Google Ad Manager orders, line items and key-value targeting, with delivery checks that catch mistakes before they cost money.',
		tags: ['Google Ad Manager', 'AdX', 'GPT', 'Key-values', 'Native', 'Delivery reporting'],
	},
	{
		title: 'Privacy & consent',
		body: 'CMP integrations that honour the user: IAB TCF v2.2, GPP and US opt-out signals, verified in a real browser.',
		tags: ['IAB', 'TCF v2.2', 'GPP', 'CMP integration', 'GDPR'],
	},
	{
		title: 'Traffic quality',
		body: 'Invalid-traffic investigations that separate real signal from noise, plus the analytics to prove a fix worked.',
		tags: ['IVT analysis', 'Engaged-user algorithms', 'ads.txt & sellers.json', 'Yield analytics', 'GA4'],
	},
];

export type Project = {
	title: string;
	emoji: string;
	kind: string;
	image: string;
	blurb: string;
	stack: string[];
	demo?: string;
	repo?: string;
};

export const projects: Project[] = [
	{
		title: 'Wild Shoot',
		emoji: '📸',
		kind: 'Photo app',
		image: wildshoot,
		blurb: 'Photo sharing with location tagging, running on the AWS free tier. Users upload photos, admins get analytics, and all the infrastructure is code.',
		stack: ['Nuxt 3', 'Vue', 'AWS CDK', 'Lambda', 'PostgreSQL', 'Cognito'],
		repo: 'https://github.com/al-mill/wildshoot',
	},
	{
		title: "What's Brewin'",
		emoji: '🍺',
		kind: 'Capstone',
		image: whatsbrewing,
		blurb: 'One place to discover new breweries wherever you travel, powered by Open Brewery DB. Lighthouse Labs final project.',
		stack: ['React', 'Express', 'PostgreSQL'],
		repo: 'https://github.com/al-mill/whats.brewin',
	},
	{
		title: 'The Hungry Dev',
		emoji: '🐍',
		kind: 'Game',
		image: hungrydev,
		blurb: 'A GitHub-commit-graph snake game for landing and loading pages. Free to drop into your own work.',
		stack: ['Vanilla JS', 'HTML', 'CSS'],
		demo: 'https://the-hungry-dev.netlify.app',
		repo: 'https://github.com/al-mill/the.hungry.dev',
	},
];
