const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temp-value");
const descElement = document.querySelector(".temp-description");
const locationElement = document.querySelector(".location");
const notificationElement = document.getElementById("container");

const weather = {
        temperature: {
            unit: "celsius"
        },
        windSpeed: null,
        humidity: null,
        forecast: []
    };
    
weather.temperature = {
    unit: "celsius"
};
const Kelvin = 273;
const apiKey = '2a7077753c2b02bb7b854c980b57e133';

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = "<p>Browser doesn't support Geolocation</p>";
}

function setPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    getWeather(latitude, longitude);
}

function showError(error) {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p>${error.message}</p>`;
}

function getWeather(latitude, longitude) {
    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    fetchWeather(api);
}

function getWeatherByCity(city) {
    let api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    fetchWeather(api);
}

function fetchWeather(api) {
    fetch(api)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            weather.temperature.value = Math.floor(data.main.temp - Kelvin);
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
            weather.windSpeed = data.wind.speed;
            weather.humidity = data.main.humidity;
            
            // Fetch 7-day forecast
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&appid=${apiKey}`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Parse the forecast data
            const dailyForecast = data.list.filter(item => item.dt_txt.includes('12:00:00'));
            weather.forecast = dailyForecast.map(item => ({
                date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                icon: item.weather[0].icon,
                temperature: Math.floor(item.main.temp - Kelvin),
                humidity: item.main.humidity, // Include humidity
                description: item.weather[0].description // Include description
            }));
        })
        .then(() => {
            displayWeather();
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            notificationElement.style.display = "block";
            notificationElement.innerHTML = `<p>Failed to fetch weather data. Please try again.</p>`;
        });
}

function displayWeather() {
    iconElement.innerHTML = `<img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP8gmKAHWl_KC23-gSPRZhl-Q8kzMa_cDAVA&s' width="120px">`;
    tempElement.innerHTML = `${weather.temperature.value} °<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    document.getElementById('wind').innerHTML = `Wind Speed: ${weather.windSpeed} m/s`;
    document.getElementById('humidity').innerHTML = `Humidity: ${weather.humidity}%`;

    // Display 7-day forecast
    let forecastHTML = '';
    weather.forecast.forEach(day => {
        forecastHTML += `<div class="forecast-item">
                            <div>${day.date}</div>
                            <img src="https://openweathermap.org/img/wn/${day.icon}.png" width="50px">
                            <div>${day.temperature} °C</div>
                            <div>Humidity: ${getForecastHumidity(day.date)}</div>
                            <div>${getForecastDescription(day.date)}</div>
                        </div>`;
    });
    document.getElementById('forecast').innerHTML = forecastHTML;
}

function getForecastHumidity(date) {
    // Assuming weather.forecast is an array of objects with 'date' property
    const forecastDay = weather.forecast.find(day => day.date === date);
    if (forecastDay) {
        return `${forecastDay.humidity}%`;
    }
    return 'N/A';
}

function getForecastDescription(date) {
    // Assuming weather.forecast is an array of objects with 'date' property
    const forecastDay = weather.forecast.find(day => day.date === date);
    if (forecastDay) {
        return forecastDay.description;
    }
    return 'N/A';
}



function celsiusToFahrenheit(temperature) {
    return (temperature * 9/5) + 32;
}

tempElement.addEventListener("click", function() {
    if (weather.temperature.value === undefined) return;

    if (weather.temperature.unit === "celsius") {
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);
        
        tempElement.innerHTML = `${fahrenheit} <span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    } else {
        tempElement.innerHTML = `${weather.temperature.value} <span>C</span>`;
        weather.temperature.unit = "celsius";
    }
});

document.getElementById('getWeather').addEventListener('click', function() {
    const city = document.getElementById('city').value.trim();
    if (city) {
        getWeatherByCity(city);
    } else {
        alert('Please enter a city name');
    }
});
