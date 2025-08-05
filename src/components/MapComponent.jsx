import { useEffect, useRef } from 'react';

export default function MapComponent() {
    const mapRef = useRef(null);
    let activePolygon = null;

    useEffect(() => {

        console.log("Google:", window.google);
        console.log("Map ref:", mapRef.current);

        if (!window.google) return;

        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 26.195, lng: -80.295 },
            zoom: 11,
            mapId: "1461e910aa27f5794872304b",
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

                        // 1. Update URL (without reloading page)
                        const url = new URL(window.location);
                        url.searchParams.set('school', codeName);
                        window.history.pushState({}, '', url);

                        // 2. Fetch full school data using codeName
                        fetch(`https://api.oudsdev.com/api/schoolInfo.js?name=${codeName}`)
                            .then(res => res.json())
                            .then((schoolData) => {
                                const { boundaries, info } = schoolData;

                                // 3. Zoom to school center
                                map.panTo({ lat, lng });
                                map.setZoom(15);

                                // 4. Remove old polygon
                                if (activePolygon) {
                                    activePolygon.setMap(null);
                                    activePolygon = null;
                                }

                                // 5. Draw boundary
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

                                // (Optional) Log or show school info
                                console.log(info);
                            });
                    });
                });
            });
    }, []);

    return (
        <div style={{ height: '100vh', width: '100%' }} ref={mapRef} />
    );
}
