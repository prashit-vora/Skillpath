import CourseGrid from "./CourseGrid"

export default function App() {
  const year = new Date().getFullYear()

  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Skillpath home">
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            Skillpath
          </a>
          <span className="nav-note">Learn at your own pace</span>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Practical learning for ambitious people</p>
            <h1 id="hero-title">
              Learn the skill.
              <br />
              <em>Make the move.</em>
            </h1>
            <p className="hero-description">
              Focused courses, experienced teachers, and a community that helps
              turn what you learn into work you are proud of.
            </p>
            <a className="hero-button" href="#courses">
              Explore courses
              <span aria-hidden="true">↘</span>
            </a>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-card">
              <div className="hero-card-topline">
                <span>Skillpath / 2026</span>
                <span>01—06</span>
              </div>
              <p className="hero-card-kicker">Your next chapter</p>
              <p className="hero-card-number">01</p>
              <div className="hero-card-footer">
                <span>Pick a path</span>
                <span>Build in public</span>
                <span>Keep moving</span>
              </div>
            </div>
            <div className="burst">Start</div>
          </div>
        </div>

        <div className="hero-ticker" aria-hidden="true">
          <span>Content creation</span>
          <span>Business</span>
          <span>Productivity</span>
          <span>Marketing</span>
        </div>
      </section>

      <div id="courses">
        <CourseGrid
          heading="Courses for your next move"
          accentColor="#d9ff57"
        />
      </div>

      <footer className="footer">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark brand-mark-light" aria-hidden="true">
            S
          </span>
          Skillpath
        </a>
        <div className="footer-links" aria-label="Footer navigation">
          <a href="#top">Home</a>
          <a href="#courses">Courses</a>
          <a href="mailto:hello@skillpath.example">Contact</a>
        </div>
        <p>© {year} Skillpath. Learn what moves you.</p>
      </footer>
    </main>
  )
}
