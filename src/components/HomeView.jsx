import CoverThumb from "./CoverThumb";

function ChartStrip({ title, rows, sectionPadH }) {
  return (
    <div style={{ marginTop: title === "TOP 곡" ? 12 : 0 }}>
      <div
        style={{
          color: "#98989d",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          padding: `12px ${sectionPadH} 24px`,
          margin: `0 calc(-1 * ${sectionPadH})`,
        }}
      >
        {rows.map((row) => (
          <div
            key={row.id}
            onClick={row.onOpen}
            style={{ flex: "none", width: 140, cursor: "pointer" }}
          >
            <CoverThumb
              size={140}
              radius={10}
              fontSize={7}
              label={row.coverLabel}
              imageUrl={row.imageUrl}
              badge={
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: row.ratingBg,
                    color: row.ratingColor,
                    border: row.ratingBorder,
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    padding: "2px 6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ★ {row.avgFixed}
                </div>
              }
            />
            <div
              style={{
                marginTop: 10,
                color: "#cccccc",
                fontSize: 12,
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.artist}
            </div>
            <div
              style={{
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeView({
  sectionPadV,
  sectionPadH,
  homeColGrid,
  displayFont,
  homeChartSongs,
  homeChartAlbums,
  homeRecentReviews,
  homeRecentPosts,
  onGoChart,
  onGoReviews,
  onGoBoard,
}) {
  return (
    <div data-screen-label="홈">
      <div
        style={{
          background: "#1d1d1f",
          padding: `${sectionPadV} ${sectionPadH} 8px`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                color: "#ffffff",
                fontSize: displayFont,
                fontWeight: 600,
                margin: "0 0 6px",
              }}
            >
              차트
            </h1>
            <div style={{ color: "#98989d", fontSize: 13 }}>
              사이트 리뷰 평점 평균 기준
            </div>
          </div>
          <span
            onClick={onGoChart}
            style={{
              color: "#ffffff",
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            전체보기 →
          </span>
        </div>
        <ChartStrip
          title="TOP 곡"
          rows={homeChartSongs}
          sectionPadH={sectionPadH}
        />
        <ChartStrip
          title="TOP 앨범"
          rows={homeChartAlbums}
          sectionPadH={sectionPadH}
        />
      </div>

      <div
        style={{
          background: "#1c1c1e",
          padding: `${sectionPadV} ${sectionPadH}`,
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: homeColGrid, gap: 40 }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>리뷰</h2>
              <span
                onClick={onGoReviews}
                style={{ color: "#ffffff", fontSize: 13, cursor: "pointer" }}
              >
                더보기 →
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {homeRecentReviews.map((rv) => (
                <div
                  key={rv.id}
                  onClick={rv.onOpenItem}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <CoverThumb
                    size={44}
                    radius={10}
                    fontSize={6}
                    label={rv.coverLabel}
                    imageUrl={rv.imageUrl}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          background: rv.typeBg,
                          color: rv.typeColor,
                          border: rv.typeBorder,
                          fontSize: 10,
                          fontWeight: 600,
                          borderRadius: 5,
                          padding: "2px 6px",
                        }}
                      >
                        {rv.typeText}
                      </span>
                      <span
                        style={{
                          background: rv.ratingBg,
                          color: rv.ratingColor,
                          border: rv.ratingBorder,
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 5,
                          padding: "1px 5px",
                        }}
                      >
                        ★ {rv.rating}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#f5f5f7",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {rv.itemTitle}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#e5e5ea",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      "{rv.text}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>
                게시글
              </h2>
              <span
                onClick={onGoBoard}
                style={{ color: "#ffffff", fontSize: 13, cursor: "pointer" }}
              >
                더보기 →
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {homeRecentPosts.map((pt) => (
                <div
                  key={pt.id}
                  onClick={pt.onOpen}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <CoverThumb
                    size={44}
                    radius={10}
                    fontSize={6}
                    label={pt.coverLabel}
                    imageUrl={pt.imageUrl}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          background: "#1c1c1e",
                          color: "#c7c7cc",
                          fontSize: 10,
                          fontWeight: 600,
                          borderRadius: 5,
                          padding: "2px 6px",
                        }}
                      >
                        {pt.category}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#f5f5f7",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {pt.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#98989d" }}>
                      {pt.author} · {pt.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
