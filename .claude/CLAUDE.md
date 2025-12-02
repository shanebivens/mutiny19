# Mutiny19 Project Instructions

## Privacy & Security Rules

**CRITICAL: Never include personal information in any code, commits, or files:**
- No real names (first, last, or full names)
- No company names associated with the maintainer
- No email addresses (except crew@mutiny19.com)
- No usernames or account references

**Git commits must use:**
- Author: Mutiny19 <crew@mutiny19.com>
- All commits should be anonymous

**If you need to reset history:**
```bash
rm -rf .git && git init && git add -A && git commit -m "Initial commit"
git remote add origin https://github.com/mutiny19/mutiny19.git
git push --force origin main
```

## Project Overview

Mutiny19 is a cyber-pirate themed website for Indiana entrepreneurs featuring:
- Event calendar with filterable events (auto-scraped daily)
- Community Intel form (anonymous reporting)
- Discord integration
- Captain Cardinal mascot (XIX)
- i18n support (English/Spanish)

## Brand Voice & Tone

**Core principle: Confident ownership, not angst/opposition**

✅ DO:
- "Your deck. Your helm." (ownership)
- "Built by captains, for captains" (community)
- "Open waters" (inclusive)
- "Founder-funded" (independent)
- "Full visibility" (transparent)
- "The mutiny is FOR what comes next" (forward-looking)

❌ DON'T:
- "No gatekeepers" (oppositional)
- "No corporate sponsors" (defensive)
- "Rebellion against..." (angsty)
- "No curation" (negative framing)

**Pirate theme vocabulary:**
- Founders = Captains
- Events = Ports
- Community = Crew
- Small business = Corner tavern
- Large business = Flagship fleet
- Transparency = Full visibility / Open waters
- Built by founders = Captain-forged

## Tech Stack

- Static HTML/CSS/JS (no framework)
- Leaflet.js for maps
- Python scraper for events
- GitHub Pages hosting
- GitHub Actions for daily scrapes

## Key Files

- `index.html` - Main page
- `styles.css` - All styling (includes CRT effect)
- `app.js` - All JavaScript + i18n translations
- `events.json` - Event data (auto-generated)
- `scraper/` - Python event scraper

## SEO

Title format: `MUTINY19 | Indiana Founders Charting What's Next`
Description style: Use pirate theme, ownership tone, invite to "join the crew"

## Known Security Notes

- Discord webhook URL is exposed in client-side code (known limitation of static site)
- Mitigations: honeypot field, rate limiting, input validation
- If abused, rotate webhook and update app.js
