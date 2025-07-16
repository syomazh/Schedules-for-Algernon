// Auto Schedule UI Implementation

/**
 * Creates and manages the importance selection UI and connects with the scheduling algorithm
 */
(function() {
    // Reference to the auto generate button
    const autoGenerateBtn = document.getElementById('autoGenerateBtn');
    
    // Modal for selecting course importance values
    let importanceModal = null;
    
    /**
     * Creates the modal for selecting course importance values
     */
    function createImportanceModal() {
        // Create modal elements if they don't exist
        if (!importanceModal) {
            importanceModal = document.createElement('div');
            importanceModal.className = 'modal-overlay';
            importanceModal.id = 'importanceModal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.maxWidth = '600px';
            modalContent.style.maxHeight = '80vh';
            modalContent.style.overflow = 'auto';
            
            // Create header
            const header = document.createElement('h3');
            header.className = 'text-2xl font-bold mb-4';
            header.textContent = 'Set Course Importance Values';
            
            const description = document.createElement('p');
            description.className = 'mb-6 text-secondary-text-color';
            description.textContent = 'Drag the sliders to set the importance of each course (0.0 - 1.0). Higher values indicate higher priority for scheduling.';
            
            // Create form container
            const formContainer = document.createElement('div');
            formContainer.className = 'space-y-6';
            formContainer.id = 'importanceForm';
            
            // Create action buttons
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flex justify-between mt-8';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => {
                importanceModal.classList.add('hidden');
            };
            
            const generateBtn = document.createElement('button');
            generateBtn.className = 'px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md';
            generateBtn.textContent = 'Generate Schedule';
            generateBtn.onclick = generateScheduleFromImportance;
            
            // Assemble the modal
            buttonContainer.appendChild(cancelBtn);
            buttonContainer.appendChild(generateBtn);
            
            modalContent.appendChild(header);
            modalContent.appendChild(description);
            modalContent.appendChild(formContainer);
            modalContent.appendChild(buttonContainer);
            
            importanceModal.appendChild(modalContent);
            document.body.appendChild(importanceModal);
        }
    }
    
    /**
     * Populates the importance form with sliders for each course
     */
    function populateImportanceForm() {
        const formContainer = document.getElementById('importanceForm');
        formContainer.innerHTML = '';
        
        if (courses.length === 0) {
            const noCourses = document.createElement('p');
            noCourses.className = 'text-red-500';
            noCourses.textContent = 'No courses available. Please add courses first.';
            formContainer.appendChild(noCourses);
            return;
        }
        
        // Create a section for each course with a slider
        courses.forEach((course, index) => {
            const courseSection = document.createElement('div');
            courseSection.className = 'p-4 rounded-lg shadow-sm';
            courseSection.style.backgroundColor = 'var(--panel-item-bg)';
            
            const courseInfo = document.createElement('div');
            courseInfo.className = 'flex justify-between items-center mb-2';
            
            const courseName = document.createElement('label');
            courseName.className = 'font-medium text-main-text-color';
            courseName.htmlFor = `importance-${index}`;
            courseName.textContent = course.name;
            
            const courseType = document.createElement('span');
            courseType.className = 'text-sm text-secondary-text-color';
            courseType.textContent = course.type;
            
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'flex items-center space-x-4';
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `importance-${index}`;
            slider.name = `importance-${index}`;
            slider.min = '0';
            slider.max = '1';
            slider.step = '0.05';
            slider.value = course.importance || '0.5'; // Default to 0.5
            slider.className = 'w-48';
            
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'text-sm font-mono';
            valueDisplay.id = `value-${index}`;
            valueDisplay.textContent = slider.value;
            
            // Update the value display as slider changes
            slider.oninput = () => {
                valueDisplay.textContent = slider.value;
            };
            
            // Assemble the course section
            courseInfo.appendChild(courseName);
            courseInfo.appendChild(courseType);
            
            sliderContainer.appendChild(slider);
            sliderContainer.appendChild(valueDisplay);
            
            courseSection.appendChild(courseInfo);
            courseSection.appendChild(sliderContainer);
            
            formContainer.appendChild(courseSection);
        });
    }
    
    /**
     * Collects importance values from the form and generates a schedule
     */
    function generateScheduleFromImportance() {
        // Collect importance values from sliders
        const importanceValues = {};
        
        courses.forEach((course, index) => {
            const slider = document.getElementById(`importance-${index}`);
            if (slider) {
                importanceValues[course.name] = parseFloat(slider.value);
            }
        });
        
        // Hide the modal
        importanceModal.classList.add('hidden');
        
        // Call the generateSchedule function from scheduleAlgorithm.js
        const result = generateSchedule(courses, { importanceValues });
        
        // Update the courses with the optimized schedule results
        if (result && result.courses) {
            // Update the greyed out status for each event
            result.courses.forEach((optimizedCourse, index) => {
                if (courses[index] && optimizedCourse.renderableEvents) {
                    courses[index].renderableEvents.forEach((event, eventIndex) => {
                        if (optimizedCourse.renderableEvents[eventIndex]) {
                            event.isGreyedOut = optimizedCourse.renderableEvents[eventIndex].isGreyedOut;
                        }
                    });
                }
            });
            
            // Re-render the courses to update the UI
            renderCourses();
            
            // Show success message with importance score
            const totalImportance = result.totalImportance;
            let message = `Schedule optimized with total importance: ${totalImportance}`;
            
            if (result.message) {
                message += `\n\n${result.message}`;
            }
            
            alert(message);
        } else {
            alert('Failed to generate schedule. Please try again.');
        }
    }
    
    /**
     * Shows the importance selection modal
     */
    function showImportanceSelectionModal() {
        createImportanceModal();
        populateImportanceForm();
        importanceModal.classList.remove('hidden');
    }
    
    // Add event listener to the auto generate button
    if (autoGenerateBtn) {
        autoGenerateBtn.addEventListener('click', showImportanceSelectionModal);
    }
})();