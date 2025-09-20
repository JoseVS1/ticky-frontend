import { useContext, useState } from "react"
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router";

export const Todo = ({ todo, setFilteredTodos }) => {
    const [currentTodo, setCurrentTodo] = useState(todo);
    const { setUser, todos, setTodos, tags, errors, setErrors } = useContext(UserContext);
    const [selected, setSelected] = useState(false);
    const [completed, setCompleted] = useState(todo.status === "completed");
    const [isEditing, setIsEditing] = useState(false);
    const currentTags = todo.tags && todo.tags.map(tag => tag.id);
    const [formData, setFormData] = useState({
        title: todo.title,
        description: todo.description || "",
        status: todo.status,
        tags: currentTags
    });
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    const toggleSelected = () => {
        setSelected(!selected);
    };

    const toggleCompleted = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/todos/${todo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
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
            const response = await fetch(`${baseUrl}/api/todos/${todo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
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
            const response = await fetch(`${baseUrl}/api/todos/${todo.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
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

  return (
    <li>
        <h3><button onClick={toggleCompleted}>{completed ? "✅" : "⬛️"}</button> <span onClick={toggleSelected}>{currentTodo.title}</span></h3>

        {selected && (
            <p>{currentTodo.description}</p>
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
