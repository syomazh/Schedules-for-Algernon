/**
 * Implementation for the Auto Generate Schedule button
 * This connects the main application with the schedule generator algorithm
 */

document.getElementById('autoGenerateBtn').addEventListener('click', () => {
  try {
    // 1. Extract courses from the current application state
    const coursesWithImportance = [];
    
    // Add importance inputs to ask user for importance values
    const importanceModal = document.createElement('div');
    importanceModal.className = 'modal-overlay';
    importanceModal.innerHTML = `
      <div class="modal-content">
        <h3 class="text-2xl font-bold mb-4">Set Course Importance Values</h3>
        <p class="mb-4">Assign importance values (0.0-1.0) to each course:</p>
        <div id="importanceInputs" class="space-y-3 mb-4">
          <!-- Inputs will be generated here -->
        </div>
        <div class="flex justify-end gap-3">
          <button id="cancelImportance" class="px-4 py-2 bg-gray-500 text-white rounded-md">Cancel</button>
          <button id="generateSchedule" class="px-4 py-2 bg-purple-600 text-white rounded-md">Generate Schedule</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(importanceModal);
    
    const importanceInputs = document.getElementById('importanceInputs');
    
    // Add inputs for each course
    courses.forEach((course, index) => {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'flex items-center justify-between';
      
      const courseName = document.createElement('label');
      courseName.textContent = `${course.name} (${course.type})`;
      courseName.className = 'font-medium';
      
      const importanceInput = document.createElement('input');
      importanceInput.type = 'range';
      importanceInput.min = '0';
      importanceInput.max = '1';
      importanceInput.step = '0.1';
      importanceInput.value = '0.5';
      importanceInput.dataset.courseIndex = index;
      importanceInput.className = 'ml-4 w-32';
      
      const valueDisplay = document.createElement('span');
      valueDisplay.textContent = '0.5';
      valueDisplay.className = 'ml-2 w-8 text-right';
      
      // Update displayed value when slider changes
      importanceInput.addEventListener('input', () => {
        valueDisplay.textContent = importanceInput.value;
      });
      
      inputGroup.appendChild(courseName);
      inputGroup.appendChild(importanceInput);
      inputGroup.appendChild(valueDisplay);
      importanceInputs.appendChild(inputGroup);
    });
    
    // Cancel button closes the modal
    document.getElementById('cancelImportance').addEventListener('click', () => {
      document.body.removeChild(importanceModal);
    });
    
    // Generate schedule button
    document.getElementById('generateSchedule').addEventListener('click', () => {
      // Collect importance values
      const importanceElements = document.querySelectorAll('#importanceInputs input');
      importanceElements.forEach(input => {
        const index = parseInt(input.dataset.courseIndex);
        const importance = parseFloat(input.value);
        
        coursesWithImportance.push({
          course: courses[index],
          importance
        });
      });
      
      // Remove the modal
      document.body.removeChild(importanceModal);
      
      // Initialize the generator
      const generator = new ScheduleGenerator(
        // Filter to just high school courses
        courses.filter(c => c.type === 'High School Class'),
        // Filter to just college courses
        courses.filter(c => c.type === 'College Class'),
        SCHOOL_HOUR_SCHEDULE
      );
      
      // Generate the schedule
      const result = generator.generateGreedySchedule(coursesWithImportance);
      
      // Get the list of selected course names for filtering
      const selectedCourseNames = result.selectedCourses.map(item => item.course.name);
      
      // Gray out all events that aren't part of the generated schedule
      courses.forEach(course => {
        const isSelected = selectedCourseNames.includes(course.name);
        
        course.renderableEvents.forEach(event => {
          event.isGreyedOut = !isSelected;
        });
      });
      
      // Display results
      alert(`Schedule generated with ${result.selectedCourses.length} courses!\nTotal importance score: ${result.totalImportance.toFixed(2)}\n\nNote: Courses not included in the optimal schedule are now grayed out.`);
      
      // Re-render the schedule with grayed-out courses
      renderCourses();
    });
    
  } catch (error) {
    console.error("Error generating schedule:", error);
    alert('Error generating schedule. Please try again.');
  }
});