import { useMemo } from 'react'
import type { AnalysisResponse } from '@/types'
import { Sun, Moon, TrendingUp, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ResultsModalPage2Props {
  result: AnalysisResponse
  isVisible: boolean
}

export default function ResultsModalPage2({ result, isVisible }: ResultsModalPage2Props) {
  const { solar_data } = result

  const chartData = useMemo(() => {
    if (!result.monthly_generation) return []
    const currentMonth = new Date().getMonth()
    const allMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const displayNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const startMonthIndex = (currentMonth + 1) % 12
    
    const orderedIndices = [
      ...Array.from({length: 12 - startMonthIndex}, (_, i) => i + startMonthIndex),
      ...Array.from({length: startMonthIndex}, (_, i) => i)
    ]

    return orderedIndices.map(index => ({
      name: displayNames[index],
      value: result.monthly_generation![allMonths[index]] || 0
    }))
  }, [result.monthly_generation])

  const peakMonth = useMemo(() => {
    if (chartData.length === 0) return { name: '-', value: 0 }
    return chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current, { name: '-', value: 0 })
  }, [chartData])

  return (
    <div className={`p-6 sm:p-8 flex-col h-full gap-6 ${isVisible ? 'flex animate-fade-in' : 'hidden'}`}>
      {/* KPI Dashboard Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summer Avg */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:shadow-glass-hover transition-smooth relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sun-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
          <div className="p-2.5 bg-sun-50 rounded-xl mb-3 text-sun-500 group-hover:scale-110 transition-transform duration-500">
            <Sun className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <p className="text-3xl font-display font-bold text-earth-900 leading-tight">
            {solar_data.seasonal_variation.summer_sun_hours}<span className="text-base text-earth-500 font-normal ml-1">h</span>
          </p>
          <p className="text-[11px] text-earth-500 font-semibold uppercase tracking-widest mt-1">Summer Avg</p>
        </div>

        {/* Winter Avg */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:shadow-glass-hover transition-smooth relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-earth-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
          <div className="p-2.5 bg-earth-100/50 rounded-xl mb-3 text-earth-600 group-hover:scale-110 transition-transform duration-500">
            <Moon className="w-6 h-6 rotate-[-20deg]" />
          </div>
          <p className="text-3xl font-display font-bold text-earth-900 leading-tight">
            {solar_data.seasonal_variation.winter_sun_hours}<span className="text-base text-earth-500 font-normal ml-1">h</span>
          </p>
          <p className="text-[11px] text-earth-500 font-semibold uppercase tracking-widest mt-1">Winter Avg</p>
        </div>

        {/* Peak Production Month */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:shadow-glass-hover transition-smooth relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-solar-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
          <div className="p-2.5 bg-solar-50 rounded-xl mb-3 text-solar-500 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-3xl font-display font-bold text-earth-900 leading-tight">
            {peakMonth.name}
          </p>
          <p className="text-[11px] text-earth-500 font-semibold uppercase tracking-widest mt-1">Peak Month ({Math.round(peakMonth.value).toLocaleString()})</p>
        </div>
      </div>

      {/* Monthly Generation Graph */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex-1 flex flex-col min-h-[350px] group hover:shadow-glass-hover transition-smooth">
         <div className="flex items-center gap-4 mb-6">
           <div className="p-2.5 bg-white/60 border border-white/60 rounded-xl shadow-sm text-earth-600 transition-colors">
              <Zap className="w-5 h-5" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-earth-900">Projected Monthly Generation</h3>
             <p className="text-sm text-earth-500">Estimated output over the next 12 months</p>
           </div>
         </div>
         
         <div className="flex-1 w-full min-h-[250px] relative">
           {chartData.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-earth-400">
               <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
               <p className="font-medium">Monthly data not available</p>
             </div>
           ) : isVisible && (
             <div className="absolute inset-0">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorGeneration" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} 
                     dy={10} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#6b7280', fontSize: 12 }} 
                     tickFormatter={(value) => `${value}`}
                   />
                   <Tooltip 
                     contentStyle={{ 
                       borderRadius: '16px', 
                       border: '1px solid rgba(255,255,255,0.6)', 
                       boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                       backgroundColor: 'rgba(255, 255, 255, 0.95)',
                       backdropFilter: 'blur(8px)',
                       padding: '12px 16px'
                     }}
                     itemStyle={{ color: '#d97706', fontWeight: 600 }}
                     labelStyle={{ color: '#4b5563', fontWeight: 500, marginBottom: '4px' }}
                     formatter={(value: any) => [`${Number(value).toLocaleString()} kWh`, 'Generation']}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="value" 
                     stroke="#f59e0b" 
                     strokeWidth={3} 
                     fillOpacity={1} 
                     fill="url(#colorGeneration)" 
                     activeDot={{ r: 6, strokeWidth: 0, fill: '#d97706' }}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           )}
         </div>
      </div>
    </div>
  )
}
