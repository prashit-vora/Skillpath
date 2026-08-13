# Skillpath

Skillpath is a landing page built for WebVeda's junior developer assignment. The
page combines an editorial visual direction with a React code component that
loads live course and country data from the supplied API.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run build
```

## Add the component to Framer

1. Open the Framer project and choose **Assets → Code → Create Code File**.
2. Name the file `CourseGrid.tsx`.
3. Copy the complete contents of [`src/CourseGrid.tsx`](src/CourseGrid.tsx) into
   that file.
4. Drag `CourseGrid` from the Assets panel onto the page.
5. Set its width to Fill and leave its supported height on Auto.
6. Use the `Heading` and `Accent` property controls in Framer's right panel.

The hero and footer should be recreated as native Framer layers. The local page
is the visual reference; the courses section is the code component required by
the assignment.

## Failure behaviour

- Course request fails: show a friendly full-section error and retry button.
- Country request alone fails: keep the courses visible, hide currency values,
  and offer retry rather than guessing a country.
- No courses: show a deliberate empty state.
- Requests in progress: show six responsive skeleton cards.

Prices are converted from minor units before formatting: `199900` paise becomes
`₹1,999`, and `3999` cents becomes `$39.99`.
