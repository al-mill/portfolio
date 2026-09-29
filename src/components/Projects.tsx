import { motion } from 'framer-motion';
import { projects } from '../data';

export default function Projects() {
	return (
		<section id='projects' className='section projects'>
			<div className='section-head'>
				<p className='eyebrow'>The back catalogue</p>
				<h2 className='section-title'>Greatest hits</h2>
				<p className='section-lede'>Hover a sleeve to pull the record out.</p>
			</div>
			<div className='crate'>
				{projects.map((p, i) => (
					<motion.article
						key={p.title}
						className='album'
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-80px' }}
						transition={{ delay: (i % 3) * 0.1 }}
					>
						<div className='sleeve-wrap'>
							<div className='record' aria-hidden='true'>
								<span className='record-label'>{p.emoji}</span>
							</div>
							<div className='sleeve'>
								<img src={p.image} alt={`${p.title} screenshot`} loading='lazy' />
								<span className='sleeve-tag'>{p.kind}</span>
							</div>
						</div>
						<div className='album-body'>
							<h3>
								{p.title} <span aria-hidden='true'>{p.emoji}</span>
							</h3>
							<p>{p.blurb}</p>
							<ul className='tracklist'>
								{p.stack.map((s) => (
									<li key={s}>{s}</li>
								))}
							</ul>
							{(p.demo || p.repo) && (
								<div className='album-links'>
									{p.demo && (
										<a href={p.demo} target='_blank' rel='noreferrer' className='btn btn-small btn-primary'>
											Play it ↗
										</a>
									)}
									{p.repo && (
										<a href={p.repo} target='_blank' rel='noreferrer' className='btn btn-small btn-ghost'>
											Source ↗
										</a>
									)}
								</div>
							)}
						</div>
					</motion.article>
				))}
			</div>
		</section>
	);
}
