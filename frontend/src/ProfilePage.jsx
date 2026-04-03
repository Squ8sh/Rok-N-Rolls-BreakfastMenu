import { useEffect, useMemo, useState } from 'react'
import {
  addPaymentMethod,
  confirmPasswordChange,
  getProfile,
  removePaymentMethod,
  requestPasswordChangeCode,
  updateProfile,
} from './api/profile'

const paymentTypeOptions = [
  { value: 'card', label: 'Банковская карта' },
  { value: 'sbp', label: 'СБП' },
  { value: 'cash', label: 'Наличные курьеру' },
]

const paymentTypeLabels = {
  card: 'Банковская карта',
  sbp: 'СБП',
  cash: 'Наличные курьеру',
}

const deliveryTypeLabels = {
  pickup: 'Самовывоз',
  delivery: 'Доставка',
}

const orderStatusLabels = {
  new: 'Новый',
  confirmed: 'Подтвержден',
  cooking: 'Готовится',
  delivering: 'В пути',
  done: 'Выполнен',
  canceled: 'Отменен',
}

function ProfilePage({ token, user, onUserUpdated, showToast, onRequireAuth, onBackToMenu }) {
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [loadError, setLoadError] = useState('')

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.date_of_birth || '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })

  const [paymentMethods, setPaymentMethods] = useState([])
  const [orders, setOrders] = useState([])
  const [paymentForm, setPaymentForm] = useState({
    methodType: 'card',
    label: '',
    cardNumber: '',
    expiresAt: '',
    isDefault: false,
  })
  const [isSavingPayment, setIsSavingPayment] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState({ type: '', text: '' })

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    passwordConfirmation: '',
    code: '',
  })
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isRequestingCode, setIsRequestingCode] = useState(false)
  const [isConfirmingPassword, setIsConfirmingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.date_of_birth || '',
    })
  }, [user?.id, user?.name, user?.email, user?.phone, user?.date_of_birth])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setPaymentMethods([])
      setOrders([])
      return
    }

    let isActive = true

    const loadProfile = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const data = await getProfile(token)

        if (!isActive) {
          return
        }

        setProfileForm({
          name: data.user?.name || '',
          email: data.user?.email || '',
          phone: data.user?.phone || '',
          dateOfBirth: data.user?.date_of_birth || '',
        })
        setPaymentMethods(Array.isArray(data.payment_methods) ? data.payment_methods : [])
        setOrders(Array.isArray(data.orders) ? data.orders : [])
        onUserUpdated(data.user)
      } catch (error) {
        if (!isActive) {
          return
        }

        setLoadError(error.message)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [token, onUserUpdated])

  const methodsCount = useMemo(() => paymentMethods.length, [paymentMethods.length])
  const ordersCount = useMemo(() => orders.length, [orders.length])

  const formatRubles = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₽`

  const formatDateTime = (value) => {
    if (!value) {
      return '—'
    }

    const parsed = new Date(value)

    if (Number.isNaN(parsed.getTime())) {
      return '—'
    }

    return parsed.toLocaleString('ru-RU')
  }

  const setMessage = (setter, type, text) => {
    setter({ type, text })
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()

    if (!token) {
      onRequireAuth()
      return
    }

    setIsSavingProfile(true)
    setMessage(setProfileMessage, '', '')

    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone || null,
        date_of_birth: profileForm.dateOfBirth || null,
      }

      const data = await updateProfile(token, payload)
      onUserUpdated(data.user)
      setMessage(setProfileMessage, 'success', 'Профиль обновлен.')
      showToast('Профиль обновлен')
    } catch (error) {
      setMessage(setProfileMessage, 'error', error.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleAddPaymentMethod = async (event) => {
    event.preventDefault()

    if (!token) {
      onRequireAuth()
      return
    }

    if (paymentForm.methodType === 'card' && !paymentForm.cardNumber.trim()) {
      setMessage(setPaymentMessage, 'error', 'Введите номер карты.')
      return
    }

    setIsSavingPayment(true)
    setMessage(setPaymentMessage, '', '')

    try {
      const data = await addPaymentMethod(token, {
        method_type: paymentForm.methodType,
        label: paymentForm.label || null,
        card_number: paymentForm.methodType === 'card' ? paymentForm.cardNumber : null,
        expires_at: paymentForm.methodType === 'card' ? paymentForm.expiresAt || null : null,
        is_default: paymentForm.isDefault,
      })

      setPaymentMethods(Array.isArray(data.payment_methods) ? data.payment_methods : [])
      setPaymentForm((prev) => ({
        ...prev,
        label: '',
        cardNumber: '',
        expiresAt: '',
        isDefault: false,
      }))
      setMessage(setPaymentMessage, 'success', 'Способ оплаты добавлен.')
      showToast('Способ оплаты добавлен')
    } catch (error) {
      setMessage(setPaymentMessage, 'error', error.message)
    } finally {
      setIsSavingPayment(false)
    }
  }

  const handleRemovePaymentMethod = async (paymentMethodId) => {
    if (!token) {
      onRequireAuth()
      return
    }

    setIsSavingPayment(true)
    setMessage(setPaymentMessage, '', '')

    try {
      const data = await removePaymentMethod(token, paymentMethodId)
      setPaymentMethods(Array.isArray(data.payment_methods) ? data.payment_methods : [])
      setMessage(setPaymentMessage, 'success', 'Способ оплаты удален.')
    } catch (error) {
      setMessage(setPaymentMessage, 'error', error.message)
    } finally {
      setIsSavingPayment(false)
    }
  }

  const handleRequestPasswordCode = async (event) => {
    event.preventDefault()

    if (!token) {
      onRequireAuth()
      return
    }

    if (passwordForm.newPassword !== passwordForm.passwordConfirmation) {
      setMessage(setPasswordMessage, 'error', 'Пароли не совпадают.')
      return
    }

    setIsRequestingCode(true)
    setMessage(setPasswordMessage, '', '')

    try {
      await requestPasswordChangeCode(token, {
        newPassword: passwordForm.newPassword,
        passwordConfirmation: passwordForm.passwordConfirmation,
      })

      setIsCodeSent(true)
      setMessage(setPasswordMessage, 'success', 'Код подтверждения отправлен на вашу почту.')
      showToast('Код отправлен на почту')
    } catch (error) {
      setMessage(setPasswordMessage, 'error', error.message)
    } finally {
      setIsRequestingCode(false)
    }
  }

  const handleConfirmPassword = async (event) => {
    event.preventDefault()

    if (!token) {
      onRequireAuth()
      return
    }

    setIsConfirmingPassword(true)
    setMessage(setPasswordMessage, '', '')

    try {
      await confirmPasswordChange(token, passwordForm.code)
      setPasswordForm({ newPassword: '', passwordConfirmation: '', code: '' })
      setIsCodeSent(false)
      setMessage(setPasswordMessage, 'success', 'Пароль успешно изменен.')
      showToast('Пароль изменен')
    } catch (error) {
      setMessage(setPasswordMessage, 'error', error.message)
    } finally {
      setIsConfirmingPassword(false)
    }
  }

  if (!token || !user) {
    return (
      <main className="profile-page">
        <section className="profile-hero">
          <div className="container profile-hero-inner">
            <h1>Профиль</h1>
            <p>Для доступа к профилю войдите в аккаунт.</p>
          </div>
        </section>

        <section className="container profile-content">
          <div className="profile-guest-card">
            <i className="fas fa-user-lock" />
            <h2>Нужна авторизация</h2>
            <p>Войдите или зарегистрируйтесь, чтобы управлять профилем и способами оплаты.</p>
            <div className="profile-guest-actions">
              <button className="profile-secondary-btn" type="button" onClick={onBackToMenu}>
                Вернуться в меню
              </button>
              <button className="profile-primary-btn" type="button" onClick={onRequireAuth}>
                Войти в аккаунт
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="container profile-hero-inner">
          <div>
            <h1>Профиль</h1>
            <p>Управляйте личными данными, способами оплаты и безопасностью аккаунта.</p>
          </div>

          <div className="profile-hero-meta">
            <span>Почта: {profileForm.email || '—'}</span>
            <strong>Способов оплаты: {methodsCount}</strong>
            <strong>Заказов: {ordersCount}</strong>
          </div>
        </div>
      </section>

      <section className="container profile-content">
        {isLoading ? <p className="profile-muted">Загрузка профиля...</p> : null}
        {loadError ? <p className="profile-message profile-message-error">{loadError}</p> : null}

        <div className="profile-grid">
          <article className="profile-card">
            <h2>
              <i className="fas fa-id-card" /> Личные данные
            </h2>

            {profileMessage.text ? (
              <p className={`profile-message ${profileMessage.type === 'error' ? 'profile-message-error' : 'profile-message-success'}`}>
                {profileMessage.text}
              </p>
            ) : null}

            <form className="profile-form" onSubmit={handleSaveProfile}>
              <label>
                Имя
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
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
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Номер телефона
                <input
                  type="tel"
                  placeholder="+7 (999) 000-00-00"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Дата рождения
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      dateOfBirth: event.target.value,
                    }))
                  }
                />
              </label>

              <button className="profile-primary-btn" type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </article>

          <article className="profile-card">
            <h2>
              <i className="fas fa-wallet" /> Способы оплаты
            </h2>

            {paymentMessage.text ? (
              <p className={`profile-message ${paymentMessage.type === 'error' ? 'profile-message-error' : 'profile-message-success'}`}>
                {paymentMessage.text}
              </p>
            ) : null}

            <form className="profile-form" onSubmit={handleAddPaymentMethod}>
              <label>
                Тип оплаты
                <select
                  value={paymentForm.methodType}
                  onChange={(event) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      methodType: event.target.value,
                    }))
                  }
                >
                  {paymentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Название (например, "Личная карта")
                <input
                  type="text"
                  value={paymentForm.label}
                  onChange={(event) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      label: event.target.value,
                    }))
                  }
                />
              </label>

              {paymentForm.methodType === 'card' ? (
                <>
                  <label>
                    Номер карты
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={paymentForm.cardNumber}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          cardNumber: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Срок действия
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentForm.expiresAt}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          expiresAt: event.target.value,
                        }))
                      }
                    />
                  </label>
                </>
              ) : null}

              <label className="profile-checkbox-row">
                <input
                  type="checkbox"
                  checked={paymentForm.isDefault}
                  onChange={(event) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      isDefault: event.target.checked,
                    }))
                  }
                />
                Сделать способом по умолчанию
              </label>

              <button className="profile-primary-btn" type="submit" disabled={isSavingPayment}>
                {isSavingPayment ? 'Добавление...' : 'Добавить способ оплаты'}
              </button>
            </form>

            <div className="profile-payments-list">
              {paymentMethods.length === 0 ? (
                <p className="profile-muted">Способы оплаты еще не добавлены.</p>
              ) : (
                paymentMethods.map((method) => (
                  <article key={method.id} className="profile-payment-item">
                    <div>
                      <p className="profile-payment-title">
                        {method.label || paymentTypeLabels[method.method_type] || 'Способ оплаты'}
                      </p>
                      <p className="profile-payment-meta">
                        {paymentTypeLabels[method.method_type] || method.method_type}
                        {method.masked_number ? ` • ${method.masked_number}` : ''}
                        {method.expires_at ? ` • ${method.expires_at}` : ''}
                      </p>
                    </div>

                    <div className="profile-payment-actions">
                      {method.is_default ? <span className="profile-default-badge">По умолчанию</span> : null}
                      <button
                        className="profile-secondary-btn"
                        type="button"
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        disabled={isSavingPayment}
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>

          <article className="profile-card profile-card-full">
            <h2>
              <i className="fas fa-clock-rotate-left" /> История заказов
            </h2>

            {orders.length === 0 ? (
              <p className="profile-muted">У вас пока нет оформленных заказов.</p>
            ) : (
              <div className="profile-orders-list">
                {orders.map((order) => (
                  <article key={order.id} className="profile-order-item">
                    <div className="profile-order-item-head">
                      <div>
                        <p className="profile-order-number">Заказ #{order.order_number}</p>
                        <p className="profile-order-meta">
                          {deliveryTypeLabels[order.delivery_type] || order.delivery_type} •{' '}
                          {order.payment_method_label || paymentTypeLabels[order.payment_method_type] || order.payment_method_type}
                        </p>
                      </div>
                      <div className="profile-order-status-wrap">
                        <span className="profile-order-status">
                          {orderStatusLabels[order.status] || order.status}
                        </span>
                        <strong>{formatRubles(order.total_amount)}</strong>
                      </div>
                    </div>

                    <p className="profile-order-meta">
                      {order.delivery_type === 'pickup'
                        ? `Филиал: ${order.pickup_branch || '—'}`
                        : `Адрес: ${order.delivery_address || '—'}`}
                    </p>
                    <p className="profile-order-meta">
                      Позиций: {order.items_count} • {formatDateTime(order.created_at)}
                    </p>

                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      <ul className="profile-order-items">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            <span>{item.name}</span>
                            <span>
                              {item.quantity} × {formatRubles(item.unit_price)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="profile-card profile-card-full">
            <h2>
              <i className="fas fa-shield-halved" /> Смена пароля по подтверждению на почту
            </h2>

            {passwordMessage.text ? (
              <p className={`profile-message ${passwordMessage.type === 'error' ? 'profile-message-error' : 'profile-message-success'}`}>
                {passwordMessage.text}
              </p>
            ) : null}

            <form className="profile-form" onSubmit={handleRequestPasswordCode}>
              <div className="profile-two-columns">
                <label>
                  Новый пароль
                  <input
                    type="password"
                    minLength={8}
                    required
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Подтверждение нового пароля
                  <input
                    type="password"
                    minLength={8}
                    required
                    value={passwordForm.passwordConfirmation}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        passwordConfirmation: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <button className="profile-secondary-btn" type="submit" disabled={isRequestingCode}>
                {isRequestingCode ? 'Отправка...' : 'Отправить код на почту'}
              </button>
            </form>

            <form className="profile-form profile-confirm-form" onSubmit={handleConfirmPassword}>
              <label>
                Код подтверждения из письма
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6 цифр"
                  value={passwordForm.code}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      code: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <button
                className="profile-primary-btn"
                type="submit"
                disabled={isConfirmingPassword || !isCodeSent}
              >
                {isConfirmingPassword ? 'Подтверждение...' : 'Подтвердить смену пароля'}
              </button>
            </form>
          </article>
        </div>
      </section>
    </main>
  )
}

export default ProfilePage
