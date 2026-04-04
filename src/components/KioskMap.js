import React, { useEffect, useRef } from "react";

function KioskMap({ kiosks }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.4595, lng: 77.0266 }, // Gurgaon default
      zoom: 12,
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
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });

        map.setCenter(userLoc);
      });
    }

    // 🖨️ Kiosk markers
    kiosks.forEach((kiosk) => {
      const marker = new window.google.maps.Marker({
        position: { lat: kiosk.lat, lng: kiosk.lng },
        map,
        title: kiosk.name,
      });

      // 📌 Info popup
      const info = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h3>${kiosk.name}</h3>
            <p>${kiosk.address}</p>
            <p>Status: ${kiosk.status}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        info.open(map, marker);
      });
    });
  }, [kiosks]);

  return <div ref={mapRef} style={{ height: "400px", width: "100%" }} />;
}

export default KioskMap;