export const Errors = ({errors}) => {
    return (
      <div>
          <ul>
              {errors.map((error, i) => (
                  <li className="error" key={i}>{error.message}</li>
              ))}
          </ul>
      </div>
    )
  }