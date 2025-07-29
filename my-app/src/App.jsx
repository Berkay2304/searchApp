import { useState } from 'react';
import domainData from './spaceNames/domainList.json';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  // domainData'yı state'e al
  const [domains, setDomains] = useState(domainData);
  // Modal/form state
  const [showForm, setShowForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [selectDomain, setSelectDomain] = useState('');
  const [isAddingNewDomain, setIsAddingNewDomain] = useState(false);
  const [newSubdomains, setNewSubdomains] = useState('');
  const [formError, setFormError] = useState('');

  const filteredData = Object.entries(domains)
    .map(([anaDomain, altDomainler]) => {
      const search = searchTerm.toLowerCase();
      const anaMatch = anaDomain.toLowerCase().includes(search);
      const altMatches = altDomainler.filter((alt) =>
        alt.toLowerCase().includes(search)
      );
      if (anaMatch) {
        return [anaDomain, altDomainler];
      } else if (altMatches.length > 0) {
        return [anaDomain, altMatches];
      }
      return null;
    })
    .filter(Boolean);

  // Yeni domain veya alt domain ekleme fonksiyonu
  const handleAddDomain = (e) => {
    e.preventDefault();
    setFormError('');
    let domain = '';
    if (isAddingNewDomain) {
      domain = newDomain.trim();
      if (!domain) {
        setFormError('Alan adı boş olamaz.');
        return;
      }
    } else {
      domain = selectDomain;
      if (!domain) {
        setFormError('Bir üst domain seçiniz veya ekleyiniz.');
        return;
      }
    }
    // Alt domainleri virgül veya satır ile ayır
    const subdomains = newSubdomains
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (subdomains.length === 0) {
      setFormError('En az bir alt alan adı giriniz.');
      return;
    }
    let newDomains = { ...domains };
    if (newDomains[domain]) {
      // Varsa, alt domainleri ekle (tekrar edenleri ekleme)
      const currentSubs = newDomains[domain];
      const mergedSubs = Array.from(new Set([...currentSubs, ...subdomains]));
      newDomains[domain] = mergedSubs;
    } else {
      // Yoksa yeni domain olarak ekle
      newDomains[domain] = subdomains;
    }
    setDomains(newDomains);
    setShowForm(false);
    setNewDomain('');
    setSelectDomain('');
    setIsAddingNewDomain(false);
    setNewSubdomains('');
    setFormError('');
  };

  // Üst alan adını sil
  const handleDeleteDomain = (domain) => {
    const newDomains = { ...domains };
    delete newDomains[domain];
    setDomains(newDomains);
  };

  // Alt alan adını sil
  const handleDeleteSubdomain = (domain, subdomain) => {
    const newSubdomains = domains[domain].filter((alt) => alt !== subdomain);
    const newDomains = { ...domains };
    if (newSubdomains.length === 0) {
      // Hiç alt alan kalmadıysa üst alanı da sil
      delete newDomains[domain];
    } else {
      newDomains[domain] = newSubdomains;
    }
    setDomains(newDomains);
  };

  return (
    <div className="container">
      <h1 className="title">Domain Arama</h1>
      <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="search-icon" role="img" aria-label="search">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Bir domain yaz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="add-btn"
          style={{ marginLeft: 8, padding: '6px 14px', fontSize: 16, cursor: 'pointer' }}
          onClick={() => setShowForm(true)}
        >
          Ekle
        </button>
      </div>
      {/* Ekleme Formu Modalı */}
      {showForm && (
        <div className="modal-bg" style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div className="modal-content" style={{ background:'#fff', padding:32, borderRadius:8, minWidth:320, boxShadow:'0 2px 16px rgba(0,0,0,0.15)' }}>
            <h2>Yeni Domain veya Alt Domain Ekle</h2>
            <form onSubmit={handleAddDomain}>
              <div style={{ marginBottom: 12 }}>
                <label>Üst Domain:</label><br />
                {!isAddingNewDomain ? (
                  <>
                    <select
                      value={selectDomain}
                      onChange={e => {
                        if (e.target.value === '__new__') {
                          setIsAddingNewDomain(true);
                          setSelectDomain('');
                        } else {
                          setSelectDomain(e.target.value);
                          setNewDomain('');
                        }
                      }}
                      style={{ width: '100%', padding: 6, fontSize: 15 }}
                    >
                      <option value="">Bir üst domain seçiniz...</option>
                      {Object.keys(domains).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="__new__">+ Yeni domain ekle</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={newDomain}
                      onChange={e => setNewDomain(e.target.value)}
                      style={{ width: '100%', padding: 6, fontSize: 15 }}
                      placeholder="Yeni üst domain (örnek.com)"
                      autoFocus
                    />
                    <button type="button" style={{ marginTop: 6, fontSize: 13 }} onClick={() => { setIsAddingNewDomain(false); setNewDomain(''); }}>← Geri</button>
                  </>
                )}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Alt Alan Adları:</label><br />
                <textarea
                  value={newSubdomains}
                  onChange={e => setNewSubdomains(e.target.value)}
                  style={{ width: '100%', padding: 6, fontSize: 15, minHeight: 60 }}
                  placeholder="Her alt alan adını virgül veya satır ile ayırabilirsiniz."
                />
              </div>
              {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowForm(false); setIsAddingNewDomain(false); setNewDomain(''); setSelectDomain(''); setFormError(''); setNewSubdomains(''); }} style={{ padding: '6px 14px' }}>İptal</button>
                <button type="submit" style={{ padding: '6px 14px', background:'#007bff', color:'#fff', border:'none', borderRadius:4 }}>Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="card-list">
        {filteredData.map(([anaDomain, altDomainler], index) => (
          <div className="domain-card" key={index}>
            <div className="domain-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{anaDomain}</span>
              <button
                onClick={() => handleDeleteDomain(anaDomain)}
                style={{ marginLeft: 8, background: 'transparent', border: '1px solid #d11a2a', color: '#d11a2a', fontSize: 15, cursor: 'pointer', borderRadius: 4, padding: '2px 10px' }}
                title="Üst alanı sil"
              >
                Sil
              </button>
            </div>
            <ul className="subdomain-list">
              {altDomainler.map((alt, i) => (
                <li className="subdomain-item" key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{alt}</span>
                  <button
                    onClick={() => handleDeleteSubdomain(anaDomain, alt)}
                    style={{ marginLeft: 8, background: 'transparent', border: '1px solid #d11a2a', color: '#d11a2a', fontSize: 14, cursor: 'pointer', borderRadius: 4, padding: '2px 8px' }}
                    title="Alt alanı sil"
                  >
                    Sil
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {filteredData.length === 0 && <p className="no-result">Eşleşen sonuç bulunamadı.</p>}
      </div>
    </div>
  );
}

export default App;
