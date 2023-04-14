import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Marker, Popup } from 'react-map-gl';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import YearSlider from './yearslider';
import fetchInfo from './fetchInfo';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

mapboxgl.accessToken = "pk.eyJ1IjoibW9ydGFsbGV4IiwiYSI6ImNsZ2R2OW5reDBvOXIzZXM5bjBwamQxNzUifQ.ybCGG03zORX7JVuiW9DpOQ";
const geocodingClient = mbxGeocoding({ accessToken: mapboxgl.accessToken });

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [year, setYear] = useState(1962);
  const [viewport, setViewport] = useState({ latitude: 50.911944, longitude: 0.4875, zoom: 14 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [infoPopup, setInfoPopup] = useState(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom
    });
  });

  const handleSubmit = useCallback(async () => {
    try {
      if (locationInput) {
        const response = await geocodingClient.forwardGeocode({ query: locationInput, limit: 1 }).send();
        const feature = response.body.features[0];

        if (feature) {
          const { center, place_name: placeName } = feature;
          const [longitude, latitude] = center;

          setSelectedLocation({ latitude, longitude, placeName });
          setLocationInput(placeName);

          setViewport({
            ...viewport,
            latitude,
            longitude,
            zoom: 10,
            pitch: 0,
            bearing: 0,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [locationInput, viewport]);

  const handleOverview = useCallback(() => {
    setViewport({});
  }, []);

  const handleGenerate = useCallback(async () => {
    try {
      if (selectedLocation) {
    //    setLoading(true); // set loading to true before making the API call
        const info = await fetchInfo(selectedLocation.placeName, year, openaiApiKey);
        setInfoPopup(info);
//setLoading(false); // set loading to false after the API call is completed
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedLocation, year, openaiApiKey]);

  const onViewportChange = useCallback((newViewport) => {
    setViewport((prevViewport) => ({ ...prevViewport, ...newViewport }));
  }, []);


  const { latitude: markerLat, longitude: markerLng, placeName: markerName } = selectedLocation || {};
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div className="year-slider-container">
        <span className="year-slider-text">Year: {year}</span>
        <input
          className="year-slider"
          type="range"
          min="1962"
          max="2021"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      <div className="location-input-container">
        <span className="input-container">
          <input
            className="location-input"
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="Enter a location"
          />
        </span>
        <span className="button-container">
          <button onClick={handleSubmit}>Go</button>
        </span>
      </div>

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }}>
        {selectedLocation && (
          <Marker latitude={markerLat} longitude={markerLng}>
            <Popup
              latitude={markerLat}
              longitude={markerLng}
              closeButton={true}
              closeOnClick={true}
              onClose={() => setSelectedLocation(null)}
              anchor="top"
            >
              <div>
                <h3>{markerName}</h3>
              </div>
            </Popup>
          </Marker>
        )}
        {infoPopup && (
          <Popup
            latitude={markerLat}
            longitude={markerLng}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setInfoPopup(null)}
            anchor="bottom"
            maxWidth={300}
          >
            <div>
              <p>{infoPopup}</p>
            </div>
          </Popup>
        )}
      </div>

      <div className="generate-button-container">
        <span className="button-container">
          <button onClick={handleGenerate}>Generate</button>
        </span>
      </div>
    </div>
  );
        };
export default Map;