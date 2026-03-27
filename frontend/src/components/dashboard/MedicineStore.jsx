import React, { useState, useEffect } from 'react';
import { Store, Navigation, AlertCircle, Loader2, Map } from 'lucide-react';

const MedicineStore = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get User Location
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
      (err) => {
        setError("Unable to retrieve your location. Please enable location services.");
        setLoading(false);
      }
    );
  }, []);

  const openMapsSearch = () => {
    let url = 'https://www.google.com/maps/search/pharmacies+near+me';
    if (userLocation) {
       // Append coordinates to center the map precisely
       url = `https://www.google.com/maps/search/pharmacies+near+me/@${userLocation.lat},${userLocation.lng},15z`;
    }
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
          <p className="text-slate-500 mt-1 text-sm">Find and navigate to nearby pharmacies instantly on Google Maps.</p>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-600 p-6 rounded-2xl flex items-center gap-3 border border-amber-100 mb-6">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-medium">{error} - We can still try opening Google Maps directly.</p>
        </div>
      )}

      <div className="flex-1 min-h-[400px] rounded-2xl border border-slate-200 shadow-sm bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-blue-50 p-6 rounded-full mb-6 relative">
          <Map className="w-16 h-16 text-blue-500" />
          {userLocation && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {userLocation ? "Location Detected!" : "Find Pharmacies"}
        </h3>
        
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          {userLocation 
            ? "We've located you securely. Click below to see all the nearest medical stores directly on Google Maps."
            : "Click below to open Google Maps and find pharmacies near your current location."}
        </p>
        
        <button
          onClick={openMapsSearch}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all w-full sm:w-auto text-lg"
        >
          <Navigation className="w-6 h-6" />
          Find Pharmacies Near Me
        </button>
      </div>
    </div>
  );
};

export default MedicineStore;
