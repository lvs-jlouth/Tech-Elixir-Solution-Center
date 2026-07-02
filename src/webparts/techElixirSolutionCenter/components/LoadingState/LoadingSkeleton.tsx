import * as React from 'react';
import { Shimmer, ShimmerElementType, Stack } from '@fluentui/react';

export type SkeletonVariant =
  | 'dashboard'
  | 'detailPanel'
  | 'documents'
  | 'releases'
  | 'architecture'
  | 'integrations'
  | 'technicalDebt'
  | 'accessibility';

export interface ILoadingSkeletonProps {
  variant: SkeletonVariant;
}

// ── Aria helpers ──────────────────────────────────────────────────────────────

const VARIANT_LABELS: Record<SkeletonVariant, string> = {
  dashboard:      'Loading solutions, please wait',
  detailPanel:    'Loading solution details, please wait',
  documents:      'Loading documents, please wait',
  releases:       'Loading releases, please wait',
  architecture:   'Loading architecture assets, please wait',
  integrations:   'Loading integrations, please wait',
  technicalDebt:  'Loading technical debt items, please wait',
  accessibility:  'Loading accessibility checks, please wait'
};

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0
};

// ── Shimmer element helpers ───────────────────────────────────────────────────

type ShimEl = { type: ShimmerElementType; height?: number; width?: string };

function L(h: number, w?: string): ShimEl {
  return { type: ShimmerElementType.line, height: h, ...(w !== undefined ? { width: w } : {}) };
}

function G(w: string): ShimEl {
  return { type: ShimmerElementType.gap, width: w };
}

const rowStyle = { shimmerWrapper: { marginBottom: 8 } };

// A single shimmer line that fills the given portion of its container
function ShimRow({ h = 12, w }: { h?: number; w?: string }): JSX.Element {
  const els: ShimEl[] = w ? [L(h, w), G(`calc(100% - ${w})`)] : [L(h)];
  return <Shimmer styles={rowStyle} shimmerElements={els} />;
}

// ── Per-variant skeleton bodies ───────────────────────────────────────────────

function DashboardSkeleton(): JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 16,
        marginTop: 16
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ padding: 16, border: '1px solid #edebe9', borderRadius: 4 }}>
          <ShimRow h={18} w="65%" />
          <ShimRow h={12} />
          <ShimRow h={12} w="85%" />
          <ShimRow h={12} w="45%" />
          <ShimRow h={20} w="35%" />
        </div>
      ))}
    </div>
  );
}

function DetailPanelSkeleton(): JSX.Element {
  return (
    <Stack tokens={{ childrenGap: 24 }}>
      {/* Description section */}
      <div>
        <ShimRow h={16} w="40%" />
        <ShimRow h={12} />
        <ShimRow h={12} w="90%" />
        <ShimRow h={12} w="75%" />
      </div>

      {/* Metadata grid */}
      <div>
        <ShimRow h={16} w="30%" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: '#f3f2f1', borderRadius: 4, padding: 10 }}>
              <ShimRow h={10} w="60%" />
              <ShimRow h={14} w="80%" />
            </div>
          ))}
        </div>
      </div>

      {/* Links section */}
      <div>
        <ShimRow h={16} w="25%" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f2f1' }}
          >
            <div style={{ flexShrink: 0, width: 20 }}>
              <Shimmer shimmerElements={[{ type: ShimmerElementType.circle, height: 16 }]} />
            </div>
            <div style={{ flex: '0 0 40%' }}>
              <Shimmer shimmerElements={[L(12)]} />
            </div>
            <div style={{ flex: 1 }}>
              <Shimmer shimmerElements={[L(12, '70%'), G('30%')]} />
            </div>
          </div>
        ))}
      </div>

      {/* Health summary */}
      <div>
        <ShimRow h={16} w="35%" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: '#f3f2f1', borderRadius: 4, padding: '8px 12px' }}>
              <ShimRow h={12} w="55%" />
              <ShimRow h={20} w="40%" />
            </div>
          ))}
        </div>
      </div>
    </Stack>
  );
}

function DocumentsSkeleton(): JSX.Element {
  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Completeness section */}
      <div>
        <ShimRow h={16} w="45%" />
        <Shimmer styles={{ shimmerWrapper: { marginBottom: 4 } }} shimmerElements={[L(10)]} />
        <ShimRow h={10} w="20%" />
      </div>

      {/* Document matrix section */}
      <div>
        <ShimRow h={16} w="38%" />
        {/* Header row */}
        <div style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '2px solid #edebe9', marginBottom: 4 }}>
          {['30%', '14%', '14%', '14%', '14%', '14%'].map((w, i) => (
            <div key={i} style={{ flex: `0 0 ${w}` }}>
              <Shimmer shimmerElements={[L(12, '90%'), G('10%')]} />
            </div>
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f2f1' }}>
            {['30%', '14%', '14%', '14%', '14%', '14%'].map((w, j) => (
              <div key={j} style={{ flex: `0 0 ${w}` }}>
                <Shimmer shimmerElements={[L(12, '85%'), G('15%')]} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Stack>
  );
}

function ReleasesSkeleton(): JSX.Element {
  return (
    <Stack tokens={{ childrenGap: 0 }}>
      <ShimRow h={16} w="35%" />
      <div style={{ marginTop: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{ border: '1px solid #edebe9', borderRadius: 4, padding: 12, marginBottom: 18 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: '0 0 160px' }}>
                <Shimmer shimmerElements={[L(16, '90%'), G('10%')]} />
              </div>
              <div style={{ flex: '0 0 100px' }}>
                <Shimmer shimmerElements={[L(12, '85%'), G('15%')]} />
              </div>
            </div>
            <ShimRow h={12} w="30%" />
            <ShimRow h={12} />
            <ShimRow h={12} w="80%" />
            <ShimRow h={12} w="50%" />
            <ShimRow h={12} w="35%" />
          </div>
        ))}
      </div>
    </Stack>
  );
}

function ArchitectureSkeleton(): JSX.Element {
  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <ShimRow h={16} w="40%" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} style={{ padding: 10, border: '1px solid #edebe9', borderRadius: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ flexShrink: 0, width: 24 }}>
              <Shimmer shimmerElements={[{ type: ShimmerElementType.circle, height: 18 }]} />
            </div>
            <div style={{ flex: '0 0 50%' }}>
              <Shimmer shimmerElements={[L(16, '90%'), G('10%')]} />
            </div>
          </div>
          <ShimRow h={12} w="70%" />
          <ShimRow h={12} w="55%" />
          <ShimRow h={12} w="60%" />
          <ShimRow h={12} w="45%" />
        </div>
      ))}
    </Stack>
  );
}

function IntegrationsSkeleton(): JSX.Element {
  const cols: string[] = ['20%', '25%', '20%', '20%', '15%'];
  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <ShimRow h={16} w="40%" />
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '2px solid #edebe9' }}>
        {cols.map((w, i) => (
          <div key={i} style={{ flex: `0 0 ${w}` }}>
            <Shimmer shimmerElements={[L(12, '90%'), G('10%')]} />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f2f1' }}>
          {cols.map((w, j) => (
            <div key={j} style={{ flex: `0 0 ${w}` }}>
              <Shimmer shimmerElements={[L(12, '85%'), G('15%')]} />
            </div>
          ))}
        </div>
      ))}
    </Stack>
  );
}

function TechnicalDebtSkeleton(): JSX.Element {
  const cols: string[] = ['16%', '20%', '11%', '9%', '17%', '9%', '9%', '9%'];
  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <ShimRow h={16} w="40%" />
      {/* Filter dropdowns */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 220 }}>
            <ShimRow h={12} w="70%" />
            <Shimmer shimmerElements={[L(32)]} />
          </div>
        ))}
      </div>
      {/* Header */}
      <div style={{ display: 'flex', gap: 4, padding: '6px 0', borderBottom: '2px solid #edebe9' }}>
        {cols.map((w, i) => (
          <div key={i} style={{ flex: `0 0 ${w}` }}>
            <Shimmer shimmerElements={[L(12, '90%'), G('10%')]} />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 4, padding: '6px 0', borderBottom: '1px solid #f3f2f1' }}>
          {cols.map((w, j) => (
            <div key={j} style={{ flex: `0 0 ${w}` }}>
              <Shimmer shimmerElements={[L(12, '85%'), G('15%')]} />
            </div>
          ))}
        </div>
      ))}
    </Stack>
  );
}

function AccessibilitySkeleton(): JSX.Element {
  const cols: string[] = ['12%', '20%', '13%', '12%', '15%', '17%', '11%'];
  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <ShimRow h={16} w="40%" />

      {/* Summary cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{ flex: '1 1 110px', padding: '12px 16px', border: '1px solid #edebe9', borderRadius: 6 }}
          >
            <div style={{ marginBottom: 6 }}>
              <Shimmer shimmerElements={[{ type: ShimmerElementType.circle, height: 20 }]} />
            </div>
            <ShimRow h={24} w="60%" />
            <ShimRow h={11} w="80%" />
          </div>
        ))}
      </div>

      {/* Filter dropdowns */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ width: i === 0 ? 200 : 220 }}>
            <ShimRow h={12} w="80%" />
            <Shimmer shimmerElements={[L(32)]} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', gap: 4, padding: '6px 0', borderBottom: '2px solid #edebe9' }}>
        {cols.map((w, i) => (
          <div key={i} style={{ flex: `0 0 ${w}` }}>
            <Shimmer shimmerElements={[L(12, '90%'), G('10%')]} />
          </div>
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 4, padding: '6px 0', borderBottom: '1px solid #f3f2f1' }}>
          {cols.map((w, j) => (
            <div key={j} style={{ flex: `0 0 ${w}` }}>
              <Shimmer shimmerElements={[L(12, '85%'), G('15%')]} />
            </div>
          ))}
        </div>
      ))}
    </Stack>
  );
}

// ── Registry ──────────────────────────────────────────────────────────────────

const VARIANT_RENDERERS: Record<SkeletonVariant, () => JSX.Element> = {
  dashboard:     () => <DashboardSkeleton />,
  detailPanel:   () => <DetailPanelSkeleton />,
  documents:     () => <DocumentsSkeleton />,
  releases:      () => <ReleasesSkeleton />,
  architecture:  () => <ArchitectureSkeleton />,
  integrations:  () => <IntegrationsSkeleton />,
  technicalDebt: () => <TechnicalDebtSkeleton />,
  accessibility: () => <AccessibilitySkeleton />
};

// ── Public component ──────────────────────────────────────────────────────────

export const LoadingSkeleton: React.FC<ILoadingSkeletonProps> = ({ variant }) => (
  <div>
    {/* Visually hidden live region so screen readers announce the loading state */}
    <span role="status" style={srOnlyStyle}>
      {VARIANT_LABELS[variant]}
    </span>
    {/* Shimmer visuals are decorative from a screen-reader perspective */}
    <div aria-hidden={true}>
      {VARIANT_RENDERERS[variant]()}
    </div>
  </div>
);
