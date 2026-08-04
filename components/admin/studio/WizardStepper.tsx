'use client';

import React from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './studio.module.css';

export interface StepDef {
  id: number;
  label: string;
}

interface Props {
  steps: StepDef[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export default function WizardStepper({ steps, currentStep, onStepClick }: Props) {
  return (
    <div className={styles.stepperContainer}>
      {steps.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`${styles.stepItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              onClick={() => onStepClick(step.id)}
            >
              <div className={styles.stepBubble}>
                {isCompleted ? <FiCheck size={16} /> : step.id}
              </div>
              <span>{step.label}</span>
            </div>
            {idx < steps.length - 1 && <div className={styles.stepDivider} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
