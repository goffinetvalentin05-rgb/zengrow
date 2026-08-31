import type { CategoryKind } from "../locales/types";

/**
 * Stylised mock previews for each category world. Purely decorative: no real
 * metrics, screenshots or third-party media.
 */
export function CategoryThumb({ kind }: { kind: CategoryKind }) {
  return (
    <div className={`go-thumb go-thumb--${kind}`} aria-hidden>
      <span className="go-thumb__wash" />
      {renderScene(kind)}
    </div>
  );
}

function renderScene(kind: CategoryKind) {
  switch (kind) {
    case "saas":
      return (
        <div className="go-thumb__app">
          <div className="go-thumb__chrome">
            <span />
            <span />
            <span />
          </div>
          <div className="go-thumb__app-body">
            <div className="go-thumb__rail">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="go-thumb__panel">
              <div className="go-thumb__kpis">
                <span />
                <span />
                <span />
              </div>
              <div className="go-thumb__bars">
                <i style={{ height: "38%" }} />
                <i style={{ height: "62%" }} />
                <i style={{ height: "48%" }} />
                <i style={{ height: "80%" }} />
                <i style={{ height: "66%" }} />
                <i style={{ height: "94%" }} />
              </div>
            </div>
          </div>
        </div>
      );

    case "ecommerce":
      return (
        <div className="go-thumb__store">
          <div className="go-thumb__product">
            <span className="go-thumb__bottle" />
            <span className="go-thumb__price" />
          </div>
          <div className="go-thumb__product go-thumb__product--alt">
            <span className="go-thumb__bottle" />
            <span className="go-thumb__price" />
          </div>
          <div className="go-thumb__cart">
            <i />
            <i />
          </div>
        </div>
      );

    case "agency":
      return (
        <div className="go-thumb__calls">
          <div className="go-thumb__tile go-thumb__tile--lead">
            <span className="go-thumb__face" />
          </div>
          <div className="go-thumb__tile">
            <span className="go-thumb__face" />
          </div>
          <div className="go-thumb__tile">
            <span className="go-thumb__face" />
          </div>
          <div className="go-thumb__tile">
            <span className="go-thumb__face" />
          </div>
        </div>
      );

    case "ofm":
      return (
        <div className="go-thumb__dm">
          <span className="go-thumb__bubble go-thumb__bubble--in" />
          <span className="go-thumb__bubble go-thumb__bubble--out" />
          <span className="go-thumb__bubble go-thumb__bubble--in go-thumb__bubble--short" />
          <span className="go-thumb__bubble go-thumb__bubble--out go-thumb__bubble--short" />
          <div className="go-thumb__counter">
            <i />
            <i />
          </div>
        </div>
      );

    case "creators":
      return (
        <div className="go-thumb__player">
          <span className="go-thumb__play" />
          <div className="go-thumb__scrub">
            <i />
          </div>
          <div className="go-thumb__reels">
            <span />
            <span />
            <span />
          </div>
        </div>
      );

    case "ai":
      return (
        <div className="go-thumb__prompt">
          <div className="go-thumb__prompt-field">
            <i />
            <span className="go-thumb__caret" />
          </div>
          <div className="go-thumb__stream">
            <i />
            <i />
            <i />
          </div>
          <div className="go-thumb__nodes">
            <span />
            <span />
            <span />
          </div>
        </div>
      );

    case "realestate":
      return (
        <div className="go-thumb__estate">
          <div className="go-thumb__tower">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="go-thumb__tower go-thumb__tower--short">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="go-thumb__listing">
            <i />
            <i />
          </div>
        </div>
      );

    case "marketing":
      return (
        <div className="go-thumb__chart">
          <svg viewBox="0 0 120 60" preserveAspectRatio="none">
            <polyline points="2,52 22,40 42,44 62,26 82,30 104,8" />
          </svg>
          <div className="go-thumb__funnel">
            <i />
            <i />
            <i />
          </div>
        </div>
      );

    case "sales":
      return (
        <div className="go-thumb__pipeline">
          <div className="go-thumb__column">
            <span />
            <span />
            <span />
          </div>
          <div className="go-thumb__column">
            <span />
            <span />
          </div>
          <div className="go-thumb__column go-thumb__column--won">
            <span />
          </div>
        </div>
      );

    case "freelancing":
      return (
        <div className="go-thumb__doc">
          <div className="go-thumb__doc-head">
            <i />
            <i />
          </div>
          <div className="go-thumb__doc-lines">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="go-thumb__doc-total">
            <i />
          </div>
        </div>
      );
  }
}
