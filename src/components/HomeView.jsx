import CoverThumb from "./CoverThumb";
import { itemHref, boardHref, navClick, rankBadgeColor, reviewTimestampStr } from "../utils";

function ChartStrip({ title, rows }) {
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 20,
          padding: "12px 0 24px",
        }}
      >
        {rows.map((row) => (
          <a
            key={row.id}
            href={itemHref(row.id)}
            onClick={navClick(row.onOpen)}
            style={{ minWidth: 0, cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}
          >
            <div style={{ width: "100%", aspectRatio: "1 / 1" }}>
            <CoverThumb
              size="100%"
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
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 6,
                    padding: "3px 7px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ★ {row.avgFixed}
                </div>
              }
            >
              {rankBadgeColor(row.rank) && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: rankBadgeColor(row.rank),
                    color: "#1d1d1f",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {row.rank}
                </div>
              )}
            </CoverThumb>
            </div>
            <div
              style={{
                marginTop: 10,
                color: "#cccccc",
                fontSize: 13,
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
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.title}
            </div>
          </a>
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
        <ChartStrip title="TOP 곡" rows={homeChartSongs} />
        <ChartStrip title="TOP 앨범" rows={homeChartAlbums} />
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
                <a
                  key={rv.id}
                  href={itemHref(rv.itemId)}
                  onClick={navClick(rv.onOpenItem)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit",
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
                      {rv.text}
                    </div>
                    <div style={{ fontSize: 11, color: "#98989d", marginTop: 3 }}>
                      {rv.userId} · {reviewTimestampStr(rv)}
                    </div>
                  </div>
                </a>
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
                <a
                  key={pt.id}
                  href={boardHref(pt.id)}
                  onClick={navClick(pt.onOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit",
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
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          pt.onClickAuthor();
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {pt.author}
                      </span>{" "}
                      · {pt.date}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
