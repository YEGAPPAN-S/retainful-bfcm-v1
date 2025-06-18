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

    // Function to check internet connectivity and fetch daily news
    function fetchDailyNews() {
        // Check if online
        if (!navigator.onLine) {
            document.getElementById('daily-news').textContent = "Internet is off - Unable to load daily news.";
            return;
        }

        // Fetch Retainful Daily News from the Google Sheets CSV (Your public URL)
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUZTnTVogpZXJkPA9txOtmrqZmYM9YkaQLYhONO_-oErNgzt449gOp0--bq1LpgD5tfaW3i-a1ZGC8/pub?gid=0&single=true&output=csv';

        fetch(sheetUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(csvData => {
                // Parse the CSV data into a JavaScript object
                const parsedData = parseCSV(csvData);

                // Get the current date
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                // Find today's news based on the date
                const todaysNews = parsedData.find(news => news.date === todayStr);

                // Display the news content for today
                if (todaysNews) {
                    // FIX: Actually display the news content
                    document.getElementById('daily-news').textContent = todaysNews.description;
                } else {
                    document.getElementById('daily-news').textContent = "No news available for today.";
                }
            })
            .catch((error) => {
                console.error('Error fetching daily news:', error);
                document.getElementById('daily-news').textContent = "Internet is off - Unable to load daily news.";
            });
    }

    // Initial call to fetch daily news
    fetchDailyNews();

    // Listen for online/offline events
    window.addEventListener('online', function () {
        fetchDailyNews();
    });

    window.addEventListener('offline', function () {
        document.getElementById('daily-news').textContent = "Internet is off - Unable to load daily news.";
    });

    // Initialize the current date to actual current date
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();
    let bfcmEvents = {};  // To store fetched BFCM events

    // Create tooltip element for hover events
    const tooltip = document.createElement('div');
    tooltip.className = 'event-tooltip';
    document.body.appendChild(tooltip);

    // Fetch BFCM events JSON once
    fetch(chrome.runtime.getURL('bfcm_events.json'))
        .then(response => response.json())
        .then(data => {
            // Store events in a dictionary with date as the key
            data.forEach(event => {
                bfcmEvents[event.date] = event.event;
            });

            // Once events are fetched, generate the calendar and display today's event
            generateCalendar(currentYear, currentMonth);
            displayTodayEvent();
        })
        .catch((error) => {
            console.error('Error loading BFCM events:', error);
            // Generate calendar even if BFCM events fail to load
            generateCalendar(currentYear, currentMonth);
            displayTodayEvent();
        });

    // Function to update the year and month display
    function updateYearAndMonth(year, month) {
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
        document.getElementById('year').textContent = year;
        document.getElementById('month-name').textContent = monthName;
    }

    // Function to display today's event only
    function displayTodayEvent() {
        const todayEventElement = document.getElementById('today-event');
        const todayEventSection = document.querySelector('.today-event-section');

        // Get today's date
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Check if there's an event for today
        if (bfcmEvents[todayStr]) {
            todayEventElement.textContent = bfcmEvents[todayStr];
            todayEventSection.style.display = 'block';
        } else {
            // Hide the entire today-event-section if no event
            todayEventSection.style.display = 'none';
        }
    }

    // Function to show tooltip
    function showTooltip(event, content) {
        tooltip.textContent = content;
        tooltip.style.display = 'block';
        
        // Position tooltip near mouse cursor
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
        
        // Adjust if tooltip goes off screen
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.left < 0) {
            tooltip.style.left = '8px';
        }
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = (window.innerWidth - tooltipRect.width - 8) + 'px';
        }
        if (tooltipRect.top < 0) {
            tooltip.style.top = (rect.bottom + 8) + 'px';
        }
    }

    // Function to hide tooltip
    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    // Function to generate the calendar based on year and month
    function generateCalendar(year, month) {
        updateYearAndMonth(year, month);

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const todayDate = new Date(); // Renamed to avoid confusion with outer scope

        const calendarGrid = document.getElementById("calendar-days");
        calendarGrid.innerHTML = ""; // Clear any existing calendar

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
                if (cellData.day === todayDate.getDate() &&
                    todayDate.getMonth() === month &&
                    todayDate.getFullYear() === year &&
                    !cellData.isOverflow) { // Don't highlight overflow days as today
                    dayCell.classList.add("today");
                }

                // Check if this date has an event and add has-event class
                if (bfcmEvents[currentDateStr]) {
                    dayCell.classList.add("has-event");
                    
                    // Add hover event listeners for tooltip
                    dayCell.addEventListener('mouseenter', function(event) {
                        showTooltip(event, bfcmEvents[currentDateStr]);
                    });
                    
                    dayCell.addEventListener('mouseleave', function() {
                        hideTooltip();
                    });
                    
                    // Handle mouse movement to reposition tooltip
                    dayCell.addEventListener('mousemove', function(event) {
                        if (tooltip.style.display === 'block') {
                            const rect = event.target.getBoundingClientRect();
                            tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                            tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
                        }
                    });
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

// Improved CSV Parser function
function parseCSV(data) {
    const rows = data.split('\n').filter(row => row.trim() !== ''); // Remove empty rows
    const parsed = [];

    for (let i = 1; i < rows.length; i++) { // Skip header row
        const row = rows[i].trim();
        if (!row) continue;

        // Simple CSV parsing - handles basic cases
        // For more complex CSV with quotes/commas, consider using a CSV library
        const columns = row.split(',');

        if (columns.length >= 2) {
            parsed.push({
                date: columns[0].trim(),
                description: columns.slice(1).join(',').trim() // Join remaining columns in case description has commas
            });
        }
    }

    return parsed;
}

console.log("Build with ♥ by Retainful Team");