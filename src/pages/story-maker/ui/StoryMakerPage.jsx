import { useEffect, useRef, useState } from "react";
import {
  renderStory,
  STORY_LAYOUTS,
  STORY_THEMES,
  DEFAULT_GLOW_COLORS,
  glowColorsFrom,
} from "../../../features/story-card";
import { saveStoryTemplate, loadStoryTemplate, saveStoryDraft, loadStoryDraft } from "../../../features/story-template";
import { shareOrDownloadImage, fileToSquareDataUrl } from "../../../shared/lib";
import ItemSearchModal from "../../../components/ItemSearchModal";
import CoverThumb from "../../../components/CoverThumb";
import { useItunesSearch, useIsMobile } from "../../../hooks";

const DEFAULT_LABELS = [
  "이달의 음악",
  "이달의 앨범",
  "이달의 디깅",
  "이달의 신곡",
  "이달의 K-pop",
  "이달의 J-pop",
  "이달의 EDM",
  "이달의 힙합",
];
const MAX_SLOTS = 8;

const emptySlot = (label = "") => ({ label, title: "", sub: "", artworkUrl: null });

function newDraft() {
  return {
    layout: "magazine",
    theme: "sunset",
    glowColors: DEFAULT_GLOW_COLORS,
    title: `${new Date().toLocaleString("en-US", { month: "long" })} Recap`,
    handle: "",
    slots: DEFAULT_LABELS.map(emptySlot),
  };
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 10,
  fontSize: 14,
  color: "#f5f5f7",
  background: "transparent",
  outline: "none",
  boxSizing: "border-box",
};

const sectionStyle = { display: "flex", flexDirection: "column", gap: 12 };
const fieldLabelStyle = { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#98989d" };

function pillStyle(active) {
  return {
    background: active ? "#ffffff" : "rgba(255,255,255,0.08)",
    color: active ? "#1d1d1f" : "#f5f5f7",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 9999,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };
}

function PillGroup({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {Object.entries(options).map(([key, opt]) => (
        <button key={key} aria-pressed={value === key} onClick={() => onChange(key)} style={pillStyle(value === key)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const SAVE_TEMPLATE_LABELS = { busy: "저장 중...", done: "저장됨", error: "저장 실패" };
const LOAD_TEMPLATE_LABELS = { busy: "불러오는 중...", done: "불러옴", empty: "저장된 형식 없음", error: "불러오기 실패" };
const SAVE_DRAFT_LABELS = { busy: "저장 중...", done: "임시저장됨", error: "저장 실패" };
const LOAD_DRAFT_LABELS = { busy: "불러오는 중...", done: "불러옴", empty: "임시저장 없음", error: "불러오기 실패" };

function GripIcon() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true">
      {[4, 10, 16].flatMap((y) => [<circle key={`l${y}`} cx="4" cy={y} r="1.6" />, <circle key={`r${y}`} cx="10" cy={y} r="1.6" />])}
    </svg>
  );
}

export default function StoryMakerPage({ user, onLoginClick, onBack, sectionPadV, sectionPadH, displayFont }) {
  // Not persisted on purpose: leaving the page and coming back starts a fresh story.
  const [story, setStory] = useState(newDraft);
  const [drawnStory, setDrawnStory] = useState(null);
  const [pickSlot, setPickSlot] = useState(null);
  const [searchType, setSearchType] = useState("song");
  const [query, setQuery] = useState("");
  const [templateSaveStatus, setTemplateSaveStatus] = useState("");
  const [templateLoadStatus, setTemplateLoadStatus] = useState("");
  const [draftSaveStatus, setDraftSaveStatus] = useState("");
  const [draftLoadStatus, setDraftLoadStatus] = useState("");
  const [coverError, setCoverError] = useState("");
  const previewRef = useRef(null);
  const slotScrollRef = useRef(null);
  const isMobile = useIsMobile();
  const { results, loading, error } = useItunesSearch(query, searchType, pickSlot !== null);

  // The signed-in user resolves after mount, so the handle is filled in once it's known.
  useEffect(() => {
    if (user && !story.handle) setStory((s) => ({ ...s, handle: `@${user.id}` }));
  }, [user, story.handle]);

  useEffect(() => {
    let cancelled = false;
    renderStory(story).then((canvas) => {
      if (cancelled || !previewRef.current) return;
      previewRef.current.getContext("2d").drawImage(canvas, 0, 0);
      setDrawnStory(story);
    });
    return () => {
      cancelled = true;
    };
    // isMobile swaps in a different layout tree, i.e. a fresh, blank preview canvas.
  }, [story, isMobile]);

  const update = (patch) => setStory((s) => ({ ...s, ...patch }));
  const updateSlot = (i, patch) =>
    setStory((s) => ({ ...s, slots: s.slots.map((slot, j) => (j === i ? { ...slot, ...patch } : slot)) }));
  const addSlot = () =>
    setStory((s) => (s.slots.length < MAX_SLOTS ? { ...s, slots: [...s.slots, emptySlot()] } : s));
  // The first slot is the hero, so at least one always stays.
  const removeSlot = (i) =>
    setStory((s) => (s.slots.length > 1 ? { ...s, slots: s.slots.filter((_, j) => j !== i) } : s));
  // Moves a slot to another position; whatever lands in slot 1 becomes the hero.
  const moveSlot = (from, to) =>
    setStory((s) => {
      const slots = [...s.slots];
      slots.splice(to, 0, ...slots.splice(from, 1));
      return { ...s, slots };
    });

  // Drag-to-reorder on each card's grip, built on pointer events so mouse and touch work
  // alike (native HTML drag-and-drop doesn't fire for touch on iPhone). The card under
  // the pointer swaps in live — and the preview with it — rather than dropping a ghost
  // at the end. While the pointer is held near the list's edge the list keeps scrolling
  // (a frame loop, since a finger held still sends no events), so a card can travel past
  // what's on screen — the phone carousel only ever shows one or two.
  const dragRef = useRef(null); // { index, pos } while dragging
  const [dragging, setDragging] = useState(null);
  const span = (r) => (isMobile ? [r.left, r.right] : [r.top, r.bottom]);
  const retarget = () => {
    const d = dragRef.current;
    for (const el of document.querySelectorAll("[data-slot]")) {
      const [start, end] = span(el.getBoundingClientRect());
      const to = Number(el.dataset.slot);
      if (d.pos >= start && d.pos <= end && to !== d.index) {
        moveSlot(d.index, to);
        d.index = to;
        setDragging(to);
        return;
      }
    }
  };
  const autoScroll = () => {
    const d = dragRef.current;
    const list = slotScrollRef.current;
    if (!d) return;
    if (list) {
      const [start, end] = span(list.getBoundingClientRect());
      const step = d.pos < start + 48 ? -12 : d.pos > end - 48 ? 12 : 0;
      if (step) {
        list.scrollBy(isMobile ? { left: step } : { top: step });
        retarget();
      }
    }
    requestAnimationFrame(autoScroll);
  };
  const onGripDown = (i) => (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index: i, pos: isMobile ? e.clientX : e.clientY };
    setDragging(i);
    requestAnimationFrame(autoScroll);
  };
  const onGripMove = (e) => {
    if (!dragRef.current) return;
    dragRef.current.pos = isMobile ? e.clientX : e.clientY;
    retarget();
  };
  const onGripUp = () => {
    dragRef.current = null;
    setDragging(null);
  };
  // The keyboard way to reorder: arrow keys on a focused grip, focus following the card.
  const onGripKey = (i) => (e) => {
    const dir = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
    const to = i + (dir ?? 0);
    if (!dir || to < 0 || to >= story.slots.length) return;
    e.preventDefault();
    moveSlot(i, to);
    requestAnimationFrame(() => document.querySelector(`[data-slot="${to}"] [data-grip]`)?.focus());
  };

  const onUploadCover = (i) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      updateSlot(i, { artworkUrl: await fileToSquareDataUrl(file) });
      setCoverError("");
    } catch {
      setCoverError("사진을 읽지 못했어요. 다른 사진으로 해 주세요.");
    }
  };

  const onPick = (r) => {
    updateSlot(pickSlot, { title: r.title, sub: r.artist, artworkUrl: r.artworkUrl });
    setPickSlot(null);
    setQuery("");
  };

  // Runs one account request (format or draft) with its button showing progress, and puts
  // the button back to its normal label a moment after it settles. Both are stored per
  // account, so a signed-out visitor is sent to log in instead.
  const runTemplateAction = (setStatus, request) => {
    if (!user) return onLoginClick();
    setStatus("busy");
    request(user.uid)
      .then((status) => setStatus(status || "done"), () => setStatus("error"))
      .finally(() => setTimeout(() => setStatus(""), 2000));
  };

  const onSaveTemplate = () => runTemplateAction(setTemplateSaveStatus, (uid) => saveStoryTemplate(uid, story));

  // Only the format comes back: the slot count follows the saved categories, while songs
  // already picked stay in their slots (any past the saved count are dropped). A layout
  // or theme that no longer exists is skipped rather than breaking the render.
  const onLoadTemplate = () =>
    runTemplateAction(setTemplateLoadStatus, (uid) =>
      loadStoryTemplate(uid).then((t) => {
        if (!t) return "empty";
        setStory((s) => ({
          ...s,
          layout: STORY_LAYOUTS[t.layout] ? t.layout : s.layout,
          theme: STORY_THEMES[t.theme] ? t.theme : s.theme,
          // Formats saved before the custom theme existed carry no colors.
          glowColors: t.glowColors?.length === DEFAULT_GLOW_COLORS.length ? t.glowColors : s.glowColors,
          slots: t.labels.slice(0, MAX_SLOTS).map((label, i) => ({ ...(s.slots[i] ?? emptySlot()), label })),
        }));
      })
    );

  // A draft is the whole story, songs and uploaded covers included. It's only restored on
  // request — coming back to the page still starts fresh.
  const onSaveDraft = () => runTemplateAction(setDraftSaveStatus, (uid) => saveStoryDraft(uid, story));
  const onLoadDraft = () =>
    runTemplateAction(setDraftLoadStatus, (uid) =>
      loadStoryDraft(uid).then((d) => {
        if (!d) return "empty";
        setStory((s) => ({
          ...s,
          layout: STORY_LAYOUTS[d.layout] ? d.layout : s.layout,
          theme: STORY_THEMES[d.theme] ? d.theme : s.theme,
          glowColors: d.glowColors?.length === DEFAULT_GLOW_COLORS.length ? d.glowColors : s.glowColors,
          title: d.title ?? s.title,
          handle: d.handle ?? s.handle,
          slots: d.slots?.length ? d.slots.slice(0, MAX_SLOTS).map((slot) => ({ ...emptySlot(), ...slot })) : s.slots,
        }));
      })
    );

  // The preview canvas is already the full-size story, so saving is just encoding it.
  const ready = drawnStory === story;
  const onSave = () => {
    previewRef.current.toBlob((blob) => blob && shareOrDownloadImage(blob, "sharin-story.png"), "image/png");
  };

  // On a phone the preview is capped by screen height (not width) so it stays in view
  // together with the swipeable slot cards below it while those are being edited.
  const preview = (
    <canvas
      ref={previewRef}
      width={1080}
      height={1920}
      role="img"
      aria-label="스토리 미리보기"
      style={{
        display: "block",
        borderRadius: isMobile ? 12 : 16,
        background: "#1c1c1e",
        ...(isMobile ? { height: "min(50svh, 560px)", width: "auto", margin: "0 auto" } : { width: "100%", height: "auto" }),
      }}
    />
  );

  const saveButton = (
    <button
      onClick={onSave}
      disabled={!ready}
      style={{
        width: "100%",
        background: "#fa243c",
        color: "#ffffff",
        border: "none",
        borderRadius: 9999,
        padding: "14px 22px",
        fontSize: 16,
        fontWeight: 600,
        cursor: ready ? "pointer" : "default",
        opacity: ready ? 1 : 0.6,
      }}
    >
      {ready ? "이미지 저장" : "그리는 중..."}
    </button>
  );

  const draftButtonStyle = { ...pillStyle(false), flex: 1, padding: "10px 14px", fontSize: 13 };
  const draftButtons = (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onSaveDraft} disabled={draftSaveStatus === "busy"} style={draftButtonStyle}>
        {SAVE_DRAFT_LABELS[draftSaveStatus] ?? "임시저장"}
      </button>
      <button onClick={onLoadDraft} disabled={draftLoadStatus === "busy"} style={draftButtonStyle}>
        {LOAD_DRAFT_LABELS[draftLoadStatus] ?? "임시저장 불러오기"}
      </button>
    </div>
  );

  const settings = (
    <>
      <section style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>레이아웃</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onSaveTemplate}
              disabled={templateSaveStatus === "busy"}
              style={{ ...pillStyle(false), padding: "8px 14px", fontSize: 13 }}
            >
              {SAVE_TEMPLATE_LABELS[templateSaveStatus] ?? "형식 저장"}
            </button>
            <button
              onClick={onLoadTemplate}
              disabled={templateLoadStatus === "busy"}
              style={{ ...pillStyle(false), padding: "8px 14px", fontSize: 13 }}
            >
              {LOAD_TEMPLATE_LABELS[templateLoadStatus] ?? "불러오기"}
            </button>
          </div>
        </div>
        <PillGroup label="레이아웃" options={STORY_LAYOUTS} value={story.layout} onChange={(layout) => update({ layout })} />
      </section>
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>색 테마</h2>
        <PillGroup label="색 테마" options={STORY_THEMES} value={story.theme} onChange={(theme) => update({ theme })} />
        {STORY_THEMES[story.theme].customGlows && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            {/* One pick sets all three; the individual swatches after it fine-tune. */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#f5f5f7" }}>
              <input
                type="color"
                value={story.glowColors[0]}
                onChange={(e) => update({ glowColors: glowColorsFrom(e.target.value) })}
                style={{ width: 44, height: 44, padding: 0, border: "none", borderRadius: 10, background: "none", cursor: "pointer" }}
              />
              기준 색
            </label>
            <span aria-hidden="true" style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
            {story.glowColors.map((color, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#98989d" }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) =>
                    update({ glowColors: story.glowColors.map((c, j) => (j === i ? e.target.value : c)) })
                  }
                  style={{ width: 44, height: 44, padding: 0, border: "none", borderRadius: 10, background: "none", cursor: "pointer" }}
                />
                색 {i + 1}
              </label>
            ))}
          </div>
        )}
      </section>
      <section style={sectionStyle}>
        <label style={fieldLabelStyle}>
          제목
          <input value={story.title} onChange={(e) => update({ title: e.target.value })} style={inputStyle} />
        </label>
        <label style={fieldLabelStyle}>
          아이디
          <input value={story.handle} onChange={(e) => update({ handle: e.target.value })} style={inputStyle} />
        </label>
      </section>
    </>
  );

  const slotCards = story.slots.map((slot, i) => (
    <div
      key={i}
      data-slot={i}
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "12px 12px 12px 4px",
        border: `1px solid ${dragging === i ? "#fa243c" : "rgba(255,255,255,0.15)"}`,
        background: dragging === i ? "rgba(255,255,255,0.06)" : "transparent",
        borderRadius: 10,
        boxSizing: "border-box",
        ...(isMobile && { flex: "0 0 86%", scrollSnapAlign: "center" }),
      }}
    >
      <button
        data-grip
        onPointerDown={onGripDown(i)}
        onPointerMove={onGripMove}
        onPointerUp={onGripUp}
        onPointerCancel={onGripUp}
        onKeyDown={onGripKey(i)}
        aria-label={`${i + 1}번 순서 바꾸기 (드래그하거나 화살표 키)`}
        style={{
          flex: "none",
          alignSelf: "stretch",
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
          background: "none",
          border: "none",
          color: "#98989d",
          cursor: dragging === i ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <GripIcon />
      </button>
      <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <CoverThumb size={56} radius={8} fontSize={6} imageUrl={slot.artworkUrl} />
        <span style={{ fontSize: 11, color: "#98989d" }}>
          {i + 1} / {story.slots.length}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <input
          aria-label={`${i + 1}번 카테고리`}
          placeholder="카테고리"
          value={slot.label}
          onChange={(e) => updateSlot(i, { label: e.target.value })}
          style={{ ...inputStyle, padding: "6px 12px", fontSize: 12, color: "#98989d" }}
        />
        <input
          aria-label={`${i + 1}번 제목`}
          placeholder="제목"
          value={slot.title}
          onChange={(e) => updateSlot(i, { title: e.target.value })}
          style={{ ...inputStyle, padding: "6px 12px" }}
        />
        <input
          aria-label={`${i + 1}번 부제`}
          placeholder="아티스트"
          value={slot.sub}
          onChange={(e) => updateSlot(i, { sub: e.target.value })}
          style={{ ...inputStyle, padding: "6px 12px", fontSize: 13 }}
        />
      </div>
      <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <button onClick={() => setPickSlot(i)} style={{ ...pillStyle(false), padding: "10px 16px" }}>
          검색
        </button>
        <label style={{ ...pillStyle(false), padding: "6px 12px", fontSize: 12, position: "relative" }}>
          사진
          {/* Transparent over the label rather than display:none, so it stays focusable. */}
          <input
            type="file"
            accept="image/*"
            aria-label={`${i + 1}번 커버 사진 올리기`}
            onChange={onUploadCover(i)}
            style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer" }}
          />
        </label>
        {story.slots.length > 1 && (
          <button
            onClick={() => removeSlot(i)}
            aria-label={`${i + 1}번 삭제`}
            style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", color: "#98989d", fontSize: 12 }}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  ));

  const coverErrorNote = coverError && (
    <p role="alert" style={{ color: "#ff453a", fontSize: 13, margin: 0 }}>
      {coverError}
    </p>
  );

  const canAddSlot = story.slots.length < MAX_SLOTS;
  const addSlotButton = canAddSlot && (
    <button
      onClick={addSlot}
      style={{
        background: "transparent",
        color: "#f5f5f7",
        border: "1px dashed rgba(255,255,255,0.25)",
        borderRadius: 10,
        padding: 14,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        ...(isMobile && { flex: "0 0 40%", scrollSnapAlign: "center" }),
      }}
    >
      + 음악 추가 ({story.slots.length}/{MAX_SLOTS})
    </button>
  );

  return (
    <div data-screen-label="스토리" style={{ padding: `${sectionPadV} ${sectionPadH}` }}>
      <button
        onClick={onBack}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#fa243c", fontSize: 14 }}
      >
        ← 뒤로가기
      </button>
      <h1 style={{ fontSize: displayFont, fontWeight: 600, margin: "16px 0 8px" }}>스토리 만들기</h1>
      <p style={{ color: "#98989d", fontSize: 15, margin: isMobile ? "0 0 20px" : "0 0 32px" }}>
        이달의 음악을 골라 인스타그램 스토리 이미지로 저장하세요.
      </p>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {preview}
          {coverErrorNote}
          <section aria-label="음악" style={{ margin: `0 calc(-1 * ${sectionPadH})` }}>
            {/* Bleeds to the screen edges so the next card peeks in, hinting it can be swiped. */}
            <div
              ref={slotScrollRef}
              style={{
                display: "flex",
                gap: 10,
                overflowX: "auto",
                // Snapping would pull the list back while a drag is scrolling it.
                scrollSnapType: dragging === null ? "x mandatory" : "none",
                scrollbarWidth: "none",
                padding: `0 ${sectionPadH}`,
                scrollPaddingInline: sectionPadH,
              }}
            >
              {slotCards}
              {addSlotButton}
            </div>
          </section>
          <details style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px" }}>
            <summary style={{ fontSize: 15, fontWeight: 600, cursor: "pointer" }}>디자인 설정</summary>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>{settings}</div>
          </details>
          {saveButton}
          {draftButtons}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
          <div style={{ width: "min(100%, 360px)", display: "flex", flexDirection: "column", gap: 16 }}>
            {preview}
            {saveButton}
            {draftButtons}
          </div>
          {/* The form scrolls inside its own box (without handing leftover scroll to the
              page). Its content is taken out of flow, so the row is exactly as tall as the
              preview column and the box ends level with the save button; minHeight covers
              narrower windows where the form wraps below the preview. */}
          <div style={{ flex: 1, minWidth: 280, minHeight: 480, position: "relative" }}>
            <div
              ref={slotScrollRef}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                gap: 24,
                overflowY: "auto",
                overscrollBehavior: "contain",
                scrollbarWidth: "none",
              }}
            >
              {settings}
              <section style={sectionStyle}>
                <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>음악</h2>
                {coverErrorNote}
                {slotCards}
                {addSlotButton}
              </section>
            </div>
          </div>
        </div>
      )}

      <ItemSearchModal
        show={pickSlot !== null}
        entityType={searchType}
        onEntityChange={setSearchType}
        query={query}
        onQueryChange={setQuery}
        results={results}
        loading={loading}
        error={error}
        onAdd={onPick}
        onClose={() => setPickSlot(null)}
      />
    </div>
  );
}
