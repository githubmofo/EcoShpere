import {
  EmissionFactor,
  CarbonTransaction,
  EnvironmentalGoal,
  DepartmentScore,
  EmissionsPoint,
  RecentActivityItem
} from "./types";

export const initialEmissionFactors: EmissionFactor[] = [
  { id: "ef-1", name: "Electricity (Grid Average)", factorValue: 0.385, unit: "kg CO2e / kWh", status: "Active", category: "Electricity", source: "Grid", factor: 0.385, updatedAt: "2026-07-10" },
  { id: "ef-2", name: "Natural Gas", factorValue: 2.03, unit: "kg CO2e / therm", status: "Active", category: "Heating", source: "Natural Gas", factor: 2.03, updatedAt: "2026-07-09" },
  { id: "ef-3", name: "Fleet Vehicle (Gasoline)", factorValue: 8.89, unit: "kg CO2e / gallon", status: "Active", category: "Fleet", source: "Gasoline", factor: 8.89, updatedAt: "2026-07-08" },
  { id: "ef-4", name: "Air Travel (Short Haul)", factorValue: 0.15, unit: "kg CO2e / passenger-mile", status: "Active", category: "Travel", source: "Aviation", factor: 0.15, updatedAt: "2026-07-07" },
  { id: "ef-5", name: "Supplier Packaging (Plastic)", factorValue: 1.85, unit: "kg CO2e / kg", status: "Inactive", category: "Supply Chain", source: "Packaging", factor: 1.85, updatedAt: "2026-07-01" },
];

export const initialCarbonTransactions: CarbonTransaction[] = [
  { id: "tx-1", department: "Operations", sourceType: "Manufacturing", quantity: 15000, emissionsValue: 5775, operationDate: "2026-07-11", autoCalculated: true, emissionFactorId: "ef-1" },
  { id: "tx-2", department: "Facilities", sourceType: "Purchase", quantity: 5000, emissionsValue: 10150, operationDate: "2026-07-10", autoCalculated: true, emissionFactorId: "ef-2" },
  { id: "tx-3", department: "Sales", sourceType: "Fleet", quantity: 800, emissionsValue: 7112, operationDate: "2026-07-09", autoCalculated: true, emissionFactorId: "ef-3" },
  { id: "tx-4", department: "R&D", sourceType: "Expense", quantity: 12000, emissionsValue: 1800, operationDate: "2026-07-08", autoCalculated: true, emissionFactorId: "ef-4" },
  { id: "tx-5", department: "Facilities", sourceType: "Other", quantity: 200, emissionsValue: 370, operationDate: "2026-07-07", autoCalculated: false, emissionFactorId: "ef-5" },
];

export const initialEnvironmentalGoals: EnvironmentalGoal[] = [
  { id: "g-1", department: "Operations", targetEmissions: 5000, currentEmissions: 5775, startDate: "2026-06-01", endDate: "2026-12-31", status: "at-risk" },
  { id: "g-2", department: "Facilities", targetEmissions: 15000, currentEmissions: 10520, startDate: "2026-06-01", endDate: "2026-12-31", status: "on-track" },
  { id: "g-3", department: "Sales", targetEmissions: 8000, currentEmissions: 7112, startDate: "2026-06-01", endDate: "2026-12-31", status: "on-track" },
  { id: "g-4", department: "R&D", targetEmissions: 1000, currentEmissions: 1800, startDate: "2026-06-01", endDate: "2026-12-31", status: "behind" },
];

export const initialDepartmentScores: DepartmentScore[] = [
  { department: "Operations", environmental: 84, social: 79, governance: 88, overall: 83.5 },
  { department: "Facilities", environmental: 76, social: 82, governance: 80, overall: 79.0 },
  { department: "Sales", environmental: 90, social: 75, governance: 85, overall: 83.0 },
  { department: "R&D", environmental: 65, social: 88, governance: 90, overall: 79.4 },
  { department: "HR", environmental: 88, social: 92, governance: 87, overall: 88.9 },
];

export const initialEmissionsTrend: EmissionsPoint[] = [
  { date: "May 24", emissions: 24500 },
  { date: "Jun 07", emissions: 25800 },
  { date: "Jun 21", emissions: 23100 },
  { date: "Jul 05", emissions: 25157 },
];

export const initialRecentActivities: RecentActivityItem[] = [
  { id: "act-1", type: "carbon", title: "Carbon Log Entry", description: "Operations logged 15,000 kWh Electricity transaction.", timestamp: "1 hour ago", user: "Ansh Nayak" },
  { id: "act-2", type: "csr", title: "CSR Activity Approved", description: "Tree Planting Initiative approved for Social module.", timestamp: "3 hours ago", status: "Approved" },
  { id: "act-3", type: "goal", title: "Environmental Goal Nearing Limit", description: "R&D department is at 180% of emissions limit.", timestamp: "1 day ago", status: "Warning" },
  { id: "act-4", type: "compliance", title: "Policy Compliance Audited", description: "Governance audit logged 2 minor findings.", timestamp: "2 days ago", status: "Resolved" },
  { id: "act-5", type: "challenge", title: "Eco-Challenge Completed", description: "Sales department won the 'Carpool Week' challenge.", timestamp: "3 days ago" },
];
