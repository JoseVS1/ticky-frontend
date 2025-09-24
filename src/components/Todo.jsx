import { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router";
import { fetchWithAuth } from "../helpers/api";
import { format } from "date-fns";
import { toDatetimeLocal } from "../helpers/toDatetimeLocal"

export const Todo = ({ todo, setFilteredTodos }) => {
    const [currentTodo, setCurrentTodo] = useState(todo);
    const { setUser, todos, setTodos, tags, errors, setErrors } = useContext(UserContext);
    const [selected, setSelected] = useState(false);
    const [completed, setCompleted] = useState(todo.status === "completed");
    const [isEditing, setIsEditing] = useState(false);
    const [isOverdue, setIsOverdue] = useState(false);
    const [isDueToday, setIsDueToday] = useState(false);
    const currentTags = todo.tags && todo.tags.map(tag => tag.id);
    const readableDueDate = currentTodo.dueDate 
        ? format(new Date(currentTodo.dueDate), "yyyy-MM-dd h:mm a") 
        : "No due date";
    const [formData, setFormData] = useState({
        title: todo.title,
        description: todo.description || "",
        status: todo.status,
        priority: todo.priority,
        dueDate: new Date(todo.dueDate).toLocaleString(),
        tags: currentTags
    });
    const navigate = useNavigate();
    const [now, setNow] = useState(new Date());
    const formattedNow = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0") + "T" +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());

            const formattedToday = now.getFullYear() + "-" +
                String(now.getMonth() + 1).padStart(2, "0") + "-" +
                String(now.getDate()).padStart(2, "0");
            const dueDate = new Date(currentTodo.dueDate);
            const formattedDueDate = dueDate.getFullYear() + "-" +
                String(dueDate.getMonth() + 1).padStart(2, "0") + "-" +
                String(dueDate.getDate()).padStart(2, "0");

            if (formattedDueDate === formattedToday) {
                setIsDueToday(true);
            } else {
                setIsDueToday(false);
            }

            if (currentTodo.dueDate && new Date(currentTodo.dueDate).getTime() < now.getTime()) {
                setIsOverdue(true);
            } else {
                setIsOverdue(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentTodo, now]);

    const toggleSelected = () => {
        setSelected(!selected);
    };

    const toggleCompleted = async () => {
        try {
            const response = await fetchWithAuth(`${baseUrl}/api/todos/${todo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: currentTodo.title,
                    status: completed ? "pending" : "completed"
                })
            });
            const data = await response.json();

            if (response.ok) {
                setCurrentTodo(data.todo);
                setCompleted(data.todo.status === "completed");
                setFilteredTodos(prevFilteredTodos => prevFilteredTodos.filter(todo => todo.id !== data.todo.id));
                setTodos(prevTodos => prevTodos.map(todo => todo.id === data.todo.id ? data.todo : todo));
            } else {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    setUser(null);
                    navigate("/login")
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleIsEditing = () => {
        if (!isEditing) {
            setFormData({
                title: currentTodo.title,
                description: currentTodo.description || "",
                status: currentTodo.status,
                priority: currentTodo.priority,
                dueDate: toDatetimeLocal(currentTodo.dueDate),
                tags: currentTags
            });
        }

        setIsEditing(!isEditing);
    };

    const handleInputChange = e => {
        setFormData(prevFormData => (
            {
                ...prevFormData,
                [e.target.name]: e.target.value
            }
        ))
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const response = await fetchWithAuth(`${baseUrl}/api/todos/${todo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                    tags: formData.tags
                })
            });
            const data = await response.json();

            if (response.ok) {
                setCurrentTodo(data.todo);
                setIsEditing(false);
                setTodos(prevTodos => prevTodos.map(todo => todo.id === data.todo.id ? data.todo : todo));
            } else {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    setUser(null);
                    navigate("/login")
                }
            }
        } catch (err) {
            setErrors({ errors: [{ message: "Internal server error" }]});
        };
    };

    const handleDeleteTodo = async () => {
        try {
            const response = await fetchWithAuth(`${baseUrl}/api/todos/${todo.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();

            if (response.ok) {
                setTodos(prevTodos => prevTodos.filter(x => x.id !== todo.id));
            } else {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    setUser(null);
                    navigate("/login")
                }
            }
        } catch (err) {
            setErrors({ errors: [{ message: "Internal server error" }]});
        };
    };

    const handleTagsChange = e => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prevFormData => ({
            ...prevFormData,
            tags: selectedOptions
        }));
    };

    const handlePriorityChange = e => {
        setFormData(prevFormData => ({
            ...prevFormData,
            priority: e.target.value
        }));
    };

  return (
    <li>
        <h3><button onClick={toggleCompleted}>{completed ? "✅" : "⬛️"}</button> <span onClick={toggleSelected}>{currentTodo.title}</span></h3>

        {selected && (
            <div>
                <p>{currentTodo.description}</p>
                <span>Priority: {`${currentTodo.priority[0].toUpperCase()}${currentTodo.priority.slice(1)}`}</span>
                <span>Due date: {readableDueDate} { isOverdue && "Overdue" } { isDueToday && "Due Today"}</span>
            </div>
        )}

        {currentTodo.tags && currentTodo.tags.length > 0 && <p>Tags: {currentTodo.tags.map((tag, i)=> (`${tag.name}${i + 1 === currentTodo.tags.length ? "" : ", "}`))}</p>}

        <button onClick={toggleIsEditing}>Edit</button>
        <button onClick={handleDeleteTodo}>Delete</button>

        {isEditing && (
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title:</label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} />

                <label htmlFor="description">Description:</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleInputChange}></textarea>

                <label htmlFor="priority">Priority:</label>
                <select name="priority" id="priority" value={formData.priority} onChange={handlePriorityChange}>
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <label htmlFor="dueDate">Due Date:</label>
                <input type="datetime-local" name="dueDate" id="dueDate" min={formattedNow} value={toDatetimeLocal(formData.dueDate)} onChange={handleInputChange} />

                <label htmlFor="tags">Tags:</label>
                <select name="tags" id="tags" multiple value={formData.tags} onChange={handleTagsChange}>
                    <option value=""></option>
                    {tags.map(tag => (
                        <option key={tag.id} value={String(tag.id)}>{tag.name}</option>
                    ))}
                </select>

                <button type="button" onClick={toggleIsEditing}>Cancel</button>
                <button type="submit">Edit</button>
            </form>
        )}
    </li>
  )
}
