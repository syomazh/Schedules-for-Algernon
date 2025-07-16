/**
 * Schedule Generator Module
 * Implements a greedy algorithm to generate optimal course schedules
 * based on importance values and time constraints.
 */

class ScheduleGenerator {
  /**
   * Creates a new schedule generator
   * @param {Array} highSchoolCourses - Available high school courses
   * @param {Array} collegeCourses - Available college courses
   * @param {Object} schoolHourSchedule - School period schedule structure
   */
  constructor(highSchoolCourses = [], collegeCourses = [], schoolHourSchedule = {}) {
    // Define DAYS first before it's used in initializeEmptySchedule
    this.DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    this.highSchoolCourses = highSchoolCourses;
    this.collegeCourses = collegeCourses;
    this.schoolHourSchedule = schoolHourSchedule;
    this.selectedCourses = [];
    this.schedule = this.initializeEmptySchedule();
  }

  /**
   * Initialize empty schedule structure
   * @returns {Object} Empty schedule with days as keys
   */
  initializeEmptySchedule() {
    const schedule = {};
    for (const day of this.DAYS) {
      schedule[day] = [];
    }
    return schedule;
  }

  /**
   * Parse time string to minutes
   * @param {string} timeStr - Time string (e.g., "09:30")
   * @returns {number} Minutes since midnight
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if two time intervals overlap
   * @param {string} start1 - Start time of first interval (HH:MM)
   * @param {string} end1 - End time of first interval (HH:MM)
   * @param {string} start2 - Start time of second interval (HH:MM)
   * @param {string} end2 - End time of second interval (HH:MM)
   * @returns {boolean} True if intervals overlap
   */
  timeOverlap(start1, end1, start2, end2) {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);
    
    return s1 < e2 && e1 > s2;
  }

  /**
   * Check if a high school course conflicts with the current schedule
   * @param {Object} course - High school course to check
   * @returns {boolean} True if course conflicts
   */
  highSchoolCourseConflicts(course) {
    // For high school classes, check each period the course is offered in
    for (const periodHour of course.periodHours) {
      const normalDays = ['Mon', 'Tue', 'Fri'];
      const blockDays = ['Wed', 'Thu'];
      
      // Check for required attendance pattern
      let normalDayAvailable = false;
      let blockDayAvailable = false;
      
      // Check normal days
      for (const day of normalDays) {
        if (this.schoolHourSchedule[day][periodHour]) {
          const { start, end } = this.schoolHourSchedule[day][periodHour];
          
          // Check if this period on this day conflicts with anything in the schedule
          const hasConflict = this.schedule[day].some(existingClass => 
            this.timeOverlap(start, end, existingClass.startTime, existingClass.endTime)
          );
          
          if (!hasConflict) {
            normalDayAvailable = true;
            break; // Found a normal day that works
          }
        }
      }
      
      // Check block days
      for (const day of blockDays) {
        if (this.schoolHourSchedule[day][periodHour]) {
          const { start, end } = this.schoolHourSchedule[day][periodHour];
          
          // Check if this period on this day conflicts with anything in the schedule
          const hasConflict = this.schedule[day].some(existingClass => 
            this.timeOverlap(start, end, existingClass.startTime, existingClass.endTime)
          );
          
          if (!hasConflict) {
            blockDayAvailable = true;
            break; // Found a block day that works
          }
        }
      }
      
      // If we found both normal day and block day availability for this period,
      // then this course doesn't conflict
      if (normalDayAvailable && blockDayAvailable) {
        return false;
      }
    }
    
    // If we get here, there's no valid way to add this high school course
    return true;
  }

  /**
   * Check if a college course conflicts with the current schedule
   * @param {Object} course - College course to check
   * @returns {boolean} True if all sections conflict
   */
  collegeCourseConflicts(course) {
    // For college classes, check if ANY section can fit in the schedule
    for (const section of course.sections) {
      let sectionWorks = true;
      
      for (const day of section.days) {
        // Check if this day's schedule conflicts with existing courses
        const hasConflict = this.schedule[day].some(existingClass => 
          this.timeOverlap(section.startTime, section.endTime, existingClass.startTime, existingClass.endTime)
        );
        
        if (hasConflict) {
          sectionWorks = false;
          break;
        }
      }
      
      if (sectionWorks) {
        return false; // Found a section that doesn't conflict
      }
    }
    
    // If we get here, all sections conflict
    return true;
  }

  /**
   * Add a high school course to the schedule
   * @param {Object} course - High school course to add
   */
  addHighSchoolCourseToSchedule(course) {
    const normalDays = ['Mon', 'Tue', 'Fri'];
    const blockDays = ['Wed', 'Thu'];
    
    // First, find one normal day where we can attend
    for (const periodHour of course.periodHours) {
      for (const day of normalDays) {
        if (this.schoolHourSchedule[day][periodHour]) {
          const { start, end } = this.schoolHourSchedule[day][periodHour];
          
          const hasConflict = this.schedule[day].some(existingClass => 
            this.timeOverlap(start, end, existingClass.startTime, existingClass.endTime)
          );
          
          if (!hasConflict) {
            // Add this normal day class to the schedule
            this.schedule[day].push({
              name: course.name,
              startTime: start,
              endTime: end,
              type: 'High School Class',
              period: periodHour,
              color: course.color
            });
            
            // Now find one block day
            for (const blockDay of blockDays) {
              if (this.schoolHourSchedule[blockDay][periodHour]) {
                const blockTimes = this.schoolHourSchedule[blockDay][periodHour];
                
                const hasBlockConflict = this.schedule[blockDay].some(existingClass => 
                  this.timeOverlap(blockTimes.start, blockTimes.end, existingClass.startTime, existingClass.endTime)
                );
                
                if (!hasBlockConflict) {
                  // Add this block day class to the schedule
                  this.schedule[blockDay].push({
                    name: course.name,
                    startTime: blockTimes.start,
                    endTime: blockTimes.end,
                    type: 'High School Class',
                    period: periodHour,
                    color: course.color
                  });
                  return; // Successfully added this course
                }
              }
            }
            
            // If we get here, we couldn't add a block day, so remove the normal day we added
            this.schedule[day] = this.schedule[day].filter(cls => cls.name !== course.name);
            break;
          }
        }
      }
    }
  }

  /**
   * Add a college course to the schedule
   * @param {Object} course - College course to add
   */
  addCollegeCourseToSchedule(course) {
    // Try each section
    for (const section of course.sections) {
      let sectionWorks = true;
      
      // Check if this section works on all of its days
      for (const day of section.days) {
        const hasConflict = this.schedule[day].some(existingClass => 
          this.timeOverlap(section.startTime, section.endTime, existingClass.startTime, existingClass.endTime)
        );
        
        if (hasConflict) {
          sectionWorks = false;
          break;
        }
      }
      
      if (sectionWorks) {
        // Add this section on all its days
        for (const day of section.days) {
          this.schedule[day].push({
            name: course.name,
            startTime: section.startTime,
            endTime: section.endTime,
            type: 'College Class',
            color: course.color
          });
        }
        return; // Successfully added this course
      }
    }
  }

  /**
   * Generate a schedule using greedy algorithm
   * @param {Array} coursesWithImportance - Courses with importance values
   * @returns {Object} The generated schedule
   */
  generateGreedySchedule(coursesWithImportance) {
    // Reset state for a new schedule generation
    this.selectedCourses = [];
    this.schedule = this.initializeEmptySchedule();
    
    // Sort courses by importance (descending)
    const sortedCourses = [...coursesWithImportance].sort((a, b) => b.importance - a.importance);
    
    // Try to add each course in order of importance
    for (const courseWithImportance of sortedCourses) {
      const { course, importance } = courseWithImportance;
      
      let conflicts = false;
      
      if (course.type === 'High School Class') {
        conflicts = this.highSchoolCourseConflicts(course);
      } else if (course.type === 'College Class') {
        conflicts = this.collegeCourseConflicts(course);
      }
      
      if (!conflicts) {
        // Add this course to the schedule
        if (course.type === 'High School Class') {
          this.addHighSchoolCourseToSchedule(course);
        } else if (course.type === 'College Class') {
          this.addCollegeCourseToSchedule(course);
        }
        
        this.selectedCourses.push({
          course,
          importance
        });
      }
    }
    
    // Calculate total importance score
    const totalImportance = this.selectedCourses.reduce((sum, { importance }) => sum + importance, 0);
    
    return {
      schedule: this.schedule,
      selectedCourses: this.selectedCourses,
      totalImportance
    };
  }

  /**
   * Convert schedule to renderable events format 
   * @returns {Array} Array of events ready to render on the calendar
   */
  scheduleToRenderableEvents() {
    const events = [];
    
    for (const day in this.schedule) {
      for (const classItem of this.schedule[day]) {
        events.push({
          name: classItem.name,
          day: day,
          startTime: classItem.startTime,
          endTime: classItem.endTime,
          color: classItem.color,
          type: classItem.type,
          period: classItem.period || null,
          isGreyedOut: false
        });
      }
    }
    
    return events;
  }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScheduleGenerator;
} else {
  window.ScheduleGenerator = ScheduleGenerator;
}