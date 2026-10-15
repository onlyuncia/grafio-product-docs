/* Viewport-only interaction. Never alter report data or saved dashboard layouts. */
(() => {
  const shell = document.getElementById('appShell')
  const sidebar = shell.querySelector('.sidebar')
  const trigger = document.getElementById('sidebarCollapse')
  const portrait = window.matchMedia('(max-width: 600px) and (orientation: portrait)')
  const adminNarrow = window.matchMedia('(max-width: 900px)')
  const backdrop = document.createElement('button')
  backdrop.type = 'button'
  backdrop.className = 'mobile-nav-backdrop'
  backdrop.setAttribute('aria-label', 'Закрыть меню')
  backdrop.tabIndex = -1
  document.body.append(backdrop)
  const close = document.createElement('button')
  close.type = 'button'
  close.className = 'mobile-nav-close'
  close.textContent = '×'
  close.setAttribute('aria-label', 'Закрыть меню')
  sidebar.append(close)

  document.querySelectorAll('[data-tooltip]').forEach(button => {
    if (!button.hasAttribute('aria-label') && button.matches('button')) {
      button.setAttribute('aria-label', button.dataset.tooltip)
    }
  })

  function closeNav(restore = false) {
    shell.classList.remove('is-mobile-sidebar-open')
    backdrop.classList.remove('is-open')
    trigger.setAttribute('aria-expanded', 'false')
    if (portrait.matches) {
      trigger.setAttribute('aria-label', 'Открыть меню')
      trigger.dataset.tooltip = 'Открыть меню'
    }
    if (restore) trigger.focus({preventScroll: true})
  }
  trigger.addEventListener('click', event => {
    if (!portrait.matches) return
    event.stopImmediatePropagation()
    const open = !shell.classList.contains('is-mobile-sidebar-open')
    shell.classList.toggle('is-mobile-sidebar-open', open)
    backdrop.classList.toggle('is-open', open)
    trigger.setAttribute('aria-expanded', String(open))
    trigger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
    trigger.dataset.tooltip = open ? 'Закрыть меню' : 'Открыть меню'
    if (open) close.focus({preventScroll: true})
  }, true)
  backdrop.addEventListener('click', () => closeNav(true))
  close.addEventListener('click', () => closeNav(true))
  sidebar.addEventListener('click', event => {
    if (event.target.closest('.nav-item,.profile-action,.demo-control')) closeNav()
  })
  document.addEventListener('keydown', event => {
    if (!shell.classList.contains('is-mobile-sidebar-open')) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopImmediatePropagation()
      closeNav(true)
    } else if (event.key === 'Tab') {
      const buttons = [...sidebar.querySelectorAll('button')].filter(e => e.getClientRects().length && !e.disabled)
      const first = buttons[0], last = buttons.at(-1)
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus()}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus()}
    }
  }, true)

  const products = document.getElementById('productsScroll')
  const wrap = document.createElement('div')
  wrap.className = 'products-mobile-table-wrap'
  products.before(wrap)
  wrap.append(products)
  const note = document.createElement('div')
  note.className = 'products-orientation-note'
  note.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="11" y="5" width="18" height="30" rx="3"/><path d="M17 30h6M6 18a14 14 0 0 1 6-11M6 18l-3-4m3 4 4-2M34 22a14 14 0 0 1-6 11m6-11 3 4m-3-4-4 2"/></svg><strong>Поверните телефон</strong><p>В горизонтальном режиме удобнее сравнивать показатели товаров. Таблицу также можно листать вправо.</p><button type="button" class="secondary-button">Продолжить в вертикальном режиме</button>'
  wrap.append(note)
  let dismissed = false
  function syncTable() {
    const gated = portrait.matches && !dismissed
    wrap.classList.toggle('is-orientation-gated', gated)
    products.inert = gated
    note.hidden = !gated
  }
  note.querySelector('button').addEventListener('click', () => {
    dismissed = true
    syncTable()
    products.tabIndex = 0
    products.focus({preventScroll: true})
  })

  const admin = document.getElementById('adminConsole')
  const queue = document.createElement('button')
  queue.type = 'button'
  queue.className = 'mobile-queue-toggle'
  queue.textContent = 'Очередь запросов'
  queue.setAttribute('aria-expanded', 'false')
  queue.setAttribute('aria-controls', 'acQueueList')
  admin.querySelector('.ac-header').append(queue)
  function closeQueue() {
    admin.classList.remove('is-mobile-queue-open')
    queue.setAttribute('aria-expanded', 'false')
  }
  queue.addEventListener('click', () => {
    const open = !admin.classList.contains('is-mobile-queue-open')
    admin.classList.toggle('is-mobile-queue-open', open)
    queue.setAttribute('aria-expanded', String(open))
  })
  admin.addEventListener('click', event => {
    if (!adminNarrow.matches) return
    if (event.target.closest('[data-ac-queue-toggle]')) {
      event.stopImmediatePropagation()
      closeQueue()
    }
  }, true)
  admin.addEventListener('click', event => {
    if (event.target.closest('[data-ac-record],#acReturn')) closeQueue()
  })

  function labelRails() {
    document.querySelectorAll('.studio-rail').forEach(rail => {
      rail.tabIndex = 0
      rail.setAttribute('role', 'region')
      rail.setAttribute('aria-label', `${rail.closest('.studio-section').querySelector('h2').textContent}: листайте карточки`)
    })
  }
  new MutationObserver(labelRails).observe(document.getElementById('studioContent'), {childList: true})
  labelRails()

  const resize = new ResizeObserver(entries => {
    for (const entry of entries) {
      if (entry.target.classList.contains('toolbar')) {
        shell.style.setProperty('--responsive-toolbar-height', `${Math.ceil(entry.target.getBoundingClientRect().height)}px`)
      } else {
        admin.style.setProperty('--responsive-ac-header-height', `${Math.ceil(entry.target.getBoundingClientRect().height)}px`)
      }
    }
  })
  resize.observe(shell.querySelector('.toolbar'))
  resize.observe(admin.querySelector('.ac-header'))
  function syncViewport() {
    closeNav()
    closeQueue()
    syncTable()
    if (!portrait.matches) {
      trigger.setAttribute('aria-label', shell.classList.contains('is-collapsed') ? 'Развернуть боковую панель' : 'Свернуть боковую панель')
      trigger.dataset.tooltip = shell.classList.contains('is-collapsed') ? 'Развернуть панель' : 'Свернуть панель'
    }
    if (typeof closeDatePicker === 'function') closeDatePicker()
    if (typeof closeContextMenu === 'function') closeContextMenu()
  }
  window.addEventListener('resize', syncViewport)
  syncViewport()
})()
