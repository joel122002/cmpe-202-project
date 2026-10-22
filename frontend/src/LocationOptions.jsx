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

export function cityOptions(locations) {
  return locations.map((location) => ({ value: location.city, label: `${location.city}, ${location.state}` }))
}

export function stateOptions(locations, city) {
  return locations.filter((location) => !city || location.city === city).map((location) => ({ value: location.state, label: location.state }))
}
