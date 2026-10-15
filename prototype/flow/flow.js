const steps = [
  {kind:'ВНЕШНИЙ ИСТОЧНИК',title:'Финансовые операции WB',text:'Grafio запрашивает данные подключённого кабинета. Исходное значение каждой операции остаётся доступным для проверки.',condition:'Следующий шаг: ответ получен и сохранён.',glyph:'↗'},
  {kind:'ЗАГРУЗКА И ХРАНЕНИЕ',title:'Синхронизация без потери источника',text:'Worker выполняет загрузку. В проектируемом финансовом потоке raw-ответ сохраняется неизменяемым, а задание можно безопасно повторить.',condition:'Следующий шаг: источник доступен для обработки.',glyph:'↓'},
  {kind:'НОРМАЛИЗАЦИЯ И КАЧЕСТВО',title:'Проверить данные до расчёта',text:'Операции приводятся к общей структуре; полнота, дубли и новые виды операций дают сигнал, если результат нельзя надёжно считать.',condition:'Неизвестная операция → сигнал администратору.',glyph:'◇'},
  {kind:'МЕТОДИКА И СВЕРКА',title:'Рассчитать по версии правил',text:'Опубликованная методика определяет категорию и показатели. Контрольная сверка должна подтвердить результат до публикации новой версии.',condition:'Если обязательная сверка Δ ≠ 0, публикация запрещена.',glyph:'∑'},
  {kind:'ВЕРСИЯ ОТЧЁТА',title:'Опубликовать проверенный результат',text:'Пользователь видит недельный отчёт и детализацию до исходной операции. Прежняя опубликованная версия сохраняется для сравнения.',condition:'Результат: воспроизводимая версия отчёта.',glyph:'▤'}
];

const cards = [...document.querySelectorAll('.stage')];
const elements = {
  number: document.getElementById('detailNumber'), kind: document.getElementById('detailKind'),
  title: document.getElementById('detailTitle'), text: document.getElementById('detailText'),
  condition: document.getElementById('detailCondition'), progress: document.getElementById('detailProgress'),
  glyph: document.getElementById('detailGlyph'), track: document.getElementById('trackProgress'),
  detail: document.getElementById('detail'), toggle: document.getElementById('toggle'),
  toggleIcon: document.querySelector('.toggle-icon'), toggleLabel: document.querySelector('.toggle-label')
};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let current = 0;
let playing = !reduceMotion;
let timer;

function render(index, announce = false) {
  const wrapping = index < current;
  current = index;
  const step = steps[index];
  elements.detail.setAttribute('aria-live', announce ? 'polite' : 'off');
  cards.forEach((card, cardIndex) => {
    card.classList.toggle('is-active', cardIndex === index);
    card.classList.toggle('is-past', cardIndex < index);
    if (cardIndex === index) card.setAttribute('aria-current', 'step');
    else card.removeAttribute('aria-current');
  });
  elements.number.textContent = String(index + 1).padStart(2, '0');
  elements.kind.textContent = step.kind;
  elements.title.textContent = step.title;
  elements.text.textContent = step.text;
  elements.condition.textContent = step.condition;
  elements.progress.textContent = `${String(index + 1).padStart(2, '0')} / 05`;
  elements.glyph.textContent = step.glyph;
  if (wrapping) elements.track.style.transition = 'none';
  elements.track.style.width = `${index * 25}%`;
  if (wrapping) window.requestAnimationFrame(() => elements.track.style.removeProperty('transition'));
}

function updateControls() {
  elements.toggleIcon.textContent = playing ? 'Ⅱ' : '▶';
  elements.toggleLabel.textContent = playing ? 'Пауза' : 'Запустить';
  elements.toggle.setAttribute('aria-label', playing ? 'Остановить анимацию' : 'Запустить анимацию');
}

function schedule() {
  window.clearInterval(timer);
  if (playing) timer = window.setInterval(() => render((current + 1) % steps.length), 2400);
  updateControls();
}

cards.forEach((card, index) => card.addEventListener('click', () => {
  playing = false;
  render(index, true);
  schedule();
}));
elements.toggle.addEventListener('click', () => {
  playing = !playing;
  schedule();
});
document.getElementById('restart').addEventListener('click', () => {
  render(0, true);
  playing = !reduceMotion;
  schedule();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) window.clearInterval(timer);
  else schedule();
});

render(0);
schedule();
