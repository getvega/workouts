import React, { useState } from 'react';
import { GripVertical, X } from 'lucide-react';

interface ExerciseListProps {
  exercises: string[];
  onUpdateExercise: (index: number, value: string) => void;
  onRemoveExercise: (index: number) => void;
  onReorderExercises: (dragIndex: number, dropIndex: number) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onUpdateExercise,
  onRemoveExercise,
  onReorderExercises,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    onReorderExercises(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      {exercises.map((exercise, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-gray-800 rounded-lg p-2"
          draggable={!!(exercise.trim() && index < exercises.length - 1)}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          {exercise.trim() && index < exercises.length - 1 && (
            <GripVertical className="text-gray-400 cursor-move" size={20} />
          )}
          <input
            type="text"
            value={exercise}
            onChange={(e) => onUpdateExercise(index, e.target.value)}
            placeholder="Enter exercise name"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
          />
          {exercise.trim() && index < exercises.length - 1 && (
            <button
              onClick={() => onRemoveExercise(index)}
              className="text-red-400 hover:text-red-300"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};