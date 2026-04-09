import React, { useEffect, useRef, useState } from "react";
import colors from "../theme/colors";

function KioskMap({ kiosks }) {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let attempts = 0;
    
    const initMap = () => {
      if (!window.google) {
        attempts++;
        if (attempts > 10) {
          setMapError(true);
          return;
        }
        setTimeout(initMap, 500);
        return;
      }

      // Premium minimal map style to match the new UI
      const mapStyles = [
        { featureType: "all", elementType: "geometry", stylers: [{ color: "#F8FAFC" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#EAF2FF" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e2e8f0" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#0F172A" }] }
      ];

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.4595, lng: 77.0266 }, // Gurgaon default
        zoom: 12,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // 📍 User location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const userLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          new window.google.maps.Marker({
            position: userLoc,
            map,
            title: "You are here",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#0F172A",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });

          map.setCenter(userLoc);
        }, () => console.log("Geolocation disabled/denied"));
      }

      // 🖨️ Kiosk markers
      kiosks.forEach((kiosk) => {
        const marker = new window.google.maps.Marker({
          position: { lat: Number(kiosk.lat), lng: Number(kiosk.lng) },
          map,
          title: kiosk.name,
          icon: {
             path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
             fillColor: "#2563EB",
             fillOpacity: 1,
             strokeWeight: 0,
             scale: 1.5,
             anchor: new window.google.maps.Point(12, 24)
          }
        });

        // 📌 Info popup with premium styles
        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 5px; color: #0F172A; font-family: 'Inter', sans-serif;">
              <h3 style="margin: 0 0 5px 0; color: #2563EB;">${kiosk.name}</h3>
              <p style="margin: 0 0 5px 0; font-size: 13px;">${kiosk.address}</p>
              <p style="margin: 0; font-size: 12px; font-weight: 600;">Status: ${kiosk.status}</p>
              <a href="https://www.google.com/maps?q=${kiosk.lat},${kiosk.lng}" target="_blank" style="display: inline-block; margin-top: 8px; color: #2563EB; text-decoration: none; font-weight: bold;">Open in Maps →</a>
            </div>
          `,
        });

        marker.addListener("click", () => {
          info.open(map, marker);
        });
      });
    };
    
    initMap();
  }, [kiosks]);

  return (
    <div 
      style={{ 
        borderRadius: "16px", 
        overflow: "hidden", 
        border: "2px solid #EAF2FF", 
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        background: "#ffffff"
      }}
    >
      {mapError ? (
        <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
          Map failed to load. Please check your connection.
        </div>
      ) : (
        <div ref={mapRef} style={{ height: "400px", width: "100%" }} />
      )}
    </div>
  );
}

export default KioskMap;