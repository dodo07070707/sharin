import { BOARD_CATEGORIES } from '../data';

export default function PostFormModal({ show, title, categoryInput, onCategoryChange, titleInput, onTitleChange, contentInput, onContentChange, onSubmit, onClose }) {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1c1c1e', borderRadius: 10, padding: 32, width: '100%', maxWidth: 460 }}>
        <h2 style={{ fontSize: 21, fontWeight: 600, margin: '0 0 20px' }}>{title}</h2>
        <select
          value={categoryInput}
          onChange={onCategoryChange}
          style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9999, fontSize: 14, marginBottom: 12, color: '#f5f5f7', background: '#1c1c1e' }}
        >
          {BOARD_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          value={titleInput}
          onChange={onTitleChange}
          placeholder="제목"
          style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9999, fontSize: 17, marginBottom: 12, outline: 'none', color: '#f5f5f7', background: 'transparent' }}
        />
        <textarea
          value={contentInput}
          onChange={onContentChange}
          placeholder="내용을 입력하세요"
          style={{ width: '100%', minHeight: 140, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 17, marginBottom: 16, outline: 'none', resize: 'none', color: '#f5f5f7', background: 'transparent' }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onSubmit} style={{ flex: 1, background: '#fa243c', color: '#ffffff', border: 'none', borderRadius: 9999, padding: '11px 22px', fontSize: 17, cursor: 'pointer' }}>등록</button>
          <button onClick={onClose} style={{ background: 'transparent', color: '#fa243c', border: '1px solid #fa243c', borderRadius: 9999, padding: '11px 22px', fontSize: 17, cursor: 'pointer' }}>취소</button>
        </div>
      </div>
    </div>
  );
}
