import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Fade,
  Slide,
  Grow,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Thermostat, 
  WaterDrop, 
  Air, 
  Visibility, 
  Delete,
  Search,
  LocationOn,
  Refresh,
  WbSunny,
  NightsStay,
  CompareArrows,
  Map,
  Warning
} from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [searchHistory, setSearchHistory] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [compareDialog, setCompareDialog] = useState(false);
  const [compareCity, setCompareCity] = useState('');
  const [compareWeather, setCompareWeather] = useState(null);

  const API_KEY = 'e68730cc49fac5df720955333690fc7a';

  useEffect(() => {
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (city) => {
    const newHistory = [city, ...searchHistory.filter(item => item !== city)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
  };

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    setAnimate(false);
    
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=${unit}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=${unit}`;
      const airQualityUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${weather?.coord?.lat}&lon=${weather?.coord?.lon}&appid=${API_KEY}`;
      
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
      ]);
      
      if (weatherResponse.data && weatherResponse.data.cod === 200) {
        setWeather(weatherResponse.data);
        setForecast(forecastResponse.data);
        saveToHistory(city.trim());
        setAnimate(true);

        // Fetch air quality after getting coordinates
        if (weatherResponse.data.coord) {
          const airQualityResponse = await axios.get(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherResponse.data.coord.lat}&lon=${weatherResponse.data.coord.lon}&appid=${API_KEY}`
          );
          setAirQuality(airQualityResponse.data);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Detailed error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError(`API key error (${err.response.status}): ${err.response.data?.message || 'Invalid API key'}`);
        } else if (err.response.status === 404) {
          setError('City not found. Please check the spelling and try again.');
        } else if (err.response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError(`Server error (${err.response.status}): ${err.response.data?.message || 'An error occurred'}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setWeather(null);
      setForecast(null);
      setAirQuality(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  const handleUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
      setUnit(newUnit);
      if (weather) {
        fetchWeather();
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCompare = async () => {
    if (!compareCity.trim()) return;
    
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(compareCity.trim())}&appid=${API_KEY}&units=${unit}`
      );
      setCompareWeather(response.data);
    } catch (err) {
      console.error('Error comparing weather:', err);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getBackgroundColor = (temp) => {
    if (!temp) return '#f5f7fa';
    if (unit === 'metric') {
      if (temp > 30) return '#ff6b6b';
      if (temp > 20) return '#ffd93d';
      if (temp > 10) return '#6bcb77';
      return '#4d96ff';
    } else {
      if (temp > 86) return '#ff6b6b';
      if (temp > 68) return '#ffd93d';
      if (temp > 50) return '#6bcb77';
      return '#4d96ff';
    }
  };

  const getAirQualityText = (index) => {
    switch(index) {
      case 1: return 'Good';
      case 2: return 'Fair';
      case 3: return 'Moderate';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  };

  const getAirQualityColor = (index) => {
    switch(index) {
      case 1: return '#00e400';
      case 2: return '#ffff00';
      case 3: return '#ff7e00';
      case 4: return '#ff0000';
      case 5: return '#8f3f97';
      default: return '#666666';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        my: 4,
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${getBackgroundColor(weather?.main?.temp)} 0%, #c3cfe2 100%)`,
        transition: 'background 0.5s ease-in-out',
        p: 3,
        borderRadius: 2
      }}>
        <Fade in={true} timeout={1000}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              mb: 4
            }}
          >
            Weather Forecast
          </Typography>
        </Fade>
        
        <Slide direction="down" in={true} timeout={800}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'rgba(255,255,255,0.9)' }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Enter city"
                  variant="outlined"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={!!error}
                  helperText={error}
                  disabled={loading}
                  placeholder="e.g., London, New York, Tokyo"
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                >
                  {loading ? 'Searching' : 'Search'}
                </Button>
              </Box>
            </form>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <ToggleButtonGroup
                value={unit}
                exclusive
                onChange={handleUnitChange}
                aria-label="temperature unit"
              >
                <ToggleButton value="metric" aria-label="celsius">
                  °C
                </ToggleButton>
                <ToggleButton value="imperial" aria-label="fahrenheit">
                  °F
                </ToggleButton>
              </ToggleButtonGroup>
              <Box>
                <Tooltip title="Compare with another city">
                  <IconButton onClick={() => setCompareDialog(true)}>
                    <CompareArrows />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View on map">
                  <IconButton 
                    onClick={() => window.open(`https://www.google.com/maps?q=${weather?.coord?.lat},${weather?.coord?.lon}`, '_blank')}
                    disabled={!weather}
                  >
                    <Map />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </Slide>

        {weather && (
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab label="Current" />
              <Tab label="Hourly" />
              <Tab label="5-Day" />
            </Tabs>

            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Grow in={animate} timeout={1000}>
                    <Card sx={{ height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.9)' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <img 
                            src={getWeatherIcon(weather.weather[0].icon)} 
                            alt={weather.weather[0].description}
                            style={{ width: 100, height: 100 }}
                            className="weather-icon"
                          />
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                              {Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                            </Typography>
                            <Typography variant="h6" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                              {weather.name}, {weather.sys.country}
                            </Typography>
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                              {weather.weather[0].description}
                            </Typography>
                          </Box>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Thermostat sx={{ mr: 1, color: '#ff6b6b' }} />
                              <Typography>
                                Feels like: {Math.round(weather.main.feels_like)}°
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <WaterDrop sx={{ mr: 1, color: '#4d96ff' }} />
                              <Typography>
                                Humidity: {weather.main.humidity}%
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <WbSunny sx={{ mr: 1, color: '#ffd93d' }} />
                              <Typography>
                                Sunrise: {formatTime(weather.sys.sunrise)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Air sx={{ mr: 1, color: '#6bcb77' }} />
                              <Typography>
                                Wind: {weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Visibility sx={{ mr: 1, color: '#ffd93d' }} />
                              <Typography>
                                Visibility: {weather.visibility / 1000} km
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <NightsStay sx={{ mr: 1, color: '#4d96ff' }} />
                              <Typography>
                                Sunset: {formatTime(weather.sys.sunset)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {airQuality && (
                          <Box sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Air Quality
                            </Typography>
                            <Chip
                              label={getAirQualityText(airQuality.list[0].main.aqi)}
                              sx={{
                                bgcolor: getAirQualityColor(airQuality.list[0].main.aqi),
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grow in={animate} timeout={1000}>
                    <Card sx={{ height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.9)' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Hourly Forecast
                        </Typography>
                        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                          {forecast && forecast.list.slice(0, 8).map((item, index) => (
                            <React.Fragment key={index}>
                              <ListItem>
                                <ListItemText
                                  primary={formatTime(item.dt)}
                                  secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <img 
                                        src={getWeatherIcon(item.weather[0].icon)} 
                                        alt={item.weather[0].description}
                                        style={{ width: 40, height: 40 }}
                                        className="weather-icon"
                                      />
                                      <Typography sx={{ ml: 2 }}>
                                        {Math.round(item.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                              {index < 7 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grow in={animate} timeout={1000}>
                <Card sx={{ borderRadius: 2, background: 'rgba(255,255,255,0.9)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Hourly Forecast
                    </Typography>
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {forecast && forecast.list.map((item, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={formatTime(item.dt)}
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <img 
                                    src={getWeatherIcon(item.weather[0].icon)} 
                                    alt={item.weather[0].description}
                                    style={{ width: 40, height: 40 }}
                                    className="weather-icon"
                                  />
                                  <Typography>
                                    {Math.round(item.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                                  </Typography>
                                  <Typography sx={{ textTransform: 'capitalize' }}>
                                    {item.weather[0].description}
                                  </Typography>
                                  <Typography>
                                    Humidity: {item.main.humidity}%
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < forecast.list.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grow>
            )}

            {activeTab === 2 && (
              <Grow in={animate} timeout={1000}>
                <Card sx={{ borderRadius: 2, background: 'rgba(255,255,255,0.9)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      5-Day Forecast
                    </Typography>
                    <List>
                      {forecast && forecast.list.filter((_, index) => index % 8 === 0).map((item, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={formatDate(item.dt)}
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <img 
                                    src={getWeatherIcon(item.weather[0].icon)} 
                                    alt={item.weather[0].description}
                                    style={{ width: 40, height: 40 }}
                                    className="weather-icon"
                                  />
                                  <Typography>
                                    {Math.round(item.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                                  </Typography>
                                  <Typography sx={{ textTransform: 'capitalize' }}>
                                    {item.weather[0].description}
                                  </Typography>
                                  <Typography>
                                    Humidity: {item.main.humidity}%
                                  </Typography>
                                  <Typography>
                                    Wind: {item.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < 4 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grow>
            )}
          </Box>
        )}

        {searchHistory.length > 0 && (
          <Slide direction="up" in={true} timeout={1000}>
            <Paper elevation={3} sx={{ p: 2, mt: 3, borderRadius: 2, background: 'rgba(255,255,255,0.9)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Searches
              </Typography>
              <List>
                {searchHistory.map((item, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => {
                          setSearchHistory(searchHistory.filter((_, i) => i !== index));
                          localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory.filter((_, i) => i !== index)));
                        }}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item}
                      onClick={() => {
                        setCity(item);
                        fetchWeather();
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Slide>
        )}

        <Dialog open={compareDialog} onClose={() => setCompareDialog(false)}>
          <DialogTitle>Compare Weather</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Enter city to compare"
              fullWidth
              value={compareCity}
              onChange={(e) => setCompareCity(e.target.value)}
            />
            {compareWeather && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">
                  {compareWeather.name}, {compareWeather.sys.country}
                </Typography>
                <Typography>
                  Temperature: {Math.round(compareWeather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                </Typography>
                <Typography>
                  Feels like: {Math.round(compareWeather.main.feels_like)}°{unit === 'metric' ? 'C' : 'F'}
                </Typography>
                <Typography sx={{ textTransform: 'capitalize' }}>
                  {compareWeather.weather[0].description}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompareDialog(false)}>Cancel</Button>
            <Button onClick={handleCompare} variant="contained">Compare</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default App;
