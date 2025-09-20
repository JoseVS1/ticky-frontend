import { Todo } from "./Todo"

export const TodoList = ({ todos }) => {
  return (
    <ul>
        {todos.map(todo => (
            <Todo key={todo.id} todo={todo} />
        ))}
    </ul>
  )
}
