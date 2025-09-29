export const generateShareURL = (
  exercises: string[],
  exerciseDuration: number,
  restDuration: number
): string => {
  const params = new URLSearchParams();
  params.set('exercises', exercises.filter((e) => e.trim()).join(','));
  params.set('exerciseTime', exerciseDuration.toString());
  params.set('restTime', restDuration.toString());
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

export const parseURLParams = (): {
  exercises: string[] | null;
  exerciseTime: number | null;
  restTime: number | null;
} => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlExercises = urlParams.get('exercises');
  const urlExerciseTime = urlParams.get('exerciseTime');
  const urlRestTime = urlParams.get('restTime');

  return {
    exercises: urlExercises ? [...urlExercises.split(','), ''] : null,
    exerciseTime: urlExerciseTime ? parseInt(urlExerciseTime) : null,
    restTime: urlRestTime ? parseInt(urlRestTime) : null,
  };
};