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
  /** System type for the integration/dependency */
  systemType:
    | 'SharePoint'
    | 'Dataverse'
    | 'Power Automate'
    | 'Power Apps'
    | 'Copilot Studio'
    | 'Azure Function'
    | 'Azure SQL'
    | 'GitHub'
    | 'Microsoft Graph'
    | 'External API'
    | 'On-premises System';
  /** Direction of data movement */
  direction: 'Inbound' | 'Outbound' | 'Bidirectional';
  /** Authentication mechanism */
  authenticationType:
    | 'None'
    | 'API Key'
    | 'OAuth 2.0'
    | 'Managed Identity'
    | 'Service Principal'
    | 'Basic'
    | 'Certificate'
    | 'Windows Integrated';
  /** Data classification handled by the integration */
  dataClassification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  /** URL for the integrated resource (report, flow, app, etc.) */
  url?: string;
  /** URL of documentation for this integration/dependency */
  documentationUrl?: string;
  /** Free-form notes */
  notes?: string;
  /** Environment this integration lives in */
  environment: Environment;
  /** Current state of the integration */
  status: 'Active' | 'Degraded' | 'Inactive' | 'Planned';
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
