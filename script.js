// ==============================================================================
// CONSTANTS
// =============================================================================-

const SCHOOL_HOUR_SCHEDULE = {
  Mon: {
    "1st Hour": { start: "07:40", end: "08:32" },
    "2nd Hour": { start: "08:37", end: "09:29" },
    "3rd Hour": { start: "09:34", end: "10:26" },
    "4th Hour": { start: "10:31", end: "11:23" },
    "5th Hour": { start: "11:23", end: "12:56" }, // Includes lunch overlap example
    "6th Hour": { start: "13:01", end: "13:53" },
    "7th Hour": { start: "13:58", end: "14:50" },
  },
  Tue: {
    "1st Hour": { start: "07:40", end: "08:32" },
    "2nd Hour": { start: "08:37", end: "09:29" },
    "3rd Hour": { start: "09:34", end: "10:26" },
    "4th Hour": { start: "10:31", end: "11:23" },
    "5th Hour": { start: "11:23", end: "12:56" }, // Includes lunch overlap example
    "6th Hour": { start: "13:01", end: "13:53" },
    "7th Hour": { start: "13:58", end: "14:50" },
  },
  Wed: {
    "1st Hour": { start: "07:40", end: "09:13" },
    Advisory: { start: "09:20", end: "10:53" },
    "2nd Hour": { start: "10:53", end: "13:10" }, // Includes lunch overlap example
    "3rd Hour": { start: "13:17", end: "14:50" },
  },
  Thu: {
    "4th Hour": { start: "07:40", end: "09:13" },
    "5th Hour": { start: "09:20", end: "10:53" },
    "6th Hour": { start: "10:53", end: "13:10" }, // Includes lunch overlap example
    "7th Hour": { start: "13:17", end: "14:50" },
  },
  Fri: {
    "1st Hour": { start: "07:40", end: "08:32" },
    "2nd Hour": { start: "08:37", end: "09:29" },
    "3rd Hour": { start: "09:34", end: "10:26" },
    "4th Hour": { start: "10:31", end: "11:23" },
    "5th Hour": { start: "11:23", end: "12:56" }, // Includes lunch overlap example
    "6th Hour": { start: "13:01", end: "13:53" },
    "7th Hour": { start: "13:58", end: "14:50" },
  }, // Pre-process SCHOOL_HOUR_SCHEDULE for easier period block rendering
};

const schoolPeriods = {
  Mon: [],
  Tue: [],
  Wed: [],
  Thu: [],
  Fri: [],
};

const courses = []; // Array to hold all course objects

const availableColors = [
  // Available colors for new courses
  "bg-custom-blue",
  "bg-custom-green",
  "bg-custom-purple",
  "bg-custom-yellow",
  "bg-custom-pink",
  "bg-custom-teal",
  "bg-custom-orange",
  "bg-custom-red-500",
];
let colorIndex = 0; // To cycle through colors
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 7; // Schedule starts at 7 AM
const END_HOUR = 15; // Schedule ends at 3 PM (15:00)
const TOTAL_MINUTES_SPAN = (END_HOUR - START_HOUR) * 60; // Total minutes in the visible schedule

// ==============================================================================
// DOCUMENT CONFIGURATIONS
// ==============================================================================

// --- Document Elements ---
const eventModal = document.getElementById("eventModal");
const modalTitle = document.getElementById("modalTitle");
const modalType = document.getElementById("modalType");
const modalDays = document.getElementById("modalDays");
const modalTime = document.getElementById("modalTime");
const modalPeriod = document.getElementById("modalPeriod");
const modalPeriodText = document.getElementById("modalPeriodText");
const closeModalBtn = document.getElementById("closeModal");

// --- Save and Load Functionality ---
const saveScheduleBtn = document.getElementById("saveScheduleBtn");
const loadScheduleBtn = document.getElementById("loadScheduleBtn");
const loadFileInput = document.getElementById("loadFileInput");

// --- High School Course Management ---
const hsCourseNameInput = document.getElementById("courseNameInput");
const hsPeriodHoursInput = document.getElementById("periodHoursInput");
const hsAddCourseBtn = document.getElementById("addCourseBtn");
const highSchoolCoursesList = document.getElementById("highSchoolCoursesList");

// --- Dark/light mode toggle ---
const darkModeToggle = document.getElementById("darkModeToggle");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");

// --- College Course Management ---

const collegeCourseNameInput = document.getElementById(
  "collegeCourseNameInput",
);
const numCollegeSectionsInput = document.getElementById(
  "numCollegeSectionsInput",
);
const generateCollegeSectionInputsBtn = document.getElementById(
  "generateCollegeSectionInputsBtn",
);
const collegeSectionInputsContainer = document.getElementById(
  "collegeSectionInputsContainer",
);
const addCollegeCourseBtn = document.getElementById("addCollegeCourseBtn");
const collegeCoursesList = document.getElementById("collegeCoursesList");

// ==============================================================================
// DATA STRUCTURES
// ==============================================================================

class SchoolClass {
  constructor(name, periodHours, color) {
    this.name = name;
    this.periodHours = periodHours; // Array of period strings
    this.color = color;
    this.type = "High School Class"; // Explicitly set type for display
    this.renderableEvents = [];

    const normalDays = ["Mon", "Tue", "Fri"];

    this.periodHours.forEach((periodHour) => {
      // Add events for normal days (Mon, Tue, Fri)
      normalDays.forEach((day) => {
        const times = SCHOOL_HOUR_SCHEDULE[day][periodHour];
        if (times) {
          this.renderableEvents.push({
            name: this.name,
            day: day,
            startTime: times.start,
            endTime: times.end,
            color: this.color,
            type: this.type,
            period: periodHour,
            isGreyedOut: false, // Default to not greyed out
          });
        }
      });

      // Add event for block days (Wed, Thu) if applicable
      // These are predefined in SCHOOL_HOUR_SCHEDULE by period name,
      // so we can directly check if the period exists for Wed or Thu
      if (SCHOOL_HOUR_SCHEDULE["Wed"][periodHour]) {
        const times = SCHOOL_HOUR_SCHEDULE["Wed"][periodHour];
        this.renderableEvents.push({
          name: this.name,
          day: "Wed",
          startTime: times.start,
          endTime: times.end,
          color: this.color,
          type: this.type,
          period: periodHour,
          isGreyedOut: false, // Default to not greyed out
        });
      }
      if (SCHOOL_HOUR_SCHEDULE["Thu"][periodHour]) {
        const times = SCHOOL_HOUR_SCHEDULE["Thu"][periodHour];
        this.renderableEvents.push({
          name: this.name,
          day: "Thu",
          startTime: times.start,
          endTime: times.end,
          color: this.color,
          type: this.type,
          period: periodHour,
          isGreyedOut: false, // Default to not greyed out
        });
      }
    });
  }
}

class CollegeClass {
  // sections is an array of objects: [{ days: [], startTime: '', endTime: '' }, ...]
  constructor(name, sections, color) {
    this.name = name;
    this.sections = sections; // Array of section objects
    this.color = color;
    this.type = "College Class"; // Explicitly set type for display
    this.renderableEvents = []; // This will hold the actual events to be rendered

    this.sections.forEach((section) => {
      section.days.forEach((day) => {
        this.renderableEvents.push({
          name: this.name,
          day: day,
          startTime: section.startTime,
          endTime: section.endTime,
          color: this.color,
          type: this.type,
          period: null, // College classes don't have school periods
          isGreyedOut: false, // Default to not greyed out
        });
      });
    });
  }
}

// ==============================================================================
// UTIL FUNCTIONS
// ==============================================================================

/**
 * Converts a time string (HH:MM) to minutes from the START_HOUR.
 * @param {string} timeStr - The time string (e.g., '08:30').
 * @returns {number} The time in minutes relative to START_HOUR.
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours - START_HOUR) * 60 + minutes;
}

/**
 * Formats minutes (relative to START_HOUR) into a user-friendly time string (HH:MM AM/PM).
 * @param {number} minutes - The minutes from START_HOUR.
 * @returns {string} The formatted time string.
 */
function formatMinutesToTime(minutes) {
  const totalMinutes = START_HOUR * 60 + minutes;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
}

// Validate time format (HH:MM)
function isValidTime(timeStr) {
  const regex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])$/;
  return regex.test(timeStr);
}

/**
 * Parses a comma-separated string of high school period inputs and normalizes them to standard period names.
 *
 * @param {string} inputString - A comma-separated list of period identifiers (e.g., "1st, 2nd hour, Advisory").
 * @returns {string[]} An array of normalized period names (e.g., ["1st Hour", "2nd Hour", "Advisory"]).
 */
function parseHighSchoolPeriodHoursInput(inputString) {
  const periodMap = {
    1: "1st Hour",
    "1st": "1st Hour",
    "1st hour": "1st Hour",
    2: "2nd Hour",
    "2nd": "2nd Hour",
    "2nd hour": "2nd Hour",
    3: "3rd Hour",
    "3rd": "3rd Hour",
    "3rd hour": "3rd Hour",
    4: "4th Hour",
    "4th": "4th Hour",
    "4th hour": "4th Hour",
    5: "5th Hour",
    "5th": "5th Hour",
    "5th hour": "5th Hour",
    6: "6th Hour",
    "6th": "6th Hour",
    "6th hour": "6th Hour",
    7: "7th Hour",
    "7th": "7th Hour",
    "7th hour": "7th Hour",
    advisory: "Advisory",
    Advisory: "Advisory",
  };
  return inputString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map((s) => periodMap[s.toLowerCase()] || s);
}

// ==============================================================================
// RENDERING FUNCTIONS
// ==============================================================================

/**
 * Renders the dashed period blocks on the schedule grid.
 * These blocks visually represent the standard school period times.
 */
function renderPeriodBlocks() {
  DAYS.forEach((day) => {
    const dayColumn = document.getElementById(`${day.toLowerCase()}Column`);
    if (dayColumn) {
      // Clear existing period blocks to prevent duplicates on re-render
      dayColumn
        .querySelectorAll(".period-block")
        .forEach((block) => block.remove());

      schoolPeriods[day].forEach((period) => {
        const startMinutes = timeToMinutes(period.start);
        const endMinutes = timeToMinutes(period.end);
        const durationMinutes = endMinutes - startMinutes;

        const topPercentage = (startMinutes / TOTAL_MINUTES_SPAN) * 100;
        const heightPercentage = (durationMinutes / TOTAL_MINUTES_SPAN) * 100;

        const periodBlock = document.createElement("div");
        periodBlock.className = "period-block";
        periodBlock.style.top = `${topPercentage}%`;
        periodBlock.style.height = `${heightPercentage}%`;
        // Conditional rendering of the period label: only for "Advisory"
        periodBlock.innerHTML = `${period.label === "Advisory" ? `<span class="opacity-50">${period.label}</span>` : ""}`;
        dayColumn.appendChild(periodBlock);
      });
    }
  });
}

/**
 * Renders the time labels along the left side of the schedule grid.
 */
function renderTimeLabels() {
  // Renamed from renderTimeColumn
  const timeColumn = document.getElementById("timeColumn");
  if (!timeColumn) return;

  // Clear existing time labels
  timeColumn.innerHTML = "";

  for (let i = START_HOUR; i <= END_HOUR; i++) {
    const hourInMinutes = (i - START_HOUR) * 60;
    const topPercentage = (hourInMinutes / TOTAL_MINUTES_SPAN) * 100;

    const timeLabelDiv = document.createElement("div");
    timeLabelDiv.className = "time-label";
    timeLabelDiv.style.top = `${topPercentage}%`; // Position at the start of the hour

    const displayHour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? "AM" : "PM";
    timeLabelDiv.textContent = `${displayHour}:${"00"} ${ampm}`; // Ensure minutes are '00'

    timeColumn.appendChild(timeLabelDiv);
  }
}

/**
 * Toggles the color of an event element between its original color and a greyed-out state.
 * @param {HTMLElement} eventElement - The event slot DOM element to toggle.
 * @param {object} eventData - The corresponding event data object from the courses array.
 */
function toggleEventColor(eventElement, eventData) {
  const originalColor = eventData.color; // Use original color from eventData
  eventData.isGreyedOut = !eventData.isGreyedOut; // Toggle the state in the data

  if (eventData.isGreyedOut) {
    eventElement.classList.remove(originalColor);
    eventElement.classList.add("greyed-out");
  } else {
    eventElement.classList.remove("greyed-out");
    eventElement.classList.add(originalColor);
  }
}

/**
 * Renders all scheduled events (high school and college classes) onto the schedule grid.
 * It clears existing events and re-renders them based on the 'courses' array.
 */
function renderCourses() {
  // Renamed from renderEvents
  // Clear existing events from all day columns
  DAYS.forEach((day) => {
    const dayColumn = document.getElementById(`${day.toLowerCase()}Column`);
    if (dayColumn) {
      dayColumn
        .querySelectorAll(".event-slot")
        .forEach((eventEl) => eventEl.remove());
    }
  });

  // Iterate through all courses and their renderable events
  const allRenderableEvents = [];
  courses.forEach((course) => {
    allRenderableEvents.push(...course.renderableEvents);
  });

  // Group events by day and create initial DOM elements (default to full width)
  const eventsByDay = {};
  DAYS.forEach((day) => (eventsByDay[day] = []));
  allRenderableEvents.forEach((eventData) => {
    const dayColumn = document.getElementById(
      `${eventData.day.toLowerCase()}Column`,
    );
    if (!dayColumn) return;

    const startMinutes = timeToMinutes(eventData.startTime);
    const endMinutes = timeToMinutes(eventData.endTime);
    const durationMinutes = endMinutes - startMinutes;

    const topPercentage = (startMinutes / TOTAL_MINUTES_SPAN) * 100;
    const heightPercentage = (durationMinutes / TOTAL_MINUTES_SPAN) * 100;

    const eventSlot = document.createElement("div");
    // Apply original color or greyed-out class based on eventData.isGreyedOut
    eventSlot.className = `event-slot ${eventData.isGreyedOut ? "greyed-out" : eventData.color} flex flex-col items-center justify-center text-center p-1`;

    // Store original color for toggling back
    eventSlot.dataset.originalColor = eventData.color;

    eventSlot.style.top = `${topPercentage}%`;
    eventSlot.style.height = `${heightPercentage}%`;
    eventSlot.title = `${eventData.name} (${eventData.startTime} - ${eventData.endTime})`; // Tooltip

    // Event content - name and time range
    const eventName = document.createElement("div");
    eventName.className = "font-semibold truncate";
    eventName.textContent = eventData.name;
    eventSlot.appendChild(eventName);

    const eventTime = document.createElement("div");
    eventTime.className = "text-xs opacity-90 truncate";
    eventTime.textContent = `${formatMinutesToTime(startMinutes)} - ${formatMinutesToTime(endMinutes)}`;
    eventSlot.appendChild(eventTime);

    // Store event data for modal (still available if modal is triggered differently)
    eventSlot.dataset.name = eventData.name;
    eventSlot.dataset.type = eventData.type;
    eventSlot.dataset.day = eventData.day;
    eventSlot.dataset.startTime = eventData.startTime;
    eventSlot.dataset.endTime = eventData.endTime;
    eventSlot.dataset.period = eventData.period || ""; // Use empty string if no period
    // No need to store isGreyedOut in dataset as it's directly updated in eventData object

    // Attach click listener for toggling color, passing both element and data
    eventSlot.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent clicks on parent elements if any
      toggleEventColor(eventSlot, eventData);
    });

    // Store the DOM element reference on the eventData object
    eventData.element = eventSlot;
    dayColumn.appendChild(eventSlot); // Append now, then re-position
    eventsByDay[eventData.day].push(eventData);
  });

  // Process each day to apply column packing only for overlapping groups
  DAYS.forEach((day) => {
    const dayEvents = eventsByDay[day];
    if (dayEvents.length === 0) return;

    // Sort events by start time for consistent processing
    dayEvents.sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    const processedEventDataSet = new Set(); // Use a Set to track processed eventData objects

    dayEvents.forEach((eventData) => {
      if (processedEventDataSet.has(eventData)) {
        return; // Already processed as part of a previous overlap group
      }

      const currentOverlapGroup = [];
      const queue = [eventData]; // Use a queue for BFS-like traversal to find connected component
      processedEventDataSet.add(eventData);

      let head = 0;
      while (head < queue.length) {
        const refEvent = queue[head];
        currentOverlapGroup.push(refEvent); // Add to the actual group

        const refStart = timeToMinutes(refEvent.startTime);
        const refEnd = timeToMinutes(refEvent.endTime);

        dayEvents.forEach((potentialOverlapEvent) => {
          if (!processedEventDataSet.has(potentialOverlapEvent)) {
            const poeStart = timeToMinutes(potentialOverlapEvent.startTime);
            const poeEnd = timeToMinutes(potentialOverlapEvent.endTime);

            // Check for overlap between refEvent and potentialOverlapEvent
            if (refStart < poeEnd && refEnd > poeStart) {
              processedEventDataSet.add(potentialOverlapEvent);
              queue.push(potentialOverlapEvent); // Add to queue to process its overlaps later
            }
          }
        });
        head++;
      }

      // At this point, currentOverlapGroup contains a maximal set of transitively overlapping events.
      // Now, apply column packing only within this group.
      if (currentOverlapGroup.length > 1) {
        // Only adjust if there's an actual overlap (more than one event)
        const groupColumns = []; // Stores lastEndTime for each lane in this group

        // Sort within the group for lane assignment (important for greedy packing)
        currentOverlapGroup.sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
        );

        currentOverlapGroup.forEach((groupEvent) => {
          const groupEventStartMinutes = timeToMinutes(groupEvent.startTime);
          const groupEventEndMinutes = timeToMinutes(groupEvent.endTime);

          let assignedLane = -1;
          // Find the first lane where this event can fit
          for (let i = 0; i < groupColumns.length; i++) {
            if (groupEventStartMinutes >= groupColumns[i]) {
              assignedLane = i;
              groupColumns[i] = groupEventEndMinutes; // Update lane's end time
              break;
            }
          }

          if (assignedLane === -1) {
            // No suitable lane found, create a new one
            assignedLane = groupColumns.length;
            groupColumns.push(groupEventEndMinutes);
          }
          groupEvent.visualLane = assignedLane; // Store the local lane for this group
        });

        const maxLanesInGroup = groupColumns.length;
        const columnWidthInGroup = 100 / maxLanesInGroup;

        currentOverlapGroup.forEach((groupEvent) => {
          // Update the actual DOM element's style
          groupEvent.element.style.width = `${columnWidthInGroup}%`;
          groupEvent.element.style.left = `${groupEvent.visualLane * columnWidthInGroup}%`;
        });
      }
      // If currentOverlapGroup.length is 1, it means the event didn't overlap with anything,
      // so its default 100% width and 0% left (set initially) will remain.
    });
  });
}

/**
 * Updates the position of the current time line on the schedule.
 * The line is visible only within the schedule's active hours.
 */
function updateCurrentTimeLine() {
  const currentTimeLine = document.getElementById("currentTimeLine");
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "short" });

  // Only show the line for Mon-Fri during schedule hours
  const isWeekday = DAYS.includes(currentDay);
  const isDuringHours = currentHour >= START_HOUR && currentHour <= END_HOUR;

  if (isWeekday && isDuringHours) {
    currentTimeLine.classList.remove("hidden");

    // Calculate position relative to START_HOUR
    const minutesSinceStart = (currentHour - START_HOUR) * 60 + currentMinute;
    const topPercentage = (minutesSinceStart / TOTAL_MINUTES_SPAN) * 100;

    currentTimeLine.style.top = `${topPercentage}%`;

    // Position the line correctly over the current day's column
    const dayIndex = DAYS.indexOf(currentDay);
    if (dayIndex !== -1) {
      // The schedule content grid has 5 columns (index 0-4 for Mon-Fri)
      // The currentTimeLine is absolute positioned within the schedule-content which itself is grid-column 2 / span 5.
      // So its left should be 0, and its width should span across the entire schedule-content.
      currentTimeLine.style.left = "0";
      currentTimeLine.style.right = "0"; // Span full width of schedule-content
      currentTimeLine.style.gridColumn = `${dayIndex + 1}`; // Align within the schedule-content's grid
    } else {
      currentTimeLine.classList.add("hidden");
    }
  } else {
    currentTimeLine.classList.add("hidden");
  }
}

function renderHighSchoolCoursesList() {
  highSchoolCoursesList.innerHTML = "";

  courses.forEach((course, index) => {
    if (course.type === "High School Class") {
      // Changed 'School Class' to 'High School Class'
      const listItem = document.createElement("li");
      listItem.className =
        "flex justify-between items-center p-3 rounded-md shadow-sm list-item";

      listItem.innerHTML = `
                            <span class="font-medium">${course.name}</span>
                            <button data-index="${index}" class="remove-btn bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">Remove</button>
                        `;
      highSchoolCoursesList.appendChild(listItem);
    }
  });

  document
    .querySelectorAll("#highSchoolCoursesList .remove-btn")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        const indexToRemove = parseInt(event.target.dataset.index);
        removeCourse(indexToRemove);
      });
    });
}

/**
 * Renders the list of college courses in the sidebar
 */
function renderCollegeCoursesList() {
  collegeCoursesList.innerHTML = ""; // Clear existing list

  courses.forEach((course, index) => {
    if (course.type === "College Class") {
      const listItem = document.createElement("li");
      listItem.className =
        "flex justify-between items-center p-3 rounded-md shadow-sm list-item";

      // Display only the course name and number of sections
      const numSections = course.sections.length;
      listItem.innerHTML = `
                            <span class="font-medium">${course.name} <span class="text-sm">(${numSections} section${numSections === 1 ? "" : "s"})</span></span>
                            <button data-index="${index}" class="remove-btn bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">Remove</button>
                        `;
      collegeCoursesList.appendChild(listItem);
    }
  });

  document
    .querySelectorAll("#collegeCoursesList .remove-btn")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        const indexToRemove = parseInt(event.target.dataset.index);
        removeCourse(indexToRemove);
      });
    });
}

/**
 * Displays the event modal with the provided event details.
 * Populates the modal fields with event information such as name, type, day, and time.
 * If the event is a "High School Class" and includes a period, the period is shown; otherwise, it is hidden.
 *
 * @param {Object} eventDetails - The details of the event to display in the modal.
 * @param {string} eventDetails.name - The name of the event.
 * @param {string} eventDetails.type - The type of the event (e.g., "High School Class").
 * @param {string} eventDetails.day - The day the event occurs.
 * @param {string} eventDetails.startTime - The start time of the event.
 * @param {string} eventDetails.endTime - The end time of the event.
 * @param {string} [eventDetails.period] - The period of the class (only for "High School Class" events).
 */
function showEventModal(eventDetails) {
  modalTitle.textContent = eventDetails.name;
  modalType.textContent = eventDetails.type;
  modalDays.textContent = eventDetails.day;
  modalTime.textContent = `${eventDetails.startTime} - ${eventDetails.endTime}`;

  if (eventDetails.type === "High School Class" && eventDetails.period) {
    // Changed 'School Class' to 'High School Class' for consistency
    modalPeriod.classList.remove("hidden");
    modalPeriodText.textContent = eventDetails.period;
  } else {
    modalPeriod.classList.add("hidden");
  }

  eventModal.classList.remove("hidden");
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  } else {
    document.documentElement.classList.remove("dark");
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  }
}

/**
 * Sets up a toggleable panel that collapses/expands vertically on mobile and horizontally on desktop.
 * The function manages the panel's state, updates the toggle button icon, and handles responsive behavior.
 *
 * @param {string} panelId - The ID of the panel element to be toggled.
 * @param {string} toggleId - The ID of the button element that triggers the toggle action.
 *
 * The panel element should contain a child with the class "panel-content" and a heading (h2).
 * The toggle button's inner HTML will be updated with appropriate SVG icons based on the state and viewport size.
 *
 * Responsive behavior:
 * - On mobile (window width <= 768px): Collapses/expands the panel vertically, always showing the heading.
 * - On desktop: Collapses/expands the panel horizontally, hiding the heading when collapsed.
 *
 * Event listeners are added for the toggle button (click) and window resize to update the panel state accordingly.
 */
function setupPanelToggle(panelId, toggleId) {
  const panel = document.getElementById(panelId);
  const toggleButton = document.getElementById(toggleId);
  const panelContent = panel.querySelector(".panel-content");
  const heading = panel.querySelector("h2");

  const updatePanelState = () => {
    const isCollapsed = panel.classList.contains("collapsed");
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Mobile: collapse vertically
      heading.style.display = "block"; // Always show heading on mobile
      if (isCollapsed) {
        panelContent.style.display = "none";
        toggleButton.innerHTML =
          '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>'; // Arrow down
      } else {
        panelContent.style.display = "block";
        toggleButton.innerHTML =
          '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>'; // Arrow up
      }
    } else {
      // Desktop: collapse horizontally
      if (isCollapsed) {
        heading.style.display = "none";
        panelContent.style.display = "none";
        toggleButton.innerHTML =
          '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>'; // Arrow right
      } else {
        heading.style.display = "block";
        panelContent.style.display = "block";
        toggleButton.innerHTML =
          '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>'; // Arrow left
      }
    }
  };

  // Initial state setup
  updatePanelState();

  // Event listener for toggle button
  toggleButton.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    updatePanelState();
  });

  // Update on window resize
  window.addEventListener("resize", updatePanelState);
}

/**
 * Dynamically generates input fields for entering college course sections.
 * Clears any previous inputs and creates a set of input groups based on the number specified.
 * Each section includes fields for days, start time, and end time.
 * Displays a validation message if the number of sections is invalid.
 */
function generateCollegeSectionInputs() {
  collegeSectionInputsContainer.innerHTML = ""; // Clear previous inputs
  const numSections = parseInt(numCollegeSectionsInput.value);

  if (isNaN(numSections) || numSections <= 0) {
    collegeSectionInputsContainer.innerHTML =
      '<p class="text-sm text-red-500">Please enter a valid number of sections (1 or more).</p>';
    return;
  }

  for (let i = 0; i < numSections; i++) {
    const sectionDiv = document.createElement("div");
    sectionDiv.className =
      "section-input-group border border-dashed rounded-md p-3 space-y-2";
    sectionDiv.innerHTML = `
                                                <h4 class="font-semibold">Section ${i + 1}</h4>
                                                <div>
                                                        <label class="block text-sm font-medium">Days (comma-separated: Mon, Tue, Wed, Thu, Fri):</label>
                                                        <input type="text" class="section-days-input mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., Mon, Wed, Fri">
                                                </div>
                                                <div class="flex gap-2">
                                                        <div class="w-1/2">
                                                                <label class="block text-sm font-medium">Start Time (HH:MM):</label>
                                                                <input type="text" class="section-start-time-input mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., 09:00">
                                                        </div>
                                                        <div class="w-1/2">
                                                                <label class="block text-sm font-medium">End Time (HH:MM):</label>
                                                                <input type="text" class="section-end-time-input mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., 10:15">
                                                        </div>
                                                </div>
                                        `;
    collegeSectionInputsContainer.appendChild(sectionDiv);
  }
}

/**
 * Removes a course from the courses array at the specified index and updates the UI.
 *
 * @param {number} index - The index of the course to remove from the courses array.
 */
function removeCourse(index) {
  courses.splice(index, 1);
  renderCourses();
  renderHighSchoolCoursesList(); // Re-render both lists to update indices and content
  renderCollegeCoursesList();
}

// ==============================================================================
// EVENT HANDLERS/LISTENERS
// ==============================================================================

closeModalBtn.addEventListener("click", () => {
  eventModal.classList.add("hidden");
});

eventModal.addEventListener("click", (e) => {
  if (e.target === eventModal) {
    eventModal.classList.add("hidden");
  }
});

darkModeToggle.addEventListener("click", () => {
  if (document.documentElement.classList.contains("dark")) {
    applyTheme("light");
    localStorage.setItem("theme", "light");
  } else {
    applyTheme("dark");
    localStorage.setItem("theme", "dark"); // Corrected from localStorage.setItem('dark');
  }
});

hsAddCourseBtn.addEventListener("click", () => {
  const name = hsCourseNameInput.value.trim();
  const periodHoursString = hsPeriodHoursInput.value.trim();

  if (!name || !periodHoursString) {
    alert(
      "Please enter both course name and hours offered for high school class.",
    );
    return;
  }

  const periodHours = parseHighSchoolPeriodHoursInput(periodHoursString);
  const hasValidPeriod = periodHours.some((ph) => {
    return Object.values(SCHOOL_HOUR_SCHEDULE).some(
      (daySchedule) => daySchedule[ph],
    );
  });

  if (!hasValidPeriod) {
    alert(
      'Please enter valid period hours (e.g., "1st Hour", "Advisory", "4th Hour") for high school class.',
    );
    return;
  }

  const newColor = availableColors[colorIndex % availableColors.length];
  colorIndex++;

  const newCourse = new SchoolClass(name, periodHours, newColor);
  courses.push(newCourse);

  hsCourseNameInput.value = "";
  hsPeriodHoursInput.value = "";

  renderCourses();
  renderHighSchoolCoursesList();
});

addCollegeCourseBtn.addEventListener("click", () => {
  const name = collegeCourseNameInput.value.trim();
  if (!name) {
    alert("Please enter a college course name.");
    return;
  }

  const sections = [];
  let isValid = true;
  const sectionInputGroups = collegeSectionInputsContainer.querySelectorAll(
    ".section-input-group",
  );

  if (sectionInputGroups.length === 0) {
    alert(
      "Please generate and fill in at least one section for the college course.",
    );
    return;
  }

  sectionInputGroups.forEach((group) => {
    const daysInput = group.querySelector(".section-days-input").value.trim();
    const startTimeInput = group
      .querySelector(".section-start-time-input")
      .value.trim();
    const endTimeInput = group
      .querySelector(".section-end-time-input")
      .value.trim();

    // Normalize input days to match the case in the DAYS array ('Mon', 'Tue', etc.)
    const originalDaysArray = daysInput
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "");
    const parsedDays = originalDaysArray
      .map((d) => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase())
      .filter((d) => DAYS.includes(d));

    if (
      parsedDays.length !== originalDaysArray.length ||
      !isValidTime(startTimeInput) ||
      !isValidTime(endTimeInput)
    ) {
      alert(
        "Please ensure all section fields are filled correctly, days are valid (Mon, Tue, etc.), and times are in HH:MM format (e.g., 09:00).",
      );
      isValid = false;
      return;
    }

    // Additional time validation: end time must be after start time
    const startMinutes = timeToMinutes(startTimeInput);
    const endMinutes = timeToMinutes(endTimeInput);
    if (endMinutes <= startMinutes) {
      alert("End time must be after start time for all sections.");
      isValid = false;
      return;
    }

    sections.push({
      days: parsedDays,
      startTime: startTimeInput,
      endTime: endTimeInput,
    });
  });

  if (!isValid) return; // Stop if any section input was invalid

  const newColor = availableColors[colorIndex % availableColors.length];
  colorIndex++;

  const newCourse = new CollegeClass(name, sections, newColor);
  courses.push(newCourse);

  collegeCourseNameInput.value = "";
  numCollegeSectionsInput.value = "1"; // Reset to 1 section
  collegeSectionInputsContainer.innerHTML = ""; // Clear generated sections

  renderCourses();
  renderHighSchoolCoursesList(); // Re-render HS list in case indices changed
  renderCollegeCoursesList();
});

generateCollegeSectionInputsBtn.addEventListener(
  "click",
  generateCollegeSectionInputs,
);

saveScheduleBtn.addEventListener("click", () => {
  const scheduleData = JSON.stringify(courses, null, 2); // Pretty print JSON
  const blob = new Blob([scheduleData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "algernon_schedule.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

loadScheduleBtn.addEventListener("click", () => {
  loadFileInput.click(); // Trigger the hidden file input click
});

loadFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const loadedData = JSON.parse(e.target.result);
      if (Array.isArray(loadedData)) {
        // Clear existing courses
        courses.length = 0;
        // Re-populate courses array with loaded data
        loadedData.forEach((loadedCourse) => {
          // Ensure loaded data conforms to class structure
          if (loadedCourse.type === "High School Class") {
            const newHsCourse = new SchoolClass(
              loadedCourse.name,
              loadedCourse.periodHours,
              loadedCourse.color,
            );
            newHsCourse.renderableEvents = loadedCourse.renderableEvents.map(
              (event) => ({
                ...event,
                isGreyedOut: event.isGreyedOut || false, // Ensure isGreyedOut is present
              }),
            );
            courses.push(newHsCourse);
          } else if (loadedCourse.type === "College Class") {
            const newCollegeCourse = new CollegeClass(
              loadedCourse.name,
              loadedCourse.sections,
              loadedCourse.color,
            );
            newCollegeCourse.renderableEvents =
              loadedCourse.renderableEvents.map((event) => ({
                ...event,
                isGreyedOut: event.isGreyedOut || false, // Ensure isGreyedOut is present
              }));
            courses.push(newCollegeCourse);
          }
        });

        // Re-render everything
        renderCourses();
        renderHighSchoolCoursesList();
        renderCollegeCoursesList();
        alert("Schedule loaded successfully!");
      } else {
        alert("Invalid file format. Please select a valid schedule file.");
      }
    } catch (error) {
      console.error("Error parsing schedule file:", error);
      alert(
        "Error loading schedule. Please ensure the file is a valid JSON format.",
      );
    }
  };
  reader.readAsText(file);
});

// ============================
// initial rendering and updates
// ============================

window.addEventListener("load", () => {
  renderTimeLabels(); // Corrected function name
  renderPeriodBlocks();
  renderCourses(); // Corrected function name
  renderHighSchoolCoursesList();
  renderCollegeCoursesList(); // Render college courses list on load
  generateCollegeSectionInputs(); // Generate initial section inputs
  updateCurrentTimeLine();
  setInterval(updateCurrentTimeLine, 60 * 1000);
});

window.addEventListener("resize", () => {
  // Clear current events and re-render for responsive layout adjustment
  DAYS.forEach((day) => {
    const dayColumn = document.getElementById(`${day.toLowerCase()}Column`);
    dayColumn.innerHTML = "";
  });
  renderPeriodBlocks(); // Re-render static period blocks
  renderCourses(); // Re-render dynamic courses with updated layout

  updateCurrentTimeLine();
  // Removed the problematic panel resize logic here, as setupPanelToggle already handles it.
});

// ==============================================================================
// SILLY STUFF TO DO ON SCRIPT START
// ==============================================================================

// Populate schoolPeriods with period details from SCHOOL_HOUR_SCHEDULE
Object.keys(SCHOOL_HOUR_SCHEDULE).forEach((day) => {
  for (const periodName in SCHOOL_HOUR_SCHEDULE[day]) {
    const { start, end } = SCHOOL_HOUR_SCHEDULE[day][periodName];
    schoolPeriods[day].push({
      name: periodName,
      start,
      end,
      label: periodName,
    });
  }
  // Sort periods by start time for correct rendering order
  schoolPeriods[day].sort((a, b) => {
    const [aHour, aMin] = a.start.split(":").map(Number);
    const [bHour, bMin] = b.start.split(":").map(Number);
    if (aHour !== bHour) return aHour - bHour;
    return aMin - bMin;
  });
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  applyTheme(savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  applyTheme("dark");
} else {
  applyTheme("light");
}

setupPanelToggle("collegePanel", "collegePanelToggle");
setupPanelToggle("highSchoolPanel", "highSchoolPanelToggle");
