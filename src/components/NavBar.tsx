import { useEffect, useState } from 'react';
import { links } from '../data';

const sections = [
	{ id: 'about', label: 'About' },
	{ id: 'full-stack', label: 'Full Stack' },
	{ id: 'ad-tech', label: 'Ad Tech' },
	{ id: 'projects', label: 'Projects' },
	{ id: 'contact', label: 'Contact' },
];

export default function NavBar() {
	const [active, setActive] = useState('about');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActive(entry.target.id);
				}
			},
			{ rootMargin: '-45% 0px -50% 0px' }
		);
		for (const { id } of sections) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, []);

	return (
		<header className='nav'>
			<a href='#about' className='nav-logo' aria-label='Alex Miller, back to top'>
				<span className='nav-logo-mark' aria-hidden='true' />
				Alex Miller
			</a>
			<button
				className='nav-toggle'
				aria-expanded={open}
				aria-controls='nav-links'
				onClick={() => setOpen((o) => !o)}
			>
				{open ? 'Close' : 'Menu'}
			</button>
			<nav id='nav-links' className={open ? 'nav-links open' : 'nav-links'}>
				{sections.map(({ id, label }) => (
					<a
						key={id}
						href={`#${id}`}
						className={active === id ? 'active' : undefined}
						aria-current={active === id ? 'true' : undefined}
						onClick={() => setOpen(false)}
					>
						{label}
					</a>
				))}
				<a href={links.resume} target='_blank' rel='noreferrer' className='nav-resume'>
					Resume ↗
				</a>
			</nav>
		</header>
	);
}
