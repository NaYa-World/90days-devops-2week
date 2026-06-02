import React from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { BuildLogView } from './BuildLogView';
import { ReviewsView } from './ReviewsView';

interface Props {
  appState: UseAppStateReturnType;
}

export const BuildReviewComboView: React.FC<Props> = ({ appState }) => {
  return (
    <div className="wrap" style={{ maxWidth: '1400px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', alignItems: 'start' }}>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r12)' }}>
          <BuildLogView appState={appState} />
        </div>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r12)' }}>
          <ReviewsView appState={appState} />
        </div>
      </div>
    </div>
  );
};
export default BuildReviewComboView;
