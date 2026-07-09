{hayDQ && (
  <div className="card-dq">
    <div className="flex items-center gap-3 mb-3">
      <img src="/dq-logo.png" alt="DQ" className="h-8 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
      <p className="text-sm font-bold text-blue-700">Dairy Queen</p>
    </div>
    <div className="grid grid-cols-4 gap-2 text-sm">
      <div className="p-2 bg-white/60 rounded-lg text-center">
        <span className="text-xs text-slate-500 block">Presup</span>
        <p className="font-bold text-slate-800">{formatMoney(dqTotal)}</p>
      </div>
      <div className="p-2 bg-white/60 rounded-lg text-center">
        <span className="text-xs text-slate-500 block">Gasto</span>
        <p className="font-bold text-red-600">{formatMoney(dqGasto)}</p>
      </div>
      <div className="p-2 bg-white/60 rounded-lg text-center">
        <span className="text-xs text-slate-500 block">Amort</span>
        <p className="font-bold text-orange-600">{formatMoney(dqAmort)}</p>
      </div>
      <div className="p-2 bg-white/60 rounded-lg text-center">
        <span className="text-xs text-slate-500 block">Saldo</span>
        <p className={`font-bold ${(dqTotal - dqGasto - dqAmort) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {formatMoney(dqTotal - dqGasto - dqAmort)}
        </p>
      </div>
    </div>
  </div>
)}

{hayKFC && (
  <div className="card-kfc">
    <div className="flex items-center gap-3 mb-3">
      <img src="/kfc-logo.png" alt="KFC" className="h-8 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
      <p className="text-sm font-bold text-red-700">Kentucky Fried Chicken</p>
    </div>
    <div className="grid grid-cols-4 gap-2 text-sm">
      <div className="p-2 bg-white/60 rounded-lg text-center">
        <span className="text-xs text-slate-500 block">Presup</span>
        <p className="font-bold text-slate-800">{formatMoney(kfcTotal)}</p>
      </div>
      <div className="p-2 bg-white/60 rounded-lg text-center">
        <span className="text-xs text-slate-500 block">Gasto</span>
        <p className="font-bold text-red-600">{formatMoney(kfcGasto)}</p>
      </div>
      <div className="p-2 bg-white/60 rounded-lg text-center">
        <span className="text-xs text-slate-500 block">Amort</span>
        <p className="font-bold text-orange-600">{formatMoney(kfcAmort)}</p>
      </div>
      <div className="p-2 bg-white/60 rounded-lg text-center">
        <span className="text-xs text-slate-500 block">Saldo</span>
        <p className={`font-bold ${(kfcTotal - kfcGasto - kfcAmort) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {formatMoney(kfcTotal - kfcGasto - kfcAmort)}
        </p>
      </div>
    </div>
  </div>
)}
