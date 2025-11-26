const WeatherApp = class {
    constructor(apiKey, resultsBlockSelector) {
        this.apiKey = apiKey;
        this.resultsBlock = document.querySelector(resultsBlockSelector);
        this.currentWeatherContainer = this.resultsBlock.querySelector("#current-weather");
        this.forecastContainer = this.resultsBlock.querySelector("#forecast-container");
    }

    getCurrentWeather(query) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${this.apiKey}&units=metric&lang=pl`;
        const xhr = new XMLHttpRequest();
        
        xhr.open("GET", url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log(data);
                this.drawCurrentWeather(data);
            } else {
                alert("Błąd pobierania danych o aktualnej pogodzie");
            }
        };
        xhr.send();
    }

    getForecast(query) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&appid=${this.apiKey}&units=metric&lang=pl`;

        return fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                this.drawForecast(data);
            })
            .catch(err => alert("Błąd pobieranie prognozy pogody"));
    }

    getWeather(query) {
        this.getCurrentWeather(query);
        this.getForecast(query);
    }

    drawCurrentWeather(data) {
        this.currentWeatherContainer.querySelector(".weather-date").textContent = 
            new Date().toLocaleString("pl-PL");
        this.currentWeatherContainer.querySelector(".weather-temperature").textContent = 
            `${data.main.temp.toFixed(1)} °C`;
        this.currentWeatherContainer.querySelector(".weather-temperature-feels-like").textContent = 
            `Temperatura odczuwalna: ${data.main.feels_like.toFixed(1)} °C`;
        this.currentWeatherContainer.querySelector(".weather-description").textContent = 
            data.weather[0].description;

        const icon = this.currentWeatherContainer.querySelector(".weather-icon");
        icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        icon.style.display = "block";
    }

    drawForecast(data) {
        this.forecastContainer.innerHTML = "";

        for (let i = 0; i < 8; i++) {
            const item = data.list[i];
            const block = this.createWeatherBlock(
                item.dt_txt,
                item.main.temp.toFixed(1),
                item.main.feels_like.toFixed(1),
                item.weather[0].icon,
                item.weather[0].description
            );
            this.forecastContainer.appendChild(block);
        }
    }

    createWeatherBlock(dateString, temperature, fellsLikeTemperature, iconName, description) {
        const div = document.createElement("div");
        div.className = "forecast-block";
        div.innerHTML = `
            <div>${dateString}</div>
            <img src="https://openweathermap.org/img/wn/${iconName}.png" alt="ikona pogody">
            <div>${temperature} °C</div>
            <div>Odczuwalna: ${fellsLikeTemperature} °C</div>
            <div>${description}</div>
            `;
            return div;
    }
};

document.weatherApp = new WeatherApp("67b514a9e9705e51e0f38156d58ef620", "#weather-results-container");

document.querySelector("#checkButton").addEventListener("click", function() {
    const query = document.querySelector("#locationInput").value;
    document.weatherApp.getWeather(query);
});