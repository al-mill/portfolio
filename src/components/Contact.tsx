import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { links } from '../data';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function Contact() {
	const [status, setStatus] = useState<Status>('idle');

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget;
		setStatus('sending');
		try {
			const res = await fetch(links.contactForm, {
				method: 'POST',
				headers: { Accept: 'application/json' },
				body: new FormData(form),
			});
			if (!res.ok) throw new Error(`Form service responded ${res.status}`);
			form.reset();
			setStatus('sent');
		} catch {
			setStatus('error');
		}
	}

	return (
		<section id='contact' className='section contact'>
			<div className='contact-card'>
				<div className='contact-intro'>
					<p className='eyebrow'>Request line</p>
					<h2 className='section-title'>Let's make something groovy</h2>
					<p className='section-lede'>
						Hiring, collaborating, or just want to talk header bidding over a good IPA? Drop a
						line.
					</p>
					<div className='contact-links'>
						<a href={links.linkedin} target='_blank' rel='noreferrer'>
							LinkedIn ↗
						</a>
						<a href={links.github} target='_blank' rel='noreferrer'>
							GitHub ↗
						</a>
						<a href={links.resume} target='_blank' rel='noreferrer'>
							Resume ↗
						</a>
					</div>
				</div>
				<AnimatePresence mode='wait'>
					{status === 'sent' ? (
						<motion.div
							key='thanks'
							className='thanks'
							initial={{ opacity: 0, rotate: -6, scale: 0.8 }}
							animate={{ opacity: 1, rotate: -3, scale: 1 }}
						>
							<strong>Thank you!</strong>
							<p>I'll be in touch soon.</p>
							<button className='btn btn-ghost' onClick={() => setStatus('idle')}>
								Send another
							</button>
						</motion.div>
					) : (
						<motion.form key='form' className='contact-form' onSubmit={onSubmit} exit={{ opacity: 0 }}>
							<label>
								Name
								<input name='name' autoComplete='name' required />
							</label>
							<label>
								Email
								<input name='email' type='email' autoComplete='email' required />
							</label>
							<label>
								Message
								<textarea name='message' rows={4} required />
							</label>
							<button className='btn btn-primary' type='submit' disabled={status === 'sending'}>
								{status === 'sending' ? 'Sending…' : 'Send it'}
							</button>
							{status === 'error' && (
								<p className='form-error' role='alert'>
									That didn't go through. Try again, or reach me on LinkedIn.
								</p>
							)}
						</motion.form>
					)}
				</AnimatePresence>
			</div>
		</section>
	);
}
