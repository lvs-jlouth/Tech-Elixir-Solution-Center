import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'TechElixirSolutionCenterWebPartStrings';
import TechElixirSolutionCenter from './components/TechElixirSolutionCenter';
import { ITechElixirSolutionCenterProps } from './components/ITechElixirSolutionCenterProps';

export interface ITechElixirSolutionCenterWebPartProps {
  webPartTitle: string;
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
}

export default class TechElixirSolutionCenterWebPart extends BaseClientSideWebPart<ITechElixirSolutionCenterWebPartProps> {

  private _isDarkTheme: boolean = false;

  public render(): void {
    const element: React.ReactElement<ITechElixirSolutionCenterProps> = React.createElement(
      TechElixirSolutionCenter,
      {
        webPartTitle: this.properties.webPartTitle || 'Tech Elixir Solution Center',
        useMockData: this.properties.useMockData !== false,
        solutionRegistryListName: this.properties.solutionRegistryListName || 'Solution Registry',
        documentsListName: this.properties.documentsListName || 'Solution Documents',
        releasesListName: this.properties.releasesListName || 'Solution Releases',
        technicalDebtListName: this.properties.technicalDebtListName || 'Solution Technical Debt',
        architectureAssetsListName: this.properties.architectureAssetsListName || 'Solution Architecture Assets',
        integrationsListName: this.properties.integrationsListName || 'Solution Integrations',
        accessibilityChecksListName: this.properties.accessibilityChecksListName || 'Solution Accessibility Checks',
        defaultSelectedSolution: this.properties.defaultSelectedSolution || '',
        showGitHubLinks: this.properties.showGitHubLinks !== false,
        showPowerPlatformLinks: this.properties.showPowerPlatformLinks !== false,
        showAccessibilityDashboard: this.properties.showAccessibilityDashboard !== false,
        compactMode: this.properties.compactMode === true,
        isDarkTheme: this._isDarkTheme,
        context: this.context
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }
    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;
    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.GeneralGroupName,
              groupFields: [
                PropertyPaneTextField('webPartTitle', {
                  label: strings.WebPartTitleFieldLabel,
                  placeholder: 'Tech Elixir Solution Center'
                })
              ]
            },
            {
              groupName: strings.DataGroupName,
              groupFields: [
                PropertyPaneToggle('useMockData', {
                  label: strings.UseMockDataFieldLabel,
                  onText: 'Mock Data',
                  offText: 'SharePoint Lists',
                  checked: this.properties.useMockData !== false
                })
              ]
            },
            {
              groupName: strings.ListNamesGroupName,
              groupFields: [
                PropertyPaneTextField('solutionRegistryListName', {
                  label: strings.SolutionRegistryListNameFieldLabel,
                  description: strings.SolutionRegistryListNameFieldDescription,
                  placeholder: 'Solution Registry'
                }),
                PropertyPaneTextField('documentsListName', {
                  label: strings.DocumentsListNameFieldLabel,
                  description: strings.DocumentsListNameFieldDescription,
                  placeholder: 'Solution Documents'
                }),
                PropertyPaneTextField('releasesListName', {
                  label: strings.ReleasesListNameFieldLabel,
                  description: strings.ReleasesListNameFieldDescription,
                  placeholder: 'Solution Releases'
                }),
                PropertyPaneTextField('technicalDebtListName', {
                  label: strings.TechnicalDebtListNameFieldLabel,
                  description: strings.TechnicalDebtListNameFieldDescription,
                  placeholder: 'Solution Technical Debt'
                }),
                PropertyPaneTextField('architectureAssetsListName', {
                  label: strings.ArchitectureAssetsListNameFieldLabel,
                  description: strings.ArchitectureAssetsListNameFieldDescription,
                  placeholder: 'Solution Architecture Assets'
                }),
                PropertyPaneTextField('integrationsListName', {
                  label: strings.IntegrationsListNameFieldLabel,
                  description: strings.IntegrationsListNameFieldDescription,
                  placeholder: 'Solution Integrations'
                }),
                PropertyPaneTextField('accessibilityChecksListName', {
                  label: strings.AccessibilityChecksListNameFieldLabel,
                  description: strings.AccessibilityChecksListNameFieldDescription,
                  placeholder: 'Solution Accessibility Checks'
                })
              ]
            },
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneTextField('defaultSelectedSolution', {
                  label: strings.DefaultSelectedSolutionFieldLabel,
                  placeholder: strings.DefaultSelectedSolutionFieldPlaceholder
                }),
                PropertyPaneToggle('showGitHubLinks', {
                  label: strings.ShowGitHubLinksFieldLabel,
                  checked: this.properties.showGitHubLinks !== false
                }),
                PropertyPaneToggle('showPowerPlatformLinks', {
                  label: strings.ShowPowerPlatformLinksFieldLabel,
                  checked: this.properties.showPowerPlatformLinks !== false
                }),
                PropertyPaneToggle('showAccessibilityDashboard', {
                  label: strings.ShowAccessibilityDashboardFieldLabel,
                  checked: this.properties.showAccessibilityDashboard !== false
                }),
                PropertyPaneToggle('compactMode', {
                  label: strings.CompactModeFieldLabel,
                  checked: this.properties.compactMode === true
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
