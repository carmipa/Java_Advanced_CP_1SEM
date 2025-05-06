'use client'; // Importante para componentes que usam hooks do React e interagem com o browser

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correção do ícone do Leaflet
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Tipagem das propriedades do componente
interface LeafletMapProps {
    position: [number, number]; // Latitude, Longitude
    zoom?: number;
    markerText?: string;
    style?: React.CSSProperties;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
                                                   position,
                                                   zoom = 16,
                                                   markerText = "Nossa Localização",
                                                   style = { height: '100%', width: '100%' }
                                               }) => {
    const [isClient, setIsClient] = useState(false);

    // Garante que o componente só é montado no ambiente do navegador
    useEffect(() => {
        setIsClient(typeof window !== 'undefined');
    }, []);

    // Se não estivermos no ambiente do navegador, retorna null
    if (!isClient) return null;

    return (
        <MapContainer center={position} zoom={zoom} style={style}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={defaultIcon}>
                {markerText && <Popup>{markerText}</Popup>}
            </Marker>
        </MapContainer>
    );
};

export default LeafletMap;