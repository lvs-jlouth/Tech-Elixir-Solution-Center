import * as React from 'react';
import { Icon, Link, Stack, Text } from '@fluentui/react';
import styles from './EmptyState.module.scss';

export interface IEmptyStateListNames {
  solutions: string;
  documents: string;
  releases: string;
  technicalDebt: string;
  architectureAssets: string;
  integrations: string;
  accessibilityChecks: string;
}

export interface IEmptyStateProps {
  listNames: IEmptyStateListNames;
  useMockData: boolean;
  siteUrl: string;
}

const LIST_DESCRIPTIONS: Array<{ key: keyof IEmptyStateListNames; label: string }> = [
  { key: 'solutions',          label: 'Solution Registry'            },
  { key: 'documents',          label: 'Solution Documents'           },
  { key: 'releases',           label: 'Solution Releases'            },
  { key: 'technicalDebt',      label: 'Solution Technical Debt'      },
  { key: 'architectureAssets', label: 'Solution Architecture Assets' },
  { key: 'integrations',       label: 'Solution Integrations'        },
  { key: 'accessibilityChecks',label: 'Solution Accessibility Checks'},
];

export const EmptyState: React.FC<IEmptyStateProps> = ({ listNames, useMockData, siteUrl }) => {
  const siteContentsUrl = `${siteUrl}/_layouts/15/viewlsts.aspx`;
  const registryListUrl = `${siteUrl}/Lists/${encodeURIComponent(listNames.solutions)}/AllItems.aspx`;

  return (
    <section
      className={styles.emptyState}
      aria-label="Getting started with Tech Elixir Solution Center"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className={styles.hero} aria-hidden="true">
        <Icon iconName="DatabaseView" className={styles.heroIcon} />
      </div>

      <Text as="h2" className={styles.heading}>
        No solutions found – let's get you set up
      </Text>
      <Text className={styles.lead}>
        The web part is connected to SharePoint list mode but the{' '}
        <strong>{listNames.solutions}</strong> list is empty or has not been provisioned yet.
        Follow the steps below to configure the backend and add your first solution.
      </Text>

      <Stack tokens={{ childrenGap: 24 }} className={styles.sections}>

        {/* ── Step 1: Provision lists ──────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.stepBadge} aria-hidden="true">1</div>
          <div className={styles.sectionBody}>
            <Text as="h3" className={styles.sectionTitle}>
              Provision the required SharePoint lists
            </Text>
            <Text className={styles.sectionText}>
              Run the PnP PowerShell provisioning script included with this solution
              (<code className={styles.code}>scripts/Provision-TechElixirLists.ps1</code>) against
              your SharePoint site to create all seven lists automatically. The script is
              idempotent – safe to run more than once.
            </Text>
            <Text className={styles.sectionText}>
              Alternatively, create the lists manually. The following seven lists are required:
            </Text>
            <ul className={styles.listTable} aria-label="Required SharePoint lists">
              {LIST_DESCRIPTIONS.map(({ key, label }) => {
                const configured = listNames[key];
                const isCustomised = configured !== label;
                return (
                  <li key={key} className={styles.listRow}>
                    <span className={styles.listDefault}>{label}</span>
                    {isCustomised && (
                      <span className={styles.listConfigured}>
                        <Icon iconName="Edit" className={styles.editIcon} aria-hidden="true" />
                        configured as <strong>{configured}</strong>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <Text className={styles.hint}>
              <Icon iconName="Info" className={styles.hintIcon} aria-hidden="true" />
              The list names shown in <strong>bold</strong> are the values currently set in
              the web part property pane. If you rename a list, update the matching property
              pane field in the <em>SharePoint List Names</em> section.
            </Text>
          </div>
        </div>

        {/* ── Step 2: Add first solution ───────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.stepBadge} aria-hidden="true">2</div>
          <div className={styles.sectionBody}>
            <Text as="h3" className={styles.sectionTitle}>
              Add your first solution
            </Text>
            <Text className={styles.sectionText}>
              Once the lists exist, open the <strong>{listNames.solutions}</strong> list and
              create a new item. At minimum, supply a <strong>Title</strong> (the solution name).
              Child lists (documents, releases, technical debt, etc.) link to parent solutions
              using the <code className={styles.code}>SolutionId</code> column, which should
              match the <strong>Id</strong> of the parent item.
            </Text>
            <div className={styles.actions}>
              <Link
                href={registryListUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.actionLink}
                aria-label={`Open ${listNames.solutions} list in a new tab`}
              >
                <Icon iconName="OpenInNewWindow" className={styles.actionLinkIcon} aria-hidden="true" />
                Open {listNames.solutions}
              </Link>
              <Link
                href={siteContentsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.actionLink}
                aria-label="Open site contents in a new tab"
              >
                <Icon iconName="ViewList" className={styles.actionLinkIcon} aria-hidden="true" />
                Browse site contents
              </Link>
            </div>
          </div>
        </div>

        {/* ── Tip: Switch to mock data ─────────────────────────────────────── */}
        {!useMockData && (
          <div className={styles.section}>
            <div className={`${styles.stepBadge} ${styles.stepBadgeTip}`} aria-hidden="true">
              <Icon iconName="Lightbulb" />
            </div>
            <div className={styles.sectionBody}>
              <Text as="h3" className={styles.sectionTitle}>
                Try with mock data while you set up
              </Text>
              <Text className={styles.sectionText}>
                The web part ships with sample data so you can explore all features before the
                SharePoint lists are ready. To enable it, open the property pane
                (click the <strong>Edit</strong> pencil on the page), go to the{' '}
                <strong>Data Source</strong> section, and toggle{' '}
                <strong>Use Mock Data</strong> on.
              </Text>
            </div>
          </div>
        )}

      </Stack>
    </section>
  );
};
