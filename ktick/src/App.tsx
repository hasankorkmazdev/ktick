import { useState, useEffect } from "react"
import { StockSelector } from "@/components/StockSelector"
import { IntervalSelector } from "@/components/IntervalSelector"
import { StockList } from "@/components/StockList"
import { api, StockDetail, StockListItem } from "@/services/api"
import { Activity, LayoutGrid, LayoutList } from "lucide-react"
import { Button } from "./components/ui/button"

function App() {
  const [selectedStocks, setSelectedStocks] = useState<StockListItem[]>(() => {
    const saved = localStorage.getItem("selectedStocks");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [stockData, setStockData] = useState<StockDetail[]>([])
  const [intervalMs, setIntervalMs] = useState<number>(() => {
    const saved = localStorage.getItem("intervalMs")
    return saved ? parseInt(saved) : 60 * 1000
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"card" | "row">("card")

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("selectedStocks", JSON.stringify(selectedStocks))
  }, [selectedStocks])

  useEffect(() => {
    localStorage.setItem("intervalMs", intervalMs.toString())
  }, [intervalMs])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (selectedStocks.length === 0) {
        setStockData([])
        return
      }

      try {
        const promises = selectedStocks.map(stock => api.getStockPrice(stock))
        const results = await Promise.all(promises)
        setStockData(results)
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error fetching stock data:", error)
      }
    }

    fetchData() // Initial fetch

    const intervalId = setInterval(fetchData, intervalMs)
    return () => clearInterval(intervalId)
  }, [selectedStocks, intervalMs])

  const handleSelectStock = (stock: StockListItem) => {
    const exists = selectedStocks.some(s => s.id === stock.id);
  
    if (!exists) {
      setSelectedStocks(prev => [...prev, stock]);
    }
  };

  const handleRemoveStock = (code: string) => {
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">KTicker</h1>
              <p className="text-sm text-muted-foreground">Enstrüman ve Pörtföy Yönetimi</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs text-muted-foreground">Son Güncelleme</p>
              <p className="text-sm font-medium font-mono">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}
              </p>
            </div>
            
            <IntervalSelector intervalMs={intervalMs} onChange={setIntervalMs} />
            <StockSelector onSelect={handleSelectStock} selectedStocks={selectedStocks} />
             {/* Görünüm toggle */}
             <Button id="qqq"
             variant={"outline"}
              onClick={() => setViewMode(prev => prev === "card" ? "row" : "card")}
              title="Görünümü değiştir"
            >
              {viewMode === "card" ? <LayoutList className="w-5 h-5"/> : <LayoutGrid className="w-5 h-5"/>}
            </Button>
          </div>
        </div>

        {/* Content */}
        <StockList 
    stockData={stockData} 
    onRemove={handleRemoveStock} 
    viewMode={viewMode} 
/>
      </div>
    </div>
  )
}

export default App
