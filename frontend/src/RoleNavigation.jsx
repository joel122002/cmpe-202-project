export default function RoleNavigation({ user }) {
  return <nav aria-label="Primary"><a href="/search">Search</a>{user?.role === 'HOST' && <a href="/host/listings">Your listings</a>}{user?.role === 'ADMIN' && <a href="/admin/listings">Admin</a>}<a href="/bookings">Bookings</a></nav>
}
