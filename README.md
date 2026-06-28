# DisasterGuard: Intelligent Disaster Management System

DisasterGuard is a static web application designed to deliver fast, accessible disaster response support. It offers real-time disaster selector controls, emergency action shortcuts, live disaster status, maps, shelter links, medical response tools, volunteer task access, and an AI assistant for guidance.

## Problem Statement

Disaster response needs fast access to critical information during emergencies. A centralized interface is required so users can quickly find shelters, open routes, medical assistance, volunteer tasks, and live alert updates without navigating multiple sources.

## Solution Summary

DisasterGuard solves this by providing a polished, single-page dashboard that combines disaster type selection, SOS escalation, volunteer coordination, real-time status metrics, and AI-guided assistance in one responsive interface. The app is designed for quick decision-making, mobile readiness, and clear user guidance.

## Technology Used

- **HTML** for the application structure and content layout
- **CSS** for visual styling, responsive design, and UI effects
- **JavaScript** for interactive behavior, dynamic content updates, and navigation
- **GitHub Pages** for hosting the live deployment

## Live Deployment

- Live app URL (GitHub Pages): https://mamidimadasrikanth.github.io/Disaster-Guard/

## Demo Screenshots of Website

The website demo includes the following screenshot views:

- **Hero Dashboard:** Shows the disaster selector, SOS action, quick action cards, and current alert status.
- **Live Response Dashboard:** Displays real-time metrics for affected people, shelters, teams, rescue operations, hospitals, and road closures.
- **Interactive Live Map:** Shows active shelter locations, safe routes, hazard zones, and the user location marker.

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

### Option 3: Use Visual Studio Code Live Server or Any other Editiors

1. Install the Live Server extension in VS Code.
2. Open the project folder.
3. Right-click `index.html` and choose `Open with Live Server`.

## How to Use the Application

1. Open the app in your browser.
2. Select the active disaster type from the top buttons.
3. Use the `SOS` button for urgent assistance.
4. Click a quick action card for specific support:
   - `Find Shelter` to locate nearby safe locations.
   - `Live Map` to view open routes and map data.
   - `Medical Help` to access medical assistance information.
   - `Volunteer Task` to join disaster response activities.
   - `AI Assistant` to ask questions and get guidance.
5. Review the live disaster status panel for affected population, shelter counts, and team deployment.

## Demo Screenshots of Website

The website demo includes the following screenshot views:

- **Hero Dashboard**: Shows the disaster selector, SOS action, quick action cards, and current alert status.
- **Live Response Dashboard**: Displays real-time metrics for affected people, shelters, teams, rescue operations, hospitals, and road closures.
- **Interactive Live Map**: Shows active shelter locations, safe routes, hazard zones, and the user location marker.

## Efficiency Considerations

- Static assets make the application fast to load and simple to deploy.
- Minimal external dependencies mean better performance and easier maintenance.
- CSS is structured for responsive behavior so the interface adapts to different screen sizes.
- JavaScript is kept lightweight to ensure quick response to user interactions.

## Future Improvements

- Add real backend APIs for live disaster data and shelter availability.
- Implement user authentication for personalized alerts and task tracking.
- Add offline support and service workers for use during network outages.
- Improve the AI assistant with natural language disaster response.
- Add internationalization for support across regions and languages.

## Conclusion

DisasterGuard provides a streamlined disaster response interface focused on speed, clarity, and accessibility. It is built for quick deployment and testing while leaving room for future enhancements in data integration and user personalization.

## License

This project is open for customization and improvement by the owner.
