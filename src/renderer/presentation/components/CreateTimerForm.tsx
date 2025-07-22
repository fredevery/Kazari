import React, { useState } from 'react';
import { createTimerSession } from '../../application/slices/timer-slice';
import { useAppDispatch } from '../hooks/redux-hooks';

/**
 * Create timer form component
 */
export const CreateTimerForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(createTimerSession({
        name: name.trim(),
        duration: minutes * 60 * 1000, // Convert minutes to milliseconds
      }));

      // Reset form
      setName('');
      setMinutes(25);
    } catch (error) {
      console.error('Failed to create timer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-timer-form card">
      <h3 className="mb-3">Create New Timer</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="timer-name" className="form-label">
            Timer Name
          </label>
          <input
            id="timer-name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter timer name..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="timer-duration" className="form-label">
            Duration (minutes)
          </label>
          <input
            id="timer-duration"
            type="number"
            className="form-input"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            max={120}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Timer'}
        </button>
      </form>
    </div>
  );
};
