console.log("Build with ♥︎ by Retainful Team");

document.addEventListener("DOMContentLoaded", function () {
    // Fetch the local quotes.json file using chrome.runtime.getURL
    fetch(chrome.runtime.getURL('quotes.json'))
        .then(response => response.json())
        .then(data => {
            const randomIndex = Math.floor(Math.random() * data.length);
            const randomQuote = data[randomIndex].quote;
            document.getElementById('quote').textContent = randomQuote;
        })
        .catch(() => {
            document.getElementById('quote').textContent = "Sorry, couldn't load a quote at the moment.";
        });

    // Initialize the current date to actual current date
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth(); // Current month (0-11)

    let bfcmEvents = {};  // To store fetched BFCM events

    // Fetch BFCM events JSON once
    fetch(chrome.runtime.getURL('bfcm_events.json'))
        .then(response => response.json())
        .then(data => {
            // Store events in a dictionary with date as the key
            data.forEach(event => {
                bfcmEvents[event.date] = event.event;
            });

            // Once events are fetched, generate the calendar
            generateCalendar(currentYear, currentMonth);
        })
        .catch(() => {
            // Generate calendar even if BFCM events fail to load
            generateCalendar(currentYear, currentMonth);
        });

    // Function to update the year and month display
    function updateYearAndMonth(year, month) {
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
        document.getElementById('year').textContent = year;
        document.getElementById('month-name').textContent = monthName;
    }

    // Function to generate the calendar based on year and month
    function generateCalendar(year, month) {
        updateYearAndMonth(year, month);

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const calendarGrid = document.getElementById("calendar-days");
        calendarGrid.innerHTML = ""; // Clear any existing calendar

        // Total cells available (5 rows × 7 days = 35 cells)
        const totalCells = 35;
        
        // Create an array to hold all calendar cells
        const calendarCells = new Array(totalCells).fill(null);
        
        // Calculate total days needed including empty spaces at beginning
        const totalDaysWithSpaces = firstDayOfMonth + lastDateOfMonth;
        
        // If the month extends beyond 5 rows, we need to wrap the overflow days
        if (totalDaysWithSpaces > totalCells) {
            const overflowDays = totalDaysWithSpaces - totalCells;
            
            // Place overflow days at the beginning (in empty spaces)
            let overflowDay = lastDateOfMonth - overflowDays + 1;
            for (let i = 0; i < Math.min(overflowDays, firstDayOfMonth); i++) {
                calendarCells[i] = {
                    day: overflowDay,
                    isOverflow: true
                };
                overflowDay++;
            }
            
            // Place regular days starting from firstDayOfMonth
            let regularDay = 1;
            for (let i = firstDayOfMonth; i < totalCells && regularDay <= lastDateOfMonth - overflowDays; i++) {
                calendarCells[i] = {
                    day: regularDay,
                    isOverflow: false
                };
                regularDay++;
            }
        } else {
            // Normal case - no overflow needed
            let day = 1;
            for (let i = firstDayOfMonth; i < firstDayOfMonth + lastDateOfMonth; i++) {
                calendarCells[i] = {
                    day: day,
                    isOverflow: false
                };
                day++;
            }
        }

        // Generate the calendar cells
        for (let i = 0; i < totalCells; i++) {
            const dayCell = document.createElement("div");
            dayCell.classList.add("calendar-day");

            if (calendarCells[i] === null) {
                // Empty cell
                dayCell.classList.add("empty");
            } else {
                const cellData = calendarCells[i];
                const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(cellData.day).padStart(2, '0')}`;

                // Add day number
                const dayNumber = document.createElement("span");
                dayNumber.textContent = cellData.day;
                dayCell.appendChild(dayNumber);

                // Add overflow styling if needed
                if (cellData.isOverflow) {
                    dayCell.classList.add("overflow-day");
                }

                // Check if the current date is today
                if (cellData.day === today.getDate() && today.getMonth() === month && today.getFullYear() === year) {
                    dayCell.classList.add("today");
                }

                // Check if the current date has a BFCM event
                if (bfcmEvents[currentDateStr]) {
                    const eventDiv = document.createElement("div");
                    eventDiv.classList.add("event");
                    eventDiv.textContent = bfcmEvents[currentDateStr];
                    dayCell.appendChild(eventDiv);
                }
            }

            calendarGrid.appendChild(dayCell);
        }
    }

    // Event listeners for month navigation
    document.getElementById("prev-month").addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth);
    });

    document.getElementById("next-month").addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
    });
});