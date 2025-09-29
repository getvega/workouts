# Workouts app

A minimalist, mobile-first, single-page web application for creating and running custom, timer-based strength training workouts. The application operates entirely client-side, with a focus on a high-contrast, readable UI, reliable audio cues, and configuration persistence via Local Storage and shareable URLs.

## UI Theme & Core Design

- **Default Theme:** A dark mode theme using a black background (#000000) with high-contrast white text.
- **Active State Theme:** During an active exercise interval, the entire screen background transitions to a vibrant orange. All text and UI elements become white to ensure maximum readability.
- **Design Philosophy:** The design is minimalist with a clear visual hierarchy. Fonts are large and bold, intended to be easily legible from a distance.

## Screen 1: Session Configuration

The primary landing screen for setting up a workout.

- **Exercise List:** A dynamic list of exercises that supports adding, deleting, and reordering.
  - **Reordering:** Must be implemented via the native HTML5 Drag-and-Drop API for a smooth user experience.
  - **Defaults:** The list should be pre-populated with a few common exercises (e.g., "Push-ups", "Squats", "Plank") on first load.
  - **Input:** An always-visible text input field is provided for adding new exercises to the list.
- **Time Configuration:** Two separate dropdown menus for setting "Exercise Duration" and "Rest Duration".
  - **Available Options:** 15s, 30s, 45s, 60s, 90s, 120s, 180s.
- **Controls:** A large "Start Workout" button. It is disabled if the exercise list is empty.

## Screen 2: Active Workout Flow

This section covers the two alternating states during a workout set.

### 2a. Exercise in Progress

- **Theme:** Vibrant orange background.
- **Visual Hierarchy:**
  - **Primary Element:** A huge countdown timer.
  - **Secondary Element:** The name of the current exercise.
- **Components:**
  - **Main Timer:** Implemented as a large, animated circular doughnut chart (using Chart.js) with the digital countdown timer overlaid in the center.
  - **Current Exercise:** Displayed in a very large font.
  - **Set Progress Bar:** A thin, horizontal bar at the top of the screen indicating progress through the current set of exercises.
  - **Controls:** A "Pause/Resume" button.

### 2b. Rest Between Exercises

- **Theme:** Dark mode.
- **Visual Hierarchy:**
  - **Primary Element:** The rest countdown timer.
  - **Secondary Element:** The name of the upcoming exercise.
- **Components:**
  - **Main Timer:** Same visual implementation as the exercise timer, but with different colors to match the dark theme.
  - **Next Exercise:** Text displays "Up next: [Exercise Name]".
  - **Set Info:** The current set number (e.g., "Set 1") is displayed.
  - **Controls:** The same "Pause/Resume" button.

## Screen 3: Between Sets (Post-Set Rest)

This screen provides a 30-second timed pause after a full set is completed.

- **Theme:** Dark mode.
- **Visual Hierarchy:** The most prominent element is the "End Workout" button. The secondary focus is the countdown.
- **Logic:** If the user doesn't interact within 30 seconds, the next set begins automatically. After the final exercise of a set, the app transitions directly to this screen, skipping the standard rest interval.
- **Components:**
  - **Congratulatory Message:** A congratulatory message (e.g., "Set 1 Complete!").
  - **Main Timer:** A large digital countdown timer for the 30-second rest.
  - **Controls:** A single, large "End Workout" button.

## Screen 4: Workout Complete

A final summary screen.

- **Components:**
  - **Final Confirmation Message:** A final confirmation message (e.g., "Great Job!").
  - **Summary:** A summary displaying the total number of sets completed.
  - **Total Elapsed Time:** The total elapsed time of the workout.
  - **Controls:** A "New Workout" button to return to the configuration screen.

## Audio & Technical Requirements

- **Audio Cues (Critical):**
  - **Implementation:** Must use a web audio framework like Tone.js to synthesize all sounds. This ensures 100% reliability and prevents audio cues from cutting each other off.
  - **Cues:**
    - **5-second countdown beep:** At the end of every exercise and rest period.
    - **Double-beep:** At the halfway point of an exercise.
    - **Success chime:** When a set is completed.
- **Data Persistence & Sharing:**
  - **Local Storage:** The current configuration (exercises, times) must be saved to Local Storage to persist between browser sessions.
  - **Shareable URL:** The configuration must be encoded (e.g., using Base64) and stored in the URL's hash fragment. Loading a URL with a hash will automatically populate the configuration from it.
- **Screen Wake Lock:** The app must use the navigator.wakeLock API to prevent the screen from sleeping during an active workout.