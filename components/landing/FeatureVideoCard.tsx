export function FeatureVideoCard({
  title,
  description,
  mediaSrc,
  poster,
}: {
  title: string;
  description: string;
  mediaSrc?: string;
  poster?: string;
}) {
  return (
    <article className="go-feature-card">
      <div className="go-feature-card__media">
        {mediaSrc ? (
          <video src={mediaSrc} poster={poster} muted playsInline preload="metadata" />
        ) : (
          <div className="go-feature-card__placeholder" />
        )}
      </div>
      <div className="go-feature-card__copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
