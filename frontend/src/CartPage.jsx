import { useEffect, useMemo, useState } from 'react'
import { createOrder } from './api/orders'
import { getProfile } from './api/profile'

const pickupBranches = [
  'Центральный филиал (ул. Центральная, 17)',
  'Филиал Север (пр-т Победы, 12)',
  'Филиал Юг (ул. Парковая, 8)',
]

const manualPaymentOptions = [
  { key: 'manual:card', label: 'Карта онлайн', type: 'card' },
  { key: 'manual:sbp', label: 'СБП', type: 'sbp' },
  { key: 'manual:cash', label: 'Наличными при получении', type: 'cash' },
]

function CartPage({
  token,
  user,
  cartItems,
  cartItemsCount,
  cartTotalAmount,
  formatRubles,
  onBackToMenu,
  onIncreaseItem,
  onDecreaseItem,
  onClearCart,
  onRequireAuth,
  onOrderPlaced,
}) {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderMessage, setOrderMessage] = useState({ type: '', text: '' })
  const [orderForm, setOrderForm] = useState({
    deliveryType: 'delivery',
    pickupBranch: pickupBranches[0],
    deliveryAddress: '',
    paymentOption: 'manual:card',
    comment: '',
  })

  useEffect(() => {
    if (!token) {
      setPaymentMethods([])
      return
    }

    let isActive = true

    const loadPaymentMethods = async () => {
      setIsLoadingProfileData(true)

      try {
        const profileData = await getProfile(token)

        if (!isActive) {
          return
        }

        const methods = Array.isArray(profileData.payment_methods) ? profileData.payment_methods : []
        setPaymentMethods(methods)

        const defaultMethod = methods.find((method) => method.is_default)
        if (defaultMethod) {
          setOrderForm((prev) => ({
            ...prev,
            paymentOption: `saved:${defaultMethod.id}`,
          }))
        }
      } catch {
        if (isActive) {
          setPaymentMethods([])
        }
      } finally {
        if (isActive) {
          setIsLoadingProfileData(false)
        }
      }
    }

    loadPaymentMethods()

    return () => {
      isActive = false
    }
  }, [token])

  const paymentOptions = useMemo(() => {
    const savedOptions = paymentMethods.map((method) => ({
      key: `saved:${method.id}`,
      label: `${method.label || 'Сохраненный способ'}${method.masked_number ? ` • ${method.masked_number}` : ''}`,
      type: method.method_type,
      methodId: method.id,
    }))

    return [...savedOptions, ...manualPaymentOptions]
  }, [paymentMethods])

  const handleCheckout = async (event) => {
    event.preventDefault()

    if (!token || !user) {
      onRequireAuth()
      return
    }

    if (cartItems.length === 0) {
      setOrderMessage({ type: 'error', text: 'Корзина пуста. Добавьте блюда для оформления.' })
      return
    }

    if (orderForm.deliveryType === 'delivery' && !orderForm.deliveryAddress.trim()) {
      setOrderMessage({ type: 'error', text: 'Укажите адрес для доставки.' })
      return
    }

    if (orderForm.deliveryType === 'pickup' && !orderForm.pickupBranch.trim()) {
      setOrderMessage({ type: 'error', text: 'Выберите филиал для самовывоза.' })
      return
    }

    const selectedOption = paymentOptions.find((option) => option.key === orderForm.paymentOption)

    if (!selectedOption) {
      setOrderMessage({ type: 'error', text: 'Выберите способ оплаты.' })
      return
    }

    setIsSubmittingOrder(true)
    setOrderMessage({ type: '', text: '' })

    try {
      const payload = {
        items: cartItems.map((item) => ({
          name: item.name,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          image: item.image || null,
        })),
        delivery_type: orderForm.deliveryType,
        pickup_branch: orderForm.deliveryType === 'pickup' ? orderForm.pickupBranch : null,
        delivery_address: orderForm.deliveryType === 'delivery' ? orderForm.deliveryAddress.trim() : null,
        payment_method_type: selectedOption.type,
        payment_method_id: selectedOption.methodId || null,
        comment: orderForm.comment.trim() || null,
      }

      const response = await createOrder(token, payload)
      const createdOrder = response?.order || null

      if (!createdOrder) {
        throw new Error('Не удалось получить данные заказа после оформления.')
      }

      onOrderPlaced(createdOrder)
      setOrderMessage({
        type: 'success',
        text: `Заказ ${createdOrder.order_number} успешно оформлен.`,
      })
      setOrderForm((prev) => ({
        ...prev,
        deliveryAddress: '',
        comment: '',
      }))
    } catch (error) {
      setOrderMessage({ type: 'error', text: error.message })
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  return (
    <main className="cart-page">
      <section className="cart-page-hero">
        <div className="container cart-page-hero-inner">
          <div>
            <h1>Корзина</h1>
            <p>Проверьте состав заказа, количество позиций и итоговую сумму.</p>
          </div>

          <div className="cart-page-hero-actions">
            <div className="cart-page-total-pill">
              <span>Товаров: {cartItemsCount}</span>
              <strong>{formatRubles(cartTotalAmount)}</strong>
            </div>
            <button className="cart-back-btn" type="button" onClick={onBackToMenu}>
              <i className="fas fa-arrow-left" /> Вернуться в меню
            </button>
          </div>
        </div>
      </section>

      <section className="container cart-page-content">
        {cartItems.length === 0 ? (
          <div className="cart-empty-card">
            <i className="fas fa-basket-shopping" />
            <h2>Корзина пока пустая</h2>
            <p>Добавьте блюда из меню, и они появятся здесь.</p>
            <button className="cart-back-btn" type="button" onClick={onBackToMenu}>
              Перейти к меню
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <article key={item.name} className="cart-item-card">
                  <img className="cart-item-preview" src={item.image} alt={item.name} loading="lazy" />

                  <div className="cart-item-head">
                    <h3>{item.name}</h3>
                    <p>{item.price}</p>
                  </div>

                  <div className="cart-item-controls">
                    <button className="cart-qty-btn" type="button" onClick={() => onDecreaseItem(item.name)}>
                      −
                    </button>
                    <span className="cart-item-qty">{item.quantity}</span>
                    <button className="cart-qty-btn" type="button" onClick={() => onIncreaseItem(item.name)}>
                      +
                    </button>
                  </div>

                  <div className="cart-item-line-sum">{formatRubles(item.unitPrice * item.quantity)}</div>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <button className="cart-clear-btn" type="button" onClick={onClearCart}>
                Очистить корзину
              </button>
              <div className="cart-summary-total">
                Итого: <strong>{formatRubles(cartTotalAmount)}</strong>
              </div>
            </div>

            <form className="cart-checkout-panel" onSubmit={handleCheckout}>
              <h2>
                <i className="fas fa-receipt" /> Оформление заказа
              </h2>

              {orderMessage.text ? (
                <p className={`cart-checkout-message ${orderMessage.type === 'error' ? 'cart-checkout-message-error' : 'cart-checkout-message-success'}`}>
                  {orderMessage.text}
                </p>
              ) : null}

              <div className="cart-checkout-grid">
                <label className="cart-checkout-label">
                  Формат получения
                  <div className="cart-delivery-type-switch">
                    <button
                      type="button"
                      className={orderForm.deliveryType === 'delivery' ? 'active' : ''}
                      onClick={() => setOrderForm((prev) => ({ ...prev, deliveryType: 'delivery' }))}
                    >
                      Доставка
                    </button>
                    <button
                      type="button"
                      className={orderForm.deliveryType === 'pickup' ? 'active' : ''}
                      onClick={() => setOrderForm((prev) => ({ ...prev, deliveryType: 'pickup' }))}
                    >
                      Самовывоз
                    </button>
                  </div>
                </label>

                {orderForm.deliveryType === 'pickup' ? (
                  <label className="cart-checkout-label">
                    Филиал для самовывоза
                    <select
                      value={orderForm.pickupBranch}
                      onChange={(event) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          pickupBranch: event.target.value,
                        }))
                      }
                    >
                      {pickupBranches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="cart-checkout-label">
                    Адрес доставки
                    <input
                      type="text"
                      placeholder="Город, улица, дом, квартира"
                      value={orderForm.deliveryAddress}
                      onChange={(event) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          deliveryAddress: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                )}

                <label className="cart-checkout-label">
                  Способ оплаты
                  <select
                    value={orderForm.paymentOption}
                    onChange={(event) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        paymentOption: event.target.value,
                      }))
                    }
                  >
                    {paymentOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {isLoadingProfileData ? <span className="cart-checkout-hint">Загружаем сохраненные способы оплаты...</span> : null}
                </label>

                <label className="cart-checkout-label cart-checkout-label-wide">
                  Комментарий к заказу (необязательно)
                  <textarea
                    rows={3}
                    placeholder="Например: позвонить за 10 минут до доставки"
                    value={orderForm.comment}
                    onChange={(event) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        comment: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="cart-checkout-footer">
                <div className="cart-checkout-total">
                  К оплате: <strong>{formatRubles(cartTotalAmount)}</strong>
                </div>
                <button className="cart-place-order-btn" type="submit" disabled={isSubmittingOrder}>
                  {isSubmittingOrder ? 'Оформление...' : 'Оформить заказ'}
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      <footer>
        <div className="container">
          <p>
            <i className="fas fa-heart footer-heart" /> Рокнроллы! - Путь к твоему сердцу{' '}
            <i className="fas fa-drumstick-bite" />
          </p>
          <p>© 2026 Сеть "Рокнроллы" | Доставка вкуса 24/7</p>
        </div>
      </footer>
    </main>
  )
}

export default CartPage
