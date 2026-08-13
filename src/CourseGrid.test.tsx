// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import CourseGrid from "./CourseGrid"

const course = {
  courseName: "How To YouTube",
  courseCode: "how-to-youtube",
  description: "Learn to build a YouTube channel.",
  mainCategory: "Content Creation",
  shortCourse: "YouTube",
  courseType: "Original",
  pricePaise: 199900,
  priceUsdCents: 3999,
  mangoId: "a1b2c3d4e5f6789012345678",
  refundable: true,
}

function mockApi({
  courses = [course],
  country = "IN",
  courseOk = true,
  countryOk = true,
}: {
  courses?: unknown[]
  country?: string
  courseOk?: boolean
  countryOk?: boolean
} = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: string | URL | Request) => {
      const url = String(input)
      const isCourseRequest = url.endsWith("/assignment/course-data")
      const ok = isCourseRequest ? courseOk : countryOk
      const body = isCourseRequest ? courses : { country_code: country }

      return Promise.resolve({
        ok,
        status: ok ? 200 : 500,
        json: () => Promise.resolve(body),
      })
    }),
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("CourseGrid", () => {
  it("shows skeletons while both GET requests are loading", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)))

    render(<CourseGrid />)

    expect(screen.getByText("Loading courses…")).toBeTruthy()
    expect(document.querySelectorAll(".spc-skeleton-card")).toHaveLength(6)
  })

  it("converts paise to rupees for India", async () => {
    mockApi({ country: "IN" })

    render(<CourseGrid />)

    expect(await screen.findByText("₹1,999")).toBeTruthy()
  })

  it("converts cents to dollars for the US", async () => {
    mockApi({ country: "US" })

    render(<CourseGrid />)

    expect(await screen.findByText("$39.99")).toBeTruthy()
  })

  it("shows a friendly retry state when courses fail", async () => {
    mockApi({ courseOk: false })

    render(<CourseGrid />)

    expect(await screen.findByText("The courses took a detour")).toBeTruthy()
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy()
  })

  it("keeps courses visible without guessing when country detection fails", async () => {
    mockApi({ countryOk: false })

    render(<CourseGrid />)

    expect(await screen.findByText(course.courseName)).toBeTruthy()
    expect(screen.getByText("Price unavailable")).toBeTruthy()
  })

  it("shows the empty state for a valid empty course response", async () => {
    mockApi({ courses: [] })

    render(<CourseGrid />)

    expect(await screen.findByText("New courses are on the way")).toBeTruthy()
  })
})
