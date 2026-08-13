import { describe, expect, it } from "vitest"
import {
  formatPrice,
  parseCountry,
  parseCourses,
  type Course,
} from "./CourseGrid"

const course: Course = {
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

describe("formatPrice", () => {
  it("converts paise to rupees", () => {
    expect(formatPrice(course, "IN")).toBe("₹1,999")
  })

  it("converts cents to dollars", () => {
    expect(formatPrice(course, "US")).toBe("$39.99")
  })
})

describe("API response parsing", () => {
  it("accepts an empty course array for the empty state", () => {
    expect(parseCourses([])).toEqual([])
  })

  it("accepts a valid course", () => {
    expect(parseCourses([course])).toEqual([course])
  })

  it("rejects malformed course data", () => {
    expect(() => parseCourses([{ ...course, pricePaise: "199900" }])).toThrow()
  })

  it("only accepts supported country codes", () => {
    expect(parseCountry({ country_code: "IN" })).toBe("IN")
    expect(parseCountry({ country_code: "US" })).toBe("US")
    expect(() => parseCountry({ country_code: "GB" })).toThrow()
  })
})
