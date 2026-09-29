import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { stations } from '../data';

const MIN = 88;
const MAX = 108;
const LOCK_RANGE = 0.8;
const METER_SEGMENTS = 10;
const KEY_STEPS: Record<string, number | undefined> = {
	ArrowRight: 1,
	ArrowUp: 1,
	ArrowLeft: -1,
	ArrowDown: -1,
};

const pct = (freq: number) => ((freq - MIN) / (MAX - MIN)) * 100;

function nearestStation(freq: number) {
	return stations.reduce((best, s) =>
		Math.abs(s.freq - freq) < Math.abs(best.freq - freq) ? s : best
	);
}

export default function FullStack() {
	const [freq, setFreq] = useState(stations[0].freq);
	const nearest = nearestStation(freq);
	const locked = Math.abs(nearest.freq - freq) <= LOCK_RANGE;
	const station = locked ? nearest : null;

	const snap = () => setFreq((f) => nearestStation(f).freq);

	function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		const step = KEY_STEPS[e.key];
		if (!step) return;
		e.preventDefault();
		const index = stations.indexOf(nearest);
		const next = stations[Math.min(stations.length - 1, Math.max(0, index + step))];
		setFreq(next.freq);
	}

	return (
		<section id='full-stack' className='section fullstack'>
			<div className='section-head'>
				<p className='eyebrow'>Side A · Full Stack</p>
				<h2 className='section-title'>Tune in to the stack</h2>
				<p className='section-lede'>
					Spin the dial, or pick a station, to hear what I can play.
				</p>
			</div>

			<div className='radio'>
				<div className='radio-grille' aria-hidden='true'>
					<motion.div
						className='speaker-cone'
						animate={station ? { scale: [1, 1.04, 1] } : { scale: 1 }}
						transition={{ repeat: Infinity, duration: 0.6 }}
					/>
				</div>

				<div className='radio-face'>
					<div className='dial'>
						<div className='dial-scale' aria-hidden='true'>
							{Array.from({ length: MAX - MIN + 1 }, (_, i) => (
								<span
									key={i}
									className={i % 4 === 0 ? 'tick major' : 'tick'}
									style={{ left: `${(i / (MAX - MIN)) * 100}%` }}
								>
									{i % 4 === 0 && <em>{MIN + i}</em>}
								</span>
							))}
							{stations.map((s) => (
								<span
									key={s.id}
									className={s.id === station?.id ? 'dial-station on' : 'dial-station'}
									style={{ left: `${pct(s.freq)}%` }}
								/>
							))}
						</div>
						<div className='dial-rail' aria-hidden='true'>
							<motion.div
								className='needle'
								animate={{ left: `${pct(freq)}%` }}
								transition={{ type: 'spring', stiffness: 260, damping: 24 }}
							/>
						</div>
						<label className='sr-only' htmlFor='tuner'>
							Tune frequency
						</label>
						<input
							id='tuner'
							className='dial-input'
							type='range'
							min={MIN}
							max={MAX}
							step={0.1}
							value={freq}
							aria-valuetext={station ? `${station.freq} ${station.label}` : `${freq.toFixed(1)}, static`}
							onChange={(e) => setFreq(Number(e.target.value))}
							onPointerUp={snap}
							onKeyDown={onKeyDown}
						/>
					</div>

					<div className='presets' role='group' aria-label='Stations'>
						{stations.map((s) => (
							<button
								key={s.id}
								className={s.id === station?.id ? 'preset on' : 'preset'}
								aria-pressed={s.id === station?.id}
								onClick={() => setFreq(s.freq)}
							>
								<span className='preset-freq'>{s.freq.toFixed(1)}</span>
								{s.label}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className='broadcast' aria-live='polite'>
				<AnimatePresence mode='wait'>
					{station ? (
						<motion.div
							key={station.id}
							className='broadcast-card'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.25 }}
						>
							<div className='on-air'>
								<span className='on-air-dot' /> On air · {station.freq.toFixed(1)} FM
							</div>
							<h3>{station.label}</h3>
							<p>{station.tagline}</p>
							<ul className='meters'>
								{station.skills.map((skill, i) => (
									<li key={skill.name}>
										<span className='meter-name'>{skill.name}</span>
										<span
											className='meter'
											role='meter'
											aria-valuemin={0}
											aria-valuemax={METER_SEGMENTS}
											aria-valuenow={skill.level}
											aria-label={`${skill.name} proficiency`}
										>
											{Array.from({ length: METER_SEGMENTS }, (_, seg) => (
												<motion.span
													key={seg}
													className={seg < skill.level ? 'seg lit' : 'seg'}
													initial={{ opacity: 0.15 }}
													animate={{ opacity: seg < skill.level ? 1 : 0.15 }}
													transition={{ delay: 0.15 + i * 0.06 + seg * 0.03 }}
												/>
											))}
										</span>
									</li>
								))}
							</ul>
						</motion.div>
					) : (
						<motion.div
							key='static'
							className='broadcast-card static'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<div className='static-noise' aria-hidden='true' />
							<p>
								~ {freq.toFixed(1)} FM · nothing but static ~
								<br />
								Keep turning — next up is {nearest.label}.
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</section>
	);
}
