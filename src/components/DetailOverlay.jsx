export default function DetailOverlay({
  sectionPadV,
  sectionPadH,
  displayFont,
  detail,
  onClose,
  onWriteReview,
}) {
  if (!detail) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#1c1c1e",
        zIndex: 50,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: `20px ${sectionPadH}`,
          borderBottom: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <span
          onClick={onClose}
          style={{ cursor: "pointer", fontSize: 14, color: "#fa243c" }}
        >
          ← 뒤로가기
        </span>
      </div>
      <div
        style={{
          padding: `${sectionPadV} ${sectionPadH}`,
          maxWidth: 640,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            margin: "0 auto 24px",
            borderRadius: 30,
            background: "#2c2c2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {detail.imageUrl ? (
            <img
              src={detail.imageUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#98989d",
              }}
            >
              {detail.coverLabel}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#98989d", marginBottom: 8 }}>
          {detail.typeLabel}
        </div>
        <h1
          style={{
            fontSize: displayFont,
            fontWeight: 600,
            margin: "0 0 6px",
            letterSpacing: "-0.374px",
          }}
        >
          {detail.title}
        </h1>
        <div style={{ fontSize: 17, color: "#c7c7cc", marginBottom: 16 }}>
          {detail.artist}
        </div>
        <div style={{ color: "#fa243c", fontSize: 17, marginBottom: 6 }}>
          {detail.stars} {detail.avgFixed}
        </div>
        <div style={{ fontSize: 12, color: "#98989d", marginBottom: 24 }}>
          발매일 {detail.releaseDate} · 리뷰 {detail.reviewCount}개
        </div>
        <button
          onClick={onWriteReview}
          style={{
            background: "#fa243c",
            color: "#ffffff",
            border: "none",
            borderRadius: 9999,
            padding: "11px 22px",
            fontSize: 17,
            cursor: "pointer",
          }}
        >
          한줄평 작성
        </button>
      </div>
      <div
        style={{
          background: "#1c1c1e",
          padding: `${sectionPadV} ${sectionPadH}`,
        }}
      >
        <h2
          style={{
            fontSize: 21,
            fontWeight: 600,
            margin: "0 auto 20px",
            maxWidth: 640,
          }}
        >
          한줄평 ({detail.reviewCount})
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 640,
            margin: "0 auto",
          }}
        >
          {detail.reviews.map((rv) => (
            <div
              key={rv.id}
              style={{
                background: "#1c1c1e",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "20px 24px",
              }}
            >
              <div style={{ color: "#fa243c", fontSize: 14, marginBottom: 8 }}>
                {rv.starsStr}
              </div>
              <div style={{ fontSize: 17, lineHeight: 1.47, marginBottom: 10 }}>
                "{rv.text}"
              </div>
              <div style={{ color: "#98989d", fontSize: 12 }}>
                {rv.userId} · {rv.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
