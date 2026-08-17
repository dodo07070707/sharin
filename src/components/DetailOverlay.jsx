import { rankBadgeColor } from "../utils";
import { createReviewShareCard } from "../shareCard";

export default function DetailOverlay({
  sectionPadV,
  sectionPadH,
  displayFont,
  detail,
  onClose,
  onWriteReview,
}) {
  if (!detail) return null;

  const shareReview = async (rv) => {
    try {
      const blob = await createReviewShareCard({
        title: detail.title,
        artist: detail.artist,
        coverUrl: detail.imageUrl,
        starsStr: rv.starsStr,
        rating: rv.rating,
        ratingColor: rv.ratingColor,
        authorId: rv.userId,
        text: rv.text,
      });
      const file = new File([blob], "sharin-review.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sharin-review.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // user cancelled the share sheet, or card generation failed — no-op
    }
  };

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
          padding: `${sectionPadV} ${sectionPadH} calc(${sectionPadV} / 2)`,
        }}
      >
      <div
        style={{
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
        {rankBadgeColor(detail.rank) && (
          <div
            style={{
              display: "inline-block",
              background: rankBadgeColor(detail.rank),
              color: "#1d1d1f",
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 9999,
              padding: "5px 14px",
              marginBottom: 12,
            }}
          >
            차트 {detail.rank}위
          </div>
        )}
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
        <div style={{ color: detail.ratingColor, fontSize: 17, marginBottom: 6 }}>
          {detail.stars} {detail.avgFixed}
        </div>
        <div style={{ fontSize: 12, color: "#98989d", marginBottom: 24 }}>
          발매일 {detail.releaseDate}
          {detail.genre && <> · {detail.genre}</>} · 리뷰 {detail.reviewCount}개
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
          리뷰 작성
        </button>
      </div>
      </div>
      {detail.tracklist && detail.tracklist.length > 0 && (
        <div
          style={{
            padding: `calc(${sectionPadV} / 2) ${sectionPadH}`,
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
            트랙리스트
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            {detail.tracklist.map((t) => (
              <div
                key={t.trackNumber}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "left",
                }}
              >
                <span style={{ color: "#98989d", fontSize: 14, width: 24, flex: "none" }}>
                  {t.trackNumber}
                </span>
                <span style={{ fontSize: 15, color: "#f5f5f7" }}>{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        style={{
          background: "#1c1c1e",
          padding: `calc(${sectionPadV} / 2) ${sectionPadH} ${sectionPadV}`,
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
          리뷰 ({detail.reviewCount})
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
              <div style={{ color: rv.ratingColor, fontSize: 14, marginBottom: 8 }}>
                {rv.starsStr}
              </div>
              <div style={{ fontSize: 17, lineHeight: 1.47, marginBottom: 10 }}>
                {rv.text}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ color: "#98989d", fontSize: 12 }}>
                  <span onClick={rv.onClickAuthor} style={{ cursor: "pointer" }}>
                    {rv.userId}
                  </span>{" "}
                  · {rv.date}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => shareReview(rv)}
                    style={{
                      background: "transparent",
                      color: "#98989d",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8,
                      padding: "8px 15px",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    공유
                  </button>
                  {rv.canEdit && (
                    <>
                      <button
                        onClick={rv.onEdit}
                        style={{
                          background: "#2c2c2e",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 15px",
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={rv.onDelete}
                        style={{
                          background: "transparent",
                          color: "#98989d",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 8,
                          padding: "8px 15px",
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
