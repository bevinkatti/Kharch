type DashboardSaveFlusher = () => Promise<void>;

let dashboardSaveFlusher: DashboardSaveFlusher | null = null;

export function registerDashboardSaveFlusher(flusher: DashboardSaveFlusher) {
  dashboardSaveFlusher = flusher;
  return () => {
    if (dashboardSaveFlusher === flusher) dashboardSaveFlusher = null;
  };
}

export function flushDashboardSave() {
  return dashboardSaveFlusher?.() ?? Promise.resolve();
}
