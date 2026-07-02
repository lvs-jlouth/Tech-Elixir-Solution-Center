/**
 * telemetry.ts
 *
 * Lightweight telemetry utility for the TechElixirSolutionCenter web part.
 *
 * All methods write diagnostics to the browser console so that developers get
 * immediate visibility during development and in production browser DevTools.
 *
 * The interface is intentionally thin so it can later be backed by Application
 * Insights (or any other sink) by swapping the singleton `telemetry` export for
 * an implementation that calls `appInsights.trackEvent`, `trackException`, etc.
 *
 * Usage:
 *   import { telemetry } from '../utils/telemetry';
 *   telemetry.trackEvent('SolutionCardClicked', { appId: '123' });
 *   telemetry.trackError(err, 'SolutionDetailPanel.loadDetails');
 *   telemetry.trackLoadTime('appList', endMs - startMs);
 */

export type TelemetryProperties = Record<string, string | number | boolean | undefined>;

export interface ITelemetry {
  /**
   * Record a named custom event, optionally with key/value properties.
   * Future: maps to Application Insights `trackEvent`.
   */
  trackEvent(name: string, properties?: TelemetryProperties): void;

  /**
   * Record an error with contextual information for diagnostics.
   * Future: maps to Application Insights `trackException`.
   */
  trackError(error: unknown, context?: string, properties?: TelemetryProperties): void;

  /**
   * Record how long a section or operation took to load.
   * Future: maps to Application Insights `trackMetric` or a custom `trackEvent`.
   */
  trackLoadTime(section: string, durationMs: number, properties?: TelemetryProperties): void;
}

const PREFIX = '[TechElixirSolutionCenter]';

class ConsoleTelemetry implements ITelemetry {
  public trackEvent(name: string, properties?: TelemetryProperties): void {
    if (properties && Object.keys(properties).length > 0) {
      console.info(`${PREFIX} Event: ${name}`, properties);
    } else {
      console.info(`${PREFIX} Event: ${name}`);
    }
  }

  public trackError(error: unknown, context?: string, properties?: TelemetryProperties): void {
    const message = error instanceof Error ? error.message : String(error);
    const location = context ? ` in ${context}` : '';
    const extras: Record<string, unknown> = { ...properties };
    if (error instanceof Error && error.stack) {
      extras.stack = error.stack;
    }
    console.error(`${PREFIX} Error${location}: ${message}`, extras);
  }

  public trackLoadTime(section: string, durationMs: number, properties?: TelemetryProperties): void {
    const extras = properties && Object.keys(properties).length > 0 ? ` ${JSON.stringify(properties)}` : '';
    console.info(`${PREFIX} LoadTime: ${section} completed in ${durationMs}ms${extras}`);
  }
}

/**
 * Singleton telemetry instance.
 * Replace this export with an Application Insights-backed implementation
 * when you are ready to connect real telemetry.
 */
export const telemetry: ITelemetry = new ConsoleTelemetry();
