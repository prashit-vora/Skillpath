# Skillpath submission

## Links

- Published Framer page: https://slight-courgette-993297.framer.app
- Public source code: https://github.com/prashit-vora/Skillpath
- Shared AI conversation: **Add after creating the share link**

## Short note (under 200 words)

With two more days, I would test the component on more browsers and slower
connections, then add search and keyboard-friendly price sorting. I would also
spend more time validating the spacing and type scale inside Framer at unusual
in-between widths rather than only its named breakpoints.

The hardest decision was handling a successful course request when country
detection fails. I chose to keep the useful course information visible but show
“Price unavailable” instead of guessing a currency. I am happy with that
failure behaviour and the explicit response validation. I am less happy that a
retry reloads both endpoints rather than retrying only the failed country call;
I kept it simple and predictable for this version.

## AI disclosure

I used OpenAI Codex to discuss the architecture, produce an initial component
and test edge cases. I reviewed the implementation, chose the country-failure
behaviour, and verified the price conversion, responsive states, and API
handling. I can explain every line included in the submission.
