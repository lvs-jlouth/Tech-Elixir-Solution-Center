import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ITechElixirSolutionCenterProps {
  listName: string;
  displayMode: string;
  selectedApp: string;
  isDarkTheme: boolean;
  context: WebPartContext;
}
