// --- Data Definitions ---

/**
 * Represents a High School class.
 * @typedef {object} SchoolClass
 * @property {string} name - The name of the class.
 * @property {string[]} periods - Array of periods the class is offered (e.g., ["1st", "3rd"]).
 * @property {string[]} days - Array of days the class is offered (e.g., ["Monday", "Wednesday", "Friday"]).
 * @property {string} color - Tailwind CSS color class for the background (e.g., "bg-blue-500").
 */

/**
 * Represents a College (K-State) class.
 * @typedef {object} CollegeClass
 * @property {string} name - The name of the class.
 * @property {string[]} days - Array of days the class is offered (e.g., ["Monday", "Wednesday", "Friday"]).
 * @property {string} startTime - Start time in "HH:MM AM/PM" format.
 * @property {string} endTime - End time in "HH:MM AM/PM" format.
 * @property {string} color - Tailwind CSS color class for the background (e.g., "bg-green-500").
 */

/** @type {SchoolClass[]} */
const schoolClasses = [
    { name: "Algebra I", periods: ["1st", "3rd"], days: ["Monday", "Tuesday", "Friday"], color: "bg-sky-500" },
    { name: "English Lit", periods: ["6th", "7th"], days: ["Monday", "Tuesday", "Friday"], color: "bg-fuchsia-600" },
    { name: "US History", periods: ["4th Block"], days: ["Thursday"], color: "bg-rose-500" },
    { name: "Chemistry", periods: ["1st Block", "2nd Block"], days: ["Wednesday"], color: "bg-emerald-600" },
    { name: "Physics", periods: ["5th Block"], days: ["Thursday"], color: "bg-teal-600" }
];

/** @type {CollegeClass[]} */
const collegeClasses = [
    { name: "Calculus II (K-State)", days: ["Monday", "Wednesday", "Friday"], startTime: "8:00 AM", endTime: "9:15 AM", color: "bg-indigo-700" },
    { name: "Intro to Comp Sci (K-State)", days: ["Tuesday", "Thursday"], startTime: "10:00 AM", endTime: "11:30 AM", color: "bg-orange-600" },
    { name: "Art History (K-State)", days: ["Wednesday"], startTime: "1:00 PM", endTime: "2:30 PM", color: "bg-pink-700" },
    { name: "Economics (K-State)", days: ["Friday"], startTime: "11:00 AM", endTime: "12:15 PM", color: "bg-lime-600" }
];

// --- School Schedule Time Definitions ---
// Base time for calculations (7:00 AM in minutes from midnight)
const CALENDAR_START_HOUR = 7;
const CALENDAR_END_HOUR = 15; // 3 PM
const CALENDAR_START_MINUTES = CALENDAR_START_HOUR * 60; // 7:00 AM
const CALENDAR_END_MINUTES = CALENDAR_END_HOUR * 60; // 3:00 PM

// Convert school period times into a more usable format (minutes from midnight)
const schoolPeriodTimes = {
    "Monday": {
        "1st": { start: "7:40 AM", end: "8:30 AM" },
        "2nd": { start: "8:35 AM", end: "9:25 AM" },
        "3rd": { start: "9:30 AM", end: "10:20 AM" },
        "4th": { start: "10:25 AM", end: "11:23 AM" },
        "5th": { start: "11:23 AM", end: "12:56 PM" }, // Includes lunch
        "6th": { start: "1:01 PM", end: "1:55 PM" },
        "7th": { start: "2:00 PM", end: "2:50 PM" }
    },
    "Tuesday": { /* Same as Monday */
        "1st": { start: "7:40 AM", end: "8:30 AM" },
        "2nd": { start: "8:35 AM", end: "9:25 AM" },
        "3rd": { start: "9:30 AM", end: "10:20 AM" },
        "4th": { start: "10:25 AM", end: "11:23 AM" },
        "5th": { start: "11:23 AM", end: "12:56 PM" }, // Includes lunch
        "6th": { start: "1:01 PM", end: "1:55 PM" },
        "7th": { start: "2:00 PM", end: "2:50 PM" }
    },
    "Friday": { /* Same as Monday */
        "1st": { start: "7:40 AM", end: "8:30 AM" },
        "2nd": { start: "8:35 AM", end: "9:25 AM" },
        "3rd": { start: "9:30 AM", end: "10:20 AM" },
        "4th": { start: "10:25 AM", end: "11:23 AM" },
        "5th": { start: "11:23 AM", end: "12:56 PM" }, // Includes lunch
        "6th": { start: "1:01 PM", end: "1:55 PM" },
        "7th": { start: "2:00 PM", end: "2:50 PM" }
    },
    "Wednesday": { // Blue Day
        "1st Block": { start: "7:40 AM", end: "9:13 AM" },
        "Advisory": { start: "9:20 AM", end: "10:53 AM" },
        "2nd Block": { start: "10:53 AM", end: "1:10 PM" }, // Includes lunch
        "3rd Block": { start: "1:17 PM", end: "2:50 PM" }
    },
    "Thursday": { // Red Day
        "4th Block": { start: "7:40 AM", end: "9:13 AM" },
        "5th Block": { start: "9:20 AM", end: "10:53 AM" },
        "6th Block": { start: "10:53 AM", end: "1:10 PM" }, // Includes lunch
        "7th Block": { start: "1:17 PM", end: "2:50 PM" }
    }
};

// --- Utility Functions ---

/**
 * Converts a time string (e.g., "7:40 AM") to minutes from midnight.
 * @param {string} timeStr - The time string.
 * @returns {number} Minutes from midnight.
 */
function timeToMinutes(timeStr) {
    const [time, meridian] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (meridian === 'PM' && hours !== 12) {
        hours += 12;
    } else if (meridian === 'AM' && hours === 12) {
        hours = 0; // Midnight (12 AM) is 0 hours
    }
    return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight back to a "HH:MM AM/PM" string.
 * @param {number} totalMinutes - Minutes from midnight.
 * @returns {string} Formatted time string.
 */
function formatMinutesToTime(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const meridian = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // Convert 0 to 12 for 12 AM/PM

    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${formattedMinutes} ${meridian}`;
}

/**
 * Calculates the height and top position for an element based on time range.
 * @param {number} startMinutes - Start time in minutes from midnight.
 * @param {number} endMinutes - End time in minutes from midnight.
 * @param {number} totalCalendarHeight - The total pixel height of the calendar grid.
 * @returns {{top: number, height: number}} Object with top and height in pixels.
 */
function calculatePositionAndHeight(startMinutes, endMinutes, totalCalendarHeight) {
    const totalSchedulableMinutes = CALENDAR_END_MINUTES - CALENDAR_START_MINUTES;
    const minutesFromCalendarStart = startMinutes - CALENDAR_START_MINUTES;

    const topPercentage = (minutesFromCalendarStart / totalSchedulableMinutes) * 100;
    const heightPercentage = ((endMinutes - startMinutes) / totalSchedulableMinutes) * 100;

    // Convert percentages to pixel values based on totalCalendarHeight
    const topPx = (topPercentage / 100) * totalCalendarHeight;
    const heightPx = (heightPercentage / 100) * totalCalendarHeight;

    return { top: topPx, height: heightPx };
}

// --- Rendering Functions ---

/**
 * Populates the time axis.
 * @param {HTMLElement} timeAxisElement - The DOM element for the time axis.
 * @param {number} totalCalendarHeight - The total pixel height of the schedule grid.
 */
function renderTimeAxis(timeAxisElement, totalCalendarHeight) {
    timeAxisElement.innerHTML = ''; // Clear previous content

    const interval = 60; // Mark every hour
    const totalMinutes = CALENDAR_END_MINUTES - CALENDAR_START_MINUTES;

    for (let i = CALENDAR_START_MINUTES; i <= CALENDAR_END_MINUTES; i += interval) {
        if (i > CALENDAR_END_MINUTES) break; // Prevent going past end
        const { top } = calculatePositionAndHeight(i, i + interval, totalCalendarHeight);

        const timeLabel = document.createElement('div');
        timeLabel.className = 'absolute right-2 -translate-y-1/2 text-gray-600 font-medium text-xs md:text-sm time-label';
        timeLabel.style.top = `${top}px`;
        timeLabel.textContent = formatMinutesToTime(i);
        timeAxisElement.appendChild(timeLabel);

        // Add grid lines (only for full hours)
        if (i < CALENDAR_END_MINUTES) {
            const line = document.createElement('div');
            line.className = 'time-slot-line';
            line.style.top = `${top}px`;
            // timeAxisElement.appendChild(line); // Lines will be added to day columns
        }
    }
}

/**
 * Renders the grid lines for each day column.
 * @param {HTMLElement} dayColumnElement - The DOM element for the day column.
 * @param {number} totalCalendarHeight - The total pixel height of the schedule grid.
 */
function renderGridLines(dayColumnElement, totalCalendarHeight) {
    const interval = 30; // Mark every 30 minutes for softer divisions
    for (let i = CALENDAR_START_MINUTES; i < CALENDAR_END_MINUTES; i += interval) {
        const { top } = calculatePositionAndHeight(i, i + interval, totalCalendarHeight);
        const line = document.createElement('div');
        line.className = 'time-slot-line';
        line.style.top = `${top}px`;
        dayColumnElement.appendChild(line);
    }
}

/**
 * Renders the school period divisions and labels.
 * @param {HTMLElement} dayColumnElement - The DOM element for the day column.
 * @param {string} dayName - The name of the day (e.g., "Monday").
 * @param {number} totalCalendarHeight - The total pixel height of the schedule grid.
 */
function renderSchoolPeriodDivisions(dayColumnElement, dayName, totalCalendarHeight) {
    const periods = schoolPeriodTimes[dayName];
    if (!periods) return;

    for (const periodName in periods) {
        const period = periods[periodName];
        const startMin = timeToMinutes(period.start);
        const endMin = timeToMinutes(period.end);

        // Check if the period is within the visible calendar range
        if (endMin <= CALENDAR_START_MINUTES || startMin >= CALENDAR_END_MINUTES) continue;

        const { top, height } = calculatePositionAndHeight(startMin, endMin, totalCalendarHeight);

        // Create a div for the block, for example, Advisory or Lunch
        if (periodName === "Advisory" || periodName.includes("Lunch")) {
            const specialBlock = document.createElement('div');
            specialBlock.className = `advisory-block ${periodName.includes("Lunch") ? 'lunch-block' : ''}`;
            specialBlock.style.top = `${top}px`;
            specialBlock.style.height = `${height}px`;
            specialBlock.textContent = periodName === "Advisory" ? "Advisory" : "Lunch Break";
            dayColumnElement.appendChild(specialBlock);
        }
        // Optionally add lines for all periods, or just the special ones
        // For "soft divisions", we'll just let the time lines show and overlay classes.
        // The main purpose of this function is to place special blocks like Advisory/Lunch.
    }
}

/**
 * Renders all classes (school and college) for a given day.
 * Handles basic overlap by adjusting left/width for up to 3 overlapping classes.
 * @param {HTMLElement} dayColumnElement - The DOM element for the day column.
 * @param {string} dayName - The name of the day (e.g., "Monday").
 * @param {number} totalCalendarHeight - The total pixel height of the schedule grid.
 */
function renderClassesForDay(dayColumnElement, dayName, totalCalendarHeight) {
    // Filter classes relevant to this day and store their calculated positions
    const eventsToday = [];

    // Add school classes
    schoolClasses.forEach(sClass => {
        if (sClass.days.includes(dayName)) {
            sClass.periods.forEach(periodName => {
                const period = schoolPeriodTimes[dayName][periodName];
                if (period) {
                    const startMin = timeToMinutes(period.start);
                    const endMin = timeToMinutes(period.end);

                    // Only add if within calendar bounds
                    if (endMin > CALENDAR_START_MINUTES && startMin < CALENDAR_END_MINUTES) {
                        const { top, height } = calculatePositionAndHeight(startMin, endMin, totalCalendarHeight);
                        eventsToday.push({
                            name: sClass.name,
                            time: `${period.start} - ${period.end}`,
                            color: sClass.color,
                            top: top,
                            height: height,
                            startMin: startMin,
                            endMin: endMin
                        });
                    }
                }
            });
        }
    });

    // Add college classes
    collegeClasses.forEach(cClass => {
        if (cClass.days.includes(dayName)) {
            const startMin = timeToMinutes(cClass.startTime);
            const endMin = timeToMinutes(cClass.endTime);

            // Only add if within calendar bounds
            if (endMin > CALENDAR_START_MINUTES && startMin < CALENDAR_END_MINUTES) {
                const { top, height } = calculatePositionAndHeight(startMin, endMin, totalCalendarHeight);
                eventsToday.push({
                    name: cClass.name,
                    time: `${cClass.startTime} - ${cClass.endTime}`,
                    color: cClass.color,
                    top: top,
                    height: height,
                    startMin: startMin,
                    endMin: endMin
                });
            }
        }
    });

    // Sort events by start time to handle overlaps more predictably
    eventsToday.sort((a, b) => a.startMin - b.startMin);

    // Basic Overlap Handling
    // This is a simplified approach. For more complex scenarios, a dedicated
    // "collision detection" and "track assignment" algorithm would be needed.
    // Here, we'll just check for direct overlaps and adjust width/left.
    const renderedEvents = []; // To keep track of events actually rendered
    for (let i = 0; i < eventsToday.length; i++) {
        const currentEvent = eventsToday[i];
        let overlappingCount = 1;
        let overlapIndex = 0; // Position within the overlapping group

        // Find all events that overlap with the current one
        const overlappingGroup = [currentEvent];
        for (let j = i + 1; j < eventsToday.length; j++) {
            const nextEvent = eventsToday[j];
            // Check for overlap: [start1, end1] and [start2, end2] overlap if start1 < end2 AND start2 < end1
            if (currentEvent.startMin < nextEvent.endMin && nextEvent.startMin < currentEvent.endMin) {
                overlappingGroup.push(nextEvent);
                overlappingCount++;
            }
        }

        // If there's an overlap, adjust properties for the group
        if (overlappingGroup.length > 1) {
            const baseWidth = 100 / overlappingGroup.length;
            overlappingGroup.forEach((event, index) => {
                // Prevent re-rendering an event if it's already part of a processed overlap group
                if (!renderedEvents.includes(event)) {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = `class-event ${event.color} overlap-${overlappingGroup.length}`;
                    eventDiv.style.top = `${event.top}px`;
                    eventDiv.style.height = `${event.height}px`;
                    eventDiv.style.width = `calc(${baseWidth}% - 12px)`; // Account for left/right padding and gap
                    eventDiv.style.left = `calc(${index * baseWidth}% + 6px)`;

                    eventDiv.innerHTML = `<strong>${event.name}</strong><br>${event.time}`;
                    dayColumnElement.appendChild(eventDiv);
                    renderedEvents.push(event); // Mark as rendered
                }
            });
            // Skip events that were part of this group, as they are now rendered
            i += overlappingGroup.length - 1; // Adjust loop counter
        } else {
            // No overlap, render normally
            const eventDiv = document.createElement('div');
            eventDiv.className = `class-event ${currentEvent.color}`;
            eventDiv.style.top = `${currentEvent.top}px`;
            eventDiv.style.height = `${currentEvent.height}px`;
            eventDiv.innerHTML = `<strong>${currentEvent.name}</strong><br>${currentEvent.time}`;
            dayColumnElement.appendChild(eventDiv);
            renderedEvents.push(currentEvent);
        }
    }
}


/**
 * Initializes and renders the entire schedule calendar.
 */
function initializeSchedule() {
    const scheduleGrid = document.getElementById('schedule-grid');
    const timeAxis = document.getElementById('time-axis');
    const mondayColumn = document.getElementById('monday-column');
    const tuesdayColumn = document.getElementById('tuesday-column');
    const wednesdayColumn = document.getElementById('wednesday-column');
    const thursdayColumn = document.getElementById('thursday-column');
    const fridayColumn = document.getElementById('friday-column');

    // Get the computed height of the schedule grid.
    // We'll set a min-height via CSS, then JavaScript calculates based on that.
    // Ensure the DOM is ready and elements have rendered before querying height.
    const totalCalendarHeight = scheduleGrid.clientHeight;
    if (totalCalendarHeight === 0) {
        console.error("Schedule grid height is 0. Ensure CSS min-height is set correctly.");
        return;
    }

    renderTimeAxis(timeAxis, totalCalendarHeight);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const dayColumns = {
        "Monday": mondayColumn,
        "Tuesday": tuesdayColumn,
        "Wednesday": wednesdayColumn,
        "Thursday": thursdayColumn,
        "Friday": fridayColumn
    };

    days.forEach(dayName => {
        const column = dayColumns[dayName];
        if (column) {
            column.innerHTML = ''; // Clear previous content
            renderGridLines(column, totalCalendarHeight);
            renderSchoolPeriodDivisions(column, dayName, totalCalendarHeight);
            renderClassesForDay(column, dayName, totalCalendarHeight);
        }
    });
}

// --- Event Listeners ---
// Initialize schedule when the DOM is fully loaded
window.addEventListener('load', initializeSchedule);
// Re-render schedule on window resize to adjust element positions/heights
window.addEventListener('resize', initializeSchedule);