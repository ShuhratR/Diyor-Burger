export default function MenuLoading() {
  return <section className="section menu-reference menu-loading" aria-label="Загрузка меню" aria-busy="true">
    <div className="menu-heading"><h1>Меню</h1><p>Вкусная еда для любого настроения!</p></div>
    <div className="menu-loading-categories" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div>
    <div className="menu-product-grid menu-loading-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div className="menu-loading-card" key={index}><i /><span /><b /></div>)}</div>
  </section>;
}
