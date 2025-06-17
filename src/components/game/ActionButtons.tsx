
// This file is no longer used and can be deleted.
// All actions have been moved to BottomNavBar.tsx or handled directly in page.tsx / FarmPlot.tsx.
// If you have an advisor button or other actions you'd like to re-introduce,
// they would need to be added to a different part of the UI.
// For now, to avoid build errors if this file is imported somewhere,
// I will leave it as an empty default export.

import type { FC } from 'react';

const ActionButtons: FC = () => {
  return null;
};

export default ActionButtons;
