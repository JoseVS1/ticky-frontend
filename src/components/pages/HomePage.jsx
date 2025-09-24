import { useContext, useEffect, useState } from "react"
import UserContext from "../../context/UserContext"
import { TodoList } from "../TodoList";
import { Errors } from "../Errors";
import { Navigate, useNavigate } from "react-router";
import { fetchWithAuth } from "../../helpers/api"

export const HomePage = () => {
  const { user, setUser, todos, setTodos, tags, setTags, errors, setErrors } = useContext(UserContext);
  const [isCreatingTodo, setIsCreatingTodo] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [todoFormData, setTodoFormData] = useState({
    title: "",
    description: "",
    priority: "none",
    dueDate: "",
    tags: []
  });
  const [filterTodoFormData, setFilterTodoFormData] = useState({
    tags: [],
    status: "all",
    priority: "all",
    dueDate: "all"
  })
  const [tagFormData, setTagFormData] = useState({
    name: ""
  });
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const [filteredTodos, setFilteredTodos] = useState(todos);
  const navigate = useNavigate();
  const now = new Date();
  const formattedNow = now.getFullYear() + "-" +
  String(now.getMonth() + 1).padStart(2, "0") + "-" +
  String(now.getDate()).padStart(2, "0") + "T" +
  String(now.getHours()).padStart(2, "0") + ":" +
  String(now.getMinutes()).padStart(2, "0");

  useEffect(() => {
    if (filterTodoFormData.status === "all") {
      setFilteredTodos(todos);
    }
  }, [todos]);

  const toggleIsCreatingTodo = () => {
    setTodoFormData({
      title: "",
      description: "",
      priority: "none",
      dueDate: "",
      tags: []
    });

    setIsCreatingTodo(!isCreatingTodo);
  };

  const toggleIsCreatingTag = () => {
    setTagFormData({
      name: ""
    });

    setIsCreatingTag(!isCreatingTag);
  }

  const handleInputChange = e => {
    setTodoFormData(prevTodoFormData => (
      {
        ...prevTodoFormData,
        [e.target.name]: e.target.value
      }
    ));
  };

  const handleTagInputChange = e => {
    setTagFormData(prevTagFormData => (
      {
        ...prevTagFormData,
        [e.target.name]: e.target.value
      }
    ));
  };

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const response = await fetchWithAuth(`${baseUrl}/api/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: todoFormData.title,
          description: todoFormData.description,
          priority: todoFormData.priority,
          dueDate: todoFormData.dueDate ? new Date(todoFormData.dueDate).toISOString() : "",
          tags: todoFormData.tags
        })
      });
      const data = await response.json();

      if (response.ok) {
        setTodos(prevTodos => [...prevTodos, data.todo]);
        toggleIsCreatingTodo();
      } else {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            setUser(null);
            navigate("/login")
        }

        if (data.errors || data.message) {
          setErrors({ errors: [...(data.errors ? [{message: data.errors[0].message}] : []), ...(data.message ? [{message: data.message}] : [])]});
        }
      }
    } catch (err) {
      setErrors({ errors: [{ message: "Internal server error" }]});
    }
  };

  const handleTagSubmit = async e => {
    e.preventDefault();

    try {
      const response = await fetchWithAuth(`${baseUrl}/api/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tagFormData.name
        })
      });
      const data = await response.json();

      if (response.ok) {
        setTags(prevTags => [...prevTags, data.tag]);
        toggleIsCreatingTag();
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/login")
        }

        if (data.errors || data.message) {
          setErrors({ errors: [...(data.errors ? [{message: data.errors[0].message}] : []), ...(data.message ? [{message: data.message}] : [])]});
        }
      }
    } catch (err) {
      setErrors({ errors: [{ message: "Internal server error" }]});
    }
  };

  const handleTagsChange = e => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setTodoFormData(prevTodoFormData => ({
      ...prevTodoFormData,
      tags: selectedOptions
    }));
  };

  const handleFilterTagsChange = e => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFilterTodoFormData(prevFilterTodoFormData => ({
      ...prevFilterTodoFormData,
      tags: selectedOptions
    }));
  };

  const handleFilterChange = e => {
    setFilterTodoFormData(prevFilterTodoFormData => ({
      ...prevFilterTodoFormData,
      [e.target.name] : e.target.value
    }))
  }

  const handleFilterSubmit = e => {
    e.preventDefault();
    let results = [];

    // Tag filtering
    let tagsSelected = filterTodoFormData.tags.map(tag => Number(tag));

    if (tagsSelected.length === 1 && tagsSelected[0] === 0) {
      results = todos;
    } else {
      if (tagsSelected.includes(0)) {
        tagsSelected = tagsSelected.filter(tag => tag !== 0);
      }

      results = todos.filter(todo => {
        const todoTags = todo.tags.map(tag => tag.id);
        return tagsSelected.every(tagId => todoTags.includes(tagId));
      });
    }

    // Status filtering
    if (filterTodoFormData.status !== "all") {
      results = results.filter(x => x.status === filterTodoFormData.status);
    }

    // Priority filtering
    if (filterTodoFormData.priority !== "all") {
      results = results.filter(x => x.priority === filterTodoFormData.priority);
    }

    // Due Date filtering
    switch (filterTodoFormData.dueDate) {
      case "dueToday":
        results = results.filter(x => {
            const formattedToday = now.getFullYear() + "-" +
                String(now.getMonth() + 1).padStart(2, "0") + "-" +
                String(now.getDate()).padStart(2, "0");
            const dueDate = new Date(x.dueDate);
            const formattedDueDate = dueDate.getFullYear() + "-" +
                String(dueDate.getMonth() + 1).padStart(2, "0") + "-" +
                String(dueDate.getDate()).padStart(2, "0");

            if (formattedDueDate === formattedToday) {
                return x;
            }
        })
        break;
      case "overdue":
        results = results.filter(x => x.dueDate && new Date(x.dueDate).getTime() < now.getTime());
        break;
      case "noDueDate":
        results = results.filter(x => !x.dueDate);
        break;
    };

    setFilteredTodos(results);
  };

  const handleResetFilters = () => {
    setFilteredTodos(todos);
    setFilterTodoFormData({
      tags: [],
      status: "all",
      priority: "all",
      dueDate: "all"
    });
  };

  const handlePriorityChange = e => {
    setTodoFormData(prevTodoFormData => ({
      ...prevTodoFormData,
      priority: e.target.value
    }));
  };

  return (
    <>
      <h1>Ticky To-Do</h1>

      <button onClick={toggleIsCreatingTodo}>Create To-Do</button>
      <button onClick={toggleIsCreatingTag}>Create tag</button>

      {isCreatingTag && (
        <form onSubmit={handleTagSubmit}>
          <label htmlFor="name">Name:</label>
          <input type="text" name="name" id="name" value={tagFormData.name} onChange={handleTagInputChange} />

          <button type="button" onClick={toggleIsCreatingTag}>Cancel</button>
          <button type="submit">Create</button>
          
          {errors.errors && errors.errors.length > 0 && <Errors errors={errors.errors} />}
        </form>
      )}

      {isCreatingTodo && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title:</label>
          <input type="text" name="title" id="title" value={todoFormData.title} onChange={handleInputChange} />

          <label htmlFor="description">Description:</label>
          <input type="text" name="description" id="description" value={todoFormData.description} onChange={handleInputChange} />

          <label htmlFor="priority">Priority:</label>
          <select name="priority" id="priority" value={todoFormData.priority} onChange={handlePriorityChange}>
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label htmlFor="dueDate">Due Date:</label>
          <input type="datetime-local" name="dueDate" id="dueDate" min={formattedNow} value={todoFormData.dueDate} onChange={handleInputChange}/>

          <label htmlFor="tags">Tags</label>
          <select name="tags" id="tags" multiple value={todoFormData.tags} onChange={handleTagsChange}>
            <option value=""></option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>

          <button type="button" onClick={toggleIsCreatingTodo}>Cancel</button>
          <button type="submit">Create</button>

          {errors.errors && errors.errors.length > 0 && <Errors errors={errors.errors} />}
        </form>
      )}

      <div>
        <h2>Current To-Dos</h2>

        <h3>Filter by</h3>
        <form onSubmit={handleFilterSubmit}>
          <label htmlFor="tags">Tags</label>
          <select name="tags" id="tags" multiple value={filterTodoFormData.tags} onChange={handleFilterTagsChange}>
            <option value=""></option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>

          <label htmlFor="status">Status</label>
          <select name="status" id="status" value={filterTodoFormData.status} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <label htmlFor="priority">Priority</label>
          <select name="priority" id="priority" value={filterTodoFormData.priority} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label htmlFor="dueDate">Due Date</label>
          <select name="dueDate" id="dueDate" value={filterTodoFormData.dueDate} onChange={handleFilterChange}>
            <option value="all">Any</option>
            <option value="dueToday">Due Today</option>
            <option value="overdue">Overdue</option>
            <option value="noDueDate">No due date</option>
          </select>

          <button type="button" onClick={handleResetFilters}>Reset filters</button>
          <button>Apply filters</button>
        </form>

        <TodoList todos={filteredTodos || todos} setFilteredTodos={setFilteredTodos} />
      </div>  
    </>
  )
}
