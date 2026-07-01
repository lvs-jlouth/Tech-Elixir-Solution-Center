import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'TechElixirSolutionCenterWebPartStrings';
import TechElixirSolutionCenter from './components/TechElixirSolutionCenter';
import { ITechElixirSolutionCenterProps } from './components/ITechElixirSolutionCenterProps';

export interface ITechElixirSolutionCenterWebPartProps {
  listName: string;
  displayMode: string;
  selectedApp: string;
  useMockData: boolean;
}

export default class TechElixirSolutionCenterWebPart extends BaseClientSideWebPart<ITechElixirSolutionCenterWebPartProps> {

  private _isDarkTheme: boolean = false;

  public render(): void {
    const element: React.ReactElement<ITechElixirSolutionCenterProps> = React.createElement(
      TechElixirSolutionCenter,
      {
        listName: this.properties.listName || '',
        displayMode: this.properties.displayMode || 'cards',
        selectedApp: this.properties.selectedApp || '',
        useMockData: this.properties.useMockData !== false,
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
              groupName: strings.DataGroupName,
              groupFields: [
                PropertyPaneToggle('useMockData', {
                  label: strings.UseMockDataFieldLabel,
                  onText: 'Mock Data',
                  offText: 'SharePoint Lists',
                  checked: this.properties.useMockData !== false
                }),
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel,
                  description: strings.ListNameFieldDescription
                })
              ]
            },
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneDropdown('displayMode', {
                  label: strings.DisplayModeFieldLabel,
                  options: [
                    { key: 'cards', text: 'Cards' },
                    { key: 'list', text: 'List' }
                  ]
                }),
                PropertyPaneTextField('selectedApp', {
                  label: strings.SelectedAppFieldLabel,
                  placeholder: strings.SelectedAppFieldPlaceholder
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
