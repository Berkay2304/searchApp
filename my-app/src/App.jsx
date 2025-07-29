import { useState } from 'react';
import domainData from './spaceNames/domainList.json';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = Object.entries(domainData)
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

  return (
    <div className="container">
      <h1 className="title">Domain Arama</h1>
      <div className="search-bar">
        <span className="search-icon" role="img" aria-label="search">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Bir domain yaz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="card-list">
        {filteredData.map(([anaDomain, altDomainler], index) => (
          <div className="domain-card" key={index}>
            <div className="domain-title">{anaDomain}</div>
            <ul className="subdomain-list">
              {altDomainler.map((alt, i) => (
                <li className="subdomain-item" key={i}>{alt}</li>
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
