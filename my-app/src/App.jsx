import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [domains, setDomains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [subdomainsInput, setSubdomainsInput] = useState("");

  const [editingDomainId, setEditingDomainId] = useState(null);
  const [editingDomainValue, setEditingDomainValue] = useState("");

  const [editingSubdomainInfo, setEditingSubdomainInfo] = useState({ domainId: null, index: null });
  const [editingSubdomainValue, setEditingSubdomainValue] = useState("");

  const API_URL = "https://searchappbackend.onrender.com";

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await axios.get(`${API_URL}/domains`);
      setDomains(response.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  const handleAddDomain = async () => {
    if (!domainInput.trim()) return;
    const subdomains = subdomainsInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s);

    const existing = domains.find(d => d.domain === domainInput);

    try {
      if (existing) {
        await axios.patch(`${API_URL}/domains/${existing._id}/add-subdomains`, {
          newSubdomains: subdomains
        });
      } else {
        await axios.post(`${API_URL}/domains`, {
          domain: domainInput,
          subdomains
        });
      }

      setDomainInput("");
      setSubdomainsInput("");
      fetchDomains();
    } catch (error) {
      console.error("Ekleme hatası:", error);
    }
  };

  const handleDeleteDomain = async (id) => {
    try {
      await axios.delete(`${API_URL}/domains/${id}`);
      fetchDomains();
    } catch (error) {
      console.error("Domain silme hatası:", error);
    }
  };

  const handleDeleteSubdomain = async (id, subdomainToRemove) => {
    try {
      await axios.patch(`${API_URL}/domains/${id}/remove-subdomain`, {
        subdomainToRemove
      });
      fetchDomains();
    } catch (error) {
      console.error("Subdomain silme hatası:", error);
    }
  };

  // Düzenleme işlemleri
  const startEditingDomain = (id, currentValue) => {
    setEditingDomainId(id);
    setEditingDomainValue(currentValue);
  };

  const cancelEditingDomain = () => {
    setEditingDomainId(null);
    setEditingDomainValue("");
  };

  const saveEditingDomain = async (id) => {
    try {
      await axios.patch(`${API_URL}/domains/${id}/update-domain`, {
        newDomain: editingDomainValue.trim()
      });
      setEditingDomainId(null);
      setEditingDomainValue("");
      fetchDomains();
    } catch (error) {
      console.error("Domain güncelleme hatası:", error);
    }
  };

  const startEditingSubdomain = (domainId, index, currentValue) => {
    setEditingSubdomainInfo({ domainId, index });
    setEditingSubdomainValue(currentValue);
  };

  const cancelEditingSubdomain = () => {
    setEditingSubdomainInfo({ domainId: null, index: null });
    setEditingSubdomainValue("");
  };

  const saveEditingSubdomain = async (domainId, oldValue) => {
    try {
      await axios.patch(`${API_URL}/domains/${domainId}/update-subdomain`, {
        oldSubdomain: oldValue,
        newSubdomain: editingSubdomainValue.trim()
      });
      setEditingSubdomainInfo({ domainId: null, index: null });
      setEditingSubdomainValue("");
      fetchDomains();
    } catch (error) {
      console.error("Subdomain güncelleme hatası:", error);
    }
  };

  const filteredDomains = domains.filter(d => {
    const search = searchTerm.toLowerCase();
    return (
      d.domain.toLowerCase().includes(search) ||
      d.subdomains.some(sub => sub.toLowerCase().includes(search))
    );
  });

  return (
    <div className="app-container">
      <h1>Domain Yönetimi</h1>

      <div className="search-add-bar">
        <input
          type="text"
          placeholder="Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="text"
          placeholder="Üst domain (örn: example.com)"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
        />
        <input
          type="text"
          placeholder="Alt domainler (virgülle ayır)"
          value={subdomainsInput}
          onChange={(e) => setSubdomainsInput(e.target.value)}
        />
        <button onClick={handleAddDomain}>Ekle</button>
      </div>

      <ul className="domain-list">
        {filteredDomains.map((d) => (
          <li key={d._id} className="domain-item">
            <div className="domain-header">
              {editingDomainId === d._id ? (
                <>
                  <input
                    type="text"
                    value={editingDomainValue}
                    onChange={(e) => setEditingDomainValue(e.target.value)}
                  />
                  <div className="button-group">
                    <button onClick={() => saveEditingDomain(d._id)}>Kaydet</button>
                    <button onClick={cancelEditingDomain}>İptal</button>
                  </div>
                </>
              ) : (
                <>
                  <strong>{d.domain}</strong>
                  <div className="button-group">
                    <button onClick={() => startEditingDomain(d._id, d.domain)}>Düzenle</button>
                    <button className="delete" onClick={() => handleDeleteDomain(d._id)}>Sil</button>
                  </div>
                </>
              )}
            </div>

            <ul className="subdomain-list">
              {d.subdomains.map((s, idx) => (
                <li key={idx}>
                  {editingSubdomainInfo.domainId === d._id && editingSubdomainInfo.index === idx ? (
                    <>
                      <input
                        type="text"
                        value={editingSubdomainValue}
                        onChange={(e) => setEditingSubdomainValue(e.target.value)}
                      />
                      <div className="button-group">
                        <button onClick={() => saveEditingSubdomain(d._id, s)}>Kaydet</button>
                        <button onClick={cancelEditingSubdomain}>İptal</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{s}</span>
                      <div className="button-group">
                        <button onClick={() => startEditingSubdomain(d._id, idx, s)}>Düzenle</button>
                        <button className="delete-sub" onClick={() => handleDeleteSubdomain(d._id, s)}>Sil</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
