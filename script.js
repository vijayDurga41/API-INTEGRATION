document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const weatherDisplay = document.getElementById('weather-display');

    // Your OpenWeatherMap API key
    const API_KEY = '696cd75d0c724274beb95711251606'; 

    // Event listeners
    getWeatherBtn.addEventListener('click', fetchWeatherData);
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchWeatherData();
        }
    });

    // Attempt to get weather by current location when the page loads
    getCurrentLocationWeather();

    async function fetchWeatherData() {
        const cityName = cityInput.value.trim();

        if (cityName === '') {
            weatherDisplay.innerHTML = '<p>Please enter a city name or allow location access.</p>';
            return;
        }

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;

        await fetchDataFromApi(apiUrl);
    }

    function getCurrentLocationWeather() {
        weatherDisplay.innerHTML = '<p>Attempting to get your current location weather...</p>';
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                    await fetchDataFromApi(apiUrl);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    let errorMessage = 'Could not get current location weather.';
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage += ' Please allow location access in your browser settings.';
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage += ' Location information is unavailable.';
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage += ' The request to get user location timed out.';
                    }
                    weatherDisplay.innerHTML = `<p>${errorMessage} Please enter a city manually.</p>`;
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Options for geolocation
            );
        } else {
            weatherDisplay.innerHTML = '<p>Geolocation is not supported by your browser. Please enter a city manually.</p>';
        }
    }

    async function fetchDataFromApi(apiUrl) {
        weatherDisplay.innerHTML = '<p>Fetching weather data...</p>'; // Show loading message

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (response.ok) {
                displayWeatherData(data);
            } else {
                weatherDisplay.innerHTML = `<p>Error: ${data.message || 'City not found or location data unavailable. Please try again.'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            weatherDisplay.innerHTML = '<p>An error occurred while fetching data. Please check your internet connection or try again later.</p>';
        }
    }

    function displayWeatherData(data) {
        const { name, main, weather, wind, sys } = data;
        const temperature = main.temp;
        const description = weather[0].description;
        const humidity = main.humidity;
        const windSpeed = wind.speed; // meters/sec
        const feelsLike = main.feels_like;
        const country = sys.country;

        weatherDisplay.innerHTML = `
            <h2>${name}, ${country}</h2>
            <div class="temperature">${temperature}°C</div>
            <div class="description">${description}</div>
            <div class="details">
                <div class="detail-item">
                    <span>Feels Like</span>
                    <p>${feelsLike}°C</p>
                </div>
                <div class="detail-item">
                    <span>Humidity</span>
                    <p>${humidity}%</p>
                </div>
                <div class="detail-item">
                    <span>Wind Speed</span>
                    <p>${windSpeed} m/s</p>
                </div>
            </div>
        `;
    }
});