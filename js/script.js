let weatherData = [];

async function loadWeatherData() {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=47.4979&longitude=19.0402&daily=temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max&timezone=Europe/Budapest');
    const data = await response.json();
    
    weatherData = data.daily.time.map((time, index) => ({
        time,
        temperature: (data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2,
        rain: data.daily.rain_sum[index],
        wind_speed: data.daily.wind_speed_10m_max[index]
    }));
    
    displayTemperatureChart();
    document.getElementById('result').innerText = "Adatok betöltve!";
}

function displayTemperatureChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    const labels = weatherData.map(day => day.time);
    const data = weatherData.map(day => day.temperature);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Napi Átlaghőmérséklet (°C)',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function showMinTemperature() {
    const minTemp = Math.min(...weatherData.map(day => day.temperature));
    document.getElementById('result').innerText = `A 7 nap legalacsonyabb hőmérséklete: ${minTemp} °C`;
}

function showMaxWindSpeed() {
    const maxWindSpeed = Math.max(...weatherData.map(day => day.wind_speed));
    document.getElementById('result').innerText = `A 7 nap legnagyobb szélsebessége: ${maxWindSpeed} km/h`;
}

function showMaxRainfall() {
    const maxRainDay = weatherData.reduce((maxDay, currentDay) => currentDay.rain > maxDay.rain ? currentDay : maxDay, weatherData[0]);
    document.getElementById('result').innerText = `A legtöbb csapadék ${maxRainDay.time} napján esett: ${maxRainDay.rain} mm`;
}

function downloadData() {
    const dataStr = weatherData.map(day => `${day.time}; ${day.temperature}; ${day.rain}`).join('\n');
    const blob = new Blob([dataStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weather_data.csv';
    a.click();
    URL.revokeObjectURL(url);
}
