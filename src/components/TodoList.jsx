import { Todo } from "./Todo"

export const TodoList = ({ todos, setFilteredTodos }) => {
  return (
    <ul>
        {todos.map(todo => (
            <Todo key={todo.id} todo={todo} setFilteredTodos={setFilteredTodos} />
        ))}
    </ul>
  )
}
