import { links } from '../data';

export default function Footer() {
	return (
		<footer className='footer'>
			<div className='footer-stripes' aria-hidden='true'>
				<span />
				<span />
				<span />
			</div>
			<div className='footer-inner'>
				<span>© {new Date().getFullYear()} Alex Miller · Keep on truckin'</span>
				<span className='footer-links'>
					<a href={links.github} target='_blank' rel='noreferrer'>
						GitHub
					</a>
					<a href={links.linkedin} target='_blank' rel='noreferrer'>
						LinkedIn
					</a>
				</span>
			</div>
		</footer>
	);
}
