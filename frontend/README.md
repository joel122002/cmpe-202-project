# React frontend

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

The UI starts at `http://localhost:5173` and calls `http://localhost:8000/api/v1` by default. Set `VITE_API_URL` to use another API URL.

React Router owns the documented customer, host, and admin routes. Business rules remain in the backend.

The customer **My bookings** page uses `listingName` and `listingPhotoUrl` from each booking response to show the booked property and its first photo.

Customer search uses controlled searchable selects for city, state, and ZIP. Options come from approved listing addresses; state filters by city and ZIP filters by city/state, so invalid values cannot be submitted.

Check-in, check-out, and guest count are saved in tab-scoped `sessionStorage` and reused on the search and listing booking pages.
