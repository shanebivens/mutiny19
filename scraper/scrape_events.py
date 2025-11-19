#!/usr/bin/env python3
"""
Indiana Entrepreneur Events Scraper
Scrapes events from various sources and outputs to events.json
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup
from dateutil import parser as date_parser
import re

# Playwright imports (optional - only used for JavaScript-heavy sites)
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("Warning: Playwright not installed. JavaScript-heavy sites will be skipped.")

class EventScraper:
    def __init__(self, sources_file='sources.json'):
        """Initialize the scraper with sources configuration"""
        with open(sources_file, 'r') as f:
            config = json.load(f)
            self.sources = config['sources']
            self.keywords = config['keywords']
            self.excluded_keywords = config['excluded_keywords']

        self.events = []
        self.seen_events = set()  # To avoid duplicates

    def fetch_with_playwright(self, url: str, wait_selector: str = None, wait_time: int = 3000) -> str:
        """
        Fetch a URL using Playwright to render JavaScript

        Args:
            url: URL to fetch
            wait_selector: CSS selector to wait for (optional)
            wait_time: Time to wait in milliseconds (default 3000ms)

        Returns:
            Rendered HTML content
        """
        if not PLAYWRIGHT_AVAILABLE:
            print(f"  Playwright not available, skipping {url}")
            return None

        try:
            with sync_playwright() as p:
                # Launch browser in headless mode
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()

                # Set user agent
                page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })

                # Navigate to URL
                page.goto(url, wait_until='networkidle', timeout=30000)

                # Wait for specific selector if provided
                if wait_selector:
                    try:
                        page.wait_for_selector(wait_selector, timeout=wait_time)
                    except:
                        print(f"  Selector {wait_selector} not found, continuing anyway")
                else:
                    # Just wait a bit for dynamic content to load
                    page.wait_for_timeout(wait_time)

                # Get the rendered HTML
                content = page.content()
                browser.close()

                return content

        except Exception as e:
            print(f"  Playwright error: {e}")
            return None

    def scrape_all(self) -> List[Dict[str, Any]]:
        """Scrape all enabled sources"""
        print("Starting scraper...")

        for source in self.sources:
            if not source.get('enabled', True):
                continue

            print(f"Scraping: {source['name']}")
            try:
                if source['type'] == 'eventbrite_search':
                    self.scrape_eventbrite(source)
                elif source['type'] == 'meetup_group':
                    self.scrape_meetup(source)
                elif source['type'] == 'custom':
                    self.scrape_custom(source)
            except Exception as e:
                print(f"Error scraping {source['name']}: {e}")

        print(f"Total events scraped: {len(self.events)}")
        return self.events

    def scrape_eventbrite(self, source: Dict[str, Any]):
        """Scrape Eventbrite search results"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(source['url'], headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Note: Eventbrite structure changes frequently
            # This is a basic example - may need updates
            events = soup.find_all('div', class_='discover-search-desktop-card')

            for event_elem in events[:10]:  # Limit to 10 events per source
                try:
                    title_elem = event_elem.find('h3') or event_elem.find('h2')
                    if not title_elem:
                        continue

                    title = title_elem.get_text(strip=True)

                    # Check if event matches keywords
                    if not self._matches_keywords(title):
                        continue

                    # Extract event details
                    link_elem = event_elem.find('a', href=True)
                    url = link_elem['href'] if link_elem else source['url']

                    # Try to extract date
                    date_elem = event_elem.find('time') or event_elem.find('p', class_=re.compile('date'))
                    event_date = self._parse_date(date_elem.get_text(strip=True) if date_elem else '')

                    if not event_date or event_date < datetime.now():
                        continue

                    event_data = {
                        'title': title,
                        'url': url,
                        'date': event_date.isoformat(),
                        'source': source['name']
                    }

                    self._add_event(event_data)

                except Exception as e:
                    print(f"Error parsing Eventbrite event: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching Eventbrite: {e}")

    def scrape_meetup(self, source: Dict[str, Any]):
        """Scrape Meetup.com events"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(source['url'], headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Note: Meetup requires authentication for API
            # This is basic scraping - consider using Meetup API with key
            event_elements = soup.find_all('div', {'data-event-label': True})

            for event_elem in event_elements[:10]:
                try:
                    title_elem = event_elem.find('h3') or event_elem.find('span', class_=re.compile('eventTitle'))
                    if not title_elem:
                        continue

                    title = title_elem.get_text(strip=True)

                    if not self._matches_keywords(title):
                        continue

                    link_elem = event_elem.find('a', href=True)
                    url = link_elem['href'] if link_elem else source['url']
                    if url.startswith('/'):
                        url = 'https://www.meetup.com' + url

                    event_data = {
                        'title': title,
                        'url': url,
                        'source': source['name']
                    }

                    self._add_event(event_data)

                except Exception as e:
                    print(f"Error parsing Meetup event: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching Meetup: {e}")

    def scrape_custom(self, source: Dict[str, Any]):
        """Scrape custom sources (specific implementations)"""
        name = source.get('name', '')

        if 'TechPoint' in name:
            self.scrape_techpoint(source)
        elif '1 Million Cups' in name or '1MC' in name:
            self.scrape_1mc(source)
        elif '16 Tech' in name:
            self.scrape_16tech(source)
        elif 'Dimension Mill' in name or 'The Mill' in name:
            self.scrape_dimension_mill(source)
        elif 'Launch Fishers' in name:
            self.scrape_launch_fishers(source)
        elif 'Venture Club' in name:
            self.scrape_venture_club(source)
        else:
            print(f"No custom scraper implemented for {name}")

    def scrape_techpoint(self, source: Dict[str, Any]):
        """Scrape TechPoint events"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(source['url'], headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')

            # TechPoint uses Elementor/Jet Listing Grid
            event_items = soup.find_all('div', class_='jet-listing-grid__item')

            print(f"Found {len(event_items)} potential events on TechPoint")

            for item in event_items[:15]:  # Limit to 15 events
                try:
                    # Extract title
                    title_elem = item.find(class_='event-title') or item.find('h3') or item.find('h2')
                    if not title_elem:
                        continue

                    title = title_elem.get_text(strip=True)

                    # Extract link
                    link = item.find('a', href=True)
                    url = link['href'] if link else source['url']
                    if url.startswith('/'):
                        url = 'https://techpoint.org' + url

                    # Extract date from listing
                    date_str = ''
                    month_elem = item.find(class_='month')
                    day_elem = item.find(class_='day')

                    if month_elem and day_elem:
                        month = month_elem.get_text(strip=True)
                        day = day_elem.get_text(strip=True)
                        # Try to get year, default to 2025
                        year = datetime.now().year
                        if datetime.now().month == 12 and month in ['Jan', 'Feb', 'Mar']:
                            year += 1
                        date_str = f"{month} {day}, {year}"

                    event_date = self._parse_date(date_str) if date_str else None

                    # Skip past events
                    if event_date and event_date < datetime.now():
                        continue

                    # Try to fetch individual event page for better details
                    description = title
                    if url and url != source['url']:
                        try:
                            event_response = requests.get(url, headers=headers, timeout=8)
                            event_soup = BeautifulSoup(event_response.content, 'html.parser')

                            # Try multiple selectors for description
                            desc_elem = (
                                event_soup.find('div', class_='entry-content') or
                                event_soup.find('div', class_='event-description') or
                                event_soup.find('div', class_='elementor-widget-text-editor') or
                                event_soup.find('article')
                            )

                            if desc_elem:
                                # Get text, clean it up
                                desc_text = desc_elem.get_text(separator=' ', strip=True)
                                # Limit to first 500 chars
                                description = desc_text[:500] + '...' if len(desc_text) > 500 else desc_text

                            # Try to find more specific date/time
                            time_elem = event_soup.find('time') or event_soup.find(class_=re.compile('date|time'))
                            if time_elem and not event_date:
                                time_str = time_elem.get_text(strip=True)
                                parsed_date = self._parse_date(time_str)
                                if parsed_date:
                                    event_date = parsed_date

                        except Exception as e:
                            print(f"  Could not fetch details for {title}: {e}")
                            # Continue with what we have
                            pass

                    event_data = {
                        'title': title,
                        'description': description,
                        'url': url,
                        'date': event_date.isoformat() if event_date else datetime.now().isoformat(),
                        'source': source['name']
                    }

                    self._add_event(event_data)
                    print(f"  Added: {title}")

                except Exception as e:
                    print(f"Error parsing TechPoint event: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching TechPoint: {e}")

    def scrape_1mc(self, source: Dict[str, Any]):
        """Scrape 1 Million Cups events"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(source['url'], headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Determine city from URL
            city = 'Indianapolis' if 'indy' in source['url'].lower() else 'South Bend'

            # Try to find event schedule or calendar
            event_items = soup.find_all(['div', 'article'], class_=re.compile('event|meeting|schedule'))

            # Try to get description from the page
            description = 'Join entrepreneurs for coffee, conversation, and connections. Two startup presentations followed by community feedback and networking.'

            desc_elem = (
                soup.find('div', class_='description') or
                soup.find('div', class_='content') or
                soup.find('article') or
                soup.find('p')
            )

            if desc_elem:
                desc_text = desc_elem.get_text(separator=' ', strip=True)
                if len(desc_text) > 50 and len(desc_text) < 600:
                    description = desc_text[:500] + '...' if len(desc_text) > 500 else desc_text

            # Generate recurring events for next 3 months
            for i in range(3):
                next_date = self._get_next_1mc_date(city, offset_months=i)

                event_data = {
                    'title': f'1 Million Cups {city}',
                    'description': description,
                    'url': source['url'],
                    'date': next_date.isoformat(),
                    'source': source['name']
                }

                self._add_event(event_data)
                print(f"  Added recurring: 1 Million Cups {city} - {next_date.strftime('%b %d')}")

        except Exception as e:
            print(f"Error fetching 1MC: {e}")

    def _get_next_1mc_date(self, city: str, offset_months: int = 0) -> datetime:
        """Get next 1 Million Cups meeting date"""
        from datetime import timedelta
        from dateutil.relativedelta import relativedelta

        today = datetime.now()
        start_month = today + relativedelta(months=offset_months)

        if 'South Bend' in city:
            # 2nd Wednesday of month at 8 AM
            # Find the 2nd Wednesday of the target month
            first_day = start_month.replace(day=1, hour=8, minute=0, second=0, microsecond=0)

            # Find first Wednesday
            days_until_wed = (2 - first_day.weekday()) % 7
            first_wed = first_day + timedelta(days=days_until_wed)

            # Second Wednesday
            second_wed = first_wed + timedelta(days=7)

            # If this date has passed and offset is 0, get next month
            if second_wed < today and offset_months == 0:
                return self._get_next_1mc_date(city, offset_months=1)

            return second_wed

        else:  # Indianapolis - weekly Wednesdays at 9 AM
            # Get next Wednesday from start_month
            days_ahead = (2 - start_month.weekday()) % 7
            if days_ahead == 0 and start_month <= today:
                days_ahead = 7

            next_wed = start_month + timedelta(days=days_ahead)
            return next_wed.replace(hour=9, minute=0, second=0, microsecond=0)

    def scrape_16tech(self, source: Dict[str, Any]):
        """Scrape 16 Tech Innovation District events (Tribe Events Calendar with JavaScript)"""
        try:
            # Use Playwright to render JavaScript
            html_content = self.fetch_with_playwright(
                source['url'],
                wait_selector='.tribe-events-calendar-month__calendar-event',
                wait_time=5000
            )

            if not html_content:
                print(f"  Could not fetch 16 Tech with Playwright")
                return

            soup = BeautifulSoup(html_content, 'html.parser')

            # Look for Tribe Events calendar events
            event_items = soup.find_all('div', class_=lambda x: x and 'tribe-events-calendar-month__calendar-event' in x)

            print(f"Found {len(event_items)} potential events at 16 Tech")

            for item in event_items[:15]:
                try:
                    # Find title in the event
                    title_elem = item.find('h3', class_='tribe-events-calendar-month__calendar-event-title')
                    if not title_elem:
                        title_elem = item.find('a', class_='tribe-events-calendar-month__calendar-event-title-link')

                    if not title_elem:
                        continue

                    # Get title and link
                    link = title_elem if title_elem.name == 'a' else title_elem.find('a')
                    if not link:
                        continue

                    title = link.get_text(strip=True)
                    url = link.get('href', '')
                    if url.startswith('/'):
                        url = 'https://16tech.com' + url

                    # Find date/time - look for datetime attribute or text
                    time_elem = item.find('time')
                    event_date = None
                    if time_elem:
                        date_str = time_elem.get('datetime', '') or time_elem.get_text(strip=True)
                        event_date = self._parse_date(date_str)

                    if not event_date or event_date < datetime.now():
                        continue

                    # Description - use title for now (could fetch individual page for more details)
                    description = title

                    # Check for cost/free
                    cost_elem = item.find(class_=re.compile('cost|price'))
                    if cost_elem:
                        cost_text = cost_elem.get_text(strip=True)
                        description = f"{title}. {cost_text}"

                    event_data = {
                        'title': title,
                        'description': description,
                        'url': url,
                        'date': event_date.isoformat(),
                        'source': source['name']
                    }

                    self._add_event(event_data)
                    print(f"  Added: {title}")

                except Exception as e:
                    print(f"  Error parsing 16 Tech event: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching 16 Tech: {e}")

    def scrape_dimension_mill(self, source: Dict[str, Any]):
        """Scrape The Mill at Dimension Mill events"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(source['url'], headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Look for event links or calendar
            event_links = soup.find_all('a', href=re.compile('event|calendar'))

            print(f"Found {len(event_links)} potential event links at The Mill")

            for link in event_links[:10]:
                try:
                    url = link.get('href', '')
                    if url.startswith('/'):
                        url = 'https://www.dimensionmill.org' + url

                    title = link.get_text(strip=True)
                    if not title or len(title) < 5:
                        continue

                    # Try to fetch individual event page
                    try:
                        event_response = requests.get(url, headers=headers, timeout=8)
                        event_soup = BeautifulSoup(event_response.content, 'html.parser')

                        # Look for date
                        date_elem = event_soup.find('time') or event_soup.find(class_=re.compile('date'))
                        event_date = None
                        if date_elem:
                            date_str = date_elem.get('datetime', '') or date_elem.get_text(strip=True)
                            event_date = self._parse_date(date_str)

                        if not event_date or event_date < datetime.now():
                            continue

                        # Look for description
                        desc_elem = event_soup.find(class_=re.compile('description|content|entry'))
                        description = desc_elem.get_text(strip=True)[:500] if desc_elem else title

                        event_data = {
                            'title': title,
                            'description': description,
                            'url': url,
                            'date': event_date.isoformat(),
                            'source': source['name']
                        }

                        self._add_event(event_data)
                        print(f"  Added: {title}")

                    except Exception as e:
                        print(f"  Could not fetch event details: {e}")
                        continue

                except Exception as e:
                    print(f"  Error parsing Mill event: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching The Mill: {e}")

    def scrape_launch_fishers(self, source: Dict[str, Any]):
        """Scrape Launch Fishers events calendar (JavaScript rendered)"""
        try:
            # Use Playwright to render JavaScript
            html_content = self.fetch_with_playwright(
                source['url'],
                wait_selector='h3',
                wait_time=5000
            )

            if not html_content:
                print(f"  Could not fetch Launch Fishers with Playwright")
                return

            soup = BeautifulSoup(html_content, 'html.parser')

            # Look for event links and headings
            event_links = soup.find_all('a', href=re.compile('/event/'))

            print(f"Found {len(event_links)} potential events at Launch Fishers")

            seen_urls = set()
            for link in event_links[:15]:
                try:
                    url = link['href']
                    if not url.startswith('http'):
                        url = 'https://www.launchfishers.com' + url

                    # Avoid duplicates
                    if url in seen_urls:
                        continue
                    seen_urls.add(url)

                    # Find title - might be in h3 or the link text
                    title = link.get_text(strip=True)
                    if not title or len(title) < 5:
                        # Look for h3 near this link
                        h3 = link.find_parent().find('h3')
                        if h3:
                            title = h3.get_text(strip=True)

                    if not title or len(title) < 5:
                        continue

                    # Look for date near the link - format "Month Day @ Time"
                    parent = link.find_parent()
                    date_text = parent.get_text(strip=True) if parent else ''

                    # Try to extract date using regex
                    date_match = re.search(r'([A-Z][a-z]+\s+\d+)\s*@\s*(\d+:\d+\s*[ap]m)', date_text, re.IGNORECASE)
                    event_date = None
                    if date_match:
                        date_str = date_match.group(0)
                        event_date = self._parse_date(date_str)

                    if not event_date or event_date < datetime.now():
                        continue

                    # Description - use title for now
                    description = title

                    event_data = {
                        'title': title,
                        'description': description,
                        'url': url,
                        'date': event_date.isoformat(),
                        'source': source['name']
                    }

                    self._add_event(event_data)
                    print(f"  Added: {title}")

                except Exception as e:
                    print(f"  Error parsing Launch Fishers event: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching Launch Fishers: {e}")

    def scrape_indiana_iot(self, source: Dict[str, Any]):
        """Scrape Indiana IoT Lab events"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(source['url'], headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Look for event listings
            event_items = soup.find_all(['article', 'div'], class_=re.compile('event|post|item'))

            print(f"Found {len(event_items)} potential events at Indiana IoT Lab")

            for item in event_items[:10]:
                try:
                    # Find title
                    title_elem = item.find(['h1', 'h2', 'h3', 'h4'])
                    if not title_elem:
                        continue

                    title = title_elem.get_text(strip=True)

                    # Find link
                    link = item.find('a', href=True)
                    url = link['href'] if link else source['url']
                    if url.startswith('/'):
                        url = 'https://indianaiotlab.com' + url

                    # Find date
                    date_elem = item.find('time') or item.find(class_=re.compile('date'))
                    event_date = None
                    if date_elem:
                        date_str = date_elem.get('datetime', '') or date_elem.get_text(strip=True)
                        event_date = self._parse_date(date_str)

                    if not event_date or event_date < datetime.now():
                        continue

                    # Find description
                    desc_elem = item.find('p') or item.find(class_=re.compile('excerpt|description'))
                    description = desc_elem.get_text(strip=True)[:500] if desc_elem else title

                    event_data = {
                        'title': title,
                        'description': description,
                        'url': url,
                        'date': event_date.isoformat(),
                        'source': source['name']
                    }

                    self._add_event(event_data)
                    print(f"  Added: {title}")

                except Exception as e:
                    print(f"  Error parsing IoT Lab event: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching Indiana IoT Lab: {e}")

    def scrape_venture_club(self, source: Dict[str, Any]):
        """Scrape Venture Club of Indiana events (Squarespace with JavaScript)"""
        try:
            # Use Playwright to render Squarespace JavaScript
            html_content = self.fetch_with_playwright(
                source['url'],
                wait_selector='.eventlist-item',
                wait_time=5000
            )

            if not html_content:
                print(f"  Could not fetch Venture Club with Playwright")
                return

            soup = BeautifulSoup(html_content, 'html.parser')

            # Venture Club uses Squarespace eventlist structure
            event_items = soup.find_all('div', class_='eventlist-item')

            print(f"Found {len(event_items)} potential events at Venture Club")

            for item in event_items[:15]:
                try:
                    # Find title
                    title_elem = item.find('div', class_='eventlist-title')
                    if not title_elem:
                        continue

                    title_link = title_elem.find('a', href=True)
                    if not title_link:
                        continue

                    title = title_link.get_text(strip=True)
                    url = title_link['href']
                    if url.startswith('/'):
                        url = 'https://www.ventureclub.org' + url

                    # Find date - Squarespace format has month and day separately
                    date_container = item.find('div', class_='eventlist-date')
                    month_elem = date_container.find('span', class_='eventlist-month') if date_container else None
                    day_elem = date_container.find('span', class_='eventlist-day') if date_container else None

                    # Also look in eventlist-meta for full date
                    meta_elem = item.find('ul', class_='eventlist-meta')
                    event_date = None

                    if meta_elem:
                        # First li usually has full date like "Wednesday, December 3, 2025"
                        date_li = meta_elem.find('li')
                        if date_li:
                            date_str = date_li.get_text(strip=True)
                            event_date = self._parse_date(date_str)

                    # Fallback to month + day if full date parsing failed
                    if not event_date and month_elem and day_elem:
                        month = month_elem.get_text(strip=True)
                        day = day_elem.get_text(strip=True)
                        year = datetime.now().year
                        if datetime.now().month == 12 and month in ['Jan', 'Feb', 'Mar']:
                            year += 1
                        date_str = f"{month} {day}, {year}"
                        event_date = self._parse_date(date_str)

                    if not event_date or event_date < datetime.now():
                        continue

                    # Description from meta or use title
                    description = title
                    if meta_elem:
                        # Get location or other details
                        meta_items = meta_elem.find_all('li')
                        if len(meta_items) > 2:
                            description = f"{title}. {meta_items[2].get_text(strip=True)}"[:500]

                    event_data = {
                        'title': title,
                        'description': description,
                        'url': url,
                        'date': event_date.isoformat(),
                        'source': source['name']
                    }

                    self._add_event(event_data)
                    print(f"  Added: {title}")

                except Exception as e:
                    print(f"  Error parsing Venture Club event: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching Venture Club: {e}")

    def _matches_keywords(self, text: str) -> bool:
        """Check if text matches any keywords and doesn't match excluded keywords"""
        text_lower = text.lower()

        # Check excluded keywords first
        for excluded in self.excluded_keywords:
            if excluded.lower() in text_lower:
                return False

        # Check if matches any keyword
        for keyword in self.keywords:
            if keyword.lower() in text_lower:
                return True

        return False

    def _parse_date(self, date_string: str) -> datetime:
        """Parse date string into datetime object"""
        try:
            return date_parser.parse(date_string)
        except:
            return None

    def _add_event(self, event_data: Dict[str, Any]):
        """Add event to list if not duplicate"""
        # Create unique identifier
        identifier = f"{event_data.get('title', '')}_{event_data.get('date', '')}"

        if identifier not in self.seen_events:
            self.seen_events.add(identifier)
            self.events.append(event_data)

    def enrich_events(self):
        """Enrich events with additional data and geocoding"""
        print("Enriching events with geocoding...")

        # Default Indiana locations for events without specific addresses
        indiana_cities = {
            'indianapolis': {'lat': 39.7684, 'lng': -86.1581},
            'fort wayne': {'lat': 41.0793, 'lng': -85.1394},
            'evansville': {'lat': 37.9747, 'lng': -87.5558},
            'south bend': {'lat': 41.6764, 'lng': -86.2520},
            'carmel': {'lat': 39.9784, 'lng': -86.1180},
            'fishers': {'lat': 39.9567, 'lng': -86.0139},
            'bloomington': {'lat': 39.1653, 'lng': -86.5264}
        }

        for event in self.events:
            # Try to determine location from title or URL
            location_found = False
            title_lower = event.get('title', '').lower()

            for city, coords in indiana_cities.items():
                if city in title_lower:
                    event['location'] = {
                        'name': city.title(),
                        'address': f'{city.title()}, Indiana',
                        'lat': coords['lat'],
                        'lng': coords['lng']
                    }
                    location_found = True
                    break

            if not location_found:
                # Default to Indianapolis
                event['location'] = {
                    'name': 'Indianapolis',
                    'address': 'Indianapolis, IN',
                    'lat': 39.7684,
                    'lng': -86.1581
                }

            # Set default features (would need actual detection from event description)
            event['features'] = {
                'free': 'free' in event.get('title', '').lower(),
                'food': 'food' in event.get('title', '').lower() or 'lunch' in event.get('title', '').lower(),
                'appetizers': 'appetizer' in event.get('title', '').lower(),
                'nonAlcoholDrinks': True,  # Assume most have non-alcoholic options
                'alcoholDrinks': 'happy hour' in event.get('title', '').lower() or 'beer' in event.get('title', '').lower()
            }

            # Add missing fields
            if 'organizer' not in event:
                event['organizer'] = event.get('source', 'Unknown')

            if 'description' not in event:
                event['description'] = f"Entrepreneur event: {event.get('title', '')}"

            if 'id' not in event:
                event['id'] = str(abs(hash(event.get('title', '') + event.get('date', ''))))

    def save_to_json(self, output_file='../events.json'):
        """Save scraped events to JSON file"""
        output = {
            'lastUpdated': datetime.now().isoformat(),
            'events': self.events
        }

        output_path = os.path.join(os.path.dirname(__file__), output_file)

        with open(output_path, 'w') as f:
            json.dump(output, f, indent=2)

        print(f"Saved {len(self.events)} events to {output_path}")

def main():
    """Main function"""
    try:
        scraper = EventScraper()
        scraper.scrape_all()
        scraper.enrich_events()
        scraper.save_to_json()
        print("Scraping completed successfully!")
        return 0
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
