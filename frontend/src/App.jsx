import { useEffect, useRef, useState } from 'react'
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  loginUser,
  logoutUser,
  registerUser,
  setStoredToken,
} from './api/auth'
import CartPage from './CartPage'
import ProfilePage from './ProfilePage'
import './App.css'

const productsDB = {
  novelties: [
    {
      name: 'Темпура чеддер с форелью',
      desc: 'Нежная форель, сыр чеддер и хрустящая темпура.',
      price: '499 ₽',
      image:
        'https://static.tildacdn.com/stor6363-3235-4933-b364-636364336463/38482170.jpg',
      badge: 'NEW',
    },
    {
      name: 'Юдзу с дымком',
      desc: 'Копченый угорь, юдзу-соус и авокадо.',
      price: '559 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=f742f5d1cf6f5e8084f5111f4dee8c00_l-5236662-images-thumbs&n=13',
      badge: 'NEW',
    },
    {
      name: 'Тропический с креветкой',
      desc: 'Креветка, манго, ананас и сливочный соус.',
      price: '589 ₽',
      image: 'https://mandarin-kokuy.qr-cafe.ru/imagebase/83d0b9c122b0ca4c4f24ebe74d314e1d.jpeg',
      badge: 'NEW',
    },
    {
      name: 'Пицца Том Ям с курицей',
      desc: 'Острая основа том-ям, курица и моцарелла.',
      price: '690 ₽',
      image:
        'https://sushi-samurai-sev.ru/upload/resize_cache/iblock/108/1000_1000_0/s9cu6ubb9t2pbac83lf1vecsp24vyyqo.jpg',
      badge: 'ХИТ',
    },
  ],
  rolls: [
    {
      name: 'Филадельфия классик',
      desc: 'Лосось, сливочный сыр и свежий огурец.',
      price: '529 ₽',
      image: 'https://starsrus.ru/upload/iblock/872/1x22y1w1k9gtv04wne0algwzpr5b8ovs.jpg',
    },
    {
      name: 'Калифорния с крабом',
      desc: 'Краб, авокадо и икра тобико.',
      price: '489 ₽',
      image: 'https://cdn.smt.bz/uploads/media/photo/584358/17.jpg',
    },
    {
      name: 'Запеченный с угрем',
      desc: 'Угорь, сыр и соус унаги.',
      price: '599 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=d9ce575fa51667ddd1e8673c2ce4e4d1_l-5666966-images-thumbs&n=13',
    },
  ],
  combo: [
    {
      name: 'Рок-сет #1',
      desc: 'Филадельфия, Калифорния и напиток.',
      price: '1190 ₽',
      image:
        'https://img.freepik.com/premium-photo/big-sushi-set-isolated-white-background_159315-644.jpg?semt=ais_hybrid&w=740',
      badge: 'СЕТ',
    },
    {
      name: "Сет 'Рокнролль'",
      desc: 'Три ролла и пицца Маргарита для компании.',
      price: '1490 ₽',
      image:
        'https://main-cdn.sbermegamarket.ru/big2/hlr-system/-18/018/611/227/131/838/100032549084b0.jpg',
      badge: 'BEST',
    },
  ],
  pizza: [
    {
      name: 'Пепперони',
      desc: 'Пикантная пепперони и тянущаяся моцарелла.',
      price: '590 ₽',
      image: 'https://static.tildacdn.com/stor3563-3664-4438-b562-346335396639/34964175.jpg',
    },
    {
      name: 'Маргарита',
      desc: 'Моцарелла, томатный соус и базилик.',
      price: '490 ₽',
      image:
        'https://main-cdn.sbermegamarket.ru/big2/hlr-system/-99/921/428/110/915/37/100040809142b0.jpg',
    },
    {
      name: 'Четыре сыра',
      desc: 'Дорблю, пармезан, моцарелла и сливочная база.',
      price: '620 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=7a7709992b9542a79fd2f1848fc0f8d8_l-4599171-images-thumbs&n=13',
    },
  ],
  hot: [
    {
      name: 'Лапша WOK с курицей',
      desc: 'Рисовая лапша, курица и соус терияки.',
      price: '389 ₽',
      image:
        'https://sushiart-vrn.ru/upload/resize_cache/iblock/3eb/600_600_1/3eb13638cbf2b47b8c8d8653a8f0d6b6.jpg',
    },
    {
      name: 'Рис с морепродуктами',
      desc: 'Микс морепродуктов, рис и овощи wok.',
      price: '459 ₽',
      image: 'https://sushiart-vrn.ru/upload/iblock/043/043bbfd4262120567ea14c46c486b686.jpg',
    },
  ],
  salads: [
    {
      name: 'Поке с лососем',
      desc: 'Лосось, рис, авокадо и овощи.',
      price: '529 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=fb8ea920e026c9d2de54c4f06f4c9190_sr-4289111-images-thumbs&n=13',
    },
    {
      name: 'Цезарь с креветкой',
      desc: 'Креветки, айсберг, пармезан и соус цезарь.',
      price: '470 ₽',
      image: 'https://reg-inet.ru/upload/iblock/259/03q6pbgph5j1vnt0z05qllebashughn0.jpg',
    },
  ],
  soups: [
    {
      name: 'Том Ям с креветками',
      desc: 'Острый суп с креветками, грибами и кокосом.',
      price: '420 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=14d0d561061fb03a5c57f94126acca1c_l-10840831-images-thumbs&n=13',
    },
    {
      name: 'Мисо суп',
      desc: 'Легкий японский суп с тофу и водорослями.',
      price: '230 ₽',
      image:
        'https://png.pngtree.com/thumb_back/fh260/background/20230518/pngtree-tofu-in-a-white-soup-bowl-image_2524000.jpg',
    },
  ],
  snacks: [
    {
      name: 'Креветки в темпуре',
      desc: 'Хрустящие креветки с фирменным соусом.',
      price: '410 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=cd656c891676c50fb71673487e02bc46_l-5650958-images-thumbs&n=13',
    },
    {
      name: 'Наггетсы',
      desc: 'Куриные наггетсы с хрустящей панировкой.',
      price: '250 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=7d24e24f4fbcd8b397beac34d8aa6d310498ec58-12759831-images-thumbs&n=13',
    },
  ],
  kids: [
    {
      name: 'Мини-пицца ветчина и сыр',
      desc: 'Небольшая пицца для маленьких гостей.',
      price: '320 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=467c5fa51426af7d7f032c835ee97b1742ecd34c-12490006-images-thumbs&n=13',
    },
    {
      name: 'Детский набор',
      desc: 'Картофель, наггетсы, соус и сок.',
      price: '390 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=978ac26936349e917bb0da2130706c95ab94e0ec-4102669-images-thumbs&n=13',
    },
  ],
  sauces: [
    {
      name: 'Соус спайси',
      desc: 'Острый сливочный соус к роллам и закускам.',
      price: '60 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=4668ee661811d1030dbacd6e0d39d042_l-10350577-images-thumbs&n=13',
    },
    {
      name: 'Имбирь и васаби',
      desc: 'Классическое дополнение к сетам и роллам.',
      price: '90 ₽',
      image:
        'https://avatars.mds.yandex.net/i?id=43dbac4287e6bf477680fad76113c530_l-16242408-images-thumbs&n=13',
    },
  ],
}

const categories = [
  { key: 'novelties', label: 'Новинки', icon: 'fas fa-star' },
  { key: 'rolls', label: 'Роллы', icon: 'fas fa-fish' },
  { key: 'combo', label: 'Комбо / Сеты', icon: 'fas fa-layer-group' },
  { key: 'pizza', label: 'Пицца', icon: 'fas fa-pizza-slice' },
  { key: 'hot', label: 'Горячее', icon: 'fas fa-fire' },
  { key: 'salads', label: 'Салаты / Поке', icon: 'fas fa-leaf' },
  { key: 'soups', label: 'Супы', icon: 'fas fa-mug-hot' },
  { key: 'snacks', label: 'Закуски', icon: 'fas fa-drumstick-bite' },
  { key: 'kids', label: 'Детское меню', icon: 'fas fa-child' },
  { key: 'sauces', label: 'Соусы и добавки', icon: 'fas fa-mortar-pestle' },
]

const navLinks = [
  { key: 'about', label: 'О нас', icon: 'fas fa-info-circle' },
  { key: 'game', label: 'Игровая', icon: 'fas fa-gamepad' },
  { key: 'delivery', label: 'Доставка и оплата', icon: 'fas fa-truck-fast' },
  { key: 'contacts', label: 'Контакты', icon: 'fas fa-phone-alt' },
]

const modalTemplates = {
  about: `
        <h2><i class="fas fa-info-circle"></i> О нас</h2>
        <p>«Рокнролль» уже 17 лет готовит роллы, пиццу и горячие блюда для тех, кто любит яркий вкус и быструю доставку.</p>
        <div class="about-stats">
            <div class="stat-item">
                <div class="stat-number">17</div>
                <div>лет с вами</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div>принимаем заказы</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">1000+</div>
                <div>довольных гостей</div>
            </div>
        </div>
        <div class="about-section-block">
            <h3>Почему нас выбирают</h3>
            <p>Мы делаем ставку на понятное меню, хорошие порции, аккуратную сборку заказов и теплый сервис.</p>
        </div>
    `,
  game: `
        <h2><i class="fas fa-gamepad"></i> Игровая зона</h2>
        <p>У нас можно не только поесть, но и провести время с друзьями: настолки, приставка и мини-турниры по выходным.</p>
        <div class="game-features">
            <div class="game-feature"><i class="fas fa-dice"></i><p>Настольные игры для компании.</p></div>
            <div class="game-feature"><i class="fas fa-tv"></i><p>Консольная зона с большими экранами.</p></div>
            <div class="game-feature"><i class="fas fa-trophy"></i><p>Регулярные розыгрыши и тематические вечера.</p></div>
        </div>
        <div class="game-highlight">Следи за анонсами в приложении и участвуй в мероприятиях.</div>
    `,
  delivery: `
        <h2><i class="fas fa-truck-fast"></i> Доставка и оплата</h2>
        <p>Принимаем заказы круглосуточно. Среднее время доставки зависит от зоны, но мы стараемся привозить как можно быстрее.</p>
        <div class="delivery-cards">
            <div class="delivery-card">
                <i class="fas fa-clock"></i>
                <div class="card-title">Время</div>
                <div class="card-value">45-60 мин</div>
                <div class="card-desc">Среднее время доставки по городу.</div>
            </div>
            <div class="delivery-card">
                <i class="fas fa-wallet"></i>
                <div class="card-title">Оплата</div>
                <div class="card-value">Онлайн / карта</div>
                <div class="card-desc">Удобно оплатить на сайте или при получении.</div>
            </div>
            <div class="delivery-card">
                <i class="fas fa-bag-shopping"></i>
                <div class="card-title">Самовывоз</div>
                <div class="card-value">15-20 мин</div>
                <div class="card-desc">Соберем заказ заранее к вашему приходу.</div>
            </div>
        </div>
        <div class="delivery-phone">
            <i class="fas fa-phone-volume"></i>
            <div>
                <div class="phone-number">8 (800) 555-17-17</div>
                <div class="phone-label">Если нужен быстрый заказ по телефону</div>
            </div>
        </div>
    `,
  contacts: `
        <h2><i class="fas fa-phone-alt"></i> Контакты</h2>
        <p>Связаться с нами можно любым удобным способом. Подскажем по меню, акциям и статусу заказа.</p>
        <div class="about-section-block">
            <div class="contact-item"><i class="fas fa-phone"></i> 8 (800) 555-17-17</div>
        </div>
        <div class="about-section-block">
            <div class="contact-item"><i class="fas fa-location-dot"></i> Центральная улица, 17</div>
        </div>
        <div class="about-section-block">
            <div class="contact-item"><i class="fas fa-clock"></i> Работаем 24/7</div>
        </div>
    `,
  gifts: `
        <h2><i class="fas fa-gift"></i> Подарки к заказу</h2>
        <p>В честь 17-летия дарим бонусы и приятные комплименты к заказам из раздела новинок.</p>
        <div class="game-highlight">Оформите заказ на сумму от 1490 ₽ и получите подарок от шефа.</div>
    `,
}

const getPriceValue = (priceText) => Number(String(priceText).replace(/[^\d]/g, '')) || 0

const formatRubles = (amount) => `${amount.toLocaleString('ru-RU')} ₽`

const getPageFromPath = (pathname) => {
  if (pathname === '/cart') {
    return 'cart'
  }

  if (pathname === '/profile') {
    return 'profile'
  }

  return 'menu'
}

function App() {
  const [activePage, setActivePage] = useState(() => getPageFromPath(window.location.pathname))
  const [activeCategory, setActiveCategory] = useState('novelties')
  const [deliveryType, setDeliveryType] = useState('delivery')
  const [isAppModalOpen, setIsAppModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [dynamicModalKey, setDynamicModalKey] = useState('')
  const [toastText, setToastText] = useState('Добавлено в корзину')
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [authErrorMessage, setAuthErrorMessage] = useState('')
  const [authSuccessMessage, setAuthSuccessMessage] = useState('')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const [cartItems, setCartItems] = useState([])
  const toastTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAppModalOpen(false)
        setIsAuthModalOpen(false)
        setDynamicModalKey('')
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    const onPopState = () => {
      setActivePage(getPageFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const loadSession = async () => {
      if (!token) {
        if (isActive) {
          setUser(null)
          setIsCheckingSession(false)
        }
        return
      }

      if (isActive) {
        setIsCheckingSession(true)
      }

      try {
        const data = await getCurrentUser(token)

        if (isActive) {
          setUser(data.user)
        }
      } catch {
        clearStoredToken()

        if (isActive) {
          setToken('')
          setUser(null)
        }
      } finally {
        if (isActive) {
          setIsCheckingSession(false)
        }
      }
    }

    loadSession()

    return () => {
      isActive = false
    }
  }, [token])

  const showToast = (message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    setToastText(message)
    setIsToastVisible(true)

    toastTimerRef.current = window.setTimeout(() => {
      setIsToastVisible(false)
    }, 2200)
  }

  const navigateToPage = (page) => {
    let nextPath = '/'

    if (page === 'cart') {
      nextPath = '/cart'
    } else if (page === 'profile') {
      nextPath = '/profile'
    }

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    setActivePage(page)
  }

  const openDynamicModal = (key) => {
    if (!modalTemplates[key]) {
      return
    }

    setDynamicModalKey(key)
  }

  const openAuthModal = (mode) => {
    setAuthMode(mode)
    setAuthErrorMessage('')
    setAuthSuccessMessage('')
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setAuthErrorMessage('')
    setAuthSuccessMessage('')
  }

  const openCartPage = () => {
    navigateToPage('cart')
  }

  const openMenuPage = () => {
    navigateToPage('menu')
  }

  const openProfilePage = () => {
    if (!user) {
      setAuthMode('login')
      setAuthSuccessMessage('')
      setAuthErrorMessage('Чтобы открыть профиль, нужно авторизоваться.')
      setIsAuthModalOpen(true)
      return
    }

    navigateToPage('profile')
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setIsAuthSubmitting(true)
    setAuthErrorMessage('')
    setAuthSuccessMessage('')

    try {
      const data = await loginUser(loginForm)
      setStoredToken(data.token)
      setToken(data.token)
      setUser(data.user)
      setLoginForm({ email: '', password: '' })
      setAuthSuccessMessage('Вы успешно вошли в аккаунт.')
      setIsAuthModalOpen(false)
      showToast(`С возвращением, ${data.user.name}!`)
    } catch (error) {
      setAuthErrorMessage(error.message)
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setIsAuthSubmitting(true)
    setAuthErrorMessage('')
    setAuthSuccessMessage('')

    try {
      const data = await registerUser(registerForm)
      setStoredToken(data.token)
      setToken(data.token)
      setUser(data.user)
      setRegisterForm({
        name: '',
        email: '',
        password: '',
        passwordConfirmation: '',
      })
      setAuthSuccessMessage('Аккаунт успешно создан.')
      setIsAuthModalOpen(false)
      showToast(`Добро пожаловать, ${data.user.name}!`)
    } catch (error) {
      setAuthErrorMessage(error.message)
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  const handleLogout = async () => {
    if (!token) {
      return
    }

    setIsAuthSubmitting(true)
    setAuthErrorMessage('')
    setAuthSuccessMessage('')

    try {
      await logoutUser(token)
    } catch {
      // Токен мог устареть, локальный выход все равно должен сработать.
    } finally {
      clearStoredToken()
      setToken('')
      setUser(null)
      setIsAuthModalOpen(false)
      setCartItems([])
      setIsAuthSubmitting(false)
      showToast('Вы вышли из аккаунта')
    }
  }

  const handleOrderClick = (item) => {
    if (!user) {
      setAuthMode('login')
      setAuthSuccessMessage('')
      setAuthErrorMessage('Для оформления заказа нужно быть авторизованным. Войдите или зарегистрируйтесь.')
      setIsAuthModalOpen(true)
      return
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.name === item.name)

      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }

      return [...prevItems, { ...item, unitPrice: getPriceValue(item.price), quantity: 1 }]
    })

    showToast(`"${item.name}" добавлен в корзину`)
  }

  const updateCartItemQuantity = (itemName, delta) => {
    setCartItems((prevItems) =>
      prevItems.flatMap((item) => {
        if (item.name !== itemName) {
          return [item]
        }

        const nextQuantity = item.quantity + delta

        if (nextQuantity <= 0) {
          return []
        }

        return [{ ...item, quantity: nextQuantity }]
      }),
    )
  }

  const handleOrderPlaced = (order) => {
    setCartItems([])
    showToast(`Заказ ${order.order_number} оформлен`)
  }

  const products = productsDB[activeCategory] || []
  const categoryTitle = categories.find((category) => category.key === activeCategory)?.label || 'Меню'
  const isCartPage = activePage === 'cart'
  const isProfilePage = activePage === 'profile'
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotalAmount = cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0)

  return (
    <>
      <div className="nav-links-bar">
        <div className="container nav-container">
          <button className="nav-link" type="button" onClick={openMenuPage}>
            <i className="fas fa-house" /> Меню
          </button>
          <button className="nav-link" type="button" onClick={openCartPage}>
            <i className="fas fa-basket-shopping" /> Корзина {cartItemsCount > 0 ? `(${cartItemsCount})` : ''}
          </button>
          <button className="nav-link" type="button" onClick={openProfilePage}>
            <i className="fas fa-user-circle" /> Профиль
          </button>
          {navLinks.map((link) => (
            <button
              key={link.key}
              className="nav-link"
              type="button"
              onClick={() => openDynamicModal(link.key)}
            >
              <i className={link.icon} />
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {!isCartPage && !isProfilePage ? (
        <>
          <div className="hero">
        <div className="container">
          <div className="top-bar">
            <div className="delivery-selector">
              <button
                className={`delivery-btn ${deliveryType === 'delivery' ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setDeliveryType('delivery')
                  showToast('Выбрана доставка')
                }}
              >
                <i className="fas fa-motorcycle" /> ДОСТАВКА
              </button>
              <button
                className={`delivery-btn ${deliveryType === 'takeaway' ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setDeliveryType('takeaway')
                  showToast('Выбран самовывоз')
                }}
              >
                <i className="fas fa-bag-shopping" /> С СОБОЙ
              </button>
            </div>

            <div className="top-actions">
              <button className="app-btn" type="button" onClick={() => setIsAppModalOpen(true)}>
                <i className="fas fa-download" /> Скачай приложение! <i className="fab fa-android" />
                <i className="fab fa-apple" />
              </button>

              {user ? (
                <>
                  <button className="auth-user-btn" type="button" onClick={openProfilePage}>
                    <i className="fas fa-user" /> {user.name}
                  </button>
                  <button
                    className="auth-open-btn auth-open-btn-logout"
                    type="button"
                    onClick={handleLogout}
                    disabled={isAuthSubmitting}
                  >
                    <i className="fas fa-right-from-bracket" /> Выйти
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="auth-open-btn"
                    type="button"
                    onClick={() => openAuthModal('login')}
                    disabled={isCheckingSession}
                  >
                    <i className="fas fa-right-to-bracket" /> Вход
                  </button>
                  <button
                    className="auth-open-btn auth-open-btn-register"
                    type="button"
                    onClick={() => openAuthModal('register')}
                    disabled={isCheckingSession}
                  >
                    <i className="fas fa-user-plus" /> Регистрация
                  </button>
                </>
              )}

              {isCheckingSession ? (
                <span className="auth-status-pill">
                  <i className="fas fa-circle-notch" /> Проверка сессии
                </span>
              ) : null}
            </div>
          </div>

          <div className="brand-block">
            <div className="logo-big">
              РОКН<span>РОЛЛЫ</span>!
            </div>
            <div className="years">
              <i className="fas fa-guitar" /> Нам 17 лет! <i className="fas fa-cake-candles" />
            </div>
            <div className="years years-site">roknroll.ru</div>
          </div>

          <button className="gift-banner" type="button" onClick={() => openDynamicModal('gifts')}>
            <div className="gift-text">
              <i className="fas fa-gift" />
              <div>
                <h3>Дарим подарки!</h3>
                <span>Кликай для подробностей</span>
              </div>
            </div>
            <div className="gift-badge">Акция к 17-летию</div>
          </button>
        </div>
      </div>

      <div className="container">
        <div className="main-layout">
          <aside className="categories-sidebar">
            <h4>
              <i className="fas fa-compass" /> Меню
            </h4>
            <ul className="cat-list">
              {categories.map((category) => (
                <li
                  key={category.key}
                  className={activeCategory === category.key ? 'active-cat' : ''}
                  onClick={() => setActiveCategory(category.key)}
                >
                  <i className={category.icon} /> {category.label}
                </li>
              ))}
            </ul>
          </aside>

          <div className="products-area">
            <h2 className="section-title">{categoryTitle}</h2>
            <div className="product-grid">
              {products.map((item) => (
                <article key={item.name} className="product-card">
                  <div className="card-img">
                    {item.badge ? <div className="badge-new">{item.badge}</div> : null}
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
                  <div className="card-info">
                    <h3>{item.name}</h3>
                    <p className="desc">{item.desc}</p>
                    <div className="price-order">
                      <div className="price">{item.price}</div>
                      <button
                        className="order-btn"
                        type="button"
                        onClick={() => handleOrderClick(item)}
                      >
                        <i className="fas fa-basket-shopping" /> Заказать
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

          <footer>
            <div className="container">
              <p>
                <i className="fas fa-heart footer-heart" /> Рокнроллы! - Путь к твоему сердцу{' '}
                <i className="fas fa-drumstick-bite" />
              </p>
              <p>© 2026 Сеть "Рокнроллы" | Доставка вкуса 24/7</p>
            </div>
          </footer>
        </>
        ) : isCartPage ? (
        <CartPage
          token={token}
          user={user}
          cartItems={cartItems}
          cartItemsCount={cartItemsCount}
          cartTotalAmount={cartTotalAmount}
          formatRubles={formatRubles}
          onBackToMenu={openMenuPage}
          onIncreaseItem={(itemName) => updateCartItemQuantity(itemName, 1)}
          onDecreaseItem={(itemName) => updateCartItemQuantity(itemName, -1)}
          onClearCart={() => setCartItems([])}
          onRequireAuth={() => openAuthModal('login')}
          onOrderPlaced={handleOrderPlaced}
        />
      ) : (
        <ProfilePage
          token={token}
          user={user}
          onUserUpdated={setUser}
          showToast={showToast}
          onRequireAuth={() => openAuthModal('login')}
          onBackToMenu={openMenuPage}
        />
        )}

      <div className={`toast-msg ${isToastVisible ? 'show' : ''}`}>{toastText}</div>

      {cartItemsCount > 0 && !isCartPage ? (
        <button className="floating-cart-btn" type="button" onClick={openCartPage}>
          <i className="fas fa-basket-shopping" />
          <span className="floating-cart-btn-label">Корзина</span>
          <span className="floating-cart-btn-sum">{formatRubles(cartTotalAmount)}</span>
          <span className="floating-cart-btn-count">{cartItemsCount}</span>
        </button>
      ) : null}

      <div className={`info-modal ${isAuthModalOpen ? 'active' : ''}`}>
        <div className="modal-window auth-modal-window">
          <button
            className="close-modal-btn"
            type="button"
            aria-label="Закрыть окно"
            onClick={closeAuthModal}
          >
            &times;
          </button>

          <h2>
            <i className="fas fa-user-circle" /> Личный кабинет
          </h2>
          <p className="auth-subtitle">Войдите или создайте аккаунт, чтобы отслеживать заказы и бонусы.</p>

          {authErrorMessage ? <p className="auth-message auth-message-error">{authErrorMessage}</p> : null}
          {authSuccessMessage ? <p className="auth-message auth-message-success">{authSuccessMessage}</p> : null}

          {user ? (
            <div className="auth-profile-card">
              <p>
                <strong>Имя:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <button
                className="auth-submit-btn auth-submit-btn-ghost"
                type="button"
                onClick={handleLogout}
                disabled={isAuthSubmitting}
              >
                {isAuthSubmitting ? 'Выход...' : 'Выйти из аккаунта'}
              </button>
            </div>
          ) : (
            <>
              <div className="auth-mode-switch">
                <button
                  type="button"
                  className={authMode === 'login' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('login')
                    setAuthErrorMessage('')
                    setAuthSuccessMessage('')
                  }}
                >
                  Вход
                </button>
                <button
                  type="button"
                  className={authMode === 'register' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('register')
                    setAuthErrorMessage('')
                    setAuthSuccessMessage('')
                  }}
                >
                  Регистрация
                </button>
              </div>

              {authMode === 'login' ? (
                <form className="auth-form-grid" onSubmit={handleLoginSubmit}>
                  <label>
                    Email
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Пароль
                    <input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <button className="auth-submit-btn" type="submit" disabled={isAuthSubmitting}>
                    {isAuthSubmitting ? 'Вход...' : 'Войти'}
                  </button>
                </form>
              ) : (
                <form className="auth-form-grid" onSubmit={handleRegisterSubmit}>
                  <label>
                    Имя
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Пароль
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Подтверждение пароля
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={registerForm.passwordConfirmation}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          passwordConfirmation: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <button className="auth-submit-btn" type="submit" disabled={isAuthSubmitting}>
                    {isAuthSubmitting ? 'Создание...' : 'Создать аккаунт'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <div className={`info-modal ${isAppModalOpen ? 'active' : ''}`}>
        <div className="modal-window">
          <button
            className="close-modal-btn"
            type="button"
            aria-label="Закрыть окно"
            onClick={() => setIsAppModalOpen(false)}
          >
            &times;
          </button>
          <i className="fas fa-mobile-alt modal-app-icon" />
          <h2>Рокнроллы в телефоне</h2>
          <p>Заказывай быстрее, копи бонусы и получай эксклюзивные акции в приложении.</p>
          <div className="store-links">
            <button
              className="store-btn"
              type="button"
              onClick={() => window.open('https://www.apple.com/app-store/', '_blank', 'noopener')}
            >
              <i className="fab fa-apple" /> App Store
            </button>
            <button
              className="store-btn"
              type="button"
              onClick={() => window.open('https://play.google.com/store', '_blank', 'noopener')}
            >
              <i className="fab fa-google-play" /> Google Play
            </button>
          </div>
        </div>
      </div>

      <div className={`info-modal ${dynamicModalKey ? 'active' : ''}`}>
        <div className="modal-window">
          <button
            className="close-modal-btn"
            type="button"
            aria-label="Закрыть окно"
            onClick={() => setDynamicModalKey('')}
          >
            &times;
          </button>
          <div dangerouslySetInnerHTML={{ __html: modalTemplates[dynamicModalKey] || '' }} />
        </div>
      </div>
    </>
  )
}

export default App
