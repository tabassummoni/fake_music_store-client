import { useState } from 'react'
import Toolbar from './components/Toolbar'
import SongTable from './components/SongTable'
import useSongs from './hook/useSongs'
import SongGallery from './components/SongGallery'
import './App.css'

function App() {
  const [params, setParams] = useState({
    locale: 'en',
    seed: '42',
    likes: 3.5,
    page: 1,
    viewMode: 'table'
  });

  const { songs, loading, error } = useSongs(params)

  return (
    <div className="container mx-auto p-4 max-w-6xl min-h-screen">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">🎵 FAKE MUSIC STORE</h1>
          <p className="text-xs opacity-60 mt-1">Clean Modular Architecture (No Mess inside App.jsx)</p>
        </div>

        <div className="tabs tabs-boxed shadow-sm">
          <button
            className={`tab ${params.viewMode === 'table' ? 'tab-active' : ''}`}
            onClick={() => setParams(prev => ({ ...prev, viewMode: 'table', page: 1 }))}
          >
            📋 Table View
          </button>
          <button
            className={`tab ${params.viewMode === 'gallery' ? 'tab-active' : ''}`}
            onClick={() => setParams(prev => ({ ...prev, viewMode: 'gallery', page: 1 }))}
          >
            🖼️ Gallery View
          </button>
        </div>
      </header>

      <Toolbar params={params} setParams={setParams} />

      {error && (
        <div className="alert alert-error shadow-sm mb-6">
          <span>{error}. Please check if backend server is running on port 5005.</span>
        </div>
      )}

      <div className="bg-base-100 p-4 sm:p-6 rounded-xl shadow-sm border relative min-h-100">
        {loading && params.page === 1 ? (
          <div className="absolute inset-0 bg-base-100/50 flex justify-center items-center z-10 rounded-xl">
            <span className="loading loading-ring loading-lg text-primary"></span>
          </div>
        ) : null}

        {params.viewMode === 'table' ? (
          <SongTable
            songs={songs}
            params={params}
            setParams={setParams}
            loading={loading}
          />
        ) : (
          <SongGallery
            songs={songs}
            params={params}
            setParams={setParams}
            loading={loading}
          />
        )}
        {params.viewMode === 'table' && (
          <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-base-200">
            <button 
              className="btn btn-sm btn-outline"
              disabled={params.page <= 1 || loading}
              onClick={() => setParams(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              ◀️ Previous
            </button>
            <span className="font-mono text-sm font-bold bg-base-200 px-3 py-1 rounded-md">
              Page {params.page}
            </span>
            <button 
              className="btn btn-sm btn-outline"
              disabled={loading || songs.length < 20}
              onClick={() => setParams(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next ▶️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
