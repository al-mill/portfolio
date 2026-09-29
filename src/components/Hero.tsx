import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { PointerEvent } from 'react';
import profile from '../assets/profile.jpg';

const words = ['Full stack.', 'Ad tech.', 'Good vibes.'];

export default function Hero() {
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const sx = useSpring(x, { stiffness: 120, damping: 20 });
	const sy = useSpring(y, { stiffness: 120, damping: 20 });
	const textShadow = useTransform([sx, sy], ([dx, dy]) => {
		const ox = Number(dx) * 10;
		const oy = Number(dy) * 10;
		return [
			`${3 + ox * 0.3}px ${3 + oy * 0.3}px 0 var(--mustard)`,
			`${6 + ox * 0.6}px ${6 + oy * 0.6}px 0 var(--orange)`,
			`${9 + ox}px ${9 + oy}px 0 var(--rust)`,
		].join(', ');
	});
	const photoX = useTransform(sx, (v) => v * -14);
	const photoY = useTransform(sy, (v) => v * -14);

	function onPointerMove(e: PointerEvent<HTMLElement>) {
		const rect = e.currentTarget.getBoundingClientRect();
		x.set((e.clientX - rect.left) / rect.width - 0.5);
		y.set((e.clientY - rect.top) / rect.height - 0.5);
	}

	return (
		<section id='about' className='hero' onPointerMove={onPointerMove}>
			<div className='sunburst' aria-hidden='true' />
			<div className='hero-inner'>
				<div className='hero-copy'>
					<motion.p
						className='eyebrow'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						Oh hey there!
					</motion.p>
					<motion.h1
						className='hero-name'
						style={{ textShadow }}
						initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
						animate={{ opacity: 1, scale: 1, rotate: -4 }}
						transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.2 }}
					>
						Alex Miller
					</motion.h1>
					<ul className='hero-words' aria-label='What I do'>
						{words.map((w, i) => (
							<motion.li
								key={w}
								initial={{ opacity: 0, x: -30 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.5 + i * 0.15 }}
							>
								{w}
							</motion.li>
						))}
					</ul>
					<motion.p
						className='hero-blurb'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
					>
						Brewer turned software engineer. I build the whole stack (React front-ends,
						Node and Python services, cloud infrastructure) and the ad tech that keeps
						publishers in business: header bidding, ad serving, consent and traffic quality.
					</motion.p>
					<motion.div
						className='hero-cta'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1.15 }}
					>
						<a href='#full-stack' className='btn btn-primary'>
							Tune in to the stack
						</a>
						<a href='#ad-tech' className='btn btn-ghost'>
							Run an ad auction
						</a>
					</motion.div>
				</div>
				<motion.div
					className='hero-photo'
					style={{ x: photoX, y: photoY }}
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, type: 'spring', stiffness: 70 }}
				>
					<div className='arch'>
						<img src={profile} alt='Alex Miller' />
					</div>
				</motion.div>
			</div>
			<div className='stripes' aria-hidden='true'>
				<span />
				<span />
				<span />
				<span />
			</div>
		</section>
	);
}
