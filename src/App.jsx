import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { Camera, MapPin, Users, Trash2, CheckCircle, Clock, AlertCircle, Crosshair, LogOut, Edit, Eye } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './index.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const API_URL = import.meta.env.PROD
  ? 'https://taza-shaar-api.onrender.com'
  : 'http://localhost:3001'

// Auth context
const AuthContext = createContext(null)

const useAuth = () => useContext(AuthContext)

const USERS = {
  manager: { password: 'manager123', role: 'manager' },
  admin: { password: 'admin123', role: 'admin' }
}

const api = {
  async getStats() {
    const res = await fetch(`${API_URL}/api/stats`)
    return res.json()
  },
  async createRequest(data) {
    const res = await fetch(`${API_URL}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },
  async getProcessed() {
    const res = await fetch(`${API_URL}/api/processed`)
    return res.json()
  },
  async markProcessed(address) {
    const res = await fetch(`${API_URL}/api/processed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    })
    return res.json()
  },
  async deleteRequest(id) {
    const res = await fetch(`${API_URL}/api/requests/${id}`, {
      method: 'DELETE'
    })
    return res.json()
  },
  async updateRequest(id, data) {
    const res = await fetch(`${API_URL}/api/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  }
}

function Header() {
  const location = useLocation()
  const auth = useAuth()

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <img className="logo-main" src="/logo-main.png" alt="MATKASYM" />
        </Link>
        <nav className="nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Главная
          </Link>
          {auth?.role && (
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              {auth.role === 'admin' ? 'Админ' : 'Панель'}
            </Link>
          )}
          {!auth?.role && (
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
              Вход
            </Link>
          )}
          <Link to="/submit" className="nav-link accent">
            Подать заявку
          </Link>
          {auth?.role && (
            <button onClick={auth.logout} className="nav-link" style={{border: 'none', background: 'none', cursor: 'pointer'}}>
              <LogOut size={18} />
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <img src="/logo-main.png" alt="MATKASYM" style={{height: 24, marginBottom: 12, filter: 'brightness(0) invert(1)'}} />
        <p>Вместе сделаем город чище</p>
      </div>
    </footer>
  )
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Чистый город — наша забота</h1>
          <p>
            Видите грязное место в городе? Сообщите нам, и мы установим там урну!
          </p>
          <Link to="/submit" className="btn btn-primary" style={{fontSize: '18px', padding: '18px 36px'}}>
            <Camera size={24} />
            Подать заявку
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Как это работает?</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px'}}>
            <div className="card" style={{textAlign: 'center'}}>
              <div style={{width: '64px', height: '64px', background: 'rgba(233, 69, 96, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent)'}}>
                <Camera size={32} />
              </div>
              <h3 style={{marginBottom: '12px', color: 'var(--text)'}}>1. Сфотографируйте</h3>
              <p style={{color: 'var(--text-muted)'}}>Найдите грязное место и сделайте фото</p>
            </div>
            <div className="card" style={{textAlign: 'center'}}>
              <div style={{width: '64px', height: '64px', background: 'rgba(233, 69, 96, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent)'}}>
                <MapPin size={32} />
              </div>
              <h3 style={{marginBottom: '12px', color: 'var(--text)'}}>2. Укажите адрес</h3>
              <p style={{color: 'var(--text-muted)'}}>Отметьте место на карте</p>
            </div>
            <div className="card" style={{textAlign: 'center'}}>
              <div style={{width: '64px', height: '64px', background: 'rgba(233, 69, 96, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent)'}}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{marginBottom: '12px', color: 'var(--text)'}}>3. Готово!</h3>
              <p style={{color: 'var(--text-muted)'}}>Мы рассмотрим заявку и примем меры</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const auth = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    const user = USERS[username]
    if (user && user.password === password) {
      auth.login(username, user.role)
    } else {
      setError('Неверный логин или пароль')
    }
  }

  if (auth?.role) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="page">
      <div className="container" style={{maxWidth: '400px'}}>
        <h1 className="page-title">Вход</h1>
        <form onSubmit={handleSubmit} className="card">
          {error && <div style={{color: 'var(--accent)', marginBottom: '16px'}}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Логин</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}

function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      reverseGeocode(e.latlng.lat, e.latlng.lng, setAddress)
    },
  })

  return position ? <Marker position={position} /> : null
}

function MapCenterButton({ setPosition, setAddress, setLoading }) {
  const map = useMap()

  const handleClick = () => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const latlng = { lat: latitude, lng: longitude }
        map.flyTo(latlng, 17)
        setPosition(latlng)
        reverseGeocode(latitude, longitude, setAddress)
        setLoading(false)
      },
      (err) => {
        alert('Не удалось определить местоположение')
        setLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="map-locate-btn"
      title="Определить моё местоположение"
    >
      <Crosshair size={20} />
    </button>
  )
}

async function reverseGeocode(lat, lng, setAddress) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
      { headers: { 'Accept-Language': 'ru' } }
    )
    const data = await res.json()
    if (data.display_name) {
      const addr = data.address
      const parts = []

      // Улица + номер дома
      if (addr.road) {
        let street = addr.road
        if (addr.house_number) {
          street += ', ' + addr.house_number
        }
        parts.push(street)
      }

      // Район/микрорайон
      if (addr.suburb || addr.neighbourhood) {
        parts.push(addr.suburb || addr.neighbourhood)
      }

      // Город
      if (addr.city || addr.town || addr.village) {
        parts.push(addr.city || addr.town || addr.village)
      }

      // Если ничего не нашли — берём первые 2 части display_name
      if (!parts.length) {
        parts.push(data.display_name.split(',').slice(0, 2).join(','))
      }

      setAddress(parts.join(', '))
    }
  } catch (e) {
    console.error('Geocode error:', e)
  }
}

function SubmitPage() {
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [position, setPosition] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const defaultCenter = [43.238949, 76.945465]

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setPosition({ lat: latitude, lng: longitude })
          reverseGeocode(latitude, longitude, setAddress)
        },
        () => {}
      )
    }
  }, [])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!address.trim()) return

    try {
      await api.createRequest({
        address: address.trim(),
        comment,
        photo: photoPreview,
        lat: position?.lat,
        lng: position?.lng
      })

      setSubmitted(true)
      setPhoto(null)
      setPhotoPreview(null)
      setAddress('')
      setComment('')
      setPosition(null)
    } catch (err) {
      alert('Ошибка при отправке заявки')
      console.error(err)
    }
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="container" style={{maxWidth: '500px', textAlign: 'center', paddingTop: '60px'}}>
          <div className="success-animation">
            <div className="success-checkmark">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2 className="success-title">Заявка принята!</h2>
            <p className="success-text">
              Благодаря вам наш город станет чище. Каждая заявка приближает нас к комфортной городской среде.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setSubmitted(false)}
              style={{marginTop: '24px'}}
            >
              Подать ещё одну заявку
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{maxWidth: '600px'}}>
        <h1 className="page-title">Подать заявку</h1>
        <p className="page-subtitle">
          Сообщите о грязном месте, где нужна урна
        </p>

        {false && (
          <div className="success-message">
            <CheckCircle size={24} style={{marginBottom: '8px'}} />
            <div style={{fontWeight: '600'}}>Заявка отправлена!</div>
            <div style={{fontSize: '14px', marginTop: '4px'}}>
              Спасибо за вашу помощь в создании чистого города
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Фото места</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              style={{display: 'none'}}
              id="photo-input"
            />
            <label htmlFor="photo-input" className="photo-upload">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="photo-preview" />
              ) : (
                <>
                  <Camera className="photo-upload-icon" size={64} />
                  <div style={{fontWeight: '600', marginBottom: '4px'}}>
                    Нажмите, чтобы сделать фото
                  </div>
                  <div style={{color: 'var(--text-muted)', fontSize: '14px'}}>
                    или выберите из галереи
                  </div>
                </>
              )}
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MapPin size={18} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}} />
              Местоположение *
            </label>
            <div className="map-wrapper">
              <MapContainer
                center={position || defaultCenter}
                zoom={position ? 17 : 12}
                className="location-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
                <MapCenterButton setPosition={setPosition} setAddress={setAddress} setLoading={setGeoLoading} />
              </MapContainer>
              {geoLoading && <div className="map-loading">Определение...</div>}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Адрес определится автоматически или нажмите на карту"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              style={{marginTop: '12px'}}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Комментарий</label>
            <textarea
              className="form-textarea"
              placeholder="Опишите проблему (необязательно)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            Отправить заявку
          </button>
        </form>
      </div>
    </div>
  )
}

function Dashboard() {
  const auth = useAuth()
  const [locations, setLocations] = useState([])
  const [tab, setTab] = useState('pending')
  const [processed, setProcessed] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [stats, setStats] = useState({ totalRequests: 0 })
  const defaultCenter = [42.87, 74.59]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    Promise.all([api.getStats(), api.getProcessed()])
      .then(([statsData, proc]) => {
        setLocations(statsData.locations || [])
        setProcessed(proc.map(a => a.toLowerCase().trim()))
        setStats(statsData)
      })
      .catch(console.error)
  }

  if (!auth?.role) {
    return <Navigate to="/login" />
  }

  const markAsProcessed = async (address) => {
    try {
      await api.markProcessed(address)
      setProcessed([...processed, address.toLowerCase().trim()])
    } catch (err) {
      console.error(err)
    }
  }

  const isProcessed = (address) => processed.includes(address.toLowerCase().trim())

  const readyLocations = locations.filter(l => l.count >= 10 && !isProcessed(l.address))
  const pendingLocations = locations.filter(l => l.count < 10)
  const doneLocations = locations.filter(l => isProcessed(l.address))

  const displayLocations = tab === 'ready' ? readyLocations : tab === 'pending' ? pendingLocations : doneLocations

  const locationsWithCoords = locations.filter(l => l.lat && l.lng)

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            {auth.role === 'admin' ? 'Панель администратора' : 'Панель менеджера'}
          </h1>
          <div className="dashboard-stats">
            <div className="mini-stat">
              <span className="mini-stat-value">{stats.totalRequests}</span>
              <span className="mini-stat-label">заявок</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-value">{locations.length}</span>
              <span className="mini-stat-label">локаций</span>
            </div>
          </div>
        </div>

        {/* Карта всех локаций */}
        <div className="dashboard-map-section">
          <h2 style={{marginBottom: '16px', fontSize: '18px', fontWeight: '600'}}>Карта заявок</h2>
          <div className="dashboard-map-wrapper">
            <MapContainer
              center={defaultCenter}
              zoom={12}
              className="dashboard-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locationsWithCoords.map((loc, idx) => (
                <Marker
                  key={idx}
                  position={[loc.lat, loc.lng]}
                  eventHandlers={{
                    click: () => setSelectedLocation(loc)
                  }}
                >
                  <Popup>
                    <div style={{minWidth: '200px'}}>
                      <strong>{loc.address}</strong>
                      <div style={{marginTop: '8px', color: '#666'}}>
                        {loc.count} {loc.count === 1 ? 'заявка' : loc.count < 5 ? 'заявки' : 'заявок'}
                      </div>
                      <div style={{marginTop: '4px'}}>
                        <span className={`badge ${loc.count >= 10 ? (isProcessed(loc.address) ? 'badge-done' : 'badge-ready') : 'badge-pending'}`}>
                          {isProcessed(loc.address) ? 'Установлено' : loc.count >= 10 ? 'Готово' : 'Сбор заявок'}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Табы */}
        <div className="dashboard-tabs" style={{marginTop: '32px'}}>
          <button
            className={`tab ${tab === 'pending' ? 'active' : ''}`}
            onClick={() => setTab('pending')}
          >
            Новые ({pendingLocations.length})
          </button>
          <button
            className={`tab ${tab === 'ready' ? 'active' : ''}`}
            onClick={() => setTab('ready')}
          >
            К установке ({readyLocations.length})
          </button>
          <button
            className={`tab ${tab === 'done' ? 'active' : ''}`}
            onClick={() => setTab('done')}
          >
            Выполнено ({doneLocations.length})
          </button>
        </div>

        {displayLocations.length === 0 && (
          <div className="card" style={{textAlign: 'center', padding: '60px', marginTop: '20px'}}>
            <Clock size={48} style={{color: 'var(--text-muted)', marginBottom: '16px'}} />
            <h3>Нет заявок в этой категории</h3>
          </div>
        )}

        <div style={{marginTop: '20px'}}>
          {displayLocations.map((loc, idx) => (
            <div key={idx} className="manager-card">
              {loc.photos[0] ? (
                <img src={loc.photos[0]} alt="" className="manager-card-image" />
              ) : (
                <div className="manager-card-image" style={{background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <MapPin size={48} color="white" />
                </div>
              )}
              <div className="manager-card-content">
                <div className="manager-card-header">
                  <div className="manager-card-address">{loc.address}</div>
                  <span className={`badge ${loc.count >= 10 ? (isProcessed(loc.address) ? 'badge-done' : 'badge-ready') : 'badge-pending'}`}>
                    {isProcessed(loc.address) ? 'Установлено' : loc.count >= 10 ? 'Готово' : 'Сбор заявок'}
                  </span>
                </div>
                <div className="manager-card-meta">
                  <span><Users size={16} style={{verticalAlign: 'middle', marginRight: '4px'}} /> {loc.count} заявок</span>
                  <span><Clock size={16} style={{verticalAlign: 'middle', marginRight: '4px'}} /> {loc.lastDate ? new Date(loc.lastDate).toLocaleDateString('ru-RU') : '—'}</span>
                  <span>{loc.photos.length} фото</span>
                </div>
                <div className="manager-card-actions">
                  {loc.lat && loc.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={16} />
                      На карте
                    </a>
                  )}
                  {!isProcessed(loc.address) && loc.count >= 10 && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => markAsProcessed(loc.address)}
                    >
                      <CheckCircle size={16} />
                      Выполнено
                    </button>
                  )}
                  {auth.role === 'admin' && (
                    <button className="btn btn-sm" style={{background: '#dc3545', color: 'white'}}>
                      <Trash2 size={16} />
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('taza_shaar_auth')
    return saved ? JSON.parse(saved) : null
  })

  const login = (username, role) => {
    const authData = { username, role }
    setAuth(authData)
    localStorage.setItem('taza_shaar_auth', JSON.stringify(authData))
  }

  const logout = () => {
    setAuth(null)
    localStorage.removeItem('taza_shaar_auth')
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
