import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import './styles.css';

const root = document.getElementById('root');
if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<MotionConfig reducedMotion='user'>
				<App />
			</MotionConfig>
		</React.StrictMode>
	);
}
