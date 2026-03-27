import React, { useState, useEffect } from 'react';
import { Navigation, Store, Star, MapPin, AlertCircle, Loader2 } from 'lucide-react';

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
      },
      (err) => {
        setError("Unable to retrieve your location. Please enable location services.");
        setLoading(false);
      }
    );
  }, []);

  // 2. Load Google Maps Script & Fetch Places
  useEffect(() => {
    if (!userLocation) return;

    const loadGoogleMapsScript = () => {
      // Check if script already exists
      if (document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]')) {
        if (window.google) initMapAndPlaces();
        return;
      }

      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Expecting this env variable
      if (!apiKey) {
        // Fallback for demo/dev if no API key is set yet
        console.warn("Google Maps API Key missing. Showing mock data for demonstration.");
        setPharmacies([
          { id: '1', name: 'Apollo Pharmacy', vicinity: '123 Main St, Near Hospital', rating: 4.5, distance: '0.8 km', lat: userLocation.lat + 0.005, lng: userLocation.lng + 0.005 },
          { id: '2', name: 'Wellness Medical Store', vicinity: '45 Park Avenue', rating: 4.2, distance: '1.2 km', lat: userLocation.lat - 0.005, lng: userLocation.lng - 0.004 },
          { id: '3', name: 'City Health Pharma', vicinity: '78 Market Road', rating: 4.8, distance: '2.5 km', lat: userLocation.lat + 0.01, lng: userLocation.lng - 0.008 }
        ]);
        setLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMapAndPlaces;
      script.onerror = () => {
        setError("Failed to load Google Maps");
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMapAndPlaces = () => {
      if (!window.google) return;
      
      const mapElement = document.createElement('div');
      const map = new window.google.maps.Map(mapElement, {
        center: userLocation,
        zoom: 14,
      });

      const service = new window.google.maps.places.PlacesService(map);
      
      const request = {
        location: userLocation,
        radius: '5000', // 5km
        type: 'pharmacy',
        keyword: 'pharmacy OR chemist OR medical'
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const formattedPlaces = results.map(place => {
            // Calculate approximate distance (straight line) for UI sorting
            const R = 6371; // Earth's radius in km
            const dLat = (place.geometry.location.lat() - userLocation.lat) * Math.PI / 180;
            const dLon = (place.geometry.location.lng() - userLocation.lng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(place.geometry.location.lat() * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;

            return {
              id: place.place_id,
              name: place.name,
              vicinity: place.vicinity,
              rating: place.rating || 'N/A',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              distanceVal: distance,
              distance: distance.toFixed(1) + ' km'
            };
          }).sort((a, b) => a.distanceVal - b.distanceVal);

          setPharmacies(formattedPlaces);
        } else {
          setError("No nearby pharmacies found or API error.");
        }
        setLoading(false);
      });
    };

    loadGoogleMapsScript();
  }, [userLocation]);

  const openDirections = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loading && !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Detecting your location...</h3>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            Medicine Store Locator
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Find and navigate to nearby pharmacies instantly.</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white relative flex flex-col">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-slate-700">Searching for nearby pharmacies...</h3>
            </div>
          )}

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max bg-slate-50/50">
            {pharmacies.length === 0 && !loading ? (
              <div className="col-span-full py-12 text-center">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No pharmacies found nearby.</p>
              </div>
            ) : (
              pharmacies.map((store, index) => (
                <div 
                  key={store.id} 
                  className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all group flex flex-col ${
                    index === 0 ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  {index === 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 bg-blue-50 w-max px-3 py-1 rounded-full">
                      <MapPin className="w-3.5 h-3.5" />
                      Closest to you
                    </div>
                  )}
                  
                  <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{store.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 min-h-[20px]">
                    <div className="flex items-center gap-1 font-medium text-slate-700">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {store.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {store.distance}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-2">
                    {store.vicinity}
                  </p>
                  
                  <button
                    onClick={() => openDirections(store.lat, store.lng)}
                    className={`w-full flex items-center text-sm justify-center gap-2 py-2.5 rounded-xl font-medium transition-all mt-auto ${
                      index === 0 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineStore;
