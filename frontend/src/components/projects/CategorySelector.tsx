import React from 'react';
import type { ProjectCreateSimple } from '../../types/project';
import './CategorySelector.css';

interface CategorySelectorProps {
  onSelectCategory: (category: string) => void;
  onCancel: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelectCategory,
  onCancel,
}) => {
  const projectTypes = [
    { value: 'bike', label: 'Motorcycle', icon: '🏍️' },
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'truck', label: 'Truck', icon: '🚛' },
    { value: 'boat', label: 'Boat', icon: '🚢' },
    { value: 'aircraft', label: 'Aircraft', icon: '✈️' },
    { value: 'other', label: 'Other', icon: '🔧' },
  ];

  return (
    <div className="category-selector-overlay">
      <div className="category-selector-modal">
        <div className="category-selector-header">
          <h2>Choose Project Type</h2>
          <button onClick={onCancel} className="close-btn" title="Close">
            ×
          </button>
        </div>

        <div className="category-grid">
          {projectTypes.map(type => (
            <button
              key={type.value}
              onClick={() => onSelectCategory(type.value)}
              className="category-option"
            >
              <span className="category-icon">{type.icon}</span>
              <span className="category-label">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="category-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
