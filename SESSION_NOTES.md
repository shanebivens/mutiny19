# Mutiny19 - Session Notes for Future Development

## Project Overview
Mutiny19 is a cyber-pirate themed website for the Indiana entrepreneur ecosystem. It features:
- Event calendar with filterable Indiana entrepreneur events
- Captain Cardinal story (grateful, whimsical tone celebrating the ecosystem)
- Community Intel form (anonymous reporting for champions/warnings)
- Discord integration for community

**Live Site:** https://mutiny19.github.io/mutiny19
**Repository:** https://github.com/mutiny19/mutiny19

---

## 🔐 Security Considerations

### ⚠️ KNOWN SECURITY LIMITATION
**Discord Webhook Exposed in Client-Side Code**
- **Location:** `app.js:471`
- **Risk:** Webhook URL is visible to anyone viewing page source
- **Mitigations in place:**
  - Honeypot field (`index.html:340-343`)
  - Rate limiting: 1 submission/hour via localStorage (`app.js:427-438`)
  - Input validation: 50 char minimum (`app.js:450-463`)
- **Recommendations:**
  - Monitor Discord channel for abuse
  - Rotate webhook URL if spammed
  - Future: Consider Cloudflare Workers or Netlify Functions for server-side proxy

### No Other Secrets Exposed
- No API keys
- No personal information
- Anonymous form submission (no tracking)

---

## 📁 Project Structure

```
/Mutiny19/
├── index.html          # Main HTML (32KB)
├── styles.css          # All styling (38KB)
├── app.js             # All JavaScript (23KB)
├── events.json         # Generated event data (35KB)
├── hero-cardinal-xix.png  # Hero image (702KB) - ONLY image used
├── /scraper/          # Event scraping system
│   ├── scrape_events.py   # Main scraper (Python)
│   ├── sources.json       # Event source configuration
│   └── requirements.txt   # Python dependencies
├── README.md
├── SESSION_NOTES.md   # This file
└── .gitignore
```

---

## 🎨 Site Features

### 1. Event Calendar (`index.html:135-230`)
- **Filters:** Free, Food, Appetizers, Non-Alcohol Drinks, Alcohol
- **Views:** List, Map, Both
- **Modal:** Event details pop-up with Escape key support

### 2. Community Intel Form (`index.html:242-380`)
- **Dual Mode:** Champion celebrations / Warning reports
- **Fields:** Type, Name/Company, Description, Timeline, Evidence
- **Submission:** Posts to Discord webhook anonymously
- **Anti-Spam:** Honeypot, rate limiting, validation

### 3. Captain Cardinal Story (`index.html:59-132`)
- **Style:** Grateful, whimsical, thought-provoking
- **Accordion:** Expands below hero image
- **Chapters:** 6 chapters celebrating Indiana's ecosystem

### 4. Discord Integration
- **Join Button:** `index.html:406` - https://discord.gg/hy3dAGEhuX
- **Widget:** Shows online members
- **Webhook:** Community Intel form posts

---

## 🔧 Event Scraper System

### Technology Stack
- **Python 3.9+** with libraries:
  - `requests` - HTTP requests
  - `beautifulsoup4` - HTML parsing
  - `icalendar` - iCal feed parsing
  - `python-dateutil` - Date parsing
  - `playwright` - JavaScript rendering (for some sources)

### Scraper Types
1. **iCal Feeds** (preferred - fast, reliable)
   - 16 Tech Innovation District
   - Launch Fishers
   - H7 Network Meetup
   - Smartups Indy Meetup

2. **Custom Scrapers** (Playwright for JavaScript sites)
   - TechPoint Indiana
   - Venture Club
   - 1 Million Cups (recurring events)

3. **Eventbrite Search** (not currently working well)

### Running the Scraper
```bash
cd scraper
python3 scrape_events.py
```

### Adding New Event Sources

**Option 1: iCal Feed (Preferred)**
```json
{
  "name": "Source Name",
  "type": "ical",
  "url": "https://example.com/events.ics",
  "enabled": true,
  "description": "Description here"
}
```

**Option 2: Custom Scraper**
```json
{
  "name": "Source Name",
  "type": "custom",
  "url": "https://example.com/events",
  "enabled": true,
  "description": "Description here"
}
```

Then add scraper logic in `scrape_events.py` following the pattern of existing scrapers.

### Feature Detection
The scraper automatically detects event features:
- **Free:** "free", "no cost", "complimentary", "$0"
- **Food:** "dinner", "lunch", "breakfast", "meal", "pizza"
- **Appetizers:** "appetizer", "snacks", "refreshments"
- **Non-Alcohol:** "coffee", "refreshments", "beverages" (explicit only)
- **Alcohol:** "happy hour", "beer", "wine", "cocktails", "party"
- **Contextual:** Detects "networking" → appetizers, "breakfast" → food

---

## 🎯 Key Code Locations

### Modal Close Button
- **HTML:** `index.html:237` - `<span class="close">&times;</span>`
- **JS:** `app.js:327-349` - Close on X, background click, or Escape key

### Feature Filters
- **HTML:** `index.html:144-162` - Filter checkboxes
- **JS:** `app.js:38-108` - Filter logic
- **Detection:** `scraper/scrape_events.py:1320-1365` - Feature detection

### Community Intel Form
- **HTML:** `index.html:242-380` - Form structure
- **JS:** `app.js:373-545` - Form handling, validation, Discord webhook
- **Webhook:** `app.js:471` - ⚠️ Exposed (see Security section)

### Story Accordion
- **HTML:** `index.html:59-132` - Captain Cardinal story
- **JS:** `app.js:351-371` - Toggle expand/collapse

---

## 🚀 Deployment

### GitHub Pages
- **Branch:** `main`
- **Directory:** `/` (root)
- **URL:** https://mutiny19.github.io/mutiny19

### Update Process
```bash
# After making changes
git add .
git commit -m "Description of changes"
git push

# Site updates automatically within 1-2 minutes
```

### Update Events
```bash
cd scraper
python3 scrape_events.py
cd ..
git add events.json
git commit -m "Update events data"
git push
```

---

## 📋 To-Do / Future Improvements

### High Priority
- [ ] Implement server-side proxy for Discord webhook (Cloudflare Workers/Netlify Functions)
- [ ] Add more event sources (SBDC, Dimension Mill, Powderkeg, ConnectIND, Visit Indy Arts)
- [ ] Optimize hero image (currently 702KB - could be compressed)

### Medium Priority
- [ ] Add event caching to reduce scraper runs
- [ ] Implement event deduplication across sources
- [ ] Add event submission form for community members
- [ ] Create automated scraper schedule (GitHub Actions)

### Low Priority
- [ ] Dark mode toggle
- [ ] Event favoriting (localStorage)
- [ ] iCal export for filtered events
- [ ] Social sharing for events

---

## 🐛 Known Issues

### Resolved
- ✅ Boo Bash & stale events (fixed by using iCal feeds)
- ✅ Modal close button not working (added null safety + Escape key)
- ✅ Too many nonAlcoholDrinks tags (narrowed detection)
- ✅ Wrong event dates (iCal provides accurate dates)

### Current
- ⚠️ Discord webhook exposed in client-side code (limitation of static site)
- ⚠️ Smartups Indy Meetup returns 0 events (might not have upcoming events)
- ⚠️ Some Eventbrite scrapers not working (site structure changed)

---

## 💡 Design Philosophy

### Tone & Style
- **Grateful** over angsty
- **Whimsical** over serious
- **Thought-provoking** over preachy
- **Cyber-pirate** theme throughout

### User Experience
- No emojis unless explicitly requested
- Clean, readable text
- Mobile-friendly responsive design
- Fast loading (all static assets)

### Community Focus
- Anonymous reporting (no tracking)
- Celebrate champions first (default mode)
- Protect founders from bad actors
- Connect entrepreneurs through events

---

## 📞 Contact & Resources

- **Discord:** https://discord.gg/hy3dAGEhuX
- **GitHub:** https://github.com/mutiny19/mutiny19
- **Issues:** Report at GitHub Issues
- **Python Deps:** `cd scraper && pip3 install -r requirements.txt`

---

## 🔄 Common Tasks

### Add a New Event Source
1. Find iCal feed URL if available
2. Add to `scraper/sources.json`
3. Test: `cd scraper && python3 scrape_events.py`
4. Commit: `git add scraper/sources.json events.json && git commit -m "Add [Source Name]"`

### Update Site Content
1. Edit `index.html`, `styles.css`, or `app.js`
2. Test locally by opening `index.html` in browser
3. Commit and push to deploy

### Rotate Discord Webhook
1. Generate new webhook in Discord server settings
2. Update `app.js:471` with new URL
3. Revoke old webhook in Discord
4. Commit and push

### Clean Up Events
```bash
cd scraper
python3 scrape_events.py  # Regenerates events.json
cd ..
git add events.json
git commit -m "Update events - removed stale entries"
git push
```

---

*Last Updated: November 19, 2025*
*Session Summary: Fixed all calendar issues, added iCal parsing, improved security documentation*
