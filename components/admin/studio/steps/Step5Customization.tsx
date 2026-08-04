'use client';

import React from 'react';
import { ProductStudioState } from '@/lib/types/schema';
import styles from '../studio.module.css';
import PrintProductionStudio from '../print-studio/PrintProductionStudio';

interface Props {
  state: Partial<ProductStudioState>;
  setState: React.Dispatch<React.SetStateAction<Partial<ProductStudioState>>>;
}

export default function Step5Customization({ state, setState }: Props) {
  const product = state.product || {};

  const toggleCustomizable = (val: boolean) => {
    setState(prev => ({
      ...prev,
      product: { ...prev.product, isCustomizable: val }
    }));
  };

  return (
    <div>
      <div className={styles.stepTitle}>Step 5: Print Production Studio</div>
      <div className={styles.stepSubtitle}>
        Define mockup sets, print locations, and visually map print areas with advanced production rules.
      </div>

      <div className={styles.attrSection} style={{ marginBottom: '24px' }}>
        <div className={styles.attrHeader}>
          <span>Enable Web-to-Print for this Product</span>
          <input
            type="checkbox"
            checked={product.isCustomizable ?? true}
            onChange={(e) => toggleCustomizable(e.target.checked)}
          />
        </div>
      </div>

      {product.isCustomizable !== false && (
        <PrintProductionStudio state={state} setState={setState} />
      )}
    </div>
  );
}
