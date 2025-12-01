import { WatchlistPage } from "./pages/WatchlistPage"
import { PortfolioPage } from "./pages/PortfolioPage"
import { useUIStore } from "./stores/useUIStore"
import { Activity, PieChart, List } from "lucide-react"

function App() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">KTick</h1>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("watchlist")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === "watchlist"
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
                }`}
            >
              <List className="w-4 h-4" />
              Watchlist
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === "portfolio"
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
                }`}
            >
              <PieChart className="w-4 h-4" />
              Portfolio
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "portfolio" ? (
          <PortfolioPage />
        ) : (
          <WatchlistPage />
        )}
      </div>
    </div>
  )
}

export default App
