export default function Toolbar({ params, setParams }) {
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1e15).toString();
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
    <div className="bg-base-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-5 items-center justify-between text-left">
      <div className="form-control w-full md:w-auto gap-2 text-left">
        <label className="label mt-8 font-bold text-xs uppercase text-base-content/60">Region / Language</label>
        <select 
          className="select select-bordered w-full ml-2 md:w-48"
          value={params.locale}
          onChange={(e) => handleChange('locale', e.target.value)}
        >
          <option value="en">English (USA)</option>
          <option value="de">German (Germany)</option>
          <option value="uk">Ukrainian (Ukraine)</option>
        </select>
      </div>

      <div className="form-control w-full md:flex-1 max-w-md text-left">
        <label className="label font-bold text-xs uppercase text-base-content/60">Seed Configuration</label>
        <div className="join w-full">
          <input 
            type="text" 
            placeholder="Enter seed value..." 
            className="input input-bordered join-item w-full"
            value={params.seed}
            onChange={(e) => handleChange('seed', e.target.value)}
          />
          <button className="btn btn-primary join-item px-5" onClick={generateRandomSeed}>🎲 Random</button>
        </div>
      </div>

      <div className="form-control w-full md:w-auto min-w-[240px] text-left">
        <label className="label font-bold text-xs uppercase text-base-content/60 flex justify-between">
          <span>Avg. Likes per Song</span>
          <span className="badge badge-secondary font-mono font-bold">{params.likes}</span>
        </label>
        <input 
          type="range" min="0" max="10" step="0.1" 
          className="range range-secondary range-sm" 
          value={params.likes}
          onChange={(e) => handleChange('likes', parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}