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
        .catch(error => {
            document.getElementById('quote').textContent = "Sorry, couldn't load a quote at the moment.";
        });

    // Initialize the current date
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    // Function to update the year and month display
    function updateYearAndMonth(year, month) {
        // Get the month name
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

        // Update the DOM with the current year and month name
        const yearElement = document.getElementById('year');
        const monthElement = document.getElementById('month-name');

        // Check if elements exist before updating
        if (yearElement) {
            yearElement.textContent = year;
        }
        if (monthElement) {
            monthElement.textContent = monthName;
        }
    }

    // Function to generate the calendar based on year and month
    function generateCalendar(year, month) {
        // Update the year and month display FIRST
        updateYearAndMonth(year, month);

        const currentDate = new Date(year, month, 1);
        const firstDayOfMonth = currentDate.getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const calendarBody = document.querySelector("#calendar tbody");

        if (!calendarBody) {
            console.error("Calendar tbody element not found");
            return;
        }

        calendarBody.innerHTML = ""; // Clear any existing calendar

        let row = document.createElement("tr");
        let dayCounter = 1;

        // Fill in the first row with empty cells if the month doesn't start on Sunday
        for (let i = 0; i < firstDayOfMonth; i++) {
            row.appendChild(document.createElement("td"));
        }

        // Populate the calendar with days
        for (let i = firstDayOfMonth; i < 7; i++) {
            const cell = document.createElement("td");
            cell.textContent = dayCounter;
            if (dayCounter === today.getDate() && today.getMonth() === month && today.getFullYear() === year) {
                cell.classList.add("today");
            }
            row.appendChild(cell);
            dayCounter++;
        }
        calendarBody.appendChild(row);

        // Fill in the remaining days
        while (dayCounter <= lastDateOfMonth) {
            row = document.createElement("tr");
            for (let i = 0; i < 7; i++) {
                if (dayCounter > lastDateOfMonth) {
                    break;
                }
                const cell = document.createElement("td");
                cell.textContent = dayCounter;
                if (dayCounter === today.getDate() && today.getMonth() === month && today.getFullYear() === year) {
                    cell.classList.add("today");
                }
                row.appendChild(cell);
                dayCounter++;
            }
            calendarBody.appendChild(row);
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

    // Initialize the calendar and year/month display on page load
    generateCalendar(currentYear, currentMonth);
});