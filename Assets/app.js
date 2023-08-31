const cityName = document.querySelector('.showweather h2');
const temperature = document.querySelector('.showweather .temperature span');
const wind = document.querySelector('.showweather .wind span');
const humidity = document.querySelector('.showweather .humidity span');
const currentIconElement = document.querySelector('.showweather .current-icon');
const forecastCards = document.querySelectorAll('.forecast-card');
const searchBox = document.getElementById('searchBox');
const savedCitiesUl = document.getElementById('saved');

// Load saved cities from local storage on page load
const loadSavedCities = () => {
  const savedCities = JSON.parse(localStorage.getItem('cities')) || [];
  savedCities.forEach((city) => {
    appendCityToList(city);
  });
};

// Save the city to local storage
const saveCityToLocalStorage = (city) => {
  const savedCities = JSON.parse(localStorage.getItem('cities')) || [];
  if (!savedCities.includes(city)) {
    savedCities.push(city);
    localStorage.setItem('cities', JSON.stringify(savedCities));
  }
};

// Append city to the saved list (only if not already in the list)
const appendCityToList = (city) => {
  const existingCities = Array.from(savedCitiesUl.children).map(
    (li) => li.textContent
  );
  if (!existingCities.includes(city)) {
    const li = document.createElement('li');
    li.textContent = city;
    savedCitiesUl.appendChild(li);
  }
};

const fetchWeather = (city) => {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    })
    .then((data) => displayWeather(data))
    .catch((error) => console.error('There was an error!', error));
};

const displayWeather = (data) => {
  cityName.textContent = data.name;
  temperature.textContent = (data.main.temp - 273.15).toFixed(2) + '°C';
  wind.textContent = data.wind.speed + ' km/h';
  humidity.textContent = data.main.humidity + '%';
  const iconCode = data.weather[0].icon;
  currentIconElement.src = `http://openweathermap.org/img/w/${iconCode}.png`;
};

const populateForecast = (data) => {
  let currentDate = new Date();

  for (let i = 0; i < 5; i++) {
    const dateElement = forecastCards[i].querySelector('h3');
    const tempElement = forecastCards[i].querySelector('.temperature span');
    const windElement = forecastCards[i].querySelector('.wind span');
    const humidityElement = forecastCards[i].querySelector('.humidity span');
    const iconElement = forecastCards[i].querySelector('.forecast-icon');

    const forecast = data.list[i * 8];
    dateElement.textContent = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;

    tempElement.textContent = `${Math.round(forecast.main.temp - 273.15)}°C`;
    windElement.textContent = `${forecast.wind.speed} km/h`;
    humidityElement.textContent = `${forecast.main.humidity}%`;
    currentDate.setDate(currentDate.getDate() + 1);

    const iconCode = forecast.weather[0].icon;
    iconElement.src = `http://openweathermap.org/img/w/${iconCode}.png`;
  }
};

const fetchForecast = (city) => {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      return response.json();
    })
    .then((data) => populateForecast(data))
    .catch((error) => console.error('There was an error!', error));
};

// Clicking the search button
document.querySelector('.btn').addEventListener('click', () => {
  const city = searchBox.value;

  if (city) {
    saveCityToLocalStorage(city);
    appendCityToList(city);
    fetchWeather(city);
    fetchForecast(city);
  } else {
    console.log('Please enter a city name.');
  }
});

// Clicking on a saved city to fetch its weather
savedCitiesUl.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const city = e.target.textContent;
    fetchWeather(city);
    fetchForecast(city);
  }
});

// Load cities from local storage upon loading the page
loadSavedCities();
