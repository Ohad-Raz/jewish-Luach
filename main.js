// Function to fetch Hebcal API for a specific year and month
async function fetchHebcalAPI(year, month) {
  const apiUrl = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=${year}&month=${month}&ss=on&mf=on&c=on&city=Jerusalem&tzid=Asia/Jerusalem&lg=he`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.items;
}

// Function to fetch Hebcal Converter API for a specific date
async function fetchHebcalConverterAPI(date) {
  const apiUrl = `https://www.hebcal.com/converter?cfg=json&date=${date}&g2h=1&strict=1`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Function to render monthly events in a card
async function renderMonthlyEvents(year, month, events) {
  const monthContainer = document.createElement("div");
  monthContainer.className = "month-container";

  // Render the month header
  const headerElement = document.createElement("h3");
  headerElement.textContent = `חודש: ${month} - שנה: ${year}`;
  monthContainer.appendChild(headerElement);

  // Render toggle button
  const toggleButton = document.createElement("button");
 toggleButton.className = "buttonShowHide";
  toggleButton.textContent = "הצג/הסתר חודש";
  monthContainer.appendChild(toggleButton);

  // Group events by date
  const eventsMap = new Map();

  for (const event of events) {
    const formattedDate = event.date.split("T")[0];
    if (!eventsMap.has(formattedDate)) {
      eventsMap.set(formattedDate, [event]);
    } else {
      eventsMap.get(formattedDate).push(event);
    }
  }

  // Render daily events
  const eventsContainer = document.createElement("div");
  eventsContainer.className = "events-container";

  for (const [date, eventGroup] of eventsMap) {
    const eventElement = document.createElement("div");
    eventElement.className = "event-card";

    // Fetch Hebcal Converter API for the first event date in the group
    const converterData = await fetchHebcalConverterAPI(date);

    eventElement.innerHTML = `
      <h3>${converterData.gd}/${converterData.gm}/${converterData.gy}</h3>
      <p>התאריך העברי : ${converterData.hebrew}</p>
      <p>שנה עברית: ${converterData.hy}</p>
      <hr>
      ${eventGroup.map((event) => `<p>${event.title}</p>`).join("<hr>")}
      <hr>
    `;
    eventsContainer.appendChild(eventElement);
  }

  // Initially hide the events container
  eventsContainer.style.display = "none";

  // Add click event listener to toggle button
  toggleButton.addEventListener("click", () => {
    if (eventsContainer.style.display === "none") {
      eventsContainer.style.display = "flex";
    } else {
      eventsContainer.style.display = "none";
    }
  });

  monthContainer.appendChild(eventsContainer);
  document.body.appendChild(monthContainer);
}

// Loop through each day from January 1, 2024, to January 1, 2026
const startDate = new Date(2024, 0, 1); // January is 0-based
const endDate = new Date(2032, 0, 1);

async function fetchData() {
  let currentDate = startDate;
  while (currentDate < endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Months are 1-based
    const events = await fetchHebcalAPI(year, month);
    await renderMonthlyEvents(year, month, events);
    currentDate.setMonth(currentDate.getMonth() + 1); // Move to the next month
  }
}

// Call the fetchData function after the DOM has loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});
