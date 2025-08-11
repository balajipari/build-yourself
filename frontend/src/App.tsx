import React from 'react';
import LandingPage from './LandingPage';
import Builder from './Builder';

const App: React.FC = () => {
  const [view, setView] = React.useState<'landing' | 'builder'>('landing');
  return view === 'landing' ? (
    <LandingPage onStart={() => setView('builder')} />
  ) : (
    <Builder />
  );
};

export default App;
