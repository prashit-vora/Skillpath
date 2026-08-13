import { useEffect, useState, type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

const API_BASE_URL = "https://syncsphere-hiv6.onrender.com"

export interface Course {
  courseName: string
  courseCode: string
  description: string
  mainCategory: string
  shortCourse: string
  courseType: string
  pricePaise: number
  priceUsdCents: number
  mangoId: string
  refundable: boolean
}

export type CountryCode = "IN" | "US"

interface CourseGridProps {
  heading?: string
  accentColor?: string
  style?: CSSProperties
}

type ViewState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready"
      courses: Course[]
      countryCode: CountryCode | null
    }

const courseKeys: Array<keyof Course> = [
  "courseName",
  "courseCode",
  "description",
  "mainCategory",
  "shortCourse",
  "courseType",
  "pricePaise",
  "priceUsdCents",
  "mangoId",
  "refundable",
]

function isCourse(value: unknown): value is Course {
  if (typeof value !== "object" || value === null) return false

  const candidate = value as Record<string, unknown>

  return courseKeys.every((key) => {
    if (key === "pricePaise" || key === "priceUsdCents") {
      return typeof candidate[key] === "number" && candidate[key] >= 0
    }

    if (key === "refundable") return typeof candidate[key] === "boolean"

    return typeof candidate[key] === "string"
  })
}

export function parseCourses(value: unknown): Course[] {
  if (!Array.isArray(value) || !value.every(isCourse)) {
    throw new Error("Unexpected course response")
  }

  return value
}

export function parseCountry(value: unknown): CountryCode {
  if (typeof value !== "object" || value === null) {
    throw new Error("Unexpected country response")
  }

  const countryCode = (value as Record<string, unknown>).country_code

  if (countryCode !== "IN" && countryCode !== "US") {
    throw new Error("Unsupported country code")
  }

  return countryCode
}

async function requestJson(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  })

  if (!response.ok) throw new Error(`Request failed with ${response.status}`)

  return response.json()
}

async function fetchCourses(signal: AbortSignal): Promise<Course[]> {
  return parseCourses(
    await requestJson("/assignment/course-data", signal),
  )
}

async function fetchCountry(signal: AbortSignal): Promise<CountryCode> {
  return parseCountry(
    await requestJson("/assignment/country-code", signal),
  )
}

export function formatPrice(course: Course, countryCode: CountryCode): string {
  const isIndia = countryCode === "IN"
  const minorUnits = isIndia ? course.pricePaise : course.priceUsdCents
  const amount = minorUnits / 100

  return new Intl.NumberFormat(isIndia ? "en-IN" : "en-US", {
    style: "currency",
    currency: isIndia ? "INR" : "USD",
    minimumFractionDigits: isIndia && Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function SkeletonCards() {
  return (
    <div className="spc-grid" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="spc-card spc-skeleton-card" key={index}>
          <span className="spc-skeleton spc-skeleton-label" />
          <span className="spc-skeleton spc-skeleton-title" />
          <span className="spc-skeleton spc-skeleton-line" />
          <span className="spc-skeleton spc-skeleton-line spc-skeleton-short" />
          <span className="spc-skeleton spc-skeleton-price" />
        </div>
      ))}
    </div>
  )
}

function StatusPanel({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="spc-status" role={onRetry ? "alert" : "status"}>
      <span className="spc-status-mark" aria-hidden="true">
        {onRetry ? "!" : "—"}
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="spc-retry" type="button" onClick={onRetry}>
          Try again <span aria-hidden="true">↻</span>
        </button>
      )}
    </div>
  )
}

/**
 * Live courses section for the Skillpath Framer page.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export function CourseGrid({
  heading = "Courses for your next move",
  accentColor = "#d9ff57",
  style,
}: CourseGridProps) {
  const [attempt, setAttempt] = useState(0)
  const [viewState, setViewState] = useState<ViewState>({ status: "loading" })

  useEffect(() => {
    const controller = new AbortController()

    async function loadCourses() {
      setViewState({ status: "loading" })

      const [courseResult, countryResult] = await Promise.allSettled([
        fetchCourses(controller.signal),
        fetchCountry(controller.signal),
      ])

      if (controller.signal.aborted) return

      if (courseResult.status === "rejected") {
        setViewState({ status: "error" })
        return
      }

      setViewState({
        status: "ready",
        courses: courseResult.value,
        countryCode:
          countryResult.status === "fulfilled" ? countryResult.value : null,
      })
    }

    void loadCourses()

    return () => controller.abort()
  }, [attempt])

  const retry = () => setAttempt((currentAttempt) => currentAttempt + 1)
  const componentStyle = {
    ...style,
    "--spc-accent": accentColor,
  } as CSSProperties

  return (
    <section
      className="spc-section"
      style={componentStyle}
      aria-labelledby="skillpath-course-heading"
    >
      <style>{courseGridStyles}</style>
      <div className="spc-shell">
        <div className="spc-heading-row">
          <div>
            <p className="spc-eyebrow">Choose your direction</p>
            <h2 id="skillpath-course-heading">{heading}</h2>
          </div>
          <p className="spc-intro">
            Practical lessons, clear outcomes, and skills you can put to work.
          </p>
        </div>

        {viewState.status === "loading" && (
          <div aria-live="polite" aria-busy="true">
            <p className="spc-visually-hidden">Loading courses…</p>
            <SkeletonCards />
          </div>
        )}

        {viewState.status === "error" && (
          <StatusPanel
            title="The courses took a detour"
            message="We couldn’t load them this time. The connection can be unpredictable, so please try once more."
            onRetry={retry}
          />
        )}

        {viewState.status === "ready" && viewState.courses.length === 0 && (
          <StatusPanel
            title="New courses are on the way"
            message="There aren’t any courses to show right now. Check back soon."
          />
        )}

        {viewState.status === "ready" && viewState.courses.length > 0 && (
          <>
            {viewState.countryCode === null && (
              <div className="spc-price-notice" role="status">
                <span>
                  We couldn’t detect your region, so prices are temporarily
                  unavailable.
                </span>
                <button type="button" onClick={retry}>
                  Retry
                </button>
              </div>
            )}

            <div className="spc-grid">
              {viewState.courses.map((course, index) => (
                <article className="spc-card" key={course.courseCode}>
                  <div className="spc-card-meta">
                    <span>{course.mainCategory}</span>
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3>{course.courseName}</h3>
                  <p className="spc-description">{course.description}</p>
                  <div className="spc-card-bottom">
                    <div>
                      <span className="spc-price-label">Course price</span>
                      <strong>
                        {viewState.countryCode
                          ? formatPrice(course, viewState.countryCode)
                          : "Price unavailable"}
                      </strong>
                    </div>
                    {course.refundable && (
                      <span className="spc-badge">Refundable</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

addPropertyControls(CourseGrid, {
  heading: {
    type: ControlType.String,
    title: "Heading",
    defaultValue: "Courses for your next move",
  },
  accentColor: {
    type: ControlType.Color,
    title: "Accent",
    defaultValue: "#d9ff57",
  },
})

const courseGridStyles = `
  .spc-section {
    --spc-ink: #18221c;
    --spc-paper: #f2f0e7;
    width: 100%;
    color: var(--spc-ink);
    background: var(--spc-paper);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-synthesis: none;
  }

  .spc-section * { box-sizing: border-box; }

  .spc-shell {
    width: min(100%, 1280px);
    margin: 0 auto;
    padding: clamp(72px, 9vw, 132px) clamp(20px, 5vw, 72px);
  }

  .spc-heading-row {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(240px, 0.65fr);
    align-items: end;
    gap: 48px;
    margin-bottom: clamp(42px, 6vw, 72px);
  }

  .spc-eyebrow {
    margin: 0 0 14px;
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .spc-heading-row h2 {
    max-width: 780px;
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(42px, 6.2vw, 82px);
    font-weight: 400;
    line-height: 0.96;
    letter-spacing: -0.055em;
  }

  .spc-intro {
    margin: 0;
    color: #556159;
    font-size: 15px;
    line-height: 1.65;
  }

  .spc-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .spc-card {
    display: flex;
    min-width: 0;
    min-height: 308px;
    flex-direction: column;
    padding: 28px;
    overflow: hidden;
    background: #fffefa;
    border: 1px solid #d9ddd2;
    border-radius: 3px;
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .spc-card:hover {
    transform: translateY(-4px);
    border-color: #aeb9aa;
    box-shadow: 0 18px 45px rgba(24, 34, 28, 0.08);
  }

  .spc-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 36px;
    color: #667169;
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .spc-card h3 {
    margin: 0 0 14px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(25px, 2.2vw, 33px);
    font-weight: 400;
    line-height: 1.02;
    letter-spacing: -0.04em;
  }

  .spc-description {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    color: #606a63;
    font-size: 14px;
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .spc-card-bottom {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 14px;
    padding-top: 32px;
    margin-top: auto;
  }

  .spc-price-label {
    display: block;
    margin-bottom: 4px;
    color: #727c75;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .spc-card-bottom strong {
    font-size: 17px;
    font-weight: 750;
    letter-spacing: -0.025em;
  }

  .spc-badge {
    flex: none;
    padding: 7px 9px;
    color: #28311c;
    background: var(--spc-accent);
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.055em;
    text-transform: uppercase;
  }

  .spc-price-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 15px 18px;
    margin: 0 0 18px;
    color: #3a433c;
    background: #fffefa;
    border: 1px solid #d9ddd2;
    font-size: 13px;
  }

  .spc-price-notice button,
  .spc-retry {
    color: var(--spc-ink);
    background: var(--spc-accent);
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-weight: 750;
  }

  .spc-price-notice button { padding: 8px 14px; }

  .spc-status {
    display: grid;
    min-height: 310px;
    place-items: center;
    align-content: center;
    padding: 44px 24px;
    text-align: center;
    background: #fffefa;
    border: 1px solid #d9ddd2;
  }

  .spc-status-mark {
    display: grid;
    width: 48px;
    height: 48px;
    margin-bottom: 20px;
    place-items: center;
    background: var(--spc-accent);
    border-radius: 50%;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 24px;
  }

  .spc-status h3 {
    margin: 0 0 8px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 28px;
    font-weight: 400;
    letter-spacing: -0.03em;
  }

  .spc-status p {
    max-width: 470px;
    margin: 0;
    color: #667169;
    font-size: 14px;
    line-height: 1.6;
  }

  .spc-retry {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 12px 17px;
    margin-top: 22px;
  }

  .spc-skeleton-card { pointer-events: none; }

  .spc-skeleton {
    display: block;
    background: linear-gradient(90deg, #e7e8e1 25%, #f4f4ef 50%, #e7e8e1 75%);
    background-size: 200% 100%;
    border-radius: 3px;
    animation: spc-shimmer 1.4s infinite linear;
  }

  .spc-skeleton-label { width: 34%; height: 10px; margin-bottom: 42px; }
  .spc-skeleton-title { width: 78%; height: 32px; margin-bottom: 20px; }
  .spc-skeleton-line { width: 100%; height: 12px; margin-bottom: 9px; }
  .spc-skeleton-short { width: 68%; }
  .spc-skeleton-price { width: 30%; height: 18px; margin-top: auto; }

  .spc-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @keyframes spc-shimmer { to { background-position: -200% 0; } }

  @media (max-width: 960px) {
    .spc-heading-row { grid-template-columns: 1fr; gap: 22px; }
    .spc-intro { max-width: 520px; }
    .spc-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .spc-card h3 { font-size: 29px; }
  }

  @media (max-width: 620px) {
    .spc-shell { padding-inline: 16px; }
    .spc-grid { grid-template-columns: 1fr; }
    .spc-card { min-height: 280px; padding: 24px; }
    .spc-price-notice { align-items: flex-start; }
  }

  @media (prefers-reduced-motion: reduce) {
    .spc-card { transition: none; }
    .spc-skeleton { animation: none; }
  }
`

export default CourseGrid
