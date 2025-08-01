/**
 * Generate an optimized schedule based on course importance
 * @param {Array} courses - Array of course objects
 * @param {Object} options - Optional configuration parameters
 * @param {Object} options.importanceValues - Object mapping course names to importance values (0-1)
 * @returns {Object} - Generated schedule information
 */
function generateSchedule(courses, options = {}) {
    return greedyAlg(courses, options);
}


// Export function for use in index.html
if (typeof module !== 'undefined') {
    module.exports = { generateSchedule };
}


//alg that just makes all the courses greyed out
function placeholderAlg1(courses, options = {}) {
    // Make a deep copy to avoid modifying original data
    const processedCourses = JSON.parse(JSON.stringify(courses));
    
    // Extract importance values from options, or use defaults
    const importanceValues = options.importanceValues || {};
    
    // Assign importance values to each course (default to 0.5 if not provided)
    processedCourses.forEach(course => {
        course.importance = importanceValues[course.name] || 0.5;
    });

    // Set all events to greyed out initially
    processedCourses.forEach(course => {
        if (course.renderableEvents) {
            course.renderableEvents.forEach(event => {
                event.isGreyedOut = true;
            });
        }
    });
    
    // Calculate total importance of scheduled courses
    const totalImportance = processedCourses.reduce((sum, course) => {
        // Add importance for courses that are scheduled (not greyed out)
        if (course.renderableEvents && course.renderableEvents.some(event => !event.isGreyedOut)) {
            return sum + course.importance;
        }
        return sum;
    }, 0);
    
    return {
        courses: processedCourses,
        totalImportance: totalImportance,
        message: "Schedule generated by placeholder alg1"
    };
}

//placeholder alg2 that just makes everything but the top 2 courses greyed out
function placeholderAlg2(courses, options = {}) {
    // Make a deep copy to avoid modifying original data
    const processedCourses = JSON.parse(JSON.stringify(courses));
    
    // Extract importance values from options, or use defaults
    const importanceValues = options.importanceValues || {};
    
    // Assign importance values to each course (default to 0.5 if not provided)
    processedCourses.forEach(course => {
        course.importance = importanceValues[course.name] || 0.5;
    });

    // Set all events to greyed out initially
    processedCourses.forEach(course => {
        if (course.renderableEvents) {
            course.renderableEvents.forEach(event => {
                event.isGreyedOut = true;
            });
        }
    });

    //DO NOR MODIFY THE ORIGINAL ORDER of processed coursed IT MESSES EVERYTHING UP when you return it
    
    // Instead of reordering the original array, create a prioritized index list
    const courseIndicesByPriority = [...Array(processedCourses.length).keys()]
        .sort((a, b) => processedCourses[b].importance - processedCourses[a].importance);
    
    // Process courses in priority order but keep original array order
    for (const index of courseIndicesByPriority.slice(0, 2)) {
        const _course = processedCourses[index];
        
        // Process this high-priority course (enable its events)
        if (_course.renderableEvents) {
            _course.renderableEvents.forEach(event => {
                event.isGreyedOut = false;  // Enable high priority course
            });
        }
    }
    

    const totalImportance = processedCourses.reduce((sum, course) => {
        // Add importance for courses that are scheduled (not greyed out)
        if (course.renderableEvents && course.renderableEvents.some(event => !event.isGreyedOut)) {
            return sum + course.importance;
        }
        return sum;
    }, 0);
    
    return {
        courses: processedCourses,
        totalImportance: totalImportance,
        message: "Schedule generated prioritizing by placeholder alg2"
    };
}

//greedy algorithm for scheduling courses based on importance
function greedyAlg(courses, options = {}) {
    // Make a deep copy to avoid modifying original data
    const processedCourses = JSON.parse(JSON.stringify(courses));
    
    // Extract importance values from options, or use defaults
    const importanceValues = options.importanceValues || {};
    
    // Assign importance values to each course (default to 0.5 if not provided)
    processedCourses.forEach(course => {
        course.importance = importanceValues[course.name] !== undefined ? 
                          importanceValues[course.name] : 0.5;
    });
    
    // Create prioritized index list based on importance
    const courseIndicesByPriority = [...Array(processedCourses.length).keys()]
        .sort((a, b) => processedCourses[b].importance - processedCourses[a].importance);
    
    // Set all events to greyed out initially
    processedCourses.forEach(course => {
        if (course.renderableEvents) {
            course.renderableEvents.forEach(event => {
                event.isGreyedOut = true;
            });
        }
    });

    // Create a schedule representation for time conflict checking
    const schedule = {};
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
        schedule[day] = [];
    }
    
    // Track which courses have been scheduled
    const scheduledCourses = new Set();

    // Helper function to check if an event conflicts with current schedule
    function hasConflict(event) {
        const day = event.day;
        const startTime = event.startTime;
        const endTime = event.endTime;
        
        // Convert times to minutes for easier comparison
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const eventStartMinutes = startHour * 60 + startMin;
        const eventEndMinutes = endHour * 60 + endMin;
        
        // Check against all scheduled events for this day
        for (const scheduledEvent of schedule[day]) {
            const [schStartHour, schStartMin] = scheduledEvent.startTime.split(':').map(Number);
            const [schEndHour, schEndMin] = scheduledEvent.endTime.split(':').map(Number);
            const schStartMinutes = schStartHour * 60 + schStartMin;
            const schEndMinutes = schEndHour * 60 + schEndMin;
            
            // Check if there's an overlap
            if (!(eventEndMinutes <= schStartMinutes || eventStartMinutes >= schEndMinutes)) {
                return true; // Conflict detected
            }
        }
        return false;
    }

    // Process courses in priority order
    for (const courseIndex of courseIndicesByPriority) {
        const course = processedCourses[courseIndex];
        
        // Skip if course has no events
        if (!course.renderableEvents || course.renderableEvents.length === 0) {
            continue;
        }
        
        const isHighSchool = course.type === 'High School Class';

        if (isHighSchool) {
            // Group events by day
            const eventsByDay = {
                'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': []
            };
            
            course.renderableEvents.forEach(event => {
                eventsByDay[event.day].push(event);
            });
            
            // Try to schedule one period for each normal day (Mon, Tue, Fri)
            // and one block day (Wed or Thu)
            const normalDays = ['Mon', 'Tue', 'Fri'];
            const blockDays = ['Wed', 'Thu'];
            const scheduledEvents = [];
            let allNormalDaysScheduled = true;
            let blockDayScheduled = false;
            
            // First try normal days
            for (const day of normalDays) {
                if (eventsByDay[day].length === 0) {
                    // If this course isn't offered on a required day, we can't schedule it
                    allNormalDaysScheduled = false;
                    break;
                }
                
                // Try each event for this day, sorted by start time
                const dayEvents = [...eventsByDay[day]].sort((a, b) => {
                    const [aHour, aMin] = a.startTime.split(':').map(Number);
                    const [bHour, bMin] = b.startTime.split(':').map(Number);
                    return (aHour * 60 + aMin) - (bHour * 60 + bMin);
                });
                
                let dayScheduled = false;
                for (const event of dayEvents) {
                    if (!hasConflict(event)) {
                        scheduledEvents.push(event);
                        schedule[day].push({
                            courseIndex,
                            startTime: event.startTime,
                            endTime: event.endTime
                        });
                        dayScheduled = true;
                        break;
                    }
                }
                
                if (!dayScheduled) {
                    allNormalDaysScheduled = false;
                    break;
                }
            }
            
            // Then try block days, but only if all normal days were scheduled
            if (allNormalDaysScheduled) {
                for (const day of blockDays) {
                    if (blockDayScheduled) break;
                    
                    if (eventsByDay[day].length > 0) {
                        const dayEvents = [...eventsByDay[day]].sort((a, b) => {
                            const [aHour, aMin] = a.startTime.split(':').map(Number);
                            const [bHour, bMin] = b.startTime.split(':').map(Number);
                            return (aHour * 60 + aMin) - (bHour * 60 + bMin);
                        });
                        
                        for (const event of dayEvents) {
                            if (!hasConflict(event)) {
                                scheduledEvents.push(event);
                                schedule[day].push({
                                    courseIndex,
                                    startTime: event.startTime,
                                    endTime: event.endTime
                                });
                                blockDayScheduled = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            // If we scheduled all normal days and at least one block day, mark course as scheduled
            if (allNormalDaysScheduled && blockDayScheduled) {
                scheduledCourses.add(courseIndex);
                
                // Mark scheduled events as not greyed out
                scheduledEvents.forEach(event => {
                    event.isGreyedOut = false;
                });
            } else {
                // If requirements weren't met, remove any tentative schedule entries
                for (const day in schedule) {
                    schedule[day] = schedule[day].filter(e => e.courseIndex !== courseIndex);
                }
            }
            
        } else {
            // Handle college courses - group by section
            const sections = [];
            const sectionMap = new Map();
            
            // Group events by section (based on unique start/end time patterns)
            course.renderableEvents.forEach(event => {
                const sectionKey = `${event.startTime}-${event.endTime}`;
                if (!sectionMap.has(sectionKey)) {
                    sectionMap.set(sectionKey, sections.length);
                    sections.push([]);
                }
                sections[sectionMap.get(sectionKey)].push(event);
            });
            
            // Try each section
            let sectionScheduled = false;
            for (const section of sections) {
                let canScheduleSection = true;
                
                // Check if entire section can be scheduled without conflicts
                for (const event of section) {
                    if (hasConflict(event)) {
                        canScheduleSection = false;
                        break;
                    }
                }
                
                if (canScheduleSection) {
                    // Schedule all events in this section
                    section.forEach(event => {
                        event.isGreyedOut = false;
                        schedule[event.day].push({
                            courseIndex,
                            startTime: event.startTime,
                            endTime: event.endTime
                        });
                    });
                    
                    scheduledCourses.add(courseIndex);
                    sectionScheduled = true;
                    break;
                }
            }
        }
    }
    
    // Calculate total importance of scheduled courses
    const totalImportance = Array.from(scheduledCourses).reduce((sum, idx) => {
        return sum + processedCourses[idx].importance;
    }, 0);
    
    return {
        courses: processedCourses,
        totalImportance: totalImportance.toFixed(2),
        message: `Schedule generated with ${scheduledCourses.size} courses (total importance: ${totalImportance.toFixed(2)})`
    };
}

