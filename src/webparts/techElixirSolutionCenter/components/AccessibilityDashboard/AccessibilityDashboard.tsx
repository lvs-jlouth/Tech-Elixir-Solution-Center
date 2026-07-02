import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  IColumn,
  IDropdownOption,
  Link,
  SelectionMode,
  Stack,
  Text,
  Icon
} from '@fluentui/react';

import {
  AccessibilityCheckStatus,
  AccessibilityImpactArea,
  IAccessibilityCheck,
  IApplication
} from '../../models';
import { ACCESSIBILITY_STATUS_APPEARANCE } from '../../utils/statusPresentation';
import { sanitizeUrl } from '../../utils/urlUtils';
import { StatusBadge } from '../StatusBadge/StatusBadge';

interface IAccessibilityDashboardProps {
  app: IApplication;
}

type StatusFilter = 'All' | AccessibilityCheckStatus;
type ImpactAreaFilter = 'All' | AccessibilityImpactArea;

const STATUS_FILTER_OPTIONS: IDropdownOption[] = [
  { key: 'All', text: 'All statuses' },
  { key: 'Pass', text: 'Pass' },
  { key: 'NeedsAttention', text: 'Needs Attention' },
  { key: 'Blocked', text: 'Blocked' },
  { key: 'NotReviewed', text: 'Not Reviewed' }
];

const IMPACT_AREA_OPTIONS: IDropdownOption[] = [
  { key: 'All', text: 'All impact areas' },
  { key: 'Visual', text: 'Visual' },
  { key: 'Auditory', text: 'Auditory' },
  { key: 'Mobility', text: 'Mobility' },
  { key: 'Cognitive', text: 'Cognitive' },
  { key: 'Keyboard Navigation', text: 'Keyboard Navigation' },
  { key: 'Screen Reader', text: 'Screen Reader' },
  { key: 'Color Contrast', text: 'Color Contrast' },
  { key: 'Motion Sensitivity', text: 'Motion Sensitivity' }
];

function SummaryCard(props: {
  count: number;
  label: string;
  icon: string;
  color: string;
  background: string;
}): JSX.Element {
  const { count, label, icon, color, background } = props;

  return (
    <div
      role="group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 110,
        padding: '12px 16px',
        border: `1px solid ${color}30`,
        borderRadius: 6,
        background,
        flex: 1
      }}
      aria-label={`${label}: ${count}`}
    >
      <Icon iconName={icon} styles={{ root: { fontSize: 20, color, marginBottom: 4 } }} aria-hidden />
      <Text styles={{ root: { fontSize: 24, fontWeight: 700, color, lineHeight: '1.2' } }}>{count}</Text>
      <Text styles={{ root: { fontSize: 11, color, textAlign: 'center', marginTop: 2 } }}>{label}</Text>
    </div>
  );
}

export const AccessibilityDashboard: React.FC<IAccessibilityDashboardProps> = ({ app }) => {
  const [selectedStatus, setSelectedStatus] = React.useState<StatusFilter>('All');
  const [selectedImpactArea, setSelectedImpactArea] = React.useState<ImpactAreaFilter>('All');

  const checks = app.accessibilityChecks || [];
  const totalChecks = checks.length;
  const passedChecks = checks.filter(check => check.status === 'Pass').length;
  const attentionChecks = checks.filter(check => check.status === 'NeedsAttention').length;
  const blockedChecks = checks.filter(check => check.status === 'Blocked').length;
  const notReviewedChecks = checks.filter(check => check.status === 'NotReviewed').length;

  const filteredChecks = React.useMemo(
    () =>
      checks.filter(check => {
        const matchesStatus = selectedStatus === 'All' || check.status === selectedStatus;
        const matchesImpactArea = selectedImpactArea === 'All' || check.impactArea === selectedImpactArea;
        return matchesStatus && matchesImpactArea;
      }),
    [checks, selectedImpactArea, selectedStatus]
  );

  if (totalChecks === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Accessibility Dashboard
        </Text>
        <Text variant="small" styles={{ root: { color: '#a19f9d' } }}>
          No accessibility checks tracked for this solution.
        </Text>
      </Stack>
    );
  }

  const columns: IColumn[] = [
    {
      key: 'status',
      name: 'Status',
      minWidth: 120,
      maxWidth: 140,
      onRender: (item: IAccessibilityCheck) => (
        <StatusBadge
          {...ACCESSIBILITY_STATUS_APPEARANCE[item.status]}
          ariaLabel={`Status: ${ACCESSIBILITY_STATUS_APPEARANCE[item.status].label}`}
        />
      )
    },
    {
      key: 'requirement',
      name: 'Requirement',
      minWidth: 180,
      maxWidth: 260,
      isMultiline: true,
      onRender: (item: IAccessibilityCheck) => (
        <Text variant="small" styles={{ root: { fontWeight: 600 } }}>
          {item.requirement}
        </Text>
      )
    },
    {
      key: 'wcagReference',
      name: 'WCAG Reference',
      minWidth: 140,
      maxWidth: 180,
      onRender: (item: IAccessibilityCheck) => <Text variant="small">{item.wcagReference || '—'}</Text>
    },
    {
      key: 'impactArea',
      name: 'Impact Area',
      minWidth: 130,
      maxWidth: 160,
      onRender: (item: IAccessibilityCheck) => <Text variant="small">{item.impactArea}</Text>
    },
    {
      key: 'notes',
      name: 'Notes',
      minWidth: 160,
      maxWidth: 240,
      isMultiline: true,
      onRender: (item: IAccessibilityCheck) => (
        <Text variant="small" styles={{ root: { color: '#605e5c', fontStyle: item.notes ? 'italic' : 'normal' } }}>
          {item.notes || '—'}
        </Text>
      )
    },
    {
      key: 'remediationGuidance',
      name: 'Remediation Guidance',
      minWidth: 200,
      maxWidth: 280,
      isMultiline: true,
      onRender: (item: IAccessibilityCheck) => <Text variant="small">{item.remediationGuidance || '—'}</Text>
    },
    {
      key: 'owner',
      name: 'Owner',
      minWidth: 110,
      maxWidth: 150,
      onRender: (item: IAccessibilityCheck) => <Text variant="small">{item.owner || '—'}</Text>
    },
    {
      key: 'targetDate',
      name: 'Target Date',
      minWidth: 95,
      maxWidth: 115,
      onRender: (item: IAccessibilityCheck) => <Text variant="small">{item.targetDate || '—'}</Text>
    },
    {
      key: 'relatedDocumentUrl',
      name: 'Related Document',
      minWidth: 120,
      maxWidth: 160,
      onRender: (item: IAccessibilityCheck) =>
        item.relatedDocumentUrl ? (
          <Link href={sanitizeUrl(item.relatedDocumentUrl)} target="_blank" rel="noopener noreferrer" styles={{ root: { fontSize: 12 } }}>
            View document
          </Link>
        ) : (
          <Text variant="small" styles={{ root: { color: '#a19f9d' } }}>
            —
          </Text>
        )
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
        Accessibility Dashboard
      </Text>

      <section aria-labelledby="a11y-summary-heading">
        <Text
          id="a11y-summary-heading"
          variant="small"
          styles={{ root: { fontWeight: 600, color: '#605e5c', marginBottom: 8, display: 'block' } }}
        >
          Summary
        </Text>
        <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
          <SummaryCard count={totalChecks} label="Total Checks" icon="CheckList" color="#0078d4" background="#f0f6ff" />
          <SummaryCard count={passedChecks} label="Passed" icon="CheckMark" color="#107c10" background="#dff6dd" />
          <SummaryCard count={attentionChecks} label="Needs Attention" icon="Warning" color="#8a5700" background="#fff4ce" />
          <SummaryCard count={blockedChecks} label="Blocked" icon="BlockedSite" color="#a80000" background="#fde7e9" />
          <SummaryCard count={notReviewedChecks} label="Not Reviewed" icon="Clock" color="#605e5c" background="#f3f2f1" />
        </Stack>
      </section>

      <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
        <Dropdown
          label="Filter by status"
          selectedKey={selectedStatus}
          options={STATUS_FILTER_OPTIONS}
          onChange={(_, option) => setSelectedStatus((option?.key || 'All') as StatusFilter)}
          styles={{ dropdown: { width: 200 } }}
        />
        <Dropdown
          label="Filter by impact area"
          selectedKey={selectedImpactArea}
          options={IMPACT_AREA_OPTIONS}
          onChange={(_, option) => setSelectedImpactArea((option?.key || 'All') as ImpactAreaFilter)}
          styles={{ dropdown: { width: 220 } }}
        />
      </Stack>

      <Text variant="small" aria-live="polite">
        Showing {filteredChecks.length} of {totalChecks} check(s)
      </Text>

      <DetailsList
        items={filteredChecks}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        compact
        isHeaderVisible
        ariaLabel={`${app.name} accessibility checks`}
      />
    </Stack>
  );
};
