export default function Hero({ onEnter }) {
  return (
    <section className="section inicio" id="inicio">
      <div className="container inicio__grid">
        <h1 className="inicio__title reveal">Portafolio <span>Pablo López</span></h1>
        <div className="wheel-wrap reveal">
          <img
            className="wheel"
            src="/assets/timon-f1.webp"
            alt="Volante de Fórmula 1 con controles y telemetría"
            width="913"
            height="627"
          />
          <button className="f1-trigger" type="button" aria-label="Entrar al portafolio" onClick={onEnter}>
            <span className="f1-trigger__ring f1-trigger__ring--outer" />
            <span className="f1-trigger__ring f1-trigger__ring--inner" />
            <span className="f1-trigger__core">F1</span>
          </button>
        </div>
      </div>
    </section>
  );
}
