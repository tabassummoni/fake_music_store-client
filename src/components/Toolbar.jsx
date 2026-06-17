

export default function Toolbar({ params, setParams }) {
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1e16).toString();
    setParams(prev => ({ ...prev, seed: randomSeed, page: 1 }));
  };

  const handleChange = (key, value) => {
    setParams(prev => ({ 
      ...prev, 
      [key]: value,
      page: 1 
    }));
  };

  return (
    <div className="bg-base-200 p-4 rounded-xl shadow-md mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* language selection */}
      <div className="form-control w-full md:w-auto">
        <label className="label font-bold text-sm">Region / Language</label>
        <select 
          className="select select-bordered w-full"
          value={params.locale}
          onChange={(e) => handleChange('locale', e.target.value)}
        >
          <option value="en">English (USA)</option>
          <option value="de">German (Germany)</option>
        </select>
      </div>

      {/* seed configuration */}
      <div className="form-control w-full md:w-auto flex-1 max-w-md">
        <label className="label font-bold text-sm">Seed Configuration</label>
        <div className="join w-full">
          <input 
            type="text" 
            placeholder="Enter seed value..." 
            className="input input-bordered join-item w-full"
            value={params.seed}
            onChange={(e) => handleChange('seed', e.target.value)}
          />
          <button 
            className="btn btn-primary join-item"
            onClick={generateRandomSeed}
          >
            🎲 Random
          </button>
        </div>
      </div>

      {/* likes (Range 0-10) */}
      <div className="form-control w-full md:w-auto min-w-62.5">
        <label className="label font-bold text-sm flex justify-between">
          <span>Avg. Likes per Song</span>
          <span className="badge badge-secondary font-mono">{params.likes}</span>
        </label>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="0.1" 
            className="range range-secondary range-sm" 
            value={params.likes}
            onChange={(e) => setParams(prev => ({ ...prev, likes: parseFloat(e.target.value) }))}
          />
        </div>
      </div>
    </div>
  );
}