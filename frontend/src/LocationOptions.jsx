import { useEffect, useState } from 'react'
import { api } from './api'

export default function LocationOptions({ onSelect }) {
  const [locations, setLocations] = useState([])

  useEffect(() => {
    api('/search/locations').then(setLocations).catch(() => setLocations([]))
  }, [])

  return <select defaultValue="" onChange={(event) => onSelect(locations.find((location) => location.city === event.target.value))}>
    <option value="">Choose a city</option>
    {locations.map((location) => <option key={`${location.city}-${location.state}`} value={location.city}>{location.city}, {location.state}</option>)}
  </select>
}
