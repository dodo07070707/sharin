import { BOARD_CATEGORIES } from '../data';
import PostItemCard from './PostItemCard';

export default function PostFormModal({
  show,
  title,
  categoryInput,
  onCategoryChange,
  titleInput,
  onTitleChange,
  blocks,
  onBlockTextChange,
  onRemoveBlock,
  onAddItem,
  onSubmit,
  onClose,
}) {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1c1c1e', borderRadius: 10, padding: 32, width: '100%', maxWidth: 520, maxHeight: '86vh', overflowY: 'auto', boxSizing: 'border-box' }}>
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
          style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9999, fontSize: 17, marginBottom: 16, outline: 'none', color: '#f5f5f7', background: 'transparent' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {blocks.map((block) => (
            <div key={block.id}>
              {block.type === 'item' ? (
                <PostItemCard block={block} onRemove={() => onRemoveBlock(block.id)} />
              ) : (
                <textarea
                  value={block.text}
                  onChange={(e) => onBlockTextChange(block.id, e.target.value)}
                  placeholder="내용을 입력하세요"
                  style={{ width: '100%', minHeight: 100, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 17, outline: 'none', resize: 'vertical', color: '#f5f5f7', background: 'transparent', boxSizing: 'border-box' }}
                />
              )}
              <button
                type="button"
                onClick={() => onAddItem(block.id)}
                style={{ width: '100%', marginTop: 6, background: 'rgba(255,255,255,0.08)', color: '#f5f5f7', border: '1px dashed rgba(255,255,255,0.25)', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                + 여기에 곡·앨범 추가
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onSubmit} style={{ flex: 1, background: '#fa243c', color: '#ffffff', border: 'none', borderRadius: 9999, padding: '11px 22px', fontSize: 17, cursor: 'pointer' }}>등록</button>
          <button onClick={onClose} style={{ background: 'transparent', color: '#fa243c', border: '1px solid #fa243c', borderRadius: 9999, padding: '11px 22px', fontSize: 17, cursor: 'pointer' }}>취소</button>
        </div>
      </div>
    </div>
  );
}
