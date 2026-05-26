export const BrandLogo = ({ compact = false, inverse = false }) => (
  <div className={`brand-logo ${compact ? "compact" : ""} ${inverse ? "inverse" : ""}`} aria-label="Focused Flow">
    <img src="/focused-flow-dark-logo.png" alt="Focused Flow" />
  </div>
);
