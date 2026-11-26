import { useEffect, useState } from 'react'
import { api } from './api'
import { Message } from './Ui'

const formatter = new Intl.NumberFormat('en-US')
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })
const chartColors = ['#1f6b52', '#386e94', '#b55d2e', '#786096', '#398482', '#897128']

function AdminBookingCharts({ rows }) {
  const [sort, setSort] = useState('bookings')
  const [selectedZip, setSelectedZip] = useState(null)
  const sorted = [...rows].sort(sort === 'zip'
    ? (a, b) => a.zipCode.localeCompare(b.zipCode)
    : (a, b) => b.bookingCount - a.bookingCount || a.zipCode.localeCompare(b.zipCode))
  const total = rows.reduce((sum, row) => sum + row.bookingCount, 0)
  const maximum = Math.max(1, ...rows.map(row => row.bookingCount))
  const selected = rows.find(row => row.zipCode === selectedZip)
  const colorFor = zip => chartColors[rows.findIndex(row => row.zipCode === zip) % chartColors.length]
  function select(zip) { setSelectedZip(current => current === zip ? null : zip) }
  let offset = 0

  return <>
    <div className="analytics-chart-grid">
      <section className="workspace-panel" aria-labelledby="zip-title">
        <div className="workspace-panel-header">
          <div><h2 id="zip-title">Bookings by ZIP code</h2><p className="chart-hint">Select a ZIP to inspect its booking share.</p></div>
          <label>Sort by<select value={sort} onChange={event => setSort(event.target.value)}>
            <option value="bookings">Most bookings</option><option value="zip">ZIP code</option>
          </select></label>
        </div>
        {rows.length ? <ul className="interactive-bars">
          {sorted.map(row => <li key={row.zipCode}>
            <button className="chart-bar-button" aria-pressed={selectedZip === row.zipCode} onClick={() => select(row.zipCode)} aria-label={`ZIP ${row.zipCode}: ${row.bookingCount} bookings`}>
              <span>{row.zipCode}</span>
              <span className="zip-track" aria-hidden="true"><span style={{ width: `${row.bookingCount / maximum * 100}%`, background: colorFor(row.zipCode) }} /></span>
              <strong>{formatter.format(row.bookingCount)}</strong>
            </button>
          </li>)}
        </ul> : <p className="workspace-empty">No confirmed bookings in this period.</p>}
      </section>
      <section className="workspace-panel" aria-labelledby="share-title">
        <div className="workspace-panel-header"><div><h2 id="share-title">Booking share</h2><p className="chart-hint">Confirmed bookings across ZIP codes.</p></div></div>
        {total > 0 ? <div className="share-chart">
          <svg className="booking-donut" viewBox="0 0 120 120" aria-label="Booking share by ZIP code">
            {rows.map(row => {
              const share = row.bookingCount / total * 100
              const start = offset
              offset += share
              return <circle key={row.zipCode} className="donut-segment" cx="60" cy="60" r="44" fill="none" stroke={colorFor(row.zipCode)} strokeWidth="14" pathLength="100" strokeDasharray={`${share} ${100 - share}`} strokeDashoffset={-start} transform="rotate(-90 60 60)"
                opacity={selected && selected.zipCode !== row.zipCode ? .3 : 1}
                role="button" tabIndex="0" aria-pressed={selectedZip === row.zipCode}
                aria-label={`ZIP ${row.zipCode}: ${percent.format(row.bookingCount / total)} of bookings`}
                onClick={() => select(row.zipCode)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(row.zipCode) } }}>
                <title>{row.zipCode}: {formatter.format(row.bookingCount)} bookings ({percent.format(row.bookingCount / total)})</title>
              </circle>
            })}
            <text x="60" y="58" textAnchor="middle" className="donut-total">{formatter.format(selected?.bookingCount ?? total)}</text>
            <text x="60" y="72" textAnchor="middle" className="donut-caption">{selected ? selected.zipCode : 'bookings'}</text>
          </svg>
          <ul className="chart-legend">
            {sorted.map(row => <li key={row.zipCode}><button aria-pressed={selectedZip === row.zipCode} onClick={() => select(row.zipCode)}>
              <span className="chart-swatch" style={{ background: colorFor(row.zipCode) }} aria-hidden="true" />
              <span>{row.zipCode}</span><strong>{percent.format(row.bookingCount / total)}</strong>
            </button></li>)}
          </ul>
        </div> : <p className="workspace-empty">Booking shares will appear when this period has confirmed bookings.</p>}
      </section>
    </div>
    <section className="workspace-panel chart-selection" aria-label="Selected ZIP details" aria-live="polite">
      {selected ? <>
        <div><h2>ZIP {selected.zipCode}</h2><p><strong>{formatter.format(selected.bookingCount)}</strong> confirmed {selected.bookingCount === 1 ? 'booking' : 'bookings'} · <strong>{percent.format(selected.bookingCount / total)}</strong> of this period’s bookings</p></div>
        <button onClick={() => setSelectedZip(null)}>Clear selection</button>
      </> : <p>Select a bar, donut segment, or legend item to inspect a ZIP code.</p>}
    </section>
  </>
}

export default function Analytics({ admin = false }) {
  const [days, setDays] = useState(30)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const scope = admin ? '/admin' : '/hosts/me'
    api(`${scope}/analytics?periodDays=${days}`, { signal: controller.signal })
      .then(setSummary)
      .catch(err => {
        if (!controller.signal.aborted) setError(err.message)
      })
    return () => controller.abort()
  }, [admin, days])

  const rows = [...(summary?.bookingsByZipCode ?? [])].sort((a, b) =>
    b.bookingCount - a.bookingCount || a.zipCode.localeCompare(b.zipCode),
  )
  const maxBookings = rows[0]?.bookingCount ?? 1

  function changePeriod(period) {
    setError('')
    setSummary(null)
    setDays(period)
  }

  return (
    <>
      <header className="page-heading workspace-heading analytics-heading">
        <div>
          <h1>{admin ? 'Admin analytics' : 'Host analytics'}</h1>
          <p>{admin ? 'Booking activity across all listings.' : 'Booking activity for your listings.'}</p>
        </div>
        <fieldset className="period-control">
          <legend>Reporting period</legend>
          <div>
            {[30, 60, 90].map(period => (
              <label key={period}>
                <input
                  type="radio"
                  name="reporting-period"
                  checked={days === period}
                  onChange={() => changePeriod(period)}
                />
                <span>{period} days</span>
              </label>
            ))}
          </div>
        </fieldset>
      </header>
      <Message error={error} />
      {!summary && !error && <p className="workspace-empty" role="status">Loading analytics…</p>}
      {summary && (
        <>
          <dl className="analytics-metrics">
            <div>
              <dt>Total listings</dt>
              <dd>{formatter.format(summary.totalListings)}</dd>
              <span>{admin ? 'All hosts' : 'Your properties'}</span>
            </div>
            <div>
              <dt>Confirmed bookings</dt>
              <dd>{formatter.format(summary.totalBookings)}</dd>
              <span>Last {summary.periodDays} days</span>
            </div>
          </dl>
          {admin ? <AdminBookingCharts key={days} rows={rows} /> : <section className="workspace-panel" aria-labelledby="zip-title">
            <div className="workspace-panel-header">
              <h2 id="zip-title">Bookings by ZIP code</h2>
            </div>
            {rows.length ? (
              <ul className="zip-chart">
                {rows.map(row => (
                  <li key={row.zipCode}>
                    <span>{row.zipCode}</span>
                    <div className="zip-track" aria-hidden="true">
                      <div style={{ width: `${row.bookingCount / maxBookings * 100}%` }} />
                    </div>
                    <span>{formatter.format(row.bookingCount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="workspace-empty">No confirmed bookings in this period.</p>
            )}
          </section>}
        </>
      )}
    </>
  )
}
