// Skeleton loader components for better user experience during loading states

export function SkeletonLoader({ 
  width = "100%", 
  height = "20px", 
  className = "",
  variant = "text",
  lines = 1,
  style = {}
}) {
  const baseClass = "skeleton";
  const className_str = `${baseClass} ${variant} ${className}`.trim();
  
  if (variant === "text" && lines > 1) {
    return (
      <div style={{ width, ...style }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={className_str}
            style={{
              height,
              marginBottom: i < lines - 1 ? "8px" : "0",
              width: i === lines - 1 ? "70%" : "100%"
            }}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div
      className={className_str}
      style={{ width, height, ...style }}
    />
  );
}

// Skeleton card component for product cards
export function SkeletonCard({ 
  titleLines = 1, 
  contentLines = 3,
  imageHeight = "120px" 
}) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SkeletonLoader 
        variant="rectangular" 
        height={imageHeight} 
        style={{ marginBottom: "1rem", borderRadius: ".5rem" }}
      />
      <SkeletonLoader lines={titleLines} height="24px" style={{ marginBottom: "0.5rem" }} />
      <SkeletonLoader lines={contentLines} height="16px" />
    </div>
  );
}

// Skeleton table component for data tables
export function SkeletonTable({ 
  rows = 5, 
  columns = 4 
}) {
  return (
    <div className="table" style={{ display: "grid", gap: "0.5rem" }}>
      {/* Table header */}
      <div className="table-head table-row" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "1rem",
        padding: ".75rem",
        background: "rgba(255,255,255,.05)",
        borderRadius: ".5rem"
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={`header-${i}`} height="20px" />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="table-row"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "1rem",
            padding: ".5rem",
            background: "var(--surface)",
            borderRadius: ".5rem"
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader 
              key={`cell-${rowIndex}-${colIndex}`} 
              height="20px" 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton grid component for product listings
export function SkeletonGrid({ 
  items = 6, 
  cardHeight = "200px" 
}) {
  return (
    <div className="grid-3" style={{
      display: "grid",
      gap: "1.5rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
    }}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="card" style={{ height: cardHeight, padding: "1.5rem" }}>
          <SkeletonLoader height="120px" style={{ marginBottom: "1rem", borderRadius: ".5rem" }} />
          <SkeletonLoader lines={2} height="20px" style={{ marginBottom: "0.5rem" }} />
          <SkeletonLoader height="16px" style={{ width: "60%" }} />
        </div>
      ))}
    </div>
  );
}

// Skeleton for forms
export function SkeletonForm({ fields = 3 }) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SkeletonLoader height="32px" style={{ width: "40%", marginBottom: "1.5rem" }} />
      
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: "1.5rem" }}>
          <SkeletonLoader height="18px" style={{ width: "20%", marginBottom: "0.5rem" }} />
          <SkeletonLoader height="44px" style={{ borderRadius: ".5rem" }} />
        </div>
      ))}
      
      <div className="actions" style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <SkeletonLoader height="44px" style={{ width: "120px", borderRadius: ".75rem" }} />
        <SkeletonLoader height="44px" style={{ width: "100px", borderRadius: ".75rem" }} />
      </div>
    </div>
  );
}

// Circle skeleton for avatars
export function SkeletonCircle({ size = "40px" }) {
  return (
    <SkeletonLoader
      width={size}
      height={size}
      variant="circular"
      style={{ borderRadius: "50%" }}
    />
  );
}

// Paragraph skeleton for text content
export function SkeletonParagraph({ 
  lines = 3, 
  lastLineWidth = "80%",
  lineHeight = "16px" 
}) {
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          height={lineHeight}
          style={{
            width: i === lines - 1 ? lastLineWidth : "100%",
            borderRadius: ".25rem"
          }}
        />
      ))}
    </div>
  );
}