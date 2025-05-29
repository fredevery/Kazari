export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: number) => void;
  onSelect: (taskId: number) => void;
  selectedTaskId?: number;
  selectable?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onComplete,
  onSelect,
  selectedTaskId,
  selectable = false,
}) => {
  return (
    <ul>
      {
        tasks.map(task => (
          <li key={task.id}>
            <span>{ task.title }</span>
            { task.completed && <span>(Completed)</span> }
          </li>
        ))
      }
    </ul>
  )
}
