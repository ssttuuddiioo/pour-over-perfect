<div>
  <label className="block text-xs font-medium text-gray-400 mb-1">Bloom Ratio</label>
  <div className="flex gap-2">
    {[2, 3].map((ratio) => (
      <button
        key={ratio}
        type="button"
        className={`flex-1 px-0 py-2 rounded-[4px] text-sm font-semibold transition-colors bg-gray-800 ${settingsDraft.bloomRatio === ratio ? 'text-white border-2 border-green-400' : 'text-gray-300 border border-transparent'}`}
        onClick={() => setSettingsDraft(prev => ({ ...prev, bloomRatio: ratio }))}
      >
        {ratio}x
      </button>
    ))}
  </div>
</div> 