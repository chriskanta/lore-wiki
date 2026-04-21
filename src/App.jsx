import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

const PASSWORD = 'AnniraKuris'

const ERAS = [
  { name: 'The Age of Conflict', colour: '#7a3a3a', dimColour: '#3a1a1a' },
  { name: 'The Pact', colour: '#7a6a3a', dimColour: '#3a3018' },
  { name: 'The Fracture', colour: '#4a6a7a', dimColour: '#1a3040' },
]

const FIELDS = {
  characters: ['name', 'description', 'appearance', 'abilities', 'status', 'affiliation', 'relationships', 'hair', 'eyes', 'build', 'tags'],
  locations: ['name', 'description', 'geography', 'significance', 'tags'],
  lore: ['name', 'description', 'category', 'tags'],
  factions: ['name', 'description', 'leader', 'members', 'tags'],
}

const INFOBOX_FIELDS = {
  characters: ['status', 'affiliation', 'relationships', 'hair', 'eyes', 'build'],
  locations: ['significance'],
  lore: ['category'],
  factions: ['leader'],
}

const MAIN_FIELDS = {
  characters: ['description', 'appearance', 'abilities'],
  locations: ['description', 'geography'],
  lore: ['description'],
  factions: ['description'],
}

const SECTION_DESCRIPTIONS = {
  characters: 'A record of those who have shaped the course of events — warriors, heirs, and those caught between.',
  locations: 'The lands, settlements, and places of significance across the known world.',
  lore: 'The histories, factions, and forces that underpin the world as it is known.',
  factions: 'The clans, orders, and factions whose ambitions have shaped the course of history.',
}

const EXAMPLE_CHARACTER = {
  id: '__example__',
  name: 'Soran Vael',
  status: 'Deceased',
  affiliation: 'The Grey Order',
  relationships: 'Kuris (Mentor)\nAnnira (Acquaintance)\nUnknown Commander (Killer)',
  hair: 'Silver-white, cropped close at the sides, longer on top',
  eyes: 'Grey, with a faint luminescence when Seiki is active',
  build: 'Lean and tall, broad-shouldered despite his age',
  tags: 'grey order, deceased, seiki master, mentor',
  description: `Soran Vael was a senior archivist of the Grey Order and one of the last practitioners of the Veil technique — a Seiki discipline focused entirely on concealment and misdirection rather than force. He was not a warrior in the conventional sense, though those who underestimated him on that basis did not make the mistake twice.

He spent the latter years of his life documenting the emerging conflict between the clans, believing that what was coming would be unlike anything the order had recorded before. His notes form the basis of much of what is contained in this archive.

He was killed during the fall of the eastern outpost, the circumstances of which remain disputed. His body was never recovered.`,
  appearance: `Vael was an older man of striking appearance — the kind of face that had clearly been handsome in youth and had aged into something more interesting. His silver hair and pale grey eyes gave him an almost spectral quality, an impression he was not above using to unsettle those he negotiated with.

He dressed plainly by the standards of the Grey Order, preferring undyed travelling clothes to ceremonial robes. He carried no visible weapon. Those who knew him well noted that he was never still — always watching, always cataloguing, with the quiet alertness of someone who had survived long enough to know that safety is an illusion.`,
  abilities: `Vael was a master of Seiki Suppression and Flow, with a particular specialisation in what practitioners of the Grey Order called the Veil — the ability to render one's Seiki signature invisible to other users. In practice this meant he could move through spaces where Seiki-sensitive individuals were present without being detected, a rare and difficult skill that took decades to develop.

He was also a capable teacher, known for adapting his instruction to the student rather than expecting the student to adapt to him. His methods were unconventional. His results were not.`,
  image_url: null,
}

const s = {
  page: { minHeight: '100vh', background: '#0f0f0f', color: '#d4c9b0', fontFamily: 'Georgia, serif' },
  nav: { borderBottom: '1px solid #2a2a2a', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: '#111', position: 'relative' },
  navTitle: { fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#d4c9b0', padding: '1rem 0', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.05em', whiteSpace: 'nowrap' },
  navLink: { color: '#9a8f7a', fontSize: '0.9rem', cursor: 'pointer', padding: '1rem 0', borderBottom: '2px solid transparent', whiteSpace: 'nowrap' },
  navLinkActive: { color: '#d4c9b0', borderBottom: '2px solid #8b7355' },
  container: { maxWidth: '960px', margin: '0 auto', padding: '3rem 2rem' },
  hr: { border: 'none', borderTop: '1px solid #2a2a2a', margin: '2rem 0' },
  tag: { display: 'inline-block', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '3px', padding: '0.15rem 0.5rem', fontSize: '0.8rem', color: '#9a8f7a', marginRight: '0.4rem', marginBottom: '0.3rem' },
  entryCard: { borderBottom: '1px solid #1e1e1e', padding: '1rem 0', cursor: 'pointer' },
  input: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#d4c9b0', fontFamily: 'Georgia, serif', fontSize: '0.95rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#d4c9b0', fontFamily: 'Georgia, serif', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' },
  btnPrimary: { padding: '0.4rem 1rem', background: '#2a2a2a', color: '#d4c9b0', border: '1px solid #3a3a3a', borderRadius: '3px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' },
  btnDanger: { padding: '0.4rem 1rem', background: 'transparent', color: '#8b3a3a', border: '1px solid #5a2a2a', borderRadius: '3px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' },
  label: { display: 'block', marginBottom: '0.3rem', color: '#6b6357', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sectionLink: { display: 'block', padding: '1.2rem 1.5rem', background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', marginBottom: '1rem', cursor: 'pointer' },
  infobox: { float: 'right', width: '260px', marginLeft: '2rem', marginBottom: '1rem', background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', overflow: 'hidden' },
  infoboxHeader: { background: '#1e1a14', padding: '0.6rem 1rem', borderBottom: '1px solid #2a2a2a', textAlign: 'center' },
  infoboxRow: { padding: '0.5rem 1rem', borderBottom: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '0.2rem' },
}

function TextBlock({ text }) {
  if (!text) return null
  return (
    <>
      {text.split('\n').map((line, i) => (
        <p key={i} style={{ lineHeight: '1.9', color: '#b8ad98', margin: '0 0 0.8rem' }}>
          {line || <br />}
        </p>
      ))}
    </>
  )
}

function statusColour(status) {
  if (!status) return '#9a8f7a'
  const l = status.toLowerCase()
  if (l.includes('alive')) return '#4a7a4a'
  if (l.includes('deceased') || l.includes('dead')) return '#7a4a4a'
  if (l.includes('missing') || l.includes('unknown')) return '#7a6a3a'
  return '#9a8f7a'
}

function EntryForm({ onSave, onCancel, title, form, setForm, activeTab, imageFile, setImageFile, uploading }) {
  const fields = FIELDS[activeTab]
  return (
    <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ color: '#d4c9b0', marginTop: 0 }}>{title}</h3>
      {fields.map(field => (
        <div key={field} style={{ marginBottom: '1rem' }}>
          <label style={s.label}>{field}</label>
          <textarea
            value={form[field] || ''}
            onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
            rows={['description', 'relationships', 'appearance', 'abilities', 'members'].includes(field) ? 4 : 2}
            style={s.textarea}
          />
        </div>
      ))}
      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Image (optional)</label>
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ color: '#9a8f7a', fontSize: '0.9rem' }} />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={onSave} style={s.btnPrimary} disabled={uploading}>{uploading ? 'Uploading...' : 'Save Entry'}</button>
        <button onClick={onCancel} style={s.btnDanger}>Cancel</button>
      </div>
    </div>
  )
}

function TimelineEventForm({ form, setForm, onSave, onCancel, title }) {
  return (
    <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ color: '#d4c9b0', marginTop: 0 }}>{title}</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Title</label>
        <textarea value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} rows={1} style={s.textarea} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Era</label>
        <select value={form.era || ''} onChange={e => setForm(p => ({ ...p, era: e.target.value }))}
          style={{ ...s.input, cursor: 'pointer' }}>
          <option value="">Select an era...</option>
          {ERAS.map(era => <option key={era.name} value={era.name}>{era.name}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Description</label>
        <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} style={s.textarea} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Linked Entries (comma separated names)</label>
        <textarea value={form.linked_entries || ''} onChange={e => setForm(p => ({ ...p, linked_entries: e.target.value }))} rows={2} style={s.textarea} placeholder="Kuris, Annira, Feyfair..." />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Tags</label>
        <textarea value={form.tags || ''} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} rows={2} style={s.textarea} />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={onSave} style={s.btnPrimary}>Save Event</button>
        <button onClick={onCancel} style={s.btnDanger}>Cancel</button>
      </div>
    </div>
  )
}

function TimelinePage({ onEntryClick }) {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({})
  const [editingEvent, setEditingEvent] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    const { data } = await supabase.from('timeline').select('*').order('created_at', { ascending: true })
    setEvents(data || [])
  }

  async function handleSave() {
    if (!form.title || !form.era) return
    await supabase.from('timeline').insert([form])
    setForm({})
    setShowForm(false)
    fetchEvents()
  }

  async function handleUpdate() {
    if (!form.title || !form.era) return
    await supabase.from('timeline').update(form).eq('id', editingEvent.id)
    setEditingEvent(null)
    setForm({})
    fetchEvents()
  }

  async function handleDelete(id) {
    await supabase.from('timeline').delete().eq('id', id)
    setExpandedId(null)
    fetchEvents()
  }

  const grouped = ERAS.map(era => ({
    ...era,
    events: events.filter(e => e.era === era.name)
  }))

  return (
    <div style={s.container}>
      <p style={{ color: '#6b6357', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Archive — Timeline</p>
      <h1 style={{ fontSize: '1.8rem', color: '#d4c9b0', margin: '0.3rem 0 0.5rem' }}>Timeline</h1>
      <p style={{ color: '#9a8f7a', fontStyle: 'italic', marginBottom: '1.5rem' }}>A chronicle of events across the known eras.</p>
      <hr style={s.hr} />
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => { setShowForm(!showForm); setForm({}); setEditingEvent(null) }} style={s.btnPrimary}>+ New Event</button>
      </div>

      {showForm && !editingEvent && (
        <TimelineEventForm form={form} setForm={setForm} onSave={handleSave} onCancel={() => setShowForm(false)} title="New Event" />
      )}

      {editingEvent && (
        <TimelineEventForm form={form} setForm={setForm} onSave={handleUpdate} onCancel={() => { setEditingEvent(null); setForm({}) }} title={`Editing: ${editingEvent.title}`} />
      )}

      {grouped.map((era, eraIndex) => (
        <div key={era.name} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: era.colour, flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: '1rem', color: era.colour, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{era.name}</h2>
            <div style={{ flex: 1, height: '1px', background: era.dimColour }} />
          </div>

          {era.events.length === 0 && (
            <p style={{ color: '#3a3a3a', fontStyle: 'italic', fontSize: '0.85rem', paddingLeft: '1.5rem' }}>No events recorded for this era.</p>
          )}

          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            {era.events.length > 0 && (
              <div style={{ position: 'absolute', left: '5px', top: 0, bottom: 0, width: '2px', background: era.dimColour }} />
            )}
            {era.events.map((event, i) => {
              const isExpanded = expandedId === event.id
              const linkedNames = event.linked_entries ? event.linked_entries.split(',').map(n => n.trim()).filter(Boolean) : []
              return (
                <div key={event.id} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'absolute', left: '-1.75rem', top: '0.6rem', width: '10px', height: '10px', borderRadius: '50%', background: era.colour, border: `2px solid #0f0f0f` }} />
                  <div
                    style={{ background: '#141414', border: `1px solid ${isExpanded ? era.colour : '#2a2a2a'}`, borderRadius: '4px', padding: '1rem 1.2rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ color: '#d4c9b0', fontSize: '1rem' }}>{event.title}</strong>
                      <span style={{ color: '#6b6357', fontSize: '0.8rem', marginLeft: '1rem', flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    {!isExpanded && event.description && (
                      <p style={{ margin: '0.3rem 0 0', color: '#6b6357', fontSize: '0.85rem' }}>{event.description.slice(0, 100)}{event.description.length > 100 ? '...' : ''}</p>
                    )}
                    {isExpanded && (
                      <div style={{ marginTop: '1rem' }}>
                        <TextBlock text={event.description} />
                        {linkedNames.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <span style={{ color: '#6b6357', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Related — </span>
                            {linkedNames.map(name => (
                              <span key={name} onClick={e => { e.stopPropagation(); onEntryClick(name) }}
                                style={{ ...s.tag, cursor: 'pointer', borderColor: era.dimColour, color: era.colour }}>
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                        {event.tags && (
                          <div style={{ marginTop: '0.5rem' }}>
                            {event.tags.split(',').map(t => <span key={t} style={s.tag}>{t.trim()}</span>)}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button onClick={e => { e.stopPropagation(); setEditingEvent(event); setForm({ ...event }); setShowForm(false) }} style={s.btnPrimary}>Edit</button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(event.id) }} style={s.btnDanger}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function MembersList({ members, onMemberClick }) {
  if (!members) return null
  const lines = members.split('\n').filter(l => l.trim())
  return (
    <div>
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{ color: '#6b6357', fontSize: '0.85rem' }}>—</span>
          <span
            style={{ color: '#c4b99a', fontSize: '0.95rem', cursor: 'pointer', borderBottom: '1px solid #3a3a3a', lineHeight: '1.4' }}
            onClick={() => onMemberClick(line.trim())}
            onMouseEnter={e => e.currentTarget.style.color = '#d4c9b0'}
            onMouseLeave={e => e.currentTarget.style.color = '#c4b99a'}
          >
            {line.trim()}
          </span>
        </div>
      ))}
    </div>
  )
}

function EntryDetail({ entry, activeTab, onEdit, onDelete, onTagClick, onMemberClick }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={s.infobox}>
        <div style={s.infoboxHeader}>
          <strong style={{ color: '#d4c9b0', fontSize: '0.95rem' }}>{entry.name}</strong>
        </div>
        {entry.image_url && (
          <img src={entry.image_url} alt={entry.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
        )}
        {INFOBOX_FIELDS[activeTab].map(field => entry[field] && (
          <div key={field} style={s.infoboxRow}>
            <span style={{ color: '#6b6357', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field}</span>
            {field === 'status'
              ? <span style={{ color: statusColour(entry[field]), fontSize: '0.9rem' }}>{entry[field]}</span>
              : <span style={{ color: '#b8ad98', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{entry[field]}</span>
            }
          </div>
        ))}
        {entry.tags && (
          <div style={s.infoboxRow}>
            <span style={{ color: '#6b6357', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</span>
            <div>{entry.tags.split(',').map(t => (
              <span key={t} style={{ ...s.tag, cursor: 'pointer' }} onClick={e => onTagClick(e, t)}>{t.trim()}</span>
            ))}</div>
          </div>
        )}
      </div>
      <h1 style={{ fontSize: '2rem', color: '#d4c9b0', margin: '0 0 1.5rem' }}>{entry.name}</h1>
      {MAIN_FIELDS[activeTab].map(field => entry[field] && (
        <div key={field} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#9a8f7a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #2a2a2a', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>{field}</h3>
          <TextBlock text={entry[field]} />
        </div>
      ))}
      {activeTab === 'factions' && entry.members && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#9a8f7a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #2a2a2a', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>Members</h3>
          <MembersList members={entry.members} onMemberClick={onMemberClick} />
        </div>
      )}
      <div style={{ clear: 'both' }} />
      <hr style={s.hr} />
      {entry.id === '__example__' ? (
        <p style={{ color: '#6b6357', fontStyle: 'italic', fontSize: '0.85rem' }}>This is an example entry and cannot be edited or deleted.</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onEdit} style={s.btnPrimary}>Edit</button>
          <button onClick={() => onDelete(entry.id)} style={s.btnDanger}>Delete Entry</button>
        </div>
      )}
    </div>
  )
}

function GlobalSearch({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const q = query.toLowerCase()
      const all = []
      for (const table of ['characters', 'locations', 'lore', 'factions']) {
        const { data } = await supabase.from(table).select('*')
        const matches = (data || [])
          .filter(e => e.category !== '__homepage__')
          .filter(e => Object.values(e).some(v => v?.toString().toLowerCase().includes(q)))
          .map(e => ({ ...e, _table: table }))
        all.push(...matches)
      }
      setResults(all.slice(0, 10))
      setOpen(true)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(entry) {
    onNavigate(entry._table, entry)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const grouped = ['characters', 'locations', 'lore', 'factions'].reduce((acc, table) => {
    const items = results.filter(r => r._table === table)
    if (items.length) acc[table] = items
    return acc
  }, {})

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
      <input
        placeholder="Search the archive..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        style={{ ...s.input, padding: '0.35rem 0.6rem', fontSize: '0.85rem', background: '#1a1a1a', border: '1px solid #2a2a2a' }}
      />
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', zIndex: 100, maxHeight: '400px', overflowY: 'auto' }}>
          {loading && <p style={{ padding: '0.75rem 1rem', color: '#6b6357', margin: 0, fontSize: '0.85rem' }}>Searching...</p>}
          {!loading && results.length === 0 && <p style={{ padding: '0.75rem 1rem', color: '#6b6357', margin: 0, fontSize: '0.85rem', fontStyle: 'italic' }}>No results found.</p>}
          {Object.entries(grouped).map(([table, items]) => (
            <div key={table}>
              <p style={{ padding: '0.4rem 1rem', margin: 0, color: '#6b6357', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1e1e1e', background: '#111' }}>{table}</p>
              {items.map(entry => (
                <div key={entry.id} onClick={() => handleSelect(entry)}
                  style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1e1e1e'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {entry.image_url && <img src={entry.image_url} alt={entry.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />}
                  <div>
                    <strong style={{ color: '#d4c9b0', fontSize: '0.9rem' }}>{entry.name}</strong>
                    {entry.description && <p style={{ margin: 0, color: '#6b6357', fontSize: '0.8rem' }}>{entry.description.slice(0, 60)}...</p>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [page, setPage] = useState('home')
  const [activeTab, setActiveTab] = useState('characters')
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [search, setSearch] = useState('')
  const [homeText, setHomeText] = useState('')
  const [editingHome, setEditingHome] = useState(false)
  const [homeTextDraft, setHomeTextDraft] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => { fetchHomeText() }, [])

  async function fetchHomeText() {
    const { data } = await supabase.from('lore').select('*').eq('category', '__homepage__').single()
    if (data) setHomeText(data.description || '')
  }

  async function saveHomeText() {
    const { data } = await supabase.from('lore').select('*').eq('category', '__homepage__').single()
    if (data) {
      await supabase.from('lore').update({ description: homeTextDraft }).eq('id', data.id)
    } else {
      await supabase.from('lore').insert([{ name: 'Homepage', description: homeTextDraft, category: '__homepage__' }])
    }
    setHomeText(homeTextDraft)
    setEditingHome(false)
  }

  async function fetchEntries() {
    const { data } = await supabase.from(activeTab).select('*').order('name', { ascending: true })
    setEntries((data || []).filter(e => e.category !== '__homepage__'))
  }

  useEffect(() => {
    if (authed && page !== 'home' && page !== 'timeline') fetchEntries()
    setSelected(null)
    setShowForm(false)
    setEditing(false)
    setSearch('')
    setShowExample(false)
  }, [page, authed, activeTab])

  async function uploadImage() {
    if (!imageFile) return null
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const filename = `${uuidv4()}.${ext}`
    const { error } = await supabase.storage.from('images').upload(filename, imageFile)
    setUploading(false)
    if (error) { console.error(error); return null }
    const { data } = supabase.storage.from('images').getPublicUrl(filename)
    return data.publicUrl
  }

  async function handleSubmit() {
    if (!form.name) return
    const image_url = await uploadImage()
    await supabase.from(activeTab).insert([{ ...form, image_url }])
    setForm({})
    setImageFile(null)
    setShowForm(false)
    fetchEntries()
  }

  async function handleUpdate() {
    if (!form.name) return
    let image_url = selected.image_url
    if (imageFile) image_url = await uploadImage()
    await supabase.from(activeTab).update({ ...form, image_url }).eq('id', selected.id)
    setSelected({ ...selected, ...form, image_url })
    setEditing(false)
    setImageFile(null)
    fetchEntries()
  }

  async function handleDelete(id) {
    await supabase.from(activeTab).delete().eq('id', id)
    setSelected(null)
    fetchEntries()
  }

  function handleLogin() {
    if (passwordInput === PASSWORD) { setAuthed(true); setPasswordError(false) }
    else setPasswordError(true)
  }

  function navigate(destination, tab = null) {
    setPage(destination)
    if (tab) setActiveTab(tab)
  }

  function handleGlobalNavigate(table, entry) {
    setActiveTab(table)
    setPage('section')
    setSelected(entry)
    setShowExample(false)
    setEditing(false)
  }

  async function handleTagClick(e, tag) {
    e.stopPropagation()
    const trimmed = tag.trim().toLowerCase()
    for (const table of ['characters', 'locations', 'lore', 'factions']) {
      const { data } = await supabase.from(table).select('*')
      const match = (data || []).find(entry => entry.name?.toLowerCase() === trimmed)
      if (match) {
        setActiveTab(table)
        setPage('section')
        setSelected(match)
        setShowExample(false)
        setEditing(false)
        return
      }
    }
    setSearch(tag.trim())
  }

  async function handleMemberClick(memberName) {
    const clean = memberName.toLowerCase()
    for (const table of ['characters', 'locations', 'lore', 'factions']) {
      const { data } = await supabase.from(table).select('*')
      const match = (data || []).find(e => e.name?.toLowerCase() === clean)
      if (match) {
        setActiveTab(table)
        setPage('section')
        setSelected(match)
        setShowExample(false)
        setEditing(false)
        return
      }
    }
  }

  async function handleTimelineEntryClick(name) {
    const clean = name.toLowerCase()
    for (const table of ['characters', 'locations', 'lore', 'factions']) {
      const { data } = await supabase.from(table).select('*')
      const match = (data || []).find(e => e.name?.toLowerCase() === clean)
      if (match) {
        setActiveTab(table)
        setPage('section')
        setSelected(match)
        setShowExample(false)
        setEditing(false)
        return
      }
    }
  }

  const filteredEntries = entries.filter(e =>
    Object.values(e).some(v => v?.toString().toLowerCase().includes(search.toLowerCase()))
  )

  if (!authed) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '340px', width: '100%', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#d4c9b0', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>LORE WIKI</h1>
          <p style={{ color: '#6b6357', fontSize: '0.9rem', marginBottom: '2rem' }}>This record is restricted.</p>
          <input type="password" placeholder="Enter passphrase" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...s.input, marginBottom: '0.75rem', textAlign: 'center' }} />
          {passwordError && <p style={{ color: '#8b3a3a', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>Incorrect passphrase.</p>}
          <button onClick={handleLogin} style={{ ...s.btnPrimary, width: '100%' }}>Enter</button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle} onClick={() => navigate('home')}>⬡ WORLD RECORD</span>
        {['characters', 'locations', 'lore', 'factions'].map(tab => (
          <span key={tab} onClick={() => navigate('section', tab)} style={{ ...s.navLink, ...(page === 'section' && activeTab === tab ? s.navLinkActive : {}) }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </span>
        ))}
        <span onClick={() => navigate('timeline')} style={{ ...s.navLink, ...(page === 'timeline' ? s.navLinkActive : {}) }}>
          Timeline
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <GlobalSearch onNavigate={handleGlobalNavigate} />
          <span style={{ ...s.navLink, fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={() => setAuthed(false)}>Lock</span>
        </div>
      </nav>

      {/* Home */}
      {page === 'home' && (
        <div style={s.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>World Record — Public Archive</p>
          <h1 style={{ fontSize: '2.2rem', color: '#d4c9b0', margin: '0 0 0.5rem', letterSpacing: '0.05em' }}>[WORLD NAME]</h1>
          <p style={{ color: '#9a8f7a', fontSize: '1rem', marginBottom: '2rem', fontStyle: 'italic' }}>As recorded by those who lived it.</p>
          <hr style={s.hr} />
          {editingHome ? (
            <>
              <textarea value={homeTextDraft} onChange={e => setHomeTextDraft(e.target.value)} rows={12} style={{ ...s.textarea, marginBottom: '1rem' }} placeholder="Write the world introduction here. Press Enter for new paragraphs." />
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={saveHomeText} style={s.btnPrimary}>Save</button>
                <button onClick={() => setEditingHome(false)} style={s.btnDanger}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {homeText ? <TextBlock text={homeText} /> : <p style={{ color: '#6b6357', fontStyle: 'italic' }}>No introduction written yet.</p>}
              <button onClick={() => { setHomeTextDraft(homeText); setEditingHome(true) }} style={{ ...s.btnPrimary, marginBottom: '2rem' }}>Edit Introduction</button>
            </>
          )}
          <hr style={s.hr} />
          <h3 style={{ color: '#9a8f7a', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Browse the Archive</h3>
          {[
            { tab: 'characters', label: 'Characters', desc: SECTION_DESCRIPTIONS.characters },
            { tab: 'locations', label: 'Locations', desc: SECTION_DESCRIPTIONS.locations },
            { tab: 'lore', label: 'Lore', desc: SECTION_DESCRIPTIONS.lore },
            { tab: 'factions', label: 'Factions', desc: SECTION_DESCRIPTIONS.factions },
            { tab: 'timeline', label: 'Timeline', desc: 'A chronicle of events across the known eras.' },
          ].map(({ tab, label, desc }) => (
            <div key={tab} style={s.sectionLink} onClick={() => tab === 'timeline' ? navigate('timeline') : navigate('section', tab)}>
              <strong style={{ color: '#d4c9b0' }}>{label}</strong>
              <p style={{ margin: '0.3rem 0 0', color: '#6b6357', fontSize: '0.9rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {page === 'timeline' && (
        <TimelinePage onEntryClick={handleTimelineEntryClick} />
      )}

      {/* Section list */}
      {page === 'section' && !selected && !showExample && (
        <div style={s.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Archive — {activeTab}</p>
          <h1 style={{ fontSize: '1.8rem', color: '#d4c9b0', margin: '0.3rem 0 0.5rem' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <p style={{ color: '#9a8f7a', fontStyle: 'italic', marginBottom: '1.5rem' }}>{SECTION_DESCRIPTIONS[activeTab]}</p>
          <hr style={s.hr} />
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <input placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...s.input, flex: 1 }} />
            <button onClick={() => { setShowForm(!showForm); setForm({}) }} style={s.btnPrimary}>+ New Entry</button>
            {activeTab === 'characters' && (
              <button onClick={() => setShowExample(true)} style={{ ...s.btnPrimary, color: '#9a8f7a', borderColor: '#2a2a2a' }}>Example</button>
            )}
          </div>
          {showForm && (
            <EntryForm
              title={`New ${activeTab.slice(0, -1)}`}
              onSave={handleSubmit}
              onCancel={() => setShowForm(false)}
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploading={uploading}
            />
          )}
          {filteredEntries.length === 0 && <p style={{ color: '#6b6357', fontStyle: 'italic' }}>No entries recorded.</p>}
          {filteredEntries.map(entry => (
            <div key={entry.id} style={s.entryCard} onClick={() => { setSelected(entry); setShowExample(false) }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '3px', border: '1px solid #2a2a2a', background: '#1a1a1a', overflow: 'hidden' }}>
                  {entry.image_url && <img src={entry.image_url} alt={entry.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <strong style={{ color: '#d4c9b0', fontSize: '1.05rem' }}>{entry.name}</strong>
                    {entry.status && <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '3px', border: `1px solid ${statusColour(entry.status)}`, color: statusColour(entry.status) }}>{entry.status}</span>}
                  </div>
                  {entry.description && <p style={{ margin: '0.3rem 0 0.5rem', color: '#9a8f7a', fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'left' }}>{entry.description.slice(0, 120)}{entry.description.length > 120 ? '...' : ''}</p>}
                  {entry.tags && entry.tags.split(',').map(t => (
                    <span key={t} style={{ ...s.tag, cursor: 'pointer' }} onClick={e => handleTagClick(e, t)}>{t.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Example page */}
      {page === 'section' && showExample && (
        <div style={s.container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <p style={{ color: '#6b6357', fontSize: '0.85rem', cursor: 'pointer', margin: 0 }} onClick={() => setShowExample(false)}>← Back to characters</p>
            <span style={{ background: '#1e1a14', border: '1px solid #3a3218', color: '#8b7a3a', fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '3px' }}>Example Entry</span>
          </div>
          <hr style={s.hr} />
          <EntryDetail entry={EXAMPLE_CHARACTER} activeTab="characters" onTagClick={handleTagClick} onMemberClick={handleMemberClick} />
        </div>
      )}

      {/* Entry detail */}
      {page === 'section' && selected && !showExample && (
        <div style={s.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setSelected(null)}>← Back to {activeTab}</p>
          <hr style={s.hr} />
          {editing ? (
            <EntryForm
              title={`Editing: ${selected.name}`}
              onSave={handleUpdate}
              onCancel={() => setEditing(false)}
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploading={uploading}
            />
          ) : (
            <EntryDetail
              entry={selected}
              activeTab={activeTab}
              onEdit={() => { setForm({ ...selected }); setEditing(true) }}
              onDelete={handleDelete}
              onTagClick={handleTagClick}
              onMemberClick={handleMemberClick}
            />
          )}
        </div>
      )}
    </div>
  )
}