// App.jsx
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [domains, setDomains] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formDomain, setFormDomain] = useState("");
  const [formSubdomains, setFormSubdomains] = useState("");
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchDomains = () => {
    setLoading(true);
    fetch('http://localhost:3000/domains')
      .then(res => {
        if (!res.ok) throw new Error('Sunucudan veri alınamadı');
        return res.json();
      })
      .then(data => {
        setDomains(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const filteredEntries = Object.entries(domains)
    .map(([domain, subdomains]) => {
      if (domain.toLowerCase().includes(search.toLowerCase())) {
        return [domain, subdomains];
      }
      const filteredSubs = subdomains.filter(sub =>
        sub.toLowerCase().includes(search.toLowerCase())
      );
      if (filteredSubs.length > 0) {
        return [domain, filteredSubs];
      }
      return null;
    })
    .filter(Boolean);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    const domain = formDomain.trim();
    const subdomains = formSubdomains.split(',').map(s => s.trim()).filter(Boolean);
    if (!domain || subdomains.length === 0) {
      setFormError('Lütfen üst domain ve en az bir alt domain girin.');
      setSubmitting(false);
      return;
    }

    try {
      if (!domains[domain]) {
        const res = await fetch('http://localhost:3000/domains', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [domain]: subdomains })
        });
        if (!res.ok) throw new Error('Domain eklenemedi');
        setFormSuccess('Yeni domain ve alt domainler eklendi!');
      } else {
        let added = 0;
        for (let sub of subdomains) {
          if (!domains[domain].includes(sub)) {
            const res = await fetch(`http://localhost:3000/domains/${encodeURIComponent(domain)}/subdomains`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subdomain: sub })
            });
            if (res.ok) added++;
          }
        }
        if (added > 0) {
          setFormSuccess('Yeni alt domain(ler) eklendi!');
        } else {
          setFormError('Girilen alt domainler zaten mevcut.');
        }
      }
      setFormDomain("");
      setFormSubdomains("");
      fetchDomains();
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDomain = async (domain) => {
    if (!window.confirm(`${domain} ve tüm alt domainleri silinsin mi?`)) return;
    setActionMessage(null);
    try {
      const res = await fetch(`http://localhost:3000/domains/${encodeURIComponent(domain)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Domain silinemedi');
      setActionMessage('Domain ve alt domainler silindi.');
      fetchDomains();
    } catch (err) {
      setActionMessage('Hata: ' + err.message);
    }
  };

  const handleDeleteSubdomain = async (domain, subdomain) => {
    if (!window.confirm(`${subdomain} silinsin mi?`)) return;
    setActionMessage(null);
    try {
      const res = await fetch(`http://localhost:3000/domains/${encodeURIComponent(domain)}/subdomains/${encodeURIComponent(subdomain)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Alt domain silinemedi');
      setActionMessage('Alt domain silindi.');
      fetchDomains();
    } catch (err) {
      setActionMessage('Hata: ' + err.message);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div className="container">
      <h1 className="title">Domain Listesi</h1>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <button className="btn btn-toggle" onClick={() => setShowForm(f => !f)}>
          {showForm ? 'Kapat' : 'Ekle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="form-box">
          <label>Üst Domain:</label>
          <input
            type="text"
            value={formDomain}
            onChange={e => setFormDomain(e.target.value)}
            placeholder="ornek.com"
            disabled={submitting}
          />
          <label>Alt Domain(ler):</label>
          <input
            type="text"
            value={formSubdomains}
            onChange={e => setFormSubdomains(e.target.value)}
            placeholder="sub1.ornek.com,sub2.ornek.com"
            disabled={submitting}
          />
          <button type="submit" disabled={submitting} className="btn btn-toggle">
            {submitting ? 'Ekleniyor...' : 'Kaydet'}
          </button>
          {formError && <div style={{ color: 'red', marginTop: 8 }}>{formError}</div>}
          {formSuccess && <div style={{ color: 'green', marginTop: 8 }}>{formSuccess}</div>}
        </form>
      )}

      {actionMessage && <div style={{ marginBottom: 8, color: actionMessage.startsWith('Hata') ? 'red' : 'green' }}>{actionMessage}</div>}

      <div className="card-list">
        {filteredEntries.length === 0 && <div className="no-result">Sonuç bulunamadı.</div>}
        {filteredEntries.map(([domain, subdomains]) => (
          <div key={domain} className="domain-card">
            <div className="domain-title">
              {domain}
              <button className="btn btn-danger" onClick={() => handleDeleteDomain(domain)}>Sil</button>
            </div>
            <ul className="subdomain-list">
              {subdomains.map((sub, i) => (
                <li key={i} className="subdomain-item">
                  {sub}
                  <button className="btn btn-danger" onClick={() => handleDeleteSubdomain(domain, sub)}>Sil</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
