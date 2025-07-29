import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [domains, setDomains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [subdomainsInput, setSubdomainsInput] = useState("");

  const API_URL = "https://searchappbackend.onrender.com"; // backend adresin

  // Verileri yükle
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

    // Var olan domain mi kontrol et
    const existing = domains.find(d => d.domain === domainInput);

    try {
      if (existing) {
        // Mevcut domain'e subdomain ekle
        await axios.patch(`${API_URL}/domains/${existing._id}/add-subdomains`, {
          newSubdomains: subdomains
        });
      } else {
        // Yeni domain oluştur
        await axios.post(`${API_URL}/domains`, {
          domain: domainInput,
          subdomains
        });
      }

      setDomainInput("");
      setSubdomainsInput("");
      fetchDomains(); // Güncelle
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

  const filteredDomains = domains.filter(d =>
    d.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <strong>{d.domain}</strong>
              <button className="delete" onClick={() => handleDeleteDomain(d._id)}>Sil</button>
            </div>
            <ul className="subdomain-list">
              {d.subdomains.map((s, idx) => (
                <li key={idx}>
                  {s}
                  <button className="delete-sub" onClick={() => handleDeleteSubdomain(d._id, s)}>Sil</button>
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
