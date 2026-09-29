import NavBar from './components/NavBar';
import Hero from './components/Hero';
import FullStack from './components/FullStack';
import AdTech from './components/AdTech';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
	return (
		<>
			<NavBar />
			<main>
				<Hero />
				<FullStack />
				<AdTech />
				<Projects />
				<Contact />
			</main>
			<Footer />
		</>
	);
}
