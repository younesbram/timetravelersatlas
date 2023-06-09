import React, { useState, useCallback } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import YearSlider from './yearslider';
import fetchInfo from './fetchInfo';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const REACT_APP_MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibW9ydGFsbGV4IiwiYSI6ImNsZ2R2OW5reDBvOXIzZXM5bjBwamQxNzUifQ.ybCGG03zORX7JVuiW9DpOQ";
const geocodingClient = mbxGeocoding({ accessToken: REACT_APP_MAPBOX_ACCESS_TOKEN });

const Map = () => {
  const [year, setYear] = useState(1962);
  const [viewport, setViewport] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [infoPopup, setInfoPopup] = useState(null);
  //  const [loading, setLoading] = useState(false); // define the loading variable

  const handleGenerate = useCallback(async () => {
    try {
      if (locationInput) {
        const response = await geocodingClient.forwardGeocode({ query: locationInput, limit: 1 }).send();
        const feature = response.body.features[0];

        if (feature) {
          const { center, place_name: placeName } = feature;
          const [longitude, latitude] = center;

          setViewport({
            ...viewport,
            latitude,
            longitude,
            zoom: 6.66,
            pitch: 0,
            bearing: 0,
          });

          const info = await fetchInfo(placeName, year, openaiApiKey);
          setInfoPopup(info);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [locationInput, year, openaiApiKey, viewport]);


  const handleOverview = useCallback(() => {
    setInfoPopup(null);
    setSelectedLocation(null);
    setViewport({});
  }, []);

  const onViewportChange = useCallback((newViewport) => {
    setViewport((prevViewport) => ({ ...prevViewport, ...newViewport }));
  }, []);

  const { latitude: markerLat, longitude: markerLng, placeName: markerName } = selectedLocation || {};
  const { latitude: infoLat, longitude: infoLng } = viewport;

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <YearSlider year={year} setYear={setYear} />
      <input
        type="text"
        value={locationInput}
        onChange={(e) => setLocationInput(e.target.value)}
        placeholder="Enter location"
        style={{ position: 'absolute', top: 0, right: 150 }}
      />
      <button onClick={handleGenerate} style={{ position: 'absolute', top: 0, right: 10 }}>
        Generate
      </button>
      {/* OpenAI API key input */}
      <input
        type="password"
        value={openaiApiKey}
        onChange={(e) => setOpenaiApiKey(e.target.value)}
        placeholder="Enter OpenAI API Key"
        style={{ position: 'absolute', top: 0, left: 340 }}
      />
      <button onClick={handleOverview} style={{ position: 'absolute', top: 0, right: 700 }}>
        Stuck?
      </button>
      <ReactMapGL
        width="95%"
        height="95%"
        {...viewport}
        mapboxApiAccessToken={REACT_APP_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        onViewportChange={onViewportChange}
      >
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
            className="popup"
            latitude={infoLat}
            longitude={infoLng}
            closeButton={true}
            closeOnClick={false}
            onClose={() => {
              setInfoPopup(null);
              handleOverview();
            }}
            anchor="top"
          >

            <div>
              <p>{infoPopup}</p>
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </div>
  );

};
export default Map;