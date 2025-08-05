import { useEffect, useRef } from 'react';
import pin from "../assets/Pin_map.svg";

export default function MapComponent() {
    const mapRef = useRef(null);
    let activePolygon = null;

    useEffect(() => {
        if (!window.google) return;

        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 26.195, lng: -80.295 },
            zoom: 11,
            mapId: "1461e910aa27f5794872304b",
        });

        // const school = {
        //     name: 'Bayview Elementary School',
        //     position: { lat: 26.1415467067876, lng: -80.11734360381274 },
        //     boundary: [
        //         { lat: 26.189650185333093, lng: -80.09446863817914 },
        //         { lat: 26.19008427346961, lng: -80.09795856204273 },
        //         { lat: 26.190053267228052, lng: -80.10279608026913 },
        //         { lat: 26.167599961683734, lng: -80.10411629627197 },
        //         { lat: 26.16732341603131, lng: -80.11702956781028 },
        //         { lat: 26.165890396240272, lng: -80.1161332018898 },
        //         { lat: 26.164565528867755, lng: -80.11577159002451 },
        //         { lat: 26.162881060445088, lng: -80.1158556243294 },
        //         { lat: 26.16137256061144, lng: -80.11633181872496 },
        //         { lat: 26.157324656313875, lng: -80.11748028756013 },
        //         { lat: 26.157073229053523, lng: -80.11605170437448 },
        //         { lat: 26.15812921990593, lng: -80.11655591020481 },
        //         { lat: 26.158757781350857, lng: -80.11588363576469 },
        //         { lat: 26.15795322209388, lng: -80.11451107544914 },
        //         { lat: 26.156796658441493, lng: -80.1140909039242 },
        //         { lat: 26.156243515249557, lng: -80.11521136132457 },
        //         { lat: 26.155338366188545, lng: -80.11518334988926 },
        //         { lat: 26.155237793636985, lng: -80.11400686961932 },
        //         { lat: 26.154131489849647, lng: -80.11400686961932 },
        //         { lat: 26.150737086936488, lng: -80.11549147421697 },
        //         { lat: 26.14875068466594, lng: -80.11605170291692 },
        //         { lat: 26.146688813635308, lng: -80.11616374865709 },
        //         { lat: 26.14412399639737, lng: -80.11708812601239 },
        //         { lat: 26.14181058348953, lng: -80.11826460628235 },
        //         { lat: 26.137812590978385, lng: -80.11818040062317 },
        //         { lat: 26.135926558038847, lng: -80.11871261788781 },
        //         { lat: 26.133185469193194, lng: -80.11823642349277 },
        //         { lat: 26.132330437488406, lng: -80.11619158873759 },
        //         { lat: 26.131852622927227, lng: -80.11378260532707 },
        //         { lat: 26.12979045345068, lng: -80.1126621479267 },
        //         { lat: 26.128306674841184, lng: -80.11204589635669 },
        //         { lat: 26.128507866266006, lng: -80.1102531645162 },
        //         { lat: 26.130268276448305, lng: -80.10972094725105 },
        //         { lat: 26.132330437488406, lng: -80.10977697012115 },
        //         { lat: 26.135046398908813, lng: -80.10876855846095 },
        //         { lat: 26.138038912884028, lng: -80.10826435263061 },
        //         { lat: 26.138139492797805, lng: -80.10246599873537 },
        //         { lat: 26.189650185333093, lng: -80.09446863817914 }
        //     ],
        // };

        // Fetch schools from your API
        // fetch('https://api.oudsdev.com/broward_schools/json/full_map_tiny.json')
        //     .then(res => res.json())
        //     .then(data => {
        //         data.forEach(school => {

        //             let activePolygon = null;

        //             const marker = new window.google.maps.Marker({
        //                 position: { lat: school.lat, lng: school.lon },
        //                 map,
        //                 title: school.name,
        //             });

        //             marker.addListener('click', () => {
        //                 map.panTo({ lat: school.lat, lng: school.lon });
        //                 map.setZoom(15);
        //                 alert(`School: ${school.name}`);
        //                 // TODO: Load boundary and show sidebar
        //             });
        //         });
        //     })
        //     .catch(err => console.error('Error fetching schools:', err));

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

    // // Add marker
    // const marker = new window.google.maps.Marker({
    //     position: school.position,
    //     map,
    //     title: school.name,
    // });

    // // Add polygon (boundary)
    // const polygon = new window.google.maps.Polygon({
    //     paths: school.boundary,
    //     strokeColor: '#FF0000',
    //     strokeOpacity: 0.8,
    //     strokeWeight: 2,
    //     fillColor: '#FF0000',
    //     fillOpacity: 0.1,
    //     map,
    // });

    // // Click listener for marker
    // marker.addListener('click', () => {
    //     map.panTo(school.position);
    //     polygon.setMap(map);
    //     alert(`School: ${school.name}`);
    // });
    // }, []);

    // return (
    //     <div style={{ height: '100vh', width: '100%' }} ref={mapRef} />
    // );
}
