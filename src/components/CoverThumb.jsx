export default function CoverThumb({
  size = 44,
  radius = 10,
  fontSize = 6,
  label = "",
  imageUrl,
  badge,
  children,
}) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flex: "none",
        borderRadius: radius,
        background: "#2c2c2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            fontFamily: "monospace",
            fontSize,
            color: "#98989d",
            textAlign: "center",
          }}
        >
          {label}
        </span>
      )}
      {badge}
      {children}
    </div>
  );
}
