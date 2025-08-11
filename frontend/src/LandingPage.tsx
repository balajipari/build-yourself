import React from 'react';

type LandingPageProps = { onStart: () => void };

// Brand tokens (kept for future extension)

const productName = 'ForgeLab';

const Section: React.FC<{ id?: string; children: React.ReactNode; className?: string }> = ({ id, children, className }) => (
  <section id={id} className={`mx-auto max-w-[1200px] px-6 ${className || ''}`.trim()}>
    {children}
  </section>
);

const ReducedMotionToggle: React.FC = () => {
  const [reduced, setReduced] = React.useState<boolean>(() => localStorage.getItem('reduce_motion') === '1');
  React.useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduced ? '1' : '0';
    localStorage.setItem('reduce_motion', reduced ? '1' : '0');
  }, [reduced]);
  return (
    <button
      aria-pressed={reduced}
      onClick={() => setReduced((v) => !v)}
      className="fixed right-4 bottom-4 z-50 rounded-full bg-white/80 backdrop-blur px-4 py-2 shadow-lg border border-black/10 text-sm"
      title="Toggle reduced motion"
    >
      {reduced ? 'Motion: Reduced' : 'Motion: Full'}
    </button>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-garage text-white overflow-x-hidden">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 backdrop-blur bg-[rgba(10,15,25,0.5)] border-b border-white/10">
        <Section className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 font-semibold tracking-wide">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-black">⚙️</span>
            <span>{productName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onStart} className="btn-primary">Start Building Now</button>
            <a href="#gallery" className="btn-secondary">Explore Builds</a>
          </div>
        </Section>
        <div className="h-1 bg-progress" />
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Parallax layers */}
        <div className="parallax-layer layer-bg" aria-hidden="true" />
        <div className="parallax-layer layer-mid" aria-hidden="true" />
        <div className="parallax-layer layer-fg" aria-hidden="true" />

        <Section className="grid md:grid-cols-2 gap-8 items-center min-h-[70vh] py-16">
          <div>
            <h1 className="font-heading text-5xl md:text-6xl leading-tight">
              Build Legendary Machines.
              <br />
              Garage Dreams, Rendered in Seconds.
            </h1>
            <div className="mt-6 flex gap-3">
              <button onClick={onStart} className="btn-primary">Start Building Now</button>
              <a href="#how" className="btn-secondary">Explore Builds</a>
            </div>
          </div>
          <div className="relative">
            <div className="hero-vehicle hero-bike" />
            <div className="hero-vehicle hero-car" />
            <div className="hero-fx" />
            <div className="gear-spinner" aria-hidden="true">⚙️</div>
          </div>
        </Section>
      </header>

      {/* How it works */}
      <Section id="how" className="py-16 grid md:grid-cols-3 gap-6">
        {[{
          title: 'Pick your parts', body: 'Choose frames, wheels, exhausts, lights.', icon: '🔧'
        }, { title: 'AI render magic', body: 'High‑end PNG preview with studio lighting.', icon: '📷' }, { title: 'Share & inspire', body: 'Showcase to the community with specs.', icon: '🕸️' }].map((c) => (
          <div key={c.title} className="card hover:lift">
            <div className="text-3xl mb-3">{c.icon}</div>
            <h3 className="text-xl font-semibold mb-1">{c.title}</h3>
            <p className="text-white/80 text-sm">{c.body}</p>
          </div>
        ))}
      </Section>

      {/* Featured Carousel (simple snap) */}
      <Section id="gallery" className="py-16">
        <div className="overflow-x-auto snap-x snap-mandatory flex gap-6 pb-4">
          {['Adventure Bike', 'Street Scrambler', 'Supersport', 'Retro Classic', 'Muscle Car'].map((tag, idx) => (
            <div key={idx} className="carousel-card snap-start">
              <div className="carousel-img" />
              <div className="mt-2 text-sm opacity-80">{tag}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Mechanic's Corner */}
      <Section className="py-16 relative">
        <div className="card bg-white/5 border-white/10">
          <h3 className="text-2xl font-semibold mb-3">Mechanic’s Corner</h3>
          <p className="text-white/80">Jump straight into the builder with a part selection.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['engine', 'exhaust', 'rims', 'seat', 'headlight'].map((p) => (
              <button key={p} className="chip" onClick={onStart}>{p}</button>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="py-24 text-center">
        <h2 className="font-heading text-4xl md:text-5xl">Your Machine. Your Rules.<br/>Start Building Today.</h2>
        <button onClick={onStart} className="btn-primary mt-6">Start Designing Now</button>
      </Section>

      <ReducedMotionToggle />
    </div>
  );
};

export default LandingPage;


