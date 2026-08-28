import CoverThumb from "./CoverThumb";
import { itemHref, navClick, reviewTimestampStr, truncate } from "../utils";

export default function ReviewsView({
  sectionPadV,
  sectionPadH,
  displayFont,
  reviewType,
  onSetReviewType,
  reviewQuery,
  onSetReviewQuery,
  reviewFlat,
  onOpenReviewFormNew,
}) {
  const toggles = [
    { key: "song", label: "곡" },
    { key: "album", label: "앨범" },
  ];
  return (
    <div
      data-screen-label="리뷰 목록"
      style={{ padding: `${sectionPadV} ${sectionPadH}` }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h1 style={{ fontSize: displayFont, fontWeight: 600, margin: 0 }}>
          리뷰
        </h1>
        <button
          onClick={onOpenReviewFormNew}
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
          리뷰 작성
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {toggles.map((tg) => (
          <button
            key={tg.key}
            onClick={() => onSetReviewType(tg.key)}
            style={{
              background:
                reviewType === tg.key ? "#ffffff" : "rgba(255,255,255,0.08)",
              color: reviewType === tg.key ? "#1d1d1f" : "#f5f5f7",
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
        <div
          style={{
            position: "relative",
            flex: "1 1 200px",
            minWidth: 160,
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            value={reviewQuery}
            onChange={(e) => onSetReviewQuery(e.target.value)}
            placeholder={
              reviewType === "song"
                ? "곡 제목 또는 아티스트 검색"
                : "앨범 제목 또는 아티스트 검색"
            }
            style={{
              width: "100%",
              padding: reviewQuery ? "10px 38px 10px 18px" : "10px 18px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 9999,
              fontSize: 14,
              color: "#f5f5f7",
              background: "transparent",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {reviewQuery && (
            <button
              onClick={() => onSetReviewQuery("")}
              aria-label="검색어 지우기"
              style={{
                position: "absolute",
                right: 6,
                background: "transparent",
                color: "#98989d",
                border: "none",
                borderRadius: 9999,
                width: 28,
                height: 28,
                fontSize: 16,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {reviewFlat.length === 0 && (
          <p style={{ color: "#98989d", fontSize: 14, margin: 0 }}>
            {reviewQuery.trim()
              ? `'${reviewQuery.trim()}' 검색 결과가 없어요.`
              : "아직 리뷰가 없어요."}
          </p>
        )}
        {reviewFlat.map((rv) => (
          <div
            key={rv.id}
            style={{
              display: "flex",
              gap: 14,
              background: "#1c1c1e",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: "20px 24px",
            }}
          >
            <a href={itemHref(rv.itemId)} onClick={navClick(rv.onOpenItem)} style={{ cursor: "pointer" }}>
              <CoverThumb
                size={48}
                radius={12}
                fontSize={6}
                label={rv.coverLabel}
                imageUrl={rv.imageUrl}
              />
            </a>
            <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href={itemHref(rv.itemId)}
                onClick={navClick(rv.onOpenItem)}
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#f5f5f7",
                  marginBottom: 8,
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                {rv.itemTitle} · {rv.itemArtist}
              </a>
              <div style={{ color: rv.ratingColor, fontSize: 14, marginBottom: 8 }}>
                {rv.starsStr} {rv.rating.toFixed(1)}
              </div>
              {rv.text && (
                <div style={{ fontSize: 17, lineHeight: 1.47, marginBottom: 10 }}>
                  {truncate(rv.text)}
                </div>
              )}
              <div style={{ color: "#98989d", fontSize: 12 }}>
                <span onClick={rv.onClickAuthor} style={{ cursor: "pointer" }}>
                  {rv.userId}
                </span>{" "}
                · {reviewTimestampStr(rv)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
