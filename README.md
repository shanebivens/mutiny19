# Mutiny19 - Indiana Swashbuckling Entrepreneurs

A free, interactive map and list of entrepreneurship events across Indiana. The website automatically aggregates events from various sources, displays them on an interactive map, and allows filtering by date and event features.

## Features

- **Interactive Map**: View all events on a Leaflet-powered map of Indiana
- **List View**: Browse events in a searchable, sortable list
- **Smart Filtering**: Filter by date range and event features
- **Event Icons**: Visual indicators for:
  - Free events
  - Food provided
  - Appetizers available
  - Non-alcoholic drinks
  - Alcoholic beverages
- **Calendar Integration**: Add events to Google Calendar or download as iCal files
- **Auto-Updates**: GitHub Actions automatically scrapes new events daily
- **100% Free**: Hosted on GitHub Pages with no hosting costs

## Live Demo

Once deployed, your site will be available at:
`https://mutiny19.github.io/mutiny19/`

## Quick Start

### 1. Fork or Clone This Repository

```bash
git clone https://github.com/mutiny19/mutiny19.git
cd mutiny19
```

### 2. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Select the `main` branch and `/ (root)` folder
5. Click "Save"

Your site will be live in a few minutes at `https://mutiny19.github.io/mutiny19/`

### 3. Enable GitHub Actions

1. Go to the "Actions" tab in your repository
2. If prompted, click "I understand my workflows, go ahead and enable them"
3. The scraper will now run daily at 6 AM UTC (1 AM EST)

### 4. Manual Trigger (Optional)

To manually run the scraper:
1. Go to "Actions" tab
2. Click "Scrape Events" workflow
3. Click "Run workflow"

## Project Structure

```
.
├── index.html              # Main HTML file
├── styles.css              # Stylesheet
├── app.js                  # JavaScript application logic
├── events.json             # Events data (auto-updated by scraper)
├── scraper/
│   ├── scrape_events.py   # Python scraper script
│   ├── sources.json       # Configuration for event sources
│   └── requirements.txt   # Python dependencies
└── .github/
    └── workflows/
        └── scrape-events.yml  # GitHub Actions workflow
```

## Customizing Event Sources

Edit `scraper/sources.json` to add or modify event sources:

```json
{
  "sources": [
    {
      "name": "Your Event Source",
      "type": "custom",
      "url": "https://example.com/events",
      "enabled": true
    }
  ],
  "keywords": ["entrepreneur", "startup", "networking"],
  "excluded_keywords": ["webinar only", "virtual only"]
}
```

### Supported Source Types

- `eventbrite_search`: Eventbrite search results
- `meetup_group`: Meetup.com groups
- `custom`: Custom websites (requires implementation in `scrape_events.py`)

### Adding Custom Scrapers

To scrape a new website, edit `scraper/scrape_events.py` and add logic in the `scrape_custom()` method:

```python
def scrape_custom(self, source: Dict[str, Any]):
    if source['name'] == 'Your Event Source':
        # Add your scraping logic here
        pass
```

## Manual Event Entry

You can also manually add events by editing `events.json`:

```json
{
  "id": "unique-id",
  "title": "Event Title",
  "description": "Event description",
  "date": "2025-12-01T18:00:00",
  "endDate": "2025-12-01T20:00:00",
  "location": {
    "name": "Venue Name",
    "address": "123 Main St, Indianapolis, IN 46204",
    "lat": 39.7684,
    "lng": -86.1581
  },
  "url": "https://event-website.com",
  "organizer": "Organization Name",
  "features": {
    "free": true,
    "food": true,
    "appetizers": true,
    "nonAlcoholDrinks": true,
    "alcoholDrinks": false
  }
}
```

## Local Development

To test locally:

1. Simply open `index.html` in a web browser, or
2. Use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Scraper Development

To test the scraper locally:

```bash
cd scraper
pip install -r requirements.txt
python scrape_events.py
```

## Technologies Used

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Mapping**: Leaflet.js with OpenStreetMap
- **Scraping**: Python, BeautifulSoup, Requests
- **Automation**: GitHub Actions
- **Hosting**: GitHub Pages (100% free)

## Contributing

Contributions are welcome! To add support for new event sources:

1. Fork the repository
2. Add the source to `scraper/sources.json`
3. If needed, implement custom scraping logic in `scraper/scrape_events.py`
4. Test the scraper locally
5. Submit a pull request

## Troubleshooting

### Events not updating

- Check the "Actions" tab for workflow run status
- Ensure GitHub Actions is enabled for your repository
- Check that the workflow has write permissions to the repository

### Scraper errors

- Review the workflow logs in the "Actions" tab
- Some websites may require additional scraping logic or authentication
- Consider using official APIs when available (e.g., Eventbrite API, Meetup API)

### Map not displaying

- Check browser console for errors
- Ensure `events.json` is properly formatted
- Verify latitude/longitude coordinates are correct

## Future Enhancements

Potential features to add:
- Event categories (workshop, networking, pitch event, etc.)
- User submissions form
- Email notifications for new events
- Advanced search and filtering
- Mobile app version
- Social sharing features

## License

MIT License - feel free to use this for your own community!

## Credits

Built with:
- [Leaflet](https://leafletjs.com/) for mapping
- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- [GitHub Pages](https://pages.github.com/) for hosting
- [GitHub Actions](https://github.com/features/actions) for automation

## Support

For issues or questions:
1. Check existing [Issues](https://github.com/mutiny19/mutiny19/issues)
2. Create a new issue with details
3. Include error messages and screenshots if applicable

---

Made with ❤️ for the Indiana entrepreneurship community
