import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ITechElixirSolutionCenterProps {
  webPartTitle: string;
  webPartVersion: string;
  useMockData: boolean;
  solutionRegistryListName: string;
  documentsListName: string;
  releasesListName: string;
  technicalDebtListName: string;
  architectureAssetsListName: string;
  integrationsListName: string;
  accessibilityChecksListName: string;
  defaultSelectedSolution: string;
  showGitHubLinks: boolean;
  showPowerPlatformLinks: boolean;
  showAccessibilityDashboard: boolean;
  compactMode: boolean;
  isDarkTheme: boolean;
  context: WebPartContext;
}
