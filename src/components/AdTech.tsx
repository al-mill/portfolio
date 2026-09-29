import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { adTechPillars } from '../data';

type Phase = 'idle' | 'consent' | 'quality' | 'bidding' | 'decision' | 'done';

type Bidder = { name: string; color: string; minCpm: number; maxCpm: number };

type Bid = {
	bidder: Bidder;
	latency: number;
	cpm: number;
	noBid: boolean;
};

type Outcome =
	| { kind: 'blocked' }
	| { kind: 'house'; bestCpm: number }
	| { kind: 'won'; winner: string; source: 'Prebid' | 'AdX'; cpm: number };

type Settings = { consent: boolean; bot: boolean; floor: number; timeout: number };

type Run = Settings & {
	bids: Bid[];
	adxCpm: number;
	auctionEnd: number;
	priceBucket: number | null;
	topBid: Bid | null;
	outcome: Outcome;
};

const bidders: Bidder[] = [
	{ name: 'Groovy SSP', color: 'var(--orange)', minCpm: 0.8, maxCpm: 4.2 },
	{ name: 'Disco Exchange', color: 'var(--mustard)', minCpm: 0.5, maxCpm: 3.6 },
	{ name: 'Lava Lamp Ads', color: 'var(--rust)', minCpm: 1.0, maxCpm: 5.0 },
	{ name: 'Funk Media', color: 'var(--avocado)', minCpm: 0.4, maxCpm: 3.0 },
	{ name: 'Boogie Bids', color: 'var(--teal)', minCpm: 0.6, maxCpm: 3.8 },
];

const AXIS_MS = 3000;
const STEP_MS = 750;
const GRANULARITY = 0.1;

const stages: { id: Phase; label: string; detail: string }[] = [
	{ id: 'consent', label: 'Consent', detail: 'CMP signals: TCF / GPP' },
	{ id: 'quality', label: 'Traffic check', detail: 'Invalid-traffic filter' },
	{ id: 'bidding', label: 'Header bidding', detail: 'Prebid.js auction' },
	{ id: 'decision', label: 'Ad server', detail: 'GAM line items vs AdX' },
	{ id: 'done', label: 'Render', detail: 'Creative in the slot' },
];

const stageIndex = (phase: Phase) => stages.findIndex((s) => s.id === phase);

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const money = (n: number) => `$${n.toFixed(2)}`;

function planRun(settings: Settings): Run {
	const bids = bidders.map((bidder) => {
		const noBid = settings.consent ? Math.random() < 0.1 : Math.random() < 0.45;
		const personalised = rand(bidder.minCpm, bidder.maxCpm);
		return {
			bidder,
			latency: Math.round(rand(180, 2800)),
			cpm: settings.consent ? personalised : personalised * 0.45,
			noBid,
		};
	});
	const adxCpm = rand(0.3, 3.2) * (settings.consent ? 1 : 0.6);
	const auctionEnd = Math.min(settings.timeout, Math.max(...bids.map((b) => b.latency)));

	const inTime = bids.filter((b) => !b.noBid && b.latency <= settings.timeout);
	const topBid = inTime.reduce<Bid | null>((best, b) => (!best || b.cpm > best.cpm ? b : best), null);
	// GAM only sees the Prebid price bucket (hb_pb), rounded down to the granularity.
	const priceBucket = topBid ? Math.floor(topBid.cpm / GRANULARITY) * GRANULARITY : null;

	let outcome: Outcome;
	if (settings.bot) {
		outcome = { kind: 'blocked' };
	} else {
		const prebidPrice = priceBucket ?? 0;
		const best = Math.max(prebidPrice, adxCpm);
		if (best < settings.floor) outcome = { kind: 'house', bestCpm: best };
		else if (topBid && prebidPrice >= adxCpm)
			outcome = { kind: 'won', winner: topBid.bidder.name, source: 'Prebid', cpm: prebidPrice };
		else outcome = { kind: 'won', winner: 'Google AdX', source: 'AdX', cpm: adxCpm };
	}

	return { ...settings, bids, adxCpm, auctionEnd, priceBucket, topBid, outcome };
}

function lesson(run: Run) {
	const { outcome } = run;
	if (outcome.kind === 'blocked')
		return 'Bot traffic was filtered before a single bid request left the page. No wasted spend for advertisers, and the site stays in good standing with its demand partners.';
	const late = run.bids.filter((b) => b.latency > run.timeout).length;
	const notes: string[] = [];
	if (!run.consent)
		notes.push('No consent means contextual-only demand: fewer bidders show up and bids come in lower.');
	if (late > 0)
		notes.push(
			`${late} bidder${late > 1 ? 's' : ''} missed the ${run.timeout} ms timeout and ${late > 1 ? 'were' : 'was'} left out. A longer timeout earns more but makes the page slower.`
		);
	if (outcome.kind === 'house')
		notes.push(
			`The best price (${money(outcome.bestCpm)}) was below the ${money(run.floor)} floor, so a house ad filled the slot.`
		);
	if (outcome.kind === 'won')
		notes.push(
			outcome.source === 'Prebid'
				? `${outcome.winner} won at hb_pb=${outcome.cpm.toFixed(2)}. That beat AdX at ${money(run.adxCpm)} and cleared the floor.`
				: `AdX came in at ${money(outcome.cpm)}, above the best Prebid bucket, so Google's demand took the slot.`
		);
	return notes.join(' ');
}

export default function AdTech() {
	const [settings, setSettings] = useState<Settings>({
		consent: true,
		bot: false,
		floor: 1.5,
		timeout: 1500,
	});
	const [phase, setPhase] = useState<Phase>('idle');
	const [run, setRun] = useState<Run | null>(null);
	const [elapsed, setElapsed] = useState(0);
	const [history, setHistory] = useState<Outcome[]>([]);

	const running = phase !== 'idle' && phase !== 'done';

	useEffect(() => {
		if (!run) return;
		const finish = () => {
			setPhase('done');
			setHistory((h) => [...h, run.outcome]);
		};
		if (phase === 'consent') {
			const t = setTimeout(() => setPhase('quality'), STEP_MS);
			return () => clearTimeout(t);
		}
		if (phase === 'quality') {
			const t = setTimeout(() => (run.bot ? finish() : setPhase('bidding')), STEP_MS);
			return () => clearTimeout(t);
		}
		if (phase === 'bidding') {
			let frame = 0;
			const start = performance.now();
			const tick = (now: number) => {
				const e = Math.min(now - start, run.auctionEnd);
				setElapsed(e);
				if (e >= run.auctionEnd) setPhase('decision');
				else frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
			return () => cancelAnimationFrame(frame);
		}
		if (phase === 'decision') {
			const t = setTimeout(finish, STEP_MS * 1.2);
			return () => clearTimeout(t);
		}
	}, [phase, run]);

	function start() {
		setRun(planRun(settings));
		setElapsed(0);
		setPhase('consent');
	}

	const filled = history.filter((o) => o.kind === 'won');
	const served = history.filter((o) => o.kind !== 'blocked');
	const revenue = filled.reduce((sum, o) => sum + (o.kind === 'won' ? o.cpm : 0), 0);
	const current = stageIndex(phase);

	return (
		<section id='ad-tech' className='section adtech'>
			<div className='section-head'>
				<p className='eyebrow'>Side B · Ad Tech</p>
				<h2 className='section-title'>100 milliseconds of showbiz</h2>
			</div>

			<div className='sim'>
				<div className='sim-controls'>
					<fieldset className='toggle-group'>
						<legend>Visitor consent</legend>
						<button
							aria-pressed={settings.consent}
							className={settings.consent ? 'chip on' : 'chip'}
							onClick={() => setSettings((s) => ({ ...s, consent: true }))}
						>
							Accepted
						</button>
						<button
							aria-pressed={!settings.consent}
							className={!settings.consent ? 'chip on' : 'chip'}
							onClick={() => setSettings((s) => ({ ...s, consent: false }))}
						>
							Rejected
						</button>
					</fieldset>
					<fieldset className='toggle-group'>
						<legend>Traffic</legend>
						<button
							aria-pressed={!settings.bot}
							className={!settings.bot ? 'chip on' : 'chip'}
							onClick={() => setSettings((s) => ({ ...s, bot: false }))}
						>
							Human
						</button>
						<button
							aria-pressed={settings.bot}
							className={settings.bot ? 'chip on' : 'chip'}
							onClick={() => setSettings((s) => ({ ...s, bot: true }))}
						>
							Bot
						</button>
					</fieldset>
					<label className='slider'>
						<span>
							Price floor <strong>{money(settings.floor)}</strong>
						</span>
						<input
							type='range'
							min={0.25}
							max={4}
							step={0.25}
							value={settings.floor}
							onChange={(e) => setSettings((s) => ({ ...s, floor: Number(e.target.value) }))}
						/>
					</label>
					<label className='slider'>
						<span>
							Prebid timeout <strong>{settings.timeout} ms</strong>
						</span>
						<input
							type='range'
							min={500}
							max={2500}
							step={100}
							value={settings.timeout}
							onChange={(e) => setSettings((s) => ({ ...s, timeout: Number(e.target.value) }))}
						/>
					</label>
					<button className='btn btn-primary play' onClick={start} disabled={running}>
						{running ? 'Auction running…' : phase === 'done' ? '▶ Run it again' : '▶ Run the auction'}
					</button>
				</div>

				<ol className='pipeline'>
					{stages.map((s, i) => {
						const blockedHere = run?.bot && phase === 'done' && s.id === 'quality';
						const skipped = run?.bot && phase === 'done' && i > stageIndex('quality');
						const state = blockedHere
							? 'blocked'
							: skipped
								? 'skipped'
								: i < current || phase === 'done'
									? 'passed'
									: i === current
										? 'active'
										: 'pending';
						return (
							<li key={s.id} className={`stage ${state}`}>
								<span className='stage-num'>{i + 1}</span>
								<span className='stage-label'>{s.label}</span>
								<span className='stage-detail'>
									{s.id === 'consent' && run && phase !== 'idle'
										? run.consent
											? 'Consent granted: personalised ads allowed'
											: 'Consent rejected: contextual ads only'
										: s.id === 'quality' && run && i < current + (phase === 'done' ? 1 : 0)
											? run.bot
												? 'Bot detected: request blocked'
												: 'Human visitor: request passes'
											: s.detail}
								</span>
							</li>
						);
					})}
				</ol>

				<div className='sim-stage'>
					<div className='bid-race' aria-label='Bid responses over time'>
						<div className='race-axis' aria-hidden='true'>
							<span>0 ms</span>
							<span>{AXIS_MS} ms</span>
						</div>
						<div className='race-lanes'>
							<div className='race-overlay' aria-hidden='true'>
								<div className='timeout-line' style={{ left: `${(settings.timeout / AXIS_MS) * 100}%` }}>
									<span>{settings.timeout} ms timeout</span>
								</div>
							</div>
							{(run?.bids ?? bidders.map((bidder) => ({ bidder, latency: 0, cpm: 0, noBid: false }))).map(
								(bid) => {
									const showing = run && !run.bot && (phase === 'bidding' || phase === 'decision' || phase === 'done');
									const arrived = showing && elapsed >= bid.latency && bid.latency <= run.timeout;
									const late = showing && bid.latency > run.timeout && (phase === 'decision' || phase === 'done');
									const pos = showing ? Math.min(elapsed, bid.latency, AXIS_MS) : 0;
									const isTop = run?.topBid === bid && (phase === 'decision' || phase === 'done');
									return (
										<div key={bid.bidder.name} className={isTop ? 'lane top' : 'lane'}>
											<span className='lane-name'>{bid.bidder.name}</span>
											<div className='lane-track'>
												<div
													className='lane-fill'
													style={{ width: `${(pos / AXIS_MS) * 100}%`, background: bid.bidder.color }}
												/>
												{arrived && (
													<motion.span
														className={bid.noBid ? 'bid-chip nobid' : 'bid-chip'}
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														style={{ left: `${(Math.min(bid.latency, AXIS_MS) / AXIS_MS) * 100}%` }}
													>
														{bid.noBid ? 'no bid' : money(bid.cpm)}
													</motion.span>
												)}
												{late && (
													<span className='bid-chip late' style={{ left: `${(run.timeout / AXIS_MS) * 100}%` }}>
														too late
													</span>
												)}
											</div>
										</div>
									);
								}
							)}
						</div>
						{run && !run.bot && (phase === 'decision' || phase === 'done') && (
							<motion.div className='kv' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
								<code>hb_bidder={run.topBid?.bidder.name.replace(/\s/g, '').toLowerCase() ?? '∅'}</code>
								<code>hb_pb={run.priceBucket?.toFixed(2) ?? '∅'}</code>
								<code>adx={money(run.adxCpm)}</code>
								<code>floor={money(run.floor)}</code>
							</motion.div>
						)}
					</div>

					<div className='ad-slot-wrap'>
						<span className='ad-slot-label'>300 × 250</span>
						<div className='ad-slot'>
							<AnimatePresence mode='wait'>
								{phase !== 'done' || !run ? (
									<motion.div
										key='waiting'
										className='creative waiting'
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
									>
										{running ? <span className='spinner' aria-hidden='true' /> : null}
										<span>{running ? 'Waiting for a winner…' : 'Your ad could be here'}</span>
									</motion.div>
								) : run.outcome.kind === 'blocked' ? (
									<motion.div
										key='blocked'
										className='creative blocked'
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
									>
										<strong>🤖 Blocked</strong>
										<span>No ad served to bots</span>
									</motion.div>
								) : run.outcome.kind === 'house' ? (
									<motion.div
										key='house'
										className='creative house'
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
									>
										<strong>House ad</strong>
										<span>Subscribe for more groovy reads</span>
									</motion.div>
								) : (
									<motion.div
										key={`won-${history.length}`}
										className='creative won'
										initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
										animate={{ opacity: 1, scale: 1, rotate: 0 }}
										transition={{ type: 'spring', stiffness: 200, damping: 14 }}
									>
										<span className='creative-kicker'>{run.outcome.source} winner</span>
										<strong>{run.outcome.winner}</strong>
										<span className='creative-price'>{money(run.outcome.cpm)} CPM</span>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				<p className='sim-lesson' aria-live='polite'>
					{phase === 'done' && run
						? lesson(run)
						: running
							? 'Auction in progress…'
							: 'Change a setting, then run the auction to see what happens.'}
				</p>

				<dl className='sim-stats'>
					<div>
						<dt>Auctions</dt>
						<dd>{history.length}</dd>
					</div>
					<div>
						<dt>Fill rate</dt>
						<dd>{served.length ? `${Math.round((filled.length / served.length) * 100)}%` : '-'}</dd>
					</div>
					<div>
						<dt>Avg eCPM</dt>
						<dd>{filled.length ? money(revenue / filled.length) : '-'}</dd>
					</div>
					<div>
						<dt>Bots blocked</dt>
						<dd>{history.length - served.length}</dd>
					</div>
				</dl>
			</div>

			<div className='pillars'>
				{adTechPillars.map((p, i) => (
					<motion.article
						key={p.title}
						className='pillar'
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-60px' }}
						transition={{ delay: i * 0.08 }}
						whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
					>
						<h3>{p.title}</h3>
						<p>{p.body}</p>
						<ul>
							{p.tags.map((t) => (
								<li key={t}>{t}</li>
							))}
						</ul>
					</motion.article>
				))}
			</div>
		</section>
	);
}
