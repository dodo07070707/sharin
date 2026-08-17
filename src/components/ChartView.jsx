import CoverThumb from "./CoverThumb";

export default function ChartView({
  sectionPadV,
  sectionPadH,
  displayFont,
  chartType,
  onSetChartType,
  chartList,
}) {
  const toggles = [
    { key: "song", label: "곡" },
    { key: "album", label: "앨범" },
  ];
  return (
    <div
      data-screen-label="차트"
      style={{ padding: `${sectionPadV} ${sectionPadH}` }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h1 style={{ fontSize: displayFont, fontWeight: 600, margin: 0 }}>
          차트
        </h1>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {toggles.map((tg) => (
            <button
              key={tg.key}
              onClick={() => onSetChartType(tg.key)}
              style={{
                background:
                  chartType === tg.key ? "#ffffff" : "rgba(255,255,255,0.08)",
                color: chartType === tg.key ? "#1d1d1f" : "#f5f5f7",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 9999,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tg.label}
            </button>
          ))}

        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {chartList.map((row) => (
          <div
            key={row.id}
            onClick={row.onOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: "#1c1c1e",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: "16px 24px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontSize: 21,
                fontWeight: 600,
                color: "#98989d",
                width: 32,
                flex: "none",
              }}
            >
              {row.rank}
            </div>
            <CoverThumb
              size={56}
              radius={30}
              fontSize={8}
              label={row.coverLabel}
              imageUrl={row.imageUrl}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{row.title}</div>
              <div style={{ fontSize: 14, color: "#98989d" }}>{row.artist}</div>
            </div>
            <div style={{ textAlign: "right", flex: "none" }}>
              <div style={{ color: "#fa243c", fontSize: 14 }}>
                {row.starsStr} {row.avgFixed}
              </div>
              <div style={{ fontSize: 12, color: "#98989d" }}>
                리뷰 {row.reviewCount}개
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
