import { useEffect, useRef } from 'react';

export default function MapComponent() {
  const mapRef = useRef(null);
  let activePolygon = null;

  useEffect(() => {
    // Wait for script to finish loading
    const interval = setInterval(() => {
      if (window.google && mapRef.current) {
        clearInterval(interval);

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 26.195, lng: -80.295 },
          zoom: 11,
          mapId: '1461e910aa27f5794872304b',
        });

        fetch('https://api.oudsdev.com/broward_schools/json/full_map_tiny.json')
          .then(res => res.json())
          .then(data => {
            data.forEach((school) => {
              const lat = parseFloat(school.lat);
              const lng = parseFloat(school.lon);
              if (isNaN(lat) || isNaN(lng)) return;

              const marker = new google.maps.marker.AdvancedMarkerElement({
                position: { lat, lng },
                map,
                title: school.name,
              });

              marker.addListener('click', () => {
                const codeName = school.codeName;
                const url = new URL(window.location);
                url.searchParams.set('school', codeName);
                window.history.pushState({}, '', url);

                fetch(`https://api.oudsdev.com/api/schoolInfo.js?name=${codeName}`)
                  .then(res => res.json())
                  .then(({ boundaries, info }) => {
                    map.panTo({ lat, lng });
                    map.setZoom(15);

                    if (activePolygon) {
                      activePolygon.setMap(null);
                      activePolygon = null;
                    }

                    if (boundaries && boundaries.length > 0) {
                      activePolygon = new google.maps.Polygon({
                        paths: boundaries,
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.1,
                        map,
                      });
                    }

                    console.log(info);
                  });
              });
            });
          });
      }
    }, 200); // Check every 200ms

    // Optional cleanup
    return () => clearInterval(interval);
  }, []);

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
}
