import React, { useEffect, useState } from 'react';
import api from '../services/axios';

export default function ItineraryList() {
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/itineraries')
            .then(response => {
                setItineraries(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des itinéraires :", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Chargement des itinéraires...</p>;

    return (
        <div>
            <h2>Mes Itinéraires</h2>
            <ul>
                {itineraries.map(itinerary => (
                    <li key={itinerary.id}>
                        <h3>{itinerary.titre}</h3>
                        <p>Destination : {itinerary.destination}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}