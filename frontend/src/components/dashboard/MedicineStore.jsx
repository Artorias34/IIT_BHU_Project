import React, { useState, useEffect } from 'react';
import { Navigation, Store, Star, MapPin, AlertCircle, Loader2, Map } from 'lucide-react';

const MedicineStore = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Get User Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      () => {
        setError("Unable to retrieve your location. Please enable location.");
        setLoading(false);
      }
    );
  }, []);

  // 2. Load Google Maps & Fetch Pharmacies
  useEffect(() => {
    if (!userLocation) return;

    const loadGoogleMapsScript = () => {
      if (document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]')) {
        if (window.google) initMapAndPlaces();
        return;
      }

      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.warn("No API key → showing mock data");
        setPharmacies([
          { id: '1', name: 'Apollo Pharmacy', vicinity: 'Near Hospital', rating: 4.5, distance: '0.8 km', lat: userLocation.lat + 0.005, lng: userLocation.lng + 0.005 },
          { id: '2', name: 'Wellness Store', vicinity: 'Park Road', rating: 4.2, distance: '1.2 km', lat: userLocation.lat - 0.005, lng: userLocation.lng - 0.004 }
        ]);
        setLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = initMapAndPlaces;
      script.onerror = () => {
        setError("Failed to load Google Maps");
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMapAndPlaces = () => {
      if (!window.google) return;

      const map = new window.google.maps.Map(document.createElement("div"), {
        center: userLocation,
        zoom: 14,
      });

      const service = new window.google.maps.places.PlacesService(map);

      service.nearbySearch(
        {
          location: userLocation,
          radius: 5000,
          type: "pharmacy"
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const formatted = results.map(place => ({
              id: place.place_id,
              name: place.name,
              vicinity: place.vicinity,
              rating: place.rating || "N/A",
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }));
            setPharmacies(formatted);
          } else {
            setError("No pharmacies found.");
          }
          setLoading(false);
        }
      );
    };

    loadGoogleMapsScript();
  }, [userLocation]);

  // Open Google Maps directions
  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  // Open Google Maps search
  const openMapsSearch = () => {
    let url = 'https://www.google.com/maps/search/pharmacies+near+me';
    if (userLocation) {
      url = `https://www.google.com/maps/search/pharmacies+near+me/@${userLocation.lat},${userLocation.lng},15z`;
    }
    window.open(url, '_blank');
  };

  // Loading UI
  if (loading && !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Detecting your location...</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Store className="w-6 h-6 text-blue-600" />
        Medicine Store Locator
      </h2>

      {error && (
        <div className="bg-red-100 p-4 rounded mb-4 flex gap-2">
          <AlertCircle />
          {error}
        </div>
      )}

      <button
        onClick={openMapsSearch}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Find on Google Maps
      </button>

      <div className="grid gap-4">
        {pharmacies.map((store) => (
          <div key={store.id} className="border p-4 rounded">
            <h3 className="font-bold">{store.name}</h3>
            <p>{store.vicinity}</p>
            <p>⭐ {store.rating}</p>

            <button
              onClick={() => openDirections(store.lat, store.lng)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
            >
              Get Directions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicineStore;