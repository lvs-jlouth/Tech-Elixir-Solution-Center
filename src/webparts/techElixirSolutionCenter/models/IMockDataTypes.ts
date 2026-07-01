import { DocumentationStatus, Environment, HealthStatus } from '../constants';

/**
 * Represents the completeness/status of a single documentation section for an app.
 * Sections correspond to the numbered entries in DOCUMENTATION_SECTIONS.
 */
export interface IDocument {
  /** Unique record identifier */
  id: string;
  /** FK – the owning application id */
  appId: string;
  /** References IDocumentationSection.key (e.g. '01-architecture') */
  sectionKey: string;
  /** Display number (e.g. '01') */
  sectionNumber: string;
  /** Display title (e.g. 'Architecture') */
  sectionTitle: string;
  /** Current documentation status for this section */
  status: DocumentationStatus;
  /** Direct URL to the document in SharePoint / GitHub */
  url?: string;
  /** ISO date string of most recent update */
  lastUpdated?: string;
  /** Person or team responsible for this document */
  owner?: string;
  /** Optional free-text notes or gap description */
  notes?: string;
}

/** Describes an integration between an app and an external system or service. */
export interface IIntegration {
  /** Unique record identifier */
  id: string;
  /** FK – the owning application id */
  appId: string;
  /** Human-readable name of the integrated system */
  name: string;
  /** Category of integration */
  type:
    | 'SharePoint'
    | 'PowerBI'
    | 'PowerAutomate'
    | 'Teams'
    | 'Graph'
    | 'AzureFunction'
    | 'Dataverse'
    | 'GitHub'
    | 'External';
  /** Brief description of what the integration does */
  description?: string;
  /** URL for the integrated resource (report, flow, app, etc.) */
  url?: string;
  /** Environment this integration lives in */
  environment: Environment;
  /** Current operational health of the integration */
  healthStatus: HealthStatus;
  /** Optional contact or owning team */
  owner?: string;
}

/**
 * Rolled-up health snapshot for a single application.
 * Each dimension maps to a HealthStatus value so the UI can render a traffic-light.
 */
export interface IHealthSummary {
  /** FK – the owning application id */
  appId: string;
  /** Overall composite health colour */
  overall: HealthStatus;
  /** Health of the documentation coverage */
  documentation: HealthStatus;
  /** Health of the accessibility review */
  accessibility: HealthStatus;
  /** Health of the security posture */
  security: HealthStatus;
  /** ISO date string of the last health assessment */
  lastAssessed?: string;
  /** Any explanatory notes */
  notes?: string;
}
