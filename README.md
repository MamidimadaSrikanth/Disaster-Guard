# DisasterGuard: Intelligent Disaster Management System

DisasterGuard is a static web application designed to deliver fast, accessible disaster response support. It offers real-time disaster selector controls, emergency action shortcuts, live disaster status, maps, shelter links, medical response tools, volunteer task access, and an AI assistant for guidance.

## Project Overview

This project is a single-page web app built with:
- HTML for structure
- CSS for responsive styling and visual layout
- JavaScript for interactive behavior and dynamic updates

The app presents a polished disaster response dashboard with:
- Selectable disaster types (Flood, Earthquake, Cyclone, Accident)
- SOS action button and quick action cards
- Volunteer task call-to-action
- Live disaster status panel
- Responsive hero layout with centered action panels
- AI assistant interface integration

## Live Deployment

- Live app URL (GitHub Pages): https://mamidimadasrikanth.github.io/Disaster-Guard/

## Key Features

- Disaster type selector with icon-rich buttons
- Emergency `SOS` button with animated rings
- Quick action cards for:
  - Find Shelter
  - Live Map
  - Medical Help
  - Volunteer Task
  - AI Assistant
- Centered hero layout and improved mobile usability
- Accessible button and keyboard support
- Responsive styling for smaller screens

## Architecture

The project is structured as a simple static web application with three main layers:

- **Presentation Layer**
  - `index.html` defines the visual layout, page sections, buttons, and content placeholders.
  - The hero section contains the disaster selector, SOS action, and quick action cards.
- **Styling Layer**
  - `styles.css` controls the visual design, responsive breakpoints, icon sizes, spacing, and hover states.
  - It also includes layout rules for centering the hero content and supporting mobile views.
- **Behavior Layer**
  - `app.js` handles the app state, user interaction, navigation calls, and dynamic updates.
  - It contains disaster selection behavior, quick action navigation, AI assistant messaging, and modal handling.

### Architecture Diagram

```text
      index.html
          |
          v
  -------------------
 | Presentation Layer |
  -------------------
          |
          v
  -------------------     styles.css
 | Styling Layer   | <----------|
  -------------------           |
          |                      v
          v               -------------------
  -------------------    | Layout + Theme   |
 | Behavior Layer  |     -------------------
  -------------------
          |
          v
  Interactive UI updates
```

### How the Project Works

1. **Page loads** from `index.html`, displaying the hero section and quick actions.
2. **Styling** from `styles.css` renders the interface with responsive behavior.
3. **JavaScript** from `app.js` wires interactions:
   - Click handlers for disaster buttons and cards.
   - Dynamic text and status updates.
   - Smooth navigation to page sections.

### File Relationships

- `index.html` includes the markup and references the `styles.css` and `app.js` files.
- `styles.css` styles every element on the page and ensures the component layout stays centered.
- `app.js` adds interactivity to the HTML elements and updates content without page reloads.

## Files in This Project

- `index.html` — main application markup and page structure
- `styles.css` — app styling, layout, responsive behavior, and icon sizing
- `app.js` — interactive application logic, navigation, supply checklist support, and AI assistant messaging
- `manifest.json` — app manifest metadata
- `README.md` — project overview and run instructions

## How to Run the Project Locally

### Option 1: Open directly in browser
1. Open `index.html` in your web browser.
2. The app will load as a static page.

### Option 2: Run a local web server (recommended)
1. Open a terminal in the project folder.
2. Run the following command using Python 3:

```powershell
python -m http.server 8080
```

3. Open your browser and navigate to:

```
http://localhost:8080
```

### Option 3: Use Visual Studio Code Live Server
1. Install the Live Server extension in VS Code.
2. Open the project folder.
3. Right-click `index.html` and choose `Open with Live Server`.

## Notes

- No external package install is required for the static frontend.
- The repository is ready for GitHub hosting and can be deployed as a static site.
- If you want to add backend data or API support, connect the UI logic from `app.js` to a server endpoint.

## Project Goals

- Provide a disaster response interface that is usable on desktop and mobile.
- Highlight urgent actions and volunteer coordination.
- Keep the UI clean, readable, and easy to navigate.
- Support fast local testing with minimal setup.

## License

This project is open for customization and improvement by the owner.
