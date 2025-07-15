import React from 'react';
import DinoGame from './DinoGame';

function App() {
    return (
        <div>
            <h1 style={{ textAlign: 'center' }}>🦖 Набери 3000</h1>
            <DinoGame finishScore={3000} finishImageUrl="https://lastfm.freetls.fastly.net/i/u/ar0/6245b4f471c9a6971b927c3888347fb2.jpg" />
        </div>
    );
}

export default App;
