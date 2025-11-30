# Contributing to Indiana Entrepreneur Events

Thank you for your interest in contributing! This document provides guidelines for adding new event sources and improving the project.

## How to Contribute

### Adding Event Sources

The easiest way to contribute is by adding new event sources to the scraper.

#### 1. Add Source to Configuration

Edit `scraper/sources.json` and add your source:

```json
{
  "name": "Your Event Source Name",
  "type": "eventbrite_search|meetup_group|custom",
  "url": "https://example.com/events",
  "enabled": true
}
```

#### 2. For Custom Sources

If your source is not Eventbrite or Meetup, you'll need to add custom scraping logic:

1. Open `scraper/scrape_events.py`
2. Find the `scrape_custom()` method
3. Add your scraping logic:

```python
def scrape_custom(self, source: Dict[str, Any]):
    if source['name'] == 'Your Event Source Name':
        # Your scraping code here
        headers = {'User-Agent': 'Mozilla/5.0...'}
        response = requests.get(source['url'], headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find events and extract data
        for event in soup.find_all('div', class_='event-item'):
            event_data = {
                'title': event.find('h2').get_text(strip=True),
                'url': event.find('a')['href'],
                'date': self._parse_date(event.find('time').get_text()),
                'source': source['name']
            }
            self._add_event(event_data)
```

#### 3. Test Your Scraper

```bash
cd scraper
pip install -r requirements.txt
python scrape_events.py
```

Check that `events.json` is updated with events from your source.

#### 4. Submit a Pull Request

1. Fork the repository
2. Create a new branch: `git checkout -b add-[source-name]`
3. Commit your changes: `git commit -am 'Add [source name] event source'`
4. Push to the branch: `git push origin add-[source-name]`
5. Create a Pull Request

## Event Sources We're Looking For

We're particularly interested in:
- Local chamber of commerce event calendars
- University entrepreneurship centers (IU, Purdue, Butler, etc.)
- Coworking spaces and innovation centers
- Tech meetup groups
- Business accelerators and incubators
- Economic development organizations
- Industry-specific entrepreneur groups

## Code Style

- Python code should follow PEP 8 guidelines
- JavaScript should use modern ES6+ syntax
- Use meaningful variable and function names
- Add comments for complex logic
- Test your changes locally before submitting

## Reporting Issues

Found a bug or have a feature request?

1. Check if the issue already exists
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (browser, OS)

## Improving the Scraper

### Handling Rate Limits

If scraping many sources, add delays:

```python
import time
time.sleep(1)  # Wait 1 second between requests
```

### Better Geocoding

To improve location accuracy, consider integrating:
- Nominatim API (free, OpenStreetMap)
- Google Geocoding API (requires key)
- Mapbox Geocoding API (free tier available)

### Detecting Event Features

Improve automatic detection of free events, food, drinks:

```python
description_lower = description.lower()
features = {
    'free': any(word in description_lower for word in ['free', 'no cost', 'complimentary']),
    'food': any(word in description_lower for word in ['food', 'meal', 'dinner', 'lunch', 'breakfast']),
    # ... etc
}
```

## Questions?

Feel free to:
- Open an issue for discussion
- Tag maintainers in your PR
- Reach out via the contact information in README.md

Thank you for helping make this resource better for the Indiana entrepreneurship community!
